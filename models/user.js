var mongoose=require("mongoose");
// var passportlocalmongoose=require("passport-local-mongoose");

var userschema = new mongoose.Schema({
    name: String,
    email: String,
    phone: Number,
    sex:String,
    height: Number,
    weight: Number,
    id: String,
    premium: Boolean,
    txn_id:String

})

// userschema.plugin(passportlocalmongoose);

module.exports = mongoose.model("user", userschema);