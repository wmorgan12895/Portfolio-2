var express = require("express")
const bodyParser= require('body-parser')
const MongoClient = require('mongodb').MongoClient


var app = express()
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
          res.sendFile(__dirname + '/index.html')
        })
      } 
      else if(err){

      }
      else {
        if(document.password == req.body['password']){
          res.send({ code: '200' })
          console.log("correct login")
        }else{
          res.send({ code: '100' })
          console.log("incorrect login")
        }
      }
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