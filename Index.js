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
const corsOptions = {
  origin: '*', // Replace with your React app's URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // If your requests include cookies
};

app.use(cors(corsOptions));

// User routes
app.use("/user", UserRouter);


const uri = process.env.MONGO_URL;
const connectWithRetry = () => {
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
    console.log("Database disconnected. Reconnecting...");
    connectWithRetry(); // Attempt to reconnect
  });
};

connectWithRetry();


app.use(ErrorHandler);

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
