<script setup lang="ts">
	import { use } from "echarts/core";

	const props = defineProps({
		dialogVisible: Boolean,
		id: {
			type: String,
			default: "",
		},
		isNotifyQTUser: {
			type: Number,
			default: 0,
		},
	});
	const emit = defineEmits(["dialogOkClick", "status-data"]);
	const centerDialogVisible = ref(false);
	const localePath = useLocalePath();
	const { t } = useI18n();
	const loading = ref(false);
	const notifyClientAdmin = ref<any>(false);
	const router = useRouter();
	const route = useRoute();

	watch(
		() => props.dialogVisible,
		(currData) => {
			centerDialogVisible.value = currData;
		},
		{ deep: true, immediate: true }
	);

	const okClick = () => {
		submit();
	};

	const dialogClose = () => {
		centerDialogVisible.value = false;
		emit("dialogOkClick", false);
	};

	const submit = async () => {
		notifyClientAdminApiCall();
		centerDialogVisible.value = false;
		emit("dialogOkClick", false);
	};

	const notifyClientAdminApiCall = async () => {
		try {
			loading.value = true;
			const res: any = await useApiFetch(`/tenders/dates-change-notification`, {
				method: "POST",
				body: { tender_id: props.id },
			});
			useToast("success", res.message);

			navigateTo(localePath("/quotations-tender/q-t"));
			notifyClientAdmin.value = true;
		} catch {
		} finally {
			loading.value = false;
			// window.location.reload();
		}
	};
</script>

<template>
	<el-dialog
		v-model="centerDialogVisible"
		class="max-w-[730px] w-[90%] rounded-2xl text-left"
		center
		@close="dialogClose"
		:close-on-click-modal="false"
		:title="$t('labels.qt_approve_status')"
	>
		<el-form v-loading="fullscreenLoading" class="flex flex-col">
			<div id="super-admin-form">
				<div class="bg-[#fff]">
					<div>
						<h1 v-if="isNotifyQTUser == 0 && notifyClientAdmin == false" class="text-xl">
							The open date for this tender has passed. Inform Project Owner to update the dates in tender
						</h1>
						<h3 v-else class="text-xl text-center">The open date for this tender has passed, Client Admin has already been notified.</h3>
					</div>
				</div>
			</div>
		</el-form>
		<template #footer>
			<div v-if="isNotifyQTUser == 0 && notifyClientAdmin == false" class="dialog-footer text-center">
				<novok-button type="info" :loading="loading" @click="okClick">
					{{ $t("buttons.notify_project_owner") }}
				</novok-button>
			</div>
		</template>
	</el-dialog>
</template>
