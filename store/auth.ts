import { defineStore } from "pinia";

export const useAuthStore = defineStore({
    id: "auth",

    state: () => ({
        role_id: "",
        language: {
            label: "English",
            code: "en",
        },
        accountsList: [],
        clientAdminList: [],
        nextScreen: "",
    }),

    // persist: true,

    getters: {
        getRoleId: (state) => state.role_id,
        getLanguage: (state) => state.language,
    },

    actions: {
        setRoleId(value: any) {
            switch (parseInt(value)) {
                case 1:
                    this.role_id = "super_admin";
                    break;
                case 2:
                    this.role_id = "super_user";
                    break;
                case 3:
                    this.role_id = "client_account_manager";
                    break;
                case 4:
                    this.role_id = "client_admin";
                    break;
                case 5:
                    this.role_id = "client_user";
                    break;
                case 6:
                    this.role_id = "supplier_admin";
                    break;
                case 7:
                    this.role_id = "supplier_user";
                    break;
                default:
                    this.role_id = "";
                    break;
            }
            // const roleId = useCookie("role_id");
            // roleId.value = this.role_id;
        },

        setLanguage(value: any) {
            this.language = value;
        },

        setAccountsList(value: never[]) {
            this.accountsList = value;
        },

        setClientAdminList(value: never[]) {
            this.clientAdminList = value;
        },

        setNextScreen(value: string) {
            this.nextScreen = value;

            const nextScreen = useCookie("next_screen");
            nextScreen.value = value;
        },
    },
});
