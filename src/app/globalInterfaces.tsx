export interface Roll {
  roll_name: string;
  default_roll: string;
}

export interface AbilityScore {
  ability: string;
  score: number;
}

export interface CharacterInfo {
  info_type: string;
  input: string;
}

export interface Change {
  name: string;
  changeEffect: string;
}
export interface Condition {
  name: string;
  turnBased: boolean;
  length: number;
  rollsChanges: Change[];
  abilityScoresChanges: Change[];
  characterInfoChanges: Change[];
}
