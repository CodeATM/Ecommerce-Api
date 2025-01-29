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

const passport = require("./src/Controllers/users/passport");
const SwaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const { errorResponse } = require("./src/utils/responseHandler");
const { errorMiddleware } = require("./src/Controllers/ErrorController");
const swaggerDocument = YAML.load("./swagger/swagger.yml");

app.use(helmet());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Try again in an hour, request exeded",
});

app.use("/", limiter);

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);
app.use("/docs", SwaggerUi.serve, SwaggerUi.setup(swaggerDocument));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: ["color", "price", "categories", "size"],
  })
);

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

app.use(passport.initialize());

app.use("/user", require("./src/Routes/userRoutes"));
app.use("/product", require("./src/Routes/productRoutes"));
app.use("/review", require("./src/Routes/reviewRoutes"));
app.use("/collection", require("./src/Routes/collectionRoutes"));
app.use("/wishlist", require("./src/Routes/wishlist"));
app.use("/order", require("./src/Routes/orderCartRoutes"));

app.all("*", (req, res, next) => {
  errorResponse(res, 404, "Not found");
});

app.use(errorMiddleware.handle);

app.listen(PORT, () => {
  console.log(`Backend is running on port ${PORT}`);
});
