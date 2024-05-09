<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/require-valid-default-prop -->
<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
	import type { UploadFile, UploadProps, UploadUserFile, UploadInstance, UploadRawFile } from "element-plus";
	import { genFileId } from "element-plus";

	const config = useRuntimeConfig();
	const fileList = ref<UploadUserFile[]>([]);
	// const imageUrl = ref<any>("");
	const upload = ref<UploadInstance>();
	const emit = defineEmits(["upload-file", "handle-remove"]);
	const showError = ref(false);
	const onChangeCount = ref<number>(0);
	const errorMessage = ref<string[]>([]);
	const checkErrorMessageTimeOut = ref();
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
	});

	watch(
		() => props.formData,
		(currData) => {
			fileList.value = [];

			if (Object.keys(currData).length) {
				currData?.forEach((field: any) => {
					if (field.mime_type === "application/pdf" || field.mime_type === "pdf") {
						fileList.value.push({
							name: `${field.file_name}_id${field.id}`,
							url: config.public.pdf_img_link,
						});
					} else if (field.mime_type === "csv") {
						fileList.value.push({
							name: `${field.file_name}_id${field.id}`,
							url: config.public.csv_img_link,
						});
					} else if (field.mime_type === "docx" || field.mime_type === "doc") {
						fileList.value.push({
							name: `${field.file_name}_id${field.id}`,
							url: config.public.doc_img_link,
						});
					} else if (field.mime_type === "xlsx") {
						fileList.value.push({
							name: `${field.file_name}_id${field.id}`,
							url: config.public.xlsx_img_link,
						});
					} else {
						fileList.value.push({
							name: `${field.file_name}_id${field.id}`,
							url: `${field.document_path} `,
						});
					}
				});
			} else {
				fileList.value = [];
			}
		},
		{ deep: true, immediate: true }
	);

	const handleRemove = (file: UploadFile) => {
		showError.value = false;

		fileList.value = fileList.value.filter((field) => field.uid !== file.uid);

		const name = Number(file.name.split("_id")[1]) || "" ? Number(file.name.split("_id")[1]) : "";

		if (name !== undefined) {
			emit("handle-remove", {
				name,
				file,
				id: props.id,
			});
		}

		// imageUrl.value = "";
	};

	const resetValidation = () => {
		showError.value = false;
		errorMessage.value = [];
	};

	const checkErrorMessage = () => {
		checkErrorMessageTimeOut.value = setTimeout(() => {
			if (errorMessage.value.length > 0) {
				showError.value = true;
			} else {
				showError.value = false;
			}

			onChangeCount.value = 0;
		}, 200);
	};

	const onChange: UploadProps["onChange"] = (uploadFile: any, uploadFiles) => {
		if (onChangeCount.value === 0) {
			showError.value = false;
			errorMessage.value = [];
		}

		onChangeCount.value = onChangeCount.value + 1;
		clearTimeout(checkErrorMessageTimeOut.value);
		checkErrorMessage();

		const fileSizeInMB = +(uploadFile.size / (1024 * 1024)).toFixed(0);
		if (fileSizeInMB < 10) {
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
				errorMessage.value.push(uploadFile.name + t("formValidations.invalid_file_type"));
			}
		} else {
			emit("upload-file", { file: "", id: props.id });
			// Remove the invalid file from uploadFiles array
			uploadFiles.splice(uploadFiles.indexOf(uploadFile), 1);
			errorMessage.value.push(uploadFile.name + t("formValidations.file_size"));
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
			errorMessage.value.push(t("formValidations.max_5_files"));
			showError.value = true;
		}
	};

	const checkFileType = (file: any) => {
		if (file.raw) {
			return file.raw.type === "application/pdf"
				? config.public.pdf_img_link
				: file.raw.type === "text/csv"
				? config.public.csv_img_link
				: file.raw.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
				? config.public.xlsx_img_link
				: file.raw.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
				? config.public.doc_img_link
				: file.raw.type === "application/msword"
				? config.public.doc_img_link
				: file.url;
		} else {
			return file.url;
		}
	};

	defineExpose({ resetValidation });
</script>
<template>
	<el-upload
		:id="props.id"
		ref="upload"
		v-model:file-list="fileList"
		type="file"
		class="fileinput multiple"
		drag
		:limit="limit"
		action="#"
		:disabled="disabled"
		multiple
		:on-change="onChange"
		list-type="picture"
		accept="image/jpeg, image/png, image/jpg, application/pdf, text/csv, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/msword"
		:on-exceed="handleExceed"
		:on-remove="handleRemove"
		:auto-upload="false"
	>
		<!-- <template #trigger>
      <novok-button type="primary">select files</novok-button>
    </template> -->

		<el-icon class="el-icon--upload">
			<i class="fa-solid fa-cloud-arrow-up"></i>
		</el-icon>

		<div class="el-upload__text">
			{{ $t("formLabels.drop_file_here") }} <em>{{ $t("formLabels.click_to_upload") }}</em>
		</div>

		<template #tip>
			<div class="el-upload__tip text-dark/50">
				{{ $t("formLabels.multi_img_des") }}

				<div v-if="showError">
					<p class="text-danger text-base" v-for="(message, index) in errorMessage" :key="index + '_error'">
						{{ index + 1 }}. {{ message }}
					</p>
				</div>
			</div>
		</template>

		<template #file="{ file }">
			<NuxtImg class="el-upload-list__item-thumbnail" :src="checkFileType(file)" />
			<div class="w-full flex justify-between">
				<p class="ml-3">{{ file.name }}</p>
				<span class="cursor-pointer" v-if="!disabled">
					<i class="fa fa-remove" @click="handleRemove(file)"></i>
				</span>
			</div>
		</template>
	</el-upload>
</template>
