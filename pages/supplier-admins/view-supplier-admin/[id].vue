<script lang="ts" setup>
	import type { TabsPaneContext } from "element-plus";
	import { supplierStore } from "~/store/supplier";
	import { useAuthStore } from "~/store/auth";

	const { t } = useI18n();

	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});

	useHead({
		title: "View Supplier Admin",
	});

	const activeTab = ref<any>("primary-details");
	const store = supplierStore();
	const authStore = useAuthStore();
	const fullscreenLoading = ref(false);
	const editData = ref<any>({});
	const route = useRoute();
	const localePath = useLocalePath();
	const disabled = ref(true);
	const buttonName = ref<any>(t("buttons.edit"));
	const tabs = ref<any>("");
	const btn = ref<any>("");

	onMounted(() => {
		activeTab.value = route.query?.tab ? route.query?.tab : activeTab.value;
		store.setActiveTab(activeTab.value);
		getEditData(activeTab.value);
		const scrollBar = tabs.value.$el.querySelector(".el-tabs__nav-scroll");
		// scrollBar.appendChild(btn.value.$el);
		scrollBar.classList.add("mr-20");
	});

	const handleClick = (tab: TabsPaneContext) => {
		buttonName.value = disabled.value ? t("buttons.edit") : "";
		store.setActiveTab(tab.paneName);
		// editData.value = {};
		getEditData(tab.paneName);
		navigateTo(
			localePath({
				path: route.fullPath,
				query: { tab: tab.paneName, page: "view" },
			}),
			{ replace: true }
		);
	};

	const activeTabName = (value: any) => {
		activeTab.value = value;
		getEditData(value);
	};

	const getEditData = async (tabName: any) => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch(`/supplier-admins/${route?.params?.id}?tab_name=${store.getActiveTab}`, {
				method: "GEt",
			});
			editData.value = { ...res?.data, tab: tabName };
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const iconClick = () => {
		fullscreenLoading.value = true;
		disabled.value = !disabled.value;
		buttonName.value = disabled.value ? t("buttons.edit") : "";
		const scrollBar = tabs.value.$el.querySelector(".el-tabs__nav-scroll");
		scrollBar.classList.remove("mr-20");
		navigateTo(
			localePath({
				path: `/supplier-admins/edit-supplier-admin/${route.params.id}`,
				query: { tab: activeTab.value, page: "view" },
			}),
			{ replace: true }
		);
	};

	const disabledData = (value: any) => {
		disabled.value = value;
		buttonName.value = disabled.value ? t("buttons.edit") : "";
		const scrollBar = tabs.value.$el.querySelector(".el-tabs__nav-scroll");
		scrollBar.classList.add("mr-20");
	};

	const getData = computed(() => {
		return buttonName.value;
	});
</script>

<template>
	<div v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="p-4 min-h-full relative">
		<div class="h-full">
			<el-tabs ref="tabs" v-model="activeTab" class="demo-tabs" @tab-click="handleClick">
				<el-tab-pane name="primary-details">
					<template #label>
						<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
							<BaseLabel :label="$t('formLabels.primary_details')" :tooltip-content="$t('info.primary_details')" />
						</div>
					</template>
					<SupplierAdminNewView
						:disabled="disabled"
						:edit-data="editData"
						:active-tab="activeTab"
						@active-tab-name="activeTabName"
						@disabled="disabledData"
					/>
				</el-tab-pane>

				<el-tab-pane name="compliance-due-diligence">
					<template #label>
						<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
							<BaseLabel :label="$t('formLabels.compliance')" :tooltip-content="$t('info.compliance')" />
						</div>
					</template>
					<SupplierAdminComplianceView
						:disabled="disabled"
						:edit-data="editData"
						:active-tab="activeTab"
						@active-tab-name="activeTabName"
						@disabled="disabledData"
					/>
				</el-tab-pane>

				<el-tab-pane name="reference">
					<template #label>
						<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
							<BaseLabel :label="$t('formLabels.reference-1')" :tooltip-content="$t('info.reference-1')" />
						</div>
					</template>
					<SupplierAdminReference-1View
						:disabled="disabled"
						:edit-data="editData"
						:active-tab="activeTab"
						@active-tab-name="activeTabName"
						@disabled="disabledData"
					/>
				</el-tab-pane>

				<el-tab-pane name="supporting-documents">
					<template #label>
						<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
							<BaseLabel :label="$t('formLabels.documents')" :tooltip-content="$t('info.documents')" />
						</div>
					</template>
					<SupplierAdminDocumentsView
						:disabled="disabled"
						:edit-data="editData"
						:active-tab="activeTab"
						@active-tab-name="activeTabName"
						@disabled="disabledData"
					/>
				</el-tab-pane>
			</el-tabs>
			<novok-button
				v-if="buttonName !== '' && hasPermissionTo('suppliers-admin-edit') && authStore.getRoleId != 'supplier_admin'"
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
		// &.is-scrollable {
		// 	@apply pr-28;
		// }
		.el-tabs__nav-scroll {
			@apply flex justify-between items-center;
			.el-tabs__nav-next {
				@apply right-20;
			}
		}
	}
</style>
