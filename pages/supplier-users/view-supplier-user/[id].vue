<script lang="ts" setup>
	import type { TabsPaneContext } from "element-plus";
	import { supplierStore } from "~/store/supplier";

	definePageMeta({
		middleware: ["auth", "supplier", "is-supplier-admin", "is-client-admin"],
	});

	useHead({
		title: "View Supplier User",
	});

	const activeTab = ref<any>("supplier-user");
	const store = supplierStore();
	const fullscreenLoading = ref(false);
	const editData = ref<any>({});
	const route = useRoute();
	const localePath = useLocalePath();
	const disabled = ref(true);
	const buttonName = ref<any>("Edit");
	const tabs = ref<any>("");
	const btn = ref<any>("");

	onMounted(async () => {
		activeTab.value = route.query?.tab ? route.query?.tab : activeTab.value;
		store.setActiveTab(activeTab.value);
		await getEditData(activeTab.value);
	});

	const activeTabName = (value: any) => {
		activeTab.value = value;
		getEditData(value);
	};

	const getData = computed(() => {
		return buttonName.value;
	});

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

	const iconClick = () => {
		disabled.value = !disabled.value;
		buttonName.value = disabled.value ? "Edit" : "";
		navigateTo(
			localePath({
				path: `/supplier-users/edit-supplier-user/${route.params.id}`,
				query: { tab: activeTab.value, page: "view" },
			}),
			{ replace: true }
		);
	};

	const disabledData = (value: any) => {
		disabled.value = value;
		buttonName.value = disabled.value ? "Edit" : "";
        const scrollBar = tabs.value.$el.querySelector(".el-tabs__nav-scroll");
		scrollBar.classList.add("mr-20");
	};
</script>

<template>
	<div v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="p-4 min-h-full relative">
		<div class="h-full">
			<SupplierUserPrimaryView :disabled="disabled" :edit-data="editData" @active-tab-name="activeTabName" @disabled="disabledData" />

			<novok-button
				v-if="buttonName !== '' && hasPermissionTo('suppliers-user-edit')"
				ref="btn"
				class="absolute right-6 top-3"
				type="info"
				@click="iconClick"
				>{{ getData }}</novok-button
			>
		</div>
	</div>
</template>
<style lang="scss">
	/* @import "~/assets/css/main.css"; */
	.el-tabs__nav-wrap {
		padding-right: 80px;
		&.is-scrollable {
			@apply pr-28;
		}
		.el-tabs__nav-scroll {
			@apply flex justify-between items-center;
			.el-tabs__nav-next {
				@apply right-20;
			}
		}
	}
</style>
