import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { JWT, JWK } from "jose";
import Auth, {
  AuthContext,
  LOGIN_CODES,
  isTokenExpired,
  isTokenMissingProperties,
} from "./Auth";

describe("isTokenExpired", () => {
  it("should return true when the payload is malformed or missing", () => {
    expect.assertions(4);
    expect(isTokenExpired()).toBe(true);
    expect(isTokenExpired({})).toBe(true);
    expect(isTokenExpired("")).toBe(true);
    expect(isTokenExpired(1)).toBe(true);
  });

  it("should return true when the token is expired", () => {
    expect.assertions(1);
    expect(
      isTokenExpired({
        exp: Date.now() / 1000 - 1, // expired 1 second ago
      })
    ).toBe(true);
  });

  it("should return false when the token is not expired", () => {
    expect.assertions(1);
    expect(
      isTokenExpired({
        exp: Date.now() / 1000 + 3, // expires in 3 seconds
      })
    ).toBe(false);
  });
});

describe("isTokenMissingProperties", () => {
  it("should return true when the payload is malformed or missing", () => {
    expect.assertions(4);
    expect(isTokenMissingProperties()).toBe(true);
    expect(isTokenExpired({})).toBe(true);
    expect(isTokenExpired("")).toBe(true);
    expect(isTokenExpired(1)).toBe(true);
  });

  it("should return false when the payload contains all the properties and these properties are not falsy", () => {
    expect.assertions(1);
    expect(
      isTokenMissingProperties({
        sub: "a",
        iat: "b",
        exp: "c",
        aud: "d",
        sub_jwk: "e",
      })
    ).toBe(false);
  });
});

describe("auth", () => {
  const key = JWK.asKey({
    kty: "oct",
    k: "hJtXIZ2uSN5kbQfbtTNWbpdmhkV8FJG-Onbc6mxCcYg",
  });

  // eslint-disable-next-line jest/no-hooks
  beforeEach(() => {
    localStorage.clear();
  });

  // Dummy test component
  function AuthTest() {
    const { isAuthenticated, code, login } = React.useContext(AuthContext);

    if (isAuthenticated) {
      return <p data-testid="result">Authenticated</p>;
    }

    return (
      <>
        <p data-testid="result">Not authenticated (code: {code})</p>
        <button onClick={login} type="button">
          Login
        </button>
      </>
    );
  }

  it("is not authenticated by default", () => {
    expect.assertions(1);

    const { getByTestId } = render(
      <Auth>
        <AuthTest />
      </Auth>
    );

    expect(getByTestId("result")).toHaveTextContent(
      `Not authenticated (code: ${LOGIN_CODES.MISSING_JWT})`
    );
  });

  it("is not authenticated when clicking on login without JWT", () => {
    expect.assertions(2);

    const { getByTestId, getByText } = render(
      <Auth>
        <AuthTest />
      </Auth>
    );

    expect(getByTestId("result")).toHaveTextContent(
      `Not authenticated (code: ${LOGIN_CODES.MISSING_JWT})`
    );

    fireEvent.click(getByText("Login"));

    expect(getByTestId("result")).toHaveTextContent(
      `Not authenticated (code: ${LOGIN_CODES.MISSING_JWT})`
    );
  });

  it("is not authenticated with a malformed JWT", () => {
    expect.assertions(2);

    const { getByTestId, getByText } = render(
      <Auth>
        <AuthTest />
      </Auth>
    );

    expect(getByTestId("result")).toHaveTextContent(
      `Not authenticated (code: ${LOGIN_CODES.MISSING_JWT})`
    );

    // Set malformed JWT
    localStorage.setItem("ESSIF-JWT", "123");
    fireEvent.click(getByText("Login"));

    expect(getByTestId("result")).toHaveTextContent(
      `Not authenticated (code: ${LOGIN_CODES.MALFORMED_JWT})`
    );
  });

  it("is not authenticated when JWT is missing some properties", () => {
    expect.assertions(2);

    const { getByTestId, getByText } = render(
      <Auth>
        <AuthTest />
      </Auth>
    );

    expect(getByTestId("result")).toHaveTextContent(
      `Not authenticated (code: ${LOGIN_CODES.MISSING_JWT})`
    );

    const payload = {
      sub_jwk: {
        kid: "123",
      },
    };

    const token = JWT.sign(payload, key, {
      // audience: "ebsi-wallet", <- audience is missing
      expiresIn: "2 hours",
      header: { typ: "JWT" },
      subject: "test",
    });

    localStorage.setItem("ESSIF-JWT", token);

    fireEvent.click(getByText("Login"));

    expect(getByTestId("result")).toHaveTextContent(
      `Not authenticated (code: ${LOGIN_CODES.MISSING_PROPS_JWT})`
    );
  });

  it("is not authenticated when JWT is missing the DID", () => {
    expect.assertions(2);

    const { getByTestId, getByText } = render(
      <Auth>
        <AuthTest />
      </Auth>
    );

    expect(getByTestId("result")).toHaveTextContent(
      `Not authenticated (code: ${LOGIN_CODES.MISSING_JWT})`
    );

    // Set partial JWT
    const payload = {
      sub_jwk: {},
    };

    const token = JWT.sign(payload, key, {
      audience: "ebsi-wallet",
      expiresIn: "2 hours",
      header: { typ: "JWT" },
      subject: "test",
    });

    localStorage.setItem("ESSIF-JWT", token);

    fireEvent.click(getByText("Login"));

    expect(getByTestId("result")).toHaveTextContent(
      `Not authenticated (code: ${LOGIN_CODES.MISSING_DID})`
    );
  });

  it("is not authenticated when JWT is expired", () => {
    expect.assertions(2);

    const { getByTestId, getByText } = render(
      <Auth>
        <AuthTest />
      </Auth>
    );

    expect(getByTestId("result")).toHaveTextContent(
      `Not authenticated (code: ${LOGIN_CODES.MISSING_JWT})`
    );

    // Set expired JWT
    const payload = {
      sub_jwk: {
        kid: "did:ebsi:0x1234",
      },
    };

    const token = JWT.sign(payload, key, {
      audience: "ebsi-wallet",
      expiresIn: "2 hours",
      header: { typ: "JWT" },
      subject: "test",
      now: new Date("December 17, 1995 03:24:00"),
    });

    localStorage.setItem("ESSIF-JWT", token);

    fireEvent.click(getByText("Login"));

    expect(getByTestId("result")).toHaveTextContent(
      `Not authenticated (code: ${LOGIN_CODES.EXPIRED_JWT})`
    );
  });

  it("is authenticated with a valid JWT", () => {
    expect.assertions(2);

    const { getByTestId, getByText } = render(
      <Auth>
        <AuthTest />
      </Auth>
    );

    expect(getByTestId("result")).toHaveTextContent(
      `Not authenticated (code: ${LOGIN_CODES.MISSING_JWT})`
    );

    // Set expired JWT
    const payload = {
      sub_jwk: {
        kid: "did:ebsi:0x1234",
      },
    };

    const token = JWT.sign(payload, key, {
      audience: "ebsi-wallet",
      expiresIn: "2 hours",
      header: { typ: "JWT" },
      subject: "test",
    });

    localStorage.setItem("ESSIF-JWT", token);

    fireEvent.click(getByText("Login"));

    expect(getByTestId("result")).toHaveTextContent("Authenticated");
  });
});
