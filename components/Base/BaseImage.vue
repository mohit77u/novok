<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/require-valid-default-prop -->
<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
	import type { UploadFile, UploadProps, UploadUserFile, UploadInstance, UploadRawFile } from "element-plus";
	import { genFileId } from "element-plus";

	const fileList = ref<UploadUserFile[]>([]);
	const upload = ref<UploadInstance>();
	const showError = ref(false);
	const errorMessage = ref("");
	const emit = defineEmits(["upload-file", "handle-remove"]);
	const { t } = useI18n();

	const props = defineProps({
		limit: {
			type: Number,
			default: 1,
		},
		formData: {
			type: Object,
			default: {},
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		id: {
			type: String,
			default: "",
		},
		maxLimit: {
			type: Number,
			default: 10,
		},
		isShowDescription: {
			type: Boolean,
			default: true,
		},
		isRequired: {
			type: Boolean,
			default: false,
		},
	});

	watch(
		() => props.formData,
		(currData) => {
			fileList.value = [];
			if (currData.id) {
				fileList.value.push({
					name: `${currData.file_name}_id${currData.id}`,
					url: `${currData.document_path} `,
				});
			} else if (currData) {
				fileList.value.push({
					name: `${currData.file_name}`,
					url: `${currData.document_path} `,
				});
			} else {
				fileList.value = [];
			}
		},
		{ deep: true, immediate: true }
	);

	const resetValidation = () => {
		showError.value = false;
		errorMessage.value = "";
	};

	const handleRemove = (file: UploadFile) => {
		// showError.value = false;
		fileList.value = fileList.value.filter((field) => field.uid !== file.uid);

		const name = Number(file.name.split("_id")[1]) || "" ? Number(file.name.split("_id")[1]) : "";

		emit("handle-remove", {
			name,
			file,
			id: props.id,
		});
	};

	const onChange: UploadProps["onChange"] = (uploadFile: any, uploadFiles) => {
		showError.value = false;
		const fileSizeInMB = +(uploadFile.size / (1024 * 1024)).toFixed(0);

		if (fileSizeInMB < props.maxLimit) {
			if (
				uploadFile.raw.type === "image/jpeg" ||
				uploadFile.raw.type === "image/png" ||
				uploadFile.raw.type === "image/jpg" ||
				uploadFile.raw.type === "application/pdf" ||
				uploadFile.raw.type === "text/csv" ||
				uploadFile.raw.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
				uploadFile.raw.type === "application/msword" ||
				uploadFile.raw.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			) {
				emit("upload-file", { file: uploadFile.raw, id: props.id });
			} else {
				emit("upload-file", { file: "", id: props.id });
				// Remove the invalid file from uploadFiles array
				uploadFiles.splice(uploadFiles.indexOf(uploadFile), 1);
				errorMessage.value = t("formValidations.invalid_file_type");
				showError.value = true;
			}
		} else {
			emit("upload-file", { file: "", id: props.id });
			// Remove the invalid file from uploadFiles array
			uploadFiles.splice(uploadFiles.indexOf(uploadFile), 1);
			errorMessage.value = props.maxLimit == 10 ? t("formValidations.file_size_10") : t("formValidations.file_size");
			showError.value = true;
		}
	};

	const handleExceed: UploadProps["onExceed"] = (files) => {
		showError.value = false;
		if (props.limit < 5) {
			upload.value!.clearFiles();
			const file = files[0] as UploadRawFile;
			file.uid = genFileId();
			upload.value!.handleStart(file);
		} else {
			errorMessage.value = t("formValidations.max_5_files");
			showError.value = true;
		}
	};

	defineExpose({ resetValidation });
</script>
<template>
	<el-upload
		:id="props.id"
		ref="upload"
		v-model:file-list="fileList"
		class="fileinput single"
		:class="{ error: isRequired }"
		:limit="limit"
		action="#"
		:disabled="disabled"
		multiple
		:on-change="onChange"
		accept="image/jpeg, image/png, image/jpg, application/pdf, text/csv, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/msword"
		:on-exceed="handleExceed"
		:on-remove="handleRemove"
		:auto-upload="false"
	>
		<template #trigger>
			<novok-button type="info">{{ $t("formLabels.select_file") }}</novok-button>
		</template>
		<template #tip>
			<div class="el-upload__tip text-dark/50">
				<p v-if="isShowDescription">{{ $t("formLabels.single_img_description") }}</p>
			</div>
		</template>
	</el-upload>
	<div v-if="showError">
		<p class="text-xs text-red-500">{{ errorMessage }}</p>
	</div>
</template>
