<template>
	<el-upload
		:id="props.id"
		ref="upload"
		v-model:file-list="fileList"
		class="w-full"
		:limit="limit"
		action="#"
		:disabled="disabled"
		drag
		:on-change="onChange"
		accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		:on-exceed="handleExceed"
		:on-remove="handleRemove"
		:auto-upload="false"
	>
		<el-icon class="el-icon--upload">
			<i class="fa-solid fa-cloud-arrow-up"></i>
		</el-icon>

		<div class="el-upload__text">
			{{ $t("formLabels.drop_file_here") }} <em>{{ $t("formLabels.click_to_upload") }}</em>
		</div>

		<template #tip>
			<div class="el-upload__tip text-dark/50">{{ $t("formLabels.only_xlsx_file_upload_note") }}</div>
		</template>
	</el-upload>
	<div v-if="showError">
		<p class="text-danger">{{ errorMessage }}</p>
	</div>
</template>

<script setup lang="ts">
	import type { UploadFile, UploadProps, UploadUserFile, UploadInstance, UploadRawFile } from "element-plus";
	import { genFileId } from "element-plus";

	const fileList = ref<UploadUserFile[]>([]);
	const upload = ref<UploadInstance>();
	const showError = ref(false);
	const errorMessage = ref("");
	const emit = defineEmits(["upload-file", "handle-remove"]);

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
	});

	watch(
		() => props.formData,
		(currData) => {
			fileList.value = [];
			if (currData) {
				fileList.value.push({
					name: `${currData.file_name}_id${currData.id}`,
					url: `${currData.document_path} `,
				});
			} else {
				fileList.value = [];
			}
		},
		{ deep: true }
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
		if (fileSizeInMB < 10) {
			if (uploadFile.raw.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
				emit("upload-file", { file: uploadFile.raw, id: props.id });
			} else {
				emit("upload-file", { file: "", id: props.id });
				// Remove the invalid file from uploadFiles array
				uploadFiles.splice(uploadFiles.indexOf(uploadFile), 1);
				errorMessage.value = "Invalid file type. Please upload files of type xlsx.";
				showError.value = true;
			}
		} else {
			emit("upload-file", { file: "", id: props.id });
			// Remove the invalid file from uploadFiles array
			uploadFiles.splice(uploadFiles.indexOf(uploadFile), 1);
			errorMessage.value = "file size should be upto 10 MB";
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
			errorMessage.value = "Maximum 5 files can be uploaded.";
			showError.value = true;
		}
	};

	defineExpose({ resetValidation });
</script>

