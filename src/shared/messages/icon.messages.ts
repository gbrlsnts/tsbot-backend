export const invalidMime = (valid: string[]): string => {
  return 'Icon file type is invalid. Valid: ' + valid.join(',');
};