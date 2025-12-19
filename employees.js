const express = require('express');
const app =express();

app.use(express.json());
app.use(express.urlencoded({extended:true}))

const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localst',
    user: 'root',
    password:'',
    database: 'connection',

})

connection.connect((err)=>{
    if(err){
        console.log("error in connection",err);
        return;
    }
    console.log("connected to database")
})



app.post('/insert',(req,res)=>{
    const {name,job_role,department,salary_type,joining_date, status}=req.body;
    console.log("datas",name,job_role,department,salary_type,joining_date, status)
    


db.query('INSERT INTO employees(name,job_role,department,salary_type,joining_date, status) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [name,job_role,department,salary_type,joining_date, status],(err,result)=>{
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
