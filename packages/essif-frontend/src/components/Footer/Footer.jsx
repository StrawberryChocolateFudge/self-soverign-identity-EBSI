import React from "react";
import { Link } from "react-router-dom";
import icons from "@ecl/ec-preset-website/dist/images/icons/sprites/icons.svg";

export function Footer() {
  return (
    <footer className="ecl-footer-harmonised ecl-footer-harmonised--group1 ecl-u-mt-xl">
      <div className="ecl-container ecl-footer-harmonised__container">
        <section className="ecl-footer-harmonised__section ecl-footer-harmonised__section1">
          <Link
            to="/"
            className="ecl-footer-harmonised__title ecl-link ecl-link--standalone"
          >
            ESSIF Sample App: Issue eID Verifiable Credential
          </Link>
          <div className="ecl-footer-harmonised__description">
            This demo site is managed DIGIT
          </div>
        </section>
        <section className="ecl-footer-harmonised__section ecl-footer-harmonised__section7">
          <a
            href="https://ec.europa.eu/info/index_en"
            className="ecl-footer-harmonised__title ecl-link ecl-link--standalone"
          >
            European Commission
          </a>
        </section>
        <section className="ecl-footer-harmonised__section ecl-footer-harmonised__section8">
          <ul className="ecl-footer-harmonised__list">
            <li className="ecl-footer-harmonised__list-item">
              <a
                href="https://ec.europa.eu/info/about-european-commission/contact_en"
                className="ecl-footer-harmonised__link ecl-link ecl-link--standalone"
              >
                Contact the European Commission
              </a>
            </li>
            <li className="ecl-footer-harmonised__list-item">
              <a
                href="https://europa.eu/european-union/contact/social-networks_en#n:+i:4+e:1+t:+s"
                className="ecl-footer-harmonised__link ecl-link ecl-link--standalone ecl-link--icon ecl-link--icon-after"
              >
                <span className="ecl-link__label">
                  Follow the European Commission on social media
                </span>
                &nbsp;
                <svg
                  focusable="false"
                  aria-hidden="true"
                  className="ecl-link__icon ecl-icon ecl-icon--xs"
                >
                  <use xlinkHref={`${icons}#ui--external`} />
                </svg>
              </a>
            </li>
            <li className="ecl-footer-harmonised__list-item">
              <a
                href="https://ec.europa.eu/info/resources-partners_en"
                className="ecl-footer-harmonised__link ecl-link ecl-link--standalone"
              >
                Resources for partners
              </a>
            </li>
          </ul>
        </section>
        <section className="ecl-footer-harmonised__section ecl-footer-harmonised__section9">
          <ul className="ecl-footer-harmonised__list">
            <li className="ecl-footer-harmonised__list-item">
              <a
                href="https://ec.europa.eu/info/language-policy_en"
                className="ecl-footer-harmonised__link ecl-link ecl-link--standalone"
              >
                Language policy
              </a>
            </li>
            <li className="ecl-footer-harmonised__list-item">
              <a
                href="https://ec.europa.eu/info/cookies_en"
                className="ecl-footer-harmonised__link ecl-link ecl-link--standalone"
              >
                Cookies
              </a>
            </li>
            <li className="ecl-footer-harmonised__list-item">
              <a
                href="https://ec.europa.eu/info/privacy-policy_en"
                className="ecl-footer-harmonised__link ecl-link ecl-link--standalone"
              >
                Privacy policy
              </a>
            </li>
            <li className="ecl-footer-harmonised__list-item">
              <a
                href="https://ec.europa.eu/info/legal-notice_en"
                className="ecl-footer-harmonised__link ecl-link ecl-link--standalone"
              >
                Legal notice
              </a>
            </li>
            <li className="ecl-footer-harmonised__list-item">
              <a
                href="https://ec.europa.eu/info/brexit-content-disclaimer_en"
                className="ecl-footer-harmonised__link ecl-link ecl-link--standalone"
              >
                Brexit content disclaimer
              </a>
            </li>
          </ul>
        </section>
      </div>
    </footer>
  );
}

export default Footer;
