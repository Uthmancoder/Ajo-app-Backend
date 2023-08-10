const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const { ErrorHandler } = require("./controllers/ErrorHandler");
const UserRouter = require("./Routes/UserRoute");
require("dotenv").config();

// Increase the limit of the request payload size
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use(cors({ origin: "*" }));

// User routes
app.use("/user", UserRouter);


const uri = process.env.MONGO_URL;
const connect = () => {
  mongoose.set("strictQuery", false);

  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;

  db.on("error", (err) => {
    console.error("Error connecting to the database:", err);
  });

  db.on("connected", () => {
    console.log("Database connected");
  });

  db.on("disconnected", () => {
    console.log("Database disconnected");
  });
};

connect();

app.use(ErrorHandler);

// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
