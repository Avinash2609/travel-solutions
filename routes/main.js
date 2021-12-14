var express=require("express");
var router=express.Router({mergeParams: true});
var activity=require("../models/activities");
var exercise=require("../models/exercise");
const date = require('date-and-time');
var mongoose=require("mongoose");
var User = require("../models/user");
const unirest = require("unirest");
const timer= require('timer-node');
var passport=require("passport");

var fs = require('fs'); 
var path = require('path'); 
var multer = require('multer'); 
const options = require('dotenv/lib/env-options');
const { all } = require(".");
const { isNull } = require("util");
const { timeStamp } = require("console");
const { Int32 } = require("mongodb");
require('dotenv/config'); 

var storage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        cb(null, 'uploads') ;
    }, 
    filename: (req, file, cb) => { 
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)) ;
    } 
}); 

var upload = multer({ storage: storage }); 


var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MY_MAIL,
    pass: process.env.PASS
  }
});


const checksum_lib=require("../paytm/checksum/checksum");


router.get("/premium/payment",function(req,res){
    let params={}
    // params['MID']='PafhkC08108295167919',
    params['MID']='wErUkK40798264521525',//testing
    params['WEBSITE']='DEFAULT',
    params['CHANNEL_ID']='WEB',
    params['INDUSTRY_TYPE_ID']='Retail',
    params['ORDER_ID']="Merchant"+Math.random().toString(36).substring(2,15),
    params['CUST_ID']=String(req.user.username)+Math.random().toString(36).substring(2,15),
    params['TXN_AMOUNT']='1',
    params['CALLBACK_URL']='http://localhost:3001/premium/status/',//testing
    // params['CALLBACK_URL']='https://avinashjindal2510.herokuapp.com/campgrounds/' + req.params.id +'/status/' + params['ORDER_ID'],
    params['EMAIL']='ajindal_be18@thapar.edu',
    params['MOBILE_NO']='9050995986'

    // checksum_lib.genchecksum(params,'_IFq1ytY9gWQ&8jZ',function(err,checksum){
        checksum_lib.genchecksum(params,'RyS29!4Q65GYcgN_',function(err,checksum){ //testing
        // let txn_url="https://securegw.paytm.in/order/process" //testing
        let txn_url="https://securegw-stage.paytm.in/order/process"
        let form_fields=""

        for(x in params)
        {
            form_fields += "<input type='hidden' name='"+x+"' value='"+params[x]+"'/>"
        }

        form_fields += "<input type='hidden' name='CHECKSUMHASH' value='"+checksum+"'/>"

        var html='<html><body><center><h1>Please wait! Do not refresh the page</h1></center><form method="post" action="'+txn_url+'" name="f1">'+form_fields +'</form><script type="text/javascript">document.f1.submit()</script></body></html>'
        res.writeHead(200,{'Content-Type': 'text/html'})
        res.write(html)

    })
});

////////////////////////////////////////

router.post("/premium/status/" ,function(req,res){
    User.findOne({id:req.user.id},(err,founduser)=>{
        if(err){
            req.flash("error", err);
            res.redirect("/exercise");
        }
        if(!founduser){
            res.redirect("/exercise");
        }
        else{
            
            founduser.txn_id=req.body.TXNID;
            if(req.body.STATUS=="TXN_SUCCESS"){
                founduser.premium=true;   
            }else{
                founduser.premium=false;
            }
            founduser.save();
            var mailOptions = {
                from: 'ajindal_be18@thapar.edu',
                to: req.user.emails[0].value,
                subject: 'Payment Confirmation',
                html: `<h1>Hi!!! ${founduser.name}</h1>
                <p>We have received your payment.</p>
                <h4 class="text-center">Your receipt is:</h4>
                    <table border="1PX" align="center">
                        <tr>
                            <td>CURRENCY</td>
                            <td>${req.body.CURRENCY}</td>
                        </tr>
                        <tr>
                            <td>GATEWAYNAME</td>
                            <td>${req.body.GATEWAYNAME}</td>
                        </tr>
                        <tr>
                            <td>RESPONSE MESSAGE</td>
                            <td>${req.body.RESPMSG}</td>
                        </tr>
                        <tr>
                            <td>BANKNAME</td>
                            <td>${req.body.BANKNAME}</td>
                        </tr>
                        <tr>
                            <td>MERCHANT ID</td>
                            <td>${req.body.MID}</td>
                        </tr>
                        <tr>
                            <td>RESPONSE CODE</td>
                            <td>${req.body.RESPCODE}</td>
                        </tr>
                        <tr>
                            <td>Transaction ID</td>
                            <td>${req.body.TXNID}</td>
                        </tr>
                        <tr>
                            <td>Transaction AMOUNT</td>
                            <td>${req.body.TXNAMOUNT}</td>
                        </tr>
                        <tr>
                            <td>ORDER ID</td>
                            <td>${req.body.ORDERID}</td>
                        </tr>
                        <tr>
                            <td>STATUS</td>
                            <td>${req.body.STATUS}</td>
                        </tr>
                        <tr>
                            <td>BANK Transaction ID</td>
                            <td>${req.body.BANKTXNID}</td>
                        </tr>
                        <tr>
                            <td>Transaction TIME</td>
                            <td>${req.body.TXNDATE}</td>
                        </tr>
                    </table> 
                    <h4>Thanks!! for choosing us..</h4>
                     `        
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });

            res.render("all_exercise/payment",{details: req.body});
        }
    })
    
    req.flash("success", "Thank you! For the Premimum");
    
})


