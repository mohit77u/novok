import { useRefreshTokenStore } from "./../store/refreshToken";
import { useAuthStore } from "~/store/auth";
import useToast from "~/composables/useToast";

const controller = new AbortController();
const { signal } = controller;

export async function useApiFetch(path: string, options: any) {
    const store = useAuthStore();
    const RefreshTokenStore = useRefreshTokenStore();
    const authToken = useCookie("auth_token");
    const config = useRuntimeConfig();
    const language = store.getLanguage;
    const localePath = useLocalePath();

    // if RefreshTokenStore.isRefreshTokenProcess is true, then wait all calls until it becomes false
    while (RefreshTokenStore.isRefreshTokenProcess) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    const refreshTokenIfExpired = async () => {
        const rememberMe = useCookie("remember_me");
        if (!rememberMe.value) return;

        const authenticateTime = useCookie("authenticate_time");
        const authenticateTimeValue = parseInt(
            authenticateTime.value || "0",
            10,
        );
        const currentTime = new Date().getTime();
        const timeDifference = currentTime - authenticateTimeValue;

        if (timeDifference > 30 * 60 * 1000) {
            const refreshToken = useCookie("refresh_token");
            const sub = useCookie("sub");
            RefreshTokenStore.setRefreshTokenProcess(true);

            try {
                const response: any = await $fetch(
                    config.public.apiBase + "/refresh-token",
                    {
                        method: "POST",
                        body: {
                            sub: sub.value,
                            refresh_token: refreshToken.value,
                        },
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            lang: language.code,
                            Authorization: "Bearer " + authToken.value,
                            ...options?.headers,
                        },
                        signal, // Pass the signal to the fetch call
                    },
                );

                if (!response.status) {
                    throw new Error(
                        `Request failed with status: ${response.status}`,
                    );
                }

                authToken.value = response.data?.AccessToken;
                refreshToken.value = response.data?.RefreshToken;
                authenticateTime.value = String(new Date().getTime());
                RefreshTokenStore.setRefreshTokenProcess(false);
            } catch (error: any) {
                const errorMessage = error.data?.message || "Session expired!";
                useToast("error", errorMessage);
                authLogout(); // Define authLogout function to handle logout
                // Store the error message in localStorage
                localStorage.setItem("errorMessage", errorMessage);
                controller.abort(); // Abort all running calls
                window.location.reload();
                throw error;
            }
        }
    };

    try {
        await refreshTokenIfExpired();
        const response: any = await $fetch(config.public.apiBase + path, {
            ...options,
            headers: {
                ContentType: "application/json",
                Accept: "application/json",
                lang: language.code,
                Authorization: "Bearer " + authToken.value,
                ...options?.headers,
            },
            signal, // Pass the signal to the fetch call
        });

        if (!response.status) {
            throw new Error(`Request failed with status: ${response.status}`);
        }

        return response;
    } catch (error: any) {
        if (error.statusCode === 401) {
            const errorMessage = error.data?.message || "Session expired!";
            authLogout(); // Define authLogout function to handle logout
            // Store the error message in localStorage
            localStorage.setItem("errorMessage", errorMessage);
            controller.abort(); // Abort all running calls
            window.location.reload();
        } else if (error.statusCode === 404) {
            navigateTo(localePath("/404")); // Define navigateTo function to handle navigation
        } else if (error.statusCode === 409) {
            navigateTo(localePath("/403")); // Define navigateTo function to handle navigation
        } else if (error.statusCode === 500) {
            navigateTo(localePath("/500")); // Define navigateTo function to handle navigation
        } else if (error.data?.errors) {
            useToast("error", getErrors(error.data?.errors));
        } else {
            useToast("error", error.data?.message);
        }
        throw error;
    }
}
