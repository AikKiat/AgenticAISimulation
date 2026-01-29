


export type Country = {
  id: "A" | "B" | "C";
  name: string;
  welfare: number;
  foodInsecurity: number;
  healthCrisis: number;
  conflict: number;
  infraDecay: number;
};

export type EnvState = {
  episodeId: string;
  day: number;
  countries: Countries;
  done: boolean;
  reason: string | null;
  currentGift: { aid_type: string };
  past_choices_analysis : string | null;
};

export type HistoryEntry = {
  day: number;
  action: { target_country_id: string; aid_type: string };
  rationale?: string;
  prevState?: EnvState;
  state: EnvState;
  past_choices_analysis : string;
};

export type HistoryResponse = {
  episodeId: string;
  history: HistoryEntry[];
};

type Countries = {
  [countryId : string] : Country;
}