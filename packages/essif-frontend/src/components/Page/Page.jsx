import React from "react";
import PropTypes from "prop-types";

export function Page({ children }) {
  return <main className="ecl-container ecl-u-pv-2xl">{children}</main>;
}

Page.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Page;
