import type { ISODateTime } from "@/domain";

/** Something the agent wrote. Facts carry sources; a nudge has none. */
export interface AgentMessage {
  text: string;
  sources: readonly string[];
}

export interface NudgeInput {
  pending: number;
  deadline: ISODateTime;
  link: string;
}

/** Every AI call goes through here. Components never know if it's mock or live. */
export interface AgentService {
  /** A friendly reminder for the group chat. Never names who hasn't joined. */
  composeNudge(input: NudgeInput): Promise<AgentMessage>;
}
