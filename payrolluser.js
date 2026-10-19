const db=require('./db');
const express = require('express');
const app =express();
// console.log("users.js is running")
const nodemailer = require('nodemailer');
const router = express.Router();
const bcrypt = require('bcrypt');
const session = require('express-session');
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const cors = require('cors');


router.use(cors({
  origin: "http://127.0.0.1:5500",
  credentials: true
}));

router.use(session({
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

router.use((req,res,next)=>{
    res.setHeader("Cache-Control","no-store");
    next();

})

router.post('/signup', async (req, res) => {

    const { name, phone, batch, email, password } = req.body;

    if (!name || !phone || !batch || !email || !password) {
        return res.status(400).json({
            error: "All fields are required"
        });
    }

    try {

        const hashpassword = await bcrypt.hash(password, 10);

        db.query(
            'INSERT INTO users (name, phone, batch, email, password) VALUES (?, ?, ?, ?, ?)',
            [name, phone, batch, email, hashpassword],

            (err, result) => {

                if (err) {

                    console.log("MYSQL ERROR =>", err);

                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(400).json({
                            error: "Duplicate entry found"
                        });
                    }

                    return res.status(500).json({
                        error: "Database error"
                    });
                }

                res.status(201).json({
                    message: "Signup successful"
                });

            }
        );

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: "Server error"
        });

    }

});

router.post('/login',(req,res) =>{
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


router.get('/check-session', (req, res) => {
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



router.post("/forgot-password", (req, res) => {

    const { email } = req.body;

    const sql = "SELECT * FROM users WHERE email=?";

    db.query(sql, [email], (err, rows) => {

        if (err) {
            console.log(err);
            return res.status(500).json({ message: "DB error" });
        }

        if (rows.length === 0) {
            return res.status(400).json({ message: "Email not registered" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        const updateSql = `
        UPDATE users 
        SET reset_otp=?, otp_expiry=DATE_ADD(NOW(), INTERVAL 5 MINUTE)
        WHERE email=?`;

        db.query(updateSql, [otp, email], (err) => {

            if (err) {
                console.log(err);
                return res.status(500).json({ message: "OTP save error" });
            }

            const mailOptions = {
                from: "mmirshad194@gamil.com",
                to: email,
                subject: "Password Reset OTP",
                text: `Your OTP is ${otp}. It is valid for 5 minutes.`
            };

            transporter.sendMail(mailOptions, (error, info) => {

                if (error) {
                    console.log(error);
                    return res.status(500).json({ message: "Failed to send OTP email" });
                }

                res.json({ message: "OTP sent to email" });

            });

        });

    });

});
router.post("/verify-otp", (req, res) => {
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

router.post("/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;

    const hash = await bcrypt.hash(newPassword, 10);

    const sql = `UPDATE users SET password=?, reset_otp=NULL, otp_expiry=NULL WHERE email=?`;

    db.query(sql, [hash, email], (err) => {
        if (err) return res.status(500).json({ message: "Password update failed" });

        res.json({ message: "Password reset successful" });
    });
});  

  


router.get('/get', (req, res) => {
    db.query('select * from users', (err, result) => {
        if (err) {
            console.log("error data", err)
            return res.status(500).json({ error: "database query failed" });

        }
        res.json(result);

    })
})

router.get('/getsingle', (req, res) => {
    const id = req.query.user_id;
    db.query('select * from users where user_id=?', [id], (err, result) => {
        if (err) {
            console.log("error data", err)
            return res.status(500).json({ error: "database query failed" });

        }
        res.json(result);

    })
})


router.delete('/delete/:id', (req, res) => {
    const user_id = req.params.id;
    
    db.query("delete from users where user_id=?", [user_id], (err, result) => {
        if (err) {
            console.log("error query", err);
            return res.status(500).json({ error: "database query failed" })
        }
        res.json({ success: "data deleted successfully", result })
    })
})


router.put('/update/:id', (req, res) => {
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
// app.listen(5000, () => {

//     console.log("Server running in user");
// });

module.exports=router;