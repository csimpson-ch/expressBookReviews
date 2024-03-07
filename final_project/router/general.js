const express = require('express');
const axios = require('axios').default;

// get data on all books
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Task 6: registering a new user
public_users.post("/register", (req, res) => {

  // get the username and password from the body contents
  const username = req.body.username;
  const password = req.body.password;
  
  // only register the user if a non-null username and password are present
  if (username && password) {
  
    // check if the username already exists
    let users_with_same_username = users.filter((user)=>{return user.username === username});
    if (users_with_same_username.length == 0) {
      is_username_new = true; 
    } else {
      is_username_new = false;
    }

    // register new username
    if (is_username_new) {
        
        // is user doesnt exist, add to array using push
        users.push({"username":username, "password":password});
  
        // return a success message
        return res.status(200).json({message: "User successfully registered. Now you can login"});
    }
    
    // username already exists, so return error message
    else {
      return res.status(404).json({message: "Unable to register user: username already exists."});    
    }
  }

  // cant register user if username and password not both present
  else {
    return res.status(404).json({message: "Unable to register user: provide both a username and password."});
  }
});


// Task 1: Get the book list available in the shop
// Task 10: make it async using promises
public_users.get('/', async function (req, res) {

  // try to get list of all books using helper function
  try {
    const books = await getBooksList();
    res.send(JSON.stringify(books, null, 4))
  }

  // catch any errors in processing request
  catch (error) {
    res.send(500).json({message: "Unable to retrieve all books"})
  }
});

const getBooksList = () => {
  return new Promise(function(resolve, reject) {
    
    // set a 1 sec timeout
    setTimeout(() => {
      
      // resolve if books is true, otherwise reject
      books
        ? resolve(books)
        : reject(new Error("Unable to retrieve all books"))
    }, 1000);
  })
}


// Task 2: Get book details based on ISBN
// Task 11: make it async using promises
public_users.get('/isbn/:isbn', async function (req, res) {

  // try to get a specific book using ISBN
  try {
    const book = await getBookByISBN(req.params.isbn);
    return res.send(JSON.stringify(book, null, 4))
  }

  // book was not retrieved
  catch (error) {
    return res.status(300).json({message: "Book not found"});
  }
});

const getBookByISBN = (isbn) => {
  return new Promise(function(resolve, reject) {
    
    // set a 1 sec timeout
    setTimeout(() => {
      // set the book to return
      let book = books[isbn];

      // resolve if book is true, otherwise reject
      book
        ? resolve(book)
        : reject(new Error("Unable to retrieve book"))
    }, 1000);
  })
}


// Task 3: Get book details based on author
// Task 12: make it async using promises
public_users.get('/author/:author', async function (req, res) {

  // attempt to find books for this author
  try {
    const books_by_author = await getBooksByAuthor(req.params.author)
    return res.send(JSON.stringify(books_by_author, null, 4))
  }

  // unable to retrieve books for this author
  catch (error) {
    return res.status(500).json({message: "Unable to retrieve books"});
  }
});

const getBooksByAuthor = (author) => {
  return new Promise(function(resolve, reject) {
    
    // set a 2 sec timeout
    setTimeout(() => {

      // create initialised list of books
      let books_by_author = []

      // iterate through all keys, if author matches, add to set of books
      for (key of Object.keys(books)) {
        if (author == books[key]["author"]) {
          books_by_author.push({key: books[key]});
        }
      }

      // resolve if at least one book was found, otherwise reject
      books_by_author.length > 0
        ? resolve(books_by_author)
        : reject(new Error("Unable to retrieve book"))
    }, 2000)
  })
}


// Task 4: Get all books based on title
public_users.get('/title/:title',function (req, res) {

    // get all keys from book object
    let all_keys = Object.keys(books);

    // set requested title
    let requested_title = req.params.title;
  
    // create boolean to track if book was found
    let is_found = false;
  
    // create a variable to track specific book
    var specific_book;
  
    // iterate through all keys
    for (key of all_keys) {
  
      // author for book associated with current key
      let current_title = books[key]["title"];
  
      // check if requested author matches requested
      if (requested_title === current_title) {
        is_found = true;
        specific_book = books[key];
        break;
      }
    }
  
    // if book was found, return its information
    if (is_found) {
      res.send(JSON.stringify(specific_book, null, 4))
    } 
    
    // otherwise return error
    else {
      return res.status(300).json({message: "Book not found"});
    }

});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {

  // use isbn from req params to retrieve specific book
  let specific_book = books[req.params.isbn]

  // if book isbn present, return book information
  if (specific_book) {

    // retrieve book review from specific book
    specific_review = specific_book["reviews"]

    // return the review information
    res.send(specific_review)
  }

  // if book isbn not present, return error message
  else {
    return res.status(300).json({message: "Book not found"});
  }
});








module.exports.general = public_users;
