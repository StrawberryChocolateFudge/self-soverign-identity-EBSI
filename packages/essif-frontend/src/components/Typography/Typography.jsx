/* eslint-disable react/jsx-props-no-spreading */
import React from "react";
import PropTypes from "prop-types";

export function H2({ children, ...props }) {
  return (
    <h2 className="ecl-u-type-heading-2" {...props}>
      {children}
    </h2>
  );
}

H2.propTypes = {
  children: PropTypes.node.isRequired,
};

export function P({ children, ...props }) {
  return (
    <p className="ecl-u-type-paragraph" {...props}>
      {children}
    </p>
  );
}

P.propTypes = {
  children: PropTypes.node.isRequired,
};

export function UL({ children, ...props }) {
  return (
    <ul className="ecl-unordered-list" {...props}>
      {children}
    </ul>
  );
}

UL.propTypes = {
  children: PropTypes.node.isRequired,
};

export function LI({ children, ...props }) {
  return (
    <li className="ecl-unordered-list__item" {...props}>
      {children}
    </li>
  );
}

LI.propTypes = {
  children: PropTypes.node.isRequired,
};
