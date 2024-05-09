import { storeToRefs } from "pinia";
import { sidebarItemStore } from "~/store/sidebarItem";
import { useAuthStore } from "~/store/auth";

export const sidebarItemClear = () => {
    const store = sidebarItemStore();
    const authStore = useAuthStore();
    store.setActiveSidebarItem("");
    store.setSidebarItem("");
    // authStore.setToken("");
    // localStorage.setItem("token", "");
    // const rememberMe = localStorage.getItem("remember_me");
    // navigateTo("/sign-in");
    authStore.setLanguage({
        label: "English",
        code: "en",
    });

    // const data = reactive({
    //     refresh_token: refreshToken.value,
    //     sub: sub.value,
    // });
    // if (rememberMe === "1") {
    //     usePost("/refresh-token", data)
    //         .then((res: any) => {
    //             authStore.setToken(res.data?.AccessToken);
    //             localStorage.setItem("token", res.data?.AccessToken);
    //             authStore.setRefreshToken(res.data?.RefreshToken);
    //         })
    //         .catch(() => {
    //             navigateTo("/sign-in");
    //         });
    // } else {
    //     navigateTo("/sign-in");
    // }

    return sidebarItemClear;
};
