const express = require("express");
const app = express();
const db = require("./db");
const router = express.Router();



app.post("/insert", (req, res) => {
    const { employee_id, basic_salary, hra, travel_allowance, overtime_pay, month_year } = req.body;

    const sql = `
        INSERT INTO earnings 
        (employee_id, basic_salary, hra, travel_allowance, overtime_pay, month_year)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [employee_id, basic_salary, hra, travel_allowance, overtime_pay, month_year],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Earnings added" });
        }
    );
});


app.get("/read/:employee_id", (req, res) => {
    db.query(
        "SELECT * FROM earnings WHERE employee_id=?",
        [req.params.employee_id],
        (err, data) => {
            if (err) return res.status(500).json(err);
            res.json(data);
        }
    );
});


app.put("/update/:id",(r,s)=>{
  const {basic_salary, hra, travel_allowance, overtime_pay, month_year}=r.body;
  db.query(
    "UPDATE earnings SET basic_salary=COALESCE(?,basic_salary),hra=COALESCE(?,hra),travel_allowance=COALESCE(?,travel_allowance),overtime_pay=COALESCE(?,overtime_pay),month_year=COALESCE(?,month_year) WHERE earning_id=?",
    [basic_salary, hra, travel_allowance, overtime_pay, month_year, r.params.id],
    e=>s.status(e?500:200).json(e||{message:"updated"})
  );
});


app.delete("/delete/:id", (req, res) => {
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
