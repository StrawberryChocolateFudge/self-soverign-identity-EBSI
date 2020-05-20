import request from "supertest";
import {
  INestApplication,
  ValidationPipe,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { JWT, JWK } from "jose";
import { AppModule } from "../src/app.module";
import emptyCredentialSubjectPayload from "./payloads/empty-credential-subject.json";
import validRequest from "./payloads/valid-request.json";

const verifiableCredentialsEndpoint = "/api/verifiable-credentials";
const didAuthEndpoint = "/api/did-auth";
const didAuthValidationsEndpoint = "/api/did-auth-validations";

jest.setTimeout(30000);

const payload = {
  sub_jwk: {
    kid: "did:ebsi:0x1234",
  },
};

const token = JWT.sign(payload, JWK.asKey("test"), {
  audience: "ebsi-wallet",
  expiresIn: "2 hours",
  header: { typ: "JWT" },
  subject: "test",
});

describe("api", () => {
  let app: INestApplication;

  // eslint-disable-next-line jest/no-hooks
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    // Mute logger debug
    jest.spyOn(Logger, "debug").mockImplementation(() => {});

    await app.init();
  });

  // eslint-disable-next-line jest/no-hooks
  afterAll(async () => {
    await app.close();
  });

  describe(`request POST ${verifiableCredentialsEndpoint}`, () => {
    it("should fail if no JWT is sent", async () => {
      expect.assertions(2);

      const response = await request(app.getHttpServer()).post(
        verifiableCredentialsEndpoint
      );

      expect(response.body).toStrictEqual({
        error: "Forbidden",
        message: "Missing JWT",
        status: HttpStatus.FORBIDDEN,
      });
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });

    it("should fail if no credentialSubject is sent", async () => {
      expect.assertions(2);

      const response = await request(app.getHttpServer())
        .post(verifiableCredentialsEndpoint)
        .set("Authorization", `Bearer ${token}`);

      expect(response.body).toStrictEqual({
        error: "Bad Request",
        message: [
          "credentialSubject should not be null or undefined",
          "credentialSubject should not be empty",
        ],
        statusCode: 400,
      });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should fail if credentialSubject is missing some properties", async () => {
      expect.assertions(2);

      const response = await request(app.getHttpServer())
        .post(verifiableCredentialsEndpoint)
        .set("Authorization", `Bearer ${token}`)
        .send(emptyCredentialSubjectPayload);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toStrictEqual({
        error: "Bad Request",
        message: [
          "credentialSubject.id should not be null or undefined",
          "credentialSubject.id should not be empty",
          "credentialSubject.personIdentifier should not be null or undefined",
          "credentialSubject.personIdentifier should not be empty",
          "credentialSubject.currentFamilyName should not be null or undefined",
          "credentialSubject.currentFamilyName should not be empty",
          "credentialSubject.currentGivenName should not be null or undefined",
          "credentialSubject.currentGivenName should not be empty",
          "credentialSubject.birthName should not be null or undefined",
          "credentialSubject.birthName should not be empty",
          "credentialSubject.dateOfBirth should not be null or undefined",
          "credentialSubject.dateOfBirth must be a ISOString",
          "credentialSubject.dateOfBirth should not be empty",
          "credentialSubject.placeOfBirth should not be null or undefined",
          "credentialSubject.placeOfBirth should not be empty",
          "credentialSubject.currentAddress should not be null or undefined",
          "credentialSubject.currentAddress should not be empty",
          "credentialSubject.gender should not be null or undefined",
          "credentialSubject.gender should not be empty",
        ],
        statusCode: 400,
      });
    });

    it("should return success", async () => {
      expect.assertions(1);

      const response = await request(app.getHttpServer())
        .post(verifiableCredentialsEndpoint)
        .set("Authorization", `Bearer ${token}`)
        .send(validRequest);

      expect(response.status).toBe(HttpStatus.CREATED);
    });
  });

  describe(`request GET ${didAuthEndpoint}`, () => {
    it("should return a redirectUrl and nonce", async () => {
      expect.assertions(2);

      const response = await request(app.getHttpServer()).get(didAuthEndpoint);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toStrictEqual(
        expect.objectContaining({
          redirectUrl: expect.any(String),
          nonce: expect.any(String),
        })
      );
    });
  });

  describe(`request POST ${didAuthValidationsEndpoint}`, () => {
    it("should fail when didAuthResponseJwt and/or nonce are missing", async () => {
      expect.assertions(2);

      const response = await request(app.getHttpServer())
        .post(didAuthValidationsEndpoint)
        .send({});

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toStrictEqual({
        error: "Bad Request",
        message: [
          "didAuthResponseJwt should not be null or undefined",
          "didAuthResponseJwt should not be empty",
          "nonce should not be null or undefined",
          "nonce should not be empty",
        ],
        statusCode: 400,
      });
    });
  });
});
