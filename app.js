require("dotenv").config()
require("./config/database.js").connect()
const express = require("express")

const User = require("./model/user")
const bcrypt = require("bcryptjs")
const user = require("./model/user")

const app = express();
app.use(express.json())

app.get("/",(req,res)=>{
    res.send("<h1>Hello from auth system -LCO</h1>")
})

app.post("/register",async (req,res)=>{
    const {firstname, lastname, email, password} = req.body;
    
    if (!(email && password && firstname && lastname)) {    
        res.status(400).send('All fields are required')
    }
    
    const existingUser = await User.findOne({email}); // promise

    if (existingUser) {
    res.status(401).send('User already exists') 
    }

    const myEncPassword = await bcrypt.hash(password,10)
    const user = await user.create({
        firstname,
        lastname,
        email: email.toLowerCase(),
        password: myEncPassword
    })
    
})




module.exports = app;
