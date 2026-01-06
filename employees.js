const db=require('./db');
const express = require('express');
const app =express();
const router = express.Router();




app.post('/insert',(req,res)=>{ 
    const {name,department,salary_type,joining_date, status}=req.body;
    console.log("datas",name,department,salary_type,joining_date, status);
    
db.query('INSERT INTO employees(name,department,salary_type,joining_date, status) VALUES (?,?,?,?,?)',
    [name,department,salary_type,joining_date, status],(err,result)=>{
    if(err){
        console.log("error data" ,err)
        return res.status(500).json({error:"database query failed"})

    }
    res.json({success:"data inserted successfully",result})
})
})


app.get('/get', (req,res)=>{
     db.query('select * from employees',(err,result)=>{
         if(err){
          console.log("error data",err)
          return res.status(500).json({error:"database query failed"});

         } 
         res.json(result);
        
     })
})


app.get('/getsingle', (req, res) => {
    const id = req.query.employee_id;
    db.query('select * from employees where employee_id=?', [id], (err, result) => {
        if (err) {
            console.log("error data", err)
            return res.status(500).json({ error: "database query failed" });

        }
        res.json(result);
    })
})



app.put('/update/:id', (req, res) => {
  const id = req.params.id;
  const { name,department,salary_type,joining_date, status } = req.body;

  db.query("SELECT * FROM employees WHERE employee_id = ?", [id], (err, rows) => {
    if (err) {
      console.log("Fetch error", err);
      return res.status(500).json({ error: "query failed" });
    }
    if (rows.length === 0) {
      return res.status(404).json({ error: "user not found" });
    }
  

    const oldData = rows[0];

    const updatedname = name || oldData.name;
    const updateddepartment = department || oldData.department;
    const updatedsalary = salary_type || oldData.salary_type;
    const updatedjoining_date = joining_date || oldData.joining_date;
    const updatedstatus = status || oldData.status;


    db.query("UPDATE employees SET name=?,department=?,salary_type=?,joining_date=?,status=? WHERE employee_id=?",
      [updatedname,updateddepartment,updatedsalary,updatedjoining_date,updatedstatus,id],
      (err, result) => {
        if (err) return res.status(500).json({ error: "database update failed" });
        res.json({ success: "data updated successfully", result });
      }
    );
  });
});



app.delete('/delete/:id', (req, res) => {
    const id = req.params.id;

    db.query("delete from employees where employee_id=?", [id], (err, result) => {
        if (err) {
            console.log("error query", err);
            return res.status(500).json({ error: "database query failed" })
        }
        res.json({ success: "data deleted successfully", result })
    })
})





module.exports=app;