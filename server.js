const express = require("express");
const path = require("path");
const { readFile, writeFile } = require("fs").promises;
const { v4: uuidv4 } = require("uuid");

const PORT = process.env.PORT || 3001;

const app = express();

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static("public"));

// Define HTML GET Routes

// GET /notes route to serve the notes.html file
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/notes.html"))
);

// GET / route to serve the index.html file
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

// Define API GET Route

// GET /api/notes route to read the db.json file and return all saved notes as JSON
app.get("/api/notes", (req, res) => {
  readFile("db/db.json").then((data) => {
    res.send(data);
  });
});

// Define API POST Route

// POST /api/notes route to receive a new note, add it to db.json, and return the new note
app.post("/api/notes", (req, res) => {
  // The request body contains the new note information
  const newNote = req.body;
  // Generate a unique ID for the new note
  newNote.id = uuidv4();

  // Read the existing notes from db.json
  readFile("db/db.json").then((data) => {
    // Parse the JSON data into a JavaScript array
    const parseData = JSON.parse(data);
    // Add the new note to the array
    parseData.push(newNote);
    // Write the updated data back to db.json
    writeFile("db/db.json", JSON.stringify(parseData)).then(() => {
      // Respond with the updated data (including the new note)
      res.json(parseData);
    });
  });
});

// Define API DELETE Route

// DELETE /api/notes/:id route to delete a note by its ID
app.delete("/api/notes/:id", (req, res) => {
  const noteId = req.params.id;

  // Read the existing notes from db.json
  readFile("db/db.json").then((data) => {
    // Parse the JSON data into a JavaScript array
    const parsedData = JSON.parse(data);
    // Filter out the note with the specified ID
    const updatedData = parsedData.filter((note) => note.id !== noteId);
    // Write the updated data back to db.json
    writeFile("db/db.json", JSON.stringify(updatedData)).then(() => {
      // Respond with a success status code (204: No Content) if the deletion is successful
      res.sendStatus(204);
    });
  });
});

// Start the server
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
