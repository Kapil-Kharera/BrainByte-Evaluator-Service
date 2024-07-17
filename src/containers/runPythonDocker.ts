// import Docker from "dockerode";

// import { TestCases } from "../types/testCases";
import { PYTHON_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import decodeDockerStream from "./dockerHelper";
// inputData?: TestCases
async function runPython(code: string, inputTestCase: string) {
    const rawLogBuffer: Buffer[] = [];

    console.log("Initialising a new python docker container");
    console.log("Image name : ", PYTHON_IMAGE);

    const runCommand = `echo '${code.replace(/'/g,`'\\'`)}' > test.py && echo '${inputTestCase.replace(/'/g,`'\\'`)}' | python3 test.py `;

    const pyhtonDockerContainer = await createContainer(PYTHON_IMAGE, ['/bin/sh', '-c', runCommand]);
    
    await pyhtonDockerContainer.start();

    const loggerStream = await pyhtonDockerContainer.logs({
        stdout: true,
        stderr: true,
        timestamps: false,
        follow: true
    });

    loggerStream.on('data', (chunk) => {
        rawLogBuffer.push(chunk);
    });

    loggerStream.on('end', () => {
        console.log("rawBufferLog :", rawLogBuffer);
        const completeBuffer = Buffer.concat(rawLogBuffer);
        const decodedStream = decodeDockerStream(completeBuffer);
        console.log("decodedStream : ", decodedStream);
    });

    return pyhtonDockerContainer;
}

export default runPython;