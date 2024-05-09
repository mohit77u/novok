export const GetOffset = (idName: any, extraSpace: any) => {
  const element: any = document.getElementById(idName);

  const topOffset = element.offsetTop;
  return window.innerHeight - topOffset - extraSpace;
};
