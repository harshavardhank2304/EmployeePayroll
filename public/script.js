
const form = document.getElementById("employeeForm");
const table = document.getElementById("employeeTable");
const search = document.getElementById("search");
const message = document.getElementById("message");

let employees = [];

const money = amount =>
  Number(amount).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  });

const netSalary = employee =>
  Number(employee.basic) +
  Number(employee.allowance) -
  Number(employee.deductions);

function showMessage(text, error = false) {
  message.textContent = text;
  message.style.color = error ? "#dc2626" : "#15803d";
}

async function loadEmployees() {
  try {
    const response = await fetch("/api/employees");
    if (!response.ok) throw new Error("Could not load employees");

    employees = await response.json();
    renderEmployees();
  } catch (error) {
    showMessage("Cannot connect to the server. Start Express first.", true);
  }
}

function updateDashboard() {
  const total = employees.reduce((sum, e) => sum + netSalary(e), 0);

  document.getElementById("totalEmployees").textContent = employees.length;
  document.getElementById("totalPayroll").textContent = money(total);
  document.getElementById("averageSalary").textContent =
    money(employees.length ? total / employees.length : 0);
}

function renderEmployees() {
  const query = search.value.trim().toLowerCase();

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(query) ||
    e.id.toLowerCase().includes(query)
  );

  table.replaceChildren();

  filtered.forEach(employee => {
    const row = document.createElement("tr");

    const values = [
      employee.id,
      employee.name,
      employee.department,
      money(employee.basic),
      money(Number(employee.basic) + Number(employee.allowance)),
      money(employee.deductions),
      money(netSalary(employee))
    ];

    values.forEach(value => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    const actionCell = document.createElement("td");
    const deleteButton = document.createElement("button");

    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.addEventListener("click", () => deleteEmployee(employee.id));

    actionCell.appendChild(deleteButton);
    row.appendChild(actionCell);
    table.appendChild(row);
  });

  document.getElementById("emptyMessage").textContent =
    filtered.length ? "" : "No employee records found.";

  updateDashboard();
}

function updateSalaryPreview() {
  const basic = Number(document.getElementById("basic").value) || 0;
  const allowance = Number(document.getElementById("allowance").value) || 0;
  const deductions = Number(document.getElementById("deductions").value) || 0;

  document.getElementById("salaryPreview").textContent =
    money(basic + allowance - deductions);
}

["basic", "allowance", "deductions"].forEach(id => {
  document.getElementById(id).addEventListener("input", updateSalaryPreview);
});

form.addEventListener("submit", async event => {
  event.preventDefault();

  const employee = {
    id: document.getElementById("employeeId").value.trim(),
    name: document.getElementById("employeeName").value.trim(),
    department: document.getElementById("department").value,
    basic: Number(document.getElementById("basic").value),
    allowance: Number(document.getElementById("allowance").value),
    deductions: Number(document.getElementById("deductions").value)
  };

  if (
    !employee.id || !employee.name || !employee.department ||
    !Number.isFinite(employee.basic) ||
    !Number.isFinite(employee.allowance) ||
    !Number.isFinite(employee.deductions) ||
    employee.basic < 0 || employee.allowance < 0 ||
    employee.deductions < 0 ||
    employee.deductions > employee.basic + employee.allowance
  ) {
    showMessage("Enter valid details and salary amounts.", true);
    return;
  }

  try {
    const response = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employee)
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.message);

    form.reset();
    updateSalaryPreview();
    showMessage("Employee added successfully!");
    await loadEmployees();
  } catch (error) {
    showMessage(error.message || "Could not add employee.", true);
  }
});

async function deleteEmployee(id) {
  if (!confirm(`Delete employee ${id}?`)) return;

  try {
    const response = await fetch(
      `/api/employees/${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );

    const result = await response.json();
    if (!response.ok) throw new Error(result.message);

    showMessage(result.message);
    await loadEmployees();
  } catch (error) {
    showMessage(error.message || "Could not delete employee.", true);
  }
}

search.addEventListener("input", renderEmployees);

loadEmployees();
