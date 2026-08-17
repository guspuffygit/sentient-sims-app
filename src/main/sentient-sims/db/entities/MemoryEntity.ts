// Memory ids are 64-bit game handles — bigger than float64 holds, so like participant ids
// they cross every JSON/IPC boundary as strings and only become BigInt at a sqlite bind.
export type MemoryEntity = {
  id?: string;
  pre_action?: string;
  observation?: string;
  content?: string;
  location_id: number;
  timestamp?: string;
  action?: string;
  event_type?: string;
  interaction_name?: string;
};

// Raw memory row as read with safeIntegers() (all INTEGER columns arrive as bigint).
export type MemoryRow = Omit<MemoryEntity, 'id' | 'location_id'> & {
  id: bigint;
  location_id: bigint;
};

export function toMemoryEntity(row: MemoryRow): MemoryEntity {
  return { ...row, id: row.id.toString(), location_id: Number(row.location_id) };
}

// The mod's Flash memories window concatenates the whole list into one htmlText string, so a
// raw '<' in any memory (e.g. a game repr like "<EnqueueResult: ...>" in a cancel reason) opens
// an unclosed tag that swallows every memory after it. Angle brackets become guillemets: safe in
// htmlText, and still readable in the plain-text subtitle field.
export function neutralizeMarkup(text: string): string {
  return text.replace(/</g, '‹').replace(/>/g, '›');
}

// The in-game memories window renders a row as `action` + `content` and reads content into a
// Flash String: a null one throws on the first character access, and because the window redraws
// the whole list in one pass, a single content-less row blanks every memory in it. Outcome rows
// and pre-action fallbacks keep their text in observation/pre_action, so anything handed to the
// mod (the GET /memories hydrate and the memory_created/memory_edited websocket pushes) goes
// through this first: every row gets a string content and markup-safe text. The stored row keeps
// its own shape. All four text fields are neutralized together so consumers that compare them
// (like the app's duplicate-line filter) still see identical strings.
export function withDisplayContent(memory: MemoryEntity): MemoryEntity {
  const content = memory.content?.trim()
    ? memory.content
    : memory.observation?.trim() || memory.pre_action?.trim() || '';

  return {
    ...memory,
    content: neutralizeMarkup(content),
    action: memory.action ? neutralizeMarkup(memory.action) : memory.action,
    observation: memory.observation ? neutralizeMarkup(memory.observation) : memory.observation,
    pre_action: memory.pre_action ? neutralizeMarkup(memory.pre_action) : memory.pre_action,
  };
}
