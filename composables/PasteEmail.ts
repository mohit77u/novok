export const PasteEmail = (name: any) => {
  // eslint-disable-next-line prefer-regex-literals
  const validNamePattern = new RegExp(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  );
  if (validNamePattern.test(name) || name === "") {
    return true;
  }
  return false;
};
