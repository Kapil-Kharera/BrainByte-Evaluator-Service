import express from "express";

import serverConfig from "./config/serverConfig";
import apiRouter from "./routes";

const { PORT } = serverConfig;

const app = express();

app.use("/api", apiRouter);

app.listen(PORT, () => {
    console.log(`Server started at *: ${PORT}`);
});