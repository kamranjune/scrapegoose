var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");
//models/index.js
//var PORT = 3000;
PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
//mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });

//mongoose.connect("mongodb://localhost/mongoHeadlines", { useNewUrlParser: true });

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
//var MONGODB_URI = "mongodb://localhost/mongoHeadlines";
//WHAT IS THE MONGODB URL?   userNewUrlParser: true for heroku??


//MONGOOOOOOOOOOOOOOOOOOOOSEEEEEEE
//mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

mongoose.connect(MONGODB_URI);

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.sandiegouniontribune.com/news/transportation/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("section.trb_outfit_group_list_item_body").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children('h3.trb_outfit_relatedListTitle').text();
      
      result.link = "https://www.sandiegouniontribune.com/news/transportation" +   
        $(this).children('h3.trb_outfit_relatedListTitle').children().attr('href');

         
    // $("h3.trb_outfit_relatedListTitle").each(function(i, element) {
      
    //   // Save an empty result object
    //   var result = {};

    //   // Add the text and href of every link, and save them as properties of the result object
    //   result.title = $(this).text();
      
    //   result.link = "https://www.sandiegouniontribune.com/news/transportation" +   
    //     $(element).children().attr("href");

      result.summary = $(this).children("p.trb_outfit_group_list_item_brief").text().substring(0,90) + "...";
         
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    
   .populate("note")   
   ///////////////
    //does this link to the note ref and then populate the db view with everything in Note or just id?
    //why is the note type     type: Schema.Types.ObjectId,  ObjectID  when it is referenced by Name Note
    //does the note object have to be in an array in the article schema?
    //rather than populateing I just call a seperate notes/:id route and link to that server.
    //    article id and then populate note vs.    call article and then call note with that fk

    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/notes/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  console.log(req.body)
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      //I THOUGH THIS WAS DONE AUTOMATICALLY BY REF.
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push:{ note: dbNote._id }}, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get("/notes/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  console.log(req.body)
  db.Note.findOne({ _id: req.params.id })
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      //I THOUGH THIS WAS DONE AUTOMATICALLY BY REF.
    res.json(dbNote)
    })
    
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.delete("/notes/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.findByIdAndRemove(req.params.id)
    
    .then(function() {
      // If we were able to successfully update an Article, send it back to the client
      res.json({});
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});



//can you combine mongodb with mongoose?   
//mongo [client] vs. mongod [name of app which is db] vs. mongoose [orm]
//why is delete done with the app.get route rather than app.delete in item 12?
//mongoose url path = db? table?  in schema?
//  ref?   need a way to have a foreign key to the note associated with the article ~  _id of article vs. _id of note
// call the function with the article data._id sent as a parameter in getresults(data._id)  this is the article id
//in the function I have it as fucntions getresults(thisId) which is equal to data._id of the article



//add app.delete


//{ useNewUrlParser: true });  with Heroku mLab?

//why index.js in models?


//$.ajax....method vs. $.getJSON  vs. $.get  

//don't have to put array brackets in schema?


//$ajax . then   vs. $ajax  sucess:     what is the predicate to a promise called and what are the different types


//  .populate("note")   
    //does this link to the note ref and then populate the db view with everything in Note or just id?
    //why is the note type     type: Schema.Types.ObjectId,  ObjectID  when it is referenced by Name Note
    //does the note object have to be in an array in the article schema?
    //rather than populateing I just call a seperate notes/:id route and link to that server.
    //    article id and then populate note vs.    call article and then call note with that fk



//what is _v: 0 } in captain morgan?
    
//  array brackets vs. no array brackets needed in schema,  
    //   cf. Activity 20 data[i].title  
    //   cf. Note ref with array brackets

    //data comes back as an array but it is not saved to the db through the schema or otherwise as an array
    //i.e. array is the response, not an array in the mongo db~


  // can you define ids in the articlee schema, i guess you wouldn't want to bc of auto increment
  //but theoretically.