import { defineStore } from "pinia";

export const useProfileStore = defineStore({
    id: "profile",

    state: () => ({
        profileData: {
            user_detail: {
                company: {
                    company_name: "",
                    company_logo: "",
                },
                role_name: "",
                role_id: "",
                id: "",
                is_delegated: 0,
                delegated_user_id: 0,
                timezone: "",
                address: "",
                city: "",
                state: "",
                country: "",
                post_code: "",
                tenant_user_detail_id: "",
            },
        },
        companyLogoUrl: "",
        mfaValue: false,
    }),
    // persist: true,
    getters: {
        getProfileData: (state) => state.profileData,
        getCompanyDetails: (state) => state.profileData?.user_detail?.company,
        getMFAValue: (state) => state.mfaValue,
        getAuthUserRoleId: (state) =>
            state.profileData?.user_detail?.role_name
                .toLowerCase()
                .replace(/\s+/g, "_"),
    },
    actions: {
        setProfile(value: any) {
            this.profileData = value;
            // Set session storage data
            sessionStorage.setItem(
                "company_id",
                value?.user_detail?.company?.id,
            );

            // remove old session
            sessionStorage.removeItem("client_admin_id");
            // sessionStorage.removeItem("supplier_admin_id");

            switch (value?.user_detail?.role_name) {
                case "Client Admin":
                    sessionStorage.setItem(
                        "client_admin_id",
                        value?.user_detail?.id,
                    );
                    break;

                case "Client User":
                    sessionStorage.setItem(
                        "client_admin_id",
                        value?.user_detail?.client_admin_id,
                    );
                    break;

                case "Supplier Admin":
                    const supplier_admin_id = useCookie("supplier_admin_id");
                    supplier_admin_id.value =
                        value?.user_detail?.tenant_user_detail_id;
                    // sessionStorage.setItem(
                    //     "supplier_admin_id",
                    //     value?.user_detail?.tenant_user_detail_id,
                    // );
                    break;
            }

            this.companyLogoUrl = value?.user_detail?.company?.company_logo;
        },
        setMFAvalue(value: any) {
            this.mfaValue = value;
        },
        setCompanyLogo(value: string) {
            this.companyLogoUrl = value;
        },
    },
});
