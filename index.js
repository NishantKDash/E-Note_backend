const connectToMongo = require("./db.js");
const cors = require("cors");
connectToMongo();

const express = require("express");
const app = express();
const port = 5000;

// respond with "hello world" when a GET request is made to the homepage
// app.get('/', (req, res) => {
//   res.send('hello world')
// })
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use("/api/auth", require("./Routes/auth"));
app.use("/api/notes", require("./Routes/notes"));

app.listen(port, () => {
  console.log(`E-note listening at http://localhost:${port}`);
});
