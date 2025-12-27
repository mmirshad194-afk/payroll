const db=require('./db');
const express = require('express');
const app =express();

app.use(express.json());
app.use(express.urlencoded({extended:true}))




app.post('/insert',(req,res)=>{ 
    const {name,department,salary_type,joining_date, status}=req.body;
    console.log("datas",name,department,salary_type,joining_date, status)
    


db.query('INSERT INTO employees(name,department,salary_type,joining_date, status) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [name,department,salary_type,joining_date, status],(err,result)=>{
    if(err){
        console.log("error data" ,err)
        return res.status(500).json({error:"database query failed"})

    }
    res.json({success:"data inserted successfully",result})
})
})


app.get('/employees',(req,res)=>{
     db.query('select * from epmloyees',(err,result)=>{
         if(err){
          console.log("error data",err)
          return res.status(500).json({error:"database query failed"});

         } 
         res.json(result);
        
     })
})


app.put('/update/:id', (req, res) => {
    const { name, job_role, department, salary_type, joining_date, status } = req.body;
    const { id } = req.params;

    db.query(`UPDATE employees SET name = ?,job_role = ?,department = ?,salary_type = ?,joining_date = ?,status = ? WHERE employee_id = ?`,
        [name, job_role, department, salary_type, joining_date, status, id],
        (err,result) => {
            if (err) {
                console.log("update error", err);
                return res.status(500).json({ error: "update failed" });
            }
            res.json({ success: "employee updated successfully", result});
        }
    );
});



app.delete('/delete/:id', (req, res) => {
    const id = req.params.id;

    db.query("delete from employees where id=?", [id], (err, result) => {
        if (err) {
            console.log("error query", err);
            return res.status(500).json({ error: "database query failed" })
        }
        res.json({ success: "data deleted successfully", result })
    })
})





module.exports=app;