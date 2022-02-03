var express=require("express");
var passport=require("passport");
require('dotenv').config();

var bookingdata = require("../models/bookingdata");
var bookinghotel = require("../models/bookinghotel");


var middleware = require("../middleware/index");

var router=express.Router({mergeParams: true});


var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MY_MAIL,
    pass: process.env.PASS
  }
});



const checksum_lib=require("../paytm/checksum/checksum");


router.get("/payment/:hid/:bid",function(req,res){
    let params={}
    // params['MID']='PafhkC08108295167919',
    params['MID']='wErUkK40798264521525',//testing
    params['WEBSITE']='DEFAULT',
    params['CHANNEL_ID']='WEB',
    params['INDUSTRY_TYPE_ID']='Retail',
    params['ORDER_ID']="Merchant"+Math.random().toString(36).substring(2,15),
    params['CUST_ID']="ajidal"+Math.random().toString(36).substring(2,15),

    // params['CUST_ID']=String(req.user.username)+Math.random().toString(36).substring(2,15),
    params['TXN_AMOUNT']='1',
    // params['CALLBACK_URL']='http://localhost:3001/campgrounds/' + req.params.hid + "/" + req.params.bid +'/status/' + params['ORDER_ID'],//testing
    params['CALLBACK_URL']='https://tripkart.herokuapp.com/' + req.params.hid + "/" + req.params.bid +'/status/' + params['ORDER_ID'],//testing
    params['EMAIL']='ajindal_be18@thapar.edu',
    params['MOBILE_NO']='9050995986'

    // checksum_lib.genchecksum(params,'_IFq1ytY9gWQ&8jZ',function(err,checksum){
        checksum_lib.genchecksum(params,'RyS29!4Q65GYcgN_',function(err,checksum){ //testing
        let txn_url="https://securegw.paytm.in/order/process" //testing
        // let txn_url="https://securegw-stage.paytm.in/order/process"
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

//////////////////////////////////////////////payment

router.post("/campgrounds/:hid/:bid/status/:id1" ,function(req,res){
    bookingdata.findById(req.params.bid, function(err, founddata){
        if(err){
            req.flash("error", err);
            res.redirect("/landing");
        }
        else{
            if(req.body.STATUS=="TXN_SUCCESS"){
                founddata.bookingstatus="booked";   
                founddata.paymentid=req.body.BANKTXNID;
                founddata.save();
                bookinghotel.findById(req.params.hid,function(err,hfound){
                    if(err){
                        req.flash(err);
                        res.redirect("/landing");
                    }else{
                        hfound.allrequests.push(founddata);
                        hfound.save();
                    }
                })
            }
            
            // console.log(foundcampground);

            var mailOptions = {
                from: 'ajindal_be18@thapar.edu',
                to: founddata.usermail,
                subject: 'Booking Reciept',
                html: `<h1>Hi!!! ${founddata.name}</h1>
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

            res.render("main/payment",{details: req.body});
        }
    })
    
    req.flash("success", " Thank you! For the Booking");
    
})

module.exports = router;