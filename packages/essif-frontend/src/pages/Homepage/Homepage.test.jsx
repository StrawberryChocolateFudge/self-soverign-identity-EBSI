import React from "react";
import ReactDOM from "react-dom";
import TestRenderer from "react-test-renderer"; // ES6
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { JWT, JWK } from "jose";
import Homepage from "./Homepage";
import Auth from "../../components/Auth/Auth";

describe("homepage", () => {
  // eslint-disable-next-line jest/no-hooks
  beforeEach(() => {
    localStorage.clear();
  });

  // Create JWT
  const key = JWK.asKey({
    kty: "oct",
    k: "hJtXIZ2uSN5kbQfbtTNWbpdmhkV8FJG-Onbc6mxCcYg",
  });

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

  it("renders without crashing", () => {
    expect.assertions(0);

    const div = document.createElement("div");
    const history = createMemoryHistory();

    ReactDOM.render(
      <Auth>
        <Router history={history}>
          <Homepage />
        </Router>
      </Auth>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });

  it("displays the homepage correctly (not authenticated)", () => {
    expect.assertions(1);

    const history = createMemoryHistory();

    const component = TestRenderer.create(
      <Auth>
        <Router history={history}>
          <Homepage />
        </Router>
      </Auth>
    );

    // Check snapshot
    expect(component.toJSON()).toMatchInlineSnapshot(`
      Array [
        <h1
          className="ecl-page-header-harmonised__title"
        >
          Landing page
        </h1>,
        <p
          className="ecl-page-header-harmonised__description ecl-u-mb-xl"
        >
          Disclaimer: this is a demo website to show the technical capabilities of the EBSI project.
        </p>,
        <p
          className="ecl-u-type-paragraph"
        >
          Prerequisites:
        </p>,
        <ul
          className="ecl-unordered-list"
        >
          <li
            className="ecl-unordered-list__item"
          >
            The user must have created a wallet.
          </li>
          <li
            className="ecl-unordered-list__item"
          >
            The user must be logged in the EBSI Wallet using EU Login.
          </li>
        </ul>,
        <h2
          className="ecl-u-type-heading-2"
        >
          Step 1: log in
        </h2>,
        <p
          className="ecl-u-type-paragraph"
        >
          To get started, please
           
          <a
            className="ecl-link"
            href="/login"
            onClick={[Function]}
          >
            log in
          </a>
          .
        </p>,
      ]
    `);
  });

  it("displays the homepage correctly (authenticated)", () => {
    expect.assertions(1);

    localStorage.setItem("ESSIF-JWT", token);
    localStorage.setItem("ESSIF-Ticket", "fake-ticket");

    const history = createMemoryHistory();

    const component = TestRenderer.create(
      <Auth>
        <Router history={history}>
          <Homepage />
        </Router>
      </Auth>
    );

    // Check snapshot
    expect(component.toJSON()).toMatchInlineSnapshot(`
      Array [
        <h1
          className="ecl-page-header-harmonised__title"
        >
          Landing page
        </h1>,
        <p
          className="ecl-page-header-harmonised__description ecl-u-mb-xl"
        >
          Disclaimer: this is a demo website to show the technical capabilities of the EBSI project.
        </p>,
        <p
          className="ecl-u-type-paragraph"
        >
          Prerequisites:
        </p>,
        <ul
          className="ecl-unordered-list"
        >
          <li
            className="ecl-unordered-list__item"
          >
            The user must have created a wallet.
          </li>
          <li
            className="ecl-unordered-list__item"
          >
            The user must be logged in the EBSI Wallet using EU Login.
          </li>
        </ul>,
        <h2
          className="ecl-u-type-heading-2"
        >
          Step 2: collect eID VC
        </h2>,
        <p
          className="ecl-u-type-paragraph"
        >
          You are now logged in. The Sample Verifiable ID Issuer can now create your eID VC and use eIDAS Bridge to eSeal it.
        </p>,
        <p
          className="ecl-u-type-paragraph"
        >
          Now go to the
           
          <a
            className="ecl-link"
            href="/request-vc"
            onClick={[Function]}
          >
            eID VC request page
          </a>
          .
        </p>,
      ]
    `);
  });

  it("displays the homepage correctly (authenticated + VC issued)", () => {
    expect.assertions(1);

    localStorage.setItem("ESSIF-JWT", token);
    localStorage.setItem("ESSIF-Ticket", "fake-ticket");
    localStorage.setItem("ESSIF-VC-issued", "yes");

    const history = createMemoryHistory();

    localStorage.setItem("ESSIF-VC-issued", "yes");

    const component = TestRenderer.create(
      <Auth>
        <Router history={history}>
          <Homepage />
        </Router>
      </Auth>
    );

    // Check snapshot
    expect(component.toJSON()).toMatchInlineSnapshot(`
      Array [
        <h1
          className="ecl-page-header-harmonised__title"
        >
          Landing page
        </h1>,
        <p
          className="ecl-page-header-harmonised__description ecl-u-mb-xl"
        >
          Disclaimer: this is a demo website to show the technical capabilities of the EBSI project.
        </p>,
        <p
          className="ecl-u-type-paragraph"
        >
          Prerequisites:
        </p>,
        <ul
          className="ecl-unordered-list"
        >
          <li
            className="ecl-unordered-list__item"
          >
            The user must have created a wallet.
          </li>
          <li
            className="ecl-unordered-list__item"
          >
            The user must be logged in the EBSI Wallet using EU Login.
          </li>
        </ul>,
        <h2
          className="ecl-u-type-heading-2"
        >
          Step 3: check your notifications in your wallet
        </h2>,
        <p
          className="ecl-u-type-paragraph"
        >
          Your request has been issued. Please check your
           
          <a
            className="ecl-link"
            href="https://app.intebsi.xyz/wallet/notifications"
          >
            wallet's notifications
          </a>
          .
        </p>,
        <p
          className="ecl-u-type-paragraph"
        >
          When you are on the wallet and have completed your tasks there, don't forget to tap on the "EBSI DEMO" link (top right corner) to return to the demonstration flow.
        </p>,
      ]
    `);
  });
});
