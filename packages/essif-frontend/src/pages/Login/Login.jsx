import React, { useContext, useState, useEffect } from "react";
import { Redirect, useLocation } from "react-router-dom";
import icons from "@ecl/ec-preset-website/dist/images/icons/sprites/icons.svg";
import { AuthContext, LOGIN_CODES } from "../../components/Auth/Auth";
import { P } from "../../components/Typography/Typography";
import {
  REACT_APP_WALLET_WEB_CLIENT_URL,
  REACT_APP_BACKEND_EXTERNAL_URL,
} from "../../env";

const REQUEST_STATUS = {
  NOT_SENT: "",
  PENDING: "pending",
  VERIFYING: "verifying",
  OK: "ok",
  FAILED: "failed",
};

function Login() {
  const urlParams = new URLSearchParams(window.location.search);

  const [requestStatus, setRequestStatus] = useState(
    urlParams.has("response")
      ? REQUEST_STATUS.VERIFYING
      : REQUEST_STATUS.NOT_SENT
  );
  const [errorMessage, setErrorMessage] = useState("");
  const { isAuthenticated, login } = useContext(AuthContext);
  const [errorDuringLogin, setErrorDuringLogin] = useState(LOGIN_CODES.SUCCESS);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    async function validateLogin() {
      try {
        const didAuthResponseJwt = urlParams.get("response");
        const requestBody = {
          didAuthResponseJwt,
          nonce: window.localStorage.getItem("ESSIF-nonce"),
        };

        const requestHeaders = new Headers();
        requestHeaders.append("Content-Type", "application/json");

        await fetch(
          `${REACT_APP_BACKEND_EXTERNAL_URL}/api/did-auth-validations`,
          {
            method: "POST",
            headers: requestHeaders,
            body: JSON.stringify(requestBody),
          }
        ).then((response) => {
          if (mounted) {
            if (response.status !== 201) {
              throw new Error(
                `There was a problem while validating the DID Auth Response. Status Code: ${response.status}. Please contact the site administrators to find out what happened.`
              );
            }

            window.localStorage.setItem("ESSIF-JWT", didAuthResponseJwt);

            const loginCode = login();
            if (loginCode !== LOGIN_CODES.SUCCESS) {
              setErrorDuringLogin(loginCode);
            }
          }
        });
      } catch (error) {
        if (mounted) {
          setErrorMessage(error.message);
          setRequestStatus(REQUEST_STATUS.FAILED);
        }
      }
    }

    (async () => {
      if (urlParams.has("response")) {
        await validateLogin();
      }
    })();

    return () => {
      mounted = false;
    };
  });

  if (isAuthenticated) {
    if (location && location.state && location.state.from) {
      return <Redirect to={location.state.from} />;
    }

    return <Redirect to="/" />;
  }

  async function handleLogin() {
    setRequestStatus(REQUEST_STATUS.PENDING);

    fetch(`${REACT_APP_BACKEND_EXTERNAL_URL}/api/did-auth`, {
      method: "GET",
    })
      .then((response) => {
        if (response.status !== 200) {
          throw new Error(
            `There was a problem while creating the DID Auth Request. Status Code: ${response.status}. Please contact the site administrators to find out what happened.`
          );
        }

        return response.json();
      })
      .then((res) => {
        // 1. Store nonce in localStorage
        window.localStorage.setItem("ESSIF-nonce", res.nonce);

        // 2. Redirect to the wallet web client
        window.location.href = res.redirectUrl;
      })
      .catch((error) => {
        setErrorMessage(error.message);
        setRequestStatus(REQUEST_STATUS.FAILED);
      });
  }

  return (
    <>
      <h1 className="ecl-page-header-harmonised__title ecl-u-mb-xl">Log in</h1>
      <P>
        This page acts as a demonstrator to simulate the Trusted Identity
        Provider. On real life Trusted Identity Provider Web site, a user should
        log with his existing credential received from that provider (like eID
        card reader, token, mobile app…). During the login simulation, we will
        check that you have correctly followed the EBSI onboarding process. If
        the verification fails, you will be redirected to the onboarding page.
      </P>
      <button
        onClick={handleLogin}
        type="button"
        className="ecl-button ecl-button--call"
        disabled={
          requestStatus === REQUEST_STATUS.PENDING ||
          requestStatus === REQUEST_STATUS.VERIFYING
        }
      >
        {(() => {
          if (requestStatus === REQUEST_STATUS.PENDING)
            return "Preparing request...";

          if (requestStatus === REQUEST_STATUS.VERIFYING)
            return "Verifiying request...";

          return "Log in";
        })()}
      </button>
      {(errorDuringLogin !== LOGIN_CODES.SUCCESS ||
        requestStatus === REQUEST_STATUS.FAILED) && (
        <div
          role="alert"
          className="ecl-message ecl-message--error ecl-u-mt-xl"
          data-ecl-message="true"
        >
          <svg
            focusable="false"
            aria-hidden="true"
            className="ecl-message__icon ecl-icon ecl-icon--l"
          >
            <use xlinkHref={`${icons}#notifications--error`} />
          </svg>
          <div className="ecl-message__content">
            <div className="ecl-message__title">
              Ouch! Something went wrong...
            </div>
            <p className="ecl-message__description">
              {(() => {
                if (errorDuringLogin === LOGIN_CODES.MALFORMED_JWT) {
                  return "Error during login: JWT is malformed, parsing failed.";
                }
                if (errorDuringLogin === LOGIN_CODES.MISSING_JWT) {
                  return (
                    <>
                      Error during login: JWT not available or empty. Please
                      make sure you are authenticated with{" "}
                      <a
                        href={REACT_APP_WALLET_WEB_CLIENT_URL}
                        className="ecl-link"
                      >
                        the wallet
                      </a>
                      .
                    </>
                  );
                }
                if (errorDuringLogin === LOGIN_CODES.MISSING_PROPS_JWT) {
                  return (
                    <>
                      Error during login: your JWT is missing some essential
                      properties. Please try to log in again in{" "}
                      <a
                        href={REACT_APP_WALLET_WEB_CLIENT_URL}
                        className="ecl-link"
                      >
                        the wallet
                      </a>
                      .
                    </>
                  );
                }
                if (errorDuringLogin === LOGIN_CODES.MISSING_DID) {
                  return (
                    <>
                      Error during login: your JWT does not contain your DID.
                      Please try to log in again in{" "}
                      <a
                        href={REACT_APP_WALLET_WEB_CLIENT_URL}
                        className="ecl-link"
                      >
                        the wallet
                      </a>
                      .
                    </>
                  );
                }
                if (errorDuringLogin === LOGIN_CODES.EXPIRED_JWT) {
                  return (
                    <>
                      Error during login: your JWT has expired. Please log in
                      again in{" "}
                      <a
                        href={REACT_APP_WALLET_WEB_CLIENT_URL}
                        className="ecl-link"
                      >
                        the wallet
                      </a>
                      .
                    </>
                  );
                }
                if (requestStatus === REQUEST_STATUS.FAILED) {
                  return errorMessage;
                }
                return null;
              })()}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default Login;
