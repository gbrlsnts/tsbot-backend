import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'nest-emitter';
import { Zone } from 'src/servers/configs/zone/zone.entity';

export interface AppEvent {
  zoneUpdated: Zone;
}

export type AppEventEmitter = StrictEventEmitter<EventEmitter, AppEvent>;
