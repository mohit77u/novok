export default defineNuxtRouteMiddleware(async () => {
    const localePath = useLocalePath();
    const tenant_supplier_id = useCookie("tenant_supplier_id");
    const is_filled_primary_details = useCookie("is_filled_primary_details");
    const is_profile_setup = useCookie("is_profile_setup");
    if (!is_filled_primary_details.value && !is_profile_setup.value) {
        return navigateTo(
            localePath(
                `/supplier-admins/edit-supplier-admin/${tenant_supplier_id.value}`,
            ),
        );
    }
});
