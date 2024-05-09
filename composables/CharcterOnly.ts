export const CharcterOnly = (evt: any) => {
  evt = evt || window.event;
  const charCode = evt.which ? evt.which : evt.keyCode;
  if ((charCode > 64 && charCode < 91) || (charCode > 96 && charCode < 123)) {
    if (length > 50) {
      return evt.preventDefault();
    }
    return true;
  }
  return evt.preventDefault();
};
