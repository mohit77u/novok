export const CharcAndNumber = (event: any) => {
  const key = event.key;
  const charCode = event.charCode || event.keyCode;

  // Allow alphanumeric characters and white space & 's
  if (/[a-zA-Z0-9\s']/i.test(key) || charCode === 0 || charCode === 32) {
    return true;
  } else {
    event.preventDefault();
    return false;
  }
};
