<template>
	<div class="pt-4 flex-1">
		<div class="bg-[#fff]">
			<el-tabs id="custom_field_list" v-model="activeTab" class="demo-tabs" @tab-click="handleClick">
				<el-tab-pane name="supplier-admin">
					<template #label>
						<span class="mx-6">{{ $t("formLabels.suppliers") }}</span>
					</template>
					<custom-fields-list v-if="activeTab === 'supplier-admin'" :tab-name="activeTab" />
				</el-tab-pane>

				<el-tab-pane name="contract">
					<template #label>
						<span class="mx-6">{{ $t("formLabels.contracts") }}</span>
					</template>
					<custom-fields-list v-if="activeTab === 'contract'" :tab-name="activeTab" />

					<!-- <custom-fields-list tab-name="contract" /> -->
				</el-tab-pane>
				
                <el-tab-pane name="request">
					<template #label>
						<span class="mx-6">{{ $t("formLabels.requests") }}</span>
					</template>
					<custom-fields-list v-if="activeTab === 'request'" :tab-name="activeTab" />

					<!-- <custom-fields-list tab-name="contract" /> -->
				</el-tab-pane>

				<el-tab-pane name="q-and-t-client">
					<template #label>
						<span class="mx-6">{{ $t("formLabels.q_and_t_client") }}</span>
					</template>
					<custom-fields-list v-if="activeTab === 'q-and-t-client'" :tab-name="activeTab" />

					<!-- <custom-fields-list tab-name="contract" /> -->
				</el-tab-pane>

				<el-tab-pane name="q-and-t-supplier">
					<template #label>
						<span class="mx-6">{{ $t("formLabels.q_and_t_supplier") }}</span>
					</template>
					<custom-fields-list v-if="activeTab === 'q-and-t-supplier'" :tab-name="activeTab" />

					<!-- <custom-fields-list tab-name="contract" /> -->
				</el-tab-pane>
			</el-tabs>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { ref } from "vue";

	import type { TabsPaneContext } from "element-plus";
	import { useCustomFieldsStore } from "~/store/customFields";

	definePageMeta({
		// layout: "auth",
		middleware: ["auth"],
	});

	useHead({
		title: "Custom Fields",
	});

	const activeTab = ref<string>("");
	const customFieldsStore = useCustomFieldsStore();
	const route = useRoute();

	onMounted(() => {
		activeTab.value = route?.query?.moduleName ?? "supplier-admin";
		customFieldsStore.setActiveTab(activeTab.value);
	});

	const handleClick = (tab: TabsPaneContext) => {
		customFieldsStore.setActiveTab(tab.paneName);
		activeTab.value = tab.paneName as string;
	};
</script>

<style lang="scss">
	#custom_field_list .el-tabs__content {
		@apply border-l-0 border-r-0 border-b-0;
	}
</style>
