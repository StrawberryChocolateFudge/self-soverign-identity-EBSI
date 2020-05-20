import { decodeToken } from "../common/utils/jwt.utils";
import { FullVerifiableId } from "./interfaces/full-verifiable-id";
import { SignedVc } from "./interfaces/signed-vc";
import {
  DEFAULT_EIDAS_PROOF_TYPE,
  DEFAULT_PROOF_PURPOSE,
  DEFAULT_EIDAS_VERIFICATION_METHOD,
} from "./constants";

export function formatVerifiableId(raw, did) {
  if (!raw || !did) {
    throw new Error("Missing parameters in formatVerifiableId function");
  }

  const verifiableId = {
    ...raw,
    issuer: did,
  };

  const verifiableIdCredentialPayload = {
    sub: verifiableId.credentialSubject.id,
    vc: {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://EBSI-WEBSITE.EU/schemas/vc/2019/v1#",
        "https://EBSI-WEBSITE.EU/schemas/eidas/2019/v1#",
      ],
      id: "ebsi:type-version-of-the-credential",
      type: ["VerifiableCredential", "EssifVerifiableID"],
      credentialSubject: verifiableId.credentialSubject,
    },
  };

  return verifiableIdCredentialPayload;
}

export const createFullVerifiableId = (vcJwt: string) => {
  const decodedVc = <SignedVc>decodeToken(vcJwt);
  const { iat, iss, vc } = decodedVc;

  if (!iat || !iss || !vc) throw Error("Error processing JWT");

  return <FullVerifiableId>{
    "@context": vc["@context"],
    id: vc.id,
    type: vc.type,
    issuer: iss,
    issuanceDate: new Date(iat * 1000).toISOString(),
    // expirationDate: moment().add(10, "years").toISOString(),
    credentialSubject: vc.credentialSubject,
    proof: {
      type: DEFAULT_EIDAS_PROOF_TYPE,
      created: new Date(iat * 1000).toISOString(),
      proofPurpose: DEFAULT_PROOF_PURPOSE,
      verificationMethod: iss + DEFAULT_EIDAS_VERIFICATION_METHOD,
      jws: vcJwt,
    },
  };
};
