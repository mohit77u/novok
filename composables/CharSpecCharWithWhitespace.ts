export const CharSpecCharWithWhitespace = (evt: any, length: any) => {
    evt = evt || window.event;
    const charCode = evt.which ? evt.which : evt.keyCode;
    // Alphabets (uppercase and lowercase), whitespace, and special characters
    if (
        (charCode > 64 && charCode < 91) || // Uppercase letters
        (charCode > 96 && charCode < 123) || // Lowercase letters
        charCode === 32 || // Whitespace
        (charCode > 32 && charCode < 48) || // Special characters between space and numbers
        (charCode > 57 && charCode < 65) || // Special characters between numbers and uppercase letters
        (charCode > 90 && charCode < 97) || // Special characters between uppercase and lowercase letters
        (charCode > 122 && charCode < 127) // Special characters after lowercase letters
    ) {
        if (length > 50) {
            return evt.preventDefault();
        }
        return true;
    }
    return evt.preventDefault();

};


