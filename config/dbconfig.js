import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: "localhost",
        dialect: "mysql",
    }
);

export async function testDBConnection() {
    try {
        await sequelize.authenticate();
        console.log("✅ Koneksi database berhasil!");
    } catch (error) {
        console.error("❌ Gagal koneksi ke database:", error.message);
    }
}
