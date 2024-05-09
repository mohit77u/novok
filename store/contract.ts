import { defineStore } from "pinia";

export const contractStore = defineStore({
    id: "contract",

    state: () => ({
        active_tab: "primary-details",
        contractNumber: "",
    }),
    persist: true,
    getters: {
        getActiveTab: (state) => state.active_tab,
        getContractNumber: (state) => state.contractNumber,
    },
    actions: {
        setActiveTab(value: any) {
            this.active_tab = value;
        },
        setContractNumber(value: any) {
            this.contractNumber = value;
        },
    },
});
