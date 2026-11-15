import { formatDayTime } from "@/domain";
import type { AgentMessage, AgentService, NudgeInput } from "./AgentService";

const THINKING_MS = 1100;

/** Deterministic agent for the prototype. Real delay so loading states are real. */
export class MockAgent implements AgentService {
  constructor(
    private readonly wait: (ms: number) => Promise<void> = (ms) =>
      new Promise((resolve) => setTimeout(resolve, ms)),
  ) {}

  async composeNudge({ pending, deadline, link }: NudgeInput): Promise<AgentMessage> {
    await this.wait(THINKING_MS);
    const who = pending === 1 ? "1 avatar" : `${pending} avatars`;
    return {
      text:
        `Trip squad! ${who} to go before the big reveal 🎒 ` +
        `1 minute, no login: ${link}\n` +
        `Picks close ${formatDayTime(deadline)} ⏳`,
      sources: [],
    };
  }
}
