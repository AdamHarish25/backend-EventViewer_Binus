import Joi from "joi";
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env") });

const emailSchema = Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: false } })
    .lowercase()
    .pattern(/^[a-zA-Z0-9._%+-]+@(binus\.ac\.id|gmail\.com)$/)
    .required()
    .messages({
        "string.email": "Format email tidak valid.",
        "string.pattern.base":
            "Email harus menggunakan domain @binus.ac.id atau @gmail.com.",
        "string.empty": "Email tidak boleh kosong.",
        "any.required": "Email wajib diisi.",
    });

const passwordSchema = Joi.string().min(8).max(30).required().messages({
    "string.min": "Password minimal 8 karakter.",
    "string.max": "Password maksimal 30 karakter.",
    "string.empty": "Password tidak boleh kosong.",
    "any.required": "Password wajib diisi.",
});

const otpSchema = Joi.string().min(6).max(6).required().messages({
    "string.min": "OTP 6 karakter.",
    "string.max": "OTP 6 karakter.",
    "string.empty": "OTP tidak boleh kosong.",
    "any.required": "OTP wajib diisi.",
});

const resetTokenSchema = Joi.string().min(64).max(64).required().messages({
    "string.min": "Reset token tidak valid.",
    "string.min": "Reset token tidak valid.",
    "string.empty": "Reset token tidak boleh kosong.",
    "any.required": "OTP wajib diisi.",
});

export const loginValidatorSchema = Joi.object({
    email: emailSchema,
    password: passwordSchema,
});

export const emailValidatorSchema = Joi.object({
    email: emailSchema,
});

export const passwordValidatorSchema = Joi.object({
    email: emailSchema,
    password: passwordSchema,
    resetToken: resetTokenSchema,
});

export const otpValidatorSchema = Joi.object({
    email: emailSchema,
    otp: otpSchema,
});

export const registerValidatorSchema = Joi.object({
    studentId: Joi.string()
        .length(10)
        .alphanum()
        .optional()
        .allow(null)
        .messages({
            "string.length": "Student ID harus terdiri dari 10 karakter.",
            "string.alphanum":
                "Student ID hanya boleh mengandung huruf dan angka.",
        }),

    role: Joi.string()
        .valid("student", "admin", "super_admin")
        .required()
        .messages({
            "any.only":
                "Role hanya boleh berisi student, admin, atau super_admin.",
            "any.required": "Role wajib diisi.",
        }),

    firstName: Joi.string().min(1).max(20).required().messages({
        "string.min": "First name minimal 1 karakter.",
        "string.max": "First name maksimal 20 karakter.",
        "string.empty": "First name tidak boleh kosong.",
        "any.required": "First name wajib diisi.",
    }),

    lastName: Joi.string().min(1).max(20).required().messages({
        "string.min": "Last name minimal 1 karakter.",
        "string.max": "Last name maksimal 20 karakter.",
        "string.empty": "Last name tidak boleh kosong.",
        "any.required": "Last name wajib diisi.",
    }),

    email: emailSchema,

    password: Joi.string().min(8).max(64).required().messages({
        "string.min": "Password minimal 8 karakter.",
        "string.max": "Password maksimal 64 karakter.",
        "string.empty": "Password tidak boleh kosong.",
        "any.required": "Password wajib diisi.",
    }),

    confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
        "any.only": "Konfirmasi password harus sama dengan password.",
        "any.required": "Konfirmasi password wajib diisi.",
    }),
});
