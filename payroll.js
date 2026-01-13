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

app.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM payroll WHERE employee_id=?";
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});


app.post('/insert', (req, res) => {
  const { employee_id, month_year } = req.body;

  
  const earningsQuery = `
    SELECT basic_salary, hra, travel_allowance,overtime_pay 
    FROM earnings 
    WHERE employee_id=? AND month_year=?`;

  db.query(earningsQuery, [employee_id, month_year], (err, earnings) => {
    if (err) return res.status(500).json(err);
    if (earnings.length === 0) {
      return res.status(404).json({ msg: "❌ Earnings not found for this month" });
    }

    const gross = earnings[0].basic_salary +
                  (earnings[0].hra || 0) +
                  (earnings[0].travel_allowance || 0) +
                  (earnings[0].overtime_pay || 0);

    // Deductions fetch for same month
    const deductionsQuery = `
      SELECT pf, esi, professional_tax, loan_deduction, late_penalty
      FROM deductions 
      WHERE employee_id=? AND month_year=?`;

    db.query(deductionsQuery, [employee_id, month_year], (err, deductions) => {
      if (err) return res.status(500).json(err);
      if (deductions.length === 0) {
        return res.status(404).json({ msg: "❌ Deductions not found for this month" });
      }

      const total_deduct = (deductions[0].pf || 0) +
                           (deductions[0].esi || 0) +
                           (deductions[0].professional_tax || 0) +
                           (deductions[0].loan_deduction || 0)+
                           (deductions[0].late_penalty || 0);


      const net = gross - total_deduct;

      // Insert to payroll
      const insertQuery = `
        INSERT INTO payroll(employee_id, month_year, gross_salary, total_deductions, net_salary)
        VALUES (?,?,?,?,?)`;

      db.query(insertQuery, [employee_id, month_year, gross, total_deduct, net], (err, result) => {
        if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          msg: "Payroll already generated for this employee for this month"
        });
      }
        if (err) return res.status(500).json(err);
        res.json({
          msg: "✅ Payroll added successfully",
          payroll_id: result.insertId,
          gross_salary: gross,
          deductions: total_deduct,
          net_salary: net
        });
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
