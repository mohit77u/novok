export const PasteNumberOnly = (name: any) => {
  // eslint-disable-next-line prefer-regex-literals
  const validNamePattern = new RegExp(/^[0-9]+$/);
  if (validNamePattern.test(name) || name === "") {
    return true;
  }
  return false;
};
