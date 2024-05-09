import { defineStore } from "pinia";

export const mobileSidebar = defineStore({
    id: "mobile",

    state: () => ({
        mobileSidebarOpen: false,
        footerOpen: false,
    }),
    // persist: true,
    getters: {
        getMobileSidebar: (state) => state.mobileSidebarOpen,
        getFooterOpen: (state) => state.footerOpen,
    },
    actions: {
        setMobileSidebar(value: any) {
            this.mobileSidebarOpen = value;
        },
        setFooterOpen() {
            this.footerOpen = !this.footerOpen;
        },
    },
});
