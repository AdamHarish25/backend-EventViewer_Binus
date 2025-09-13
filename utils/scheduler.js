import cron from "node-cron";
import { runCleanupTasks } from "../service/cleanup.service.js";

console.info("Task scheduler initialized.");

// Berjalan sekali sehari di jam 3 pagi
cron.schedule("0 3 * * *", () => {
    console.info("Running daily cleanup tasks...");
    runCleanupTasks();
});
