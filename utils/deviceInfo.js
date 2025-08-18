import { UAParser } from "ua-parser-js";

export default function extractDeviceInfo(req) {
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    return {
        userAgent: req.headers["user-agent"] || "Unknown",
        deviceName: `${ua.browser?.name || "Unknown Browser"} on ${
            ua.os?.name || "Unknown OS"
        }`,
        ipAddress: req.ip || req.headers["x-forwarded-for"] || "Unknown IP",
    };
}
