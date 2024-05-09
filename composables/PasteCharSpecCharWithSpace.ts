export const PasteCharSpecCharWithSpace = (name: any) => {
    // eslint-disable-next-line prefer-regex-literals
    const validPattern = new RegExp(/^([a-zA-Z_\W]+\s?)*$/);
    if (validPattern.test(name)) {
        return true;
    } else if (name === "") {
        return true;
    }
    return false;
};
