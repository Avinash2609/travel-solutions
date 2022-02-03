var express=require("express");
var router=express.Router({mergeParams: true});
var middleware = require("../middleware/index")
const date = require('date-and-time');
var mongoose=require("mongoose");
const unirest = require("unirest");
const timer= require('timer-node');
var passport=require("passport");
var axios = require("axios").default;
var fs = require('fs'); 
var path = require('path'); 
var multer = require('multer'); 
const options = require('dotenv/lib/env-options');
// const { all } = require(".");
const { isNull } = require("util");
const { timeStamp } = require("console");
const { Int32 } = require("mongodb");
require('dotenv/config'); 
var request = require("request");
/////////////////////////////////////Mail System////////////////////
var exptime=1;
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MY_MAIL,
    pass: process.env.PASS
  }
});

///////////////////////////////////////////////////////////////

//////////////////////////////////models///////////////////

// var request=require("../models/request");
var bookingdata = require("../models/bookingdata");
var bookinghotel = require("../models/bookinghotel");
///////////////////////////////////////////////////////


/////////////////////////////////// routes//////////


router.get("/landing",function(req,res){
    res.render("main/landingpage");
});

router.get("/allbookings",function(req,res){
  var mail=req.user.emails[0].value;
  bookingdata.find({bookingstatus:"booked", usermail:mail},function(err,bookings){
    if(err){
      req.flash(err);
      res.redirect("/");
    }else{
      res.render("main/allbookings",{bookings:bookings});
    }
  })
  
});

router.post("/auto",function(req,res){
    var filter=req.body.auto;

    var options = {
      method: 'GET',
      url: 'https://travel-advisor.p.rapidapi.com/locations/auto-complete',
      params: {query: filter, lang: 'en_US', units: 'km'},
      headers: {
        'x-rapidapi-host': 'travel-advisor.p.rapidapi.com',
        'x-rapidapi-key': '298af398acmsh2eda814064a8c8ap1e901fjsn3eda059b413f'
      }
    };
    
      axios.request(options).then(function (response) {
        res.render("main/places",{places:response.data.data});
    }).catch(function (error) {
        res.render("main/error",{err:error});
    });
});

router.get("/places/:id/:flag",function(req,res){
    var id=req.params.id;
        
    var options = {
      method: 'GET',
      url: 'https://travel-advisor.p.rapidapi.com/hotels/list',
      params: {
        location_id: id,
        adults: '1',
        rooms: '1',
        nights: '2',
        offset: '0',
        currency: 'USD',
        order: 'asc',
        limit: '30',
        sort: 'recommended',
        lang: 'en_US'
      },
      headers: {
        'x-rapidapi-host': 'travel-advisor.p.rapidapi.com',
        'x-rapidapi-key': '298af398acmsh2eda814064a8c8ap1e901fjsn3eda059b413f'
      }
    };
    

    axios.request(options).then(function (response) {
      res.render("main/hotels",{hotels:response.data.data,pid:id});
    }).catch(function (error) {
      res.render("main/error",{err:error});
    });
  
})

router.get("/hotels/:pid/:id/:name/:price",function(req,res){
      var id=req.params.id;
      var name=req.params.name;
      var price=req.params.price;
      var pid=req.params.pid;
      res.render("main/details",{rid:id,rname:name,rprice:price,pid:pid});
})

router.post("/hotels/:pid/:id/:name/:price",function(req,res){
  //put email as of google auth
  //update statuses
    var id=req.params.id;
    var name=req.params.name;
    var price=req.params.price;



    bookingdata.create(req.body.request,function(err,created){
        created.hotelid=id;
        created.hotelname=name;
        created.price=price;
        created.usermail=req.user.emails[0].value;
        created.paymentid="pending";
        created.bookingstatus="pending";
        created.save();
        bookinghotel.findOne({hotelid:created.hotelid},function(err,found){
          if(err){
            req.flash(err);
            res.redirect("/landing");
          }
          if(!found){
              var hnew=new bookinghotel();
              hnew.hotelid=created.hotelid;
              hnew.hotelname=created.hotelname;
              hnew.hotelprice=created.hotelprice;
              hnew.trooms=10;
              hnew.save();
              res.redirect("/payment/"+ hnew._id +"/"+ created._id );
          }else{
              //check availability
              if(found.allrequests.length<found.trooms){
                res.redirect("/payment/"+ found._id +"/"+ created._id );
              }else {
                  found.allrequests.sort(function(a,b){
                      var c1=a.checkin;
                      var c2=b.checkin;//01 34 6789
  
                      return Date.UTC(c1.substring(6,10),c1.substring(0,2),c1.substring(3,5))-Date.UTC(c2.substring(6,10),c2.substring(0,2),c2.substring(3,5));
                  });
  
                  var c1=created.checkin;
                  var c2=created.checkout;
                  var reqroom=created.rooms;
                  let crein = (Date.UTC(c1.substring(6,10),c1.substring(0,2),c1.substring(3,5)));
                  let creout = (Date.UTC(c2.substring(6,10),c2.substring(0,2),c2.substring(3,5)));
                  var clash=0;
                  for(var i=0;i<found.length-1;i++){
                      var p1=found.allrequests[i].checkin;
                      var p2=found.allrequests[i].checkout;
                      let prein = (Date.UTC(p1.substring(6,10),p1.substring(0,2),p1.substring(3,5)));
                      let preout = (Date.UTC(p2.substring(6,10),p2.substring(0,2),p2.substring(3,5)));
                      if(crein>=prein && crein<=preout){
                        clash=clash+found.allrequests[i].rooms;
                      } else if(creout>=prein && creout<=preout){
                        clash=clash+found.allrequests[i].rooms;
                      } 
                      if(clash+reqroom>found.trooms || creout<prein){
                          break;
                      }
                  }
                  
                  if(clash+reqroom>=found.trooms){//not available
                    req.flash("alert","House Full!! choose another hotel please");
                    res.redirect("/places/"+req.params.pid+"/1");
                  }else{
                    res.redirect("/payment/"+ found._id +"/"+ created._id );
                  }
  
              }
              
  
          } 
      })
    })
    
    

})


///////////////////////
module.exports = router;