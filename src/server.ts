import express from "express";
import healthRouter from "./routes/health";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import { config } from "./config/env";

const app = express();

app.use(logger);

app.use(express.json());

const PORT = config.PORT;

// everything gets directed to healthRouter
app.use("/", healthRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found"
    });
});

// centralized error handler
app.use(errorHandler);

function startServer() {
    app.listen(config.PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Search API: http://localhost:${PORT}/`);
    });
}

if (process.env.NODE_ENV !== "test") {
    startServer();
}

export default app;