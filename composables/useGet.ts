import { storeToRefs } from "pinia";
import { useAuthStore } from "~/store/auth";
export const useGet = async (Url: any) => {
    const config = useRuntimeConfig();
    const store = useAuthStore();
    const language = store.getLanguage;
    const localePath = useLocalePath();

    // if refresh token API called then skip it for second time
    const isRefreshAPICall: number | null = Number(
        sessionStorage.getItem("isRefreshAPICall"),
    );

    if (isRefreshAPICall === 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        useGet(Url);
    }

    // Set auth token into request
    const authToken = useCookie("auth_token");

    // If remember me then check access token is expired create new access token
    // start //
    const rememberMe = useCookie("remember_me");
    const rememberMeValue = rememberMe.value
        ? parseInt(rememberMe.value, 10)
        : 0;
    if (rememberMeValue === 1) {
        const authenticateTime = useCookie("authenticate_time");
        const authenticateTimeValue = authenticateTime.value
            ? parseInt(authenticateTime.value, 10)
            : 0;
        const currentTime = new Date().getTime();
        const timeDifference = currentTime - authenticateTimeValue;

        if (timeDifference > 30 * 60 * 1000) {
            const refreshToken = useCookie("refresh_token");
            const sub = useCookie("sub");

            try {
                sessionStorage.setItem("isRefreshAPICall", "1");

                const response: any = await $fetch(
                    config.public.apiBase + "/refresh-token",
                    {
                        method: "POST",
                        body: {
                            sub: sub.value,
                            refresh_token: refreshToken.value,
                        },
                        headers: {
                            Authorization: "Bearer" + " " + authToken.value,
                            Accept: "application/json",
                            // ContentType: "multipart/form-data"
                            ContentType: "application/json",
                            lang: language.code,
                        },
                    },
                );

                if (!response.status) {
                    // Handle non-successful response (e.g., HTTP status is not true)
                    throw new Error(
                        `Request failed with status: ${response.status}`,
                    );
                }

                authToken.value = response.data?.AccessToken;
                refreshToken.value = response.data?.RefreshToken;
                authenticateTime.value = String(new Date().getTime());
            } catch (error: any) {
                useToast("error", "Session expired!");
                authLogout();
                throw error;
            } finally {
                sessionStorage.removeItem("isRefreshAPICall");
            }
        }
    }
    // end //

    try {
        const response: any = await $fetch(`${config.public.apiBase}${Url}`, {
            method: "GET",
            headers: {
                Authorization: "Bearer" + " " + authToken.value,
                Accept: "application/json",
                lang: language.code,
                // ContentType: "multipart/form-data"
            },
        });

        if (!response.status) {
            // Handle non-successful response (e.g., HTTP status is not true)
            throw new Error(`Request failed with status: ${response.status}`);
        }

        // If the response is successful, parse and return the data
        return response;
    } catch (error: any) {
        if (error.statusCode === 401) {
            useToast("error", "Session expired!");
            authLogout();
        } else if (error.statusCode === 409) {
            navigateTo(localePath("/403"));
        } else {
            throw error; // You may want to handle this differently based on your use case
        }
    }
};
