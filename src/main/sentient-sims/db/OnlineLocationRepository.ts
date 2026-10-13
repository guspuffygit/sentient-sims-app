import log from 'electron-log';
import { axiosClient } from '../clients/AxiosClient';
import { ApiContext } from '../services/ApiContext';
import { notifyLocationChanged } from '../util/notifyRenderer';
import { ONLINE_MAPPING_SYNC_INTERVAL_MS, onlineMappingsEqual } from '../util/onlineMappingSync';

// The shared location descriptions: one per EA lot id, the same for every player, edited
// by mappers the way online interaction mappings are. A player's own description in their
// save always wins over these (LocationRepository), so publishing never overwrites anyone.

const FETCH_RETRY_COOLDOWN_MS = 60_000;
const FETCH_TIMEOUT_MS = 15_000;

export type OnlineLocation = {
  id: number;
  name: string;
  lot_type: string;
  description: string;
};

// What LocationRepository needs: a synchronous look at whatever has been fetched so far
export interface OnlineLocationSource {
  peek(): Map<string, OnlineLocation>;
}

export class OnlineLocationRepository implements OnlineLocationSource {
  private readonly ctx: ApiContext;

  private locations?: Map<string, OnlineLocation>;

  private loading?: Promise<void>;

  private lastFetchFailure?: number;

  private failureLogged = false;

  private syncTimer?: ReturnType<typeof setInterval>;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  private requestConfig() {
    return {
      baseURL: this.ctx.settings.sentientSimsAIEndpoint,
      headers: {
        Authentication: this.ctx.settings.accessToken,
        ...this.ctx.version.getVersionHeaders(),
      },
    };
  }

  async fetchLocations(): Promise<Map<string, OnlineLocation>> {
    const response = await axiosClient<Record<string, OnlineLocation>>({
      url: '/locations',
      timeout: FETCH_TIMEOUT_MS,
      ...this.requestConfig(),
    });
    return new Map(Object.entries(response.data));
  }

  /**
   * The shared descriptions fetched so far, without waiting: prompt building is synchronous
   * and must never block on the network. Until load() lands, the built-in defaults apply.
   */
  peek(): Map<string, OnlineLocation> {
    return this.locations ?? new Map<string, OnlineLocation>();
  }

  // Started when a save loads and when the Locations page asks; a no-op once loaded, since
  // the background sync keeps it fresh from then on
  async load(): Promise<void> {
    if (this.locations || this.loading) {
      return this.loading;
    }
    if (this.lastFetchFailure && Date.now() - this.lastFetchFailure < FETCH_RETRY_COOLDOWN_MS) {
      return undefined;
    }
    this.loading = this.fetchOnce().finally(() => {
      this.loading = undefined;
    });
    return this.loading;
  }

  private async fetchOnce() {
    try {
      this.locations = await this.fetchLocations();
      this.lastFetchFailure = undefined;
      this.scheduleSync();
      notifyLocationChanged();
    } catch (err) {
      this.lastFetchFailure = Date.now();
      // Offline, or a server without the route yet: the built-ins still apply, so say it once
      if (!this.failureLogged) {
        this.failureLogged = true;
        log.warn('[OnlineLocations] Unable to fetch shared location descriptions', err);
      }
    }
  }

  private scheduleSync() {
    if (this.syncTimer) {
      return;
    }
    this.syncTimer = setInterval(() => {
      void this.sync();
    }, ONLINE_MAPPING_SYNC_INTERVAL_MS);
    this.syncTimer.unref();
  }

  async sync() {
    try {
      const latest = await this.fetchLocations();
      if (!this.locations || !onlineMappingsEqual(this.locations, latest)) {
        this.locations = latest;
        notifyLocationChanged();
      }
    } catch (err) {
      log.debug('[OnlineLocations] Unable to refresh shared location descriptions', err);
    }
  }

  async setLocation(location: OnlineLocation) {
    const response = await axiosClient<Record<string, OnlineLocation>>({
      url: '/locations',
      method: 'POST',
      data: location,
      ...this.requestConfig(),
    });
    this.locations = new Map(Object.entries(response.data));
    this.scheduleSync();
    notifyLocationChanged();
  }

  async deleteLocation(id: number) {
    await axiosClient({
      url: '/locations',
      method: 'DELETE',
      data: { id },
      ...this.requestConfig(),
    });
    this.locations?.delete(String(id));
    notifyLocationChanged();
  }
}
