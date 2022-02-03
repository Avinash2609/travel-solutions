var mongoose=require("mongoose");

var userschema = new mongoose.Schema({
    gid : String,
    allrequests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "request"
        },
    ],
    admin:String,
})

module.exports = mongoose.model("user", userschema);