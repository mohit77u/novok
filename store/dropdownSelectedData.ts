import { defineStore } from "pinia";

export const dropdownSelectedData = defineStore({
    id: "dropdown",

    state: () => ({
        country: 0,
    }),
    persist: true,
    getters: {
        getSelectedCountry: (state) => state.country,
    },
    actions: {
        setCountry(value: any) {
            this.country = value;
        },
    },
});
