<script lang="ts" setup>
	import { ref } from "vue";
	import type { TabsPaneContext } from "element-plus";
    import { useAuthStore } from "~/store/auth";
	import { contractStore } from "~/store/contract";

    definePageMeta({
        middleware: ["auth", "is-client-admin"],
    });
    
	useHead({
        title: "View Contract",
	});
    
    const { t } = useI18n();
	const activeTab = ref<any>("primary-details");
	const store = contractStore();
	const route = useRoute();
    const authStore = useAuthStore();
	const editData = ref<any>({});
	const fullscreenLoading = ref(false);
	const localePath = useLocalePath();
	const disabled = ref(true);
	const buttonName = ref<any>(t("buttons.edit"));
	const tabs = ref<any>("");
	const btn = ref<any>("");
	const disabledStatus = ref([4, 5, 6]);

	onMounted(async () => {
		activeTab.value = route.query?.tab ? route.query?.tab : activeTab.value;
		store.setActiveTab(activeTab.value);
		await getEditData(activeTab.value);
		const scrollBar = tabs.value.$el.querySelector(".el-tabs__nav-scroll");
		scrollBar.appendChild(btn.value.$el);
		scrollBar.classList.add("mr-20");
	});

	const handleClick = (tab: TabsPaneContext) => {
		buttonName.value = disabled.value ? t("buttons.edit") : "";
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
			const res: any = await useApiFetch(`/contracts/${route?.params?.id}?tab_name=${store.getActiveTab}`, {
				method: "GET",
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
                path: `/contracts/edit-contract/${route.params.id}`,
                query: { tab: activeTab.value, page: 'view' },
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

    const getRolId = computed(() => {
		return authStore.getRoleId;
	});
</script>

<template>
	<div v-loading="fullscreenLoading" :class="{'overflow-hidden': fullscreenLoading}" class="p-4 min-h-full relative">
		<el-tabs ref="tabs" v-model="activeTab" class="demo-tabs" @tab-click="handleClick">
			<el-tab-pane name="primary-details">
				<template #label>
					<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
						<BaseLabel :label="$t('formLabels.primary_details')" :tooltip-content="$t('info.primary_details')" />
					</div>
				</template>
				<ContractPrimaryDetailsView :disabled="disabled" :edit-data="editData" @active-tab-name="activeTabName" @disabled="disabledData" />
			</el-tab-pane>

			<el-tab-pane name="upload-contract">
				<template #label>
					<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
						<BaseLabel :label="$t('formLabels.upload_contract')" :tooltip-content="$t('info.upload_contract')" />
					</div>
				</template>
				<ContractUploadContractView :disabled="disabled" :edit-data="editData" @active-tab-name="activeTabName" @disabled="disabledData" />
			</el-tab-pane>

			<el-tab-pane name="signatory-details">
				<template #label>
					<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
						<BaseLabel :label="$t('formLabels.signatory_details')" :tooltip-content="$t('info.signatory_details')" />
					</div>
				</template>
				<ContractSignatoryDetailsView :disabled="disabled" :edit-data="editData" @active-tab-name="activeTabName" @disabled="disabledData" />
			</el-tab-pane>

			<el-tab-pane name="additional-information">
				<template #label>
					<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
						<BaseLabel :label="$t('formLabels.supporting_information')" :tooltip-content="$t('info.supporting_information')" />
					</div>
				</template>
				<ContractAdditionalInformationView :disabled="disabled" :edit-data="editData" @active-tab-name="activeTabName" @disabled="disabledData" />
			</el-tab-pane>

			<el-tab-pane name="supporting-documents">
				<template #label>
					<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
						<BaseLabel :label="$t('formLabels.supporting_documents')" :tooltip-content="$t('info.supporting_documents')" />
					</div>
				</template>
				<ContractSupportingDocumentsView :disabled="disabled" :edit-data="editData" @active-tab-name="activeTabName" @disabled="disabledData" />
			</el-tab-pane>
		</el-tabs>
		<novok-button
			v-if="editData?.status && !disabledStatus.includes(editData.status) && buttonName !== '' && hasPermissionTo('contracts-edit') && getRolId != 'supplier_admin' && getRolId != 'supplier_user'"
			ref="btn"
			class="absolute right-6 top-3"
			type="info"
			@click="iconClick"
			>{{ getData }}</novok-button
		>
	</div>
</template>
<style>
	/* @import "~/assets/css/main.css"; */
</style>
