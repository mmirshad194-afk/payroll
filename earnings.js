const express = require("express");
const app = express();
const db = require("./db");
const router = express.Router();



app.post("/insert", (req, res) => {
    const { employee_id, basic_salary, hra, travel_allowance, overtime_pay, month } = req.body;

    const sql = `
        INSERT INTO earnings 
        (employee_id, basic_salary, hra, travel_allowance, overtime_pay, month)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [employee_id, basic_salary, hra, travel_allowance, overtime_pay, month],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Earnings added" });
        }
    );
});


app.get("/:employee_id", (req, res) => {
    db.query(
        "SELECT * FROM earnings WHERE employee_id=?",
        [req.params.employee_id],
        (err, data) => {
            if (err) return res.status(500).json(err);
            res.json(data);
        }
    );
});


app.put("/:id", (req, res) => {
    const { basic_salary, hra, travel_allowance, overtime_pay, month } = req.body;

    const sql = `
        UPDATE earnings SET 
        basic_salary=?, hra=?, travel_allowance=?, overtime_pay=?, month=?
        WHERE earning_id=?
    `;

    db.query(sql,
        [basic_salary, hra, travel_allowance, overtime_pay, month, req.params.id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Earnings updated" });
        }
    );
});


app.delete("/:id", (req, res) => {
    db.query(
        "DELETE FROM earnings WHERE earning_id=?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Earnings deleted" });
        }
    );
});


module.exports =app;
