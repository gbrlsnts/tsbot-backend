import {
  Repository,
  EntityRepository,
  EntityManager,
  Not,
  UpdateResult,
} from 'typeorm';
import { Zone } from './zone.entity';

@EntityRepository(Zone)
export class ZoneRepository extends Repository<Zone> {
  /**
   * Save a zone and update the defaults for all zones in the server
   * @param zone zone to save
   * @param manager entity manager, provide if wrapping transaction
   */
  async saveAndSetDefaults(zone: Zone, manager?: EntityManager): Promise<Zone> {
    if (!manager) manager = this.manager;

    const savedZone = await manager.save(zone);

    if (zone.isDefault) {
      await this.resetDefaults(savedZone.serverId, savedZone.id, manager);
    }

    return savedZone;
  }

  /**
   * Resets all defaults to false, except for the provided zoneId
   * @param serverId
   * @param zoneId zoneId to keep the default value
   * @param manager entity manager, provide if wrapping transaction
   */
  resetDefaults(
    serverId: number,
    zoneId: number,
    manager?: EntityManager,
  ): Promise<UpdateResult> {
    return manager
      .createQueryBuilder()
      .update(Zone)
      .set({
        isDefault: false,
      })
      .where({
        id: Not(zoneId),
        serverId,
      })
      .execute();
  }

  /**
   * Set a zone as default and reset all others in the server
   * @param serverId
   * @param zoneId zoneId to keep the default value
   * @param manager entity manager, provide if wrapping transaction
   */
  async setDefault(
    serverId: number,
    zoneId: number,
    manager?: EntityManager,
  ): Promise<void> {
    if (!manager) manager = this.manager;

    await Promise.all([
      manager
        .createQueryBuilder()
        .update(Zone)
        .set({
          isDefault: true,
        })
        .where({
          id: zoneId,
        })
        .execute(),
      this.resetDefaults(serverId, zoneId),
    ]);
  }
}
