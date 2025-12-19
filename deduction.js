const express = require("express");
const app = express();
const db = require("./db");

const router = express.Router();
app.post("/post", (req, res) => {
    const { employee_id, pf, esi, professional_tax, loan_deduction, late_penalty, month } = req.body;

    const sql = `
        INSERT INTO deductions 
        (employee_id, pf, esi, professional_tax, loan_deduction, late_penalty, month)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql,
        [employee_id, pf, esi, professional_tax, loan_deduction, late_penalty, month],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Deduction added" });
        }
    );
});


app.get("/:employee_id", (req, res) => {
    db.query(
        "SELECT * FROM deductions WHERE employee_id=?",
        [req.params.employee_id],
        (err, data) => {
            if (err) return res.status(500).json(err);
            res.json(data);
        }
    );
});


app.put("/:id", (req, res) => {
    const { pf, esi, professional_tax, loan_deduction, late_penalty, month } = req.body;

    const sql = `
        UPDATE deductions SET 
        pf=?, esi=?, professional_tax=?, loan_deduction=?, late_penalty=?, month=?
        WHERE deduction_id=?
    `;

    db.query(sql,
        [pf, esi, professional_tax, loan_deduction, late_penalty, month, req.params.id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Deduction updated" });
        }
    );
});


app.delete("/:id", (req, res) => {
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

