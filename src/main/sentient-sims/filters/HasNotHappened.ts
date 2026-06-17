type HasNotHappenedProperties = {
  memoryDepth: number;
};

export type HasNotHappenedFilter = {
  type: 'HasNotHappened';
  memoryDepth: number;
};

export function HasNotHappened({ memoryDepth }: HasNotHappenedProperties): HasNotHappenedFilter {
  return { type: 'HasNotHappened', memoryDepth };
}
