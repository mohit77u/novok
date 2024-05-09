import { defineStore } from "pinia";

export const useFullscreenLoading = defineStore({
    id: "fullscreen_loading",

    state: () => ({
        loading: false,
    }),

    persist: true,

    getters: {
        getLoading: (state) => state.loading,
    },

    actions: {
        startLoading() {
            this.loading = true;
        },
        stopLoading() {
            this.loading = false;
        },
    },
});
