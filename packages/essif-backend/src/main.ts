import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as winston from "winston";
import { utilities as winstonUtilities, WinstonModule } from "nest-winston";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winstonUtilities.format.nestLike()
        ),
      }),
    ],
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger,
  });

  const configService = app.get(ConfigService);

  // Dynamically update the logger level based on conf (only for Console transport)
  // @ts-ignore
  logger.logger.transports[0].level = configService.get("logLevel");

  // Display server info on bootstrap
  logger.debug(`Port: ${configService.get("port")}`, "ServerInfo");
  logger.debug(`Prefix: ${configService.get("prefix")}`, "ServerInfo");
  logger.debug(`Public URL: ${configService.get("publicUrl")}`, "ServerInfo");

  app.enableCors();
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 100, // limit each IP to 100 requests per windowMs
    })
  );
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(configService.get("prefix"));
  await app.listen(configService.get("port"));
}

bootstrap();
