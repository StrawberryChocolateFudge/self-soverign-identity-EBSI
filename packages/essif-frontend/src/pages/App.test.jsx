import React from "react";
import ReactDOM from "react-dom";

describe("app", () => {
  const OLD_ENV = process.env;
  const OLD_LOCATION = global.window.location;

  // eslint-disable-next-line jest/no-hooks
  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  // eslint-disable-next-line jest/no-hooks
  afterEach(() => {
    process.env = OLD_ENV;
    global.window.location = OLD_LOCATION;
  });

  it("renders without crashing", () => {
    expect.assertions(0);

    jest.isolateModules(() => {
      process.env.PUBLIC_URL = "/test";

      // Set location to "/test" (avoid warnings)
      delete global.window.location;
      global.window = Object.create(window);
      global.window.location = {
        pathname: "/test",
        search: "",
        hash: "",
      };

      const div = document.createElement("div");
      // eslint-disable-next-line global-require
      const App = require("./App").default;
      ReactDOM.render(<App />, div);
      ReactDOM.unmountComponentAtNode(div);
    });
  });

  it("renders without crashing 2", () => {
    expect.assertions(0);

    jest.isolateModules(() => {
      process.env.PUBLIC_URL = "http://test.dev";
      // eslint-disable-next-line global-require
      const App = require("./App").default;
      const div = document.createElement("div");
      ReactDOM.render(<App />, div);
      ReactDOM.unmountComponentAtNode(div);
    });
  });
});
