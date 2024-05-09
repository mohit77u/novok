import { defineStore } from "pinia";

export const useCustomFieldsStore = defineStore({
    id: "custom_fields",

    state: () => ({
        active_tab: "suppliers",
    }),

    persist: true,

    getters: {
        getActiveTab: (state) => state.active_tab,
    },

    actions: {
        setActiveTab(value: any) {
            this.active_tab = value;
        },
    },
});
