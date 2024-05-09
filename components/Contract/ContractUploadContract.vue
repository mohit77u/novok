<!-- eslint-disable vue/require-valid-default-prop -->
<script setup lang="ts">
	import { required, helpers, requiredIf } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import { contractStore } from "~/store/contract";

	const localePath = useLocalePath();
	const { t } = useI18n();
	const loading = ref(false);
	const loadingSave = ref(false);
	const route = useRoute();
	const store = contractStore();
	const formData = reactive<any>({
		tab_name: "upload-contract",
		upload_contract: "",
		contract_copy_available: 1,
		contract_copy_comments: "",
	});
	const copyFormData = ref<any>([]);
	const copyEditData = ref<any>({
		tab_name: "upload-contract",
		upload_contract: "",
		contract_copy_available: 1,
		contract_copy_comments: "",
	});
	const uploadContractRef = ref<any>(null);
	const router = useRouter();
	// const showError = ref(false);
	// const dialogVisible = ref(false);
	const emit = defineEmits(["active-tab-name", "disable", "disabled"]);
	const customFields = reactive([]);
	const customFieldRef = ref<any>(null);

	const props = defineProps({
		editData: {
			type: Object,
			default: {},
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	});

	const rules = computed(() => {
		return {
			upload_contract: {
				requiredIf: helpers.withMessage(t("formValidations.upload_contract"), requiredIf(copyFormData.value.contract_copy_available === 1)),
			},
			contract_copy_comments: {
				requiredIf: helpers.withMessage(t("formValidations.reason"), requiredIf(copyFormData.value.contract_copy_available === 0)),
			},
		};
	});
	const v$ = useVuelidate(rules, copyFormData);

	watch(
		() => props.editData,
		(currData) => {
			if (currData.tab === "upload-contract") {
				copyEditData.value = { ...copyEditData.value, upload_contract: "" };
				v$.value.$reset();
				if (Object.keys(currData || {}).length) {
					Object.keys(formData).forEach((field: any) => {
						if (currData?.[field] !== undefined && currData?.[field] !== null && currData?.[field] !== "") {
							formData[field] = currData?.[field];
						}
					});
					// key : receive from api value : convert
					copyEditData.value.upload_contract = "";
					currData?.documents.forEach((document: any) => {
						if (document.document_type === "upload-contract") {
							formData.upload_contract = document.document_path;
							copyEditData.value.upload_contract = document;
						}
					});
					copyFormData.value = JSON.parse(JSON.stringify(formData));
				}

				Object.assign(customFields, currData?.custom_upload_contracts);

				if (copyFormData.value.contract_copy_available) {
					uploadContractRef.value.resetValidation();
				}
			}
		}
	);

	onMounted(() => {
		copyFormData.value = JSON.parse(JSON.stringify(formData));
	});

	const getEditData = async () => {
		try {
			const res: any = await useApiFetch(`/contracts/${route?.params?.id}/edit?tab_name=${store.getActiveTab}`, {
				method: "GET",
			});

			res.data?.documents.forEach((document: any) => {
				if (document.document_type === "upload-contract") {
					copyEditData.value.upload_contract = document;
				}
			});
		} catch (error) {}
	};

	const imgOnChange = (value: any) => {
		// if (value === "error") {
		//   showError.value = true;
		// } else {
		//   showError.value = false;
		copyFormData.value[value.id] = value.file;
		copyEditData.value[value.id] = value.file;

		// }
	};

	const handleRemove = (value: any) => {
		// showError.value = false;
		if (value.name !== "" && value.name !== isNaN && value.name !== undefined) {
			copyFormData.value[value.id] = "";
			copyFormData.value.delete_document_ids = value.name;
		} else {
			copyFormData.value.upload_contract = "";
		}
	};

	const onSubmit = (value: any) => {
		v$.value.$validate();
		const isValidCustomFields = customFieldRef.value.isValidate();

		if (!v$.value.$error && isValidCustomFields) {
			submitAddData(value);
		}
	};

	const submitAddData = async (value: any) => {
		try {
			if (value !== "save") {
				loading.value = true;
			} else {
				loadingSave.value = true;
			}

			const documents = {
				0: "upload_contract",
			};

			const fieldArray = Object.values(documents);
			const updatedReqBody = { ...copyFormData.value };

			fieldArray.forEach((field: any) => {
				if (formData[field] === copyFormData.value[field]) {
					updatedReqBody[field] = "";
				}
			});

			const fd = new FormData();
			Object.keys(updatedReqBody).forEach((field) => {
				if (field === "delete_document_ids") {
					fd.append("delete_document_ids" + "[]", updatedReqBody[field]);
				} else {
					fd.append(field, updatedReqBody[field]);
				}
			});

			customFields.forEach((data: any, key: any) => {
				fd.append(`custom_fields[${key}][id]`, data.id);
				fd.append(`custom_fields[${key}][module_name]`, data.module_name);
				fd.append(`custom_fields[${key}][tab_name]`, data.tab_name);
				fd.append(`custom_fields[${key}][input_label]`, data.input_label);
				fd.append(`custom_fields[${key}][input_type]`, data.input_type);
				fd.append(`custom_fields[${key}][min_length]`, data.min_length);
				fd.append(`custom_fields[${key}][max_length]`, data.max_length);
				fd.append(`custom_fields[${key}][is_required]`, data.is_required);
				fd.append(`custom_fields[${key}][metadata]`, JSON.stringify(data.metadata));
				fd.append(`custom_fields[${key}][input_value]`, data.input_value);
			});

			emit("disabled", true);

			const res: any = await useApiFetch(`/contracts/${route?.params?.id}/upload-contract`, {
				method: "POST",
				body: fd,
			});

			if (value !== "save") {
				store.setActiveTab("signatory-details");
				emit("active-tab-name", "signatory-details");
				if (route.query.page === "view") {
					navigateTo(
						localePath({
							path: "/contracts/view-contract/" + route?.params?.id,
							query: { tab: "signatory-details", page: "view" },
						})
					);
				} else {
					navigateTo(
						localePath({
							path: route.fullPath,
							query: { tab: "signatory-details" },
						}),
						{ replace: true }
					);
				}
			} else {
				useToast("success", res?.message);
				sessionStorage.setItem("ContractCreateClick", "0");
				if (route.query.page === "view") {
					navigateTo(
						localePath({
							path: "/contracts/view-contract/" + route?.params?.id,
							query: { tab: "upload-contract", page: "view" },
						})
					);
				}
			}
			getEditData();
		} catch {
		} finally {
			loading.value = false;
			loadingSave.value = false;
		}
	};

	const BackClick = () => {
		ContractBackButton("primary-details");
		emit("active-tab-name", "primary-details");
	};

	const contractCopyChange = () => {
		v$.value.$reset();
		copyFormData.value.upload_contract = "";
		copyEditData.value.upload_contract = "";
		copyFormData.value.contract_copy_comments = "";
	};
</script>

<template>
	<div class="p-6">
		<el-alert :title="$t('formLabels.single_img_description')" type="warning" :closable="false" class="mb-5" :show-icon="true" />
		<el-form class="grid grid-cols-2">
			<!-- <div class="w-full md:w-1/2 px-3 mt-6 sm:mt-7 md:mt-8 xl:mt-10 upload-contract"> -->
			<el-form-item class="mb-0" :label="$t('formLabels.contract_copy_available')">
				<template #label>
					<BaseLabel
						:label="$t('formLabels.contract_copy_available')"
						:tooltip-content="$t('info.contract_copy_available')"
						:isShowLabel="false"
					/>
				</template>
				<el-radio-group v-model="copyFormData.contract_copy_available" :disabled="disabled" @change="contractCopyChange">
					<el-radio :label="1" size="large">Yes</el-radio>
					<el-radio :label="0" size="large">No</el-radio>
				</el-radio-group>
			</el-form-item>

			<el-form-item v-if="copyFormData.contract_copy_available === 0" class="mb-0" :rules="[{ required: true }]">
				<template #label>
					<BaseLabel :label="$t('formLabels.reason')" :tooltip-content="$t('info.reason')" />
				</template>
				<el-input
					v-model="copyFormData.contract_copy_comments"
					type="textarea"
					name="contract_copy_comments"
					maxLength="200"
					:disabled="disabled"
					:class="{
						error: v$.contract_copy_comments.$error,
					}"
					@change="v$.contract_copy_comments.$touch"
					@keypress="CharcAndNumber"
				/>
				<span v-if="v$.contract_copy_comments.$error" class="text-xs text-red-500 mt-2">{{
					v$.contract_copy_comments.$errors[0].$message
				}}</span>
			</el-form-item>

			<div v-if="copyFormData.contract_copy_available === 1">
				<div class="inline-flex items-center mr-5">
					<label id="gdpr" class="el-form-item__label pr-0"
						>{{ $t("formLabels.upload_contract") }}<span class="text-red-500">*</span></label
					>
					<BaseLabel :tooltip-content="$t('info.upload_contract')" :isShowLabel="false" />
				</div>
				<BaseImage
					:id="'upload_contract'"
					ref="uploadContractRef"
					:limit="1"
					:form-data="copyEditData.upload_contract"
					:disabled="disabled"
					name="upload_contract"
					:class="{
						error: v$.upload_contract.$error,
					}"
					:isRequired="v$.upload_contract.$error"
					@upload-file="imgOnChange"
					@handle-remove="handleRemove"
					@blur="v$.upload_contract.$touch"
					:isShowDescription="false"
				/>
				<span v-if="v$.upload_contract.$error" class="text-xs text-red-500 mt-2">{{ v$.upload_contract.$errors[0].$message }}</span>
			</div>

			<custom-input-add-edit
				ref="customFieldRef"
				:custom-data="customFields"
				module-name="contract"
				:disabled="disabled"
				custom-class="mb-0 flex-1"
				@update-data="(value) => Object.assign(customFields, value)"
			/>
			<!-- </div> -->
		</el-form>

		<!-- buttons -->
		<div class="pt-6 flex justify-end">
			<novok-button type="cyan" class="my-1" @click.prevent="BackClick">
				<i class="fa-regular fa-arrow-left mr-2"></i> {{ $t("buttons.back") }}
			</novok-button>

			<novok-button class="btn-dark my-1" @click.prevent="router.push('/contracts')"
				><span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span
				><i class="fa-solid fa-xmark sm:hidden"></i
			></novok-button>

			<novok-button v-if="!disabled" class="my-1" type="info" :loading="loading" :disabled="loading" @click.prevent="onSubmit('save&next')"
				>{{ $t("buttons.save&next") }}
			</novok-button>

			<novok-button v-if="!disabled" class="my-1" type="info" :loading="loadingSave" :disabled="loadingSave" @click.prevent="onSubmit('save')"
				>{{ $t("buttons.save") }}
			</novok-button>
		</div>
	</div>
</template>
