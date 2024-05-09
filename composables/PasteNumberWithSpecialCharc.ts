export const PasteNumberWithSpecialCharc = (name: any) => {
    // eslint-disable-next-line prefer-regex-literals
    const validNamePattern = new RegExp(/^[0-9@#$%^&*()-_+=!]*$/);
    if (validNamePattern.test(name)) {
        return true;
    } else if (name === "") {
        return true;
    }
    return false;
};
