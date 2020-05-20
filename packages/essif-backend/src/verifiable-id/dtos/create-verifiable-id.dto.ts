/* eslint-disable max-classes-per-file */
import {
  IsDateString,
  IsDefined,
  IsNotEmpty,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class CredentialSubject {
  @IsNotEmpty()
  @IsDefined()
  id: string;

  @IsNotEmpty()
  @IsDefined()
  personIdentifier: string;

  @IsNotEmpty()
  @IsDefined()
  currentFamilyName: string;

  @IsNotEmpty()
  @IsDefined()
  currentGivenName: string;

  @IsNotEmpty()
  @IsDefined()
  birthName: string;

  @IsNotEmpty()
  @IsDefined()
  @IsDateString()
  dateOfBirth: string;

  @IsNotEmpty()
  @IsDefined()
  placeOfBirth: string;

  @IsNotEmpty()
  @IsDefined()
  currentAddress: string;

  @IsNotEmpty()
  @IsDefined()
  gender: string;
}

export class CreateVerifiableIdDto {
  @IsNotEmpty()
  @IsDefined()
  @ValidateNested()
  @Type(() => CredentialSubject)
  credentialSubject: CredentialSubject;
}
