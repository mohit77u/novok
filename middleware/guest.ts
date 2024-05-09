export default defineNuxtRouteMiddleware(() => {
    const localePath = useLocalePath();
    const authToken = useCookie("auth_token");
    const nextScreen = useCookie("next_screen");
    // const isMFA = useCookie("is_mfa");
    // && isMFA.value
    if (nextScreen.value === "dashboard" && authToken.value !== undefined) {
        return navigateTo(localePath("/dashboard"));
    }
});
