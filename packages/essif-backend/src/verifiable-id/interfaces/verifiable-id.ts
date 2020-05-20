import { CredentialSubject } from "./credential-subject";

export interface VerifiableId {
  "@context": string[];
  id: string;
  type: string[];
  credentialSubject: CredentialSubject;
}
