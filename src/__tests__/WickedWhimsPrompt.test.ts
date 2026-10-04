import { getSystemPrompt } from 'main/sentient-sims/systemPrompts';
import { defaultMythoMaxNsfwSystemPrompt, defaultWickedWhimsSceneSystemPrompt } from 'main/sentient-sims/constants';
import { SSEventType } from 'main/sentient-sims/models/InteractionEvents';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { formatAction, parseDialogueLines } from 'main/sentient-sims/formatter/PromptFormatter';
import { SentientSim } from 'main/sentient-sims/models/SentientSim';
import { LocationEntity } from 'main/sentient-sims/db/entities/LocationEntity';

// WickedWhims scenes are one call whose output directed playback parses as Name: "line" rows
describe('WickedWhims scene prompt', () => {
  it('asks for dialogue rows with Directed Scenes on and keeps the prose prompt for classic', () => {
    expect(getSystemPrompt(SSEventType.WICKED_WHIMS, ApiType.OpenRouter, true)).toBe(
      defaultWickedWhimsSceneSystemPrompt,
    );
    expect(getSystemPrompt(SSEventType.WICKED_WHIMS, ApiType.OpenRouter, false)).toBe(defaultMythoMaxNsfwSystemPrompt);
  });

  it('renders sex category 0 (TEASING) as foreplay, not the raw token', () => {
    const sims = [{ name: 'Desmond Calloway' }, { name: 'Margo Calloway' }] as SentientSim[];
    const location = { name: 'Home', lot_type: 'Residential', description: '' } as unknown as LocationEntity;
    const rendered = formatAction('{actor.0} is leading {actor.1} to start {sex_category}.', sims, location, 0);
    expect(rendered).toContain('foreplay');
    expect(rendered).not.toContain('{sex_category}');
  });

  it('parses the format the prompt asks for into named lines', () => {
    const lines = parseDialogueLines('Desmond Calloway: (breathless) "Come here."\nMargo Calloway: "Door\'s open."', [
      'Desmond Calloway',
      'Margo Calloway',
    ]);
    expect(lines).toHaveLength(2);
    expect(lines[0].speaker).toBe('Desmond Calloway');
    expect(lines[0].deliveryNote).toBe('breathless');
    expect(lines[0].text).toBe('Come here.');
    expect(lines[1].speaker).toBe('Margo Calloway');
    expect(lines[1].text).toBe("Door's open.");
  });
});
