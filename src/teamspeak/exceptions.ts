import { HttpException, HttpStatus } from '@nestjs/common';
import { channelDoesNotExistInServer } from '../shared/messages/channel.messages';

export class TeamspeakException extends HttpException {
  constructor() {
    super('Teamspeak server error', HttpStatus.SERVICE_UNAVAILABLE);
  }
}

export class InvalidTeamspeakChannelException extends HttpException {
  constructor() {
    super(channelDoesNotExistInServer, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
