import { VerifiableId } from "./verifiable-id";
import { Proof } from "./proof";

export interface FullVerifiableId extends VerifiableId {
  issuer: string;
  issuanceDate: string;
  proof: Proof;
  expirationDate: string;
}