///routes for city
router.get("/aboutus",function(req,res){
    res.render("campgrounds/aboutus");
});
router.get("/privacy",function(req,res){
    res.render("campgrounds/privacypolicy");
});
router.get("/terms",function(req,res){
    res.render("campgrounds/terms");
});

router.get("/info",function(req,res){
    res.redirect("/exercise");
})

router.get("/recommendation",function(req,res){
    var list=["all_exercise/f&v","all_exercise/l&s","all_exercise/l&w","all_exercise/m&d","all_exercise/p&b"];
    var i=Math.floor(Math.random() *5);
    res.render(list[i]);
})


router.get("/finish/:hours/:minutes/:seconds/:actid",function(req,res){
    activity.findById(req.params.actid,(err,myactid)=>{
            if(err){
                req.flash("error", err);
                res.redirect("/");
            }else{
                var hsecs=req.params.hours*3600;
                var msecs=req.params.minutes*60;
                var secs=req.params.seconds+hsecs+msecs;
                myactid.calburnt=myactid.calcount*secs;
                myactid.duration=secs;
                myactid.enddate=new Date();
                myactid.save();
                //////////////////////////////////////
                var mailOptions = {
                    from: 'ajindal_be18@thapar.edu',
                    to: req.user.emails[0].value,
                    subject: 'Yogi Lite details',
                    html: `<h1>Hi!!! Workout Freak </h1>
                    <h4 class="text-center">Your workout session details are:</h4>
                        <table border="1PX" align="center">
                            <tr>
                                <td>Startdate</td>
                                <td>${myactid.startdate}</td>
                            </tr>
                            <tr>
                                <td>Enddate</td>
                                <td>${myactid.enddate}</td>
                            </tr>
                            <tr>
                                <td>Calburnt</td>
                                <td>${myactid.calburnt}</td>
                            </tr>
                            <tr>
                                <td>Duration</td>
                                <td>${myactid.duration}</td>
                            </tr>
                            
                        </table> 
                        <h4>Thanks!! for choosing us..</h4>
                         `        
                  };
                  
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
    
                /////////////////////////////////////
                activity.find({},function(err,all){
                    var list=[];
                    
                    all.forEach(function(single){
                        if(single.userki_id==req.user.id){
                            list.push(single);
                        }
                    })
                    res.render("all_exercise/finish",{allacts:list});  
                })
            }
            
    })
})

router.get("/exercise",function(req,res){
    var count=0;
    User.findOne({id:req.user.id},(err,currentuser)=>{
        if(!currentuser){
            const newuser= new User();
            newuser.name= req.user.displayName;
            newuser.email=req.user.emails[0].value;
            newuser.id=req.user.id;
            newuser.premium=false;
            newuser.save();
            currentuser=newuser;
        }
        exercise.find({},(err,allexercises)=>{
            res.render("all_exercise/exercise",{allexercises:allexercises,user:req.user,pre:currentuser.premium});
        })

    });
    
});

