<script setup lang="ts">
	const props = defineProps({
		dialogVisible: Boolean,
		id: {
			type: String,
			default: "",
		},
	});
	const emit = defineEmits(["dialogOkClick", "status-data"]);
	const centerDialogVisible = ref(false);
	const localePath = useLocalePath();
	const { t } = useI18n();
	const loading = ref(false);

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
		centerDialogVisible.value = false;
		emit("dialogOkClick", false);
		emit("status-data", "");
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
						<h1 class="text-xl">Are you sure you want to approve this tender?</h1>
					</div>
				</div>
			</div>
		</el-form>
		<template #footer>
			<div class="dialog-footer text-center">
				<novok-button type="success" :loading="loading" @click="okClick">
					{{ $t("buttons.approve") }}
				</novok-button>
			</div>
		</template>
	</el-dialog>
</template>
