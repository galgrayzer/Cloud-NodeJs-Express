const express = require("express");
const bp = require("body-parser");
const path = require("path");
const handlebars = require("express-handlebars");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);
const csrfProt = require("csurf")();
const multer = require("multer");
const crypto = require("crypto");
const helmet = require("helmet");
const fs = require("fs");
const https = require("https");

const privateKey = fs.readFileSync("private.key", "utf8");
const certificate = fs.readFileSync("certificate.crt", "utf8");
const credentials = { key: privateKey, cert: certificate };

require("dotenv").config(); // writes environment variables to procces

process.stdout.write("\033c"); // clears terminal

const MONGODB_URI = process.env.MONGODB_URI;

// routes
const files = require("./routes/files");
const account = require("./routes/account");
const main = require("./routes/main");

// controllers
const errorController = require("./controllers/errors");

const server = express();

// init handlebars
server.engine("handlebars", handlebars.create().engine);
server.set("view engine", "handlebars");

// set views folder
server.set("views", path.join(__dirname, "..", "frontend", "views"));

// init body-parser
server.use(bp.urlencoded({ extended: false, limit: "50mb" }));

// reffererPolicy
server.use(
  helmet.referrerPolicy({
    policy: "no-referrer-when-downgrade",
  })
);

// multer - handle files
const fileStorge = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "data"));
  },
  filename: (req, file, cb) => {
    file.originalname = Buffer.from(file.originalname, "latin1").toString(
      "utf8"
    );
    cb(
      null,
      new Date().toISOString().replace(/:/g, "_") + "&" + file.originalname
    );
  },
});
server.use(multer({ storage: fileStorge }).single("file"));

// init static folder
server.use(express.static(path.join(__dirname, "..", "frontend", "public")));

// init sessions
const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: "sessions",
  clear_interval: 300,
});
server.use(
  session({
    secret: crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 5 * 60 * 60 * 1000 }, // 5 hours
    store: store,
  })
);

// csrf attack prot
server.use(csrfProt);

// set locals in session
server.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.userAuth = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  res.locals.gId = process.env.GOOGLE_CLIENT_ID;
  next();
});

// use routes
server.use(files);
server.use(account);
server.use(main);

// 404 Error
server.use("/", errorController.e404);

// https
const httpsServer = https.createServer(credentials, server);

// init MongoDb database - mongoose
mongoose.set("strictQuery", true);
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    httpsServer.listen(process.env.PORT);
    // server.listen(process.env.PORT);
    console.log("App is runing on - " + process.env.PUBLIC_URL);
  })
  .catch((err) => console.log(err));
