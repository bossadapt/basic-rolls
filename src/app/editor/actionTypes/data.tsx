import {
  ActionLimit,
  ActionType,
  ActionTypeLimit,
} from "@/app/globalInterfaces";
export let initialLimit: ActionLimit[] = [
  {
    timeID: ActionTypeLimit.Turn,
    active: false,
    useCount: 1,
    timeCount: 1,
  },
  {
    timeID: ActionTypeLimit.Combat,
    active: false,
    useCount: 1,
    timeCount: 1,
  },
  {
    timeID: ActionTypeLimit.ShortRest,
    active: false,
    useCount: 1,
    timeCount: 1,
  },
  {
    timeID: ActionTypeLimit.LongRest,
    active: false,
    useCount: 1,
    timeCount: 1,
  },
];
export let oneTurnLimit: ActionLimit[] = [
  {
    timeID: ActionTypeLimit.Turn,
    active: true,
    useCount: 1,
    timeCount: 1,
  },
  {
    timeID: ActionTypeLimit.Combat,
    active: false,
    useCount: 1,
    timeCount: 1,
  },
  {
    timeID: ActionTypeLimit.ShortRest,
    active: false,
    useCount: 1,
    timeCount: 1,
  },
  {
    timeID: ActionTypeLimit.LongRest,
    active: false,
    useCount: 1,
    timeCount: 1,
  },
];
export let defaultActionTypes: ActionType[] = [
  {
    id: "0",
    name: "Action",
    limits: oneTurnLimit,
    parents: []
  },
  {
    id: "1",
    name: "BonusAction",
    limits: oneTurnLimit,
    parents: []
  },
  {
    id: "2",
    name: "Attack",
    limits: oneTurnLimit,
    parents: []
  },
  {
    id: "3",
    name: "Reaction",
    limits: oneTurnLimit,
    parents: []
  },
];
