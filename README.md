# Lab 2: SQLite database and CRUD routes

**Name:** Gondela Susmitha  
**Registration number:** 252U1R6081  
**Section / Class:** 214-AIML-2B  
**Course:** Backend Development Fundamentals · Year II Term II

## Live link
Not deployed yet. This project is configured to run locally. Deploy it to Render, Railway, or the institute cloud IDE and replace this line with the public URL if deployment is required.

## Objective
Connect an Express server to an SQLite database and provide Create, Read, Update, and Delete (CRUD) operations through HTTP routes.

## Project contents
- `src/server.js` — Express server, database connection, and five CRUD endpoints.
- `database/books.db` — SQLite database containing the `book` table and 10 sample rows.
- `database/schema.sql` — table definition and sample INSERT statements.
- `lab02.postman_collection.json` — requests for testing all five endpoints.
- `.env.example` — example configuration; it contains no secret values.

## Requirements
- Node.js and npm
- SQLite CLI (optional; useful for checking the database)
- Postman (for endpoint testing)

## How to install and run

1. Extract this folder and open it in VS Code.
2. Open the terminal in the `lab-02` folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Optional: copy `.env.example` to `.env` and adjust the port or database path. Do not commit `.env`.

   The application defaults to port `3000` and `database/books.db`. It reads `PORT` and `DATABASE_PATH` environment variables when supplied. The project does not require environment variables to run with the defaults.

5. Start the server with nodemon:

   ```bash
   npm run dev
   ```

   For normal start:

   ```bash
   npm start
   ```

6. The server starts only after the SQLite connection succeeds. Open `http://localhost:3000/books/` to view all books.

## Endpoints

| Method | Path | Description | Success status |
|---|---|---|---|
| GET | `/books/` | Returns all books. | 200 |
| GET | `/books/:bookId/` | Returns one book by ID. | 200 |
| POST | `/books/` | Adds a new book. | 201 |
| PUT | `/books/:bookId/` | Replaces the details of a book. | 200 |
| DELETE | `/books/:bookId/` | Deletes a book by ID. | 200 |

### Example request bodies

**POST `/books/`**

```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "price": 600,
  "pages": 464
}
```

**PUT `/books/1/`**

```json
{
  "title": "The Alchemist - Updated",
  "author": "Paulo Coelho",
  "price": 400,
  "pages": 210
}
```

All queries that use request input use `?` placeholders and parameter arrays to prevent SQL injection. Invalid input returns `400`, missing books return `404`, and unexpected server/database errors return `500`.

## Check the database with SQLite CLI

From the project folder:

```bash
sqlite3 database/books.db
```

Then run:

```sql
.tables
SELECT * FROM book;
SELECT COUNT(*) FROM book;
.quit
```

The included database starts with 10 sample books. POST, PUT, and DELETE requests modify this same database file.

## Postman testing

Import `lab02.postman_collection.json` into Postman. Set the collection variable `baseUrl` to `http://localhost:3000`. Run the requests in this order:
1. Get all books
2. Get book by ID
3. Add a book
4. Update book by ID
5. Delete book by ID

Use an ID that exists in the database for GET, PUT, and DELETE. After POST, PUT, and DELETE, run GET all books or query the SQLite CLI to confirm the database changed.

## Screenshots

The `screenshots/` folder is provided for genuine screenshots from your own Postman and SQLite CLI run. Add screenshots using these names and keep the README image links:

- `get-all-books.png`
- `get-book-by-id.png`
- `post-book.png`
- `put-book.png`
- `delete-book.png`
- `sqlite-database.png`

Example Markdown:

```md
![GET all books response](screenshots/get-all-books.png)
```

**Important:** Screenshots are not fabricated or included as if the endpoints had been run in Postman. Capture the actual responses after starting the server and add them to this folder before final submission.

## Notes: problems faced and solutions

- The server must wait for the database connection. This is handled by `async/await` inside `initializeDBAndServer()`.
- SQL placeholders (`?`) and parameter arrays are used for user-provided values to reduce SQL injection risk.
- Input validation checks the book ID and required book fields before running database queries.
- The `.gitignore` file excludes `node_modules/` and `.env`.

## Viva preparation

**1. Why do we await the database call?**  
We use `await` so the program waits until the database operation finishes. This helps avoid using the database before it is ready and lets us handle errors with `try/catch`.

**2. What is SQL injection and how do placeholders prevent it?**  
SQL injection is an attack where harmful SQL is entered through user input. Placeholders keep input values separate from the SQL command, so the input is treated as data.

**3. When is PUT used instead of POST?**  
POST is used to create a new resource. PUT is used to update or replace an existing resource identified by its ID.
