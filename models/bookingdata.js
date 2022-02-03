var mongoose=require("mongoose");
const { Timestamp } = require("mongodb");

var bookingreqschema=new mongoose.Schema({
    hotelname: String,
    hotelid:Number,
    hotelprice:String,

    name:String,
    usermail:String,
    contact:Number,
    idnumber: String,
    idtype: String,

    rooms:Number,
    checkout:String,
    checkin:String,
    
    bookingstatus:String,
    paymentid:String,
});

module.exports=mongoose.model("Bookingreq",bookingreqschema);  