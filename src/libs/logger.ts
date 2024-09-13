import { WinstonModule, utilities } from "nest-winston";
import winston from "winston";

export const Logger = {
    module: WinstonModule.forRoot({
        transports: [
            new winston.transports.Console({
                level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
                format: winston.format.combine(
                    winston.format.timestamp(),
                    utilities.format.nestLike('OG', { prettyPrint: true, colors: true })
                )
            })
        ]
    })
}