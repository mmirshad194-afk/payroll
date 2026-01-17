const db =require('./db');
const express = require('express');
const app =express();






// app.post('/add', (req, res) => {
//   const { employee_id, month_year } = req.body;

//   if (!employee_id || !month_year) {
//     return res.status(400).json({ msg: "employee_id & month_year required" });
//   }

//   /* ===== ATTENDANCE ===== */
//   const attQ = `
//     SELECT total_working_days, present_days, leave_days, late_count
//     FROM attendance
//     WHERE employee_id=? AND month_year=?`;

//   db.query(attQ, [employee_id, month_year], (err, att) => {
//     if (err) return res.status(500).json(err);
//     if (!att.length)
//       return res.status(404).json({ msg: "Attendance not found" });

//     const {
//       total_working_days,
//       present_days,
//       leave_days,
//       late_count
//     } = att[0];

//     /* ===== EARNINGS ===== */
//     const earnQ = `
//       SELECT basic_salary, hra, travel_allowance, overtime_pay
//       FROM earnings
//       WHERE employee_id=? AND month_year=?`;

//     db.query(earnQ, [employee_id, month_year], (err, earn) => {
//       if (err) return res.status(500).json(err);
//       if (!earn.length)
//         return res.status(404).json({ msg: "Earnings not found" });

//       const basic = Number(earn[0].basic_salary);
//       const gross =
//         basic +
//         Number(earn[0].hra || 0) +
//         Number(earn[0].travel_allowance || 0) +
//         Number(earn[0].overtime_pay || 0);

//       /* ===== DEDUCTIONS ===== */
//       const dedQ = `
//         SELECT pf, esi, professional_tax, loan_deduction
//         FROM deductions
//         WHERE employee_id=? AND month_year=?`;

//       db.query(dedQ, [employee_id, month_year], (err, ded) => {
//         if (err) return res.status(500).json(err);
//         if (!ded.length)
//           return res.status(404).json({ msg: "Deductions not found" });

//         const other_deductions =
//           Number(ded[0].pf || 0) +
//           Number(ded[0].esi || 0) +
//           Number(ded[0].professional_tax || 0) +
//           Number(ded[0].loan_deduction || 0);

//         /* ===== LEAVE DEDUCTION ===== */
//         const per_day_salary = basic / total_working_days;
//         const leave_deduction = per_day_salary * leave_days;

//         const total_deductions =
//           leave_deduction + other_deductions;

//         const net_salary = gross - total_deductions;

//         /* ===== INSERT PAYROLL ===== */
//         const insertQ = `
//           INSERT INTO payroll
//           (employee_id, month_year,
//            total_working_days, present_days, leave_days, late_count,
//            gross_salary, leave_deduction, other_deductions,
//            total_deductions, net_salary)
//           VALUES (?,?,?,?,?,?,?,?,?,?,?)`;

//         db.query(
//           insertQ,
//           [
//             employee_id,
//             month_year,
//             total_working_days,
//             present_days,
//             leave_days,
//             late_count,
//             gross,
//             leave_deduction,
//             other_deductions,
//             total_deductions,
//             net_salary
//           ],
//           (err, result) => {
//             if (err) {
//               if (err.code === 'ER_DUP_ENTRY') {
//                 return res.status(400).json({
//                   msg: "Payroll already generated for this month"
//                 });
//               }
//               return res.status(500).json(err);
//             }

//             res.json({
//               msg: "✅ Payroll generated successfully",
//               gross_salary: gross,
//               leave_deduction,
//               total_deductions,
//               net_salary
//             });
//           }
//         );
//       });
//     });
//   });
// });


