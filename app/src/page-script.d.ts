export type Insets = { top: number; right: number; bottom: number; left: number };
export type PageMessage = { t: string; [key: string]: unknown };
export type HapticPlan =
  | { kind: 'none' }
  | { kind: 'impact'; style: 'light' | 'medium' | 'heavy' }
  | { kind: 'pattern'; pattern: number[] };

export const BASE_URL: string;
export const MAX_SAVE_CHARS: number;
export function bootstrapScript(opts: { save: string | null; version: string; insets: Partial<Insets> }): string;
export function withBootstrap(html: string, script: string): string;
export function setActiveScript(active: boolean): string;
export function insetsScript(insets: Partial<Insets>): string;
export function receiveScript(msg: PageMessage): string;
export function backScript(): string;
export function parseMessage(raw: unknown): PageMessage | null;
export function validSave(v: unknown): v is string;
export function hapticPlan(p: unknown): HapticPlan;
export function externalUrl(url: unknown): string | null;
export function isOwnUrl(url: unknown): boolean;
export function scriptJson(value: unknown): string;
