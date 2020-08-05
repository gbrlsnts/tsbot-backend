import { ClassTransformOptions } from 'class-transformer';
import { ValidationPipeOptions } from '@nestjs/common';

export const passwordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

export const appSerializeOptions: ClassTransformOptions = {
  strategy: 'excludeAll',
  excludePrefixes: ['_'],
};

export const appValidationPipeOptions: ValidationPipeOptions = {
  whitelist: true,
};
