var express = require("express")
const bodyParser= require('body-parser')
const MongoClient = require('mongodb').MongoClient
var cookieParser = require('cookie-parser');

var app = express()
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/login.html')
})

app.get('/index', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})


app.post('/login', function(req, res){
  db.collection('users').findOne({email: req.body['email']}, function(err, document){
      if(document == null) {
          db.collection('users').save(req.body, (err, result) => {
          if (err) return console.log(err)
          console.log('saved to database')
          res.cookie('email' , req.body['email'])
          res.sendFile(__dirname + '/index.html')
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

app.post('/addTask', function(req, res){
    req.body['email'] = req.cookies['email']
    db.collection('tasks').save(req.body, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
    })
})


var db
MongoClient.connect('mongodb://wmorgan1221:morgan11@ds053176.mlab.com:53176/starwars-quotes-test-weston', function(err, database) {
  if (err) return console.log(err)
  db = database
  app.listen(8081, () => {
    console.log('listening on 8081')
  })
})