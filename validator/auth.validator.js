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
    firstName: Joi.string().min(2).max(20).required().messages({
        "string.empty": "Nama depan wajib diisi.",
        "string.min": "Nama depan minimal 2 karakter.",
        "string.max": "Nama depan maksimal 20 karakter.",
        "any.required": "Nama depan wajib diisi.",
    }),
    lastName: Joi.string().min(2).max(20).required().messages({
        "string.empty": "Nama belakang wajib diisi.",
        "string.min": "Nama belakang minimal 2 karakter.",
        "string.max": "Nama belakang maksimal 20 karakter.",
        "any.required": "Nama belakang wajib diisi.",
    }),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: false } })
        .pattern(/^[a-zA-Z0-9._%+-]+@(binus\.ac\.id|gmail\.com)$/)
        .required()
        .messages({
            "string.email": "Format email tidak valid.",
            "string.pattern.base": "Email harus menggunakan domain @binus.ac.id atau @gmail.com.",
            "string.empty": "Email wajib diisi.",
            "any.required": "Email wajib diisi.",
        }),
    password: Joi.string().min(8).max(30).required().messages({
        "string.min": "Password minimal 8 karakter.",
        "string.max": "Password maksimal 30 karakter.",
        "string.empty": "Password wajib diisi.",
        "any.required": "Password wajib diisi.",
    }),
    role: Joi.string().valid("student", "admin", "super_admin").required().messages({
        "any.only": "Role harus student, admin, atau super_admin.",
        "any.required": "Role wajib diisi.",
    }),
});