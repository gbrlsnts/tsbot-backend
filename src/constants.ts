import { ClassTransformOptions } from "class-transformer";

export const passwordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

export const appSerializeOptions: ClassTransformOptions = {
  strategy: 'excludeAll',
  excludePrefixes: ['_'],
};