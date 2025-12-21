const mysql=require('mysql');
const express=require('express');
const app=express();

const connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'payroll',
});
connection.connect((error)=>{
    if(error){
        console.log("error database connection");
        return;
    }
    console.log("database connected");

})
app.get('/display',(req,res)=>{

})

module.exports=connection;