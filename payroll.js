const db =require('./db');
const express = require('express');
const app =express();


app.get('/readall', (req, res) => {
  const sql = "SELECT * FROM payroll";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.get('/id', (req, res) => {
  const { employee_id } = req.params;
  const sql = "SELECT * FROM payroll WHERE employee_id=?";
  db.query(sql, [employee_id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});


app.post('/insert', (req, res) => {
  const { employee_id, month_year } = req.body;

  // 1️⃣ Get earnings
  db.query("SELECT * FROM earnings WHERE employee_id=?", [employee_id], (err, earnings) => {
    if (err) return res.status(500).json(err);
    if (earnings.length === 0) return res.status(400).json({ msg: "Earnings not found" });

    const gross_salary = earnings[0].basic_salary + (earnings[0].hra || 0) + (earnings[0].travel_allowance || 0) + (earnings[0].bonus || 0) + (earnings[0].overtime_pay || 0);

    // 2️⃣ Get deductions
    db.query("SELECT * FROM deductions WHERE employee_id=?", [employee_id], (err, deductions) => {
      if (err) return res.status(500).json(err);

      const total_deductions = deductions.length > 0 ? (deductions[0].pf || 0) + (deductions[0].esi || 0) + (deductions[0].tax || 0) + (deductions[0].loan || 0) : 0;
      const net_salary = gross_salary - total_deductions;

      // 3️⃣ Insert payroll record
      const sql = "INSERT INTO payroll (employee_id, month_year, gross_salary, total_deductions, net_salary) VALUES (?, ?, ?, ?, ?)";
      db.query(sql, [employee_id, month_year, gross_salary, total_deductions, net_salary], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ msg: "Payroll added successfully", payroll_id: result.insertId, gross_salary, total_deductions, net_salary });
      });
    });
  });
});

app.put('/:id', (req, res) => {
  const { id } = req.params;
  const { gross_salary, total_deductions, net_salary } = req.body;

  const sql = "UPDATE payroll SET gross_salary=COALESCE(?,gross_salary), total_deductions=COALESCE(?,total_deductions), net_salary=COALESCE(?,net_salary) WHERE payroll_id=?";
  db.query(sql, [gross_salary, total_deductions, net_salary, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ msg: "Payroll updated successfully" });
  });
});

app.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM payroll WHERE payroll_id=?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ msg: "Payroll deleted successfully" });
  });
});

module.exports = app;
