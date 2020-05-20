// eslint-disable-next-line import/no-extraneous-dependencies
require("mutationobserver-shim");

// Mock scrollTo
jest.spyOn(global, "scrollTo").mockImplementation();
