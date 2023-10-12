const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const {use} = require("express/lib/router");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    if (!users[username]) {
        return true;
    }
    return false;
}

const authenticatedUser = (username, password) => { //returns boolean
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password)
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', {expiresIn: 60});

        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.query.review;
    const username = req.user;

    if (!reviewText) {
        return res.status(400).json({ message: "Review text is required." });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Ensure the 'reviews' property exists and is an array
    if (!Array.isArray(books[isbn].reviews)) {
        books[isbn].reviews = [];
    }

    // Find the user's existing review for the book
    const userReview = books[isbn].reviews.find((review) => review.username === username);

    if (userReview) {
        // Modify the existing review
        userReview.reviewText = reviewText;
    } else {
        // Add a new review for the book
        books[isbn].reviews.push({ username, reviewText });
    }

    return res.status(200).json({ message: "Review added or modified successfully." });
});



// Delete a book review by isbn based on the session username
// Delete a book review by isbn based on the session username
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.data; // Access the username from req.user.data
    console.log("username....", username)
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Ensure the 'reviews' property exists and is an array
    if (!Array.isArray(books[isbn].reviews)) {
        books[isbn].reviews = [];
    }
    console.log("reviews....", books[isbn].reviews.data)

    // Filter and delete the reviews based on the session username
    const reviewsToDelete = books[isbn].reviews.filter((review) => review.username.data === username);

    if (reviewsToDelete.length > 0) {
        // Delete the reviews
        books[isbn].reviews = books[isbn].reviews.filter((review) => review.username.data !== username);

        return res.status(200).json({ message: "Review(s) deleted successfully." });
    }

    return res.status(404).json({ message: "Review not found for the specified ISBN and user." });
});




module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
