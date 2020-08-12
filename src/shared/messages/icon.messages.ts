export const invalidMime = (valid: string[]): string => {
  return 'Icon file type is invalid. Valid: ' + valid.join(',');
};

export const invalidFileImage = 'Content is not a valid image';