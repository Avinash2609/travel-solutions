var mongoose=require("mongoose");
const { Timestamp } = require("mongodb");

var activityschema=new mongoose.Schema({
    startdate: String,
    enddate:String,
    duration:Number,
    //stored in seconds
    myexercise:String,
    // myexercise: {
    //     id: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "exercise"
    //     }
    // },
    // userid:{
    //     id: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "user"
    //     }
    // },
    userki_id:String,
    calcount:Number,
    calburnt:Number,
    id:String
});

module.exports=mongoose.model("activities",activityschema);  