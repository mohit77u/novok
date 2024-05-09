import { useAuthStore } from "~/store/auth";
import { sidebarItemStore } from "~/store/sidebarItem";

export const authLogout = async () => {
    const authStore = useAuthStore();
    const sideBarStore = sidebarItemStore();
    const localePath = useLocalePath();
    const router = useRouter();

    authStore.setRoleId("");
    authStore.setNextScreen("");
    authStore.setAccountsList([]);
    authStore.setClientAdminList([]);
    sideBarStore.setSidebarItem("");
    sideBarStore.setActiveSidebarItem("");
    authStore.setLanguage({
        label: "English",
        code: "en",
    });

    const authToken = useCookie("auth_token");
    authToken.value = null;
    const refreshToken = useCookie("refresh_token");
    refreshToken.value = null;
    const sub = useCookie("sub");
    sub.value = null;
    const rememberMe = useCookie("remember_me");
    rememberMe.value = null;
    const authSession = useCookie("auth_session");
    authSession.value = null;
    const nextScreen = useCookie("next_screen");
    nextScreen.value = null;
    const authenticateTime = useCookie("authenticate_time");
    authenticateTime.value = null;

    router.push(localePath("/sign-in"));
};
