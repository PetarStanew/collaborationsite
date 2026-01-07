const tableBody = document.querySelector("#records-table tbody");
const emptyState = document.getElementById("empty-state");

const renderRows = (entries) => {
  tableBody.innerHTML = "";

  if (!entries.length) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  entries.forEach((entry) => {
    const row = document.createElement("tr");

    const cells = [
      entry.business_name || "—",
      entry.business_type || "—",
      entry.email || "—",
      entry.phone || "—",
      entry.address_url || "—",
      entry.collaborator || "—"
    ];

    cells.forEach((value, index) => {
      const cell = document.createElement("td");
      if (index === 4 && value !== "—") {
        const link = document.createElement("a");
        link.href = value;
        link.textContent = "Open map";
        link.target = "_blank";
        link.rel = "noreferrer";
        cell.appendChild(link);
      } else {
        cell.textContent = value;
      }
      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  });
};

fetch("/api/entries")
  .then(async (response) => {
    if (!response.ok) {
      const payload = await response.json();
      throw new Error(payload.error || "Failed to fetch entries.");
    }
    return response.json();
  })
  .then((entries) => renderRows(entries))
  .catch(() => {
    emptyState.style.display = "block";
    emptyState.textContent = "Unable to load entries right now.";
  });
