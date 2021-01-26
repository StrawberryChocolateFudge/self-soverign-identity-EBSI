import React from "react";
import ReactDOM from "react-dom";
import { render, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { Router, Route, Switch } from "react-router-dom";
import { createMemoryHistory } from "history";
import { JWT, JWK } from "jose";
import Auth from "../../components/Auth/Auth";
import Login from "./Login";

describe("login", () => {
  // Create key for signing JWT
  const key = JWK.asKey({
    kty: "oct",
    k: "hJtXIZ2uSN5kbQfbtTNWbpdmhkV8FJG-Onbc6mxCcYg",
  });

  // eslint-disable-next-line jest/no-hooks
  beforeEach(() => {
    localStorage.clear();
    global.window = Object.create(window);
  });

  // eslint-disable-next-line jest/no-hooks
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders without crashing", () => {
    expect.assertions(0);

    const div = document.createElement("div");
    const history = createMemoryHistory();
    ReactDOM.render(
      <Auth>
        <Router history={history}>
          <Login />
        </Router>
      </Auth>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });

  it("renders correctly without JWT", () => {
    expect.assertions(1);

    const history = createMemoryHistory();
    const { container } = render(
      <Auth>
        <Router history={history}>
          <Login />
        </Router>
      </Auth>
    );

    // Check snapshot before click on "Login"
    expect(container).toMatchInlineSnapshot(`
      <div>
        <h1
          class="ecl-page-header-harmonised__title ecl-u-mb-xl"
        >
          Log in
        </h1>
        <p
          class="ecl-u-type-paragraph"
        >
          This page acts as a demonstrator to simulate the Trusted Identity Provider. On real life Trusted Identity Provider Web site, a user should log with his existing credential received from that provider (like eID card reader, token, mobile app…). During the login simulation, we will check that you have correctly followed the EBSI onboarding process. If the verification fails, you will be redirected to the onboarding page.
        </p>
        <button
          class="ecl-button ecl-button--call"
          type="button"
        >
          Log in
        </button>
      </div>
    `);
  });

  it("renders correctly with empty JWT", () => {
    expect.assertions(1);

    localStorage.setItem("ESSIF-JWT", "");
    const history = createMemoryHistory();
    const { container } = render(
      <Auth>
        <Router history={history}>
          <Login />
        </Router>
      </Auth>
    );

    // Check snapshot before click on "Login"
    expect(container).toMatchInlineSnapshot(`
      <div>
        <h1
          class="ecl-page-header-harmonised__title ecl-u-mb-xl"
        >
          Log in
        </h1>
        <p
          class="ecl-u-type-paragraph"
        >
          This page acts as a demonstrator to simulate the Trusted Identity Provider. On real life Trusted Identity Provider Web site, a user should log with his existing credential received from that provider (like eID card reader, token, mobile app…). During the login simulation, we will check that you have correctly followed the EBSI onboarding process. If the verification fails, you will be redirected to the onboarding page.
        </p>
        <button
          class="ecl-button ecl-button--call"
          type="button"
        >
          Log in
        </button>
      </div>
    `);
  });

  it("renders correctly with malformed JWT", () => {
    expect.assertions(1);

    localStorage.setItem("ESSIF-JWT", "123");
    const history = createMemoryHistory();
    const { container } = render(
      <Auth>
        <Router history={history}>
          <Login />
        </Router>
      </Auth>
    );

    // Check snapshot before click on "Login"
    expect(container).toMatchInlineSnapshot(`
      <div>
        <h1
          class="ecl-page-header-harmonised__title ecl-u-mb-xl"
        >
          Log in
        </h1>
        <p
          class="ecl-u-type-paragraph"
        >
          This page acts as a demonstrator to simulate the Trusted Identity Provider. On real life Trusted Identity Provider Web site, a user should log with his existing credential received from that provider (like eID card reader, token, mobile app…). During the login simulation, we will check that you have correctly followed the EBSI onboarding process. If the verification fails, you will be redirected to the onboarding page.
        </p>
        <button
          class="ecl-button ecl-button--call"
          type="button"
        >
          Log in
        </button>
      </div>
    `);
  });

  it("should redirect the user to the wallet after requesting DID Auth", async () => {
    expect.hasAssertions();

    const history = createMemoryHistory({
      initialEntries: [{ pathname: "/login", state: { from: "/test" } }],
    });

    const { container } = render(
      <Auth>
        <Router history={history} staticContext={undefined}>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route path="*">
              <div>Other route</div>
            </Route>
          </Switch>
        </Router>
      </Auth>
    );

    // Check snapshot before click on "Login"
    expect(container).toMatchInlineSnapshot(`
      <div>
        <h1
          class="ecl-page-header-harmonised__title ecl-u-mb-xl"
        >
          Log in
        </h1>
        <p
          class="ecl-u-type-paragraph"
        >
          This page acts as a demonstrator to simulate the Trusted Identity Provider. On real life Trusted Identity Provider Web site, a user should log with his existing credential received from that provider (like eID card reader, token, mobile app…). During the login simulation, we will check that you have correctly followed the EBSI onboarding process. If the verification fails, you will be redirected to the onboarding page.
        </p>
        <button
          class="ecl-button ecl-button--call"
          type="button"
        >
          Log in
        </button>
      </div>
    `);

    // Mock error
    const mockErrorFetchPromise = Promise.resolve({
      status: 400,
    });
    let fetchSpy = jest
      .spyOn(global, "fetch")
      .mockImplementationOnce(() => mockErrorFetchPromise);

    // Submit
    const loginButton = container.querySelector("button[type=button]");
    fireEvent.click(loginButton);

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));

    expect(container).toHaveTextContent(
      "There was a problem while creating the DID Auth Request. Status Code: 400. Please contact the site administrators to find out what happened."
    );

    // Mock success
    const mockSuccessFetchPromise = Promise.resolve({
      status: 200,
      json: () => ({
        nonce: "123",
        redirectUrl: "http://wallet.dev",
      }),
    });

    delete window.location;
    global.window = Object.create(window);
    window.location = {
      href: "http://example.org/",
    };

    fetchSpy.mockRestore();
    fetchSpy = jest
      .spyOn(global, "fetch")
      .mockImplementationOnce(() => mockSuccessFetchPromise);

    const localStorageSpy = jest
      .spyOn(Object.getPrototypeOf(localStorage), "setItem")
      .mockImplementationOnce(() => {});

    fireEvent.click(loginButton);

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(localStorageSpy).toHaveBeenCalledTimes(1));

    expect(localStorageSpy).toHaveBeenCalledWith("ESSIF-nonce", "123");
    expect(window.location.href).toStrictEqual("http://wallet.dev");
  });

  it("should display an error when the DID Auth response JWT is not approved by the backend", async () => {
    expect.hasAssertions();

    const nonce = "nonce-123";
    const didAuthResponseJwt = "123";

    window.localStorage.setItem("ESSIF-nonce", nonce);

    const history = createMemoryHistory({
      initialEntries: [
        {
          pathname: "/login",
          state: { from: "/test" },
        },
      ],
    });

    global.window = Object.create(window);
    Object.defineProperty(window, "location", {
      value: {
        search: `?response=${didAuthResponseJwt}`,
      },
    });

    // Mock error
    const mockErrorFetchPromise = Promise.resolve({
      status: 400,
    });
    const fetchSpy = jest
      .spyOn(global, "fetch")
      .mockImplementation(() => mockErrorFetchPromise);

    const { container } = render(
      <Auth>
        <Router history={history} staticContext={undefined}>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route path="*">
              <div>Other route</div>
            </Route>
          </Switch>
        </Router>
      </Auth>
    );

    // Should be checking the response parameter
    expect(container).toMatchInlineSnapshot(`
      <div>
        <h1
          class="ecl-page-header-harmonised__title ecl-u-mb-xl"
        >
          Log in
        </h1>
        <p
          class="ecl-u-type-paragraph"
        >
          This page acts as a demonstrator to simulate the Trusted Identity Provider. On real life Trusted Identity Provider Web site, a user should log with his existing credential received from that provider (like eID card reader, token, mobile app…). During the login simulation, we will check that you have correctly followed the EBSI onboarding process. If the verification fails, you will be redirected to the onboarding page.
        </p>
        <button
          class="ecl-button ecl-button--call"
          disabled=""
          type="button"
        >
          Verifiying request...
        </button>
      </div>
    `);

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          didAuthResponseJwt,
          nonce,
        }),
      })
    );

    expect(container).toHaveTextContent(
      "There was a problem while validating the DID Auth Response. Status Code: 400."
    );

    fetchSpy.mockRestore();
  });

  it("should display an error when the DID Auth response JWT is expired", async () => {
    expect.hasAssertions();

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

    const nonce = "nonce-123";
    const didAuthResponseJwt = token;

    window.localStorage.setItem("ESSIF-nonce", nonce);

    const history = createMemoryHistory({
      initialEntries: [
        {
          pathname: "/login",
          state: { from: "/test" },
        },
      ],
    });

    global.window = Object.create(window);
    Object.defineProperty(window, "location", {
      value: {
        search: `?response=${didAuthResponseJwt}`,
      },
    });

    // Mock successful validation
    const mockSuccessFetchPromise = Promise.resolve({
      status: 201,
    });
    const fetchSpy = jest
      .spyOn(global, "fetch")
      .mockImplementation(() => mockSuccessFetchPromise);

    const { container } = render(
      <Auth>
        <Router history={history} staticContext={undefined}>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route path="*">
              <div>Other route</div>
            </Route>
          </Switch>
        </Router>
      </Auth>
    );

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          didAuthResponseJwt,
          nonce,
        }),
      })
    );

    expect(container).toHaveTextContent(
      "Error during login: your JWT has expired."
    );
  });

  it("should display an error when the DID Auth response JWT is missing some props", async () => {
    expect.hasAssertions();

    const payload = {
      sub_jwk: {
        kid: "did:ebsi:0x1234",
      },
    };

    const token = JWT.sign(payload, key, {
      // audience: "ebsi-wallet", <- missing prop
      expiresIn: "2 hours",
      header: { typ: "JWT" },
      subject: "test",
    });

    const nonce = "nonce-123";
    const didAuthResponseJwt = token;

    window.localStorage.setItem("ESSIF-nonce", nonce);

    const history = createMemoryHistory({
      initialEntries: [
        {
          pathname: "/login",
          state: { from: "/test" },
        },
      ],
    });

    global.window = Object.create(window);
    Object.defineProperty(window, "location", {
      value: {
        search: `?response=${didAuthResponseJwt}`,
      },
    });

    // Mock successful validation
    const mockSuccessFetchPromise = Promise.resolve({
      status: 201,
    });
    const fetchSpy = jest
      .spyOn(global, "fetch")
      .mockImplementation(() => mockSuccessFetchPromise);

    const { container } = render(
      <Auth>
        <Router history={history} staticContext={undefined}>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route path="*">
              <div>Other route</div>
            </Route>
          </Switch>
        </Router>
      </Auth>
    );

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          didAuthResponseJwt,
          nonce,
        }),
      })
    );

    expect(container).toHaveTextContent(
      "Error during login: your JWT is missing some essential properties."
    );
  });

  it("should display an error when the DID Auth response JWT is missing the DID", async () => {
    expect.hasAssertions();

    const payload = {
      sub_jwk: {
        // kid: "did:ebsi:0x1234",
      },
    };

    const token = JWT.sign(payload, key, {
      audience: "ebsi-wallet",
      expiresIn: "2 hours",
      header: { typ: "JWT" },
      subject: "test",
    });

    const nonce = "nonce-123";
    const didAuthResponseJwt = token;

    window.localStorage.setItem("ESSIF-nonce", nonce);

    const history = createMemoryHistory({
      initialEntries: [
        {
          pathname: "/login",
          state: { from: "/test" },
        },
      ],
    });

    global.window = Object.create(window);
    Object.defineProperty(window, "location", {
      value: {
        search: `?response=${didAuthResponseJwt}`,
      },
    });

    // Mock successful validation
    const mockSuccessFetchPromise = Promise.resolve({
      status: 201,
    });
    const fetchSpy = jest
      .spyOn(global, "fetch")
      .mockImplementation(() => mockSuccessFetchPromise);

    const { container } = render(
      <Auth>
        <Router history={history} staticContext={undefined}>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route path="*">
              <div>Other route</div>
            </Route>
          </Switch>
        </Router>
      </Auth>
    );

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          didAuthResponseJwt,
          nonce,
        }),
      })
    );

    expect(container).toHaveTextContent(
      "Error during login: your JWT does not contain your DID."
    );
  });

  it("should display an error when the DID Auth response JWT is malfored", async () => {
    expect.hasAssertions();

    const token = "123";
    const nonce = "nonce-123";
    const didAuthResponseJwt = token;

    window.localStorage.setItem("ESSIF-nonce", nonce);

    const history = createMemoryHistory({
      initialEntries: [
        {
          pathname: "/login",
          state: { from: "/test" },
        },
      ],
    });

    global.window = Object.create(window);
    Object.defineProperty(window, "location", {
      value: {
        search: `?response=${didAuthResponseJwt}`,
      },
    });

    // Mock successful validation
    const mockSuccessFetchPromise = Promise.resolve({
      status: 201,
    });
    const fetchSpy = jest
      .spyOn(global, "fetch")
      .mockImplementation(() => mockSuccessFetchPromise);

    const { container } = render(
      <Auth>
        <Router history={history} staticContext={undefined}>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route path="*">
              <div>Other route</div>
            </Route>
          </Switch>
        </Router>
      </Auth>
    );

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          didAuthResponseJwt,
          nonce,
        }),
      })
    );

    expect(container).toHaveTextContent(
      "Error during login: JWT is malformed, parsing failed."
    );
  });

  it("should display an error when the DID Auth response JWT is missing", async () => {
    expect.hasAssertions();

    const token = "";
    const nonce = "nonce-123";
    const didAuthResponseJwt = token;

    window.localStorage.setItem("ESSIF-nonce", nonce);

    const history = createMemoryHistory({
      initialEntries: [
        {
          pathname: "/login",
          state: { from: "/test" },
        },
      ],
    });

    global.window = Object.create(window);
    Object.defineProperty(window, "location", {
      value: {
        search: `?response=${didAuthResponseJwt}`,
      },
    });

    // Mock successful validation
    const mockSuccessFetchPromise = Promise.resolve({
      status: 201,
    });
    const fetchSpy = jest
      .spyOn(global, "fetch")
      .mockImplementation(() => mockSuccessFetchPromise);

    const { container } = render(
      <Auth>
        <Router history={history} staticContext={undefined}>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route path="*">
              <div>Other route</div>
            </Route>
          </Switch>
        </Router>
      </Auth>
    );

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          didAuthResponseJwt,
          nonce,
        }),
      })
    );

    expect(container).toHaveTextContent(
      "Error during login: JWT not available or empty."
    );
  });

  it("should redirect to state.from if the JWT is valid", async () => {
    expect.hasAssertions();

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

    const nonce = "nonce-123";
    const didAuthResponseJwt = token;

    window.localStorage.setItem("ESSIF-nonce", nonce);

    const history = createMemoryHistory({
      initialEntries: [
        {
          pathname: "/login",
          state: { from: "/test" },
        },
      ],
    });

    global.window = Object.create(window);
    Object.defineProperty(window, "location", {
      value: {
        search: `?response=${didAuthResponseJwt}`,
      },
    });

    // Mock successful validation
    const mockSuccessFetchPromise = Promise.resolve({
      status: 201,
    });
    const fetchSpy = jest
      .spyOn(global, "fetch")
      .mockImplementation(() => mockSuccessFetchPromise);

    render(
      <Auth>
        <Router history={history} staticContext={undefined}>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route path="*">
              <div>Other route</div>
            </Route>
          </Switch>
        </Router>
      </Auth>
    );

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          didAuthResponseJwt,
          nonce,
        }),
      })
    );

    // Check if user is correctly redirected to "/test" (location.state.from)
    expect(history.action).toBe("REPLACE");
    expect(history.location.pathname).toBe("/test");
  });

  it("should redirect to / the JWT is valid and state.from is not defined", async () => {
    expect.hasAssertions();

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

    const nonce = "nonce-123";
    const didAuthResponseJwt = token;

    window.localStorage.setItem("ESSIF-nonce", nonce);

    const history = createMemoryHistory({
      initialEntries: [
        {
          pathname: "/login",
        },
      ],
    });

    global.window = Object.create(window);
    Object.defineProperty(window, "location", {
      value: {
        search: `?response=${didAuthResponseJwt}`,
      },
    });

    // Mock successful validation
    const mockSuccessFetchPromise = Promise.resolve({
      status: 201,
    });
    const fetchSpy = jest
      .spyOn(global, "fetch")
      .mockImplementation(() => mockSuccessFetchPromise);

    render(
      <Auth>
        <Router history={history} staticContext={undefined}>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route path="*">
              <div>Other route</div>
            </Route>
          </Switch>
        </Router>
      </Auth>
    );

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          didAuthResponseJwt,
          nonce,
        }),
      })
    );

    // Check if user is correctly redirected to "/test" (location.state.from)
    expect(history.action).toBe("REPLACE");
    expect(history.location.pathname).toBe("/");
  });
});