router.get("/embedded/:exid",(req,res)=>{
    exercise.findById(req.params.exid,(err,mymodelid)=>{
            if(err){
                req.flash("error", err);
                res.redirect("/");
            }else{
                var newactivity= new activity();
                newactivity.startdate=new Date();
                newactivity.id=newactivity._id;   
                newactivity.userki_id=req.user.id; 
                newactivity.calcount=mymodelid.calcount;  
                newactivity.myexercise=mymodelid.name;
                newactivity.save();
                res.render("p5/index",{ model:mymodelid , current_activity:newactivity.id});
            }
            
    })
})

// router.post("/info",function(req,res){

//     doc.find({},function(err,all){
//     var list=[];
//         all.forEach(function(single){
//             if(single.city==req.body.city && single.state==req.body.state){
//                 list.push(single);
//             }
//         })
//         if(list.length==0){
//             res.render("campgrounds/nodoctor");
//         } else {
//         res.render("campgrounds/alldoctors",{doc_available:list});  
//         }      
//     })
// })


// //routes for doctor
// // router.get("/campgrounds/collab",middleware.isloggedin,function(req,res){
// //     res.render("campgrounds/doctor");
// // })

// router.post("/campgrounds/collab", upload.array('myfiles',2),function(req,res){
//     var obj=[];
//         req.files.forEach(function(file){
//         console.log(file.filename);            
//         var xyz={ 
//             data: fs.readFileSync(path.join('./uploads/' + file.filename)), 
//         } ;
//         obj.push(xyz);
//       });
//         doc.create(req.body.doctor,function(err,doc_created){
//             doc_created.documents=obj;
//             doc_created.save();
//             console.log(doc_created);
//             res.redirect("/info");
//         })
// })
// //===================google map api
// router.get("/api",function(req,res){
//     res.render("campgrounds/api");
// })

// router.get("/api/:city/:state",function(req,res){
//     doc.find({},function(err,all){
//         var list=[];
//             all.forEach(function(single){
//                 if(single.city==req.params.city && single.state==req.params.state){
//                     list.push(single);
//                 }
//             })
//             if(list.length==0){
//                 res.render("campgrounds/nodoctor");
//             } else {
//             res.render("campgrounds/alldoctors",{doc_available:list});  
//             }      
//         })
// })

// //campground routes
// router.get("/campgrounds/final/:id",function(req,res){
//     campground.find({},function(err,allcampgrounds){
//         if(err){
//             req.flash("error", err);
//         } else{
//             allcampgrounds.forEach(function(got){
//                 if(got.btxn_id==""){
//                     console.log(got.name);
//                     campground.findByIdAndRemove(got._id,function(err){
//                         if(err){
//                             req.flash("error", err);
//                         }
//                         else{
//                             console.log("item deleted");
//                         }
//                     })    
//                 }
//             })
//             res.redirect("/campgrounds1/final/" +req.params.id);
//         }

//     })
// })

// router.get("/campgrounds1/final/:id",function(req,res){
//     campground.find({},function(err,allcampgrounds){
//         if(err){
//             req.flash("error", err);
//             res.redirect("/info");
//         } else{
//             campground.findById(req.params.id,function(err,mycamp){
//                 if(err){
//                     console.log(err);
//                     res.redirect("/info");
//                 } else {
//                     if(mycamp == null){
//                         res.redirect("/info");
//                     } else{
//                         var list=[];
//                         allcampgrounds.forEach(function(one){
//                             if(one.doctor_id == mycamp.doctor_id){
//                                 list.push(one);
//                             }
//                         })
    
//                         doc.findById(mycamp.doctor_id,function(err,doc){
//                             if(err){
//                                 console.log(err);
//                             } else {
//                         res.render("campgrounds/index",{campgrounds:list, currentuser: req.user, doc:doc});
//                             }
//                         })
    
//                     }

//                 }
//             })
            
//         }
//     })
// })
// //==================viewing
// router.get("/campgrounds/view/:id",function(req,res){
//     campground.find({},function(err,allcampgrounds){
//         if(err){
//             console.log(err);
//         } else {
//             var list = [];
//             allcampgrounds.forEach(function(single){
//                 if(single.doctor_id==req.params.id && single.btxn_id!=""){
//                     list.push(single);
//                 }
//             })
//             doc.findById(req.params.id,function(err,doc){
//                 if(err){
//                     console.log(err);
//                 } else {
//             res.render("campgrounds/index",{campgrounds:list, currentuser: req.user, doc:doc});
//                 }
//             })
//         }
//     })
// })

