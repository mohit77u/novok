export default defineNuxtRouteMiddleware(() => {
    const authToken = useCookie("auth_token");
    const localePath = useLocalePath();
    const nextScreen = useCookie("next_screen");
    // const isMFA = useCookie("is_mfa");
    // || !isMFA.value
    if (!authToken.value || nextScreen.value !== "dashboard") {
        return navigateTo(localePath("/sign-in"));
    }
});
