export const NumbersOnly = (evt: any, code: any) => {
  evt = evt || window.event;

  const charCode = evt.which ? evt.which : evt.keyCode;
  if (charCode < 48 || charCode > 57) {
    return evt.preventDefault();
  }
  if (charCode < 95 && charCode > 106) {
    return evt.preventDefault();
  }
  // if (length === 10) {
  //   return evt.preventDefault();
  // }
  if (code && length === 6) {
    return evt.preventDefault();
  }
  return true;
};
