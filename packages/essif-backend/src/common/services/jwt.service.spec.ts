import { Test } from "@nestjs/testing";
import { Logger } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JWT, JWK } from "jose";
import base64url from "base64url";
import { JwtPayload } from "../interfaces/jwt.payload";
import { JwtHeader } from "../interfaces/jwt.header";
import { JwtService } from "./jwt.service";
import configuration from "../../config/configuration";

const jwtUtils = jest.requireActual("../utils/jwt.utils");

describe("jwt.service", () => {
  let jwtService: JwtService;
  let configService: ConfigService;

  // eslint-disable-next-line jest/no-hooks
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: [".env.test", ".env"],
          load: [configuration],
        }),
      ],
      providers: [JwtService, ConfigService],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    // Mute logger debug
    jest.spyOn(Logger, "debug").mockImplementation(() => {});
  });

  // eslint-disable-next-line jest/no-hooks
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should be defined", () => {
    expect.assertions(1);
    expect(jwtService).toBeDefined();
  });

  it("createSignedAssertionToken should work", async () => {
    expect.assertions(4);
    const aud = "ebsi-wallet";

    const jwt = await jwtService.createSignedAssertionToken(aud);

    // Get payload and header
    const privKey = configService.get("privateKey");
    const issuer = configService.get("issuer");
    const key = JWK.asKey(base64url.decode(privKey));
    const decodedToken = JWT.verify(jwt, key, { complete: true });
    const payload: JwtPayload = decodedToken.payload as JwtPayload;
    const headers: JwtHeader = decodedToken.header as JwtHeader;

    expect(headers.typ).toStrictEqual("JWT");
    expect(payload.exp).toBeGreaterThan(payload.iat);
    expect(payload.aud).toStrictEqual(aud);
    expect(payload.iss).toStrictEqual(issuer);
  });

  it("createSignedAssertionToken should reuse cached token if still valid", async () => {
    expect.assertions(1);

    jwtService.clearCache();

    const audWallet = "ebsi-wallet";
    const jwtWallet = await jwtService.createSignedAssertionToken(audWallet);

    // Wait for 2 seconds to make sure the tokens are different if generated dynamically
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const jwtWallet2 = await jwtService.createSignedAssertionToken(audWallet);

    expect(jwtWallet).toStrictEqual(jwtWallet2);
  });

  it("createSignedAssertionToken should generate a new token if the previous is not valid anymore", async () => {
    expect.assertions(1);

    jwtService.clearCache();

    const audWallet = "ebsi-wallet";
    const jwtWallet = await jwtService.createSignedAssertionToken(audWallet);

    // Make sure the "old" token appears as expired
    // @ts-ignore
    jest.spyOn(jwtUtils, "isTokenExpired").mockImplementation(() => true);

    // Wait for 2 seconds to make sure the tokens are different if generated dynamically
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const jwtWallet2 = await jwtService.createSignedAssertionToken(audWallet);
    expect(jwtWallet).not.toBe(jwtWallet2);
  });
});
