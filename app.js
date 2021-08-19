//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt=require('mongoose-encryption')
const app = express();

app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/Auth",{ useNewUrlParser: true , useUnifiedTopology: true });

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//TODO
const hacker=new mongoose.Schema({
  email: {
    type: String,
    required:true,
    unique:true
  },
  password:{
    type: String,
    required:true
  }
});

hacker.plugin(encrypt, { secret: process.env.TEST ,encryptedFields: ['password']});
const Auth=mongoose.model("Eth",hacker)

app.get("/",function(req,res)
{
  res.render("home")
})

app.get("/login",function(req,res)
{
  res.render("login")
})

app.get("/register",function(req,res)
{
  res.render("register")
})

app.post("/register",function(req,res)
{
  const entry=new Auth({
    email:req.body.username,
    password:req.body.password
  })
  entry.save(function(err)
  {
    if(err)
    {
      console.log(err)
    }
    else{
      res.render("secrets")
    }
  })
  
})
app.post("/login",function(req,res){
  const email=req.body.username;
  const password=req.body.password;
  Auth.findOne({email:email},function(err,foundUser)
  {
    if(err)
    {
      console.log(err)
    }
    else{
      if(foundUser)
      {
        if(foundUser.password===password)
        {
          res.render("secrets");
        }
      } 
    }
  })
})
app.listen(3000, function() {
  console.log("Server started on port 3000");
});