export class Trade {}

export interface ReferralProgram {
  id: number;
  name: string;
  logoPath: string;
  logoBackgroundColor: string;
  title: string;
  description: string;
  code: string;
  btnLabel: string;
  externalLink: string;
  disabled: boolean;
}
