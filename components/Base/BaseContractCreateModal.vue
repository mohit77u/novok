<script setup lang="ts">
	const props = defineProps({
		dialogVisible: Boolean,
		contractNumber: {
			type: String,
			default: "",
		},
	});
	const emit = defineEmits(["dialogOkClick"]);
	const localePath = useLocalePath();
	const centerDialogVisible = ref(false);

	watch(
		() => props.dialogVisible,
		(currData) => {
			centerDialogVisible.value = currData;
		},
		{ deep: true, immediate: true }
	);

	const okClick = () => {
		navigateTo(localePath("/contracts/add-contract"));
	};

	const cancel = () => {
		centerDialogVisible.value = false;
		emit("dialogOkClick", false);
		navigateTo(localePath("/contracts"));
	};
</script>

<template>
	<el-dialog v-model="centerDialogVisible" class="max-w-[540px] w-[90%] text-center rounded-2xl noHeader" center @close="cancel">
		
		<p>
			Your contract has been successfully created.The contract number is
			<span class="font-bold"> {{ contractNumber }}</span> for future reference.
		</p>
		<template #footer>
			<novok-button class="btn-dark" @click="cancel">
				{{ $t("buttons.return_contract") }}
			</novok-button>
			<novok-button type="info" @click="okClick">
				{{ $t("buttons.create_another_contract") }}
			</novok-button>
		</template>
	</el-dialog>
</template>
