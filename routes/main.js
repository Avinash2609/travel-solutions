var express=require("express");
var router=express.Router({mergeParams: true});
var activity=require("../models/activities");
var exercise=require("../models/exercise");
const date = require('date-and-time');
var mongoose=require("mongoose");
var User = require("../models/user");
const unirest = require("unirest");
const timer= require('timer-node');


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

// router.get("/finish/:hours/:minutes/:seconds/:userid/:exerciseid/:acitivityid",function(req,res){
router.get("/finish/:hours/:minutes/:seconds/",function(req,res){
    mylist=[];
    mylist.push(req.params.hours);
    mylist.push(req.params.minutes);
    mylist.push(req.params.seconds);
    // mylist.push(req.params.userid);
    // mylist.push(req.params.exerciseid);
    // mylist.push(req.params.activityid);
    var mydur=mylist[0]*3600 + Int32(mylist[1])*60 + Int32(mylist[2]);
    // activity.find({id:req.params.activityid},(err,curr)=>{
    //     curr.duration=mylist[0]*3600 + mylist[1]*60 + mylist[2];
    //     mydur=curr.duration;
    //     curr.myexercise=mylist[4];
    //     curr.userki_id=mylist[3];
    // });
    res.send(mydur);
    // res.render("all_exercise/finish",);
})

router.get("/exercise",function(req,res){
    console.log(req.user);
    var count=0;
    User.find({id:req.user.id},(err,currentuser)=>{
    if(!currentuser){
        const newuser= new User();
        newuser.name= req.user.displayName;
        newuser.email=req.user.emails[0].value;
        newuser.id=req.user.id;
        newuser.save();
    }
    });
    exercise.find({},(err,allexercises)=>{
    res.render("all_exercise/exercise",{allexercises:allexercises,user:req.user});
    })
});

router.get("/embedded/:exid",(req,res)=>{
    exercise.findById(req.params.exid,(err,mymodelid)=>{
            var newactivity= new activity();
            newactivity.startdate=new Date();
            // console.log(newactivity.starttime); 
            newactivity.id=newactivity._id;      
            newactivity.save();

            // var countDownDate=date.format(newactivity.startdate, 'MMM D,YYYY HH:mm:ss'); 
            // console.log(countDownDate);
            res.render("p5/index",{ model:mymodelid , current_activity:newactivity.id});
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