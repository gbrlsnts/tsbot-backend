export interface VerifyUserData {
  /** The users and tokens to send messages */
  targets: VerificationToken[];
  /** Template message. Must include {%TOKEN%} to be replaced. */
  template: string;
}

export interface VerificationToken {
  /** the client Id to send the token */
  clientId: number;
  /** the token to send */
  token: string;
}

export interface TsClientIds {
  /** ts client id */
  id: number;
  /** ts database id */
  dbId: number;
  /** client unique identifier */
  uid: string;
}
