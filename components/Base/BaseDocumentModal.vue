<script setup lang="ts">
	const props = defineProps({
		dialogVisible: Boolean,
		messageContent: {
			type: String,
			default: "",
		},
		previewData: {
			type: Array,
			default: [],
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
		centerDialogVisible.value = false;
		emit("dialogOkClick", false);
	};

	const documentPreview = (documentt: any) => {
		window.open(`${documentt.document_path}`);
	};

	const toCamelCase = (str: String) => {
		return str
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};
</script>

<template>
	<el-dialog
		v-model="centerDialogVisible"
		class="max-w-[540px] w-[90%] rounded-2xl"
		title="Documents"
		:close-on-click-modal="false"
		@close="okClick"
	>
		<ul v-if="previewData.length">
			<li class="font-bold py-4 pr-6 border-b relative last:border-b-0 first:pt-0 last:pb-0" v-for="document in previewData" :key="document.id">
				{{ toCamelCase(document.document_type) }} :
				{{ document.file_name }}
				<i className="fa-regular fa-eye absolute right-0 mt-1 cursor-pointer text-primary" @click="documentPreview(document)"></i>
			</li>
		</ul>
		<div v-else>
			<p>No Record Found</p>
		</div>
	</el-dialog>
</template>
