<script lang="ts" setup>
	import type { TabsPaneContext } from "element-plus";
	import { supplierStore } from "~/store/supplier";

	const { t } = useI18n();

	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});

	useHead({
		title: "View Project",
	});

	const activeTab = ref<any>("request");
	const store = supplierStore();
	const fullscreenLoading = ref(false);
	const editData = ref<any>({});
	const route = useRoute();
	const localePath = useLocalePath();
	const disabled = ref(true);
	const buttonName = ref<any>(t("buttons.edit"));
	const tabs = ref<any>("");
	const btn = ref<any>("");
	const activity_type = ref<any>("");

	onMounted(async () => {
		const activetab = useCookie("activeTab");
		if (route.query?.tab == activetab.value) {
			const checkData = setInterval(async () => {
				if (route.query?.tab) {
					if (activeTab.value !== "documents") {
						await getEditData(route.query?.tab);
					}
					clearInterval(checkData);
				} else {
					if (activeTab.value !== "documents") {
						await getEditData(route.query?.tab);
					}
					clearInterval(checkData);
				}
			}, 1000);

			activeTab.value = route.query?.tab ? route.query?.tab : activeTab.value;
			store.setActiveTab(activeTab.value);
		} else {
			navigateTo(
				localePath({
					path: `/project-pipeline/projects/view-project/${route.params.id}`,
					query: {
						tab: activetab.value,
					},
				})
			);
			store.setActiveTab(activetab.value);
			activeTab.value = activetab.value;
			await getEditData(activetab.value);
		}
	});

	const handleClick = (tab: TabsPaneContext) => {
		buttonName.value = disabled.value ? t("buttons.edit") : "";
		store.setActiveTab(tab.paneName);
		editData.value = {};
		activeTab.value = tab.paneName;
		if (tab.paneName !== "documents") {
			getEditData(tab.paneName);
		}
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
		if (value !== "documents") {
			getEditData(value);
		}
	};

	const getEditData = async (tabName: any) => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch(`/projects/${route?.params?.id}?tab_name=${store.getActiveTab}`, {
				method: "GEt",
			});
			editData.value = { ...res?.data, tab: tabName };
			const cookieActiveTab = useCookie("activeTab");
			cookieActiveTab.value = res.data?.active_tab;
			activity_type.value = res.data?.activity_type;
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const iconClick = () => {
		disabled.value = !disabled.value;
		buttonName.value = disabled.value ? t("buttons.edit") : "";
		const scrollBar = tabs.value.$el.querySelector(".el-tabs__nav-scroll");
		scrollBar.classList.remove("mr-20");
	};

	const disabledData = (value: any) => {
		disabled.value = value;
		buttonName.value = disabled.value ? t("buttons.edit") : "";
	};

	const getData = computed(() => {
		return buttonName.value;
	});

	const disableTab = (tabName: any) => {
		const cookieActiveTab = useCookie("activeTab");
		if (tabName === "sourcing") {
			return editData.value.active_tab === "request" || cookieActiveTab.value == "request";
		}
		if (tabName === "selection") {
			return (
				editData.value.active_tab == "request" ||
				editData.value.active_tab == "sourcing" ||
				cookieActiveTab.value == "sourcing" ||
				cookieActiveTab.value == "request" ||
				activity_type.value == 1 ||
				activity_type.value == 2 ||
				activity_type.value == 3
			);
		}
		if (tabName === "signing") {
			return (
				editData.value.active_tab == "request" ||
				editData.value.active_tab == "sourcing" ||
				editData.value.active_tab == "selection" ||
				cookieActiveTab.value == "request" ||
				cookieActiveTab.value == "sourcing" ||
				cookieActiveTab.value == "selection"
			);
		}
		if (tabName === "supervision") {
			return (
				editData.value.active_tab == "request" ||
				editData.value.active_tab == "sourcing" ||
				editData.value.active_tab == "selection" ||
				editData.value.active_tab == "signing" ||
				cookieActiveTab.value == "request" ||
				cookieActiveTab.value == "sourcing" ||
				cookieActiveTab.value == "selection" ||
				cookieActiveTab.value == "signing"
			);
		}
	};
</script>

<template>
	<div v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="p-4 min-h-full relative">
		<div class="h-full">
			<el-tabs ref="tabs" v-model="activeTab" class="demo-tabs" @tab-click="handleClick">
				<el-tab-pane name="request">
					<template #label>
						<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
							<BaseLabel :label="$t('formLabels.request')" :tooltip-content="$t('formLabels.request')" />
						</div>
					</template>
					<ProjectPipelineProjectRequestForm
						:disabled="disabled"
						:edit-data="editData"
						@active-tab-name="activeTabName"
						@disabled="disabledData"
					/>
				</el-tab-pane>

				<el-tab-pane name="sourcing" :disabled="disableTab('sourcing')">
					<template #label>
						<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
							<BaseLabel :label="$t('formLabels.sourcing')" :tooltip-content="$t('formLabels.sourcing')" />
						</div>
					</template>
					<ProjectPipelineProjectSourcing
						:disabled="disabled"
						:edit-data="editData"
						@active-tab-name="activeTabName"
						@disabled="disabledData"
					/>
				</el-tab-pane>
				<el-tab-pane
					v-if="activity_type == 4 || activity_type == 5 || activity_type == 6"
					name="selection"
					:disabled="disableTab('selection')"
				>
					<template #label>
						<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
							<BaseLabel :label="$t('formLabels.selection')" :tooltip-content="$t('formLabels.selection')" />
						</div>
					</template>
					<ProjectPipelineProjectSelection
						:disabled="disabled"
						:edit-data="editData"
						@active-tab-name="activeTabName"
						@disabled="disabledData"
					/>
				</el-tab-pane>
				<el-tab-pane name="signing" :disabled="disableTab('signing')">
					<template #label>
						<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
							<BaseLabel :label="$t('formLabels.signing')" :tooltip-content="$t('formLabels.signing')" />
						</div>
					</template>
					<ProjectPipelineProjectSigning
						:disabled="disabled"
						:edit-data="editData"
						@active-tab-name="activeTabName"
						@disabled="disabledData"
					/>
				</el-tab-pane>
				<el-tab-pane name="supervision" :disabled="disableTab('supervision')">
					<template #label>
						<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
							<BaseLabel :label="$t('formLabels.supervision')" :tooltip-content="$t('formLabels.supervision')" />
						</div>
					</template>
					<ProjectPipelineProjectSupervision
						:disabled="disabled"
						:edit-data="editData"
						@active-tab-name="activeTabName"
						@disabled="disabledData"
					/>
				</el-tab-pane>
				<el-tab-pane name="documents">
					<template #label>
						<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
							<BaseLabel :label="$t('formLabels.Documents')" :tooltip-content="$t('formLabels.Documents')" />
						</div>
					</template>
					<ProjectPipelineProjectDocuments
						:disabled="disabled"
						:active-tab="activeTab"
						@active-tab-name="activeTabName"
						@disabled="disabledData"
					/>
				</el-tab-pane>
			</el-tabs>
			<!-- <novok-button
				v-if="buttonName !== '' && hasPermissionTo('suppliers-admin-edit')"
				ref="btn"
				class="absolute right-6 top-3"
				type="info"
				@click="iconClick"
				>{{ getData }}</novok-button
			> -->
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
