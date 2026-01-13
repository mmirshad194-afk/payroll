const db=require('./db');
const express = require('express');
const app =express();
const nodemailer = require('nodemailer');
const router = express.Router();
const bcrypt = require('bcrypt');
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
    const { name,phone,batch,email,password} = req.body;
    console.log("datas",name,phone,batch,email,password);
    const hashpassword = await bcrypt.hash(password,10);

    db.query('INSERT INTO users ( name,phone,batch,email,password ) VALUES (?,?,?,?,?)',[name,phone,batch,email,hashpassword],(err,result) => {
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



const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "sinansinan232t@gmail.com",
        pass: "nvxu okqc fsxh ldcz"
    }
});



app.post("/forgot-password", (req, res) => {
    const { email } = req.body;
    console.log("Email:", email);

    const sql = "SELECT * FROM users WHERE email=?";
    db.query(sql, [email], (err, rows) => {
        if (err) return res.status(500).json({ message: "DB error" });
        if (rows.length === 0) return res.status(400).json({ message: "Email not registered" });

        const otp = Math.floor(100000 + Math.random() * 900000);

        const updateSql = `UPDATE users SET reset_otp=?, otp_expiry=DATE_ADD(NOW(), INTERVAL 5 MINUTE)WHERE email=?`;

        db.query(updateSql, [otp, email], (err) => {
            if (err) return res.status(500).json({ message: "OTP save error" });

            const mailOptions = {
                from: "sinansinan232t@gmail.com",
                to: email,
                subject: "Password Reset OTP",
                text: `Your OTP is ${otp}. It is valid for 5 minutes.`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Mail error:", error);
                    return res.status(500).json({ message: "Failed to send OTP email" });
                }

                console.log("Email sent:", info.response);
                res.json({ message: "OTP sent to email" });
            });
        });
    });
});  

app.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    const sql = `SELECT * FROM users WHERE email=? AND reset_otp=? AND otp_expiry > NOW()`;

    db.query(sql, [email, otp], (err, rows) => {
        if (err) return res.status(500).json({ message: "DB error" });
        if (!rows.length) return res.status(400).json({ message: "Invalid or expired OTP" }); 
        
    const clearOtpSql = `UPDATE users SET reset_otp=NULL, otp_expiry=NULL WHERE email=?`;

db.query(clearOtpSql, [email], (err2) => {
    if (err2) return res.status(500).json({ message: "OTP clear failed" });

    res.json({ message: "OTP verified" });


    });
 });
});

app.post("/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;

    const hash = await bcrypt.hash(newPassword, 10);

    const sql = `UPDATE users SET password=?, reset_otp=NULL, otp_expiry=NULL WHERE email=?`;

    db.query(sql, [hash, email], (err) => {
        if (err) return res.status(500).json({ message: "Password update failed" });

        res.json({ message: "Password reset successful" });
    });
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

app.get('/getsingle', (req, res) => {
    const id = req.query.user_id;
    db.query('select * from users where user_id=?', [id], (err, result) => {
        if (err) {
            console.log("error data", err)
            return res.status(500).json({ error: "database query failed" });

        }
        res.json(result);

    })
})


app.delete('/delete/:id', (req, res) => {
    const user_id = req.params.id;
    
    db.query("delete from users where user_id=?", [user_id], (err, result) => {
        if (err) {
            console.log("error query", err);
            return res.status(500).json({ error: "database query failed" })
        }
        res.json({ success: "data deleted successfully", result })
    })
})


app.put('/update/:id', (req, res) => {
    const user_id = req.params.id;
    const {name,phone,batch,email,password} = req.body;


    db.query("SELECT * FROM users WHERE user_id = ?", [user_id], (err, rows) => {
        if (err) {
            console.log("Fetch error", err);
            return res.status(500).json({ error: "query failed" });
        }

        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const oldData = rows[0];


        const updatedname = name || oldData.name;
        const updatedphone = phone || oldData.phone;
        const updatedbatch = batch || oldData.batch;
        const updatedpass = password || oldData.password;
        const updatedemail = email || oldData.email;
        

        db.query(
            "UPDATE users SET name=?, phone=?, batch=?, password=?, email=? WHERE user_id=?",
            [updatedname,updatedphone,updatedbatch,updatedpass,updatedemail,user_id],
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


module.exports=app;