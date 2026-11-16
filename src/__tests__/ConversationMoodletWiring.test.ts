import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from 'vitest';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { SceneMoodletService } from 'main/sentient-sims/services/SceneMoodletService';
import { DialogueLine } from 'main/sentient-sims/formatter/PromptFormatter';
import { mockApiContext } from './util';

// One appraisal per conversation, where ApiContext joins the scene registry, the threads
// with the player and the appraisal
describe('conversation moodlet wiring', () => {
  let ctx: ApiContext;
  let appraise: MockInstance<SceneMoodletService['appraise']>;

  const bella = { simIds: ['11'], simNames: ['Bella Goth'], speaker: 'Mortimer Goth' };
  const CAST = [
    { simId: '11', name: 'Bella Goth', traits: ['Family-Oriented'] },
    { simId: '12', name: 'Mortimer Goth' },
  ];
  const EXCHANGE: DialogueLine[] = [
    { speaker: 'Mortimer Goth', text: 'I want a divorce.' },
    { speaker: 'Bella Goth', text: 'You cannot mean that.' },
    { speaker: 'Mortimer Goth', text: 'I have never meant anything more.' },
    { speaker: 'Bella Goth', text: 'Then go.' },
  ];

  beforeEach(() => {
    appraise = vi.spyOn(SceneMoodletService.prototype, 'appraise').mockResolvedValue([]);
    ctx = mockApiContext();
  });

  afterEach(() => {
    appraise.mockRestore();
  });

  it('judges a Sim-to-Sim scene once, when it closes', () => {
    ctx.scenePlayback.roundQueued('scene-1', ['11', '12'], 1, EXCHANGE, undefined, CAST);
    ctx.scenePlayback.playbackEnded('scene-1', true);

    expect(appraise).toHaveBeenCalledTimes(1);
    expect(appraise.mock.calls[0]).toHaveLength(1);
    expect(appraise.mock.calls[0][0]).toMatchObject({ sceneId: 'scene-1', reason: 'finished' });
  });

  it('judges a thread with the player once, even when the next thread starts over its last reply', () => {
    const { conversation } = ctx.playerConversations.begin(bella);
    ctx.scenePlayback.roundQueued(conversation.sceneId, ['11', '12'], 1, EXCHANGE, undefined, CAST);
    ctx.playerConversations.record(conversation.key, EXCHANGE, { landed: true });

    // The player speaks again while that reply is still airing, then the reply ends
    ctx.playerConversations.begin(bella);
    ctx.scenePlayback.playbackEnded(conversation.sceneId, true);

    expect(appraise).toHaveBeenCalledTimes(1);
    const [closed, source] = appraise.mock.calls[0];
    expect(source).toBe('conversation');
    expect(closed).toMatchObject({ sceneId: conversation.sceneId, reason: 'finished', lines: EXCHANGE });
    // The Sim who answered, with what the registry knows of them; never the speaker's Sim
    expect(closed.cast).toEqual([CAST[0]]);
  });

  it('casts the same Sims when the registry no longer holds the scene', () => {
    const { conversation } = ctx.playerConversations.begin(bella);
    ctx.playerConversations.record(conversation.key, EXCHANGE, { landed: true });

    expect(appraise.mock.calls[0][0].cast).toEqual([{ simId: '11', name: 'Bella Goth' }]);
  });

  it('drops the open threads unjudged when the save is unloaded', () => {
    const { conversation } = ctx.playerConversations.begin(bella);
    ctx.playerConversations.record(conversation.key, EXCHANGE, { landed: false });

    ctx.db.unloadDatabase();

    expect(appraise).not.toHaveBeenCalled();
    expect(ctx.playerConversations.size).toBe(0);
  });
});
