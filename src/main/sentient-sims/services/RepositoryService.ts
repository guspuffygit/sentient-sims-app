import { LocationRepository } from '../db/LocationRepository';
import { MemoryRepository } from '../db/MemoryRepository';
import { ParticipantRepository } from '../db/ParticipantRepository';

export class RepositoryService {
  readonly location: LocationRepository;

  readonly memory: MemoryRepository;

  readonly participant: ParticipantRepository;

  constructor(
    locationRepository: LocationRepository,
    memoryRepository: MemoryRepository,
    participantRepository: ParticipantRepository
  ) {
    this.location = locationRepository;
    this.memory = memoryRepository;
    this.participant = participantRepository;
  }
}
