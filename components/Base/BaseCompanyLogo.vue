<!-- eslint-disable vue/require-valid-default-prop -->
<script setup lang="ts">
	import type { UploadFile, UploadProps, UploadUserFile, UploadInstance, UploadRawFile } from "element-plus";
	import { genFileId } from "element-plus";
	import { Delete } from "@element-plus/icons-vue";

	const fileList = ref<UploadUserFile[]>([]);
	const imageUrl = ref<string>("");
	const upload = ref<UploadInstance>();
	const config = useRuntimeConfig();
	const disabledDeleteIcon = ref("false");
	const dialogVisible = ref(false);

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
        aspectRatio: {
			type: Number,
			default: 1,
		},
	});

	const copyFormData = ref({});

	onMounted(() => {
		fileList.value = [
			{
				name: "img.jpeg",
				url: config.public.default_user_link,
			},
		];
	});

	watch(
		() => props.formData,
		(currData) => {
			if (currData?.company_logo != copyFormData?.value?.company_logo || currData?.profile_picture != copyFormData?.value?.profile_picture) {
				disabledDeleteIcon.value = currData?.is_default_company_logo;
				fileList.value = [];

				if (imageUrl.value) {
					disabledDeleteIcon.value = "false";

					fileList.value = [
						{
							name: "img.jpeg",
							url: imageUrl,
						},
					];
				} else if (currData?.company_logo) {
					if (currData?.is_default_company_logo === "true") {
						disabledDeleteIcon.value = "true";
					} else {
						disabledDeleteIcon.value = "false";
					}

					fileList.value = [
						{
							name: "img.jpeg",
							url: `${currData?.company_logo} `,
						},
					];
				} else if (currData?.profile_picture) {
					disabledDeleteIcon.value = "true";
					fileList.value = [
						{
							name: "img.jpeg",
							url: `${currData?.profile_picture} `,
						},
					];
				} else {
					disabledDeleteIcon.value = "true";

					fileList.value = [
						{
							name: "img.jpeg",
							url: config.public.default_user_link,
						},
					];
				}
			}

			copyFormData.value = currData;
		},
		{ deep: true }
	);

	const handleRemove = (file: UploadFile) => {
		fileList.value = fileList.value.filter((field) => field.uid !== file.uid);

		if (fileList?.value?.length == 0) {
			fileList.value = [
				{
					name: "img.jpeg",
					url: config.public.default_user_link,
				},
			];
		}
		emit("handle-remove", {
			name: Number(file.name.split("_id")[1]),
			file,
		});
		imageUrl.value = "";
	};

	const handleExceed: UploadProps["onExceed"] = (files) => {
		upload.value!.clearFiles();
		const file = files[0] as UploadRawFile;
		file.uid = genFileId();
		upload.value!.handleStart(file);
	};

	const handleCroppedFile = (data: any) => {
		disabledDeleteIcon.value = "false";
		emit("upload-file", { file: data.file });
		fileList.value[0].name = data.file.name;
		fileList.value[0].url = data.url;
		imageUrl.value = data.url;
	};
</script>

<template>
	<div class="upload-crop">
		<el-upload
			ref="upload"
			v-model:file-list="fileList"
			v-model="imageUrl"
			class="w-full"
			action="#"
			list-type="picture-card"
			:auto-upload="false"
			:on-change="onChange"
			:limit="1"
			drag
			multiple
			:disabled="disabled"
			accept="image/png, image/jpeg"
			:on-exceed="handleExceed"
		>
			<!-- <novok-button :disabled="disabled" type="info" class="w-full">{{
            $t("buttons.change_photo")
          }}</novok-button> -->

			<template #file="{ file }">
				<div class="w-full">
					<img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
					<span v-if="!disabled" class="el-upload-list__item-actions">
						<span v-if="disabledDeleteIcon === 'false'" class="el-upload-list__item-delete" @click="handleRemove(file)">
							<el-icon>
								<Delete />
							</el-icon>
						</span>
					</span>
				</div>
			</template>
		</el-upload>

		<BaseCropper 
            :disabled="disabled" 
            :file-url="imageUrl" 
            @cropped-file="handleCroppedFile"
            :aspect-ratio="aspectRatio"
        />

		<el-dialog v-model="dialogVisible">
			<img style="width: 100%; height: 100%" :src="dialogImageUrl" alt="Preview Image" />
		</el-dialog>
	</div>
</template>
