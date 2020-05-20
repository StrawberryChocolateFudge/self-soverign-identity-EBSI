import {
  formatVerifiableId,
  createFullVerifiableId,
} from "./verifiable-ids.utils";

describe("formatVerifiableId", () => {
  it("throws an error when a paramter is missing", () => {
    expect.assertions(2);

    // @ts-ignore: don't check function signature
    expect(formatVerifiableId).toThrow(
      new Error("Missing parameters in formatVerifiableId function")
    );

    // @ts-ignore: don't check function signature
    expect(() => formatVerifiableId("only one param")).toThrow(
      new Error("Missing parameters in formatVerifiableId function")
    );
  });

  it("correctly formats a Verifiable ID VC", () => {
    expect.assertions(1);

    const verifiableId = {
      credentialSubject: {
        id: "did:ebsi:subject",
        personIdentifier: "",
        currentAddress: "",
        currentFamilyName: "",
        currentGivenName: "",
        birthName: "",
        dateOfBirth: "",
        placeOfBirth: "",
        gender: "",
      },
    };
    const did = "did:ebsi:test";

    expect(formatVerifiableId(verifiableId, did)).toStrictEqual({
      sub: "did:ebsi:subject",
      vc: {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://EBSI-WEBSITE.EU/schemas/vc/2019/v1#",
          "https://EBSI-WEBSITE.EU/schemas/eidas/2019/v1#",
        ],
        credentialSubject: {
          birthName: "",
          currentAddress: "",
          currentFamilyName: "",
          currentGivenName: "",
          dateOfBirth: "",
          gender: "",
          id: "did:ebsi:subject",
          personIdentifier: "",
          placeOfBirth: "",
        },
        id: "ebsi:type-version-of-the-credential",
        type: ["VerifiableCredential", "EssifVerifiableID"],
      },
    });
  });
});

describe("createFullVerifiableId", () => {
  it("should throw when no token is provided", () => {
    expect.assertions(1);
    expect(createFullVerifiableId).toThrow(new Error("Missing token"));
  });

  it("should throw when the token is missing some properties", () => {
    expect.assertions(1);
    expect(() =>
      createFullVerifiableId(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Gfx6VO9tcxwk6xqx9yYzSfebfeakZp5JYIgP_edcw_A"
      )
    ).toThrow(new Error("Error processing JWT"));
  });

  it("should return a full Verifiable ID from a JWS", () => {
    expect.assertions(1);

    const jws =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaXNzIjoiZGlkOmVic2k6MHhGNmQ1N0M0RjYwQjY5NGE5NjM1N0M0ODkzMjM5MWExRDNlMzM0MUMiLCJpYXQiOjE1MTYyMzkwMjIsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIiwiaHR0cHM6Ly9FQlNJLVdFQlNJVEUuRVUvc2NoZW1hcy92Yy8yMDE5L3YxIyIsImh0dHBzOi8vRUJTSS1XRUJTSVRFLkVVL3NjaGVtYXMvZWlkYXMvMjAxOS92MSMiXSwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCIsIkVzc2lmVmVyaWZpYWJsZUlEIl0sImlkIjoiZWJzaTp0eXBlLXZlcnNpb24tb2YtdGhlLWNyZWRlbnRpYWwiLCJjcmVkZW50aWFsU3ViamVjdCI6e319fQ.RPE8HMsOi-JEi8z61SpEC35hCadDbilu7Syjp8f_Ev8";

    const verifiableId = createFullVerifiableId(jws);

    expect(verifiableId).toMatchObject({
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://EBSI-WEBSITE.EU/schemas/vc/2019/v1#",
        "https://EBSI-WEBSITE.EU/schemas/eidas/2019/v1#",
      ],
      type: ["VerifiableCredential", "EssifVerifiableID"],
      id: "ebsi:type-version-of-the-credential",
      credentialSubject: {},
      proof: {
        type: "EidasSeal2019",
        proofPurpose: "assertionMethod",
        jws,
      },
    });
  });
});
