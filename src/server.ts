import express from "express";
import healthRouter from "./routes/health";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import { config } from "./config/env";

const app = express();

// Structured Request Logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        logger.info({
            message: "Request Processed",
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip
        });
    });
    next();
});

app.use(express.json());

const PORT = config.PORT;

// everything gets directed to healthRouter
app.use("/", healthRouter);

// 404 handler
app.use((req, res) => {
    logger.warn({
        message: "Route not found",
        path: req.path,
        ip: req.ip
    });
    res.status(404).json({
        error: "Route not found"
    });
});

// centralized error handler
app.use((err, req, res, next) => {
    logger.error({
        message: "Unhandled Exception",
        error: err.message,
        stack: err.stack,
        path: req.path,
        ip: req.ip
    });
    next(err);
});

app.use(errorHandler);

function startServer() {
    app.listen(config.PORT, () => {
        logger.info(`Server running on port ${PORT}`);
        logger.info(`Search API: http://localhost:${PORT}/`);
    });
}

if (process.env.NODE_ENV !== "test") {
    startServer();
}

export default app;