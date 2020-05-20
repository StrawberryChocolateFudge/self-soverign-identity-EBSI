import React from "react";
import ReactDOM from "react-dom";
import { render, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import RequestVC, { validateDate } from "./RequestVC";
import Auth from "../../components/Auth/Auth";

describe("validateDate", () => {
  it("should return false if the date is malformed", () => {
    expect.assertions(1);
    expect(validateDate("abc")).toBe(false);
  });

  it("should return true if the date is valid", () => {
    expect.assertions(1);
    expect(validateDate("1998-01-12")).toBe(true);
  });
});

describe("requestVC", () => {
  // eslint-disable-next-line jest/no-hooks
  beforeEach(() => {
    localStorage.clear();
  });

  // eslint-disable-next-line jest/no-hooks
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders without crashing", () => {
    expect.assertions(0);

    const div = document.createElement("div");
    ReactDOM.render(
      <Auth>
        <RequestVC />
      </Auth>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });

  it("displays the form", () => {
    expect.assertions(1);

    const { container } = render(
      <Auth>
        <RequestVC />
      </Auth>
    );

    // Check snapshot
    expect(container).toMatchInlineSnapshot(`
      <div>
        <h1
          class="ecl-page-header-harmonised__title ecl-u-mb-xl"
        >
          Request eID VC
        </h1>
        <p
          class="ecl-u-type-paragraph"
        >
          All the fields are required unless otherwise stated.
        </p>
        <form>
          <div
            class="ecl-form-group"
          >
            <label
              class="ecl-form-label"
              for="personIdentifier"
            >
              Person identifier
            </label>
            <div
              class="ecl-help-block"
            >
              e.g. BE/BE/02635542Y
            </div>
            <input
              class="ecl-text-input ecl-text-input--m"
              id="personIdentifier"
              name="personIdentifier"
              type="text"
            />
          </div>
          <div
            class="ecl-form-group ecl-u-mt-l"
          >
            <label
              class="ecl-form-label"
              for="currentFamilyName"
            >
              Current Family Name
            </label>
            <div
              class="ecl-help-block"
            >
              e.g. van Blokketen
            </div>
            <input
              class="ecl-text-input ecl-text-input--m"
              id="currentFamilyName"
              name="currentFamilyName"
              type="text"
              value=""
            />
          </div>
          <div
            class="ecl-form-group ecl-u-mt-l"
          >
            <label
              class="ecl-form-label"
              for="currentGivenName"
            >
              Current Given Name
            </label>
            <div
              class="ecl-help-block"
            >
              e.g. Eva
            </div>
            <input
              class="ecl-text-input ecl-text-input--m"
              id="currentGivenName"
              name="currentGivenName"
              type="text"
              value=""
            />
          </div>
          <div
            class="ecl-form-group ecl-u-mt-l"
          >
            <label
              class="ecl-form-label"
              for="birthName"
            >
              Birth Name (optional)
            </label>
            <div
              class="ecl-help-block"
            >
              e.g. van Blokketen
            </div>
            <input
              class="ecl-text-input ecl-text-input--m"
              id="birthName"
              name="birthName"
              type="text"
              value=""
            />
          </div>
          <div
            class="ecl-form-group ecl-u-mt-l"
          >
            <label
              class="ecl-form-label"
              for="dateOfBirth"
            >
              Date of birth
            </label>
            <div
              class="ecl-help-block"
            >
              Format: YYYY-MM-DD, e.g. 1998-02-14
            </div>
            <input
              class="ecl-text-input ecl-text-input--m"
              id="dateOfBirth"
              maxlength="10"
              name="dateOfBirth"
              type="text"
            />
          </div>
          <div
            class="ecl-form-group ecl-u-mt-l"
          >
            <label
              class="ecl-form-label"
              for="placeOfBirth"
            >
              Place of birth
            </label>
            <div
              class="ecl-help-block"
            >
              e.g. Brussels
            </div>
            <input
              class="ecl-text-input ecl-text-input--m"
              id="placeOfBirth"
              name="placeOfBirth"
              type="text"
            />
          </div>
          <div
            class="ecl-form-group ecl-u-mt-l"
          >
            <label
              class="ecl-form-label"
              for="currentAddress"
            >
              Current Address
            </label>
            <div
              class="ecl-help-block"
            >
              e.g. 44, rue de Fame
            </div>
            <input
              class="ecl-text-input ecl-text-input--m"
              id="currentAddress"
              name="currentAddress"
              type="text"
            />
          </div>
          <fieldset
            aria-describedby="helper-id-2"
            class="ecl-form-group ecl-u-mt-l"
          >
            <legend
              class="ecl-form-label ecl-form-label--invalid"
            >
              Gender
            </legend>
            <div
              class="ecl-radio"
            >
              <input
                class="ecl-radio__input"
                id="genderMale"
                name="gender"
                type="radio"
                value="Male"
              />
              <label
                class="ecl-radio__label"
                for="genderMale"
              >
                <span
                  class="ecl-radio__box"
                />
                Male
              </label>
            </div>
            <div
              class="ecl-radio"
            >
              <input
                class="ecl-radio__input"
                id="genderFemale"
                name="gender"
                type="radio"
                value="Female"
              />
              <label
                class="ecl-radio__label"
                for="genderFemale"
              >
                <span
                  class="ecl-radio__box"
                />
                 
                Female
              </label>
            </div>
          </fieldset>
          <button
            class="ecl-button ecl-button--call ecl-u-mt-xl"
            type="submit"
          >
            Collect the eID VC with your SSI App
          </button>
        </form>
      </div>
    `);
  });

  it("should not allow invalid inputs", async () => {
    expect.assertions(5);

    const { container, getByText, findByText } = render(
      <Auth>
        <RequestVC />
      </Auth>
    );

    // Fill the form
    const personIdentifierInput = container.querySelector("#personIdentifier");
    fireEvent.change(personIdentifierInput, {
      target: { value: "" },
    });

    const currentFamilyNameInput = container.querySelector(
      "#currentFamilyName"
    );
    fireEvent.change(currentFamilyNameInput, {
      target: { value: "" },
    });

    const currentGivenNameInput = container.querySelector("#currentGivenName");
    fireEvent.change(currentGivenNameInput, {
      target: { value: "" },
    });

    const birthNameInput = container.querySelector("#birthName");
    fireEvent.change(birthNameInput, {
      target: { value: "van Blokketen" },
    });

    const dateOfBirthInput = container.querySelector("#dateOfBirth");
    fireEvent.change(dateOfBirthInput, {
      target: { value: "ABC" },
    });

    const placeOfBirthInput = container.querySelector("#placeOfBirth");
    fireEvent.change(placeOfBirthInput, {
      target: { value: "" },
    });

    const currentAddressInput = container.querySelector("#currentAddress");
    fireEvent.change(currentAddressInput, {
      target: { value: "" },
    });

    // Don't pick gender
    /*
    const genderInput = container.querySelector("#genderMale");
    fireEvent.click(genderInput);
    */

    // Submit
    const submitButton = getByText("Collect the eID VC with your SSI App");
    fireEvent.click(submitButton);

    // Wait for the form to be validated
    // We know it's validated when the error message is displayed
    await findByText("Date of birth doesn't match format YYYY-MM-DD");

    expect(container).toHaveTextContent("Current Family Name is required");
    expect(container).toHaveTextContent("Current Given Name is required");
    expect(container).toHaveTextContent("Place of birth is required");
    expect(container).toHaveTextContent("Current Address is required");
    expect(container).toHaveTextContent("Gender is required");
  });

  it("should display an error if /api/verifiable-credentials returns an error", async () => {
    expect.assertions(3);

    // Mock fetch
    const mockFetchPromise = Promise.resolve({
      status: 400,
    });
    jest.spyOn(global, "fetch").mockImplementation(() => mockFetchPromise);

    const { container, getByText } = render(
      <Auth>
        <RequestVC />
      </Auth>
    );

    // Fill the form
    const personIdentifierInput = container.querySelector("#personIdentifier");
    fireEvent.change(personIdentifierInput, {
      target: { value: "BE/BE/02635542Y" },
    });

    const currentFamilyNameInput = container.querySelector(
      "#currentFamilyName"
    );
    fireEvent.change(currentFamilyNameInput, {
      target: { value: "van Blokketen" },
    });

    const currentGivenNameInput = container.querySelector("#currentGivenName");
    fireEvent.change(currentGivenNameInput, {
      target: { value: "Eva" },
    });

    const birthNameInput = container.querySelector("#birthName");
    fireEvent.change(birthNameInput, {
      target: { value: "van Blokketen" },
    });

    const dateOfBirthInput = container.querySelector("#dateOfBirth");
    fireEvent.change(dateOfBirthInput, {
      target: { value: "1998-02-14" },
    });

    const placeOfBirthInput = container.querySelector("#placeOfBirth");
    fireEvent.change(placeOfBirthInput, {
      target: { value: "Brussels" },
    });

    const currentAddressInput = container.querySelector("#currentAddress");
    fireEvent.change(currentAddressInput, {
      target: { value: "44, rue de Fame" },
    });

    const genderInput = container.querySelector("#genderMale");
    fireEvent.click(genderInput);

    // Submit
    const submitButton = getByText("Collect the eID VC with your SSI App");
    fireEvent.click(submitButton);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    expect(container).toHaveTextContent(
      "There was a problem. Status Code: 400. Please contact the site administrators to find out what happened."
    );
  });

  it("should send the form if all the fields are valid", async () => {
    expect.assertions(3);

    // Mock fetch
    const mockFetchPromise = Promise.resolve({
      status: 201,
    });
    jest.spyOn(global, "fetch").mockImplementation(() => mockFetchPromise);

    const { container, getByText } = render(
      <Auth>
        <RequestVC />
      </Auth>
    );

    // Fill the form
    const personIdentifierInput = container.querySelector("#personIdentifier");
    fireEvent.change(personIdentifierInput, {
      target: { value: "BE/BE/02635542Y" },
    });

    const currentFamilyNameInput = container.querySelector(
      "#currentFamilyName"
    );
    fireEvent.change(currentFamilyNameInput, {
      target: { value: "van Blokketen" },
    });

    const currentGivenNameInput = container.querySelector("#currentGivenName");
    fireEvent.change(currentGivenNameInput, {
      target: { value: "Eva" },
    });

    const birthNameInput = container.querySelector("#birthName");
    fireEvent.change(birthNameInput, {
      target: { value: "van Blokketen" },
    });

    const dateOfBirthInput = container.querySelector("#dateOfBirth");
    fireEvent.change(dateOfBirthInput, {
      target: { value: "1998-02-14" },
    });

    const placeOfBirthInput = container.querySelector("#placeOfBirth");
    fireEvent.change(placeOfBirthInput, {
      target: { value: "Brussels" },
    });

    const currentAddressInput = container.querySelector("#currentAddress");
    fireEvent.change(currentAddressInput, {
      target: { value: "44, rue de Fame" },
    });

    const genderInput = container.querySelector("#genderMale");
    fireEvent.click(genderInput);

    // Submit
    const submitButton = getByText("Collect the eID VC with your SSI App");
    fireEvent.click(submitButton);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    // Check message
    expect(container).toHaveTextContent("Your request has been issued.");
  });

  it("should send valid data", async () => {
    expect.assertions(4);

    const fakeDid = "0x123";
    localStorage.setItem("ESSIF-DID", fakeDid);

    const data = {
      personIdentifier: "BE/BE/02635542Y",
      currentFamilyName: "van Blokketen",
      currentGivenName: "Eva",
      dateOfBirth: "1998-02-14",
      placeOfBirth: "Brussels",
      currentAddress: "44, rue de Fame",
    };

    // Mock fetch
    const mockFetchPromise = Promise.resolve({
      status: 201,
    });
    jest.spyOn(global, "fetch").mockImplementation(() => mockFetchPromise);

    const { container, getByText } = render(
      <Auth>
        <RequestVC />
      </Auth>
    );

    // Fill the form
    const personIdentifierInput = container.querySelector("#personIdentifier");
    fireEvent.change(personIdentifierInput, {
      target: { value: data.personIdentifier },
    });

    const currentFamilyNameInput = container.querySelector(
      "#currentFamilyName"
    );
    fireEvent.change(currentFamilyNameInput, {
      target: { value: data.currentFamilyName },
    });

    const currentGivenNameInput = container.querySelector("#currentGivenName");
    fireEvent.change(currentGivenNameInput, {
      target: { value: data.currentGivenName },
    });

    // Leave birthName empty
    const birthNameInput = container.querySelector("#birthName");
    fireEvent.change(birthNameInput, {
      target: { value: "" },
    });

    const dateOfBirthInput = container.querySelector("#dateOfBirth");
    fireEvent.change(dateOfBirthInput, {
      target: { value: data.dateOfBirth },
    });

    const placeOfBirthInput = container.querySelector("#placeOfBirth");
    fireEvent.change(placeOfBirthInput, {
      target: { value: data.placeOfBirth },
    });

    const currentAddressInput = container.querySelector("#currentAddress");
    fireEvent.change(currentAddressInput, {
      target: { value: data.currentAddress },
    });

    const genderInput = container.querySelector("#genderMale");
    fireEvent.click(genderInput);

    // Submit
    const submitButton = getByText("Collect the eID VC with your SSI App");
    fireEvent.click(submitButton);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          credentialSubject: {
            personIdentifier: data.personIdentifier,
            currentFamilyName: data.currentFamilyName,
            currentGivenName: data.currentGivenName,
            birthName: data.currentFamilyName, // Default to currentFamilyName
            dateOfBirth: new Date(data.dateOfBirth).toISOString(),
            placeOfBirth: data.placeOfBirth,
            currentAddress: data.currentAddress,
            gender: "Male",
            id: fakeDid,
          },
        }),
      })
    );

    // Check message
    expect(container).toHaveTextContent("Your request has been issued.");
  });
});
