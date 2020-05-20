/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import classnames from "classnames";
import icons from "@ecl/ec-preset-website/dist/images/icons/sprites/icons.svg";
import { AuthContext } from "../../components/Auth/Auth";
import { P } from "../../components/Typography/Typography";
import {
  REACT_APP_WALLET_WEB_CLIENT_URL,
  REACT_APP_BACKEND_EXTERNAL_URL,
} from "../../env";

const REQUEST_STATUS = {
  NOT_SENT: "",
  PENDING: "pending",
  OK: "ok",
  FAILED: "failed",
};

export const validateDate = (value) => !Number.isNaN(Date.parse(value));

function RequestVC() {
  const [requestStatus, setRequestStatus] = useState(
    localStorage.getItem("ESSIF-VC-issued") === "yes"
      ? REQUEST_STATUS.OK
      : REQUEST_STATUS.NOT_SENT
  );
  const [errorMessage, setErrorMessage] = useState("");
  const { register, handleSubmit, errors } = useForm();
  const { rawJWT } = useContext(AuthContext);

  if (requestStatus === REQUEST_STATUS.OK) {
    return (
      <>
        <h1 className="ecl-page-header-harmonised__title ecl-u-mb-xl">
          Request eID VC
        </h1>
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
          don&apos;t forget to tap on the &quot;EBSI DEMO&quot; link (top right
          corner) to return to the demonstration flow.
        </P>
      </>
    );
  }

  const onSubmit = (data) => {
    const requestBody = {
      credentialSubject: {
        ...data,
        birthName: data.birthName || data.currentFamilyName, // Default to currentFamilyName
        dateOfBirth: new Date(data.dateOfBirth).toISOString(),
        id: localStorage.getItem("ESSIF-DID"),
      },
    };

    const requestHeaders = new Headers();
    requestHeaders.append("Content-Type", "application/json");
    requestHeaders.append("Authorization", `Bearer ${rawJWT}`);

    const requestOptions = {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
    };

    setRequestStatus(REQUEST_STATUS.PENDING);

    fetch(
      `${REACT_APP_BACKEND_EXTERNAL_URL}/api/verifiable-credentials`,
      requestOptions
    )
      .then((response) => {
        if (response.status !== 201) {
          throw new Error(
            `There was a problem. Status Code: ${response.status}. Please contact the site administrators to find out what happened.`
          );
        }

        localStorage.setItem("ESSIF-VC-issued", "yes");
        setRequestStatus(REQUEST_STATUS.OK);
      })
      .catch((error) => {
        setErrorMessage(error.message);
        setRequestStatus(REQUEST_STATUS.FAILED);
      });
  };

  return (
    <>
      <h1 className="ecl-page-header-harmonised__title ecl-u-mb-xl">
        Request eID VC
      </h1>
      <P>All the fields are required unless otherwise stated.</P>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="ecl-form-group">
          <label className="ecl-form-label" htmlFor="personIdentifier">
            Person identifier
          </label>
          <div className="ecl-help-block">e.g. BE/BE/02635542Y</div>
          {errors.personIdentifier && (
            <div className="ecl-feedback-message">
              Person identifier is required
            </div>
          )}
          <input
            type="text"
            id="personIdentifier"
            name="personIdentifier"
            className={classnames("ecl-text-input", "ecl-text-input--m", {
              "ecl-text-input--invalid": !!errors.personIdentifier,
            })}
            ref={register({ required: true })}
          />
        </div>
        <div className="ecl-form-group ecl-u-mt-l">
          <label className="ecl-form-label" htmlFor="currentFamilyName">
            Current Family Name
          </label>
          <div className="ecl-help-block">e.g. van Blokketen</div>
          {errors.currentFamilyName && (
            <div className="ecl-feedback-message">
              Current Family Name is required
            </div>
          )}
          <input
            type="text"
            id="currentFamilyName"
            name="currentFamilyName"
            defaultValue=""
            className={classnames("ecl-text-input", "ecl-text-input--m", {
              "ecl-text-input--invalid": !!errors.currentFamilyName,
            })}
            ref={register({ required: true })}
          />
        </div>
        <div className="ecl-form-group ecl-u-mt-l">
          <label className="ecl-form-label" htmlFor="currentGivenName">
            Current Given Name
          </label>
          <div className="ecl-help-block">e.g. Eva</div>
          {errors.currentGivenName && (
            <div className="ecl-feedback-message">
              Current Given Name is required
            </div>
          )}
          <input
            type="text"
            id="currentGivenName"
            name="currentGivenName"
            defaultValue=""
            className={classnames("ecl-text-input", "ecl-text-input--m", {
              "ecl-text-input--invalid": !!errors.currentGivenName,
            })}
            ref={register({ required: true })}
          />
        </div>
        <div className="ecl-form-group ecl-u-mt-l">
          <label className="ecl-form-label" htmlFor="birthName">
            Birth Name (optional)
          </label>
          <div className="ecl-help-block">e.g. van Blokketen</div>
          <input
            type="text"
            id="birthName"
            name="birthName"
            defaultValue=""
            className="ecl-text-input ecl-text-input--m"
            ref={register({ required: false })}
          />
        </div>
        <div className="ecl-form-group ecl-u-mt-l">
          <label className="ecl-form-label" htmlFor="dateOfBirth">
            Date of birth
          </label>
          <div className="ecl-help-block">
            Format: YYYY-MM-DD, e.g. 1998-02-14
          </div>
          {errors.dateOfBirth && (
            <div className="ecl-feedback-message">
              {errors.dateOfBirth.message}
            </div>
          )}
          <input
            type="text"
            id="dateOfBirth"
            name="dateOfBirth"
            maxLength="10"
            className={classnames("ecl-text-input", "ecl-text-input--m", {
              "ecl-text-input--invalid": !!errors.dateOfBirth,
            })}
            ref={register({
              required: "Date of birth is required",
              pattern: {
                value: /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/,
                message: "Date of birth doesn't match format YYYY-MM-DD",
                validate: validateDate,
              },
            })}
          />
        </div>
        <div className="ecl-form-group ecl-u-mt-l">
          <label className="ecl-form-label" htmlFor="placeOfBirth">
            Place of birth
          </label>
          <div className="ecl-help-block">e.g. Brussels</div>
          {errors.placeOfBirth && (
            <div className="ecl-feedback-message">
              Place of birth is required
            </div>
          )}
          <input
            type="text"
            id="placeOfBirth"
            name="placeOfBirth"
            className={classnames("ecl-text-input", "ecl-text-input--m", {
              "ecl-text-input--invalid": !!errors.placeOfBirth,
            })}
            ref={register({ required: true })}
          />
        </div>
        <div className="ecl-form-group ecl-u-mt-l">
          <label className="ecl-form-label" htmlFor="currentAddress">
            Current Address
          </label>
          <div className="ecl-help-block">e.g. 44, rue de Fame</div>
          {errors.currentAddress && (
            <div className="ecl-feedback-message">
              Current Address is required
            </div>
          )}
          <input
            type="text"
            id="currentAddress"
            name="currentAddress"
            className={classnames("ecl-text-input", "ecl-text-input--m", {
              "ecl-text-input--invalid": !!errors.currentAddress,
            })}
            ref={register({ required: true })}
          />
        </div>
        <fieldset
          aria-describedby="helper-id-2"
          className="ecl-form-group ecl-u-mt-l"
        >
          <legend className="ecl-form-label ecl-form-label--invalid">
            Gender
          </legend>
          {errors.gender && (
            <div className="ecl-feedback-message">Gender is required</div>
          )}
          <div className="ecl-radio">
            <input
              type="radio"
              id="genderMale"
              name="gender"
              className="ecl-radio__input"
              value="Male"
              ref={register({ required: true })}
            />
            <label htmlFor="genderMale" className="ecl-radio__label">
              <span
                className={classnames("ecl-radio__box", {
                  "ecl-radio__box--invalid": !!errors.gender,
                })}
              />
              Male
            </label>
          </div>
          <div className="ecl-radio">
            <input
              type="radio"
              id="genderFemale"
              name="gender"
              className="ecl-radio__input"
              value="Female"
              ref={register({ required: true })}
            />
            <label htmlFor="genderFemale" className="ecl-radio__label">
              <span
                className={classnames("ecl-radio__box", {
                  "ecl-radio__box--invalid": !!errors.gender,
                })}
              />{" "}
              Female
            </label>
          </div>
        </fieldset>
        <button
          type="submit"
          disabled={requestStatus === REQUEST_STATUS.PENDING}
          className="ecl-button ecl-button--call ecl-u-mt-xl"
        >
          {requestStatus === REQUEST_STATUS.PENDING ? (
            <>Sending request...</>
          ) : (
            <>Collect the eID VC with your SSI App</>
          )}
        </button>
        {requestStatus === REQUEST_STATUS.FAILED && (
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
              <p className="ecl-message__description">{errorMessage}</p>
            </div>
          </div>
        )}
      </form>
    </>
  );
}

export default RequestVC;
