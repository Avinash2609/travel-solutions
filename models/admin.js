var mongoose=require("mongoose");

var adminschema = new mongoose.Schema({
    email:String,   
})


module.exports = mongoose.model("admin", adminschema);