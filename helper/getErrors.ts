export const getErrors = (title: any) => {
    const error: string[] = [];
    Object.values(title).forEach((err) => {
        error.push(`<li>${err}</li>`);
    });
    return error.join(" ");
};
