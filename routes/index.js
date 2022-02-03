var express=require("express");
var passport=require("passport");
var url=require("url");
require('dotenv').config();

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var router=express.Router({mergeParams: true});
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
     callbackURL: "http://localhost:3001/google/callback",//testing
    passReqToCallback: true
  },
  function(request,accessToken, refreshToken, profile, done) {
        // console.log(profile);
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
    res.render("partials/landing");
});
  

router.get("/google", passport.authenticate('google',{scope:['profile','email']}));

router.get("/google/callback",passport.authenticate('google',
{failureRedirect:"/register"}),function(req,res){
    res.redirect("/success");
})

router.get("/success",function(req,res){

    req.flash("success", "Welcome!!! you are successfully Logged In as " + req.user.displayName);
    res.redirect("/landing");
})


router.get("/logout",function(req,res){
    req.flash("success", "Thank you!!! you are successfully Logged Out");
    req.logOut();
    res.redirect("/");
})

module.exports = router;
