export const getErrors = (title: any) => {
    const error: string[] = [];
    Object.values(title).forEach((err: any) => {
        err.forEach((line: string) => error.push(`<li>${line.trim()}</li>`));
    });

    return error.join(" ");
};
