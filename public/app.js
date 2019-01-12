// is getJson automatically for localhost:3000 index
// Grab the articles as a json
// $.getJSON("/articles", function(data) {
//   // For each one
//   for (var i = 0; i < data.length; i++) {
//     // Display the information on the page
//     $("#articles").append("<p class='articles' data-id='" + data[i]._id + "'>" + "<b>Title:  </b>" + data[i].title + "<br />" + "Link:  <a href='" + data[i].link + "' target='_blank'>" +data[i].link + "</a><br />" + "Summary:  " + data[i].summary + "</p>");
//   }
// });



// function getResults(articleFK) {
//   // Empty any results currently on the page
//   $("#results").empty();
//   // Grab all of the current notes
  
//   $.ajax({
//       method: "GET",
//       url: "/articles/" + articleFK
//     })
//     .then(function(data) {
//     // For each note...
//     for (var i = 0; i < data.length; i++) {
//       // ...populate #results with a p-tag that includes the note's title and object id
//       $("#results").prepend("<p class='data-entry' data-id=" + data[i]._id + "><span class='dataTitle' data-id=" +
//         data[i]._id + ">" + data[i].notetitle + "</span><span class=delete>X</span></p>");
//     }
//   });
// }

function getResults(articleFK) {
  // Empty any results currently on the page
  $("#results").empty();
  // Grab all of the current notes
  
  $.ajax({
      method: "GET",
      url: "/articles/" + articleFK
    })
    .then(function(data) {
    // For each note...
for (var i = 0; i < data.note.length; i++) {
  //KEYY   IS THIS ALLOWED, LOOKS LIKE IT. 
  // $("#results").prepend("<p class='data-entry' data-id=" + data[i].note._id + "><span class='dataTitle' data-id=" +
    // data[i].note._id + ">" + data[i].note.title + "</span><span class=delete>X</span></p>");
    $("#results").prepend("<p class='data-entry' data-id=" + data.note[i]._id + "><span class='dataTitle' data-id=" +
    data.note[i]._id + ">" + data.note[i].title + "</span><span class=delete>  X</span></p>");
 }
  });
}




// Whenever someone clicks a p tag
$(document).on("click", "p.articles", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
     // getResults(data._id);


     
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input type='text' id='note-title' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='note-body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      
      // THIS APPENDS THE NOTE WITH TEH ARTICLE DATA._ID
      $("#notes").append("<button data-id='" + data._id + "' id='make-new'>Submit</button>");
      
      getResults(data._id);
      // //ASSUMING DATA.NOTE IS ALLOWED BECAUSE IT IS REFERENCED IN ARTICLE~  DON'T KNOW IF THE ID IS AUTO-GENERATED OR IF IT CAN BE ASSIGNED WITH MAKE-NEW FXN
      // for (var i = 0; i < data.note.length; i++) {
      //  //KEYY   IS THIS ALLOWED, LOOKS LIKE IT. 
      //  // $("#results").prepend("<p class='data-entry' data-id=" + data[i].note._id + "><span class='dataTitle' data-id=" +
      //    // data[i].note._id + ">" + data[i].note.title + "</span><span class=delete>X</span></p>");
      //    $("#results").prepend("<p class='data-entry' data-id=" + data.note[i]._id + "><span class='dataTitle' data-id=" +
      //    data.note[i]._id + ">" + data.note[i].title + "</span><span class=delete>  X</span></p>");
      // }
     
    });
});



$(document).on("click", "#make-new", function() {
  // AJAX POST call to the submit route on the server
  // This will take the data from the form and send it to the server
  
var thisId = $(this).attr("data-id");

   // Run a POST request to change the note, using what's entered in the inputs
   $.ajax({
     method: "POST",

     //thisId is the id from the article, making the note id and the article id equal
     url: "/notes/" + thisId,
     data: {
       ///ISSS THIS ALLOWWWWEEEDDD IN MONGOOSE/ MONGODB???   CAN YOU ASSIGN IDS OR ARE THEY ONLY AUTO GENERATED & YOU HAVE TO SOMEHOW DO A FOREIGN KEY
      fk: thisId,
      // Value taken from title input
      title: $("#note-title").val(),
      // Value taken from note textarea
      body: $("#note-body").val()
    }
  })
 

  // If that API call succeeds, add the title and a delete button for the note to the page
    .then(function(data) {
    // Add the title and delete button to the #results section
      console.log(data);
      //NOTE UNLIKE THE ARTICLE GET, the note GET is data._id rather than data.note._id;  also clearing and repopulating

      getResults(data._id);
      // Clear the note and title inputs on the page
      $("#note-body").val("");
      $("#note-title").val("");
    });
});

