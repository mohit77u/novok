<script setup lang="ts">
import { required, email, minLength, maxLength, helpers, requiredIf } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
import { CurrencyData, requestType } from "~/helper/data";
import { commaThreeDigitFormat } from "~/helper/common";
import { useProfileStore } from "~/store/profile";

definePageMeta({
	middleware: ["auth"],
});

const props = defineProps({
	disabled: {
		type: Boolean,
		default: false,
	},
});

const formData = reactive<any>({
	is_urgent: 0,
	information_why_is_urgent: "",
	request_number: "",
	request_type: "",
	requester_id: "",
	request_owner_id: "",
	requirement: "",
	title: "",
	category_level_1: "",
	category_level_2: "",
	personal_data_involved: 0,
	budget_currency: "GBP",
	budget: "",
	expected_dates_of_completion: "",
	have_you_identified_supplier: 0,
	// attach_quotation: "",
	business_unit: "",
	additional_information: "",
	authorised_signatory_id: "",
	budget_owner_id: "",
	supplier_name: [],
	supplier_email: [],
	signing_entity_id: "",
	parent_entity: "",
	justification: "",
});

const fields = ref<any>([
	{
		supplier_name: "",
		supplier_email: "",
		attach_quotation: "",
		attach_quotation_obj: "",
		supplierNameRequired: false,
		supplierEmailRequired: false,
	},
]);

const localePath = useLocalePath();
const { t } = useI18n();
const route = useRoute();
const clientAdminUserData = ref<any>([]);
const categories = ref<any>([]);
const subCategories = ref<any>([]);
const searchValue = ref("");
const loading = ref(false);
const deleteIds = ref<any>([]);
const copyFormData = ref<any>([]);
const copyEditData = ref<any>({
	attach_quotation: "",
});
const fullscreenLoading = ref(false);
const images = ref<any>([]);
const redirectFrom = ref<any>("");
const subEntityData = ref<any>([]);
const customFields = reactive([]);
const customFieldRef = ref<any>(null);
const profileStore = useProfileStore();

// const attachquotation = ref<any>(null);

const rules = computed(() => {
	return {
		information_why_is_urgent: {
			requiredIf: helpers.withMessage(t("formValidations.information_why_is_urgent"), requiredIf(formData.is_urgent == 1)),
		},
		request_type: {
			required: helpers.withMessage(t("formValidations.request_type"), required),
		},
		parent_entity: {
			required: helpers.withMessage(t("formValidations.parent_entity"), required),
		},
		requester_id: {
			required: helpers.withMessage(t("formValidations.requestor"), required),
		},
		request_owner_id: {
			required: helpers.withMessage(t("formValidations.request_owner"), required),
		},

		requirement: {
			required: helpers.withMessage(t("formValidations.requirement"), required),
			name_validation: {
				$validator: PasteCharcAndNumWithSpace,
				$message: t("copyPasteValidations.charNum"),
			},
		},
		title: {
			required: helpers.withMessage(t("formValidations.title"), required),
			name_validation: {
				$validator: PasteCharcAndNumWithSpace,
				$message: t("copyPasteValidations.charNum"),
			},
		},
		budget_currency: {
			required: helpers.withMessage(t("formValidations.currency"), required),
		},
		category_level_1: {
			required: helpers.withMessage(t("formValidations.category_level_1"), required),
		},

		budget: {
			required: helpers.withMessage(t("formValidations.budget"), required),
			// name_validation: {
			// 	$validator: PasteNumberOnly,
			// 	$message: t("copyPasteValidations.number"),
			// },
		},

		expected_dates_of_completion: {
			required: helpers.withMessage(t("formValidations.expected_date_of_completion"), required),
		},
		// attach_quotation: {
		// 	requiredif: helpers.withMessage(t("formValidations.attach_quotation"), requiredIf(formData.have_you_identified_supplier)),
		// },

		authorised_signatory_id: {
			required: helpers.withMessage(t("formValidations.authorised_signatory"), required),
			name_validation: {
				$validator: PasteCharcAndNumWithSpace,
				$message: t("copyPasteValidations.charNum"),
			},
		},
		budget_owner_id: {
			required: helpers.withMessage(t("formValidations.budget_owner"), required),
			name_validation: {
				$validator: PasteCharcAndNumWithSpace,
				$message: t("copyPasteValidations.charNum"),
			},
		},
		justification: {
			requiredIf: helpers.withMessage(t("formValidations.justification"), requiredIf(formData.have_you_identified_supplier == 1)),
		},
	};
});

