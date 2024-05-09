import { requestStatus, requestType } from "~/helper/data";

export const CancelRedirect = (name: any) => {
    const route = useRoute();
    const localePath = useLocalePath();
    const redirect = sessionStorage.getItem("redirectFrom");

    const pageDetails = JSON.parse(
        sessionStorage.getItem("pageDetails") || "{}",
    );
    const queryUrl = {
        page: pageDetails?.page,
        perPage: pageDetails?.perPage,
        searchValue: pageDetails?.searchValue,
        sortOrder: pageDetails?.sortOrder,
        sortColumn: pageDetails?.sortColumn,
        // formDetails: pageDetails?.formDetails,
        // id: pageDetails?.id,
        // contractStartDate: pageDetails?.contractStartDate,
        // contractEndDate: pageDetails?.contractEndDate,
        // contractOwner: pageDetails?.contractOwner,
        // supplierLead: pageDetails?.supplierLead,
        // contractStatus: pageDetails?.contractStatus,
        currency: pageDetails?.currency,
        // contractType: pageDetails?.contractType,
        category: pageDetails?.category,
        // contractValidity: pageDetails?.contractValidity,
        country: pageDetails?.country,
        status: pageDetails?.status,
        moduleName: pageDetails?.moduleName,
        projectStatus: pageDetails?.projectStatus,
        requestType: pageDetails?.requestType,
        requestStatus: pageDetails?.requestStatus,
        signingEntity: pageDetails?.signingEntity,
    };
    navigateTo(
        localePath({
            path: name,
            query: queryUrl,
        }),
    );
};
