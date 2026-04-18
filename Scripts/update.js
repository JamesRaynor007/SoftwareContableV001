document.addEventListener("DOMContentLoaded", () => {
  let consolidated = { transactions: [] };
  let actionsLog = { actions: [] };

  // Botón de retorno
  document.getElementById("returnBtn").addEventListener("click", () => {
    window.history.back();
  });

  // Cargar JSON base
  document.getElementById("loadBaseBtn").addEventListener("click", async () => {
    const file = document.getElementById("baseFile").files[0];
    if (!file) return alert("Seleccione un archivo JSON base");

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const json = JSON.parse(e.target.result);
        consolidated = json; // debe tener { transactions: [...] }
        document.getElementById("status").textContent =
          "Base cargada con " + (consolidated.transactions?.length || 0) + " transacciones";
      } catch (err) {
        alert("Error al leer JSON base: " + err.message);
      }
    };
    reader.readAsText(file);
  });

  // Botón de actualizar consolidado
  document.getElementById("updateBtn").addEventListener("click", async () => {
    const file = document.getElementById("updateFile").files[0];
    if (!file) return alert("Seleccione un archivo CSV o XLSX");

    let newTransactions = [];
    if (file.name.endsWith(".csv")) {
      await new Promise(resolve => {
        Papa.parse(file, {
          header: true,
          dynamicTyping: true,
          complete: results => {
            newTransactions = results.data.filter(row => row.id);
            resolve();
          }
        });
      });
    } else if (file.name.endsWith(".xlsx")) {
      const reader = new FileReader();
      await new Promise(resolve => {
        reader.onload = e => {
          const wb = XLSX.read(e.target.result, { type: "binary" });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          newTransactions = XLSX.utils.sheet_to_json(sheet);
          resolve();
        };
        reader.readAsBinaryString(file);
      });
    }

    mergeTransactions(newTransactions, file.name);
    renderLog();
    document.getElementById("status").textContent = "Consolidado actualizado";
  });

  // Botón de descargar log
  document.getElementById("downloadLogBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(actionsLog, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "actions.log.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  // Botón de descargar consolidado
  document.getElementById("downloadConsolidatedBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(consolidated, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  // Función de merge
  function mergeTransactions(newTransactions, sourceFile) {
    let added = 0, ignored = 0;
    newTransactions.forEach(tx => {
      const exists = consolidated.transactions.some(t => t.id === tx.id);
      if (!exists) {
        consolidated.transactions.push(tx);
        added++;
      } else {
        ignored++;
      }
    });
    actionsLog.actions.push({
      timestamp: new Date().toISOString(),
      action: "MERGE",
      file: sourceFile,
      added,
      ignored
    });
  }

  // Renderizar log
  function renderLog() {
    const container = document.getElementById("logTable");
    if (!actionsLog.actions.length) {
      container.innerHTML = "<p>No hay acciones registradas</p>";
      return;
    }
    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Timestamp</th><th>Acción</th><th>Archivo</th><th>Agregadas</th><th>Ignoradas</th>
          </tr>
        </thead>
        <tbody>
          ${actionsLog.actions.map(a => `
            <tr>
              <td>${a.timestamp}</td>
              <td>${a.action}</td>
              <td>${a.file}</td>
              <td>${a.added}</td>
              <td>${a.ignored}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    `;
  }
});
