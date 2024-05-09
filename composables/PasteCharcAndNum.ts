export const PasteCharcAndNum = (name: any) => {
  // eslint-disable-next-line prefer-regex-literals
  const validNamePattern = new RegExp(/^[a-zA-Z0-9]+$/);
  if (validNamePattern.test(name)) {
    return true;
  } else if (name === "") {
    return true;
  }
  return false;
};
