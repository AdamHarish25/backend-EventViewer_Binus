import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";

import errorHandler from "./middleware/errorHandler.js";
import router from "./routes/index.js";
import AppError from "./utils/AppError.js";
import "./utils/scheduler.js";

import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

dotenv.config();

const app = express();

// app.set("trust proxy", true);
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "BINUS Event Viewer API",
            version: "1.0.0",
            description:
                "Dokumentasi API lengkap untuk backend aplikasi BINUS Event Viewer.",
        },
        servers: [
            {
                url: "http://localhost:5000",
                description: "Development Server",
            },
        ],
        // Menambahkan definisi komponen reusable (schemas, security schemes, dll)
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description:
                        "Masukkan token JWT yang didapat dari endpoint login. Contoh: 'Bearer {token}'",
                },
            },
            schemas: {
                // Skema untuk User (dari user.model.js)
                User: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        studentId: { type: "string", nullable: true },
                        role: {
                            type: "string",
                            enum: ["student", "admin", "super_admin"],
                        },
                        firstName: { type: "string" },
                        lastName: { type: "string" },
                        email: { type: "string", format: "email" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                // Skema untuk Event (dari event.model.js)
                Event: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        creatorId: { type: "string", format: "uuid" },
                        eventName: { type: "string" },
                        date: { type: "string", format: "date" },
                        startTime: { type: "string", example: "14:30" },
                        endTime: { type: "string", example: "16:30" },
                        location: { type: "string" },
                        speaker: { type: "string", nullable: true },
                        status: {
                            type: "string",
                            enum: [
                                "pending",
                                "revised",
                                "approved",
                                "rejected",
                            ],
                        },
                        imageUrl: { type: "string", format: "uri" },
                    },
                },
                Feedback: {
                    type: "object",
                    required: ["feedback"],
                    properties: {
                        feedback: {
                            type: "string",
                            description:
                                "Pesan feedback atau revisi untuk admin.",
                            minLength: 1,
                            maxLength: 1000,
                            example:
                                "Mohon perbaiki deskripsi acara agar lebih jelas.",
                        },
                    },
                },
                Notification: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        eventId: { type: "string", format: "uuid" },
                        senderId: { type: "string", format: "uuid" },
                        recipientId: { type: "string", format: "uuid" },
                        feedback: { type: "string", nullable: true },
                        payload: {
                            type: "object",
                            description:
                                "Detail data notifikasi, seperti detail event.",
                        },
                        notificationType: {
                            type: "string",
                            enum: [
                                "event_created",
                                "event_updated",
                                "event_deleted",
                                "event_pending",
                                "event_revised",
                                "event_approved",
                                "event_rejected",
                            ],
                        },
                        isRead: { type: "boolean" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                // Skema untuk Error umum
                ErrorResponse: {
                    type: "object",
                    properties: {
                        status: { type: "string", example: "error" },
                        message: { type: "string" },
                        errorCode: { type: "string" },
                    },
                },
                // Skema untuk Error validasi
                ValidationErrorResponse: {
                    type: "object",
                    properties: {
                        status: { type: "string", example: "error" },
                        message: {
                            type: "string",
                            example: "Invalid request data",
                        },
                        errorCode: {
                            type: "string",
                            example: "VALIDATION_ERROR",
                        },
                        errorField: {
                            type: "object",
                            properties: {
                                fieldName: {
                                    type: "string",
                                    example: "Pesan error untuk field ini",
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        customCss: ".swagger-ui .topbar { display: none }",
        customSiteTitle: "Event Viewer API Docs",
    })
);

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
