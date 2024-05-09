<script setup lang="ts">
	import { required, helpers, requiredIf } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";

	const localePath = useLocalePath();
	const { t } = useI18n();
	const formData = reactive<any>({
		files: [],
		tenant_supplier_id: "",
		contract_owner_id: "",
		contract_type: 1,
	});
	const deleteIds = ref<any>([]);
	const dialogVisible = ref(false);
	const bulkFiles = ref<any>([]);
	const loading = ref(false);
	const loadingSave = ref(false);
	const showError = ref(false);
	const router = useRouter();
	const bulk_upload = ref<any>(null);

	const rules = computed(() => {
		return {
			files: {
				required: helpers.withMessage(t("formValidations.files"), required),
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

	const MultiImgOnChange = (value: any) => {
		showError.value = false;
		if (value.file) {
			showError.value = false;
			formData?.files.push(value.file);
			bulkFiles.value.push(value.file);
		}
	};

	const handleRemove = (value: any) => {
		formData.files = formData.files.filter((field: any) => field.uid !== value.file.raw.uid);
		bulkFiles.value = bulkFiles.value.filter((field: any) => field.uid !== value.file.raw.uid);
	};

	const dialogOkClick = (value: any) => {
		dialogVisible.value = value;
	};

	const onSubmit = () => {
		bulk_upload.value.resetValidation();
		if (bulkFiles.value.length === 0) {
			showError.value = true;
		} else {
			submit();
		}
	};

	const submit = async () => {
		try {
			loadingSave.value = true;
			const fd = new FormData();

			Object.keys(formData).forEach((field) => {
				if (field === "files") {
					bulkFiles?.value?.forEach((value: any) => {
						fd.append("files" + "[]", value);
					});
				} else {
					fd.append(field, formData[field]);
				}
			});

			const res: any = await useApiFetch(`/contracts/bulk-upload`, {
				method: "POST",
				body: fd,
			});

			useToast("success", res.message);
			bulkFiles.value = [];
			router.push(localePath("/contracts"));
		} catch {
		} finally {
			loadingSave.value = false;
			dialogVisible.value = false;
		}
	};

	const onNext = () => {
		if (bulkFiles.value.length === 0) {
			showError.value = true;
		} else {
			dialogVisible.value = true;
		}
	};

	const modalDropdownData = (data: any) => {
		Object.keys(formData).forEach((field: any) => {
			formData[field] = data[field];
		});
	};
</script>

<template>
	<div class="p-6">
		<div class="flex items-center mb-4">
			<h1 class="text-xl font-bold">{{ $t("dropdown_labels.bulk_upload") }}</h1>
			<BaseLabel :tooltip-content="$t('info.bulk_upload')" />
		</div>
		<!-- <label class="el-form-item__label">{{ $t("formLabels.select_files") }}<span class="text-danger">*</span></label> -->
		<BaseBulkUploadMultiImg
			:id="'bulk_upload'"
			ref="bulk_upload"
			:limit="100"
			name="files"
			@upload-file="MultiImgOnChange"
			@handle-remove="handleRemove"
		/>
		<span v-if="showError" class="text-sm text-red-500 mt-2">{{ $t("formValidations.files") }}</span>

		<!--:form-data="copyEditData.other_certificate"-->

		<!-- buttons -->
		<div class="pt-6 text-right">
			<h2 class="font-bold">{{ $t("formLabels.total") }} : {{ bulkFiles.length }} {{ $t("formLabels.files") }}</h2>

			<novok-button class="btn-dark my-1" @click.prevent="router.push('/contracts')"
				><span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span
				><i class="fa-solid fa-xmark sm:hidden"></i
			></novok-button>

			<novok-button class="my-1" type="info" @click.prevent="onNext">{{ $t("buttons.next") }} </novok-button>

			<novok-button class="my-1" type="info" :loading="loadingSave" @click.prevent="onSubmit">{{ $t("buttons.add") }} </novok-button>
		</div>
	</div>
	<base-bulk-upload-modal
		v-if="dialogVisible === true"
		:dialog-visible="dialogVisible"
		:dialog-api="onSubmit"
		message-content=""
		header="Add Primary Details"
		@dialog-ok-click="dialogOkClick"
		@dropdown-data="modalDropdownData"
	/>
</template>
