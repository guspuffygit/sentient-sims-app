import { LocationRepository } from '../db/LocationRepository';
import { EventRequest } from '../models/EventRequest';
import { PromptRequest } from '../models/PromptRequest';

export class PromptRequestBuilderService {
  private locationRepository: LocationRepository;

  constructor(locationRepository: LocationRepository) {
    this.locationRepository = locationRepository;
  }

  buildPromptRequest(eventRequest: EventRequest): PromptRequest {
    const location = this.locationRepository.getLocation({
      id: eventRequest.location_id,
    });

    return {
      participants: eventRequest.participants,
      location: location.description,
      memories: eventRequest.memories,
      pre_action: eventRequest?.pre_action,
      model: eventRequest?.model,
      systemPrompt: eventRequest?.systemPrompt,
      preResponse: eventRequest?.preResponse,
      nsfw: eventRequest?.nsfw,
    };
  }
}
