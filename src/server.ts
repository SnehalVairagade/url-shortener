import express from "express";
import healthRouter from "./routes/health";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import {config} from "./config/env"
const app = express();

app.use(logger);

app.use(express.json());

const PORT = config.PORT;
//everything gets directed to healthrouter/health route(file)
app.use("/", healthRouter);

//after upper does not take control this lower one runs
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found"
    });
});

app.use(errorHandler);

//this starts the server,after it we generally don't register more middleware
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});