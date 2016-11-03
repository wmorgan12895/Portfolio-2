var express = require("express")
const bodyParser= require('body-parser')
const MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID;
var cookieParser = require('cookie-parser');
var sg = require('sendgrid')('API_KEY_GOES_HERE')
var TMClient = require('textmagic-rest-client');
var http = require('http');

var app = express()
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/login.html')
})

app.use(express.static('static'));

app.get('/index', (req, res) => {
  //res.sendFile(__dirname + '/index.html')
  req.body['email'] = req.cookies['email'];
  if(req.cookies['email']!=""){
    db.collection('tasks').find({email: req.body['email']}).toArray(function(err, results) {
          if (err) return console.log(err);
          // renders index.ejs
          console.log(results);
          function sortfunction(a, b) {
            aDate = new Date(a.date);
            bDate = new Date(b.date);
            if(aDate < bDate) { return 1; }
            if(aDate > bDate) { return -1; }
            else { return 0; }
          }
          results.sort(sortfunction);
          console.log(results);
          res.render('index.ejs', {tasks: results});
    })
  }else{
    res.send()
  }
})


app.post('/login', function(req, res){
  db.collection('users').findOne({email: req.body['email']}, function(err, document){
      if(document == null) {
          db.collection('users').save(req.body, (err, result) => {
          if (err) return console.log(err)
          console.log('saved to database')
          res.cookie('email' , req.body['email'])
          res.send({ code: '300' })
        })
      } 
      else if(err){

      }
      else {
        if(document.password == req.body['password']){
          res.cookie('email' , req.body['email'])
          res.send({ code: '200' })
          console.log("correct login")
        }else{
          res.send({ code: '100' })
          console.log("incorrect login")
        }
      }
  })
})

app.post('/deleteTask', function(req, res){
  console.log(req.body["_id"])
    db.collection('tasks').remove({_id: ObjectID(req.body["_id"])}, (err, result) => {
      if (err) return console.log(err)
      console.log('deleted from database')
      res.send();
    })
})

app.post('/addTask', function(req, res){
    req.body['email'] = req.cookies['email']
    console.log(req.body);
    db.collection('tasks').save(req.body, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      //getTasks()
      //sendMail(req.body['email'], req.body['taskname'])
      res.send();
    })
})


var db
MongoClient.connect('mongodb://wmorgan1221:morgan11@ds053176.mlab.com:53176/starwars-quotes-test-weston', function(err, database) {
  if (err) return console.log(err)
  db = database
  app.listen(8081, () => {
    console.log('listening on 8081')
    setInterval(getTasks, 60000);
  })
})



function getTasks(){
  date = new Date()
  if(date.getMinutes()<10){
     cTime = date.getHours() +":0"+date.getMinutes()
  } 
  else {
     cTime = date.getHours() +":"+date.getMinutes()
  }
  date.setHours(0,0,0,0)
  console.log(cTime)
  var cursor = db.collection('tasks').find({date: date.toString(), time: cTime})
  cursor.forEach(function(doc){
    if(doc['emailNotify'] == 'on'){
      console.log("Sending Reminder")
      sendMail(doc['email'],doc['taskname'])
    }
    if(doc['textNotify'] == 'on') {
      console.log("Sending Message");
      sendText(doc['phone'], doc['taskname']);
    }
  })
}


function sendMail(email, taskname){
     var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: {
          personalizations: [
            {
              to: [
                {
                  email: email
                },
              ],
              subject: 'You have a reminder!',
            },
          ],
          from: {
            email: 'wmorgan1221@gmail.com',
          },
          content: [
            {
              type: 'text/plain',
              value: taskname,
            },
          ],
        },
      });
      //With callback
      sg.API(request, function(error, response) {
        if (error) {
          console.log('Error response received');
        }
        // console.log(response.statusCode);
        // console.log(response.body);
        // console.log(response.headers);
      });
}

function sendText(phoneNumber, taskname) { 
  var c = new TMClient('TEXT_USER', 'TEXT_API_KEY');
  console.log('Phone number:' + phoneNumber);
  c.Messages.send({text: taskname, phones: phoneNumber}, function(err, res){
    console.log('Messages.send()', err, res);
  });
}