// // ==================================================new route
// router.get("/campgrounds/new/:id", middleware.isloggedin ,function(req,res){
//             res.render("campgrounds/new",{docid:req.params.id});
// })


// router.post("/campgrounds/:id", middleware.isloggedin ,function(req,res){
    
//     var myauthor={
//         id: req.user.id,
//         username: req.user.displayName,
//         image: req.user.photos[0].value,
//         gmailid:req.user.emails[0].value
//     };


//     campground.create(req.body.campground , function(err,camp){
//         if(err){
//             req.flash("error", err);
//         } else{
//             camp.author=myauthor;
//             // console.log(camp.author);
//             camp.btxn_id="";
//             camp.doctor_id=req.params.id;
//             camp.save();

//             // console.log("finally camp is: ");
//             // console.log(camp);

//             campground.find({},function(err,allcampgrounds){
//                 if(err){
//                     req.flash("error", err);
//                 } else{
//                     var list=[];
//                     allcampgrounds.forEach(function(one){
//                         if(one.doctor_id == camp.doctor_id){
//                             list.push(one);
//                         }
//                     });
//                     // console.log("finally list is : ");
//                     // console.log(list);
//                     res.render("campgrounds/slot",{camp: camp, allcamps: list});
//                 }
//             })
//         }
//     })
// })

// router.post("/campgrounds/:id/slot", middleware.isloggedin ,function(req,res){
//     campground.findById(req.params.id, function(err, foundcampground){
//         if(err){
//             req.flash("error", err);
//             res.redirect("/info");
//         }
//         else{
//             foundcampground.slot=req.body.slot;
//             foundcampground.save();
//             console.log(foundcampground);
//             if(req.user.emails[0].value.includes("@thapar.edu")){
//                 // console.log(req.user.emails[0].value);
//                 // console.log("thapar student");
//                 foundcampground.txn_id = "Free for thapar students";
//                 foundcampground.btxn_id = "thapar_discount";
//                 foundcampground.save();
//                 res.redirect("/campgrounds/" + foundcampground._id); 
//             }
//             else if(foundcampground.btxn_id == ""){
//             res.redirect("/campgrounds/" + req.params.id +"/payment");
//             } else {
//                 res.redirect("/campgrounds/" + foundcampground._id);
//             }
//         }
//     })
    
//     req.flash("success", "Your appointment request has been sent successfully. Thank you!");
    
// })

// // ===========================================show

// router.get("/campgrounds/:id",function(req,res){
//     campground.findById(req.params.id).populate("comments").exec(function(err, foundcampground){
//         if(err){
//             req.flash("error", err);
//         }
//         else{
//             doc.findById(foundcampground.doctor_id,function(err,doc){
//                 if(err){
//                     console.log(err);
//                 } else {
//                     // console.log(req.user.emails[0].value);
//                     // console.log(doc.email);
//                  res.render("campgrounds/show",{campground: foundcampground,doc: doc, usermail:req.user.emails[0].value} );
//                 }
//             })
//         }
//     })
// })

// // ==============================================edit
// router.get("/campgrounds/:id/edit", middleware.checkcampownership ,function(req,res){
//     campground.findById(req.params.id, function(err, foundcampground){
//         if(err){
//             req.flash("error", err);
//             res.redirect("/campgrounds");
//         }
//         else{
//             res.render("campgrounds/edit",{campground: foundcampground} );
//         }
//     })
// })

// router.put("/campgrounds/:id", middleware.checkcampownership ,function(req,res){
//     campground.findByIdAndUpdate(req.params.id,req.body.campground ,function(err, updatedcampground){
//         if(err){
//             req.flash("error", err);
//             res.redirect("/campgrounds");
//         }
//         else{
//             updatedcampground.save();
//             updatedcampground.slot="";
//             campground.find({},function(err,allcampgrounds){
//                 if(err){
//                     req.flash("error", err);
//                 } else{
//             res.render("campgrounds/slot",{camp: updatedcampground, allcamps: allcampgrounds});
//                 }
//             })
//         }
//     })
// })


// // ========================================delete
// router.delete("/campgrounds/:id", middleware.checkcampownership ,function(req,res){
//     campground.findByIdAndRemove(req.params.id ,function(err){
//         if(err){
//             req.flash("error", err);
//             res.redirect("/info");
//         }
//         else{
//             req.flash("success", "Appointment Successfully deleted");
//             res.redirect("/info");
//         }
//     })
// })

module.exports = router;