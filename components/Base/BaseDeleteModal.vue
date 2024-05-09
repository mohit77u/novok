<script setup lang="ts">
	const props = defineProps({
		dialogVisible: Boolean,
		messageContent: {
			type: String,
			default: "",
		},
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
			{{ $t("deleteModal.delete_record") }}
		</h1>
		<p v-if="messageContent.length" class="text-center">{{ messageContent }}</p>
		<p v-else class="text-center">{{ $t("deleteModal.message") }}</p>
		<template #footer>
			<span class="dialog-footer">
				<novok-button class="btn-dark" @click="cancel"> {{ $t("buttons.cancel") }} </novok-button>
				<novok-button type="info" @click="okClick">
					{{ $t("buttons.delete") }}
				</novok-button>
			</span>
		</template>
	</el-dialog>
</template>
