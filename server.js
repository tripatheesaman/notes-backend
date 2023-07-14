require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();
const path = require("path");
const { logger, logEvents } = require("./middleware/logger");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/errorhandler");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const mongoose = require("mongoose");
const connectDB = require("./config/databaseConnection");
const PORT = process.env.PORT || 3500;
connectDB();
app.use(logger);
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "public")));
app.use("/", require("./routes/root"));
app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/notes", require("./routes/noteRoutes"));

app.all("*", (req, res) => {
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});
app.use(errorHandler);
mongoose.connection.once("open", (err, db) => {
  app.listen(PORT, (req, res) => {
    console.log("Connected to MongoDB");
    console.log(`This server is running on port ${PORT}`);
  });
});
mongoose.connection.on("error", (err) => {
  console.log(error);
  logEvents(
    `${err.no}\t${err.code}\t${err.syscall}\t${err.hostname}\n`,
    "MongoDBErrLog.log"
  );
});
