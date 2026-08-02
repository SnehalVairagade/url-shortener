import express from "express";
import healthRouter from "./routes/health";

const app = express();

app.use(express.json());

const PORT = 3000;

app.use("/", healthRouter);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});