import {
  ActionLimit,
  ActionType,
  ActionTypeLimit,
} from "@/app/globalInterfaces";
export let initialLimit: ActionLimit[] = [
  {
    time: ActionTypeLimit.Turn,
    active: false,
    useCount: 1,
    timeCount: 1,
  },
  {
    time: ActionTypeLimit.Combat,
    active: false,
    useCount: 1,
    timeCount: 1,
  },
  {
    time: ActionTypeLimit.ShortRest,
    active: false,
    useCount: 1,
    timeCount: 1,
  },
  {
    time: ActionTypeLimit.LongRest,
    active: false,
    useCount: 1,
    timeCount: 1,
  },
];
export let oneTurnLimit: ActionLimit[] = [
  {
    time: ActionTypeLimit.Turn,
    active: true,
    useCount: 1,
    timeCount: 1,
  },
  {
    time: ActionTypeLimit.Combat,
    active: false,
    useCount: 1,
    timeCount: 1,
  },
  {
    time: ActionTypeLimit.ShortRest,
    active: false,
    useCount: 1,
    timeCount: 1,
  },
  {
    time: ActionTypeLimit.LongRest,
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
  },
  {
    id: "1",
    name: "BonusAction",
    limits: oneTurnLimit,
  },
  {
    id: "2",
    name: "Attack",
    limits: oneTurnLimit,
  },
  {
    id: "3",
    name: "Reaction",
    limits: oneTurnLimit,
  },
];
