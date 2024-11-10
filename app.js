require("dotenv").config()
require("./config/database.js").connect()
const express = require("express")


const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const User = require("./model/user.js")
const auth = require("./middleware/auth.js")

const app = express();
app.use(express.json())

app.get("/",(req,res)=>{
    res.send("<h1>Hello from auth system -LCO</h1>")
})

app.post("/register",async (req,res)=>{
    try {   
        const {firstname, lastname, email, password} = req.body;
    
    if (!(email && password && firstname && lastname)) {    
        res.status(400).send('All fields are required')
    }
    
    const existingUser = await User.findOne({email}); // promise

    if (existingUser) {
    res.status(401).send('User already exists') 
    }

    const myEncPassword = await bcrypt.hash(password,10)
    const user = await User.create({
        firstname,
        lastname,
        email: email.toLowerCase(),
        password: myEncPassword
    })

    // token
    const token = jwt.sign(
        {user_id: user._id, email},
        process.env.SECRET_KEY,
        {
            expiresIn: "2h"
        }
    )
    user.token = token
    // update or not
    // handle password
    user.password = undefined;
    
    res.status(201).json(user)
    } catch (error) {
        console.log(error);
        
    }
    
})

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!(email && password)) {
            return res.status(400).send("Field is missing");  // Send response and stop execution
        }

        const user = await User.findOne({ email });

        // If the user exists and the password matches
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign(
                { user_id: user._id, email },
                process.env.SECRET_KEY,
                { expiresIn: "2h" }
            );
            user.token = token;
            user.password = undefined;  // Hide password from response
            return res.status(200).json(user);  // Send successful response
        }

        // If login fails (incorrect email/password)
        return res.status(400).send("Email or password is incorrect");  // Send error message once
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");  // Send error for unexpected issues
    }
});

app.get("/dashboard", auth,(req,res)=>{
    res.send("welcome to secret information");
})

module.exports = app;
