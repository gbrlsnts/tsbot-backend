import { Inject, Logger } from '@nestjs/common';
import { TS_BOT_SERVICE } from 'src/shared/constants';
import { ClientProxy } from '@nestjs/microservices';
import { timeout, take, catchError, tap } from 'rxjs/operators';
import * as config from 'config';
import { TeamspeakException } from './exceptions';

const msgTimeout =
  process.env.TS_MSG_TIMEOUT || config.get<number>('teamspeak.messageTimeout');

export class TeamspeakBusService {
  private readonly logger: Logger;

  constructor(
    @Inject(TS_BOT_SERVICE)
    protected client: ClientProxy,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * Send a message to a teamspeak bot
   * @param pattern pattern to publish the message
   * @param data data to send
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  send<T>(pattern: string, data: any): Promise<T> {
    this.logger.verbose(`Sending message to bot: ${pattern}`);

    return this.client
      .send<T>(pattern, data)
      .pipe(
        tap(() => this.logger.verbose(`Received data from bot: ${pattern}`)),
        take(1),
        timeout(msgTimeout),
        catchError(e => {
          this.logger.error(e?.toString() || 'Teamspeak error', e?.stack);
          throw new TeamspeakException();
        }),
      )
      .toPromise();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  emit(pattern: string, data: any): void {
    this.logger.verbose(`Sending event to bot: ${pattern}`);

    this.client.emit(pattern, data);
  }
}
