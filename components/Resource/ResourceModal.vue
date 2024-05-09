<script setup lang="ts">
	import { required, email, minLength, maxLength, helpers, requiredIf } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";

	const props = defineProps({
		dialogVisible: Boolean,
		editData: {
			type: Object,
			default: {},
		},
		documentType: {
			type: String,
			default: "policy-documents",
		},
		mode: {
			type: String,
			default: "add",
		},
		isEdit: {
			type: Boolean,
			default: false,
		},
	});

	const formData = reactive<any>({
		document_name: "",
		document: "",
	});

	const copyEditData = ref<any>({
		folder_type: "",
		document_name: "",
		document: "",
	});

	const emit = defineEmits(["dialogOkClick", "add-document"]);

	const { t } = useI18n();
	const dialogVisible = ref<any>(false);
	const modalTitle = ref<any>("Policy Document");
	const loading = ref(false);
	const editId = ref("");
	const copyFormData = ref<any>({});
	const documentRef = ref<any>(null);

	const rules = computed(() => {
		return {
			document_name: {
				required: helpers.withMessage(t("formValidations.document_name"), required),
				// name_validation: {
				// 	$validator: PasteCharcWithSpace,
				// 	$message: t("copyPasteValidations.characters"),
				// },
			},
			document: {
				required: helpers.withMessage(t("formValidations.document"), required),
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

	watch(
		() => props.dialogVisible,
		(data) => {
			dialogVisible.value = data;
		},
		{ deep: true, immediate: true }
	);

	watch(
		() => props.documentType,
		(data) => {
			if (data == "policy-documents") {
				modalTitle.value = t("formLabels.policy_documents");
			} else if (data == "templates") {
				modalTitle.value = t("formLabels.templates");
			} else if (data == "qt-documents") {
				modalTitle.value = t("formLabels.qt_documents");
			}
		},
		{ deep: true, immediate: true }
	);

	watch(
		() => props.editData,
		(data) => {
			if (Object.keys(data).length) {
				Object.keys(formData).forEach((field: any) => {
					formData[field] = data[field];
					formData["document"] = data.document_path;
				});
				editId.value = data.id;
				copyEditData.value.document = { document_path: data.document_path, file_name: data.document_file_name ?? "dummy" };
				copyFormData.value = JSON.parse(JSON.stringify(formData));

				if (documentRef.value) {
					documentRef.value.resetValidation();
				}
			}
		},
		{ deep: true, immediate: true }
	);

	onMounted(() => {
		copyEditData.value.document = "";
		copyEditData.value.document_name = "";
		formData.document_name = "";
		formData.document = "";
	});

	const okClick = () => {
		dialogVisible.value = false;
		emit("dialogOkClick", false);
	};

	const imgOnChange = (value: any) => {
		formData[value.id] = value.file;
		copyEditData.value[value.id] = value.file;
	};

	const handleRemove = (value: any) => {
		if (value.name !== "" && value.name !== isNaN && value.name !== undefined) {
			formData[value.id] = "";
			formData.delete_document_ids = value.name;
		} else {
			formData.document = "";
		}
	};

	const onSubmit = () => {
        if (props.documentType == "policy-documents") {
            formData.folder_type = 1;
        } else if (props.documentType == "templates") {
            formData.folder_type = 2;
        } else if (props.documentType == "qt-documents") {
            formData.folder_type = 3;
        }

		v$.value.$validate();
		if (!v$.value.$error) {
			if (!props.isEdit) {
				submitData();
			} else {
				submitEditData();
			}
		}
	};

	const submitData = async () => {
		loading.value = true;
		const fd = new FormData();
		Object.keys(formData).forEach((field) => {
			fd.append(field, formData[field]);
		});

		try {
			const res: any = await useApiFetch(`/resources`, {
				method: "POST",
				body: fd,
			});
			loading.value = false;
			formData.document = "";
			useToast("success", res?.message);
			// navigateTo(localePath("/project-pipeline/requests"));
		} catch {
			loading.value = false;
			formData.document = "";
		} finally {
			dialogVisible.value = false;
			emit("dialogOkClick", false);
			emit("add-document");
		}
	};

	const submitEditData = async () => {
		formData._method = "PATCH";
		let updatedData: any;
		if (formData.document === copyFormData.value.document) {
			updatedData = { ...formData };
			updatedData.document = null;
		} else {
			updatedData = { ...formData };
		}

		const fd = new FormData();
		Object.keys(updatedData).forEach((field) => {
			fd.append(field, updatedData[field]);
		});

		loading.value = true;
		try {
			const res: any = await useApiFetch(`/resources/${editId.value}`, {
				method: "POST",
				body: fd,
			});

			useToast("success", res.message);
			emit("dialogOkClick", false);
			emit("add-document");
		} catch {
		} finally {
			loading.value = false;
			// formData.document_name = "";
			// formData.document = "";
		}
	};
</script>

<template>
	<el-dialog v-model="dialogVisible" class="max-w-[540px] w-[90%] rounded-2xl" :title="modalTitle" :close-on-click-modal="false" @close="okClick">
		<!-- <div> -->
		<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.document_name')" class="md:col-span-6 lg:col-span-6 mb-0">
			<template #label>
				<BaseLabel :label="$t('formLabels.document_name')" :tooltip-content="$t('info.document_name')" />
			</template>
			<el-input
				v-model="formData.document_name"
				name="document_name"
				type="text"
				:class="{
					error: v$.document_name.$error,
				}"
				maxLength="50"
				:disabled="disabled"
				@change="v$.document_name.$touch"
			/>
			<span v-if="v$.document_name.$error" class="text-xs text-red-500 mt-2">{{ v$.document_name.$errors[0].$message }}</span>
		</el-form-item>

		<div class="inline-flex items-center mr-5 mt-5">
			<label id="gdpr" class="el-form-item__label pr-0">{{ $t("formLabels.document") }}<span class="text-red-500">*</span></label>
			<BaseLabel :tooltip-content="$t('info.document')" />
		</div>
		<BaseImage
			:id="'document'"
			ref="documentRef"
			:maxLimit="10"
			:limit="1"
			:form-data="copyEditData.document"
			:disabled="disabled"
			name="document"
			:class="{
				error: v$.document.$error,
			}"
			@upload-file="imgOnChange"
			@handle-remove="handleRemove"
			@blur="v$.document.$touch"
		/>
		<span v-if="v$.document.$error" class="text-xs text-red-500 mt-2">{{ v$.document.$errors[0].$message }}</span>

		<template #footer>
			<div class="dialog-footer text-center">
				<novok-button type="info" @click="onSubmit" :loading="loading"> {{ $t("buttons.save") }} </novok-button>
			</div>
		</template>
		<!-- </div> -->
	</el-dialog>
</template>
