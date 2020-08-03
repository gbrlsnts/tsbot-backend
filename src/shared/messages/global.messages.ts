export const atLeastOnePropertyDefined =
  'At least one property must be defined';

export const propLessThanAnother = (prop: string, otherProp: string): string => {
  return `${prop} must be less than ${otherProp}`;
}