import { CPP_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import decodeDockerStream from "./dockerHelper";
import pullImage from "./pullImage";

async function runCPP(code: string, inputTestCase: string) {
    const rawLogBuffer: Buffer[] = [];
    console.log("Initialising a new c++ docker container");
    await pullImage(CPP_IMAGE);
    const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > main.cpp && g++ main.cpp -o main && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | ./main`;
    console.log("runCommand : ", runCommand);
    const cppDockerContainer = await createContainer(CPP_IMAGE, [
        '/bin/sh',
        '-c',
        runCommand
    ]);

    await cppDockerContainer.start();

    console.log("Started the docker container");

    const loggerStream = await cppDockerContainer.logs({
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

    await cppDockerContainer.remove();
}

export default runCPP;