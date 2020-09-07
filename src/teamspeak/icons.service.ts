import { Injectable } from '@nestjs/common';
import { TeamspeakBusService } from './teamspeak-bus.service';
import { getIconsSubject } from './subjects';
import { TsIcon } from './types/icons';

@Injectable()
export class TsIconService {
  constructor(private busService: TeamspeakBusService) {}

  /**
   * Get all server icons
   * @param serverId
   * @param icons if provided get only these icon ids
   */
  async getIcons(serverId: number, icons: number[] = []): Promise<TsIcon[]> {
    const uniqueIcons = Array.from(new Set(icons));

    return this.busService.send<TsIcon[]>(
      getIconsSubject(serverId),
      uniqueIcons,
    );
  }
}
