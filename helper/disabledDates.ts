import moment from "moment";
export const getDisabledStartDates = (date: any, formDate:any) => {
    const curretDate = moment(date).format();
    const newDate = formDate ? moment(formDate)?.format() : "";
    if (formDate) {
        if (curretDate < newDate) {
            return false;
        } else {
            return true;
        }
    } else {
        return false;
    }
};

export const getDisabledEndDates = (date: any, formDate:any) => {
    const curretDate = moment(date).format();
    const newDate = formDate ? moment(formDate)?.format() : "";

    if (curretDate < newDate) {
        return true;
    } else {
        return false;
    }
};
