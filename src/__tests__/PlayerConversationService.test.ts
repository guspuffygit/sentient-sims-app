import { describe, expect, it } from 'vitest';
import { PlayerConversationService } from 'main/sentient-sims/services/PlayerConversationService';

// The thread between the player and a sim: every reply sees the exchange so far, the sim
// can close it by saying their piece, silence forgets it, and a stop from the game ends it.
function build(idleMs = 60_000) {
  let now = 1_000_000;
  const closed: { speaker: string; reason: string }[] = [];
  // What every close hands on to be judged: the thread's own lines, never its seed
  const handed: { reason: string; lines: string[]; seeded: number }[] = [];
  const service = new PlayerConversationService({
    idleMs: () => idleMs,
    now: () => now,
    notifyClosed: (conversation, reason) => {
      closed.push({ speaker: conversation.speaker, reason });
    },
    onClosed: (conversation, reason) => {
      handed.push({
        reason,
        lines: conversation.lines.slice(conversation.seeded).map((line) => line.text),
        seeded: conversation.seeded,
      });
    },
  });
  const advance = (ms: number) => {
    now += ms;
  };
  return { service, closed, handed, advance };
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

  it('hands the whole exchange on at every close but a reset, without the lines it was seeded with', () => {
    const { service, handed } = build();
    const { conversation } = service.begin(jonah);
    service.record(
      conversation.key,
      [
        { speaker: 'Conscience', text: 'Who?' },
        { speaker: 'Jonah Alder', text: 'Zoe.' },
      ],
      { landed: true },
    );
    expect(handed).toEqual([{ reason: 'landed', lines: ['Who?', 'Zoe.'], seeded: 0 }]);

    // The next thread opens seeded with that tail; judged on its own lines only
    const next = service.begin(jonah).conversation;
    expect(next.seeded).toBe(2);
    service.record(
      next.key,
      [
        { speaker: 'Conscience', text: 'Why her?' },
        { speaker: 'Jonah Alder', text: 'She listens.' },
      ],
      { landed: false },
    );
    service.onSceneStopped(next.sceneId);
    expect(handed[1]).toEqual({ reason: 'stopped', lines: ['Why her?', 'She listens.'], seeded: 2 });

    service.begin(jonah);
    service.closeAll('reset');
    expect(handed).toHaveLength(2);
  });

  it('knows its own scene ids and closes idle threads on a sweep', () => {
    const { service, handed, advance } = build(60_000);
    const { conversation } = service.begin(jonah);
    expect(service.ownsScene(conversation.sceneId)).toBe(true);
    expect(service.ownsScene('some-other-scene')).toBe(false);
    service.record(conversation.key, [{ speaker: 'Jonah Alder', text: 'Still here.' }], { landed: false });
    advance(61_000);
    service.sweepIdle();
    expect(handed).toEqual([{ reason: 'idle', lines: ['Still here.'], seeded: 0 }]);
    // Swept away, and its scene id is still its own: a reply held past the idle window
    // closes its scene after the thread is gone
    expect(service.size).toBe(0);
    expect(service.ownsScene(conversation.sceneId)).toBe(true);
  });

  it('still owns the scene of a closed thread once the next thread has replaced it', () => {
    const { service } = build();
    const first = service.begin(jonah).conversation;
    service.record(first.key, [{ speaker: 'Jonah Alder', text: 'That is all.' }], { landed: true });

    // The player speaks again while that reply is still airing
    const next = service.begin(jonah).conversation;

    expect(next.sceneId).not.toBe(first.sceneId);
    expect(service.ownsScene(first.sceneId)).toBe(true);
    expect(service.ownsScene(next.sceneId)).toBe(true);
  });
});
