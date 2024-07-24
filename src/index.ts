// import express from "express";

// import serverConfig from "./config/serverConfig";
// import sampleQueueProducer from "./producers/sampleQueueProducer";
// import apiRouter from "./routes";
// import SampleWorker from "./workers/sampleWorker";

// import { createBullBoard } from "@bull-board/api";
// import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
// import { ExpressAdapter } from "@bull-board/express";
// import { Queue  as QueueMQ, Worker } from "bullmq";
// import redisConnection from "./config/redisConfig";
// import { IJob } from "./types/bullMqJobDefinition";

// const sleep = (t: number) => new Promise((resolve) => setTimeout(resolve, t * 1000));

// const createQueueMQ = (name: string) => new QueueMQ(name, { connection: redisConnection})

// async function setupBullMQProcessor(queueName: string) {
//     new Worker(queueName, async (job) => {
//         for(let i = 0; i <= 100; i++) {
//             await sleep(Math.random());
//             await job.updateProgress(i);
//             await job.log(`Processing job at interval ${i}`);

//             if(Math.random() * 200 < 1) throw new Error(`Random error ${i}`);
//         }

//         return { jobId: `This is the return value of job (${job.id})`};
//     });
// }

// const exampleBullMq = createQueueMQ('BullMQ');

// await setupBullMQProcessor(exampleBullMq.name);

// const { PORT } = serverConfig;

// const app = express();

// const serverAdapter = new ExpressAdapter();
// serverAdapter.setBasePath("/ui");

// createBullBoard({
//     queues: [new BullMQAdapter(exampleBullMq)],
//     serverAdapter
// });

// app.use("/api", apiRouter);
// app.use("/ui", serverAdapter.getRouter());
// app.use("/add", (req,res) => {
//     const opts = req.query.opts || {};
//     if(opts.delay) opts.delay = +opts.delay * 1000;
//     exampleBullMq.add("Add", { title: req.query.title}, opts);

//     res.json({ ok: true });
// })

// app.listen(PORT, () => {
//     console.log(`Server started at *: ${PORT}`);
//     SampleWorker("SampleQueue");
//     sampleQueueProducer("Sample Job 2", {
//         name: "Kapil Kharera",
//         company: "Sequelstring AI Pvt. Ltd",
//         position: "Trainee Engineer",
//         location: "New Delhi"
//     }, 2);
//     sampleQueueProducer("Sample Job 1", {
//         name: "Sachin Kharera",
//         company: "Google",
//         position: "Trainee Engineer",
//         location: "Gurugram"
//     }, 1);
//     console.log('For the UI, open http://localhost:3000/ui');
//     console.log('Make sure Redis is running on port 6379 by default');
//     console.log('To populate the queue, run:');
//     console.log('  curl http://localhost:3000/add?title=Example');
//     console.log('To populate the queue with custom options (opts), run:');
//     console.log('  curl http://localhost:3000/add?title=Test&opts[delay]=9');
// });


import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import bodyParser from "body-parser";
import { Queue as QueueMQ, Worker } from "bullmq";
import express from "express";
import { ParsedQs } from "qs";

import redisConnection from "./config/redisConfig";
import serverConfig from "./config/serverConfig";
import runCPP from "./containers/runCPPDocker";
// import runJava from "./containers/runJavaDocker";
// import runPython from "./containers/runPythonDocker";
import sampleQueueProducer from "./producers/sampleQueueProducer";
import apiRouter from "./routes";
import SampleWorker from "./workers/sampleWorker";

const sleep = (t: number) => new Promise((resolve) => setTimeout(resolve, t * 1000));

const createQueueMQ = (name: string) => new QueueMQ(name, { connection: redisConnection });

async function setupBullMQProcessor(queueName: string) {
    new Worker(queueName, async (job) => {
        for (let i = 0; i <= 100; i++) {
            await sleep(Math.random());
            await job.updateProgress(i);
            await job.log(`Processing job at interval ${i}`);

            if (Math.random() * 200 < 1) throw new Error(`Random error ${i}`);
        }

        return { jobId: `This is the return value of job (${job.id})` };
    }, { connection: redisConnection });
}

const startServer = async () => {
    const exampleBullMq = createQueueMQ('BullMQ');
    await setupBullMQProcessor(exampleBullMq.name);

    const { PORT } = serverConfig;

    const app = express();

    const serverAdapter = new ExpressAdapter(); // Fixed typo
    serverAdapter.setBasePath("/ui");

    createBullBoard({
        queues: [new BullMQAdapter(exampleBullMq)],
        serverAdapter
    });

    app.use(bodyParser.urlencoded());
    app.use(bodyParser.json());
    app.use(bodyParser.text());
    app.use("/api", apiRouter);
    app.use("/ui", serverAdapter.getRouter());
    app.use("/add", async (req, res) => {
        const opts = req.query.opts as ParsedQs || {};
        if (opts?.delay && typeof opts.delay === "string") {
            const delayInSeconds = parseInt(opts.delay, 10);
            if(!isNaN(delayInSeconds)) {    
                opts.delay = (delayInSeconds * 1000).toString();
            }
        };
        await exampleBullMq.add("Add", { title: req.query.title }, opts);

        res.json({ ok: true });
    });

    app.listen(PORT, () => {
        console.log(`Server started at *: ${PORT}`);
        SampleWorker("SampleQueue");
        sampleQueueProducer("Sample Job 2", {
            name: "Kapil Kharera",
            company: "Sequelstring AI Pvt. Ltd",
            position: "Trainee Engineer",
            location: "New Delhi"
        }, 2);
        sampleQueueProducer("Sample Job 1", {
            name: "Sachin Kharera",
            company: "Google",
            position: "Trainee Engineer",
            location: "Gurugram"
        }, 1);
        console.log('For the UI, open http://localhost:3000/ui');
        console.log('Make sure Redis is running on port 6379 by default');
        console.log('To populate the queue, run:');
        console.log('  curl http://localhost:3000/add?title=Example');
        console.log('To populate the queue with custom options (opts), run:');
        console.log('  curl http://localhost:3000/add?title=Test&opts[delay]=9');
        
        // const code = `print("hello")`;
        // const code =   `x = input()
        //                 print("value fo x is ", x)
        //                 for i in range(int(x)): 
        //                     print(i)
        //                 `;

        // const code = `
        //     import java.util.*;
        //     public class Main {
        //         public static void main (String[] args) {
        //             Scanner scn = new Scanner(System.in);
        //             int input = scn.nextInt();
        //             System.out.println("Input value give by user :" + input);

        //             for(int i = 0; i < input; i++) {
        //                 System.out.println(i);
        //             }
        //         }
        //     }
        // `;

        const code = `
            #include <iostream>
            using namespace std;
            int main() {
                int x;
                cin>>x;
                cout<<"value of x is "<<x<<"endl;

                for(int i = 0; i < x; i++) {
                    cout<<i<<" ";
                }

                cout<<endl;
                return 0;
            }
        `;
        
        const inputCase = `10`;

        // runPython(code, inputCase);
        // runJava(code, inputCase);
        runCPP(code, inputCase);
    });
};

startServer().catch((error) => {
    console.error("Error starting the server:", error);
});
