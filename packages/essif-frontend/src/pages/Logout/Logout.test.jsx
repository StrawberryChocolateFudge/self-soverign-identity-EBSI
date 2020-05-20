import React from "react";
import ReactDOM from "react-dom";
import TestRenderer from "react-test-renderer"; // ES6
import { Router, Route, Switch } from "react-router-dom";
import { createMemoryHistory } from "history";
import { JWT, JWK } from "jose";
import Auth from "../../components/Auth/Auth";
import Logout from "./Logout";

describe("logout", () => {
  // Create key for signing JWT
  const key = JWK.asKey({
    kty: "oct",
    k: "hJtXIZ2uSN5kbQfbtTNWbpdmhkV8FJG-Onbc6mxCcYg",
  });

  // eslint-disable-next-line jest/no-hooks
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders without crashing", () => {
    expect.assertions(0);

    const div = document.createElement("div");
    const history = createMemoryHistory();

    ReactDOM.render(
      <Auth>
        <Router history={history}>
          <Logout />
        </Router>
      </Auth>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });

  it("redirects without JWT (not authenticated)", () => {
    expect.assertions(4);

    const history = createMemoryHistory({ initialEntries: ["/logout"] });

    // Check if user is the current URL is "/logout"
    expect(history.location.pathname).toBe("/logout");

    const component = TestRenderer.create(
      <Auth>
        <Router history={history}>
          <Switch>
            <Route exact path="/logout" component={Logout} />
            <Route path="*">
              <div>Other route</div>
            </Route>
          </Switch>
        </Router>
      </Auth>
    );

    // Check if user is correctly redirected to "/" (default redirect)
    expect(history.action).toBe("REPLACE");
    expect(history.location.pathname).toBe("/");

    // Check snapshot (should print "Other route")
    expect(component.toJSON()).toMatchInlineSnapshot(`
      <div>
        Other route
      </div>
    `);
  });

  it("renders correctly when the user is authenticated", () => {
    expect.assertions(5);

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

    const history = createMemoryHistory({ initialEntries: ["/logout"] });

    const component = TestRenderer.create(
      <Auth>
        <Router history={history}>
          <Switch>
            <Route exact path="/logout" component={Logout} />
            <Route path="*">
              <div>Other route</div>
            </Route>
          </Switch>
        </Router>
      </Auth>
    );

    // Check snapshot before click on "Logout"
    expect(component.toJSON()).toMatchInlineSnapshot(`
      Array [
        <h1
          className="ecl-page-header-harmonised__title ecl-u-mb-xl"
        >
          Log out
        </h1>,
        <p
          className="ecl-u-type-paragraph"
        >
          You are about to log out from the simulated authentication system of the Sample Verifiable ID Issuer.
        </p>,
        <button
          className="ecl-button ecl-button--call"
          onClick={[Function]}
          type="button"
        >
          Log out
        </button>,
      ]
    `);

    // Check current URL (should be "/logout")
    expect(history.location.pathname).toBe("/logout");

    // Click on "Logout"
    const button = component.root.findAllByType("button")[0];
    TestRenderer.act(button.props.onClick);

    // Check if user is correctly redirected to "/" (default redirect)
    expect(history.action).toBe("REPLACE");
    expect(history.location.pathname).toBe("/");

    // Check snapshot (should print "Other route")
    expect(component.toJSON()).toMatchInlineSnapshot(`
      <div>
        Other route
      </div>
    `);
  });
});
