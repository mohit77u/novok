export const PasteCharcWithSpace = (name: any) => {
  // eslint-disable-next-line prefer-regex-literals
  const validNamePattern = new RegExp(/^[a-zA-Z\s]+$/);
  if (validNamePattern.test(name)) {
    return true;
  } else if (name === "") {
    return true;
  }
  return false;
};
