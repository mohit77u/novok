import { useAuthStore } from "~/store/auth";
import { useProfileStore } from "~/store/profile";
export const useSelectAccount = () => {
    const authStore = useAuthStore();
    const profileStore = useProfileStore();
    const loading = ref(false);
    const localePath = useLocalePath();
    const router = useRouter();

    const formData = reactive<any>({
        account_id: "",
    });

    const mounted = async () => {
        const getAccountId: any = useCookie("account_id");
        const accountIdString: string | null = getAccountId.value;
        let accountId: number | null;
        if (accountIdString !== null) {
            accountId = parseInt(accountIdString);
            const isIdPresent = authStore.accountsList.some(
                (item: any) => parseInt(item.id) === accountId,
            );

            if (isIdPresent) {
                return accountId;
            }
        }

        return null;
    };

    const submit = async (id: number, title: String) => {
        formData.account_id = id;
        try {
            const res: any = await useApiFetch(`/select/account`, {
                method: "POST",
                body: formData,
            });

            const accountId = useCookie("account_id");
            accountId.value = formData.account_id;
            const sub = useCookie("sub");
            sub.value = res.data?.user?.cognito_id;

            authStore.setNextScreen(res.data?.next_screen);
            authStore.setRoleId(res.data?.user?.user_detail?.role_id);
            profileStore.setProfile(res.data?.user);
            profileStore.setMFAvalue(res.data?.user?.is_mfa === 1);

            const roleId = useCookie("role_id");
            roleId.value = authStore.getRoleId;

            loading.value = false;
            // if (!res.data?.user?.is_mfa) {
            //     router.push("/mfa-enable");
            // }
            // else {
            const tenant_supplier_id = useCookie("tenant_supplier_id");
            tenant_supplier_id.value = res.data?.tenant_supplier_id;
            const is_profile_setup = useCookie("is_profile_setup");
            is_profile_setup.value =
                res.data?.user?.user_detail?.is_profile_setup;

            if (
                !res.data?.user?.user_detail?.is_profile_setup &&
                res.data?.tenant_supplier_id !== null
            ) {
                navigateTo(
                    localePath(
                        `/supplier-admins/edit-supplier-admin/${res.data?.tenant_supplier_id}`,
                    ),
                );
            } else {
                navigateTo(localePath("/dashboard"));
                useToast("success", res?.message);
            }
            // }
        } catch (err: any) {
            loading.value = false;
        }
    };

    return {
        submit,
        mounted,
        loading,
    };
};
