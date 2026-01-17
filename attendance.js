const db = require('./db');
const express = require('express');
const app = express();
const router = express.Router();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))




app.post('/add', (req, res) => {
  const {
    employee_id,
    month_year,
    total_working_days,
    present_days,
    late_count
  } = req.body;

  if (!employee_id || !month_year || !total_working_days || !present_days) {
    return res.status(400).json({ msg: "All fields required" });
  }

  if (present_days > total_working_days) {
    return res.status(400).json({
      msg: "Present days cannot exceed working days"
    });
  }

  const actual_leave = total_working_days - present_days;
  const late_half_leave = Math.floor((late_count || 0) / 2) * 0.5;
  const total_leave = actual_leave + late_half_leave;

  const sql = `
    INSERT INTO attendance
    (employee_id, month_year, total_working_days, present_days, leave_days, late_count)
    VALUES (?,?,?,?,?,?)`;

  db.query(
    sql,
    [
      employee_id,
      month_year,
      total_working_days,
      present_days,
      total_leave,
      late_count || 0
    ],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({
            msg: "Attendance already added for this month"
          });
        }
        return res.status(500).json(err);
      }

      res.json({
        msg: "✅ Attendance added successfully",
        leave_days: total_leave
      });
    }
  );
});

app.get('/attendance/:employee_id/:month_year', (req, res) => {
  const { employee_id, month_year } = req.params;

  const sql = `
    SELECT *
    FROM attendance
    WHERE employee_id=? AND month_year=?`;

  db.query(sql, [employee_id, month_year], (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length)
      return res.status(404).json({ msg: "Attendance not found" });

    res.json(rows[0]);
  });
});

app.get('/attendance', (req, res) => {
  db.query("SELECT * FROM attendance", (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.get('/attendance/month/:month_year', (req, res) => {
  const { month_year } = req.params;

  const sql = `
    SELECT *
    FROM attendance
    WHERE month_year=?`;

  db.query(sql, [month_year], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.put('/attendance/update/:attendance_id', (req, res) => {
  const {
    total_working_days,
    present_days,
    late_count
  } = req.body;

  if (present_days > total_working_days) {
    return res.status(400).json({
      msg: "Present days cannot exceed working days"
    });
  }

  const actual_leave = total_working_days - present_days;
  const late_half_leave = Math.floor((late_count || 0) / 2) * 0.5;
  const total_leave = actual_leave + late_half_leave;

  const sql = `
    UPDATE attendance
    SET total_working_days=?,
        present_days=?,
        leave_days=?,
        late_count=?
    WHERE attendance_id=?`;

  db.query(
    sql,
    [
      total_working_days,
      present_days,
      total_leave,
      late_count || 0,
      req.params.attendance_id
    ],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({
        msg: "✅ Attendance updated",
        leave_days: total_leave
      });
    }
  );
});

app.delete('/attendance/delete/:attendance_id', (req, res) => {
  const sql = `
    DELETE FROM attendance
    WHERE attendance_id=?`;

  db.query(sql, [req.params.attendance_id], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json({ msg: "🗑️ Attendance deleted" });
  });
});

module.exports = app;