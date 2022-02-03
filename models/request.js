var mongoose=require("mongoose");
const { Timestamp } = require("mongodb");

var requestschema=new mongoose.Schema({
    location: String,
    cost:Number,
    purpose:String,
    persons:Number,
    fname: String,
    lname: String,
    contact:String,
    food:String,
    date:{
        dd:Number,
        mm:Number,
        yy:Number,
    },
    stime:{
        hh:Number,
        mm:Number
    },
    etime:{
        hh:Number,
        mm:Number
    },
    
    time:Date  ,//time of request made
    paymentstatus:String,
    status:String,
    allotment:String,
    room:Number,
});

module.exports=mongoose.model("request",requestschema);  