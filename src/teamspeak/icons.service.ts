import { Injectable } from '@nestjs/common';
import { TeamspeakBusService } from './teamspeak-bus.service';
import { getIconsSubject } from './subjects';
import { TsIcon } from './types/icons';

@Injectable()
export class TsIconService {
  constructor(private busService: TeamspeakBusService) {}

  /**
   * Get all server groups
   * @param serverId
   */
  async getIcons(serverId: number, icons: number[]): Promise<TsIcon[]> {
    return this.busService.send<TsIcon[]>(getIconsSubject(serverId), icons);
  }
}
