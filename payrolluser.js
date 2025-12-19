const express = require('express');
const app =express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const db=require('./db');

const session = require('express-session');

app.use(session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 30 * 1000,
        sameSite: "none",
        }
}));

app.use((req,res,next)=>{
    res.setHeader("Cache-Control","no-store");
    next();

})

app.post('/signup',async(req,res)=>{
    const { email,password} = req.body;
    console.log("datas",email,password);
    const hashpassword = await bcrypt.hash(password,10);

    connection.query('INSERT INTO users ( email,password ) VALUES (?,?)',[email,hashpassword],(err,result) => {
        if(err){
            console.log("error data",err);
            return res.status(500).json({error:"database query filed" })
        }
        res.json({succes:"data inserted successfully",result})
    })
})

app.post('/login',(req,res) =>{
    const { email,password} = req.body;

    const sql = "SELECT * FROM users WHERE email = ?"
    db.query(sql,[email], async(err,rows)=>{
        if (err) return res.status(500).json({ mesage: 'db error'});
        if (!rows.length) return res.status(400).json({ message: " incorrect Email" });

        const user = rows[0];

        const isMatch = await bcrypt.compare(password,user.password);
        if (!isMatch) return res.status(401).json({ message:"wrong password" })

            req.session.userId = user.id;
            req.session.email = user.email;
        
            req.session.userId = user.id;
            req.session.email = user.email;

     return res.json({
        message: 'login successful',
        session: req.session,
        user : {
            id: user.id,
            email: user.email

        }
     })
  })
})


app.get('/check-session', (req, res) => {
    if (!req.session.email) {
        res.json({ active: false, message: "Session ended" });
    } else {
        res.json({ active: true, message: "Session active" });
        
    }
});


app.get('/get', (req, res) => {
    db.query('select * from users', (err, result) => {
        if (err) {
            console.log("error data", err)
            return res.status(500).json({ error: "database query failed" });

        }
        res.json(result);

    })
})


app.delete('/delete/:id', (req, res) => {
    const id = req.params.id;
 
    db.query("delete from users where id=?", [id], (err, result) => {
        if (err) {
            console.log("error query", err);
            return res.status(500).json({ error: "database query failed" })
        }
        res.json({ success: "data deleted successfully", result })
    })
})


app.put('/update/:id', (req, res) => {
    const id = req.params.id;
    const {password, email,} = req.body;


    db.query("SELECT * FROM users WHERE id = ?", [id], (err, rows) => {
        if (err) {
            console.log("Fetch error", err);
            return res.status(500).json({ error: "Database fetch failed" });
        }

        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const oldData = rows[0];


        // const updatedName = name || oldData.name;
        const updatedpass = password || oldData.password;
        const updatedemail = email || oldData.email;
        // const updatedPhone = phone || oldData.phone;


        db.query(
            "UPDATE users SET password=?, email=?,WHERE id=?",
            [updatedpass, updatedemail,id],
            (err, result) => {
                if (err) {
                    console.log("Update error", err);
                    return res.status(500).json({ error: "Database update failed" });
                }

                res.json({ success: "Data updated successfully", result });
            }
        );
    });
});

app.listen(7000, () => console.log("server is running"));

module.exports=app;