// Dependencies
var express = require("express");
var mongoose = require('mongoose');
var request = require("request");
var cheerio = require("cheerio");
var logger = require("morgan");
var bodyParser = require("body-parser");
var exphbs = require('express-handlebars');
var path = require('path');
var data = require('./controllers/data');

// Initialize Express
var app = express();

//configure express
app.engine('handlebars',exphbs({defaultLayout:'main'}));
app.set('view engine','handlebars');

var db = require("./models");

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));

// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));


var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scringer";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);


app.get("/delete",function(req,res){
  db.Article.deleteMany({})
    .then(function(){
      res.send("all records deleted");
    })
})

// Main route 
app.get("/", function(req, res) {
    data.getArticles()
      .then(articles => res.render('home',{articleList:articles})) 
      .catch(err => res.status(422).json(err));
});

// Retrieve all articles
app.get("/all", function(req, res) {
  data.getArticles().then(articles => res.json(articles));
});

//I know, I know.  I would never do this in real life, I promise!  get route to delete notes.  
app.get("/delete/:id",function(req,res){
  data.deleteNote(req,res);
})

// Retrieve specific article notes from the db
app.get("/notes/:id", function(req, res) {
  data.getNotes(req.params.id).then(article => res.json(article.notes));
});

//create new note
app.post("/create",function(req,res){
  
  data.addNote(req,res);

})

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {

  // Make a request for the news section of ycombinator
  request("https://theringer.com", function(error, response, html) {
    // Load the html body from request into cheerio
    var results = [];
    var $ = cheerio.load(html);
    var counter = 0;

    
    // For each element with a "title" class
    $("h2.c-entry-box--compact__title").each(function(i, element) {
      // Save the text and href of each link enclosed in the current element
      var title = $(element).children("a").text();
      var link = $(element).children("a").attr("href");
      counter ++;//limit number of articles

      console.log("Counter: " + counter);
      // If this found element had both a title and a link
      if (title && link && counter < 20) {

          db.Article.findOne({title: title})
            .then(function(result){
              if(result){
                  //do nothing if article already exists in db
              }
              else {
                db.Article.create({
                  title: title,
                  link: link
                },function(err,inserted){
                  if(err){
                    console.log(err);
                  }
                  else {
                    console.log(inserted);
                  }
                })
               
              }
           
            })
      }
    })
    
    res.redirect("/");
  });

  
  
});

var port = process.env.PORT || '3000';


// Listen on port 3000
app.listen(port, function() {
  console.log("App running on port 3000!");
});