const v$ = useVuelidate(rules, formData);

onMounted(async () => {
	if (!route.params?.id) {
		await getRequestNumber();

		const data = await getCustomField("request", "primary-details");

		data.forEach((obj: any) => {
			if (obj.input_type === "checkbox") {
				obj.input_value = [];
			} else {
				obj.input_value = "";
			}
		});
		formData.parent_entity = profileStore.$state.profileData?.user_detail?.company?.company_name;
		formData.requester_id = profileStore.$state.profileData?.user_detail?.tenant_user_detail_id;
		Object.assign(customFields, data);
	} else {
		await getEditTableData();
	}
	await getSubEntityData();
	await getClientAdminUserList(searchValue.value);

	redirectFrom.value = sessionStorage.getItem("redirectFrom");
	await getCategories();
});

const getEditTableData = async () => {
	fullscreenLoading.value = true;
	try {
		const res: any = await useApiFetch(`/requests/${route.params?.id}`, {
			method: "GET",
		});

		Object.keys(formData).forEach((field) => {
			if (res?.data?.[field] !== undefined && res?.data?.[field] !== null) {
				formData[field] = res?.data?.[field];
				formData.budget = formData.budget
					.toString()
					.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
					.replace(/\.00$/, "");
			}
		});

		Object.assign(customFields, res?.data?.custom_primary_details);

		if (res?.data?.identified_supplier?.length > 0) {
			prepareSupplierNameEmail(res?.data?.identified_supplier ?? []);
		}

		copyFormData.value = JSON.parse(JSON.stringify(formData));
		if (res.data?.attach_quotation.length) {
			copyEditData.value.attach_quotation = { document_path: res.data?.attach_quotation, id: res.data?.id, file_name: res.data?.file_name };
		}

		fullscreenLoading.value = false;
	} catch {
		fullscreenLoading.value = false;
	}
};

const getSubEntityData = async () => {
	try {
		fullscreenLoading.value = true;
		const res: any = await useApiFetch(`/contract-ms/signing-entities?perPage=20&sortColumn=&sortOrder=&searchValue=${searchValue.value}`, {
			method: "GET",
		});

		subEntityData.value = res.data?.map((data: any) => {
			return {
				label: data.sub_entity_name,
				value: data.id,
			};
		});
	} catch {
	} finally {
		fullscreenLoading.value = false;
	}
};

const prepareSupplierNameEmail = async (identifiedSuppliers: any) => {
	let fieldsData: any = [];

	if (identifiedSuppliers?.length > 0) {
		identifiedSuppliers?.forEach((field: any, index: any) => {
			fieldsData.push({
				supplier_name: field?.supplier_name || "",
				supplier_email: field?.supplier_email || "",
				attach_quotation: field?.attach_quotation || "",
				attach_quotation_obj: field?.attach_quotation
					? {
						document_path: field?.attach_quotation || "",
						id: field?.attach_quotation?.id || "",
						file_name: field?.file_name || "",
						file_size: field?.file_size || "",
						mime_type: field?.mime_type || "",
					}
					: "",
				supplierNameRequired: false,
				supplierEmailRequired: false,
			});
		});
	}

	fields.value = fieldsData;
};

const getRequestNumber = async () => {
	try {
		const res: any = await useApiFetch("/requests/generate/new-request-number", {
			method: "GET",
		});
		formData.request_number = res.data?.request_number;
	} catch { }
};

const getClientAdminUserList = async (value: any) => {
	searchValue.value = value;
	try {
		const res: any = await useApiFetch(`/project-ms/users?searchValue=${value}`, {
			method: "GET",
		});

		clientAdminUserData.value = res.data?.map((data: any) => {
			return {
				label: data.full_name + " " + "(" + data.email + ")",
				value: data.id,
			};
		});
	} catch { }
};

const getSelectedSubCategory = computed(() => {
	return subCategories.value.map((data: any) => data.value === formData.category_level_2);
});

const dropdownSelectedSubCategory = (value: any) => {
	formData.category_level_2 = value;
};

