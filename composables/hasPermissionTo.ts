import useToast from "~/composables/useToast";
import { usePermissionsStore } from "~/store/permissions";
import { useAuthStore } from "~/store/auth";

export function hasPermissionTo(slug: string) {
    const authStore = useAuthStore();
    const permissionsStore = usePermissionsStore();
    const { t } = useI18n();

    // If user role is not client user then return true or slug no-check
    if (authStore.role_id !== "client_user" || slug === "No-Check") {
        return true;
    }

    // // Update user permissions set every 45 min
    // const permissionUpdateTime = useCookie("permission_update_time");
    // const permissionUpdateTimeValue = permissionUpdateTime.value
    //     ? parseInt(permissionUpdateTime.value, 10)
    //     : 0;
    // const currentTime = new Date().getTime();
    // const timeDifference = currentTime - permissionUpdateTimeValue;

    // if (
    //     timeDifference > 45 * 60 * 1000 ||
    //     permissionsStore.permissions === null
    // ) {
    //     permissionUpdateTime.value = String(new Date().getTime());
    //     await permissionsStore.fetchPermissions();
    // }

    if (
        permissionsStore.permissions &&
        permissionsStore.permissions.includes(slug)
    ) {
        return true;
    } else {
        // useToast(
        //     "error",
        //     t("formValidations.you_do_not_have_permission_to_access_this_page"),
        // );
        return false;
    }
}
