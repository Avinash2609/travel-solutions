var mongoose=require("mongoose");
const { Timestamp } = require("mongodb");

var exerciseschema=new mongoose.Schema({
    name: String,
    calcount:Number,
    description:String,
    hardness:String,
    link: String,
    youtubevideolink:String // preform exercise like this video
});

module.exports=mongoose.model("exercise",exerciseschema);  