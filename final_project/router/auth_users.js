const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// initially have no registered users
let users = [];

// Task 7: check if the username is valid. Returns a boolean.
const isValid = (username) => { 
  if (users.filter((user)=>{return user.username === username}).length == 0) {
    return true; 
  } else {
    return false;
  }
}

// Task 7: check if username and password match the one we have in records. Returns a boolean.
const authenticatedUser = (username, password) => { 
  // return an array of users with matching username and password
  let validusers = users.filter((user)=>{return (user.username === username && user.password === password)});

  // return true if at least one valid user, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}


// Task 7: only registered users can login
regd_users.post("/login", (req, res) => {

  // get username and password from the body contents
  const username = req.body.username;
  const password = req.body.password;

  // if username or password dont exist, cant login
  if (!username || !password) {
    return res.status(404).json({message: "Error logging in"});
  }

  // if authenticated user is true, based on func call, create session authorisation
  if (authenticatedUser(username, password)) {
    
    // use jwt.sign to create an access token, I'll create for one day since I don't want to refresh
    let accessToken = jwt.sign({data: password}, 'access', {expiresIn: 24 * 60 * 60});

    // create session authorisation, containing access token and username
    req.session.authorization = {accessToken, username}

    // return a successful status and message
    return res.status(200).send("User successfully logged in");
  }
  
  // if user is not authenticated, display error message
  else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }

});

// Task 8: add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

  // use the isbn to get the book to update
  let book_to_update = books[req.params.isbn]

  // only add review if the book exists
  if (book_to_update) {
    
    // get the review from the query
    let new_review = req.query.reviews;

    // generate a unique ID for the review, based on session username
    let new_id = req.session.authorization.username;
    
    // add the new review to the existing book
    book_to_update["reviews"][new_id] = new_review

    // delete old dictionary entry, add new one
    delete(books[req.params.isbn])
    books[req.params.isbn] = book_to_update

    // return a successful status and message
    return res.status(200).send("Review added to book with ISBN " + (req.params.isbn));
  }
  else {
    return res.status(300).json({message: "Book not found"});
  }
});


// Task 9: deleting a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {

  // get username for this session
  let current_username = req.session.authorization.username;

  // define var
  var current_book;

  // initialise variable to delete book
  is_deleted = false

  // iterate through each book
  for (books_key of Object.keys(books)) {

    // current book
    current_book = books[books_key];
    
    // iterate through all reviews of current book
    for (reviews_key of Object.keys(current_book["reviews"])) {

      // if review belongs to current user, delete it
      if (reviews_key === current_username) {
        delete(current_book["reviews"][reviews_key]);

        is_deleted = true
      }
    }
  }

  if (is_deleted) {
    return res.status(200).send("Review deleted for book with ISBN " + (req.params.isbn) + " for user " + (current_username));
  }
  else {
    return res.status(300).json({message: "No reviews deleted"});
  }
})


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
