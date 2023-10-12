const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const bookApiUrl = 'http://localhost:5000';

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username and password are provided in the request body
    if (!username || !password) {
        return res.status(400).json({message: "Both username and password are required."})
    }

    // Check if the username already exists
    if (!isValid(username)) {
        return res.status(400).json({message: "Username already exists. Choose a different username."});
    }

    // If username is unique, add the user to the 'users' database
    users.push({"username":username,"password":password});

    return res.status(201).json({message: "User registered successfully."});

});

// Get the book list available in the shop
/*public_users.get('/', function (req, res) {
    res.send(JSON.stringify(books, null, 4))
});*/

// Get the list of books available in the shop
public_users.get('/', async (req, res) => {
    try {
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Get book details based on ISBN
/*public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn])
});*/
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    try {
        if (books[isbn]) {
            res.send(books[isbn]);
        } else {
            res.status(404).json({ message: 'Book not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while fetching book details.' });
    }
});


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const booksByAuthor = [];

    for (const bookId in books) {
        const book = books[bookId]
        if (book.author === author) {
            booksByAuthor.push(book)
        }
    }

    if (booksByAuthor.length > 0) {
        return res.status(200).json({books: booksByAuthor})
    } else {
        return res.status(400).json({message: "No book found for specified author."})
    }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;

    try {
        const booksByTitle = [];

        for (const bookId in books) {
            const book = books[bookId];

            if (book.title === title) {
                booksByTitle.push(book);
            }
        }

        if (booksByTitle.length > 0) {
            res.status(200).json({ books: booksByTitle });
        } else {
            res.status(400).json({ message: 'No book found for specified title.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while fetching book details by title.' });
    }
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const reviewsForBook = books[isbn];

    if (reviewsForBook) {
        return res.status(200).json({reviews: reviewsForBook});
    } else {
        return res.status(404).json({message: "No reviews found for the specified ISBN."});
    }

});


module.exports.general = public_users;
