const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 4200;
const cors = require("cors");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/api/something", (req, res) => {
  res.json({ ping: "hi!" });
});

const path = require("path");
// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, "frontend/build")));
// Anything that doesn't match the above, send back index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/frontend/build/index.html"));
});

app.listen(PORT, function() {
  console.log("Server is running on Port: ", PORT);
});
