import { supplierStore } from "~/store/supplier";
export const SupplierBackButton = (tab: any) => {
    const router = useRouter();
    const route = useRoute();
    const localePath = useLocalePath();
    const SupplierStore = supplierStore();

    SupplierStore.setActiveTab(tab);

    router.push(
        localePath({
            path: route.fullPath,
            query: { tab: tab },
        }),
        { replace: true },
    );
};
