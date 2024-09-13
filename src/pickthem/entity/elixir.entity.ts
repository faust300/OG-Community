export class PickThemElixir{
  name: string;
  description?: string | null;
  point?: number | null;
  multiply: number;
  count?: number;
  goal: number;
  elixirCheck: number;
  referralCount: number;
  popularCount: number;
}

export class Elixir{
  has: boolean;
  count: number;
  goal: number;
}

export class PickThemElixirObj{
  elixir: Elixir
}

export class ReferralElixir {
  count: number;
}