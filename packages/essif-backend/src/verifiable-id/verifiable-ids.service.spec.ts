import { Test } from "@nestjs/testing";
import { HttpService, HttpModule, Logger } from "@nestjs/common";
import { ConfigService, ConfigModule } from "@nestjs/config";
import { of } from "rxjs";
import { AxiosResponse } from "axios";
import { WalletService } from "../common/services/wallet.service";
import { VerifiableIdsService } from "./verifiable-ids.service";
import { CreateVerifiableIdDto } from "./dtos/create-verifiable-id.dto";
import { formatVerifiableId } from "./verifiable-ids.utils";
import configuration from "../config/configuration";
import { decodeTokenPayload } from "../common/utils/jwt.utils";

describe("verifiable-id.service", () => {
  let walletService: WalletService;
  let httpService: HttpService;
  let configService: ConfigService;
  let verifiableIdsService: VerifiableIdsService;

  const accessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJkaWQiOiJlYnNpOnRlc3QifQ.dqFJbmJgdyvFP0qLxMgICauYoTqzqMeOrY23J0syvmA";

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
      providers: [VerifiableIdsService, WalletService],
    }).compile();

    httpService = module.get<HttpService>(HttpService);
    walletService = module.get<WalletService>(WalletService);
    configService = module.get<ConfigService>(ConfigService);
    verifiableIdsService = module.get<VerifiableIdsService>(
      VerifiableIdsService
    );

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

  it("createVerifiableId should create a full Verifiable ID", async () => {
    expect.assertions(3);

    const body: CreateVerifiableIdDto = {
      credentialSubject: {
        id: "did:ebsi:test",
        personIdentifier: "a",
        currentAddress: "a",
        currentFamilyName: "a",
        currentGivenName: "a",
        birthName: "a",
        dateOfBirth: "1977-04-22T06:00:00Z",
        placeOfBirth: "a",
        gender: "a",
      },
    };

    // Mock wallet /sessions API call
    const walletServiceLoginSpy = jest
      .spyOn(walletService, "login")
      .mockImplementationOnce(() => Promise.resolve({ accessToken }));

    const walletApi = configService.get("walletApi");
    const signaturesEndpoint = `${walletApi}/signatures`;
    const notificationsEndpoint = `${walletApi}/notifications`;

    const decodedToken = decodeTokenPayload(accessToken);
    const { did } = decodedToken;
    const verifiableId = formatVerifiableId(body, did);

    const expectedSignaturesPayload = {
      issuer: did,
      type: "EcdsaSecp256k1Signature2019",
      payload: verifiableId,
    };

    const expectedHeaders = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    // Mock Wallet API /signatures and /notifications endpoints
    const httpPostSpy = jest
      .spyOn(httpService, "post")
      .mockImplementation((url) => {
        if (url === signaturesEndpoint) {
          const response: AxiosResponse = {
            data: {
              jws:
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaXNzIjoiZGlkOmVic2k6MHhGNmQ1N0M0RjYwQjY5NGE5NjM1N0M0ODkzMjM5MWExRDNlMzM0MUMiLCJpYXQiOjE1MTYyMzkwMjIsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIiwiaHR0cHM6Ly9FQlNJLVdFQlNJVEUuRVUvc2NoZW1hcy92Yy8yMDE5L3YxIyIsImh0dHBzOi8vRUJTSS1XRUJTSVRFLkVVL3NjaGVtYXMvZWlkYXMvMjAxOS92MSMiXSwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCIsIkVzc2lmVmVyaWZpYWJsZUlEIl0sImlkIjoiZWJzaTp0eXBlLXZlcnNpb24tb2YtdGhlLWNyZWRlbnRpYWwiLCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6ImRpZDplYnNpOnRlc3QifX19.ZOAzpiw3Zz5J1f2LC0VuF23Ej1CyggPD6DnqNTXyoi8",
            },
            status: 200,
            statusText: "",
            headers: {},
            config: {},
          };

          return of(response);
        }
        if (url === notificationsEndpoint) {
          const response: AxiosResponse = {
            data: {},
            status: 200,
            statusText: "",
            headers: {},
            config: {},
          };

          return of(response);
        }

        return of(<AxiosResponse>{});
      });

    await verifiableIdsService.createVerifiableId(body);
    expect(walletServiceLoginSpy).toHaveBeenCalledTimes(1);
    expect(httpPostSpy).toHaveBeenNthCalledWith(
      1,
      signaturesEndpoint,
      expectedSignaturesPayload,
      expectedHeaders
    );
    expect(httpPostSpy).toHaveBeenNthCalledWith(
      2,
      notificationsEndpoint,
      expect.objectContaining({
        sender: expect.any(String),
        notification: {
          target: "did:ebsi:test", // expect.any(String),
          notificationType: expect.any(Number),
          name: "Verifiable ID",
          data: { base64: expect.any(String) },
        },
      }),
      expectedHeaders
    );
  });
});
