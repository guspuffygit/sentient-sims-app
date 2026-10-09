import { describe, expect, it } from 'vitest';
import { PlayerConversationService } from 'main/sentient-sims/services/PlayerConversationService';

// The thread between the player and a sim: every reply sees the exchange so far, the sim
// can close it by saying their piece, silence forgets it, and a stop from the game ends it.
function build(idleMs = 60_000) {
  let now = 1_000_000;
  const closed: { speaker: string; reason: string }[] = [];
  const service = new PlayerConversationService({
    idleMs: () => idleMs,
    now: () => now,
    notifyClosed: (conversation, reason) => {
      closed.push({ speaker: conversation.speaker, reason });
    },
  });
  const advance = (ms: number) => {
    now += ms;
  };
  return { service, closed, advance };
}

const jonah = { simIds: ['100'], simNames: ['Jonah Alder'], speaker: 'Conscience' };

describe('PlayerConversationService', () => {
  it('resumes the open thread for the same sim and speaker, with the lines so far', () => {
    const { service } = build();
    const first = service.begin(jonah);
    expect(first.resumed).toBe(false);
    service.record(
      first.conversation.key,
      [
        { speaker: 'Conscience', text: 'Who do you want to go on a date with?' },
        { speaker: 'Jonah Alder', text: 'Zoe. She listens.' },
      ],
      { landed: false },
    );

    const second = service.begin(jonah);
    expect(second.resumed).toBe(true);
    expect(second.conversation.sceneId).toBe(first.conversation.sceneId);
    expect(service.contextLines(second.conversation).map((line) => line.text)).toEqual([
      'Who do you want to go on a date with?',
      'Zoe. She listens.',
    ]);
  });

  it('keeps threads apart by sim and by speaker', () => {
    const { service } = build();
    const conscience = service.begin(jonah).conversation;
    const chat = service.begin({ ...jonah, speaker: 'Chat' }).conversation;
    const alex = service.begin({ simIds: ['200'], simNames: ['Alex Moyer'], speaker: 'Conscience' }).conversation;
    expect(new Set([conscience.sceneId, chat.sceneId, alex.sceneId]).size).toBe(3);
  });

  it('closes when the beat landed, tells the game, and seeds the next thread with the tail', () => {
    const { service, closed } = build();
    const { conversation } = service.begin(jonah);
    service.record(
      conversation.key,
      [
        { speaker: 'Conscience', text: 'Who?' },
        { speaker: 'Jonah Alder', text: 'Zoe. That is all I have on it.' },
      ],
      { landed: true },
    );
    expect(conversation.closed).toBe(true);
    expect(closed).toEqual([{ speaker: 'Conscience', reason: 'landed' }]);

    const next = service.begin(jonah);
    expect(next.resumed).toBe(false);
    expect(next.conversation.sceneId).not.toBe(conversation.sceneId);
    // Not amnesiac: the new thread opens with the tail of the one that just closed
    expect(next.conversation.lines.map((line) => line.text)).toEqual(['Who?', 'Zoe. That is all I have on it.']);
  });

  it('forgets a thread after the idle window', () => {
    const { service, closed, advance } = build(60_000);
    const { conversation } = service.begin(jonah);
    service.record(conversation.key, [{ speaker: 'Jonah Alder', text: 'Still here.' }], { landed: false });
    advance(61_000);
    const next = service.begin(jonah);
    expect(next.resumed).toBe(false);
    expect(next.conversation.lines).toEqual([]);
    expect(closed).toEqual([{ speaker: 'Conscience', reason: 'idle' }]);
  });

  it('ends with the scene when the game stops it, without announcing', () => {
    const { service, closed } = build();
    const { conversation } = service.begin(jonah);
    service.onSceneStopped(conversation.sceneId);
    expect(conversation.closed).toBe(true);
    expect(conversation.closedReason).toBe('stopped');
    expect(closed).toEqual([]);
    expect(service.begin(jonah).resumed).toBe(false);
  });

  it('a scene boundary closes every thread', () => {
    const { service } = build();
    const a = service.begin(jonah).conversation;
    const b = service.begin({ ...jonah, speaker: 'Chat' }).conversation;
    service.closeAll('scene_boundary');
    expect(a.closed).toBe(true);
    expect(b.closed).toBe(true);
  });

  it('never records onto a closed thread', () => {
    const { service } = build();
    const { conversation } = service.begin(jonah);
    service.record(conversation.key, [{ speaker: 'Jonah Alder', text: 'Bye.' }], { landed: true });
    service.record(conversation.key, [{ speaker: 'Jonah Alder', text: 'More.' }], { landed: false });
    expect(conversation.lines.map((line) => line.text)).toEqual(['Bye.']);
  });
});
