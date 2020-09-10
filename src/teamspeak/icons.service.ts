import { Injectable } from '@nestjs/common';
import { TeamspeakBusService } from './teamspeak-bus.service';
import {
  getIconsSubject,
  uploadIconSubject,
  deleteIconSubject,
} from './subjects';
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

  /**
   * Upload an icon
   * @param serverId
   * @param icon icon contents base64 encoded
   */
  async uploadIcon(serverId: number, icon: string): Promise<number> {
    return this.busService.send<number>(uploadIconSubject(serverId), icon);
  }

  /**
   * Delete multiple icons
   * @param serverId
   * @param icons icon teamspeak ids
   */
  async deleteIcons(serverId: number, icons: number[]): Promise<void> {
    return this.busService.send<void>(deleteIconSubject(serverId), icons);
  }
}
