import { HttpException, HttpStatus } from '@nestjs/common';

export class TeamspeakException extends HttpException {
  constructor() {
    super('Teamspeak server error', HttpStatus.SERVICE_UNAVAILABLE);
  }
}
