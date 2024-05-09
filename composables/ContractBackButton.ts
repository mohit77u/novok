import { contractStore } from "~/store/contract";
export const ContractBackButton = (tab: any) => {
    const router = useRouter();
    const route = useRoute();
    const localePath = useLocalePath();
    const ContractStore = contractStore();

    ContractStore.setActiveTab(tab);

    router.push(
        localePath({
            path: route.fullPath,
            query: { tab: tab },
        }),
        { replace: true },
    );
};
