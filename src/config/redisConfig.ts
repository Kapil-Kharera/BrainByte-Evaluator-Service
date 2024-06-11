import Redis from "ioredis";

import serverConfig from "./serverConfig";

const { REDIS_PORT, REDIS_HOST } = serverConfig;

const redisConfig = {
    port: REDIS_PORT,
    host: REDIS_HOST
};

const redisConnection = new Redis(redisConfig);

export default redisConnection;