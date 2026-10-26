
const form = document.getElementById("employeeForm");
const table = document.getElementById("employeeTable");
const search = document.getElementById("search");
const message = document.getElementById("message");
let employees = [];

const money = n => Number(n).toLocaleString("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 2
});

const net = e => Number(e.basic) + Number(e.allowance) - Number(e.deductions);

function showMessage(text, error = false) {
  message.textContent = text;
  message.style.color = error ? "red" : "green";
}

// Load employees from server
async function loadEmployees() {
  try {
    const res = await fetch("/api/employees");
    if (!res.ok) throw new Error("Failed to load employees");
    employees = await res.json();
    render();
  } catch (err) {
    showMessage("Cannot connect to server.", true);
  }
}

// Update dashboard and employee table
function render() {
  const q = search.value.trim().toLowerCase();
  const list = employees.filter(e =>
    e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)
  );

  table.replaceChildren();

  list.forEach(e => {
    const row = table.insertRow();
    [e.id, e.name, e.department, money(e.basic),
      money(Number(e.basic) + Number(e.allowance)),
      money(e.deductions), money(net(e))].forEach(v => {
      row.insertCell().textContent = v;
    });

    const cell = row.insertCell();
    const btn = document.createElement("button");
    btn.textContent = "Delete";
    btn.className = "delete-btn";
    btn.onclick = () => deleteEmployee(e.id);
    cell.appendChild(btn);
  });

  document.getElementById("emptyMessage").textContent =
    list.length ? "" : "No employee records found.";

  const total = employees.reduce((sum, e) => sum + net(e), 0);
  document.getElementById("totalEmployees").textContent = employees.length;
  document.getElementById("totalPayroll").textContent = money(total);
  document.getElementById("averageSalary").textContent =
    money(employees.length ? total / employees.length : 0);
}

// Calculate salary preview
function preview() {
  const b = Number(document.getElementById("basic").value) || 0;
  const a = Number(document.getElementById("allowance").value) || 0;
  const d = Number(document.getElementById("deductions").value) || 0;
  document.getElementById("salaryPreview").textContent = money(b + a - d);
}

["basic", "allowance", "deductions"].forEach(id =>
  document.getElementById(id).addEventListener("input", preview)
);

// Add employee
form.addEventListener("submit", async event => {
  event.preventDefault();

  const e = {
    id: document.getElementById("employeeId").value.trim(),
    name: document.getElementById("employeeName").value.trim(),
    department: document.getElementById("department").value,
    basic: Number(document.getElementById("basic").value),
    allowance: Number(document.getElementById("allowance").value),
    deductions: Number(document.getElementById("deductions").value)
  };

  if (!e.id || !e.name || !e.department ||
      ![e.basic, e.allowance, e.deductions].every(Number.isFinite) ||
      [e.basic, e.allowance, e.deductions].some(v => v < 0) ||
      e.deductions > e.basic + e.allowance) {
    return showMessage("Enter valid employee and salary details.", true);
  }

  try {
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(e)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    form.reset();
    preview();
    showMessage("Employee added successfully!");
    await loadEmployees();
  } catch (err) {
    showMessage(err.message || "Unable to add employee.", true);
  }
});

// Delete employee
async function deleteEmployee(id) {
  if (!confirm("Delete employee " + id + "?")) return;

  try {
    const res = await fetch("/api/employees/" + encodeURIComponent(id), {
      method: "DELETE"
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    showMessage(data.message);
    await loadEmployees();
  } catch (err) {
    showMessage(err.message || "Unable to delete employee.", true);
  }
}

search.addEventListener("input", render);
loadEmployees();
