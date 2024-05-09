import { defineStore } from "pinia";

export const contactButtonStore = defineStore({
    id: "contact",

    state: () => ({
        contactButton: false,
    }),
    persist: true,
    getters: {
        getcontactButton: (state) => state.contactButton,
    },
    actions: {
        setcontactButton(value: any) {
            this.contactButton = value;
        },
    },
});
