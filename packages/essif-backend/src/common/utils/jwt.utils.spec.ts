import { JWT, JWK, errors } from "jose";
import {
  decodeToken,
  decodeTokenPayload,
  isTokenExpired,
  generateSelfSignedToken,
} from "./jwt.utils";

describe("decodeToken", () => {
  it("fails when no token is prodvided", () => {
    expect.assertions(1);

    // @ts-ignore
    expect(() => decodeToken()).toThrow("Missing token");
  });
});

describe("decodeTokenPayload", () => {
  it("fails when no token is prodvided", () => {
    expect.assertions(1);

    // @ts-ignore
    expect(() => decodeTokenPayload()).toThrow("Missing token");
  });

  it("fails when the token is not correclty formatted", () => {
    expect.assertions(1);

    // @ts-ignore
    expect(() => decodeTokenPayload("abc")).toThrow(errors.JWTMalformed);
  });

  it("correctly decodes a token", () => {
    expect.assertions(1);

    const iat = new Date();

    const payload = {
      sub: "1234567890",
      name: "John Doe",
      iat: Math.floor(iat.getTime() / 1000),
    };

    // Generate an EC key for the tests
    const key = JWK.generateSync("EC");

    const token = JWT.sign(payload, key, {
      now: iat,
    });

    const decodedToken = decodeTokenPayload(token);
    expect(decodedToken).toStrictEqual(payload);
  });
});

describe("isTokenExpired", () => {
  it("fails when no token is provided", () => {
    expect.assertions(1);

    // @ts-ignore
    expect(() => isTokenExpired()).toThrow("Invalid JWT payload provided");
  });

  it("fails when token exp property is missing or empty", () => {
    expect.assertions(1);

    // @ts-ignore
    expect(() => isTokenExpired({ exp: "" })).toThrow(
      "Invalid JWT payload provided"
    );
  });

  it("returns false when the token is not expired", () => {
    expect.assertions(1);

    const payload = {
      exp: Math.floor(Date.now() / 1000) + 5, // expires in 5s
    };

    // @ts-ignore
    expect(isTokenExpired(payload)).toBe(false);
  });

  it("returns true when the token is expired", () => {
    expect.assertions(1);

    const payload = {
      exp: Math.floor(Date.now() / 1000) - 5, // expired 5s ago
    };

    // @ts-ignore
    expect(isTokenExpired(payload)).toBe(true);
  });
});

describe("generateSelfSignedToken", () => {
  it("fails when 1 or more parameter is missing or empty", () => {
    expect.assertions(6);

    // @ts-ignore
    expect(() => generateSelfSignedToken()).toThrow(TypeError);

    // @ts-ignore
    expect(() => generateSelfSignedToken("")).toThrow("Invalid parameters");

    // @ts-ignore
    expect(() => generateSelfSignedToken({})).toThrow("Invalid parameters");

    // @ts-ignore
    expect(() => generateSelfSignedToken({ audience: "test" })).toThrow(
      "Invalid parameters"
    );

    // @ts-ignore
    expect(() => generateSelfSignedToken({ privKey: "test" })).toThrow(
      "Invalid parameters"
    );

    expect(() =>
      generateSelfSignedToken({ audience: "", privKey: "", iss: "" })
    ).toThrow("Invalid parameters");
  });

  it("generates a valid token", () => {
    expect.assertions(3);

    const token = generateSelfSignedToken({
      audience: "test",
      privKey: "test",
      iss: "Sample Verifiable ID Issuer",
    });

    const decodedToken = decodeTokenPayload(token);

    // Test static properties
    expect(decodedToken).toMatchObject({
      aud: "test",
      iss: "Sample Verifiable ID Issuer",
    });

    // Make sure dynamic properties are set to
    expect(decodedToken).toHaveProperty("iat");
    expect(decodedToken).toHaveProperty("exp");
  });
});
