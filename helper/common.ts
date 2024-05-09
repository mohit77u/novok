import moment from "moment";

export const commaThreeDigitFormat = (value: any) => {
    if (value) {
        let finalValue = parseInt(value);
        // Use regex to add commas every three digits from the right
        return finalValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
};

export const getValueLabel = (metadata: any, value: any) => {
    const findItem = metadata.find((item: any) => item.value == value);
    return findItem?.label ?? "";
};

export const getFormattedTimeValue = (value: any) => {
    return value ? moment(value)?.format("hh:mm A") : null;
};

export const getFormattedTimeValueWithFormat = (value: any, format: string) => {
    return value ? moment(value, format)?.format("hh:mm A") : null;
};

export const getFormattedDateValue = (value: any) => {
    return value ? moment(value)?.format("DD/MM/YYYY") : null;
};

export const getFormattedDateTimeValue = (value: any) => {
    return value ? moment(value)?.format("DD/MM/YYYY hh:mm A") : null;
};

export const getFileNameFromURL = (value: any) => {
    if (value) {
        const url: string = value;
        const parts = url?.split("/");
        const filenameWithTimestamp = parts[parts.length - 1];
        const filenameParts = filenameWithTimestamp.split("_");
        const filename = filenameParts.slice(1).join("_");
        return filename;
    }

    return null;
};

export const getTimeZoneList = async () => {
    return await $fetch(`https://worldtimeapi.org/api/timezone/`, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    })
        .then((res: any) => {
            const timeZonesList = res?.map((field: any) => {
                return {
                    label: field,
                    value: field,
                };
            });
            return timeZonesList;
        })
        .catch((err) => {
            return err;
        });
};

export const abbreviateNumber = (number: any) => {
    let numberValue = parseInt(number);
    let absNumber = Math.abs(numberValue);

    let value = "";
    if (absNumber < 1000) {
        value = number.toFixed(2);
    } else if (absNumber < 1000000) {
        value = (number / 1000).toFixed(2) + "K";
    } else if (absNumber < 1000000000) {
        value = (number / 1000000).toFixed(2) + "M";
    } else {
        value = (number / 1000000000).toFixed(2) + "B";
    }

    return value;
};

export const removeEmptyValues = (obj: any) => {
    Object.keys(obj).forEach((key: any) => {
        if (
            obj[key] == null ||
            obj[key] === "" ||
            obj[key] === "null" ||
            obj[key] === "undefined" ||
            obj[key] === undefined
        ) {
            obj[key] = "";
        }
    });
    return obj;
};
