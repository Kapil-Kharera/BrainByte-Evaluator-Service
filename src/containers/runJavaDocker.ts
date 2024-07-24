import { JAVA_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import decodeDockerStream from "./dockerHelper";

async function runJava(code: string, inputTestCase: string) {
    const rawLogBuffer: Buffer[] = [];

    console.log("Initialising a new java docker container");
    const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > Main.java && javac Main.java && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | java Main`;
    console.log("runCommand : ", runCommand);
    const javaDockerContainer = await createContainer(JAVA_IMAGE, [
        '/bin/sh',
        '-c',
        runCommand
    ]);

    await javaDockerContainer.start();

    console.log("Started the docker container");

    const loggerStream = await javaDockerContainer.logs({
        stdout: true,
        stderr: true,
        timestamps: false,
        follow: true
    });

    loggerStream.on('data', (chunk) => {
        rawLogBuffer.push(chunk);
    });

    await new Promise((res) => {
        loggerStream.on('end', () => {
            console.log("rawLogBuffer : ", rawLogBuffer);
            const completeBuffer = Buffer.concat(rawLogBuffer);
            const decodedStream = decodeDockerStream(completeBuffer);
            console.log("decoded stream : ", decodedStream);
            console.log("decoded stream stdout :", decodedStream.stdout);
            res(decodeDockerStream);
        });
    });

    await javaDockerContainer.remove();
}

export default runJava;