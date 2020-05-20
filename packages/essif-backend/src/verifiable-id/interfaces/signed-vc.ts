import { VerifiableId } from "./verifiable-id";

export interface SignedVc {
  iat: number;
  iss: string;
  vc: VerifiableId;
}
