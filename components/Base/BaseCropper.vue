<template>
	<div>
		<el-upload ref="FileInput" class="upload-demo" :limit="1" @input="onFileSelect" :on-remove="handleRemove" accept="image/*">
			<template #trigger>
				<novok-button :disabled="props.disabled" type="info" class="w-full">{{ $t("buttons.change_photo") }}</novok-button>
			</template>
		</el-upload>

		<div class="cropper-dialog-modal">
			<el-dialog v-model="centerDialogVisible" width="400" height="400" center>
				<h2 class="text-2xl font-bold text-dark/100 text-left">{{ $t("header.crop_image") }}</h2>
                <p class="mb-2 text-md"><span class="font-bold">{{ $t('placeholders.note') }}:</span> {{ $t('placeholders.crop_note') }}</p>
				<vue-cropper
					v-if="uploadedUrl"
					ref="cropperRef"
					:src="uploadedUrl"
					:view-mode="1"
					alt="Thumb Image"
					:cropBoxResizable="true"
					:minCropBoxWidth="150"
					:minCropBoxHeight="100"
                    :aspectRatio="aspectRatio"
				/>
				<template #footer>
					<div class="dialog-footer">
						<novok-button type="info" @click="cropFile">{{ $t("buttons.crop") }}</novok-button>
					</div>
				</template>
			</el-dialog>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	const props = defineProps({
		fileUrl: {
			type: String,
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

	const emit = defineEmits(["cropped-file"]);

    const { t } = useI18n();

	const selectedFile = ref<any>("");
	const uploadedUrl = ref<any>("");
	const cropperRef = ref<any>("");
	const centerDialogVisible = ref(false);

	watch(
		() => props.fileUrl,
		() => {
			uploadedUrl.value = props.fileUrl;
		}
	);

	const okClick = () => {
		centerDialogVisible.value = false;
	};

	const handleRemove = () => {
		uploadedUrl.value = "";
		cropperRef.value.destroy();
	};

	const onFileSelect = (e: any) => {
		uploadedUrl.value = "";

		const file = e.target.files[0];

        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            useToast('error', t('formValidations.upload_image_only'))
            return;
        }

		selectedFile.value = file;
		let url = window.URL.createObjectURL(file);
		uploadedUrl.value = url;
		if (cropperRef.value) {
			cropperRef.value.replace(url);
		}
		centerDialogVisible.value = true;
	};

	const cropFile = async (e: any) => {
		const croppedCanvas = cropperRef.value.getCroppedCanvas();
		const croppedImage = croppedCanvas.toDataURL();

		try {
			const blob = await fetchBlobFromDataUrl(croppedImage);
			const blobUrl = URL.createObjectURL(blob);

			uploadedUrl.value = blobUrl;

			const file = await blobUrlToFile(blobUrl, selectedFile.value.name, blob.type);
			emit("cropped-file", { file: file, url: blobUrl });
			centerDialogVisible.value = false;
		} catch (error) {
			console.error("Error processing cropped image:", error);
		}
	};

	const fetchBlobFromDataUrl = async (dataUrl: any) => {
		const response = await fetch(dataUrl);
		return await response.blob();
	};

	const blobUrlToFile = async (blobUrl: any, fileName: any, fileType: any) => {
		const blob = await fetchBlobFromDataUrl(blobUrl);
		return new File([blob], fileName, { type: fileType });
	};
</script>

<style>
</style>
