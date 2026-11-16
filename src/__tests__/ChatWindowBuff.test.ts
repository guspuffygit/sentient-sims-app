import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiContext } from 'main/sentient-sims/services/ApiContext';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { InteractionEventStatus } from 'main/sentient-sims/models/InteractionEventResult';
import { mockApiContext } from './util';

const { sendModNotification } = vi.hoisted(() => ({ sendModNotification: vi.fn() }));
vi.mock('main/sentient-sims/websocketServer', async (importOriginal) => ({
  ...(await importOriginal<typeof import('main/sentient-sims/websocketServer')>()),
  sendModNotification,
}));

// One moodlet per talk: the chat window's buff runs only when the thread's close does not
// judge the same chat (conversation moodlets off, or directed scenes off, where no thread exists)
describe('the chat window buff', () => {
  let ctx: ApiContext;
  let classify: ReturnType<typeof vi.spyOn>;
  const event = { sim_id: '11', name: 'Bella Goth', messages: ['a chat'], classifiers: ['happy', 'sad'] };

  beforeEach(() => {
    sendModNotification.mockClear();
    ctx = mockApiContext();
    classify = vi.spyOn(ctx.ai, 'runClassification').mockResolvedValue({
      status: InteractionEventStatus.CLASSIFIED,
      text: 'happy',
    });
    vi.spyOn(ctx.ai, 'runBuffDescription').mockResolvedValue({
      status: InteractionEventStatus.GENERATED,
      text: 'Bella enjoyed the chat.',
    });
  });

  it('stands down when the thread close judges the chat', async () => {
    await ctx.ai.runBuff(event);

    expect(classify).not.toHaveBeenCalled();
    expect(sendModNotification).not.toHaveBeenCalled();
  });

  it('runs when conversation moodlets are off', async () => {
    ctx.settings.set(SettingsEnum.CONVERSATION_MOODLETS_ENABLED, false);

    await ctx.ai.runBuff(event);

    expect(sendModNotification).toHaveBeenCalledWith({
      type: 'add_buff',
      sim_id: '11',
      mood: 'happy',
      buff_description: 'Bella enjoyed the chat.',
    });
  });

  it('runs when directed scenes are off', async () => {
    ctx.settings.set(SettingsEnum.DIRECTED_SCENES_ENABLED, false);

    await ctx.ai.runBuff(event);

    expect(sendModNotification).toHaveBeenCalledTimes(1);
  });
});
