process.env.NODE_ENV === "test"

const db = require('./db')
const request = require('supertest')
const app = require('./app')
const Book = require("./models/book");

describe('Test book routes', function() {

    beforeEach(async function () {
        await db.query(`DELETE FROM books`)
        let book1 = await Book.create({
            "isbn": "0691161518",
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Matthew Lane",
            "language": "english",
            "pages": 264,
            "publisher": "Princeton University Press",
            "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            "year": 2017
        })
        let book2 = await Book.create({
            "isbn": "1234567890",
            "amazon_url": "http://a.co/oplXtB5",
            "author": "Greta Vanwinkle",
            "language": "english",
            "pages": 700,
            "publisher": "Clearing House",
            "title": "Hiking n Stuff",
            "year": 2005
        })

    })
    test('Invalid link results in 404', async() => {
        const resp = await request(app).get('/not-real')
        expect(resp.statusCode).toBe(404)
        expect(resp.body).toEqual(expect.objectContaining({'error': expect.any(Object)}))
    })
    test('GET /books', async () => {
        const resp = await request(app).get('/books')
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual(expect.objectContaining({books: expect.any(Array)}))
        expect(resp.body.books.length).toEqual(2)
    })
    test('GET /books/:isbn', async () => {
        const resp = await request(app).get('/books/0691161518')
        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual(expect.objectContaining({
            book: {
                isbn: expect.any(String),
                amazon_url: expect.any(String),
                author: expect.any(String),
                language: expect.any(String),
                pages: expect.any(Number),
                publisher: expect.any(String),
                title: expect.any(String),
                year: expect.any(Number)
            }
        }))
    })
    test('GET /books/:isbn - invalid isbn returns error', async() => {
        const resp = await request(app).get('/books/123')
        expect(resp.statusCode).toBe(404)
        expect(resp.body).toEqual(expect.objectContaining({'error': expect.any(Object)}))
    })
    test('POST /books', async () => {
        const resp = await request(app).post('/books').send({
            "isbn": "192353287",
            "amazon_url": "http://a.co/sdgkfg81",
            "author": "Dr. Suess",
            "language": "english",
            "pages": 24,
            "publisher": "Silly Publishings",
            "title": "Silly Riddles",
            "year": 1998
        })
        expect(resp.statusCode).toBe(201)
        expect(resp.body).toEqual(expect.objectContaining({book : expect.any(Object)}))
    })
    test ('POST /books - invalid schema returns error', async () => {
        const resp = await request(app).post('/books').send({"isbn": "12312323123"})
        expect(resp.statusCode).toBe(400)
    })
    test('PUT /books/:isbn', async () => {
        // changed page number
        const resp = await request(app).put('/books/0691161518').send({           
        "amazon_url": "http://a.co/eobPtX2",
        "author": "Matthew Lane",
        "language": "english",
        "pages": 265,
        "publisher": "Princeton University Press",
        "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
        "year": 2017
    })
    // check pages was actually updated
    expect(resp.body.book).toHaveProperty('pages', 265)
    })
    test('PUT /books/:isbn - invalid schema returns error', async () => {
        const resp = await request(app).put('/books/0691161518').send({
            "isbn": "0691161518",
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Matthew Lane",
            "language": "english",
            "pages": 264,
            "publisher": "Princeton University Press",
            "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            "year": 2017
        })
        expect(resp.statusCode).toBe(400)
    })
    test('DELETE /books/:isbn', async () => {
        const resp = await request(app).delete('/books/0691161518')
        expect(resp.statusCode).toEqual(200)
        expect(resp.body).toEqual({message: "Book deleted"})
    })
    test('DELETE /books/:isbn - invalid isbn returns error', async () => {
        const resp = await request(app).delete('/books/123')
        expect(resp.statusCode).toEqual(404)
        expect(resp.body.error.message).toEqual('There is no book with an isbn 123')
    })  
})

afterAll(async function() {
    await db.end();
  });


