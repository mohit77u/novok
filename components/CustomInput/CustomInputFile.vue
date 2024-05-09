<template>
	<el-upload
		:id="props.id"
		ref="upload"
		v-model:file-list="fileList"
		:limit="limit"
		class="fileinput single w-full"
		action="#"
		:disabled="disabled"
		:on-change="onChange"
		:accept="acceptExtension"
		:on-remove="handleRemove"
		:auto-upload="false"
		:on-exceed="handleExceed"
		:class="className"
	>
		<template #trigger>
			<novok-button type="info">{{ $t("formLabels.select_file") }}</novok-button>
		</template>
		<template #tip>
			<div class="el-upload__tip text-dark/50">
				{{ `${extensionsType} (Only one file can be uploaded and file size should be upto ${fileSize} MB)` }}
			</div>
		</template>
	</el-upload>
	<div class="w-full" v-if="showError">
		<p class="text-xs text-red-500 mt-2">{{ errorMessage }}</p>
	</div>
</template>

<script setup lang="ts">
	import type { UploadFile, UploadProps, UploadUserFile, UploadInstance, UploadRawFile } from "element-plus";
	import { genFileId } from "element-plus";

	const fileList = ref<UploadUserFile[]>([]);
	const upload = ref<UploadInstance>();
	const showError = ref(false);
	const errorMessage = ref("");
	const emit = defineEmits(["upload-file", "handle-remove", "show-error"]);
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
		fileSize: {
			type: Number,
			default: 5,
		},
		extensionsType: {
			type: Array,
			default: [],
		},
		className: {
			type: String,
			default: "",
		},
	});

	interface ExtensionsToMime {
		[key: string]: string;
	}

	const extensionsToMime: ExtensionsToMime = {
		doc: "application/msword",
		docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		pdf: "application/pdf",
		txt: "text/plain",
		rtf: "application/rtf",
		odt: "application/vnd.oasis.opendocument.text",
		xls: "application/vnd.ms-excel",
		xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		csv: "text/csv",
		ppt: "application/vnd.ms-powerpoint",
		pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		png: "image/png",
	};

	const acceptExtension = computed(() => {
		const data: string[] = [];
		(props.extensionsType as string[]).forEach((element: string) => {
			data.push(extensionsToMime[element]);
		});

		return data;
	});

	const resetValidation = () => {
		showError.value = false;
		errorMessage.value = "";
	};

	watch(
		() => props.formData,
		(currData) => {
			resetValidation();

			fileList.value = [];
			if (currData && typeof currData === "string") {
				const url: string = currData;
				const parts = url?.split("/");
				const filenameWithTimestamp = parts[parts.length - 1];
				const filenameParts = filenameWithTimestamp.split("_");
				const filename = filenameParts.slice(1).join("_");

				fileList.value.push({
					name: `${filename}`,
					url: `${currData} `,
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

	watch(
		() => showError.value,
		(value) => {
			emit("show-error", value);
		},
		{ deep: true, immediate: true }
	);

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

		if (fileSizeInMB <= props.fileSize) {
			if (acceptExtension.value.includes(uploadFile.raw.type)) {
				emit("upload-file", { file: uploadFile.raw, id: props.id });
			} else {
				emit("upload-file", { file: "", id: props.id });
				// Remove the invalid file from uploadFiles array
				uploadFiles.splice(uploadFiles.indexOf(uploadFile), 1);
				errorMessage.value = `Invalid file type. Please upload files of type ${props.extensionsType.toString()}.`;
				showError.value = true;
			}
		} else {
			emit("upload-file", { file: "", id: props.id });
			// Remove the invalid file from uploadFiles array
			uploadFiles.splice(uploadFiles.indexOf(uploadFile), 1);
			errorMessage.value = `file size should be upto ${props.fileSize} MB`;
			showError.value = true;
		}
	};

	const handleExceed: UploadProps["onExceed"] = (files) => {
		showError.value = false;
		if (props.limit < 2) {
			upload.value!.clearFiles();
			const file = files[0] as UploadRawFile;
			file.uid = genFileId();
			upload.value!.handleStart(file);
		} else {
			errorMessage.value = `Maximum ${props.limit} files can be uploaded.`;
			showError.value = true;
		}
	};

	defineExpose({ resetValidation });
</script>

