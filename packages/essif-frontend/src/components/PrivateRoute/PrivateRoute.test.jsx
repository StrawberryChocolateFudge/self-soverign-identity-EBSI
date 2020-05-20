import React from "react";
import ReactDOM from "react-dom";
import TestRenderer from "react-test-renderer"; // ES6
import { Router, Route, Switch } from "react-router-dom";
import { createMemoryHistory } from "history";
import { JWT, JWK } from "jose";
import Auth from "../Auth/Auth";
import PrivateRoute from "./PrivateRoute";

describe("private route", () => {
  // Create key for signing JWT
  const key = JWK.asKey({
    kty: "oct",
    k: "hJtXIZ2uSN5kbQfbtTNWbpdmhkV8FJG-Onbc6mxCcYg",
  });

  // eslint-disable-next-line jest/no-hooks
  beforeEach(() => {
    localStorage.clear();
  });

  const c = () => <div>Hello world!</div>;

  it("renders without crashing", () => {
    expect.assertions(0);

    const div = document.createElement("div");
    const history = createMemoryHistory({ initialEntries: ["/test"] });

    ReactDOM.render(
      <Auth>
        <Router history={history}>
          <Switch>
            <PrivateRoute exact path="/test" component={c} />
            <Route exact path="/login">
              Login
            </Route>
            <Route path="*">Other route</Route>
          </Switch>
        </Router>
      </Auth>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });

  it("redirects when the user is not authenticated", () => {
    expect.assertions(5);

    const history = createMemoryHistory({ initialEntries: ["/test"] });

    // Check if user is the current URL is "/test"
    expect(history.location.pathname).toBe("/test");

    const component = TestRenderer.create(
      <Auth>
        <Router history={history}>
          <Switch>
            <PrivateRoute exact path="/test" component={c} />
            <Route exact path="/login">
              Login
            </Route>
            <Route path="*">Other route</Route>
          </Switch>
        </Router>
      </Auth>
    );

    // Check if user is correctly redirected to "/login" (with correct state)
    expect(history.action).toBe("REPLACE");
    expect(history.location.pathname).toBe("/login");
    expect(history.location.state).toMatchObject({
      from: { pathname: "/test" },
    });

    // Check snapshot (should print "Other route")
    expect(component.toJSON()).toMatchInlineSnapshot(`"Login"`);
  });

  it("renders correctly when the user is authenticated", () => {
    expect.assertions(2);

    const payload = {
      sub_jwk: {
        kid: "did:ebsi:0x1234",
      },
    };

    const token = JWT.sign(payload, key, {
      audience: "ebsi-wallet",
      expiresIn: "2 hours",
      header: {
        typ: "JWT",
      },
      subject: "test",
    });

    localStorage.setItem("ESSIF-JWT", token);
    localStorage.setItem("ESSIF-Ticket", "fake-ticket");

    const history = createMemoryHistory({ initialEntries: ["/test"] });

    const component = TestRenderer.create(
      <Auth>
        <Router history={history}>
          <Switch>
            <PrivateRoute exact path="/test" component={c} />
            <Route exact path="/login">
              Login
            </Route>
            <Route path="*">Other route</Route>
          </Switch>
        </Router>
      </Auth>
    );

    // Check snapshot (should render "<div>Hello world!</div>")
    expect(component.toJSON()).toMatchInlineSnapshot(`
      <div>
        Hello world!
      </div>
    `);

    // Check current URL (should be "/test")
    expect(history.location.pathname).toBe("/test");
  });
});
