const express = require("express");
const { ObjectId } = require("mongodb");
const { connectToDb, getDb } = require("./db");

// Initialize Express app
const app = express();
// Middleware to parse JSON
app.use(express.json());

// Database connection
let db;
connectToDb((err) => {
  if (!err) {
    // If the database connection is successful, start the server
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
    // Get the connected database
    db = getDb();
  }
});

// Route: Get all books (limited to 2, sorted by author)
app.get("/books", (req, res) => {
  let books = [];
  // Retrieve all books from the "books" collection, limit to 2, and sort by author
  db.collection("books")
    .find()
    .sort({ author: 1 })
    .limit(2)
    // Iterate through the result and push each book to the 'books' array
    .forEach((book) => books.push(book))
    // Once all books are retrieved, send them as a JSON response
    .then(() => res.status(200).json(books))
    // Handle any errors
    .catch((err) => res.status(500).json({ error: err }));
});

// Route: Get a single book by ID
app.get("/books/:id", (req, res) => {
  // Check if the provided ID is valid
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  // Find a single book by ID in the "books" collection
  db.collection("books")
    .findOne({ _id: new ObjectId(req.params.id) })
    // Once the book is found, send it as a JSON response
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.status(200).json(book);
    })
    // Handle any errors
    .catch((err) => res.status(500).json({ error: "Internal Server Error" }));
});

// Route: Add a new book
app.post("/books", (req, res) => {
  // Check if the book data is valid
  if (!req.body.title || !req.body.author) {
    return res.status(400).json({ error: "Data is not valid" });
  } else {
    // Insert the new book into the "books" collection
    db.collection("books")
      .insertOne(req.body)
      // Once the book is inserted, send the result as a JSON response
      .then((result) => res.status(200).json(result))
      // Handle any errors
      .catch((err) =>
        res.status(500).json({ error: "Could Not create a new document" })
      );
  }
});

// Route: Delete a book by ID
app.delete("/books/:id", (req, res) => {
  // Check if the provided ID is valid
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  // Delete a book by ID from the "books" collection
  db.collection("books")
    .deleteOne({ _id: new ObjectId(req.params.id) })
    // Check if any book was deleted, and send the result as a JSON response
    .then((result) => {
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.status(200).json(result);
    })
    // Handle any errors
    .catch((err) => res.status(500).json({ error: "Internal Server Error" }));
});

// Route: Update a book by ID
app.patch("/books/:id", (req, res) => {
  // Check if the provided ID is valid
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  // Check if the book data is valid
  if (!req.body.title || !req.body.author) {
    return res.status(400).json({ error: "Data is not valid" });
  } else {
    // Update a book by ID in the "books" collection
    db.collection("books")
      .updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { title: req.body.title, author: req.body.author } }
      )
      // Check if any book was updated, and send the result as a JSON response
      .then((result) => {
        if (result.modifiedCount === 0) {
          return res.status(404).json({ error: "Book not found" });
        }
        res.status(200).json(result);
      })
      // Handle any errors
      .catch((err) => res.status(500).json({ error: "Internal Server Error" }));
  }
});
