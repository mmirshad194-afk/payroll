const express = require("express");
const cors = require("cors");

const app = express();


app.use(cors({
    origin: "http://127.0.0.1:5500",
    credentials: true
}));

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}))



const employees = require('./employees');
app.use('/emp', employees);

const earnings = require('./earnings');
app.use('/earn', earnings);

const deductions = require('./deduction');
app.use('/deduc', deductions);

const users = require('./payrolluser');
app.use('/users', users);

const attendance = require('./attendance');
app.use('/att', attendance);
    

const payroll = require('./payroll');
app.use('/pay', payroll);



app.get("/", (req, res) => {

    res.send("Payroll API running");
});

app.listen(5000, () => {

    console.log("Server running on port 5000");
});