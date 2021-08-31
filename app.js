//jshint esversion:6
require('dotenv').config() // For encrypting environment variables
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
//require the modules for the cookie handling.
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')

// const md5=require("md5")
// const bcrypt=require("bcrypt")//Algorithm used for hashing
// const saltRounds=10; //These is the number of salt rounds. Greater the number higher is the security.
//const encrypt=require('mongoose-encryption') //These uses weaker encryption methods.
const app = express();

app.set('view engine', 'ejs');//To use ejs files and views folder

//Create a session 
app.use(session({
  secret: 'vadapav is my favourite.',
  resave: false,
  saveUninitialized: true
}))

app.use(passport.initialize());//Initialize passport
app.use(passport.session());//Use session

mongoose.connect("mongodb://localhost:27017/Auth",{ useNewUrlParser: true , useUnifiedTopology: true,useFindAndModify: false,useCreateIndex:true });//To connect the database

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));//To use customed css files

//TODO
const hacker=new mongoose.Schema({//To create schema i.e how we store data in database.
  username: {
    type: String,
    // required:true,
    // unique:true
  },
  password:{
    type: String,
    // required:true
  },
  googleId:{
    type:String
  }
});

hacker.plugin(passportLocalMongoose);//plugin passportLocalMongoose
//hacker.plugin(encrypt, { secret: process.env.TEST ,encryptedFields: ['password']});//To encrypt the string process.env.TEST
hacker.plugin(findOrCreate);//plugin findOrcreate function.

const Auth=mongoose.model("Eth",hacker)//create a mongoose model

//Use model to createstrategy,serialize and deserialize user.
passport.use(Auth.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  //console.log(profile);
  Auth.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
    //console.log(accessToken);
  });
}
));
//For get requests
app.get("/",function(req,res)
{
  res.render("home")
})

app.get("/auth/google",passport.authenticate('google', {
  scope: ['profile']
}))
app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });
app.get("/login",function(req,res)
{
  res.render("login")
})

app.get("/register",function(req,res)
{
  res.render("register")
})
app.get("/logout",function(req,res)
{
  req.logout();
  res.redirect("/");
})
app.get("/secrets",function(req,res)
{
  if(req.isAuthenticated())
  {
    //console.log("Hello");
    res.render("secrets")
  }
  else{
    res.redirect("/login");
  }
})
// For post requests
app.post("/register",function(req,res){
 
Auth.register({username : req.body.username},req.body.password,function(err,user)//These method comes from passport
{
  if(err)
  {
    console.log(err)
  }
  else{
    passport.authenticate("local")(req,res,function()
    {
      res.redirect("/secrets");
    })
  }
})
})

app.post("/login",function(req,res){
const newuser=new Auth({
  email:req.body.username,
  password:req.body.password
})
req.login(newuser,function(err){
  if(err)
  {
    console.log(err)
  }
  else{
    passport.authenticate("local")(req,res,function()
    {
      res.redirect("/secrets");
    })
  }
})
})
// To listen on port 3000

app.listen(3000, function() {
  console.log("Server started on port 3000");
});









// app.post("/login",function(req,res){
//   const email=req.body.username;
//   const password=req.body.password;
//   Auth.findOne({email:email},function(err,foundUser)
//   {
//     if(err)
//     {
//       console.log(err)
//     }
//     else{
//       if(foundUser)
//       {
//         bcrypt.compare(password, foundUser.password, function(err, result) {
//           if(result == true)
//           {
//             res.render("secrets");
//           }
//         });
//       } 
//     }
//   })
// })


// app.post("/register",function(req,res)
// {
//   bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//     const entry=new Auth({
//       email:req.body.username,
//       password:hash
//     })
//     entry.save(function(err)
//     {
//       if(err)
//       {
//         console.log(err)
//       }
//       else{//If no error render secrets page
//         res.render("secrets")
//       }
//     })
//   });
  
// })