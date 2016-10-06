var express = require("express")
const bodyParser= require('body-parser')
const MongoClient = require('mongodb').MongoClient
var app = express()

app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')


app.get('/', (req, res) => {
  db.collection('quotes').find().toArray((err, result) => {
    if (err) return console.log(err)
    // renders index.ejs
    res.render('index.ejs', {quotes: result})
  })
})


app.post('/quotes', function(req, res){
  db.collection('quotes').save(req.body, (err, result) => {
    if (err) return console.log(err)

    console.log('saved to database')
    res.redirect('/')
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