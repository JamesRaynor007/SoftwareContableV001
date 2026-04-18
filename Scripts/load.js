document.addEventListener("DOMContentLoaded", () => {
  let transactions = [];
  let filteredTransactions = [];

  // Botón de retorno
  document.getElementById("returnBtn").addEventListener("click", () => {
    window.history.back();
  });

  // Función para guardar en localStorage
  function saveToLocalStorage(data) {
    localStorage.setItem("transactions", JSON.stringify(data));
  }

  // Función para cargar desde localStorage
  function loadFromLocalStorage() {
    const stored = localStorage.getItem("transactions");
    if (stored) {
      transactions = JSON.parse(stored);
      filteredTransactions = [...transactions];
      renderTable(filteredTransactions);
      document.getElementById("status").textContent = "Transacciones cargadas desde almacenamiento local";
    }
  }

  // Función para renderizar la tabla incluyendo botón de eliminar
  function renderTable(data) {
    const container = document.getElementById("transactionsTable");
    if (!data.length) {
      container.innerHTML = "<p>No hay transacciones cargadas</p>";
      return;
    }

    // Crear encabezado con columna de acciones
    const keys = Object.keys(data[0]);
    const headerCells = keys.map(k => `<th>${k}</th>`).join("") + `<th>Acciones</th>`;
    const header = `<tr>${headerCells}</tr>`;

    // Crear filas
    const rows = data.map((row, index) => {
      const cols = Object.values(row).map(v => `<td>${v}</td>`).join("");
      // Botón eliminar con data-index
      const deleteBtn = `<button data-index="${index}" class="deleteBtn">Eliminar</button>`;
      return `<tr>${cols}<td>${deleteBtn}</td></tr>`;
    }).join("");

    container.innerHTML = `<table>${header}<tbody>${rows}</tbody></table>`;

    // Asociar evento a botones eliminar
    container.querySelectorAll(".deleteBtn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"));
        eliminarTransaccion(idx);
      });
    });
  }

  // Función para eliminar transacción por índice
  function eliminarTransaccion(index) {
    if (index >= 0 && index < transactions.length) {
      transactions.splice(index, 1);
      saveToLocalStorage(transactions);
      // Reaplicar filtro si existe
      aplicarFiltro();
      document.getElementById("status").textContent = "Transacción eliminada";
    }
  }

  // Función para aplicar filtro a partir de los criterios ingresados
  function aplicarFiltro() {
    const montoFiltro = document.getElementById("filterAmount").value.trim();
    const cuentaFiltro = document.getElementById("filterAccount").value.trim().toLowerCase();
    const rangoFechaDesde = document.getElementById("filterDateFrom").value;
    const rangoFechaHasta = document.getElementById("filterDateTo").value;
    const idFiltro = document.getElementById("filterId").value.trim().toLowerCase();
    const descFiltro = document.getElementById("filterDescription").value.trim().toLowerCase();

    filteredTransactions = transactions.filter(tx => {
      // Filtrado por monto (exacto o rango)
      if (montoFiltro) {
        if (montoFiltro.includes("-")) {
          const [minStr, maxStr] = montoFiltro.split("-");
          const min = parseFloat(minStr.trim());
          const max = parseFloat(maxStr.trim());
          const amount = parseFloat(tx.amount);
          if (isNaN(amount) || amount < min || amount > max) return false;
        } else {
          const amount = parseFloat(tx.amount);
          if (isNaN(amount) || amount !== parseFloat(montoFiltro)) return false;
        }
      }

      // Filtrado por cuenta
      if (cuentaFiltro && tx.account.toLowerCase().indexOf(cuentaFiltro) === -1) return false;

      // Rango de fechas
      if (rangoFechaDesde) {
        const dateTx = new Date(tx.date);
        const dateDesde = new Date(rangoFechaDesde);
        if (dateTx < dateDesde) return false;
      }
      if (rangoFechaHasta) {
        const dateTx = new Date(tx.date);
        const dateHasta = new Date(rangoFechaHasta);
        if (dateTx > dateHasta) return false;
      }

      // Filtrado por id
      if (idFiltro && tx.id.toLowerCase().indexOf(idFiltro) === -1) return false;

      // Filtrado por descripción
      if (descFiltro && tx.description.toLowerCase().indexOf(descFiltro) === -1) return false;

      return true;
    });

    renderTable(filteredTransactions);
  }

  // Agregar evento a botones de filtro
  document.getElementById("applyFilterBtn").addEventListener("click", () => {
    aplicarFiltro();
  });

  // Limpiar filtros
  document.getElementById("clearFilterBtn").addEventListener("click", () => {
    document.querySelectorAll(".filter-input").forEach(input => input.value = "");
    filteredTransactions = [...transactions];
    renderTable(filteredTransactions);
  });

  // Importar archivo CSV/XLSX
  document.getElementById("importBtn").addEventListener("click", async () => {
    const file = document.getElementById("fileInput").files[0];
    if (!file) return alert("Seleccione un archivo CSV o XLSX");

    if (file.name.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: results => {
          transactions = results.data.filter(row => row.id);
          saveToLocalStorage(transactions);
          filteredTransactions = [...transactions];
          renderTable(filteredTransactions);
          document.getElementById("status").textContent = "CSV importado";
        }
      });
    } else if (file.name.endsWith(".xlsx")) {
      const reader = new FileReader();
      reader.onload = e => {
        const wb = XLSX.read(e.target.result, { type: "binary" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        transactions = XLSX.utils.sheet_to_json(sheet, { raw: false });
        // Formatear fechas si es posible
        transactions = transactions.map(row => {
          if (row.date) {
            const dateStr = row.date.trim();
            const dateObj = new Date(dateStr);
            if (!isNaN(dateObj)) {
              const year = dateObj.getFullYear();
              const month = String(dateObj.getMonth() + 1).padStart(2, '0');
              const day = String(dateObj.getDate()).padStart(2, '0');
              row.date = `${year}-${month}-${day}`;
            }
          }
          return row;
        });
        saveToLocalStorage(transactions);
        filteredTransactions = [...transactions];
        renderTable(filteredTransactions);
        document.getElementById("status").textContent = "XLSX importado";
      };
      reader.readAsBinaryString(file);
    }
  });

  // Exportar consolidado actual
  document.getElementById("exportBtn").addEventListener("click", () => {
    if (!transactions.length) {
      alert("No hay transacciones para exportar");
      return;
    }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(transactions);
    ws['!cols'] = [
      { wch: 12 }, // id
      { wch: 12 }, // date
      { wch: 20 }, // account
      { wch: 30 }, // description
      { wch: 12 }  // amount
    ];

    // Formatear fechas en exportación
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: 1 });
      if (ws[cellRef]) {
        ws[cellRef].t = "s";
        ws[cellRef].z = "yyyy-mm-dd";
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, "Transacciones");
    XLSX.writeFile(wb, "transactions_export.xlsx");
    document.getElementById("status").textContent = "Archivo exportado";
  });

  // Descargar template
  document.getElementById("downloadTemplateBtn").addEventListener("click", () => {
    const templateData = [
      ["id","date","account","description","amount"],
      ["TX001", "2026-04-01", "Cash", "Initial deposit", 10000],
      ["TX002", "2026-04-02", "Accounts Receivable", "Sale on credit", 5000],
      ["TX003", "2026-04-03", "Accounts Payable", "Purchase supplies", -1200],
      ["TX004", "2026-04-04", "Service income", "Revenue", 3000],
      ["TX005", "2026-04-05", "Rent payment", "Expense", -800]
    ];

    try {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(templateData);
      ws['!cols'] = [
        { wch: 12 },
        { wch: 12 },
        { wch: 20 },
        { wch: 30 },
        { wch: 12 }
      ];

      // Formatear fechas en plantilla
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: 1 });
        if (ws[cellRef]) {
          ws[cellRef].t = "s";
          ws[cellRef].z = "yyyy-mm-dd";
        }
      }

      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.writeFile(wb, "transactions_template.xlsx");
      document.getElementById("status").textContent = "Template descargado";
    } catch (err) {
      alert("Error al generar el template: " + err.message);
    }
  });

  // Ingreso manual
  document.getElementById("transactionForm").addEventListener("submit", e => {
    e.preventDefault();

    const newTransaction = {
      id: document.getElementById("id").value,
      date: document.getElementById("date").value,
      account: document.getElementById("account").value,
      description: document.getElementById("description").value,
      amount: parseFloat(document.getElementById("amount").value)
    };

    transactions.push(newTransaction);
    saveToLocalStorage(transactions);
    filteredTransactions = [...transactions];
    renderTable(filteredTransactions);
    document.getElementById("status").textContent = "Transacción agregada manualmente";

    e.target.reset();
  });

  // Cargar datos iniciales
  loadFromLocalStorage();
});
