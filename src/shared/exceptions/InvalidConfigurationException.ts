import { UnprocessableEntityException } from '@nestjs/common';

export class InvalidConfigurationException extends UnprocessableEntityException {
  /**
   * Create an invalid configuration exception
   * @param error error raised in the exception
   */
  constructor(error?: string) {
    super(error, 'Invalid Server Configuration');
  }
}
