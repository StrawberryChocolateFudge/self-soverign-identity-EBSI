import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import classnames from "classnames";
import logo from "@ecl/ec-preset-website/dist/images/logo/logo--en.svg";
import icons from "@ecl/ec-preset-website/dist/images/icons/sprites/icons.svg";
import { AuthContext } from "../Auth/Auth";

export function Header() {
  const headerEl = useRef(null);
  const [loginBoxOpen, setLoginBoxOpen] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    setLoginBoxOpen(false);
  }, [location.pathname]);

  const toggleLoginBox = (e) => {
    e.preventDefault();
    setLoginBoxOpen(!loginBoxOpen);
  };

  return (
    <>
      <header
        className="ecl-site-header-harmonised--group1 ecl-site-header-harmonised"
        ref={headerEl}
      >
        <div className="ecl-site-header-harmonised__container ecl-container">
          <div className="ecl-site-header-harmonised__top">
            <Link
              to="/"
              className="ecl-link ecl-link--standalone ecl-site-header-harmonised__logo-link"
              aria-label="European Commission"
            >
              <img
                alt="European Commission logo"
                title="European Commission"
                className="ecl-site-header-harmonised__logo-image"
                src={logo}
              />
            </Link>
            <div className="ecl-site-header-harmonised__action">
              <div className="ecl-site-header-harmonised__login-container">
                {isAuthenticated ? (
                  <>
                    <Link
                      role="button"
                      to="/logout"
                      className="ecl-link ecl-link--standalone ecl-site-header-harmonised__login-toggle"
                      aria-controls="login-box-id"
                      aria-expanded={loginBoxOpen}
                      onClick={toggleLoginBox}
                      style={loginBoxOpen ? {} : { borderBottomColor: "#fff" }}
                    >
                      <svg
                        focusable="false"
                        aria-hidden="true"
                        className="ecl-site-header-harmonised__icon ecl-icon ecl-icon--s"
                      >
                        <use xlinkHref={`${icons}#general--logged-in`} />
                      </svg>
                      Logged in
                      <svg
                        focusable="false"
                        aria-hidden="true"
                        className="ecl-site-header-harmonised__login-arrow ecl-icon ecl-icon--xs"
                      >
                        <use xlinkHref={`${icons}#ui--corner-arrow`} />
                      </svg>
                    </Link>
                    <div
                      id="login-box-id"
                      className={classnames(
                        "ecl-site-header-harmonised__login-box",
                        {
                          "ecl-site-header-harmonised__login-box--active": loginBoxOpen,
                        }
                      )}
                    >
                      <p className="ecl-site-header-harmonised__login-description">
                        Logged in as demo user
                      </p>
                      <hr className="ecl-site-header-harmonised__login-separator" />
                      <Link
                        to="/logout"
                        className="ecl-link ecl-link--standalone"
                      >
                        Log out
                      </Link>
                    </div>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="ecl-link ecl-link--standalone ecl-site-header-harmonised__login-toggle"
                  >
                    <svg
                      focusable="false"
                      aria-hidden="true"
                      className="ecl-site-header-harmonised__icon ecl-icon ecl-icon--s"
                    >
                      <use xlinkHref={`${icons}#general--log-in`} />
                    </svg>
                    Log in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="ecl-site-header-harmonised__banner-top">
          <div className="ecl-container">
            <Link to="/" className="ecl-link ecl-link--standalone">
              EBSI Sample App
            </Link>
          </div>
        </div>
        <div className="ecl-site-header-harmonised__banner">
          <div className="ecl-container">
            ESSIF Sample App: Issue eID Verifiable Credential
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
