const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;
const DATABASE_PATH = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(__dirname, "..", "database", "books.db");

let db;

async function initializeDBAndServer() {
  try {
    db = await open({
      filename: DATABASE_PATH,
      driver: sqlite3.Database,
    });

    console.log("SQLite database connected successfully.");

    app.get("/books/", async (req, res) => {
      try {
        const books = await db.all("SELECT * FROM book ORDER BY id");
        res.status(200).json(books);
      } catch (error) {
        console.error("GET /books/ failed:", error.message);
        res.status(500).json({ error: "Unable to fetch books." });
      }
    });

    app.get("/books/:bookId/", async (req, res) => {
      const bookId = Number(req.params.bookId);
      if (!Number.isInteger(bookId) || bookId <= 0) {
        return res.status(400).json({ error: "bookId must be a positive integer." });
      }

      try {
        const book = await db.get("SELECT * FROM book WHERE id = ?", [bookId]);
        if (!book) {
          return res.status(404).json({ error: "Book not found." });
        }
        res.status(200).json(book);
      } catch (error) {
        console.error("GET /books/:bookId/ failed:", error.message);
        res.status(500).json({ error: "Unable to fetch the book." });
      }
    });

    app.post("/books/", async (req, res) => {
      const { title, author, price, pages } = req.body;
      if (
        typeof title !== "string" || !title.trim() ||
        typeof author !== "string" || !author.trim() ||
        !Number.isInteger(price) || price < 0 ||
        !Number.isInteger(pages) || pages <= 0
      ) {
        return res.status(400).json({
          error: "Provide title, author, non-negative integer price, and positive integer pages.",
        });
      }

      try {
        const result = await db.run(
          "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)",
          [title.trim(), author.trim(), price, pages]
        );
        const newBook = await db.get("SELECT * FROM book WHERE id = ?", [result.lastID]);
        res.status(201).json(newBook);
      } catch (error) {
        console.error("POST /books/ failed:", error.message);
        res.status(500).json({ error: "Unable to create the book." });
      }
    });

    app.put("/books/:bookId/", async (req, res) => {
      const bookId = Number(req.params.bookId);
      const { title, author, price, pages } = req.body;
      if (!Number.isInteger(bookId) || bookId <= 0) {
        return res.status(400).json({ error: "bookId must be a positive integer." });
      }
      if (
        typeof title !== "string" || !title.trim() ||
        typeof author !== "string" || !author.trim() ||
        !Number.isInteger(price) || price < 0 ||
        !Number.isInteger(pages) || pages <= 0
      ) {
        return res.status(400).json({
          error: "Provide title, author, non-negative integer price, and positive integer pages.",
        });
      }

      try {
        const result = await db.run(
          "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?",
          [title.trim(), author.trim(), price, pages, bookId]
        );
        if (result.changes === 0) {
          return res.status(404).json({ error: "Book not found." });
        }
        const updatedBook = await db.get("SELECT * FROM book WHERE id = ?", [bookId]);
        res.status(200).json(updatedBook);
      } catch (error) {
        console.error("PUT /books/:bookId/ failed:", error.message);
        res.status(500).json({ error: "Unable to update the book." });
      }
    });

    app.delete("/books/:bookId/", async (req, res) => {
      const bookId = Number(req.params.bookId);
      if (!Number.isInteger(bookId) || bookId <= 0) {
        return res.status(400).json({ error: "bookId must be a positive integer." });
      }

      try {
        const result = await db.run("DELETE FROM book WHERE id = ?", [bookId]);
        if (result.changes === 0) {
          return res.status(404).json({ error: "Book not found." });
        }
        res.status(200).json({ message: "Book deleted successfully." });
      } catch (error) {
        console.error("DELETE /books/:bookId/ failed:", error.message);
        res.status(500).json({ error: "Unable to delete the book." });
      }
    });

    app.use((req, res) => {
      res.status(404).json({ error: "Route not found." });
    });

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to SQLite database:", error.message);
    process.exit(1);
  }
}

initializeDBAndServer();