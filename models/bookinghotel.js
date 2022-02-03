var mongoose=require("mongoose");
const { Timestamp } = require("mongodb");

var bookinghotelschema=new mongoose.Schema({
    hotelid:Number,
    hotelname:String,
    price:Number,
    trooms:Number,

    allrequests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "bookingreq"
        },
    ],

});

module.exports=mongoose.model("Bookinghotel",bookinghotelschema);  