
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let employees = [
  {
    id: "EMP001",
    name: "Rahul Sharma",
    department: "IT",
    basic: 30000,
    allowance: 5000,
    deductions: 2000
  },
  {
    id: "EMP002",
    name: "Priya Reddy",
    department: "HR",
    basic: 25000,
    allowance: 4000,
    deductions: 1500
  }
];

// Get all employees
app.get("/api/employees", (req, res) => {
  res.json(employees);
});

// Add an employee
app.post("/api/employees", (req, res) => {
  const { id, name, department, basic, allowance, deductions } = req.body;

  if (!id?.trim() || !name?.trim() || !department?.trim()) {
    return res.status(400).json({
      message: "Please enter all employee details."
    });
  }

  if ([basic, allowance, deductions].some(
    value => value === "" || value === null ||
      value === undefined || !Number.isFinite(Number(value))
  )) {
    return res.status(400).json({
      message: "Salary fields must contain valid numbers."
    });
  }

  const employee = {
    id: id.trim(),
    name: name.trim(),
    department: department.trim(),
    basic: Number(basic),
    allowance: Number(allowance),
    deductions: Number(deductions)
  };

  if (employees.some(e => e.id.toLowerCase() === employee.id.toLowerCase())) {
    return res.status(409).json({
      message: "Employee ID already exists."
    });
  }

  if (
    employee.basic < 0 ||
    employee.allowance < 0 ||
    employee.deductions < 0 ||
    employee.deductions > employee.basic + employee.allowance
  ) {
    return res.status(400).json({
      message: "Enter valid salary amounts and deductions."
    });
  }

  employees.push(employee);
  res.status(201).json(employee);
});

// Delete an employee
app.delete("/api/employees/:id", (req, res) => {
  const index = employees.findIndex(
    e => e.id.toLowerCase() === req.params.id.toLowerCase()
  );

  if (index === -1) {
    return res.status(404).json({
      message: "Employee not found."
    });
  }

  employees.splice(index, 1);
  res.json({ message: "Employee deleted successfully." });
});

// Start server
app.listen(PORT, () => {
  console.log(`Employee Payroll server running at http://localhost:${PORT}`);
});
