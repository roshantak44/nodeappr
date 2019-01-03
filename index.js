var express = require('express');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
var path = require('path');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var port = process.env.PORT || 8000;

var app = express();
var url = "mongodb://<roshan>:<roshantak44>@ds147734.mlab.com:47734/nodemo";

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
    res.render('index',{title: 'Exambazaar'});
});

app.get('/about', function(req, res){
    res.render('about');
});

app.get('/contact', function(req, res){
    res.render('contact');
});

app.get('/report', function(req, res){
    maildata.find({}, function(err, docs){
		if(err) res.json(err);
		else    res.render('report', {maildatas: docs});
});
});


app.post('/contact/send', function(req, res){ 
    console.log('schedule time is here'+ JSON.stringify(req.body));
    var myData = new maildata(req.body);
    myData.save()
    .then(item => {
    res.redirect('/');
    })
    .catch(err => {
    res.status(400).send("unable to save to database");
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
});


app.post('/report', function(req, res){
	new maildata({
		_id    : req.body.toemail,
		tomail: req.body.tomail,
        cc   : req.body.cc,
        bcc : req.body.bcc,
        tsubject : req.body.tsubject,
        date : req.body.date,
        message	: req.body.message
	}).save(function(err, doc){
		if(err) res.json(err);
		else    res.redirect('/report');
	});
});


app.listen(port, function(){
    console.log("App is running on port "+port);
});