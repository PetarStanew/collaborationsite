const form = document.getElementById("outreach-form");
const message = document.getElementById("form-message");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const entry = {
    businessName: (formData.get("businessName") || "").trim(),
    businessType: (formData.get("businessType") || "").trim(),
    email: (formData.get("email") || "").trim(),
    phone: (formData.get("phone") || "").trim(),
    addressUrl: (formData.get("addressUrl") || "").trim(),
    collaborator: (formData.get("collaborator") || "").trim(),
    serviceOption: (formData.get("serviceOption") || "").trim()
  };

  const hasData = Object.values(entry).some((value) => value.length > 0);
  if (!hasData) {
    message.textContent = "Please enter at least one field before saving.";
    return;
  }

  fetch("/api/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry)
  })
    .then(async (response) => {
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to save.");
      }
      return response.json();
    })
    .then(() => {
      form.reset();
      message.textContent = "Saved! View the record list to see the new entry.";
    })
    .catch((error) => {
      message.textContent = error.message;
    });
});
