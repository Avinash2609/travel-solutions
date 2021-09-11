var express=require("express");
var passport=require("passport");
var url=require("url");
require('dotenv').config();

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var router=express.Router({mergeParams: true});
var User=require("../models/user");
var exercise=require("../models/exercise");
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
     callbackURL: "http://localhost:3001/google/callback",//testing
    // callbackURL: "https://avinashjindal2510.herokuapp.com/google/callback",
    passReqToCallback: true
  },
  function(request,accessToken, refreshToken, profile, done) {
        console.log(profile);
        return done(null,profile);
  }
));

passport.serializeUser(function(user,done){
    done(null,user);
});
passport.deserializeUser(function(user,done){
    done(null,user);
});


router.get("/",function(req,res){
    res.render("partials/landingpage");
    
})
router.get("/add",function(req,res){
    var newexercise = new exercise();
    newexercise.name="Squats";
    newexercise.calcount=100;
    newexercise.description="only up downn no fucks";
    newexercise.hardness="noob exercise";
    newexercise.link="https://editor.p5js.org/ajavinash63/embed/uu2nGUBiq";
    newexercise.youtubevideolink="https://www.youtube.com/watch?v=D_ke1aEhpic&ab_channel=ChefRanveerBrar";
    newexercise.save();
    res.send(newexercise);
})




router.get("/register", function(req,res){
    res.render("auth_files/register");
})


router.get("/google", passport.authenticate('google',{scope:['profile','email']}));

router.get("/google/callback",passport.authenticate('google',
{failureRedirect:"/register"}),function(req,res){
    res.redirect("/success");
})

router.get("/success",function(req,res){

    req.flash("success", "Welcome!!! you are successfully Logged In as " + req.user.displayName);
    res.redirect("/info");
})


router.get("/logout",function(req,res){
    req.flash("success", "Thank you!!! you are successfully Logged Out");
    req.logOut();
    res.redirect("/info");
})

module.exports = router;