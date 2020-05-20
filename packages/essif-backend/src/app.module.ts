import { Module, HttpModule } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { join } from "path";
import * as Joi from "@hapi/joi";
import { VerifiableIdsController } from "./verifiable-id/verifiable-ids.controller";
import { VerifiableIdsService } from "./verifiable-id/verifiable-ids.service";
import { JwtService } from "./common/services/jwt.service";
import { WalletService } from "./common/services/wallet.service";
import configuration from "./config/configuration";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        APP_PORT: Joi.number().default(8080),
        EBSI_ENV: Joi.string()
          .valid("local", "integration", "development", "production")
          .required(),
        NODE_ENV: Joi.string()
          .valid("development", "production", "test")
          .default("development"),
        APP_PRIVATE_KEY: Joi.string().required(),
        APP_ISSUER: Joi.string().required(),
      }),
    }),
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const prefix = configService.get("prefix");
        return [
          {
            rootPath: join(__dirname, "..", "public"),
            serveRoot: prefix,
            exclude: [`${prefix}/api*`],
          },
        ];
      },
      inject: [ConfigService],
    }),
    HttpModule,
  ],
  controllers: [VerifiableIdsController],
  providers: [VerifiableIdsService, JwtService, WalletService],
})
export class AppModule {}

export default AppModule;
