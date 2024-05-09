import { defineStore } from "pinia";

export const supplierStore = defineStore({
    id: "supplier",

    state: () => ({
        supplier_creation_id: 0,
        active_tab: "primary-details",
    }),
    persist: true,
    getters: {
        getNewSupplierId: (state) => state.supplier_creation_id,
        getActiveTab: (state) => state.active_tab,
    },
    actions: {
        setNewSupplierId(value: any) {
            this.supplier_creation_id = value;
        },

        setActiveTab(value: any) {
            this.active_tab = value;
        },
    },
});
