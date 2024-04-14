export interface SendCodeData {
  email: string;
}

export interface VerifyCodeData {
  email: string;
  code: number;
}
