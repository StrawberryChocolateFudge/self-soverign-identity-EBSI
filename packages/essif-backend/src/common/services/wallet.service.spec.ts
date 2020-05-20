import { Test } from "@nestjs/testing";
import { HttpService, HttpModule, Logger } from "@nestjs/common";
import { ConfigService, ConfigModule } from "@nestjs/config";
import { of } from "rxjs";
import base64url from "base64url";
import { AxiosResponse, AxiosError } from "axios";
import { WalletService } from "./wallet.service";
import { JwtService } from "./jwt.service";
import configuration from "../../config/configuration";

enum NOTIFICATION_TYPE {
  STORE_CREDENTIAL,
  STORE_VERIFIABLEID,
  REQUEST_PRESENTATION,
  SIGN_PAYLOAD,
  SIGN_TX,
}

describe("wallet.service", () => {
  let walletService: WalletService;
  let httpService: HttpService;
  let configService: ConfigService;
  let jwtService: JwtService;

  const accessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  // eslint-disable-next-line jest/no-hooks
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        HttpModule,
        ConfigModule.forRoot({
          envFilePath: [".env.test", ".env"],
          load: [configuration],
        }),
      ],
      providers: [WalletService, JwtService],
    }).compile();

    httpService = module.get<HttpService>(HttpService);
    walletService = module.get<WalletService>(WalletService);
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);

    // Mute logger debug
    jest.spyOn(Logger, "debug").mockImplementation(() => {});
  });

  // eslint-disable-next-line jest/no-hooks
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should be defined", () => {
    expect.assertions(1);
    expect(walletService).toBeDefined();
  });

  it("should log an error when jwtService.createSignedAssertionToken throws", async () => {
    expect.assertions(3);

    const jwtSpy = jest
      .spyOn(jwtService, "createSignedAssertionToken")
      .mockImplementationOnce(() => {
        throw new Error("test");
      });

    const loggerErrorSpy = jest
      .spyOn(Logger, "error")
      .mockImplementation(() => {});

    await expect(walletService.login()).rejects.toThrow(new Error("test"));
    expect(jwtSpy).toHaveBeenCalledTimes(1);
    expect(loggerErrorSpy).toHaveBeenCalledTimes(2);
  });

  it("shoud return a session token when login() is called", async () => {
    expect.assertions(3);

    const walletRes: AxiosResponse = {
      data: {},
      status: 200,
      statusText: "",
      headers: {},
      config: {},
    };

    const axiosSpy = jest
      .spyOn(httpService, "post")
      .mockImplementationOnce(() => of(walletRes));

    const jwtSpy = jest
      .spyOn(jwtService, "createSignedAssertionToken")
      .mockImplementationOnce(() => accessToken);

    await walletService.login();

    const expectedPayload = {
      grantType: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: accessToken,
      scope: "ebsi profile entity",
    };

    const walletApi = configService.get("walletApi");
    const walletURL = `${walletApi}/sessions`;

    expect(axiosSpy).toHaveBeenLastCalledWith(walletURL, expectedPayload);
    expect(axiosSpy).toHaveBeenCalledTimes(1);
    expect(jwtSpy).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if Wallet API /sessions returns an error", async () => {
    expect.assertions(5);

    const error = {
      name: "test",
      message: "test",
      config: {},
      code: "500",
      response: {
        data: "test",
        status: 500,
        headers: {
          fakeHeader: "yes",
        },
        statusText: "500",
        config: {},
      },
    };
    const walletRes: AxiosError = {
      ...error,
      isAxiosError: true,
      toJSON: () => error,
    };

    const axiosPostSpy = jest
      .spyOn(httpService, "post")
      // @ts-ignore
      .mockImplementationOnce(() => ({
        toPromise: async () => {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject(walletRes);
        },
      }));

    const jwtSpy = jest
      .spyOn(jwtService, "createSignedAssertionToken")
      .mockImplementationOnce(() => accessToken);

    const loggerErrorSpy = jest
      .spyOn(Logger, "error")
      .mockImplementation(() => {});

    const expectedPayload = {
      grantType: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: accessToken,
      scope: "ebsi profile entity",
    };

    const walletApi = configService.get("walletApi");
    const walletURL = `${walletApi}/sessions`;

    await expect(walletService.login()).rejects.toMatchObject(error);
    expect(axiosPostSpy).toHaveBeenLastCalledWith(walletURL, expectedPayload);
    expect(axiosPostSpy).toHaveBeenCalledTimes(1);
    expect(loggerErrorSpy).toHaveBeenCalledTimes(8);
    expect(jwtSpy).toHaveBeenCalledTimes(1);
  });

  it("should call /signatures endpoint with the correct payload", async () => {
    expect.assertions(2);

    const walletRes = {};

    const axiosPostSpy = jest
      .spyOn(httpService, "post")
      // @ts-ignore
      .mockImplementationOnce(() => ({
        toPromise: async () => Promise.resolve(walletRes),
      }));

    const walletApi = configService.get("walletApi");
    const signaturesUrl = `${walletApi}/signatures`;

    const issuerDid = "did:ebsi:123";
    const verifiableId = {};
    const token = "123";

    const expectedPayload = {
      issuer: issuerDid,
      type: "EcdsaSecp256k1Signature2019",
      payload: verifiableId,
    };

    await walletService.signVerifiableId({ issuerDid, verifiableId, token });
    expect(axiosPostSpy).toHaveBeenLastCalledWith(
      signaturesUrl,
      expectedPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    expect(axiosPostSpy).toHaveBeenCalledTimes(1);
  });

  it("should call /notifications endpoint with the correct payload", async () => {
    expect.assertions(2);

    const walletRes = {};

    const axiosPostSpy = jest
      .spyOn(httpService, "post")
      // @ts-ignore
      .mockImplementationOnce(() => ({
        toPromise: async () => Promise.resolve(walletRes),
      }));

    const walletApi = configService.get("walletApi");
    const signaturesUrl = `${walletApi}/notifications`;

    const issuerDid = "did:ebsi:123";
    const verifiableId = {
      issuer: issuerDid,
      credentialSubject: {
        id: "12345",
      },
    };
    const token = "123";

    const expectedPayload = {
      sender: verifiableId.issuer,
      notification: {
        target: verifiableId.credentialSubject.id,
        notificationType: NOTIFICATION_TYPE.STORE_VERIFIABLEID,
        name: "Verifiable ID",
        data: { base64: base64url.encode(JSON.stringify(verifiableId)) },
      },
    };

    await walletService.sendVerifiableId({ verifiableId, token });
    expect(axiosPostSpy).toHaveBeenLastCalledWith(
      signaturesUrl,
      expectedPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    expect(axiosPostSpy).toHaveBeenCalledTimes(1);
  });
});
