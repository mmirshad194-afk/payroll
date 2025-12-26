const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.send("Payroll API running");
});
const db =require('./db');
const earnings=require('./earnings');
app.use('/earn',earnings);
const deductions=require('./deduction');
app.use('/deduc',deductions);
const employees=require('./employees'); 
app.use('/emp',employees);
const users=require('./payrolluser');
app.use('/users',users);


app.listen(8000, () => console.log("Server running"));