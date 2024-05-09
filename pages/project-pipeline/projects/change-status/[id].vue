
<script setup lang="ts">
	import { supplierStore } from "~/store/supplier";

	useHead({
		title: "Change Project Status",
	});

	const activeTab = ref<any>("request");
	const editData = ref<any>({});
	const fullscreenLoading = ref(false);
	const route = useRoute();
	const store = supplierStore();
	const localePath = useLocalePath();

	onMounted(async () => {
		const activetab = useCookie("activeTab");
		if (route.query?.tab == activetab.value) {
			const checkData = setInterval(async () => {
				if (route.query?.tab) {
					await getEditData(route.query?.tab);
					clearInterval(checkData);
				} else {
					await getEditData(route.query?.tab);
					clearInterval(checkData);
				}
			}, 1000);

			activeTab.value = route.query?.tab ? route.query?.tab : "request";
			store.setActiveTab(activeTab.value);
		} else {
			navigateTo(
				localePath({
					path: `/project-pipeline/projects/change-status/${route.params.id}`,
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

	const getEditData = async (tabName: any) => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch(`/projects/${route?.params?.id}?tab_name=${store.getActiveTab}`, {
				method: "GEt",
			});
			editData.value = { ...res?.data, tab: tabName };
			// disabled.value = res.data?.approval_authority_status == 1 ? true : false;
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};
</script>


<template>
	<div v-loading="fullscreenLoading">
		<div v-if="route.query?.tab === 'sourcing'">
			<ProjectPipelineProjectSourcing :edit-data="editData" :is-change-status="true" />
		</div>

		<div v-if="route.query?.tab === 'selection'">
			<ProjectPipelineProjectSelection :edit-data="editData" :is-change-status="true" />
		</div>

		<div v-if="route.query?.tab === 'signing'">
			<ProjectPipelineProjectSigning :edit-data="editData" :is-change-status="true" />
		</div>

		<div v-if="route.query?.tab === 'supervision'">
			<ProjectPipelineProjectSupervision :edit-data="editData" :is-change-status="true" />
		</div>
	</div>
</template>
