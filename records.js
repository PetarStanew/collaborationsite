const tableBody = document.querySelector("#records-table tbody");
const emptyState = document.getElementById("empty-state");

const serviceOptions = [
  "Complete Website",
  "Complete Website Plus",
  "Complete Website Plus + Additional Support"
];

const offerStatuses = ["Accepted offer", "Declined offer", "Not responding"];

let entries = [];
let editingId = null;

const createSelect = (options, value, placeholder) => {
  const select = document.createElement("select");
  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = placeholder;
  select.appendChild(emptyOption);

  options.forEach((optionValue) => {
    const option = document.createElement("option");
    option.value = optionValue;
    option.textContent = optionValue;
    if (optionValue === value) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  return select;
};

const renderRows = () => {
  tableBody.innerHTML = "";

  if (!entries.length) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  entries.forEach((entry) => {
    const row = document.createElement("tr");
    const isEditing = editingId === entry.id;

    if (isEditing) {
      const nameInput = document.createElement("input");
      nameInput.value = entry.business_name || "";

      const typeInput = document.createElement("input");
      typeInput.value = entry.business_type || "";

      const emailInput = document.createElement("input");
      emailInput.type = "email";
      emailInput.value = entry.email || "";

      const phoneInput = document.createElement("input");
      phoneInput.type = "tel";
      phoneInput.value = entry.phone || "";

      const addressInput = document.createElement("input");
      addressInput.type = "url";
      addressInput.value = entry.address_url || "";

      const collaboratorInput = document.createElement("input");
      collaboratorInput.value = entry.collaborator || "";

      const serviceSelect = createSelect(
        serviceOptions,
        entry.service_option || "",
        "Select option"
      );

      const statusSelect = createSelect(
        offerStatuses,
        entry.offer_status || "",
        "Select status"
      );

      const cells = [
        nameInput,
        typeInput,
        emailInput,
        phoneInput,
        addressInput,
        collaboratorInput,
        serviceSelect,
        statusSelect
      ];

      cells.forEach((field) => {
        const cell = document.createElement("td");
        cell.appendChild(field);
        row.appendChild(cell);
      });

      const actionsCell = document.createElement("td");
      const actionsWrap = document.createElement("div");
      actionsWrap.className = "table-actions";

      const saveButton = document.createElement("button");
      saveButton.type = "button";
      saveButton.textContent = "Save";
      saveButton.addEventListener("click", () => {
        updateEntry(entry.id, {
          businessName: nameInput.value,
          businessType: typeInput.value,
          email: emailInput.value,
          phone: phoneInput.value,
          addressUrl: addressInput.value,
          collaborator: collaboratorInput.value,
          serviceOption: serviceSelect.value,
          offerStatus: statusSelect.value
        });
      });

      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.className = "secondary";
      cancelButton.textContent = "Cancel";
      cancelButton.addEventListener("click", () => {
        editingId = null;
        renderRows();
      });

      actionsWrap.appendChild(saveButton);
      actionsWrap.appendChild(cancelButton);
      actionsCell.appendChild(actionsWrap);
      row.appendChild(actionsCell);
    } else {
      const cells = [
        entry.business_name || "—",
        entry.business_type || "—",
        entry.email || "—",
        entry.phone || "—",
        entry.address_url || "—",
        entry.collaborator || "—",
        entry.service_option || "—",
        entry.offer_status || "—"
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

      const actionsCell = document.createElement("td");
      const actionsWrap = document.createElement("div");
      actionsWrap.className = "table-actions";

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "Edit";
      editButton.addEventListener("click", () => {
        editingId = entry.id;
        renderRows();
      });

      actionsWrap.appendChild(editButton);
      actionsCell.appendChild(actionsWrap);
      row.appendChild(actionsCell);
    }

    tableBody.appendChild(row);
  });
};

const loadEntries = () =>
  fetch("/api/entries")
    .then(async (response) => {
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to fetch entries.");
      }
      return response.json();
    })
    .then((data) => {
      entries = data;
      renderRows();
    })
    .catch(() => {
      emptyState.style.display = "block";
      emptyState.textContent = "Unable to load entries right now.";
    });

const updateEntry = (id, payload) => {
  fetch(`/api/entries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(async (response) => {
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update entry.");
      }
      return response.json();
    })
    .then((updated) => {
      entries = entries.map((entry) =>
        entry.id === updated.id ? updated : entry
      );
      editingId = null;
      renderRows();
    })
    .catch((error) => {
      emptyState.style.display = "block";
      emptyState.textContent = error.message;
    });
};

loadEntries();
