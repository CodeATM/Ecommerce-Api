const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const PORT = 8000;
const path = require("path");
const multer = require("multer");
const xss = require("xss-clean");
const compression = require("compression");
const hpp = require("hpp");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const AppError = require("./src/utils/ErrorHandler");
const globalErrorHandler = require("./src/Controllers/ErrorController");

// app.enable("trust proxy");

app.use(helmet());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Try again in an hour, request exeded",
});

app.use("/", limiter);

app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: ["color", "price", "categories", "size"],
  })
);

// const storage = multer.diskStorage({
//   destination: path.join(__dirname, "public/uploads"), // Fix the typo in "pubic" to "public"
//   filename: (req, file, cb) => {
//     cb(null, new Date().getTime() + path.extname(file.originalname));
//   },
// });

// app.use(multer({ storage }).single("image"));

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`databse connected`));

app.use(compression());

app.get("/", (req, res, next) => {
  res.json({ message: "Hello, welcome to Awelewa's Api" });
});

app.use("/user", require("./src/Routes/userRoutes"));
app.use("/product", require("./src/Routes/productRoutes"));
app.use("/review", require("./src/Routes/reviewRoutes"));
app.use("/order", require("./src/Routes/orderCartRoutes"));

app.all("*", (req, res, next) => {
  next(new AppError(`can't find this route on the server!!!`, 404));
});

app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Backend is running on port ${PORT}`);
});
