import {
  ValidationOptions,
  registerDecorator,
  isString,
} from 'class-validator';

export function FixedLength(length: number, validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string): void {
    registerDecorator({
      name: 'FixedLength',
      target: object.constructor,
      propertyName,
      options: {
        message: `${propertyName} must have exactly 28 characters`,
        ...validationOptions,
      },
      validator: {
        validate(value: any): boolean {
          return isString(value) && value.length === length;
        },
      },
    });
  };
}
