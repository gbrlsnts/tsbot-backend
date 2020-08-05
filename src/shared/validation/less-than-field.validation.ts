import {
  ValidationOptions,
  registerDecorator,
  ValidatorConstraintInterface,
  ValidatorConstraint,
  ValidationArguments,
} from 'class-validator';
import { isNumber } from 'util';
import { propLessThanAnother } from '../messages/global.messages';

export function LessThanField(
  property: string,
  validationOptions?: ValidationOptions,
) {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: {
        message: propLessThanAnother(propertyName, property),
        ...validationOptions,
      },
      constraints: [property],
      validator: LessThanFieldConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'LessThanField' })
export class LessThanFieldConstraint implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  validate(value: any, args: ValidationArguments): boolean {
    // ignore undefined
    if (!value) return true;
    // validate number
    if (!isNumber(value)) return false;

    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];

    // ignore undefined
    if (!relatedValue) return true;
    // validate number
    if (!isNumber(relatedValue)) return false;

    return value < relatedValue;
  }
}
