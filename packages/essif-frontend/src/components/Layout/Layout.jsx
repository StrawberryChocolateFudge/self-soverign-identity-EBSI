import React from "react";
import PropTypes from "prop-types";
import styles from "./Layout.module.css";
import { REACT_APP_DEMONSTRATOR_URL } from "../../env";

export function Layout({ children }) {
  return (
    <>
      {children}
      <div className={styles.ribbon}>
        <a className={styles.ribbonText} href={REACT_APP_DEMONSTRATOR_URL}>
          EBSI DEMO
        </a>
      </div>
    </>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