const getCategories = async () => {
	try {
		const res: any = await useApiFetch(`/project-ms/categories?perPage=15&sortColumn=&sortOrder=&searchValue=${searchValue.value}&parent_id=0`, {
			method: "GET",
		});
		categories.value = res.data?.data?.map((data: any) => {
			return {
				label: data.category_name,
				value: data.id,
			};
		});
	} catch { }
};

watch(
	() => formData.category_level_1,
	(val) => {
		getSubCategories(val);
	}
);

const handleCategoryChange = async () => {
	formData.category_level_2 = "";
	getSubCategories();
};

const getSubCategories = async (val = 0) => {
	try {
		let CatValue = val ? val : formData.category_level_1;

		const res: any = await useApiFetch(`/categories?parent_id=${CatValue}&perPage=15&searchValue=${searchValue.value}`, {
			method: "GET",
		});

		subCategories.value = res.data?.data.map((category: any) => {
			return {
				label: category.category_name,
				value: category.id,
			};
		});
	} catch { }
};

const dropdownSelectedRequestType = (value: any) => {
	formData.request_type = value;
};

const getSelectedRequestType = computed(() => {
	return requestType.find((data: any) => data.value == formData.request_type);
});

const dropdownSelectedCategory = (value: any) => {
	formData.category_level_1 = value;
};

const getSelectedCategory = computed(() => {
	return categories.value.map((data: any) => data.value === formData.category_level_1);
});

const categoryDropdownSearch = (value: any) => {
	searchValue.value = value;
	if (searchValue) {
		getCategories();
	}
};

const dropdownSelectedRequesterData = (value: any) => {
	formData.requester_id = value;
};

const getSelectedRequesterData = computed(() => {
	return clientAdminUserData.value.find((data: any) => data.value == formData.requester_id);
});

const dropdownSelectedRequestOwnerData = (value: any) => {
	formData.request_owner_id = value;
};

const getSelectedRequestOwnerData = computed(() => {
	return clientAdminUserData.value.find((data: any) => data.value == formData.request_owner_id);
});

const disabledDate = (date: any) => {
	var d = new Date();
	d.setDate(d.getDate() - 1);
	if (d > date) {
		return true;
	}
};

const imgOnChange = (value: any) => {
	// v$.value.attach_quotation.$reset();
	fields.value[value.id]["attach_quotation"] = value.file;
	images.value.push(value.file);
};

const handleRemove = (value: any) => {
	fields.value[value.id]["attach_quotation"] = "";
	if (value.name !== "") {
		formData.attach_quotation = "";
		formData.delete_file = 1;
		copyEditData.value.attach_quotation = "";
		// formData.have_you_identified_supplier = 0;
	}
};

const budgetChange = () => {
	let value = formData.budget.replace(/\D/g, "");
	value = value.slice(0, 10);
	if (value > 0) {
		v$.value.budget.$touch();
		formData.budget = commaThreeDigitFormat(value);
	}
};

