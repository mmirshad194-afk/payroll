const db = require('./db');
const express = require('express');
const app = express();
const router = express.Router();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))


app.post('/insert', (req, res) => {
    const { employee_id, total_working_days, present_days, leave_days, overtime_hours, month_year } = req.body;
    console.log("datas", employee_id, total_working_days, present_days, leave_days, overtime_hours, month_year);

    db.query('INSERT INTO attendance(employee_id,total_working_days,present_days,leave_days,overtime_hours,month_year) VALUES (?,?,?,?,?,?)',
        [employee_id, total_working_days, present_days, leave_days, overtime_hours, month_year], (err, result) => {
            if (err) {
                console.log("error data", err)
                return res.status(500).json({ error: "database query failed" })

            }
            res.json({ success: "data inserted successfully", result })
        })
})


app.put('/update/:id', (req, res) => {
    const id = req.params.id;
    const { employee_id, total_working_days, present_days, leave_days, overtime_hours, month_year } = req.body;

    db.query("SELECT * FROM attendance WHERE attendance_id=?", [id], (err, rows) => {
        if (err) {
            console.log("fetch error", err);
            return res.status(500).json({ error: "query failed" })
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: "user not found" })
        }

        const oldData = rows[0];

        const updatedemployee_id = employee_id || oldData.employee_id;
        const updatedtotal_working_days = total_working_days || oldData.total_working_days;
        const updatedpresent_days = present_days || oldData.present_days;
        const updatedleave_days = leave_days || oldData.leave_days;
        const updatedovertime_hours = overtime_hours || oldData.overtime_hours;
        const updatedmonth_year = month_year || oldData.month_year

        db.query("UPDATE attendance SET employee_id=?,total_working_days=?,present_days=?,leave_days=?,overtime_hours=?,month_year=? WHERE attendance_id=?",
            [updatedemployee_id, updatedtotal_working_days, updatedpresent_days, updatedleave_days, updatedovertime_hours, updatedmonth_year, id], (err, result) => {
                if (err) {
                    console.log("update error", err);
                    return res.status(500).json({ error: "database update failed" })

                }
                res.json({ success: "Data updated successfully", result });
            })

        res.json({ success: "data updated successfully", result })
    })
})




app.get('/get', (req, res) => {
    db.query('select * from attendance', (err, result) => {
        if (err) {
            console.log("error data", err)
            return res.status(500).json({ error: "database query failed" });

        }
        res.json(result);

    })
})

app.get('/getsingle', (req, res) => {
    const id = req.query.attendance_id;
    db.query('select * from attendance where attendance_id=?', [id], (err, result) => {
        if (err) {
            console.log("error data", err)
            return res.status(500).json({ error: "database query failed" });

        }
        res.json(result);

    })
})


app.delete('/delete/:id', (req, res) => {
    const id = req.params.id;

    db.query('delete from attendance where attendance_id=?', [id], (err, result) => {
        if (err) {
            console.log('error data', err)
            return res.status(500).json({ error: "database query failed" })
        }
        res.json({ success: "data deleted successfully", result })
    })
})

app.get('/get', (req, res) => {
    db.query('select * from attendence whwre id=1', (err, result) => {
        if (err) {
            console.log("error data", err)
            return res.status(500).json({ error: "database query failed" })

        }
        res.json(result);
    })
})

app.get('/get', (req, res) => {
    db.query('select * from attendence', (err, result) => {
        if (err) {
            console.log("error data", err)
            return res.status(500).json({ error: "database query failed" });

        }
        res.json(result);

    })
})


module.exports = app;