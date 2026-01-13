const express = require("express");
const app = express();
const db = require("./db");

const router = express.Router();
app.post("/insert", (req, res) => {
    const { employee_id, pf, esi, professional_tax, loan_deduction, late_penalty, month_year } = req.body;

    const sql = `
        INSERT INTO deductions 
        (employee_id, pf, esi, professional_tax, loan_deduction, late_penalty, month_year)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql,
        [employee_id, pf, esi, professional_tax, loan_deduction, late_penalty, month_year],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Deduction added" });
        }
    );
});


app.get("/read/:employee_id", (req, res) => {
    db.query(
        "SELECT * FROM deductions WHERE employee_id=?",
        [req.params.employee_id],
        (err, data) => {
            if (err) return res.status(500).json(err);
            res.json(data);
        }
    );
});

app.put("/update/:id", (req, res) => {
  const d = req.body;
  const id = req.params.id;

  const sql = `
    UPDATE deductions SET
      pf = COALESCE(?, pf),
      esi = COALESCE(?, esi),
      professional_tax = COALESCE(?, professional_tax),
      loan_deduction = COALESCE(?, loan_deduction),
      late_penalty = COALESCE(?, late_penalty),
      month_year = COALESCE(?, month_year)
    WHERE deduction_id = ?
  `;

  db.query(
    sql,
    [
      d.pf || null,
      d.esi || null,
      d.professional_tax || null,
      d.loan_deduction || null,
      d.late_penalty || null,
      d.month_year || null,
      id
    ],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Deduction updated" });
    }
  );
});



app.delete("/delete/:id", (req, res) => {
    db.query(
        "DELETE FROM deductions WHERE deduction_id=?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Deduction deleted" });
        }
    );
});

module.exports = app;
// app.listen(5000, () => {
//     console.log("Server running on port 5000");
// });