// // When the #clear-all button is pressed
// $("#clear-all").on("click", function() {
//   // Make an AJAX GET request to delete the notes from the db
//   $.ajax({
//     type: "GET",
//     dataType: "json",
//     url: "/clearall",
//     // On a successful call, clear the #results section
//     success: function(response) {
//       $("#results").empty();
//     }
//   });
// });


// When user clicks the delete button for a note
$(document).on("click", ".delete", function() {
  // Save the p tag that encloses the button
  var selected = $(this).parent();
  console.log(selected);
  // Make an AJAX GET request to delete the specific note
  // this uses the data-id of the p-tag, which is linked to the specific note
  $.ajax({
    type: "DELETE",
    url: "/notes/" + selected.attr("data-id"),

    // On successful call
    success: function(response) {
      // Remove the p-tag from the DOM
      selected.remove();
      // Clear the note and title inputs
      $("#note-body").val("");
      $("#note-title").val("");
      // Make sure the #action-button is submit (in case it's update)
      $("#make-new").html("<button id='make-new'>Submit</button>");
    }
  });
});

// When user click's on note title, show the note, and allow for updates
$(document).on("click", ".dataTitle", function() {
  // Grab the element
  var selected = $(this);
  // Make an ajax call to find the note
  // This uses the data-id of the p-tag, which is linked to the specific note
  $.ajax({
    type: "GET",
    url: "/notes/" + selected.attr("data-id"),
    success: function(dbNote) {
      console.log(dbNote);
      // Fill the inputs with the data that the ajax call collected
      $("#note-body").val("");
      $("#title-body").val("");

      $("#note-body").val(dbNote.body);
      $("#note-title").val(dbNote.title);
      // Make the #action-button an update button, so user can
      // Update the note s/he chooses
      
      // $("#make-new").html("<button id='updater' data-id='" + data._id + "'>Submit</button>");
     getResults(dbNote.fk);
    }
  });
});

// When user click's update button, update the specific note
$(document).on("click", "#updater", function() {
  // Save the selected element
  var selected = $(this);
  // Make an AJAX POST request
  // This uses the data-id of the update button,
  // which is linked to the specific note title
  // that the user clicked before
  $.ajax({
    type: "PUT",
    url: "/notes/" + selected.attr("data-id"),
    dataType: "json",
    data: {
      title: $("#note-title").val(),
      note: $("#note-body").val()
    },
    // On successful call
    success: function(dbNote) {
      // Clear the inputs
      $("#note-body").val("");
      $("#note-title").val("");
      // Revert action button to submit
      $("#action-button").html("<button id='make-new'>Submit</button>");
      // Grab the results from the db again, to populate the DOM
      getResults(dbNote.fk);
    }
  });
});




// // When you click the savenote button
// $(document).on("click", "#savenote", function() {
//   // Grab the id associated with the article from the submit button
//   var thisId = $(this).attr("data-id");

//   // Run a POST request to change the note, using what's entered in the inputs
//   $.ajax({
//     method: "POST",
//     url: "/notes/" + thisId,
//     data: {
//       // Value taken from title input
//       title: $("#titleinput").val(),
//       // Value taken from note textarea
//       body: $("#bodyinput").val()
//     }
//   })
//     // With that done
//     .then(function(data) {
//       // Log the response
//       console.log(data);
//       // Empty the notes section
//       //$("#notes").empty();
//     });

//   // Also, remove the values entered in the input and textarea for note entry
//   //$("#titleinput").val("");
//   //$("#bodyinput").val("");
// });

// $(document).on("click", "#deletenote", function() {
//   // Grab the id associated with the article from the submit button
//   var thisId = $(this).attr("data-id");

//   // Run a DELETE request to change the note, using what's entered in the inputs
//   $.ajax({
//     method: "REMOVE",
//     url: "/notes/" + thisId,
//     //data: {
//       // Value taken from title input
//       //title: $("#titleinput").val(),
//       // Value taken from note textarea
//       //body: $("#bodyinput").val()
//     //}
//   })
//     // With that done
//     .then(function(data) {
//       // Log the response
//       console.log(data);
//       // Empty the notes section
//       //$("#notes").empty();
//     });


    
//   // Also, remove the values entered in the input and textarea for note entry
//   //$("#titleinput").val("");
//   //$("#bodyinput").val("");
  // });










