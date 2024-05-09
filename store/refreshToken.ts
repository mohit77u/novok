import { defineStore } from "pinia";

export const useRefreshTokenStore = defineStore({
    id: "refreshToken",

    state: () => ({
        is_refresh_token_process: false,
    }),

    persist: true,

    getters: {
        isRefreshTokenProcess: (state) => state.is_refresh_token_process,
    },

    actions: {
        setRefreshTokenProcess(value: boolean) {
            this.is_refresh_token_process = value;
        },
    },
});
