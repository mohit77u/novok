import { defineStore } from "pinia";

export const usePermissionsStore = defineStore({
    id: "permissions",

    state: () => ({
        permissions: null as Array<string> | null,
    }),

    getters: {
        getPermissions: (state) => state.permissions,
    },

    actions: {
        setPermissions(value: Array<string> | null) {
            this.permissions = value;
            const userPermissions = useCookie("user_permissions");
            userPermissions.value = JSON.stringify(value);
        },
    },
});
