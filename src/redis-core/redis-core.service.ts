import { Injectable, Logger } from "@nestjs/common";
import { Redis } from "ioredis";

@Injectable()
export class RedisCoreService {
    private redisClient: Redis;

    // constructor() {
    //     try {
    //         let redisHost: any = process.env.REDIS_DB_HOST;
    //         let redisPort: any = process.env.RESID_DB_PORT;
    //         this.redisClient = new Redis({
    //             host: redisHost,
    //             port: redisPort
    //         });
    //     } catch (error) {
    //         console.log("ErrorInConnection", Logger.error(error));
    //     }
    // }

    // async keys(key) {
    //     return await this.redisClient.keys(key);
    // }

    // async set(key: string, value: any): Promise<void>;
    // async set(key: string, value: any, secondsToken: any, seconds: number): Promise<void>;

    // async set(key: string, value: any, secondsToken?: any, seconds?: number): Promise<void> {
    //     if (secondsToken && seconds) {
    //         await this.redisClient.set(key, JSON.stringify(value), secondsToken, seconds);
    //     } else {
    //         await this.redisClient.set(key, JSON.stringify(value));
    //     }
    // }

    // async get(key): Promise<any> {
    //     return await this.redisClient.get(key);
    // }

    // async del(key) {
    //     await this.redisClient.del(key);
    // }

    // async hset(key, hashKey, value) {
    //     await this.redisClient.hset(key, hashKey, JSON.stringify(value));
    // }

    // async hget(key, hashKey) {
    //     return await this.redisClient.hget(key, hashKey);
    // }

    // async hgetall(key): Promise<any> {
    //     return await this.redisClient.hgetall(key);
    // }

    // async deleteAllKeysByDirectoryName(directoryName: string) {
    //     const allKeys = await this.redisClient.keys(directoryName);

    //     for (const key of allKeys) {
    //         await this.redisClient.del(key);
    //     }
    // }

    // async updateAllKeysByDirectoryName(directoryName: string, payload: any) {
    //     const allKeys = await this.redisClient.keys(directoryName);

    //     for (const key of allKeys) {
    //         await this.set(key, payload)
    //     }
    // }
}
