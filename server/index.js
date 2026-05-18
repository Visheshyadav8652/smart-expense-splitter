import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import groupsRouter from "./routes/groups.js";
import expensesRouter from "./routes/expenses.js";
import settleRouter from "./routes/settle.js";
import aiRouter from "./routes/ai.js";
import { errorHandler, notFound } from "./middleware/error.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "6mb" }));

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/groups", groupsRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api", settleRouter);
app.use("/api/ai", aiRouter);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
