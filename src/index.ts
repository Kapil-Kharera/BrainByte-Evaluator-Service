import express from "express";

import serverConfig from "./config/serverConfig";
import sampleQueueProducer from "./producers/sampleQueueProducer";
import apiRouter from "./routes";
import SampleWorker from "./workers/sampleWorker";

const { PORT } = serverConfig;

const app = express();

app.use("/api", apiRouter);

app.listen(PORT, () => {
    console.log(`Server started at *: ${PORT}`);
    SampleWorker("SampleQueue");
    sampleQueueProducer("Sample Job", {
        name: "Kapil Kharera",
        company: "Sequelstring AI Pvt. Ltd",
        position: "Trainee Engineer",
        location: "New Delhi"
    });
});