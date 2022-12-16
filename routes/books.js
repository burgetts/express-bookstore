const express = require("express");
const Book = require("../models/book");
const jsonschema = require('jsonschema');
const bookSchema = require('../schemas/bookSchema')
const bookUpdateSchema = require('../schemas/bookUpdateSchema')
const ExpressError = require('../expressError')

const router = new express.Router();


/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:id", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.id);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook} */ 

router.post("/", async function (req, res, next) {
  try {
    // validate new book
    const result = jsonschema.validate(req.body, bookSchema)
    if (!result.valid) {
      let listOfErrors = result.errors.map(err => err.stack)
      let error = new ExpressError(listOfErrors, 400)
      return next(error)
    }
    const book = req.body
    const resp = await Book.create(book);
    return res.status(201).json({ book });
  } catch (err) {
    return next(err);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  (cannot change isbn) */

router.put("/:isbn", async function (req, res, next) {
  try {
    // validate book
    if (req.body.isbn) {
      let error = new ExpressError("Not allowed to change isbn", 400)
      next(error)
    }
    let result = jsonschema.validate(req.body, bookUpdateSchema)
    if (!result.valid) {
      let errors = result.errors.map(err => err.stack)
      let newError = new ExpressError(errors, 400)
      return next(newError)
    }
    const book = await Book.update(req.params.isbn, req.body);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
