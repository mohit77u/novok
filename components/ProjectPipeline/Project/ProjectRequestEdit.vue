<script setup lang="ts">
	import { required, email, minLength, maxLength, helpers, requiredIf } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import { CurrencyData, requestType, activityType } from "~/helper/data";
	import { commaThreeDigitFormat } from "~/helper/common";
	import { useProfileStore } from "~/store/profile";

	definePageMeta({
		middleware: ["auth"],
	});

	const emit = defineEmits(["disabledStatus", "activity_type"]);

	const props = defineProps({
		editData: {
			type: Object,
			default: {},
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		activeTab: {
			type: String,
			default: "",
		},
	});

	const formData = reactive<any>({
		action: "",
		project_title: "",
		requirement: "",
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
		// supplier_name: [],
		// supplier_email: [],
		justification: "",
		activity_type: "",
		comment_for_selected_activity_type: "",
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
	const loadingSave = ref(false);
	const deleteIds = ref<any>([]);
	const copyFormData = ref<any>([]);
	const copyEditData = ref<any>({
		attach_quotation: "",
	});
	const fullscreenLoading = ref(false);
	const images = ref<any>([]);
	const redirectFrom = ref<any>("");
	const customFields = reactive([]);
	const customFieldRef = ref<any>(null);
	const profileStore = useProfileStore();
	const editData = ref<any>({});
	const subEntityData = ref<any>([]);

	// const attachquotation = ref<any>(null);

	const rules = computed(() => {
		return {
			requirement: {
				required: helpers.withMessage(t("formValidations.requirement"), required),
				name_validation: {
					$validator: PasteCharcAndNumWithSpace,
					$message: t("copyPasteValidations.charNum"),
				},
			},
			project_title: {
				required: helpers.withMessage(t("formValidations.project_title"), required),
			},
			budget_currency: {
				required: helpers.withMessage(t("formValidations.currency"), required),
			},
			category_level_1: {
				required: helpers.withMessage(t("formValidations.category_level_1"), required),
			},

			budget: {
				required: helpers.withMessage(t("formValidations.budget"), required),
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
			activity_type: {
				required: helpers.withMessage(t("formValidations.activity_type"), required),
			},
			comment_for_selected_activity_type: {
				required: helpers.withMessage(t("formValidations.comment_for_selected_activity_type"), required),
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

	onMounted(async () => {
		if (props.activeTab === "request") {
			const data = await getCustomField("request", "primary-details");

			data.forEach((obj: any) => {
				if (obj.input_type === "checkbox") {
					obj.input_value = [];
				} else {
					obj.input_value = "";
				}
			});
			formData.parent_entity = profileStore.$state.profileData?.user_detail?.company?.company_name;
			Object.assign(customFields, data);
			redirectFrom.value = sessionStorage.getItem("redirectFrom");
			// await getClientAdminUserList(searchValue.value);
			// await getCategories();
			// await getSubEntityData();
		}
	});

	watch(
		() => props.editData,
		async (currData) => {
			if (props.activeTab === "request") {
				Object.assign(editData.value, currData);
				Object.assign(customFields, currData?.custom_primary_details);

				Object.keys(formData).forEach((field: any) => {
					if (field !== "undefined" || field !== null) {
						formData[field] = currData[field];
					}
				});
				formData.budget = formData.budget
					?.toString()
					?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
					?.replace(/\.00$/, "");

				if (currData?.identified_suppliers?.length > 0) {
					prepareSupplierNameEmail(currData?.identified_suppliers ?? []);
				}

				await getClientAdminUserList(searchValue.value);

				await getCategories();
				await getSubEntityData();

				copyFormData.value = JSON.parse(JSON.stringify(formData));
			}
		}
	);

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
								file_path: field?.file_path || "",
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
		} catch {}
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

	const getSelectedSubEntity = computed(() => {
		return subEntityData.value.find((data: any) => data.value === editData.value.signing_entity_id);
	});

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
		} catch {}
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
		} catch {}
	};

	const dropdownSelectedCategory = (value: any) => {
		formData.category_level_1 = value;
	};

	const getSelectedCategory = computed(() => {
		return categories.value.map((data: any) => data.value == formData.category_level_1);
	});

	const categoryDropdownSearch = (value: any) => {
		searchValue.value = value;
		if (searchValue) {
			getCategories();
		}
	};

	const getSelectedRequesterData = computed(() => {
		return clientAdminUserData.value.find((data: any) => data.value == props.editData.requester_id);
	});

	const getSelectedRequestOwnerData = computed(() => {
		return clientAdminUserData.value.find((data: any) => data.value == props.editData.request_owner_id);
	});

	const getSelectedRequestType = computed(() => {
		return requestType.find((data: any) => data.value == props.editData.request_type);
	});

	const getSelectedProjectOwner = computed(() => {
		return clientAdminUserData.value.find((data: any) => data.value == props.editData?.project_owner_id);
	});

	const dropdownSelectedActivityType = (value: any) => {
		formData.activity_type = value;
		emit("activity_type", value);
	};

	const getSelectedActivityType = computed(() => {
		return activityType.find((data: any) => data.value == formData.activity_type);
	});

	const getSelectedBudgetOwner = computed(() => {
		return clientAdminUserData.value.find((data: any) => data.value == formData.budget_owner_id);
	});

	const dropdownSelectedBudgetOwner = (value: any) => {
		formData.budget_owner_id = value;
	};

	const dropdownSelectedAuthorisedSignatory = (value: any) => {
		formData.authorised_signatory_id = value;
	};

	const getSelectedAuthorisedSignatory = computed(() => {
		return clientAdminUserData.value.find((data: any) => data.value == formData.authorised_signatory_id);
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

	const onSubmit = (value: any) => {
		formData.action = value;
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
			const isValid = fields.value.every((field: any) => {
				return !field.supplierNameRequired && !field.supplierEmailRequired;
			});
			if (isValid) {
				submitEditData(value);
			}
		} else {
			setTimeout(() => {
				const firstErrorElement = document.querySelector(".error");
				if (firstErrorElement) {
					firstErrorElement.scrollIntoView({
						behavior: "smooth",
						block: "center",
					});
				}
			}, 250);
		}
	};

	const submitEditData = async (value: any) => {
		if (value === "on_hold") {
			loadingSave.value = true;
		} else {
			loading.value = true;
		}

		formData.budget = formData.budget.split(",").join("");
		// formData._method = "PATCH";
		const fd = new FormData();
		Object.keys(formData).forEach((field) => {
			fd.append(field, formData[field]);
		});

		if (fields.value.length) {
			fields.value.map((field: any, index: any) => {
				fd.append("supplier_name[]", field.supplier_name);
				fd.append("supplier_email[]", field.supplier_email);

				if (field.attach_quotation != "" && typeof field.attach_quotation == "string") {
					fd.append("file_path[]", field.attach_quotation_obj?.file_path);
					fd.append("attach_quotation[" + index + "]", " ");
					fd.append("file_name[]", field.attach_quotation_obj.file_name);
					fd.append("file_size[]", field.attach_quotation_obj.file_size);
				} else {
					fd.append("file_path[]", "");
					fd.append(
						"file_name[]",
						field.attach_quotation?.name
							? field.attach_quotation?.name
							: field.attach_quotation_obj.file_name
							? field.attach_quotation_obj.file_name
							: ""
					);
					fd.append(
						"file_size[]",
						field.attach_quotation?.size
							? field.attach_quotation?.size
							: field.attach_quotation_obj.file_size
							? field.attach_quotation_obj.file_size
							: ""
					);
					fd.append("attach_quotation[" + index + "]", field.attach_quotation);
				}
			});
		}

		try {
			const res: any = await useApiFetch(`/projects/${route.params?.id}/request`, {
				method: "POST",
				body: fd,
			});
			images.value = [];
			useToast("success", res.message);
			if (value === "on_hold") {
				navigateTo(
					localePath({
						path: route.fullPath,
						query: { tab: "request" },
					}),
					{ replace: true }
				);
				emit("disabledStatus", "request");
			} else {
				navigateTo(
					localePath({
						path: route.fullPath,
						query: { tab: "sourcing" },
					}),
					{ replace: true }
				);
				emit("disabledStatus", "sourcing");
			}

			// navigateTo(localePath("/project-pipeline/projects"));
		} catch {
			// images.value = [];
		} finally {
			loading.value = false;
			loadingSave.value = false;
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

	const identifiedSupplierChange = (value: any) => {
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

		if (value == 0) {
			fields.value = [];
			formData.justification = "";
			v$.value.justification.$reset();
		}
	};
</script>

<template>
	<el-form v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="flex flex-col relative">
		<div id="super-admin-form">
			<div class="bg-[#fff]">
				<div class="p-6">
					<div class="grid grid-cols-12 gap-5 lg:gap-6">
						<el-form-item
							class="col-span-12 md:col-span-6 2xl:col-span-4"
							:rules="[{ required: true }]"
							:label="$t('formLabels.is_urgent')"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.is_urgent')" :tooltip-content="$t('info.is_urgent')" :isShowLabel="false" />
							</template>
							<el-radio-group v-model="editData.is_urgent" disabled>
								<el-radio :label="1" size="large">Yes</el-radio>
								<el-radio :label="0" size="large">No</el-radio>
							</el-radio-group>
						</el-form-item>

						<el-form-item
							v-if="editData.is_urgent"
							:rules="[{ required: true }]"
							:label="$t('formLabels.information_why_is_urgent')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.information_why_is_urgent')"
									:tooltip-content="$t('info.information_why_is_urgent')"
									:isShowLabel="false"
								/>
							</template>
							<el-input v-model.trim="editData.information_why_is_urgent" name="information_why_is_urgent" type="text" disabled />
						</el-form-item>

						<el-form-item
							:rules="[{ required: true }]"
							:label="$t('formLabels.request_number')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.request_number')"
									:tooltip-content="$t('info.request_number')"
									:isShowLabel="false"
								/>
							</template>
							<el-input v-model.trim="editData.request_number" name="request_number" type="text" disabled />
						</el-form-item>

						<el-form-item
							:rules="[{ required: true }]"
							:label="$t('formLabels.project_number')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.project_number')"
									:tooltip-content="$t('info.project_number')"
									:isShowLabel="false"
								/>
							</template>
							<el-input v-model.trim="editData.project_number" name="project_number" type="text" disabled />
						</el-form-item>

						<el-form-item
							:rules="[{ required: true }]"
							:label="$t('formLabels.parent_entity')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.parent_entity')" :tooltip-content="$t('info.parent_entity')" :isShowLabel="false" />
							</template>
							<el-input v-model="editData.parent_entity" name="parent_entity" type="text" disabled />
						</el-form-item>

						<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0" :label="$t('formLabels.signing_entity')">
							<template #label>
								<BaseLabel
									:label="$t('formLabels.signing_entity')"
									:tooltip-content="$t('info.signing_entity')"
									:isShowLabel="false"
								/>
							</template>
							<BaseSelectDropdown
								:dropdown-option="subEntityData"
								:get-selected-country="getSelectedSubEntity"
								:number-only="false"
								disabled
								name="signing_entity_id"
							/>
						</el-form-item>

						<el-form-item
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							:rules="[{ required: true }]"
							:label="$t('formLabels.request_type')"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.request_type')" :tooltip-content="$t('info.request_type')" :isShowLabel="false" />
							</template>
							<BaseSelectDropdown
								:dropdown-option="requestType"
								:get-selected-country="getSelectedRequestType"
								:number-only="false"
								disabled
								name="request_type"
							/>
						</el-form-item>

						<el-form-item
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							:rules="[{ required: true }]"
							:label="$t('formLabels.requestor')"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.requestor')" :tooltip-content="$t('info.requestor')" :isShowLabel="false" />
							</template>
							<BaseSelectDropdown
								:dropdown-option="clientAdminUserData"
								:get-selected-country="getSelectedRequesterData"
								:number-only="false"
								disabled
								name="requester_id"
							/>
						</el-form-item>

						<el-form-item
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							:rules="[{ required: true }]"
							:label="$t('formLabels.request_owner')"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.request_owner')" :tooltip-content="$t('info.request_owner')" :isShowLabel="false" />
							</template>
							<BaseSelectDropdown
								:dropdown-option="clientAdminUserData"
								:get-selected-country="getSelectedRequestOwnerData"
								:number-only="false"
								disabled
								name="request_owner_id"
							/>
						</el-form-item>

						<el-form-item
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							:rules="[{ required: true }]"
							:label="$t('formLabels.project_owner')"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.project_owner')" :tooltip-content="$t('info.project_owner')" />
							</template>
							<BaseSelectDropdown
								:dropdown-option="clientAdminUserData"
								:get-selected-country="getSelectedProjectOwner"
								:number-only="false"
								disabled
							/>
						</el-form-item>

						<el-form-item
							:rules="[{ required: true }]"
							:label="$t('formLabels.project_title')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.project_title')" :tooltip-content="$t('info.request_title')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="formData.project_title"
								name="project_title"
								type="textarea"
								:class="{
									error: v$.project_title.$error,
								}"
								maxLength="255"
								:disabled="disabled"
								@change="v$.project_title.$touch"
							/>
							<span v-if="v$.project_title.$error" class="text-xs text-red-500 mt-2">{{ v$.project_title.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item
							:rules="[{ required: true }]"
							:label="$t('formLabels.requirement/needs')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.requirement/needs')"
									:tooltip-content="$t('info.requirement/needs')"
									:isShowLabel="false"
								/>
							</template>
							<el-input
								v-model="editData.requirement"
								name="requirement"
								type="text"
								:class="{
									error: v$.requirement.$error,
								}"
								maxLength="255"
								:disabled="disabled"
								@change="v$.requirement.$touch"
								@keypress="CharcAndNumber"
							/>
							<span v-if="v$.requirement.$error" class="text-xs text-red-500 mt-2">{{ v$.requirement.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item
							:label="$t('formLabels.category_level_1')"
							:rules="[{ required: true }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.category_level_1')"
									:tooltip-content="$t('info.category_level_1')"
									:isShowLabel="false"
								/>
							</template>
							<BaseSelectDropdown
								v-model="formData.category_level_1"
								:dropdown-option="categories"
								:get-selected-country="getSelectedCategory"
								:number-only="false"
								:isRemoteFilter="true"
								:name="'category_level_1'"
								:disabled="disabled"
								@selected-value="dropdownSelectedCategory"
								@remote-search="categoryDropdownSearch"
								@change="v$.category_level_1.$touch, handleCategoryChange"
								@dropdown-change="handleCategoryChange"
								:class="{
									error: v$.category_level_1.$error,
								}"
							/>
							<span v-if="v$.category_level_1.$error" class="text-xs text-red-500 mt-2">{{
								v$.category_level_1.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item
							:label="$t('formLabels.category_level_2')"
							:rules="[{ required: false }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<BaseSelectDropdown
								v-model="formData.category_level_2"
								:dropdown-option="subCategories"
								:number-only="false"
								:get-selected-country="getSelectedSubCategory"
								:disabled="disabled || !formData.category_level_1"
								name="category_level_2"
								:isRemoteFilter="true"
								@selected-value="dropdownSelectedSubCategory"
							/>
						</el-form-item>

						<el-form-item
							class="col-span-12 md:col-span-6 2xl:col-span-4"
							:rules="[{ required: true }]"
							:label="$t('formLabels.personal_data_involved')"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.personal_data_involved')"
									:tooltip-content="$t('info.personal_data_involved')"
									:isShowLabel="false"
								/>
							</template>
							<el-radio-group v-model="formData.personal_data_involved" :disabled="disabled">
								<el-radio :label="1" size="large">Yes</el-radio>
								<el-radio :label="0" size="large">No</el-radio>
							</el-radio-group>
						</el-form-item>

						<el-form-item
							:label="$t('formLabels.currency')"
							:rules="[{ required: true }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.currency')" :tooltip-content="$t('info.currency')" :isShowLabel="false" />
							</template>
							<BaseSelectDropdown
								v-model="formData.budget_currency"
								:dropdown-option="CurrencyData"
								:number-only="false"
								:disabled="disabled"
								name="budget_currency"
								:class="{
									error: v$.budget_currency.$error,
								}"
								@change="v$.budget_currency.$touch"
							/>
							<span v-if="v$.budget_currency.$error" class="text-xs text-red-500 mt-2 w-full">{{
								v$.budget_currency.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item
							:label="$t('formLabels.budget')"
							:rules="[{ required: true }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.budget')" :tooltip-content="$t('info.budget')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="formData.budget"
								name="budget"
								type="text"
								:class="{
									error: v$.budget.$error,
								}"
								maxLength="10"
								:disabled="disabled"
								@change="budgetChange"
								@keypress="NumbersOnly"
							/>
							<span v-if="v$.budget.$error" class="text-xs text-red-500 mt-2">{{ v$.budget.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item
							:rules="[{ required: true }]"
							:label="$t('formLabels.expected_date_of_completion')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.expected_date_of_completion')"
									:tooltip-content="$t('info.expected_date_of_completion')"
									:isShowLabel="false"
								/>
							</template>
							<el-date-picker
								v-model.trim="formData.expected_dates_of_completion"
								type="datetime"
								placeholder="DD/MM/YYYY HH:mm"
								format="DD/MM/YYYY hh:mm A"
								value-format="YYYY-MM-DD HH:mm:ss"
								time-format="hh:mm A"
								name="expected_dates_of_completion"
								:disabled="disabled"
								:class="{
									error: v$.expected_dates_of_completion.$error,
								}"
								:disabled-date="disabledDate"
								@change="v$.expected_dates_of_completion.$touch"
							/>

							<span v-if="v$.expected_dates_of_completion.$error" class="text-xs text-red-500 mt-2 w-full">{{
								v$.expected_dates_of_completion.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item
							class="col-span-12 md:col-span-6 2xl:col-span-4"
							:rules="[{ required: true }]"
							:label="$t('formLabels.do_you_have_identified_supplier')"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.do_you_have_identified_supplier')"
									:tooltip-content="$t('info.do_you_have_identified_supplier')"
									:isShowLabel="false"
								/>
							</template>
							<el-radio-group v-model="formData.have_you_identified_supplier" :disabled="disabled" @change="identifiedSupplierChange">
								<el-radio :label="1" size="large">Yes</el-radio>
								<el-radio :label="0" size="large">No</el-radio>
							</el-radio-group>
						</el-form-item>

						<el-form-item
							v-if="formData.have_you_identified_supplier"
							:label="$t('formLabels.justification')"
							:rules="[{ required: true }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.justification')" :tooltip-content="$t('info.justification')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="formData.justification"
								name="justification"
								type="textarea"
								:class="{
									error: v$.justification.$error,
								}"
								maxLength="255"
								:disabled="disabled"
								@change="budgetChange"
							/>
							<span v-if="v$.justification.$error" class="text-xs text-red-500 mt-2">{{ v$.justification.$errors[0].$message }}</span>
						</el-form-item>

						<template v-if="formData.have_you_identified_supplier">
							<div class="col-span-12">
								<div class="flex flex-wrap mb-4 gap-4 lg:gap-8 mt-5" v-for="(input, index) in fields" :key="index">
									<el-form-item
										class="mb-0 w-full sm:w-[calc(50%-8px)] lg:w-[calc(50%-16px)] xl:w-[calc(33.33%-32px)]"
										:label="$t('formLabels.supplier_name')"
										:rules="[{ required: true }]"
									>
										<template #label>
											<BaseLabel
												:label="$t('formLabels.supplier_name')"
												:tooltip-content="$t('info.name')"
												:isShowLabel="false"
											/>
										</template>
										<el-input
											type="text"
											label="First Name"
											:name="'fields' + index"
											v-model="fields[index].supplier_name"
											:disabled="disabled"
											maxLength="30"
											@blur="changeSupplierName(index)"
										/>
										<span
											v-if="fields[index].supplierNameRequired || fields.supplierNameRequired"
											class="text-xs text-red-500 mt-2"
											>{{ $t("formValidations.supplier_name") }}</span
										>
									</el-form-item>

									<el-form-item
										class="mb-0 w-full sm:w-[calc(50%-8px)] lg:w-[calc(50%-16px)] xl:w-[calc(33.33%-32px)]"
										:label="$t('formLabels.supplier_email')"
										:rules="[{ required: true }]"
									>
										<template #label>
											<BaseLabel
												:label="$t('formLabels.supplier_email')"
												:tooltip-content="$t('info.email')"
												:isShowLabel="false"
											/>
										</template>
										<el-input
											type="text"
											label="Last Name"
											:name="'fields' + index"
											v-model="fields[index].supplier_email"
											:disabled="disabled"
											maxLength="30"
											@blur="changeSupplierEmail(index)"
										/>
										<span
											v-if="fields[index].supplierEmailRequired || fields.supplierEmailRequired"
											class="text-xs text-red-500 mt-2"
										>
											{{ $t("formValidations.email_valid") }}
										</span>
									</el-form-item>

									<div class="mb-0 w-[calc(100%-46px)] lg:w-[calc(100%-62px)] xl:w-[calc(33.33%-62px)] 2xl:w-[calc(33.33%-72px)]">
										<div class="inline-flex items-center mr-5">
											<label id="gdpr" class="el-form-item__label pr-0">
												{{ $t("formLabels.attach_quotation") }}
												<!-- <span class="text-red-500">*</span> -->
											</label>
											<BaseLabel :tooltip-content="$t('info.attach_quotation')" :isShowLabel="false" />
										</div>
										<BaseImage
											:id="index.toString()"
											:limit="1"
											:name="'fields' + index"
											:disabled="disabled"
											:form-data="fields[index].attach_quotation_obj"
											@upload-file="imgOnChange"
											@handle-remove="handleRemove"
										/>
										<!-- <span v-if="v$.attach_quotation.$error" class="text-xs text-red-500 mt-2">{{
                                            v$.attach_quotation.$errors[0].$message
                                        }}</span> -->
									</div>

									<novok-button type="danger" class="flex-none btn-icon mt-6" @click="removeInput(index)" v-if="fields.length > 1">
										<i class="fa-solid fa-xmark"></i>
									</novok-button>
								</div>

								<novok-button
									:class="fields.length >= 5 ? 'disabled:opacity-50' : 'el-button--info'"
									@click="addInput"
									:disabled="disabled || fields.length >= 5"
									><i class="fa-solid fa-plus mr-2"></i> {{ $t("buttons.add") }}</novok-button
								>
							</div>
						</template>

						<el-form-item
							:label="$t('formLabels.business_unit')"
							:rules="[{ required: false }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<el-input
								v-model="formData.business_unit"
								name="business_unit"
								type="text"
								maxLength="255"
								:disabled="disabled"
								@keypress="CharcAndNumber"
							/>
						</el-form-item>

						<el-form-item
							:label="$t('formLabels.additional_information')"
							:rules="[{ required: false }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.additional_information')"
									:tooltip-content="$t('info.additional_information')"
									:isShowLabel="false"
								/>
							</template>
							<el-input
								v-model="formData.additional_information"
								name="additional_information"
								type="textarea"
								maxLength="255"
								:disabled="disabled"
							/>
						</el-form-item>

						<el-form-item
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							:rules="[{ required: true }]"
							:label="$t('formLabels.authorised_signatory')"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.authorised_signatory')"
									:tooltip-content="$t('info.authorised_signatory')"
									:isShowLabel="false"
								/>
							</template>
							<BaseSelectDropdown
								v-model="formData.authorised_signatory_id"
								:dropdown-option="clientAdminUserData"
								:get-selected-country="getSelectedAuthorisedSignatory"
								:number-only="false"
								:disabled="disabled"
								name="authorised_signatory_id"
								:class="{
									error: v$.authorised_signatory_id.$error,
								}"
								:isRemoteSearch="true"
								@remote-search="getClientAdminUserList"
								@selected-value="dropdownSelectedAuthorisedSignatory"
								@change="v$.authorised_signatory_id.$touch"
							/>

							<span v-if="v$.authorised_signatory_id.$error" class="text-xs text-red-500 mt-2">{{
								v$.authorised_signatory_id.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							:rules="[{ required: true }]"
							:label="$t('formLabels.budget_owner')"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.budget_owner')" :tooltip-content="$t('info.budget_owner')" :isShowLabel="false" />
							</template>
							<BaseSelectDropdown
								v-model="formData.budget_owner_id"
								:dropdown-option="clientAdminUserData"
								:get-selected-country="getSelectedBudgetOwner"
								:number-only="false"
								:disabled="disabled"
								name="budget_owner_id"
								:class="{
									error: v$.budget_owner_id.$error,
								}"
								:isRemoteSearch="true"
								@remote-search="getClientAdminUserList"
								@selected-value="dropdownSelectedBudgetOwner"
								@change="v$.budget_owner_id.$touch"
							/>

							<span v-if="v$.budget_owner_id.$error" class="text-xs text-red-500 mt-2">{{
								v$.budget_owner_id.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							:rules="[{ required: true }]"
							:label="$t('formLabels.activity_type')"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.activity_type')" :tooltip-content="$t('info.activity_type')" :isShowLabel="false" />
							</template>
							<BaseSelectDropdown
								v-model="formData.activity_type"
								:dropdown-option="activityType"
								:get-selected-country="getSelectedActivityType"
								:number-only="false"
								:disabled="disabled"
								name="activity_type"
								:class="{
									error: v$.activity_type.$error,
								}"
								:isRemoteSearch="true"
								@remote-search="getClientAdminUserList"
								@selected-value="dropdownSelectedActivityType"
								@change="v$.activity_type.$touch"
							/>

							<span v-if="v$.activity_type.$error" class="text-xs text-red-500 mt-2">{{ v$.activity_type.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item
							:label="$t('formLabels.comment_for_selected_activity_type')"
							:rules="[{ required: true }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.comment_for_selected_activity_type')"
									:tooltip-content="$t('info.comment_for_selected_activity_type')"
									:isShowLabel="false"
								/>
							</template>
							<el-input
								v-model="formData.comment_for_selected_activity_type"
								name="comment_for_selected_activity_type"
								type="textarea"
								:class="{
									error: v$.comment_for_selected_activity_type.$error,
								}"
								maxLength="255"
								:disabled="disabled"
								@change="v$.comment_for_selected_activity_type.$touch"
							/>
							<span v-if="v$.comment_for_selected_activity_type.$error" class="text-xs text-red-500 mt-2">{{
								v$.comment_for_selected_activity_type.$errors[0].$message
							}}</span>
						</el-form-item>

						<custom-input-add-edit
							ref="customFieldRef"
							:custom-data="customFields"
							module-name="request"
							:disabled="disabled"
							custom-class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							@update-data="(value) => Object.assign(customFields, value)"
						/>
					</div>
				</div>

				<div class="p-6 text-right">
					<novok-button class="btn-dark my-1" @click.prevent="navigateTo(localePath('/project-pipeline/projects'))"
						><span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span
						><i class="fa-solid fa-xmark sm:hidden"></i
					></novok-button>

					<novok-button
						class="my-1 hover:text-white"
						v-if="editData.status == 1 && editData.active_tab == 'request'"
						type="onHold"
						:loading="loadingSave"
						:disabled="loadingSave"
						@click.prevent="onSubmit('on_hold')"
						>{{ $t("buttons.on_hold") }}
					</novok-button>

					<novok-button
						v-if="editData.active_tab == 'request'"
						class="my-1 hover:text-white"
						type="sourcing"
						:loading="loading"
						:disabled="loading"
						@click.prevent="onSubmit('move_to_sourcing')"
						>{{ $t("buttons.move_to_sourcing") }}
					</novok-button>
				</div>
			</div>
		</div>
	</el-form>
</template>
