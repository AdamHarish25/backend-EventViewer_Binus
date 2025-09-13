import dotenv from "dotenv";
import app from "./app.js";
import { testDBConnection } from "./config/dbconfig.js";
import { checkEmailConnection } from "./utils/emailSender.js";
import socketService from "./socket/index.js";
import http from "http";

dotenv.config();

const startServer = async () => {
    try {
        // await checkEmailConnection();
        await testDBConnection();

        const server = http.createServer(app);
        socketService.init(server);

        server.listen(process.env.PORT, () => {
            console.log(
                `Server listening on http://localhost:${process.env.PORT}`
            );
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

startServer();
