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
  name: string;
  roll: string;
  healthCost: string;
  manaCost: string;
  actionTypes: ActionType[];
  conditions: Condition[];
}
export enum TimeSpan {
  Turn = "turn",
  Combat = "combat",
  ShortRest = "short rest",
  LongRest = "long rest",
}
export interface ActionType {
  name: string;
  limits: ActionLimit[];
}
export interface ActionLimit {
  time: TimeSpan;
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
