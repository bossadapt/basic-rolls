export enum importantCharCode {
  digitStart = 48, //0
  digitEnd = 57, //9
  lowerCaseStart = 97, //a
  lowerCaseEnd = 122, //z
  upperCaseStart = 65, //A
  upperCaseEnd = 90, //Z
  underScore = 95, //_
}
export interface Roll {
  id: string;
  name: string;
  roll: string;
  healthCost: string;
  manaCost: string;
  actionTypes: string[];
  conditions: string[];
}
export const ActionTypeLimitString = [
  "Turn",
  "Combat",
  "Short Rest",
  "Long Rest",
];
export enum ActionTypeLimit {
  Turn,
  Combat,
  ShortRest,
  LongRest,
}
export interface ActionType {
  id: string;
  name: string;
  limits: ActionLimit[];
}
export interface ActionLimit {
  time: ActionTypeLimit;
  active: boolean;
  useCount: number;
  timeCount: number;
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
  id: string;
  name: string;
  turnBased: boolean;
  length: string;
  abilityScoreChanges: Change[];
  characterInfoChanges: Change[];
  rollChanges: Change[];
}
export interface ListsResult {
  rolls: Roll[];
  abilityScores: AbilityScore[];
  characterInfo: CharacterInfo[];
  conditions: Condition[];
  actionTypes: ActionType[];
}
