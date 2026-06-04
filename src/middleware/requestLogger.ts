import type { RequestHandler} from "express";

export const requestLogger: RequestHandler = (req, res, next): void => {
    const start = Date.now();
    res.on("finish", () => {
        const durationMs = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`);
        });
        next();
    };
