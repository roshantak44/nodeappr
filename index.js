var express = require('express');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
var path = require('path');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var moment = require('moment-timezone');
var port = process.env.PORT || 8000;


var app = express();
var url = "mongodb://roshan:roshantak44@ds147734.mlab.com:47734/nodemo";

app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.Promise = global.Promise;
mongoose.connect( url, { useNewUrlParser: true });


var mailSchema = new mongoose.Schema({
    tomail: {type: String},
    cc: {type: String},
    bcc: {type: String},
    tsubject: {type: String},
    date: { type: Date, default: Date.now },
    scheduledate: { type: Date },
    message: { type: String }
});

var maildata = mongoose.model("maildata", mailSchema);

app.get('/', function(req, res){
    console.log(req)
    res.render('index',{title: 'Exambazaar'});
});

app.get('/about', function(req, res){
    res.render('about');
});

app.get('/contact', function(req, res){
    res.render('contact');
});

app.get('/report', function(req, res){
    maildata.find({}, function(err, res, docs){
		if(err) res.json(err);
		else    res.render('report', {maildatas: docs});
    });
});

    
   var CronJob = require('cron').CronJob;
   new CronJob('* * * * * *', function() {
    console.log("this");
    var now = new Date(); //also read on moment.js
    console.log('this2');
    var after30Mins = moment().add(30, 'mins');
    console.log('this3');//find a way to add mins to current date or moment moment().add(10, 'days'), moment.utc(date).local().format() 
    var localtime = moment().format();
    console.log("this is local time", localtime); // ("2019-01-04T07:53:07.667+00:00") converted to 2019-01-04T13:04:21+05:30
    console.log(now);
    //console.log(after30Mins);
    var query = ({ date: { '$gte': after30Mins, '$lt': now } });// { $gte:ISODate("2019-11-19T14:00:00Z"), $lt: ISODate("2019-11-19T20:00:00Z") } })
    var allMails = maildata.find(query,{}).exec(function(error, _allMails){
       console.log("Inside");
       console.log(allMails);
       console.log('afterallmails');
       if(!error && allMails){
           console.log(allMails);
       }else{
           console.log("Error: " + error); 
       }
   });
   console.log('You will see this message every second');
   }, null, true, 'America/Los_Angeles');

app.post('/contact/send', function(req, res){ 
    console.log(req)
    console.log('schedule time is here'+ JSON.stringify(req.body));
    if(req.body.date.length == 0){
        var newvar =  {
                tomail: req.body.tomail,
                cc: req.body.cc,
                bcc: req.body.bcc,
                tsubject: req.body.tsubject,
                scheduledate: req.body.date,
                message: req.body.message
        };
        var myData = maildata(newvar);
        console.log("not mentioned default date");

    }else{
        var myData = maildata(req.body);
        console.log("mentioned date");
    }
    myData.save()
    .then(item => {
    res.redirect('/');
    })
    .catch(err => {
    res.status(400).send("unable to save to database");
    });
    
    var now = new Date(); //also read on moment.js
    var after30Mins = moment().add(30, 'mins');//find a way to add mins to current date or moment moment().add(10, 'days'), moment.utc(date).local().format() 
    var localtime = moment.utc(now).local().format();
    console.log("this is local time", localtime); // ("2019-01-04T07:53:07.667+00:00") converted to 2019-01-04T13:04:21+05:30
    console.log(now);
    console.log(after30Mins);
    var query = {date : {$gte: now}, date: {$lt: after30Mins}};
    maildata.find(query,{}).exec(function(error, allMails){
        if(!error && allMails){
            console.log(allMails);
        }else{
            console.log("Error: " + error);
        }
    });


    var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'testcomeb@gmail.com',
        pass: 'testcom231834'   //enter the password associated with user mail in signle inverted commas 
      }
    });

    var toemail = req.body.tomail;
    var cc = req.body.cc;
    var bcc = req.body.bcc;

    var mailOptions = {
        from: 'testcom <testcomeb@gmail.com>',
        to: toemail+","+cc+","+bcc,
        subject: req.body.tsubject,
        html: '<div>'+req.body.message+'</div>'
    };
    

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
            res.redirect('/');
        }
        else{
            console.log('Message Sent: '+info.response);
            res.redirect('/');
        }
    });
        console.log("send mail");
});




app.listen(port, function(){
    console.log("App is running on port "+port);
});