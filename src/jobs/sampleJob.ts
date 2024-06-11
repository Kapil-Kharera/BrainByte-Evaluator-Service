import { Job } from "bullmq";

import { IJob } from "../types/bullMqJobDefinition";

export default class SampleJob implements IJob {
    name: string;
    payload: Record<string, unknown>;

    constructor(payload: Record<string, unknown>) {
        this.payload = payload;
        this.name = this.constructor.name;
    }

    handle = (job?: Job) => {
        console.log("Handle of the Job called");
        console.log("Job payload : ", this.payload);
        if(job) {
            console.log(`Job name ${job.name} id ${job.id} and its data ${job.data}`);
        }
    };

    failed = (job?: Job): void => {
        console.log("Job failed");
        if(job) console.log(job.id);
    };
}