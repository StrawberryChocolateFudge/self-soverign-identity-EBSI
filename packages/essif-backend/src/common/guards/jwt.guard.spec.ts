import { HttpException, HttpStatus, Logger } from "@nestjs/common";
import { JWT } from "jose";
import { JwtGuard } from "./jwt.guard";

const formatException = (message) =>
  new HttpException(
    {
      status: HttpStatus.FORBIDDEN,
      error: "Forbidden",
      message,
    },
    HttpStatus.FORBIDDEN
  );

describe("jwt.guard", () => {
  // eslint-disable-next-line jest/no-hooks
  beforeAll(() => {
    // Mute logger debug
    jest.spyOn(Logger, "debug").mockImplementation(() => {});
  });
  it("should block requests without JWT", () => {
    expect.assertions(1);

    const guard = new JwtGuard();
    const context = {
      switchToHttp: jest.fn(() => ({
        getRequest: () => ({
          headers: {},
        }),
      })),
    };

    // @ts-ignore
    expect(() => guard.canActivate(context)).toThrow(
      formatException("Missing JWT")
    );
  });

  it("should block requests with malformed Authorization header", () => {
    expect.assertions(1);

    const guard = new JwtGuard();
    const context = {
      switchToHttp: jest.fn(() => ({
        getRequest: () => ({
          headers: {
            authorization: "Fail 123",
          },
        }),
      })),
    };

    // @ts-ignore
    expect(() => guard.canActivate(context)).toThrow(
      formatException("Invalid JWT")
    );
  });

  it("should block requests with unparseable JWT", () => {
    expect.assertions(1);

    const guard = new JwtGuard();
    const context = {
      switchToHttp: jest.fn(() => ({
        getRequest: () => ({
          headers: {
            authorization: "Bearer 123",
          },
        }),
      })),
    };

    // @ts-ignore
    expect(() => guard.canActivate(context)).toThrow(
      formatException("Unparseable JWT")
    );
  });

  // When exp is missing
  it("should block requests with invalid payload", () => {
    expect.assertions(1);

    const payload = {};
    const token = JWT.sign(payload, "key");

    const guard = new JwtGuard();
    const context = {
      switchToHttp: jest.fn(() => ({
        getRequest: () => ({
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      })),
    };

    // @ts-ignore
    expect(() => guard.canActivate(context)).toThrow(
      formatException("Invalid JWT payload provided")
    );
  });

  it("should block requests when the JWT is expired", () => {
    expect.assertions(1);

    const payload = {};
    const token = JWT.sign(payload, "key", {
      expiresIn: "15 minutes",
      now: new Date("December 17, 1995 03:24:00"),
    });
    const guard = new JwtGuard();
    const context = {
      switchToHttp: jest.fn(() => ({
        getRequest: () => ({
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      })),
    };

    // @ts-ignore
    expect(() => guard.canActivate(context)).toThrow(
      formatException("Expired JWT")
    );
  });

  it("should block requests when the JWT is missing the DID", () => {
    expect.assertions(4);
    const guard = new JwtGuard();

    let payload = {};
    let token = JWT.sign(payload, "key", {
      expiresIn: "15 minutes",
    });

    let context = {
      switchToHttp: jest.fn(() => ({
        getRequest: () => ({
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      })),
    };

    // @ts-ignore
    expect(() => guard.canActivate(context)).toThrow(
      formatException("Missing or malformed DID in JWT")
    );

    payload = {
      sub_jwk: null,
    };
    token = JWT.sign(payload, "key", {
      expiresIn: "15 minutes",
    });

    context = {
      switchToHttp: jest.fn(() => ({
        getRequest: () => ({
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      })),
    };

    // @ts-ignore
    expect(() => guard.canActivate(context)).toThrow(
      formatException("Missing or malformed DID in JWT")
    );

    payload = {
      sub_jwk: {
        kid: null,
      },
    };
    token = JWT.sign(payload, "key", {
      expiresIn: "15 minutes",
    });

    context = {
      switchToHttp: jest.fn(() => ({
        getRequest: () => ({
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      })),
    };

    // @ts-ignore
    expect(() => guard.canActivate(context)).toThrow(
      formatException("Missing or malformed DID in JWT")
    );

    payload = {
      sub_jwk: {
        kid: "did:xyz:123",
      },
    };
    token = JWT.sign(payload, "key", {
      expiresIn: "15 minutes",
    });

    context = {
      switchToHttp: jest.fn(() => ({
        getRequest: () => ({
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      })),
    };

    // @ts-ignore
    expect(() => guard.canActivate(context)).toThrow(
      formatException("Missing or malformed DID in JWT")
    );
  });

  it("should allow requests with a valid JWT", () => {
    expect.assertions(1);
    const guard = new JwtGuard();

    const payload = {
      sub_jwk: {
        kid: "did:ebsi:123",
      },
    };

    const token = JWT.sign(payload, "key", {
      expiresIn: "15 minutes",
    });

    const context = {
      switchToHttp: jest.fn(() => ({
        getRequest: () => ({
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      })),
    };

    // @ts-ignore
    expect(guard.canActivate(context)).toBe(true);
  });
});