const onSubmit = () => {
	fields.value.forEach((field: any) => {
		if (field.supplier_name === "" && formData.have_you_identified_supplier == 1) {
			field.supplierNameRequired = true;
		}
		if (field.supplier_email === "" && formData.have_you_identified_supplier == 1) {
			field.supplierEmailRequired = true;
		}
	});

	v$.value.$validate();

	const isValidCustomFields = customFieldRef.value.isValidate();

	if (!v$.value.$error && isValidCustomFields) {
		if (route.params?.id) {
			const isValid = fields.value.every((field: any) => {
				return !field.supplierNameRequired && !field.supplierEmailRequired;
			});
			if (isValid) {
				submitEditData();
			}
		} else {
			const isValid = fields.value.every((field: any) => {
				return !field.supplierNameRequired && !field.supplierEmailRequired;
			});
			if (isValid) {
				submitAddData();
			}
			// fields.value.map((field: any) => {
			// 	if (!field.supplierNameRequired || !field.supplierEmailRequired) {
			// 		submitAddData();
			// 	}
			// });
		}
	} else {
		setTimeout(() => {
			const firstErrorElement = document.querySelector(".error");
			if (firstErrorElement) {
				firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}, 250);
	}
};

const submitAddData = async () => {
	loading.value = true;
	formData.budget = formData.budget.split(",").join("");

	const fd = new FormData();
	Object.keys(formData).forEach((field) => {
		fd.append(field, formData[field]);
	});

	fields.value.map((field: any, index: any) => {
		fd.append("supplier_name[]", field.supplier_name);
		fd.append("supplier_email[]", field.supplier_email);
		fd.append("attach_quotation[" + index + "]", field.attach_quotation ?? " ");
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

	try {
		const res: any = await useApiFetch(`/requests`, {
			method: "POST",
			body: fd,
		});
		loading.value = false;
		images.value = [];
		useToast("success", res?.message);
		navigateTo(localePath("/project-pipeline/requests"));
	} catch {
		loading.value = false;
		images.value = [];
	}
};

const submitEditData = async () => {
	loading.value = true;
	formData.budget = formData.budget.split(",").join("");
	formData._method = "PATCH";
	const fd = new FormData();
	Object.keys(formData).forEach((field) => {
		fd.append(field, formData[field]);
	});

	fields.value.map((field: any, index: any) => {
		fd.append("supplier_name[]", field.supplier_name);
		fd.append("supplier_email[]", field.supplier_email);
		if (field.attach_quotation != "" && typeof field.attach_quotation == "string") {
			fd.append("file_path[]", field.attach_quotation);
			fd.append("mime_type[]", field.attach_quotation_obj.mime_type);
			fd.append("attach_quotation[" + index + "]", " ");
		} else {
			fd.append("file_path[]", "");
			fd.append("mime_type[]", "");
			fd.append("attach_quotation[" + index + "]", field.attach_quotation);
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

	try {
		const res: any = await useApiFetch(`/requests/${route.params?.id}`, {
			method: "POST",
			body: fd,
		});
		loading.value = false;
		images.value = [];
		useToast("success", res.message);
		navigateTo(localePath("/project-pipeline/requests"));
	} catch {
		loading.value = false;
		// images.value = [];
	}
};

const changeSupplierName = (index: any) => {
	if (fields.value[index].supplier_name === "") {
		fields.value[index].supplierNameRequired = true;
	} else {
		fields.value[index].supplierNameRequired = false;
	}
};

const changeSupplierEmail = (index: any) => {
	const validNamePattern = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
	if (validNamePattern.test(fields.value[index].supplier_email)) {
		fields.value[index].supplierEmailRequired = false;
	} else {
		fields.value[index].supplierEmailRequired = true;
	}
};

const removeInput = (index: any) => {
	fields.value.splice(index, 1);
};

const addInput = () => {
	if (fields.value.length > 0 && fields.value.length < 5) {
		fields.value.push({
			supplier_name: "",
			supplier_email: "",
			attach_quotation: "",
			attach_quotation_obj: "",
			supplierNameRequired: false,
			supplierEmailRequired: false,
		});
	}
};

const identifiedSupplierChange = () => {
	fields.value = fields.value.filter((field: any) => {
		return field.supplier_name != "" && field.supplier_email != "";
	});

	if (fields?.value?.length == 0) {
		fields.value.push({
			supplier_name: "",
			supplier_email: "",
			attach_quotation: "",
			attach_quotation_obj: "",
			supplierNameRequired: false,
			supplierEmailRequired: false,
		});
	}

	formData.justification = "";
	v$.value.justification.$reset();
};

const dropdownSelectedSubEntity = (value: any) => {
	formData.signing_entity_id = value;
};

const getSelectedSubEntity = computed(() => {
	return subEntityData.value.find((data: any) => data.value === formData.signing_entity_id);
});

const isUrgentChange = () => {
	v$.value.information_why_is_urgent.$reset();
	formData.information_why_is_urgent = "";
};
</script>


<template>
	<el-form v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }"
		class="flex flex-col relative">
		<div id="super-admin-form">
			<div class="bg-[#fff]">
				<div class="p-6">
					<div class="grid grid-cols-12 gap-5 lg:gap-6">
						<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4" :rules="[{ required: true }]"
							:label="$t('formLabels.is_urgent')">
							<template #label>
								<BaseLabel :label="$t('formLabels.is_urgent')" :tooltip-content="$t('info.is_urgent')"
									:isShowLabel="false" />
							</template>
							<el-radio-group v-model="formData.is_urgent" :disabled="disabled" @change="isUrgentChange">
								<el-radio :label="1" size="large">Yes</el-radio>
								<el-radio :label="0" size="large">No</el-radio>
							</el-radio-group>
						</el-form-item>

						<el-form-item v-if="formData.is_urgent" :rules="[{ required: true }]"
							:label="$t('formLabels.information_why_is_urgent')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.information_why_is_urgent')"
									:tooltip-content="$t('info.information_why_is_urgent')" :isShowLabel="false" />
							</template>
							<el-input v-model="formData.information_why_is_urgent" name="information_why_is_urgent"
								type="text" :disabled="disabled" :class="{
									error: v$.information_why_is_urgent.$error,
								}" maxLength="100" @change="v$.information_why_is_urgent.$touch" @keypress="CharcAndNumber" />
							<span v-if="v$.information_why_is_urgent.$error" class="text-xs text-red-500 mt-2">{{
								v$.information_why_is_urgent.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.request_number')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.request_number')"
									:tooltip-content="$t('info.request_number')" :isShowLabel="false" />
							</template>
							<el-input v-model.trim="formData.request_number" name="request_number" type="text" disabled
								@keypress="CharcAndNumber" />
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.parent_entity')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.parent_entity')"
									:tooltip-content="$t('info.parent_entity')" />
							</template>
							<el-input v-model="formData.parent_entity" name="parent_entity" type="text" :class="{
								error: v$.parent_entity.$error,
							}" maxLength="100" :disabled="disabled" @change="v$.parent_entity.$touch"
								@keypress="CharSpecCharWithWhitespace" />
							<span v-if="v$.parent_entity.$error" class="text-xs text-red-500 mt-2">{{
								v$.parent_entity.$errors[0].$message
								}}</span>
						</el-form-item>

						<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							:label="$t('formLabels.signing_entity')">
							<template #label>
								<BaseLabel :label="$t('formLabels.signing_entity')"
									:tooltip-content="$t('info.request_signing_entity')" />
							</template>
							<BaseSelectDropdown v-model="formData.signing_entity_id" name="sub_entity"
								:dropdown-option="subEntityData" :number-only="false" :disabled="disabled"
								:get-selected-country="getSelectedSubEntity"
								@selected-value="dropdownSelectedSubEntity" />
						</el-form-item>

						<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							:rules="[{ required: true }]" :label="$t('formLabels.request_type')">
							<template #label>
								<BaseLabel :label="$t('formLabels.request_type')"
									:tooltip-content="$t('info.request_type')" :isShowLabel="false" />
							</template>
							<BaseSelectDropdown v-model="formData.request_type" :dropdown-option="requestType"
								:get-selected-country="getSelectedRequestType" :number-only="false" :disabled="disabled"
								name="request_type" :class="{
									error: v$.request_type.$error,
								}" @selected-value="dropdownSelectedRequestType" @change="v$.request_type.$touch" />

							<span v-if="v$.request_type.$error" class="text-xs text-red-500 mt-2">{{
								v$.request_type.$errors[0].$message
								}}</span>
						</el-form-item>

						<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							:rules="[{ required: true }]" :label="$t('formLabels.requestor')">
							<template #label>
								<BaseLabel :label="$t('formLabels.requestor')"
									:tooltip-content="$t('info.requestor')" />
							</template>
							<BaseSelectDropdown v-model="formData.requester_id" :dropdown-option="clientAdminUserData"
								:get-selected-country="getSelectedRequesterData" :number-only="false"
								:disabled="disabled" name="requester_id" :class="{
									error: v$.requester_id.$error,
								}" :isRemoteSearch="true" @remote-search="getClientAdminUserList"
								@selected-value="dropdownSelectedRequesterData" @change="v$.requester_id.$touch" />

							<span v-if="v$.requester_id.$error" class="text-xs text-red-500 mt-2">{{
								v$.requester_id.$errors[0].$message
								}}</span>
						</el-form-item>

						<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							:rules="[{ required: true }]" :label="$t('formLabels.request_owner')">
							<template #label>
								<BaseLabel :label="$t('formLabels.request_owner')"
									:tooltip-content="$t('info.request_owner')" />
							</template>
							<BaseSelectDropdown v-model="formData.request_owner_id"
								:dropdown-option="clientAdminUserData"
								:get-selected-country="getSelectedRequestOwnerData" :number-only="false"
								:disabled="disabled" name="request_owner_id" :class="{
									error: v$.request_owner_id.$error,
								}" :isRemoteSearch="true" @remote-search="getClientAdminUserList"
								@selected-value="dropdownSelectedRequestOwnerData"
								@change="v$.request_owner_id.$touch" />

							<span v-if="v$.request_owner_id.$error" class="text-xs text-red-500 mt-2">{{
								v$.request_owner_id.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.title')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.title')"
									:tooltip-content="$t('info.request_title')" />
							</template>
							<el-input v-model="formData.title" name="title" type="textarea" :class="{
								error: v$.title.$error,
							}" maxLength="255" :disabled="disabled" @change="v$.title.$touch" @keypress="CharcAndNumber" />
							<span v-if="v$.title.$error" class="text-xs text-red-500 mt-2">{{
								v$.title.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.requirement/needs')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.requirement/needs')"
									:tooltip-content="$t('info.requirement/needs')" :isShowLabel="false" />
							</template>
							<el-input v-model="formData.requirement" name="requirement" type="text" :class="{
								error: v$.requirement.$error,
							}" maxLength="100" :disabled="disabled" @change="v$.requirement.$touch" @keypress="CharcAndNumber" />
							<span v-if="v$.requirement.$error" class="text-xs text-red-500 mt-2">{{
								v$.requirement.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.category_level_1')" :rules="[{ required: true }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.category_level_1')"
									:tooltip-content="$t('info.category_level_1')" :isShowLabel="false" />
							</template>
							<BaseSelectDropdown v-model="formData.category_level_1" :dropdown-option="categories"
								:get-selected-country="getSelectedCategory" :number-only="false" :isRemoteFilter="true"
								:name="'category_level_1'" :disabled="disabled"
								@selected-value="dropdownSelectedCategory" @remote-search="categoryDropdownSearch"
								@change="v$.category_level_1.$touch, handleCategoryChange"
								@dropdown-change="handleCategoryChange" :class="{
									error: v$.category_level_1.$error,
								}" />
							<span v-if="v$.category_level_1.$error" class="text-xs text-red-500 mt-2">{{
								v$.category_level_1.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.category_level_2')" :rules="[{ required: false }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
							<BaseSelectDropdown v-model="formData.category_level_2" :dropdown-option="subCategories"
								:number-only="false" :get-selected-country="getSelectedSubCategory"
								:disabled="disabled || !formData.category_level_1" name="category_level_2"
								:isRemoteFilter="true" @selected-value="dropdownSelectedSubCategory" />
						</el-form-item>

						<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4" :rules="[{ required: true }]"
							:label="$t('formLabels.personal_data_involved')">
							<template #label>
								<BaseLabel :label="$t('formLabels.personal_data_involved')"
									:tooltip-content="$t('info.personal_data_involved')" />
							</template>
							<el-radio-group v-model="formData.personal_data_involved" :disabled="disabled">
								<el-radio :label="1" size="large">Yes</el-radio>
								<el-radio :label="0" size="large">No</el-radio>
							</el-radio-group>
						</el-form-item>

						<el-form-item :label="$t('formLabels.currency')" :rules="[{ required: true }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.currency')" :tooltip-content="$t('info.currency')"
									:isShowLabel="false" />
							</template>
							<BaseSelectDropdown v-model="formData.budget_currency" :dropdown-option="CurrencyData"
								:number-only="false" :disabled="disabled" name="budget_currency" :class="{
									error: v$.budget_currency.$error,
								}" @change="v$.budget_currency.$touch" />
							<span v-if="v$.budget_currency.$error" class="text-xs text-red-500 mt-2 w-full">{{
								v$.budget_currency.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.budget')" :rules="[{ required: true }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.budget')" :tooltip-content="$t('info.budget')"
									:isShowLabel="false" />
							</template>
							<el-input v-model="formData.budget" name="budget" type="text" :class="{
								error: v$.budget.$error,
							}" maxLength="10" :disabled="disabled" @change="budgetChange" @keypress="NumbersOnly" />
							<span v-if="v$.budget.$error" class="text-xs text-red-500 mt-2">{{
								v$.budget.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]"
							:label="$t('formLabels.expected_date_of_completion')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.expected_date_of_completion')"
									:tooltip-content="$t('info.expected_date_of_completion')" :isShowLabel="false" />
							</template>
							<el-date-picker v-model.trim="formData.expected_dates_of_completion" type="datetime"
								placeholder="DD/MM/YYYY HH:mm" format="DD/MM/YYYY hh:mm A"
								value-format="YYYY-MM-DD HH:mm:ss" time-format="hh:mm A"
								name="expected_dates_of_completion" :disabled="disabled" :class="{
									error: v$.expected_dates_of_completion.$error,
								}" :disabled-date="disabledDate" @change="v$.expected_dates_of_completion.$touch" />

							<span v-if="v$.expected_dates_of_completion.$error"
								class="text-xs text-red-500 mt-2 w-full">{{
									v$.expected_dates_of_completion.$errors[0].$message
								}}</span>
						</el-form-item>

						<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4" :rules="[{ required: true }]"
							:label="$t('formLabels.do_you_have_identified_supplier')">
							<template #label>
								<BaseLabel :label="$t('formLabels.do_you_have_identified_supplier')"
									:tooltip-content="$t('info.do_you_have_identified_supplier')"
									:isShowLabel="false" />
							</template>
							<el-radio-group v-model="formData.have_you_identified_supplier" :disabled="disabled"
								@change="identifiedSupplierChange">
								<el-radio :label="1" size="large">Yes</el-radio>
								<el-radio :label="0" size="large">No</el-radio>
							</el-radio-group>
						</el-form-item>

						<el-form-item v-if="formData.have_you_identified_supplier"
							:label="$t('formLabels.justification')" :rules="[{ required: true }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.justification')"
									:tooltip-content="$t('info.justification')" />
							</template>
							<el-input v-model="formData.justification" name="justification" type="textarea" :class="{
								error: v$.justification.$error,
							}" maxLength="255" :disabled="disabled" @change="budgetChange" @keypress="CharcAndNumber" />
							<span v-if="v$.justification.$error" class="text-xs text-red-500 mt-2">{{
								v$.justification.$errors[0].$message
								}}</span>
						</el-form-item>

						<template v-if="formData.have_you_identified_supplier">
							<div class="col-span-12">
								<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-5"
									v-for="(input, index) in fields" :key="index">
									<el-form-item class="mb-0" :label="$t('formLabels.supplier_name')"
										:rules="[{ required: true }]">
										<template #label>
											<BaseLabel :label="$t('formLabels.supplier_name')"
												:tooltip-content="$t('info.name')" :isShowLabel="false" />
										</template>
										<el-input type="text" label="First Name" :name="'fields' + index"
											v-model="fields[index].supplier_name" :disabled="disabled" maxLength="30"
											:class="{
												error: fields[index].supplierNameRequired,
											}" @blur="changeSupplierName(index)" />
										<span v-if="fields[index].supplierNameRequired || fields.supplierNameRequired"
											class="text-xs text-red-500 mt-2">{{
												$t("formValidations.supplier_name") }}</span>
									</el-form-item>

									<el-form-item class="mb-0" :label="$t('formLabels.supplier_email')"
										:rules="[{ required: true }]" :isShowLabel="false">
										<template #label>
											<BaseLabel :label="$t('formLabels.supplier_email')"
												:tooltip-content="$t('info.email')" />
										</template>
										<el-input type="text" label="Last Name" :name="'fields' + index"
											v-model="fields[index].supplier_email" :disabled="disabled" maxLength="30"
											:class="{
												error: fields[index].supplierEmailRequired,
											}" @blur="changeSupplierEmail(index)" />
										<span v-if="fields[index].supplierEmailRequired || fields.supplierEmailRequired"
											class="text-xs text-red-500 mt-2">
											{{ $t("formValidations.email_valid") }}
										</span>
									</el-form-item>

									<div class="flex md:col-span-2 xl:col-span-1">
										<div class="mb-0 w-full">
											<div class="inline-flex items-center mr-5">
												<label id="gdpr" class="el-form-item__label pr-0">
													{{ $t("formLabels.attach_quotation") }}
													<!-- <span class="text-red-500">*</span> -->
												</label>
												<BaseLabel :tooltip-content="$t('info.attach_quotation')"
													:isShowLabel="false" />
											</div>
											<BaseImage :id="index.toString()" :limit="1" :name="'fields' + index"
												:disabled="disabled" :form-data="fields[index].attach_quotation_obj"
												@upload-file="imgOnChange" @handle-remove="handleRemove" />
											<!-- <span v-if="v$.attach_quotation.$error" class="text-xs text-red-500 mt-2">{{
												v$.attach_quotation.$errors[0].$message
											}}</span> -->
										</div>
										<novok-button type="danger" class="w-[40px] h-[40px] mt-6 ml-3"
											@click="removeInput(index)" v-if="fields.length > 1">
											<i class="fa-solid fa-xmark"></i>
										</novok-button>
									</div>
								</div>

								<novok-button class="mt-4"
									:class="disabled ? 'btn-dark' : fields.length >= 5 ? 'btn-dark' : 'el-button--info'"
									@click="addInput" :disabled="disabled || fields.length >= 5"><i
										class="fa-solid fa-plus mr-2"></i> {{
											$t("buttons.add") }}</novok-button>
							</div>
						</template>

						<el-form-item :label="$t('formLabels.business_unit')" :rules="[{ required: false }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.business_unit')"
									:tooltip-content="$t('info.business_unit')" :isShowLabel="false" />
							</template>

							<el-input v-model="formData.business_unit" name="business_unit" type="text" maxLength="255"
								:disabled="disabled" @keypress="CharcAndNumber" />
						</el-form-item>

						<el-form-item :label="$t('formLabels.additional_information')" :rules="[{ required: false }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.additional_information')"
									:tooltip-content="$t('info.additional_information')" />
							</template>
							<el-input v-model="formData.additional_information" name="additional_information"
								type="textarea" maxLength="255" :disabled="disabled" />
						</el-form-item>

						<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							:rules="[{ required: true }]" :label="$t('formLabels.authorised_signatory')">
							<template #label>
								<BaseLabel :label="$t('formLabels.authorised_signatory')"
									:tooltip-content="$t('info.authorised_signatory')" />
							</template>
							<BaseSelectDropdown v-model="formData.authorised_signatory_id"
								:dropdown-option="clientAdminUserData"
								:get-selected-country="getSelectedAuthorisedSignatory" :number-only="false"
								:disabled="disabled" name="authorised_signatory_id" :class="{
									error: v$.authorised_signatory_id.$error,
								}" :isRemoteSearch="true" @remote-search="getClientAdminUserList"
								@selected-value="dropdownSelectedAuthorisedSignatory"
								@change="v$.authorised_signatory_id.$touch" />

							<span v-if="v$.authorised_signatory_id.$error" class="text-xs text-red-500 mt-2">{{
								v$.authorised_signatory_id.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							:rules="[{ required: true }]" :label="$t('formLabels.budget_owner')">
							<template #label>
								<BaseLabel :label="$t('formLabels.budget_owner')"
									:tooltip-content="$t('info.budget_owner')" />
							</template>
							<BaseSelectDropdown v-model="formData.budget_owner_id"
								:dropdown-option="clientAdminUserData" :get-selected-country="getSelectedBudgetOwner"
								:number-only="false" :disabled="disabled" name="budget_owner_id" :class="{
									error: v$.budget_owner_id.$error,
								}" :isRemoteSearch="true" @remote-search="getClientAdminUserList" @selected-value="dropdownSelectedBudgetOwner"
								@change="v$.budget_owner_id.$touch" />

							<span v-if="v$.budget_owner_id.$error" class="text-xs text-red-500 mt-2">{{
								v$.budget_owner_id.$errors[0].$message
							}}</span>
						</el-form-item>

						<custom-input-add-edit ref="customFieldRef" :custom-data="customFields" module-name="request"
							:disabled="disabled" custom-class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							@update-data="(value) => Object.assign(customFields, value)" />
					</div>
				</div>

				<div class="p-6 text-right">
					<novok-button class="btn-dark my-1"
						@click.prevent="navigateTo(localePath('/project-pipeline/requests'))"><span
							class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span><i
							class="fa-solid fa-xmark sm:hidden"></i></novok-button>

					<novok-button v-if="!route.params?.id" class="my-1" type="info" :loading="loading"
						:disabled="loading" @click.prevent="onSubmit">{{ $t("buttons.add_request") }}
					</novok-button>

					<novok-button v-if="route.params?.id && redirectFrom !== 'view'" class="my-1" type="info"
						:loading="loading" :disabled="loading" @click.prevent="onSubmit">{{ $t("buttons.save_changes")
						}}
					</novok-button>
				</div>
			</div>
		</div>
	</el-form>
</template>
