import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { H2, P, UL, LI } from "../../components/Typography/Typography";
import { AuthContext } from "../../components/Auth/Auth";
import { REACT_APP_WALLET_WEB_CLIENT_URL } from "../../env";

function Homepage() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <>
      <h1 className="ecl-page-header-harmonised__title">Landing page</h1>
      <p className="ecl-page-header-harmonised__description ecl-u-mb-xl">
        Disclaimer: this is a demo website to show the technical capabilities of
        the EBSI project.
      </p>
      <P>Prerequisites:</P>
      <UL>
        <LI>The user must have created a wallet.</LI>
        <LI>The user must be logged in the EBSI Wallet using EU Login.</LI>
      </UL>
      {!isAuthenticated ? (
        <>
          <H2>Step 1: log in</H2>
          <P>
            To get started, please{" "}
            <Link to="/login" className="ecl-link">
              log in
            </Link>
            .
          </P>
        </>
      ) : (
        <>
          {localStorage.getItem("ESSIF-VC-issued") !== "yes" ? (
            <>
              <H2>Step 2: collect eID VC</H2>
              <P>
                You are now logged in. The Sample Verifiable ID Issuer can now
                create your eID VC and use eIDAS Bridge to eSeal it.
              </P>
              <P>
                Now go to the{" "}
                <Link to="/request-vc" className="ecl-link">
                  eID VC request page
                </Link>
                .
              </P>
            </>
          ) : (
            <>
              <H2>Step 3: check your notifications in your wallet</H2>
              <P>
                Your request has been issued. Please check your{" "}
                <a
                  href={`${REACT_APP_WALLET_WEB_CLIENT_URL}/notifications`}
                  className="ecl-link"
                >
                  wallet&apos;s notifications
                </a>
                .
              </P>
              <P>
                When you are on the wallet and have completed your tasks there,
                don&apos;t forget to tap on the &quot;EBSI DEMO&quot; link (top
                right corner) to return to the demonstration flow.
              </P>
            </>
          )}
        </>
      )}
    </>
  );
}

export default Homepage;
