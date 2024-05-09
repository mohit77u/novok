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
		:title="$t('labels.project_approve_status')"
	>
		<!-- <h1 class="text-3xl font-bold mb-5 mt-4 text-dark/100">Account Disabled</h1> -->
		<el-form v-loading="fullscreenLoading" class="flex flex-col">
			<div id="super-admin-form">
				<div class="bg-[#fff]">
					<div>
						<p class="text-xl">{{ "Are you sure you want to approve this status?" }}</p>
					</div>
				</div>
			</div>
		</el-form>
		<template #footer>
			<div class="dialog-footer text-center">
				<novok-button type="success" @click="okClick">
					{{ $t("buttons.approve") }}
				</novok-button>
			</div>
		</template>
	</el-dialog>
</template>
