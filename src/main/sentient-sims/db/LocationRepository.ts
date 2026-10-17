import { defaultLocationDescriptions, defaultLotDescription } from '../descriptions/locationDescriptions';
import { neighborhoodLabel } from '../descriptions/lotNeighborhoods';
import { DeleteLocationRequest } from '../models/DeleteLocationRequest';
import { GetLocationRequest } from '../models/GetLocationRequest';
import { DbService } from '../services/DbService';
import { Repository } from './Repository';
import { LocationDefault, LocationEntity } from './entities/LocationEntity';
import { OnlineLocationSource } from './OnlineLocationRepository';

export const PLACEHOLDER_NAME = 'the home';
const PLACEHOLDER_LOT_TYPE = 'Residence';

function isStock(description?: string | null): boolean {
  return !description || description.trim().length === 0 || description === defaultLotDescription;
}

function chooseLotType(current: string | undefined, reported: string | undefined): string {
  if (reported && (!current || current === PLACEHOLDER_LOT_TYPE)) {
    return reported;
  }
  return current || PLACEHOLDER_LOT_TYPE;
}

// A location resolves, highest first: the description in this save (typed by the player),
// the shared online default, the built-in default, the stock placeholder. A description the
// app generated sits with the save's rows but yields to any default, since nobody chose it.
// A row still holding the stock text is the same as no row.
export class LocationRepository extends Repository {
  private readonly online?: OnlineLocationSource;

  constructor(dbService: DbService, online?: OnlineLocationSource) {
    super(dbService);
    this.online = online;
  }

  /**
   * The default a location falls back to: the shared online description, else the built-in
   * one. Undefined when neither actually describes the place.
   */
  getDefault(id: number | string): LocationDefault | undefined {
    const online = this.online?.peek().get(String(id));
    if (online && !isStock(online.description)) {
      return { name: online.name, lot_type: online.lot_type, description: online.description, source: 'online' };
    }
    const builtIn = defaultLocationDescriptions.get(String(id));
    if (builtIn && !isStock(builtIn.description)) {
      return { name: builtIn.name, lot_type: builtIn.lot_type, description: builtIn.description, source: 'built-in' };
    }
    return undefined;
  }

  private readRow(id: number): LocationEntity | undefined {
    const results = this.dbService.getDb().prepare('SELECT * FROM location WHERE id = ?').all([id]) as LocationEntity[];
    return results[0];
  }

  private resolve(id: number, row: LocationEntity | undefined): LocationEntity {
    const neighborhood = neighborhoodLabel(id);
    return neighborhood ? { ...this.resolveText(id, row), neighborhood } : this.resolveText(id, row);
  }

  private resolveText(id: number, row: LocationEntity | undefined): LocationEntity {
    const fallback = this.getDefault(id);
    const ownDescription = row && !isStock(row.description);
    const generated = row?.description_generated === 1;

    if (row && ownDescription && !(generated && fallback)) {
      return {
        ...row,
        is_generic: false,
        source: generated ? 'generated' : 'save',
        ...(fallback ? { default: fallback } : {}),
      };
    }

    if (fallback) {
      return {
        id,
        name: fallback.name || row?.name || PLACEHOLDER_NAME,
        lot_type: fallback.lot_type || row?.lot_type || PLACEHOLDER_LOT_TYPE,
        description: fallback.description,
        is_generic: false,
        is_default: true,
        source: fallback.source,
        default: fallback,
      };
    }

    // A built-in entry can carry only a name and the stock text (The Inked Inlet)
    const builtIn = defaultLocationDescriptions.get(String(id));
    return {
      id,
      name: row?.name || builtIn?.name || PLACEHOLDER_NAME,
      lot_type: row?.lot_type || builtIn?.lot_type || PLACEHOLDER_LOT_TYPE,
      description: defaultLotDescription,
      is_generic: true,
      source: 'stock',
    };
  }

  getLocation(locationRequest: GetLocationRequest): LocationEntity {
    const { id } = locationRequest;
    return this.resolve(id, this.readRow(id));
  }

  // V-6: store a GENERATED description for a lot nothing else describes. Re-reads first and
  // never replaces a description a person (or an earlier generation) put there, nor writes
  // one for a lot that has gained a default since the generation started.
  // A lot type the game reported replaces only the placeholder, never one a person set.
  setDescriptionIfGeneric(location: LocationEntity, description: string, zoneName?: string, lotType?: string): boolean {
    const existing = this.readRow(location.id);
    if ((existing && !isStock(existing.description)) || this.getDefault(location.id)) {
      return false;
    }

    this.updateLocation(
      {
        id: location.id,
        name: zoneName || existing?.name || location.name,
        lot_type: chooseLotType(existing?.lot_type || location.lot_type, lotType),
        description,
      },
      { generated: true },
    );
    return true;
  }

  /**
   * Updates an existing location or inserts a new location if it does not exist in the database.
   * Anything written without `generated` is the player's own description.
   */
  updateLocation(location: LocationEntity, options: { generated?: boolean } = {}) {
    return this.dbService
      .getDb()
      .prepare(
        'INSERT OR REPLACE INTO location(id, name, lot_type, description, description_generated) VALUES(?, ?, ?, ?, ?)',
      )
      .run([location.id, location.name, location.lot_type, location.description, options.generated ? 1 : 0]);
  }

  // Also how a player restores the default: with the row gone the location resolves to it
  deleteLocation(location: DeleteLocationRequest) {
    return this.dbService.getDb().prepare('DELETE FROM location WHERE id = ?').run([location.id]);
  }

  getAllLocations(): LocationEntity[] {
    const rows = new Map<string, LocationEntity>();
    this.getModifiedLocations().forEach((row) => rows.set(String(row.id), row));

    const ids = new Set<string>([
      ...defaultLocationDescriptions.keys(),
      ...(this.online?.peek().keys() ?? []),
      ...rows.keys(),
    ]);
    return Array.from(ids).map((id) => this.resolve(Number(id), rows.get(id)));
  }

  getModifiedLocations(): LocationEntity[] {
    return this.dbService.getDb().prepare('SELECT * FROM location').all() as LocationEntity[];
  }

  getDefaultLocations(): LocationEntity[] {
    const ids = new Set<string>([...defaultLocationDescriptions.keys(), ...(this.online?.peek().keys() ?? [])]);
    return Array.from(ids)
      .map((id) => this.resolve(Number(id), undefined))
      .filter((location) => location.source !== 'stock');
  }
}
