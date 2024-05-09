import { defineStore } from "pinia";

export const sidebarItemStore = defineStore({
    id: "sidebarItem",

    state: () => ({
        sidebarItem: "",
        activeSidebarItem: "",
        sidebarOpen: true,
        sidebarActiveItem: "",
    }),
    persist: true,
    getters: {
        getSidebarItem: (state) => state.sidebarItem,
        getActiveSidebarItem: (state) => state.activeSidebarItem,
        getSidebarOpen: (state) => state.sidebarOpen,
    },
    actions: {
        setSidebarItem(value: any) {
            this.sidebarItem = value;
        },
        setActiveSidebarItem(value: any) {
            this.activeSidebarItem = value;
        },
        setSidebarOpen() {
            this.sidebarOpen = !this.sidebarOpen;
        },
        setSidebarActiveItem(value: string) {
            this.sidebarActiveItem = value;
        },
    },
});
