import { Injectable, OnModuleInit } from '@nestjs/common';
import { createCluster, createClient } from "redis";

@Injectable()
export class RedisService implements OnModuleInit {
  public redis;

  async onModuleInit() {
    if(process.env.NODE_ENV === 'production') {
      this.redis = await createCluster({
        rootNodes: [
          {
            url: process.env.REDIS_HOST,
          },
        ],
        useReplicas: true,
        defaults: {
          socket: {
            connectTimeout: 5000,
            reconnectStrategy: (attempts) => attempts > 3 ? new Error("Max retry attempt has been reached") : 1000
          }
        }
      });

      this.redis.on("connect", () => console.log("Redis Client connected"));
      this.redis.on("ready", () => console.log("Redis Client is ready to use"));
      this.redis.on("reconnecting", () => console.log("Redis Client reconnecting"));
      this.redis.on("error", (err) => console.log(`Redis Client Error : ${err}`));
      this.redis.on("end", () => console.log("Redis Client is gracefully terminated"));
    } else {
      this.redis = await createClient({
        url: process.env.REDIS_HOST_DEV,
        socket: {
          connectTimeout: 50000,
        }
      });
    }

    await this.redis.connect();
  }
}