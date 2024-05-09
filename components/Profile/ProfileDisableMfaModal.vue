<script setup lang="ts">
	const props = defineProps({
		dialogVisible: Boolean,

		deleteApi: {
			type: Function,
			default: null,
		},
	});
	const emit = defineEmits(["dialogOkClick"]);
	const centerDialogVisible = ref(false);
	watch(
		() => props.dialogVisible,
		(currData) => {
			centerDialogVisible.value = currData;
		},
		{ deep: true, immediate: true }
	);

	const okClick = () => {
		props.deleteApi();
	};

	const cancel = () => {
		centerDialogVisible.value = false;
		emit("dialogOkClick", false);
	};
</script>

<template>
	<el-dialog v-model="centerDialogVisible" class="max-w-[540px] w-[90%] rounded-2xl noHeader" center @close="cancel">
		<div class="flex justify-center w-full">
			<NuxtImg src="/images/Frame.svg" alt="frame" />
		</div>

		<h1 class="text-3xl font-bold mb-5 mt-4 text-dark/100 text-center">
			{{ $t("formLabels.disable_mfa") }}
		</h1>
		<p class="text-center">
			{{ $t("formLabels.disable_mfa_msg") }}
		</p>
		<template #footer>
			<span class="dialog-footer">
				<novok-button class="btn-dark" @click="cancel"> {{ $t("buttons.cancel") }} </novok-button>
				<novok-button type="info" @click="okClick">
					{{ $t("buttons.disable") }}
				</novok-button>
			</span>
		</template>
	</el-dialog>
</template>