app.post('/add', (req, res) => {
  const { employee_id, month_year } = req.body;

  if (!employee_id || !month_year) {
    return res.status(400).json({ msg: "employee_id & month_year required" });
  }

  /* ===== ATTENDANCE ===== */
  const attQ = `
    SELECT total_working_days, present_days, leave_days, late_count
    FROM attendance
    WHERE employee_id=? AND month_year=?`;

  db.query(attQ, [employee_id, month_year], (err, att) => {
    if (err) return res.status(500).json(err);
    if (!att.length)
      return res.status(404).json({ msg: "Attendance not found" });

    const {
      total_working_days,
      present_days,
      leave_days,
      late_count
    } = att[0];

    /* ===== EARNINGS ===== */
    const earnQ = `
      SELECT basic_salary, hra, travel_allowance, overtime_pay
      FROM earnings
      WHERE employee_id=? AND month_year=?`;

    db.query(earnQ, [employee_id, month_year], (err, earn) => {
      if (err) return res.status(500).json(err);
      if (!earn.length)
        return res.status(404).json({ msg: "Earnings not found" });

      const basic = Number(earn[0].basic_salary);
      const gross =
        basic +
        Number(earn[0].hra || 0) +
        Number(earn[0].travel_allowance || 0) +
        Number(earn[0].overtime_pay || 0);

      /* ===== PAID LEAVE CALCULATION (METHOD-2) ===== */

      // earned paid leave = months worked + current month
      db.query(
        `SELECT COUNT(*) AS earned FROM payroll WHERE employee_id=?`,
        [employee_id],
        (err, er) => {
          if (err) return res.status(500).json(err);

          const earned_PL = er[0].earned + 1;

          // already used paid leave
          db.query(
            `SELECT IFNULL(SUM(paid_leave_used),0) AS used
             FROM payroll WHERE employee_id=?`,
            [employee_id],
            (err, us) => {
              if (err) return res.status(500).json(err);

              const used_PL = us[0].used;
              const balance_PL = earned_PL - used_PL;

              const paid_leave_used = Math.min(balance_PL, leave_days);
              const unpaid_leave = leave_days - paid_leave_used;

              /* ===== LEAVE DEDUCTION ===== */
              const per_day_salary = basic / total_working_days;
              const leave_deduction = unpaid_leave * per_day_salary;

              /* ===== DEDUCTIONS ===== */
              const dedQ = `
                SELECT pf, esi, professional_tax, loan_deduction
                FROM deductions
                WHERE employee_id=? AND month_year=?`;

              db.query(dedQ, [employee_id, month_year], (err, ded) => {
                if (err) return res.status(500).json(err);

                const other_deductions =
                  Number(ded[0]?.pf || 0) +
                  Number(ded[0]?.esi || 0) +
                  Number(ded[0]?.professional_tax || 0) +
                  Number(ded[0]?.loan_deduction || 0);

                const total_deductions =
                  leave_deduction + other_deductions;

                const net_salary = gross - total_deductions;

                /* ===== INSERT PAYROLL ===== */
                const insertQ = `
                  INSERT INTO payroll
                  (employee_id, month_year,
                   total_working_days, present_days, leave_days, late_count,
                   gross_salary, leave_deduction, other_deductions,
                   total_deductions, net_salary,
                   paid_leave_used, unpaid_leave)
                  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;

                db.query(
                  insertQ,
                  [
                    employee_id,
                    month_year,
                    total_working_days,
                    present_days,
                    leave_days,
                    late_count,
                    gross,
                    leave_deduction,
                    other_deductions,
                    total_deductions,
                    net_salary,
                    paid_leave_used,
                    unpaid_leave
                  ],
                  (err) => {
                    if (err && err.code === 'ER_DUP_ENTRY') {
                      return res.status(400).json({
                        msg: "Payroll already generated for this month"
                      });
                    }
                    if (err) return res.status(500).json(err);

                    res.json({
                      msg: "✅ Payroll generated (Method-2)",
                      earned_paid_leave: earned_PL,
                      paid_leave_used,
                      unpaid_leave,
                      leave_deduction,
                      net_salary
                    });
                  }
                );
              });
            }
          );
        }
      );
    });
  });
});


app.get('/payroll/:employee_id/:month_year', (req, res) => {
  const { employee_id, month_year } = req.params;

  const sql = `
    SELECT *
    FROM payroll
    WHERE employee_id=? AND month_year=?`;

  db.query(sql, [employee_id, month_year], (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length)
      return res.status(404).json({ msg: "Payroll not found" });

    res.json(rows[0]);
  });
});

app.get('/payroll', (req, res) => {
  db.query("SELECT * FROM payroll", (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.get('/payroll/month/:month_year', (req, res) => {
  const { month_year } = req.params;

  const sql = `
    SELECT *
    FROM payroll
    WHERE month_year=?`;

  db.query(sql, [month_year], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.delete('/payroll/delete/:payroll_id', (req, res) => {
  const sql = `
    DELETE FROM payroll
    WHERE payroll_id=?`;

  db.query(sql, [req.params.payroll_id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ msg: "🗑️ Payroll deleted" });
  });
});

module.exports = app;




