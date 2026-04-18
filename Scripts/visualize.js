let transactions = [];
let actionsLog = [];
let filteredTransactions = []; // lista filtrada actual

// Cargar transacciones desde archivo seleccionado
function loadTransactionsFromFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const json = JSON.parse(e.target.result);
      transactions = json.transactions || [];
      filteredTransactions = [...transactions]; // inicializar
      renderTransactions(filteredTransactions);
    } catch (err) {
      document.getElementById("transactionsView").innerHTML = `<p>Error: ${err.message}</p>`;
    }
  };
  reader.readAsText(file);
}

// Cargar log desde archivo seleccionado
function loadLogFromFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const json = JSON.parse(e.target.result);
      actionsLog = json.actions || [];
      renderLog(actionsLog);
    } catch (err) {
      document.getElementById("logView").innerHTML = `<p>Error: ${err.message}</p>`;
    }
  };
  reader.readAsText(file);
}

// Eventos de botones
document.getElementById("loadBtn").addEventListener("click", () => {
  const file = document.getElementById("transactionsFile").files[0];
  if (!file) {
    alert("Seleccione un archivo transactions.json");
    return;
  }
  loadTransactionsFromFile(file);
});

document.getElementById("loadLogBtn").addEventListener("click", () => {
  const file = document.getElementById("logFile").files[0];
  if (!file) {
    alert("Seleccione un archivo actions.log.json");
    return;
  }
  loadLogFromFile(file);
});

document.getElementById("applyFiltersBtn").addEventListener("click", () => {
  const client = document.getElementById("filterClient").value.toLowerCase();
  const dateStart = document.getElementById("filterDateStart").value;
  const dateEnd = document.getElementById("filterDateEnd").value;
  const amount = parseFloat(document.getElementById("filterAmount").value) || 0;
  const type = document.getElementById("filterType").value;
  const accountFilter = document.getElementById("filterAccount").value.toLowerCase();
  const descriptionFilter = document.getElementById("filterDescription").value.toLowerCase();

  filteredTransactions = transactions.filter(tx => {
    const matchClient = client ? (tx.account || "").toLowerCase().includes(client) : true;

    let matchDate = true;
    if (dateStart || dateEnd) {
      const txDate = new Date(tx.date);
      const start = dateStart ? new Date(dateStart) : null;
      const end = dateEnd ? new Date(dateEnd) : null;
      matchDate =
        (!start || txDate >= start) &&
        (!end || txDate <= end);
    }

    const matchAmount = Math.abs(tx.amount) >= amount;

    let matchType = true;
    if (type === "credit") {
      matchType = tx.amount > 0;
    } else if (type === "debit") {
      matchType = tx.amount < 0;
    }

    const matchAccount = accountFilter ? (tx.account || "").toLowerCase().includes(accountFilter) : true;
    const matchDescription = descriptionFilter ? (tx.description || "").toLowerCase().includes(descriptionFilter) : true;

    return matchClient && matchDate && matchAmount && matchType && matchAccount && matchDescription;
  });

  renderTransactions(filteredTransactions);
});

document.getElementById("resetFiltersBtn").addEventListener("click", () => {
  filteredTransactions = [...transactions];
  renderTransactions(filteredTransactions);
});

// Ordenar por monto ascendente
document.getElementById("sortAmountAscBtn").addEventListener("click", () => {
  const sorted = [...filteredTransactions].sort((a, b) => a.amount - b.amount);
  renderTransactions(sorted);
});

// Ordenar por monto descendente
document.getElementById("sortAmountDescBtn").addEventListener("click", () => {
  const sorted = [...filteredTransactions].sort((a, b) => b.amount - a.amount);
  renderTransactions(sorted);
});

// Ordenar por fecha ascendente
document.getElementById("sortDateAscBtn").addEventListener("click", () => {
  const sorted = [...filteredTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  renderTransactions(sorted);
});

// Ordenar por fecha descendente
document.getElementById("sortDateDescBtn").addEventListener("click", () => {
  const sorted = [...filteredTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  renderTransactions(sorted);
});

// Renderizar tabla de transacciones
function renderTransactions(data) {
  const container = document.getElementById("transactionsView");
  if (!data.length) {
    container.innerHTML = "<p>No hay transacciones</p>";
    return;
  }
  container.innerHTML = `
    <table>
      <thead><tr>${Object.keys(data[0]).map(k => `<th>${k}</th>`).join("")}</tr></thead>
      <tbody>
        ${data.map(row => `<tr>${Object.values(row).map(v => `<td>${v}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  `;
}

// Renderizar tabla de log
function renderLog(data) {
  const container = document.getElementById("logView");
  if (!data.length) {
    container.innerHTML = "<p>No hay acciones registradas</p>";
    return;
  }
  container.innerHTML = `
    <table>
      <thead>
        <tr><th>Timestamp</th><th>Acción</th><th>Archivo</th><th>Agregadas</th><th>Ignoradas</th></tr>
      </thead>
      <tbody>
        ${data.map(a => `
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
