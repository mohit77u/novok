<script lang="ts" setup>
	import type { TabsPaneContext } from "element-plus";
	import { supplierStore } from "~/store/supplier";

	definePageMeta({
		middleware: ["auth", "supplier", "is-supplier-admin", "is-client-admin"],
	});

	useHead({
		title: "Edit Supplier User",
	});

	const activeTab = ref<any>("supplier-user");
	const store = supplierStore();
	const fullscreenLoading = ref(false);
	const editData = ref<any>({});
	const route = useRoute();
	const localePath = useLocalePath();

	onMounted(async () => {
		store.setActiveTab(activeTab.value);
		activeTab.value = route.query?.tab ? route.query?.tab : store.getActiveTab;
		await getEditData(activeTab.value);
	});

	const activeTabName = (value: any) => {
		activeTab.value = value;
		getEditData(value);
	};

	const getEditData = async (tabName: any) => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch(`/supplier-users/${route?.params?.id}?tab_name=${store.getActiveTab}`, {
				method: "GET",
			});

			editData.value = { ...res?.data, tab: tabName };
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};
</script>

<template>
	<div v-loading="fullscreenLoading" :class="{'overflow-hidden': fullscreenLoading}" class="p-4 min-h-full relative">
		<div class="h-full">
            <SupplierUserPrimary :edit-data="editData" @active-tab-name="activeTabName" />
		</div>
	</div>
</template>
