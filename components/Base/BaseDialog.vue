<script setup lang="ts">
	const props = defineProps({
		dialogVisible: Boolean,
		messageContent: {
			type: String,
			default: "",
		},
		dialogApi: {
			type: Function,
			default: null,
		},
		header: {
			type: String,
			default: "",
		},
	});
	const emit = defineEmits(["dialogOkClick"]);
	const centerDialogVisible = ref(false);
    const loading = ref(false)
	watch(
		() => props.dialogVisible,
		(currData) => {
			centerDialogVisible.value = currData;
		},
		{ deep: true, immediate: true }
	);

	const okClick = () => {
        loading.value = true
		props.dialogApi();
	};

	const cancel = () => {
		centerDialogVisible.value = false;
		emit("dialogOkClick", false);
	};
</script>

<template>
	<el-dialog v-model="centerDialogVisible" class="max-w-[540px] w-[90%] rounded-2xl"  :title="header" center @close="cancel">
		

		<p class="text-center font-bold">{{ messageContent }}</p>
		<template #footer>
			<span class="dialog-footer">
				<novok-button @click="cancel" class="btn-dark mr-3"> {{ $t("buttons.cancel") }} </novok-button>
				<novok-button type="info" @click="okClick" :loading="loading">
					{{ $t("buttons.save") }}
				</novok-button>
			</span>
		</template>
	</el-dialog>
</template>
