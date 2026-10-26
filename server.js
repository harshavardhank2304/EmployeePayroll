
const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let employees = [
  { id: "EMP001", name: "Rahul Sharma", department: "IT",
    basic: 30000, allowance: 5000, deductions: 2000 },
  { id: "EMP002", name: "Priya Reddy", department: "HR",
    basic: 25000, allowance: 4000, deductions: 1500 }
];

// Get all employees
app.get("/api/employees", (req, res) => {
  res.json(employees);
});

// Add employee
app.post("/api/employees", (req, res) => {
  const { id, name, department, basic, allowance, deductions } = req.body;
  const nums = [basic, allowance, deductions];

  if (!id?.trim() || !name?.trim() || !department?.trim())
    return res.status(400).json({ message: "Fill all details." });

  if (nums.some(v => v === "" || v == null || !Number.isFinite(Number(v))))
    return res.status(400).json({ message: "Invalid salary values." });

  const e = {
    id: id.trim(), name: name.trim(), department: department.trim(),
    basic: Number(basic), allowance: Number(allowance),
    deductions: Number(deductions)
  };

  if (employees.some(x => x.id.toLowerCase() === e.id.toLowerCase()))
    return res.status(409).json({ message: "Employee ID already exists." });

  if ([e.basic, e.allowance, e.deductions].some(v => v < 0) ||
      e.deductions > e.basic + e.allowance)
    return res.status(400).json({ message: "Invalid salary or deductions." });

  employees.push(e);
  res.status(201).json(e);
});

// Delete employee
app.delete("/api/employees/:id", (req, res) => {
  const i = employees.findIndex(
    e => e.id.toLowerCase() === req.params.id.toLowerCase()
  );

  if (i === -1)
    return res.status(404).json({ message: "Employee not found." });

  employees.splice(i, 1);
  res.json({ message: "Employee deleted successfully." });
});

// Start server
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
