import * as Haptics from 'expo-haptics';
import { Linking, Vibration } from 'react-native';

import { externalUrl, hapticPlan, parseMessage, type PageMessage } from './page-script';
import { storeSave } from './storage';

/* What a handler may do besides its own work. `reply` reaches the page as a window "omt:native" event. */
export type BridgeContext = {
  rememberSave: (v: string) => void;
  onBack: (handled: boolean) => void;
  reply: (msg: PageMessage) => void;
};

type Handler = (msg: PageMessage, ctx: BridgeContext) => void;

const IMPACT = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
} as const;

export function openExternal(url: unknown): void {
  const safe = externalUrl(url);
  if (safe) Linking.openURL(safe).catch(() => {});
}

/* One entry per message type. To add adverts or a purchase, add `ad` and `purchase` here (README, last section);
   nothing else in the shell needs to change. Unknown types are ignored, so an older shell keeps working with a
   newer page. */
const handlers: Record<string, Handler> = {
  // { t: 'save', v: string } whenever progress or a setting changes
  save(msg, ctx) {
    if (storeSave(msg.v)) ctx.rememberSave(msg.v as string);
  },
  // { t: 'haptic', p: number | number[] } in Vibration-API milliseconds
  haptic(msg) {
    const plan = hapticPlan(msg.p);
    if (plan.kind === 'impact') Haptics.impactAsync(IMPACT[plan.style]).catch(() => {});
    else if (plan.kind === 'pattern') Vibration.vibrate(plan.pattern);
  },
  // { t: 'open', url } for a link that leaves the game (sent by the shell's own click interceptor)
  open(msg) {
    openExternal(msg.url);
  },
  // { t: 'back', handled } is the answer to the hardware back button (sent by the shell's own script)
  back(msg, ctx) {
    ctx.onBack(msg.handled === true);
  },
  log(msg) {
    if (__DEV__) console.log('[page]', msg.level, msg.m);
  },
};

export function handlePageMessage(raw: unknown, ctx: BridgeContext): void {
  const msg = parseMessage(raw);
  if (!msg) return;
  const handler = Object.prototype.hasOwnProperty.call(handlers, msg.t) ? handlers[msg.t] : undefined;
  if (handler) handler(msg, ctx);
  else if (__DEV__) console.log('[bridge] no handler for message type', msg.t);
}
