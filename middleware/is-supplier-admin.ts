export default defineNuxtRouteMiddleware(async (to, from) => {
    // const authToken = useCookie("auth_token");
    const router = useRouter();
    const localePath = useLocalePath();
    const roleId = useCookie("role_id");

    // if(roleId.value != "supplier_admin") {
    //     router.push(localePath("/403"));
    // } 
});
