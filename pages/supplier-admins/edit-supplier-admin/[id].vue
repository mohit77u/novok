<script lang="ts" setup>
	import type { TabsPaneContext } from "element-plus";
	import { supplierStore } from "~/store/supplier";

	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});

	useHead({
		title: "Edit Supplier Admin",
	});

	const activeTab = ref<any>("primary-details");
	const store = supplierStore();
	const fullscreenLoading = ref(false);
	const editData = ref<any>({});
	const route = useRoute();
	const localePath = useLocalePath();
	const isFilledprimaryDetails = ref("");

	onMounted(async () => {
		activeTab.value = route.query?.tab ? route.query?.tab : activeTab.value;
		store.setActiveTab(activeTab.value);
		await getEditData(activeTab.value);
	});

	const handleClick = (tab: TabsPaneContext) => {
		store.setActiveTab(tab.paneName);
		editData.value = {};
		getEditData(tab.paneName);
		navigateTo(
			localePath({
				path: route.fullPath,
				query: { tab: tab.paneName },
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
				method: "GET",
			});

			editData.value = { ...res?.data, tab: tabName };
			isFilledprimaryDetails.value = res.data?.is_filled_primary_details;
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};
</script>

<template>
	<div v-loading="fullscreenLoading" :class="{'overflow-hidden': fullscreenLoading}" class="p-4 min-h-full relative">
		<div class="h-full pb-6">
			<el-tabs v-model="activeTab" class="demo-tabs" @tab-click="handleClick">
				<el-tab-pane name="primary-details">
					<template #label>
						<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
                            <BaseLabel
                                :label="$t('formLabels.primary_details')"
                                :tooltip-content="$t('info.primary_details')"
                            />
                        </div>
					</template>
					<SupplierAdminNew :edit-data="editData" @active-tab-name="activeTabName" @editcall="getEditData"/>
				</el-tab-pane>
				
				<el-tab-pane name="compliance-due-diligence" :disabled="!isFilledprimaryDetails">
					<template #label>
						<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
                            <BaseLabel
                                :label="$t('formLabels.compliance')"
                                :tooltip-content="$t('info.compliance')"
                            />
                        </div>
					</template>
					<SupplierAdminCompliance :edit-data="editData" @active-tab-name="activeTabName" />
				</el-tab-pane>

				<el-tab-pane name="reference" :disabled="!isFilledprimaryDetails">
					<template #label>
						<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
                            <BaseLabel
                                :label="$t('formLabels.reference-1')"
                                :tooltip-content="$t('info.reference-1')"
                            />
                        </div>
					</template>
					<SupplierAdminReference-1 :edit-data="editData" @active-tab-name="activeTabName" />
				</el-tab-pane>
                
				<el-tab-pane name="supporting-documents" :disabled="!isFilledprimaryDetails">
					<template #label>
						<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
                            <BaseLabel
                                :label="$t('formLabels.documents')"
                                :tooltip-content="$t('info.documents')"
                            />
                        </div>
					</template>
					<SupplierAdminDocuments :edit-data="editData" @active-tab-name="activeTabName" />
				</el-tab-pane>
			</el-tabs>
		</div>
	</div>
</template>
<style>
	/* @import "~/assets/css/main.css"; */
</style>
