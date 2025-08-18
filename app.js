import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";

import errorHandler from "./middleware/errorHandler.js";
import router from "./routes/index.js";
import AppError from "./utils/AppError.js";

dotenv.config();

const app = express();

app.set("trust proxy", true);
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 60000 * 60,
        },
    })
);

app.use(router);
app.use("/", (req, res, next) => {
    next(new AppError("Page Not Found", 404, "PAGE_NOT_FOUND"));
});
app.use(errorHandler);

export default app;
