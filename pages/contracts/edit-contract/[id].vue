<script lang="ts" setup>
	import { ref } from "vue";
	import type { TabsPaneContext } from "element-plus";
	import { contractStore } from "~/store/contract";

	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});

	useHead({
		title: "Edit Contract",
	});

	const activeTab = ref<any>("primary-details");
	const store = contractStore();
	const route = useRoute();
	const editData = ref<any>({});
	const fullscreenLoading = ref(false);
	const localePath = useLocalePath();
	const isClone = ref(0);
	const isTitle = ref("");

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
			const res: any = await useApiFetch(`/contracts/${route?.params?.id}/edit?tab_name=${store.getActiveTab}`, {
				method: "GET",
			});

			editData.value = { ...res?.data, tab: tabName };
			isClone.value = res.data?.is_cloned;
			isTitle.value = res.data?.title;
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};
</script>

<template>
	<div v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="p-4 min-h-full relative">
		<el-tabs v-model="activeTab" class="demo-tabs" @tab-click="handleClick">
			<el-tab-pane name="primary-details">
				<template #label>
					<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
						<BaseLabel :label="$t('formLabels.primary_details')" :tooltip-content="$t('info.primary_details')" />
					</div>
				</template>
				<ContractPrimaryDetails :edit-data="editData" @active-tab-name="activeTabName" />
			</el-tab-pane>

			<el-tab-pane name="upload-contract" :disabled="isClone === 1 && !isTitle">
				<template #label>
					<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
						<BaseLabel :label="$t('formLabels.upload_contract')" :tooltip-content="$t('info.upload_contract')" />
					</div>
				</template>
				<ContractUploadContract :edit-data="editData" @active-tab-name="activeTabName" />
			</el-tab-pane>

			<el-tab-pane name="signatory-details" :disabled="isClone === 1 && !isTitle">
				<template #label>
					<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
						<BaseLabel :label="$t('formLabels.signatory_details')" :tooltip-content="$t('info.signatory_details')" :isShowLabel="false" />
					</div>
				</template>
				<ContractSignatoryDetails :edit-data="editData" @active-tab-name="activeTabName" />
			</el-tab-pane>

			<el-tab-pane name="additional-information" :disabled="isClone === 1 && !isTitle">
				<template #label>
					<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
						<BaseLabel :label="$t('formLabels.supporting_information')" :tooltip-content="$t('info.supporting_information')" />
					</div>
				</template>
				<ContractAdditionalInformation :edit-data="editData" @active-tab-name="activeTabName" />
			</el-tab-pane>

			<el-tab-pane name="supporting-documents" :disabled="isClone === 1 && !isTitle">
				<template #label>
					<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
						<BaseLabel :label="$t('formLabels.supporting_documents')" :tooltip-content="$t('info.supporting_documents')" />
					</div>
				</template>
				<ContractSupportingDocuments :edit-data="editData" @active-tab-name="activeTabName" />
			</el-tab-pane>
		</el-tabs>
	</div>
</template>
<style>
	/* @import "~/assets/css/main.css"; */
</style>
