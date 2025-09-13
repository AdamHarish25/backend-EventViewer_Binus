import nodemailer from "nodemailer";
import dotenv from "dotenv";
import AppError from "./AppError.js";
dotenv.config({ path: "../.env" });

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const checkEmailConnection = async () => {
    try {
        await transporter.verify();
        console.log("✅ Server email siap menerima pesan");
    } catch (error) {
        console.error("❌ Gagal terhubung ke server email\n", error);
        throw new AppError("Gagal terhubung ke server email", 500, "EAUTH");
    }
};

export const sendOTPEmail = async (mailOptions, email) => {
    console.log(`Mengirim email OTP ke ${email}...`);

    const info = await transporter.sendMail(mailOptions);

    console.log("Email berhasil terkirim!");
    console.log("Message ID:", info.messageId);
};
