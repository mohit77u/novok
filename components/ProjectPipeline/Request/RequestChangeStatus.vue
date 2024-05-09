<script setup lang="ts">
	const fullscreenLoading = ref(false);
	const route = useRoute();
	const localePath = useLocalePath();
	const { t } = useI18n();
	const customFields = reactive([]);
	const customFieldRef = ref<any>(null);

	const searchValue = ref("");
	const dialogVisibleRejectModal = ref(false);
	const loading = ref(false);
	const loadingSave = ref(false);
	const dialogVisibleApproveModal = ref(false);

	const formData = reactive<any>({});

	onMounted(async () => {
		// await getEditTableData();
	});

	const dialogOkClickRejectModal = (value: any) => {
		dialogVisibleRejectModal.value = value;
	};

	const changeStatus = async (data: any, value: any) => {
		if (value == 3) {
			loadingSave.value = true;
		} else {
			loading.value = true;
		}
		const statusData = { ...data, status: value };
		try {
			const res: any = await useApiFetch(`/requests/${route.params?.id}/change-status`, {
				method: "POST",
				body: statusData,
			});

			useToast("success", res.message);
			navigateTo(localePath("/project-pipeline/requests"));
		} catch {
		} finally {
			loading.value = false;
			loadingSave.value = false;
		}
	};

	const rejectStatusData = (data: any) => {
		changeStatus(data, 3);
	};

	const dialogOkClickApproveModal = (value: any) => {
		dialogVisibleApproveModal.value = value;
	};

	const approveStatusData = (data: any) => {
		changeStatus(data, 2);
	};

	const approveClick = () => {
		dialogVisibleApproveModal.value = true;
	};

	const rejectClick = () => {
		dialogVisibleRejectModal.value = true;
	};
</script>
<template>
	<div class="p-4">
		<ProjectPipelineRequestViewForm :cancelBtn="false" />

		<div class="text-right">
			<novok-button class="btn-dark my-1" @click="CancelRedirect('/project-pipeline/requests')">
				<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
				<i class="fa-solid fa-xmark sm:hidden"></i>
			</novok-button>

			<novok-button class="my-1" type="success" :loading="loading" :disabled="loading" @click="approveClick"
				>{{ $t("buttons.approve") }}
			</novok-button>

			<novok-button class="my-1" type="danger" :loading="loadingSave" :disabled="loadingSave" @click="rejectClick"
				>{{ $t("buttons.reject") }}
			</novok-button>
		</div>
	</div>
	<project-pipeline-request-reject-modal
		v-if="dialogVisibleRejectModal === true"
		:dialog-visible="dialogVisibleRejectModal"
		:id="route.params?.id"
		@dialog-ok-click="dialogOkClickRejectModal"
		@status-data="rejectStatusData"
	/>
	<project-pipeline-request-approve-modal
		v-if="dialogVisibleApproveModal === true"
		:dialog-visible="dialogVisibleApproveModal"
		:id="route.params?.id"
		@dialog-ok-click="dialogOkClickApproveModal"
		@status-data="approveStatusData"
	/>
</template>
