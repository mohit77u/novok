<script setup lang="ts">
	import { quotationTenderReminderData, QTactivityType, CurrencyData, QTdocuments, QTdocumentsFileName } from "~/helper/data";
	import { useProfileStore } from "~/store/profile";
	import { useVuelidate } from "@vuelidate/core";
	import { required, email, minLength, maxLength, helpers, requiredIf } from "@vuelidate/validators";

	let formData = ref<any>({
		qt_code: "",
		project_code: "",
		project_owner: "",
		sub_entity_name: "",
		parent_entity: "",
		authoriser_id: "",
		title: "",
		activity_type: "",
		country_to_serve: [],
		category_level_1: "",
		category_level_2: "",
		project_summary: "",
		is_this_public_tender: 0,
		estimated_contract_value_currency: "GBP",
		estimated_contract_value: "",
		is_hide_estimated_contract_value_from_supplier: 0,
		open_date: "",
		open_time: "",
		clarification_open_date: "",
		clarification_open_time: "",
		clarification_close_date: "",
		clarification_close_time: "",
		close_date: "",
		close_time: "",
		is_reminder: 0,
		reminder_send_to: [],
		reminder_from_days: "",
		is_allow_all_documents_in_single_document: 0,
		is_hide_evaluation_matrix_from_supplier: 0,
		business_continuity_policy: 0,
		anti_corruption_and_bribary_policy: 0,
		environmental_policy: 0,
		financial_reports: 0,
		modern_slavery_policy: 0,
		social_values: 0,
		timezone: "Europe/London",
		attach_document: "",
		general_terms_and_conditions: "",
		sow_or_sor: "",
		pricing_matrix: "",
		evaluation_matrix: "",
		attach_document_file_name: "",
		sow_or_sor_file_name: "",
		general_terms_and_conditions_file_name: "",
		pricing_matrix_file_name: "",
		evaluation_matrix_file_name: "",
	});
	const localePath = useLocalePath();
	const profileStore = useProfileStore();
	const { t } = useI18n();
	const route = useRoute();
	const categories = ref<any>([]);
	const subCategories = ref<any>([]);
	const supplierData = ref<any>([]);
	const fullscreenLoading = ref<any>(false);
	const dialogVisible = ref(false);
	const document_id = ref("");
	const loading = ref(false);
	const loadingSave = ref(false);
	const customFields = reactive([]);
	const customFieldRef = ref<any>(null);

	const copyEditData = ref<any>({
		attach_document: "",
		general_terms_and_conditions: "",
		sow_or_sor: "",
		pricing_matrix: "",
		evaluation_matrix: "",
		business_continuity_policy: "",
		anti_corruption_and_bribary_policy: "",
		environmental_policy: "",
		financial_reports: "",
		modern_slavery_policy: "",
		social_values: "",
	});
	const copyFormData = ref<any>([]);
	const deleteDocumentIds = ref<any>([]);
	const attechDocument = ref<any>([]);
	const addData = reactive<any>({
		attach_document: "",
		general_terms_and_conditions: "",
		sow_or_sor: "",
		pricing_matrix: "",
		evaluation_matrix: "",
		business_continuity_policy: "",
		anti_corruption_and_bribary_policy: "",
		environmental_policy: "",
		financial_reports: "",
		modern_slavery_policy: "",
		social_values: "",
		submission_status: 0,
		delete_document_ids: "",
	});

	const rules = computed(() => {
		return {
			evaluation_matrix: {
				requiredIf: helpers.withMessage(
					t("formValidations.evaluation_matrix"),
					requiredIf(!formData.value.is_hide_evaluation_matrix_from_supplier)
				),
			},
			// general_terms_and_conditions: {
			// 	requiredIf: helpers.withMessage(
			// 		t("formValidations.general_terms_and_conditions"),
			// 		requiredIf(!formData.value.is_allow_all_documents_in_single_document)
			// 	),
			// },
			// sow_or_sor: {
			// 	requiredIf: helpers.withMessage(t("formValidations.sow_or_sor"), requiredIf(!formData.value.is_allow_all_documents_in_single_document)),
			// },
			// pricing_matrix: {
			// 	requiredIf: helpers.withMessage(
			// 		t("formValidations.pricing_matrix"),
			// 		requiredIf(!formData.value.is_allow_all_documents_in_single_document)
			// 	),
			// },
			// evaluation_matrix: {
			// 	requiredIf: helpers.withMessage(
			// 		t("formValidations.evaluation_matrix"),
			// 		requiredIf(!formData.value.is_hide_evaluation_matrix_from_supplier)
			// 	),
			// },
			// business_continuity_policy: {
			// 	requiredIf: helpers.withMessage(t("formValidations.business_continuity_policy"), requiredIf(formData.value.business_continuity_policy)),
			// },
			// anti_corruption_and_bribary_policy: {
			// 	requiredIf: helpers.withMessage(
			// 		t("formValidations.anti_corruption_and_bribary_policy"),
			// 		requiredIf(formData.value.anti_corruption_and_bribary_policy)
			// 	),
			// },
			// environmental_policy: {
			// 	requiredIf: helpers.withMessage(t("formValidations.environmental_policy"), requiredIf(formData.value.environmental_policy)),
			// },
			// financial_reports: {
			// 	requiredIf: helpers.withMessage(t("formValidations.financial_reports"), requiredIf(formData.value.financial_reports)),
			// },
			// modern_slavery_policy: {
			// 	requiredIf: helpers.withMessage(t("formValidations.modern_slavery_policy"), requiredIf(formData.value.modern_slavery_policy)),
			// },
			// social_values: {
			// 	requiredIf: helpers.withMessage(t("formValidations.social_values"), requiredIf(formData.value.social_values)),
			// },
		};
	});

	const v$ = useVuelidate(rules, addData);

	onMounted(async () => {
		await getEditData();
		await getCategories();
	});

	const getAuthData = computed(() => {
		formData.value.timezone = profileStore.profileData.user_detail?.timezone || "Europe/London";
		return profileStore.profileData.user_detail;
	});

	const getEditData = async () => {
		fullscreenLoading.value = true;
		try {
			const res: any = await useApiFetch(`/tender-quotations/${route.params?.id}?timezone=${formData.value.timezone}`, {
				method: "GET",
			});

			// supplierAllData.value = res.data.data;
			let updatedFormData: any = {};
			Object.keys(formData.value).forEach((field: any) => {
				updatedFormData[field] = res.data?.tender?.[field];
			});

			Object.assign(customFields, res.data?.custom_primary_details);

			updatedFormData["country_to_serve"] = res.data?.tender?.country_to_serve?.split(",") || "";
			updatedFormData["reminder_send_to"] = res.data?.tender?.reminder_send_to?.split(",") || "";
			updatedFormData["authoriser_id"] = res.data?.tender?.authoriser?.full_name + " " + "(" + res.data?.tender?.authoriser?.email + ")";
			updatedFormData["sub_entity_name"] = res.data?.tender?.signing_entity?.sub_entity_name;
			formData.value = updatedFormData;

			if (formData.value.reminder_send_to?.length) {
				let newArr: any = [];
				formData.value.reminder_send_to?.map((data: any) => {
					let reminderValue: any = {};
					if (data?.includes("1")) {
						reminderValue.label = "Supplier Admin";
						reminderValue.value = 1;
					}
					if (data?.includes("2")) {
						reminderValue.label = "Project Owner";
						reminderValue.value = 2;
					}
					if (data?.includes("3")) {
						reminderValue.label = "Project Creator (Client Admin)";
						reminderValue.value = 3;
					}
					newArr.push(reminderValue);
					formData.value.reminder_send_to = newArr;
				});
			}

			Object.keys(addData).forEach((field: any) => {
				addData[field] = res.data?.[field] || "";
			});

			res.data?.tender?.documents?.forEach((document: any) => {
				formData.value[QTdocuments[document.document_type]] = document.document_path;
				formData.value[QTdocumentsFileName[document.document_type]] = document.document_file_name;
			});

			res.data?.documents?.forEach((document: any) => {
				addData[QTdocuments[document.document_type]] = document.document_path;
				copyEditData.value[QTdocuments[document.document_type]] = { ...document, file_name: document.document_file_name };
			});

			formData.value.business_continuity_policy = formData.value.business_continuity_policy == 1 ? true : false;
			formData.value.anti_corruption_and_bribary_policy = formData.value.anti_corruption_and_bribary_policy == 1 ? true : false;
			formData.value.environmental_policy = formData.value.environmental_policy == 1 ? true : false;
			formData.value.financial_reports = formData.value.financial_reports == 1 ? true : false;
			formData.value.modern_slavery_policy = formData.value.modern_slavery_policy == 1 ? true : false;
			formData.value.social_values = formData.value.social_values == 1 ? true : false;

			copyFormData.value = JSON.parse(JSON.stringify(addData));
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const getCategories = async () => {
		try {
			const res: any = await useApiFetch(`/qt/categories?perPage=15&sortColumn=&sortOrder=&searchValue=&parent_id=0`, {
				method: "GET",
			});
			categories.value = res.data?.data?.map((data: any) => {
				return {
					label: data.category_name,
					value: data.id,
				};
			});
			getSubCategories();
		} catch {}
	};

	const getSubCategories = async (val = 0) => {
		try {
			let CatValue = val ? val : formData.value.category_level_1;

			const res: any = await useApiFetch(`/qt/categories?parent_id=${CatValue}&perPage=15&searchValue=`, {
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

	const getSelectedActivityType = computed(() => {
		return QTactivityType.map((data: any) => data.value === formData.value.activity_type);
	});

	const getSelectedCategory = computed(() => {
		return categories.value.map((data: any) => data.id === formData.value.category_level_1);
	});

	const getSelectedSubCategory = computed(() => {
		return subCategories.value.map((data: any) => data.id === formData.value.category_level_2);
	});

	const getSelectedReminderData = computed(() => {
		const data = formData.value.reminder_send_to?.map((data: any) => {
			return {
				label: data.label,
				value: data.value,
			};
		});
		return data;
	});

	const imgOnChange = (value: any) => {
		addData[value.id] = value.file;
	};

	const handleRemove = (value: any) => {
		if (value.name !== "") {
			addData[value.id] = "";
			// const deleteId = deleteFile.value[value.id];
			// addData[deleteId] = 1;
			const updatedObj = copyEditData.value[value.id];
			deleteDocumentIds.value.push(updatedObj?.id);
		}
	};

	const onSubmit = (value: any) => {
		addData.submission_status = value;
		if (value === 2) {
			v$.value.$validate();
			const isValidCustomFields = customFieldRef.value.isValidate();

			if (!v$.value.$error && isValidCustomFields) {
				submitData(value);
			} else {
				setTimeout(() => {
					const firstErrorElement = document.querySelector(".error");
					if (firstErrorElement) {
						firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
					}
				}, 250);
			}
		} else {
			customFieldRef.value.updateData();
			submitData(value);
		}
	};

	const submitData = async (value: any) => {
		try {
			if (value == 1) {
				loading.value = true;
			} else {
				loadingSave.value = true;
			}
			addData._method = "PATCH";

			const updatedData = { ...addData };

			if (copyFormData.value.attach_document === addData.attach_document) {
				updatedData.attach_document = "";
			}
			if (copyFormData.value.general_terms_and_conditions === addData.general_terms_and_conditions) {
				updatedData.general_terms_and_conditions = "";
			}
			if (copyFormData.value.sow_or_sor === addData.sow_or_sor) {
				updatedData.sow_or_sor = "";
			}
			if (copyFormData.value.pricing_matrix === addData.pricing_matrix) {
				updatedData.pricing_matrix = "";
			}
			if (copyFormData.value.evaluation_matrix === addData.evaluation_matrix) {
				updatedData.evaluation_matrix = "";
			}
			if (copyFormData.value.business_continuity_policy === addData.business_continuity_policy) {
				updatedData.business_continuity_policy = "";
			}
			if (copyFormData.value.anti_corruption_and_bribary_policy === addData.anti_corruption_and_bribary_policy) {
				updatedData.anti_corruption_and_bribary_policy = "";
			}
			if (copyFormData.value.environmental_policy === addData.environmental_policy) {
				updatedData.environmental_policy = "";
			}
			if (copyFormData.value.financial_reports === addData.financial_reports) {
				updatedData.financial_reports = "";
			}
			if (copyFormData.value.modern_slavery_policy === addData.modern_slavery_policy) {
				updatedData.modern_slavery_policy = "";
			}
			if (copyFormData.value.social_values === addData.social_values) {
				updatedData.social_values = "";
			}

			const fd = new FormData();
			Object.keys(updatedData).forEach((field) => {
				if (field === "delete_document_ids") {
					deleteDocumentIds.value?.forEach((value: any) => {
						fd.append("delete_document_ids[]", value);
					});
				} else {
					fd.append(field, updatedData?.[field]);
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

			const res: any = await useApiFetch(`/tender-quotations/${route.params?.id}`, {
				method: "POST",
				body: fd,
			});

			useToast("success", res.message);
			navigateTo(localePath("/quotations-tender/supplier-q-t"));
		} catch {
		} finally {
			loading.value = false;
			loadingSave.value = false;
		}
	};
</script>

<template>
	<div>
		<el-alert :title="$t('formLabels.single_img_description')" type="warning" :closable="false" class="mb-5" :show-icon="true" />

		<el-form v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="flex flex-col relative">
			<div id="super-admin-form">
				<div class="bg-[#fff]">
					<div class="p-6">
						<div class="grid md:grid-cols-12 gap-5 lg:gap-6">
							<el-form-item
								:rules="[{ required: true }]"
								:label="$t('formLabels.tender_quotation_code')"
								class="md:col-span-6 lg:col-span-6 mb-0"
							>
								<template #label>
									<BaseLabel :label="$t('formLabels.tender_quotation_code')" :tooltip-content="$t('info.tender_quotation_code')" />
								</template>

								<el-input v-model.trim="formData.qt_code" name="qt_code" type="text" disabled />
							</el-form-item>

							<el-form-item
								:rules="[{ required: true }]"
								:label="$t('formLabels.project_number')"
								class="md:col-span-6 lg:col-span-6 mb-0"
							>
								<template #label>
									<BaseLabel :label="$t('formLabels.project_number')" :tooltip-content="$t('info.project_number')" />
								</template>
								<el-input v-model="formData.project_code" name="project_code" disabled />
							</el-form-item>

							<el-form-item
								:rules="[{ required: true }]"
								:label="$t('formLabels.project_owner')"
								class="md:col-span-6 lg:col-span-6 mb-0"
							>
								<template #label>
									<BaseLabel :label="$t('formLabels.project_owner')" :tooltip-content="$t('info.project_owner')" />
								</template>

								<el-input v-model.trim="formData.project_owner" name="project_owner" type="text" disabled />
							</el-form-item>

							<el-form-item :label="$t('formLabels.parent_entity')" class="md:col-span-6 lg:col-span-6 mb-0">
								<template #label>
									<BaseLabel :label="$t('formLabels.parent_entity')" :tooltip-content="$t('info.parent_entity')" />
								</template>

								<el-input v-model.trim="formData.parent_entity" name="parent_entity" type="text" disabled />
							</el-form-item>

							<el-form-item :label="$t('formLabels.signing_entity')" class="md:col-span-6 lg:col-span-6 mb-0">
								<template #label>
									<BaseLabel :label="$t('formLabels.signing_entity')" :tooltip-content="$t('info.signing_entity')" />
								</template>

								<el-input v-model.trim="formData.sub_entity_name" name="sub_entity_name" type="text" disabled />
							</el-form-item>

							<el-form-item :label="$t('formLabels.qt_authoriser')" class="md:col-span-6 lg:col-span-6 mb-0">
								<template #label>
									<BaseLabel :label="$t('formLabels.qt_authoriser')" :tooltip-content="$t('info.qt_authoriser')" />
								</template>

								<el-input v-model.trim="formData.authoriser_id" name="sub_entity_name" type="text" disabled />
							</el-form-item>

							<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.title')" class="md:col-span-6 lg:col-span-6 mb-0">
								<template #label>
									<BaseLabel :label="$t('formLabels.title')" :tooltip-content="$t('info.title')" />
								</template>

								<el-input v-model="formData.title" name="title" type="text" disabled />
							</el-form-item>

							<el-form-item
								:rules="[{ required: true }]"
								:label="$t('formLabels.activity_type')"
								class="md:col-span-6 lg:col-span-6 mb-0"
							>
								<template #label>
									<BaseLabel :label="$t('formLabels.activity_type')" :tooltip-content="$t('info.activity_type')" />
								</template>

								<BaseSelectDropdown
									v-model="formData.activity_type"
									name="activity_type"
									:dropdown-option="QTactivityType"
									:get-selected-country="getSelectedActivityType"
									:number-only="false"
									disabled
								/>
							</el-form-item>

							<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.country')" class="md:col-span-6 lg:col-span-6 mb-0">
								<template #label>
									<BaseLabel :label="$t('formLabels.country')" :tooltip-content="$t('info.country')" />
								</template>

								<el-input v-model="formData.country_to_serve" disabled size="small" name="country_to_serve" />
							</el-form-item>

							<el-form-item
								:rules="[{ required: true }]"
								:label="$t('formLabels.project_summary')"
								class="md:col-span-6 lg:col-span-6 mb-0"
							>
								<template #label>
									<BaseLabel :label="$t('formLabels.project_summary')" :tooltip-content="$t('info.project_summary')" />
								</template>

								<el-input v-model="formData.project_summary" name="project_summary" type="text" disabled />
							</el-form-item>

							<el-form-item
								:rules="[{ required: true }]"
								:label="$t('formLabels.category_level_1')"
								class="md:col-span-6 lg:col-span-6 mb-0"
							>
								<template #label>
									<BaseLabel :label="$t('formLabels.category_level_1')" :tooltip-content="$t('info.category_level_1')" />
								</template>
								<BaseSelectDropdown
									v-model="formData.category_level_1"
									:dropdown-option="categories"
									:get-selected-country="getSelectedCategory"
									:name="'category_level_1'"
									disabled
								/>
							</el-form-item>

							<el-form-item :label="$t('formLabels.category_level_2')" class="md:col-span-6 lg:col-span-6 mb-0">
								<template #label>
									<BaseLabel :label="$t('formLabels.category_level_2')" :tooltip-content="$t('info.category_level_2')" />
								</template>
								<BaseSelectDropdown
									v-model="formData.category_level_2"
									:dropdown-option="subCategories"
									:get-selected-country="getSelectedSubCategory"
									disabled
									name="category_level_2"
								/>
							</el-form-item>

							<div class="flex flex-wrap items-center md:col-span-6 lg:col-span-6 mb-0">
								<div class="flex items-center w-full">
									<span class="text-dark font-bold flex items-center">
										<span>{{ $t("formLabels.is_public_tender") }}</span>
										<span class="text-red-400">*</span>
									</span>
									<BaseLabel :tooltip-content="$t('info.is_public_tender')" />
								</div>
								<el-radio-group v-model="formData.is_this_public_tender" disabled>
									<el-radio :label="1" size="large">{{ $t("formLabels.yes") }}</el-radio>
									<el-radio :label="0" size="large">{{ $t("formLabels.no") }}</el-radio>
								</el-radio-group>
							</div>

							<el-form-item class="md:col-span-6 lg:col-span-6 mb-0" :label="$t('formLabels.currency')">
								<template #label>
									<BaseLabel :label="$t('formLabels.currency')" :tooltip-content="$t('info.currency')" />
								</template>
								<BaseSelectDropdown
									v-model="formData.estimated_contract_value_currency"
									name="currency"
									:dropdown-option="CurrencyData"
									:number-only="false"
									disabled
								/>
							</el-form-item>

							<el-form-item
								v-if="!formData.is_hide_estimated_contract_value_from_supplier"
								class="md:col-span-6 lg:col-span-6 mb-0"
								:label="$t('formLabels.estimated_contract_value')"
							>
								<template #label>
									<BaseLabel :label="$t('formLabels.estimated_contract_value')" :tooltip-content="$t('info.value_of_contract')" />
								</template>
								<el-input v-model.trim="formData.estimated_contract_value" type="text" name="estimated_contract_value" disabled />
							</el-form-item>

							<el-form-item :rules="[{ required: true }]" class="md:col-span-6 lg:col-span-6 mb-0" :label="$t('formLabels.open_date')">
								<template #label>
									<BaseLabel :label="$t('formLabels.open_date')" :tooltip-content="$t('info.open_date')" />
								</template>
								<el-date-picker
									v-model.trim="formData.open_date"
									type="date"
									placeholder="DD/MM/YYYY"
									format="DD/MM/YYYY"
									name="open_date"
									disabled
								/>
							</el-form-item>

							<el-form-item :rules="[{ required: true }]" class="md:col-span-6 lg:col-span-6 mb-0" :label="$t('formLabels.open_time')">
								<template #label>
									<BaseLabel :label="$t('formLabels.open_time')" :tooltip-content="$t('info.open_time')" />
								</template>
								<el-time-picker
									v-model.trim="formData.open_time"
									name="open_time"
									format="hh:mm A"
									value-format="HH:mm"
									placeholder="hh A"
									disabled
								/>
							</el-form-item>

							<el-form-item :rules="[{ required: true }]" class="md:col-span-6 lg:col-span-6 mb-0" :label="$t('formLabels.close_date')">
								<template #label>
									<BaseLabel :label="$t('formLabels.close_date')" :tooltip-content="$t('info.close_date')" />
								</template>
								<el-date-picker
									v-model.trim="formData.close_date"
									type="date"
									placeholder="DD/MM/YYYY"
									format="DD/MM/YYYY"
									name="close_date"
									disabled
								/>
							</el-form-item>

							<el-form-item :rules="[{ required: true }]" class="md:col-span-6 lg:col-span-6 mb-0" :label="$t('formLabels.close_time')">
								<template #label>
									<BaseLabel :label="$t('formLabels.close_time')" :tooltip-content="$t('info.close_time')" />
								</template>
								<el-time-picker
									v-model.trim="formData.close_time"
									name="close_time"
									format="hh:mm A"
									placeholder="hh A"
									value-format="HH:mm"
									disabled
								/>
							</el-form-item>

							<el-form-item
								:rules="[{ required: true }]"
								class="md:col-span-6 lg:col-span-6 mb-0"
								:label="$t('formLabels.clarification_open_date')"
							>
								<template #label>
									<BaseLabel
										:label="$t('formLabels.clarification_open_date')"
										:tooltip-content="$t('info.clarification_open_date')"
									/>
								</template>
								<el-date-picker
									v-model.trim="formData.clarification_open_date"
									type="date"
									placeholder="DD/MM/YYYY"
									format="DD/MM/YYYY"
									name="clarification_open_date"
									disabled
								/>
							</el-form-item>

							<el-form-item
								:rules="[{ required: true }]"
								class="md:col-span-6 lg:col-span-6 mb-0"
								:label="$t('formLabels.clarification_open_time')"
							>
								<template #label>
									<BaseLabel
										:label="$t('formLabels.clarification_open_time')"
										:tooltip-content="$t('info.clarification_open_time')"
									/>
								</template>
								<el-time-picker
									v-model.trim="formData.clarification_open_time"
									name="clarification_open_time"
									format="hh:mm A"
									value-format="HH:mm"
									placeholder="hh A"
									disabled
								/>
							</el-form-item>

							<el-form-item
								:rules="[{ required: true }]"
								class="md:col-span-6 lg:col-span-6 mb-0"
								:label="$t('formLabels.clarification_close_date')"
							>
								<template #label>
									<BaseLabel
										:label="$t('formLabels.clarification_close_date')"
										:tooltip-content="$t('info.clarification_close_date')"
									/>
								</template>
								<el-date-picker
									v-model.trim="formData.clarification_close_date"
									type="date"
									placeholder="DD/MM/YYYY"
									format="DD/MM/YYYY"
									name="clarification_close_date"
									disabled
								/>
							</el-form-item>

							<el-form-item
								:rules="[{ required: true }]"
								class="md:col-span-6 lg:col-span-6 mb-0"
								:label="$t('formLabels.clarification_close_time')"
							>
								<template #label>
									<BaseLabel
										:label="$t('formLabels.clarification_close_time')"
										:tooltip-content="$t('info.clarification_close_time')"
									/>
								</template>
								<el-time-picker
									v-model.trim="formData.clarification_close_time"
									name="clarification_close_time"
									format="hh:mm A"
									value-format="HH:mm"
									placeholder="HH A"
									disabled
								/>
							</el-form-item>

							<div class="flex flex-wrap items-center md:col-span-6 lg:col-span-6 mb-0">
								<div class="inline-flex items-center w-full">
									<span class="text-dark font-bold block">{{ $t("formLabels.reminders_set") }}</span>
									<span class="text-red-400">*</span>
									<BaseLabel :tooltip-content="$t('info.reminders_set')" />
								</div>
								<el-radio-group v-model="formData.is_reminder" class="flex w-full items-center" disabled>
									<el-radio :label="1" size="large">{{ $t("formLabels.yes") }}</el-radio>
									<el-radio :label="0" size="large">{{ $t("formLabels.no") }}</el-radio>
								</el-radio-group>
							</div>

							<div v-if="formData.is_reminder" class="md:col-span-6 lg:col-span-6 mb-0">
								<el-form-item class="" :rules="[{ required: true }]" :label="$t('formLabels.reminder_send_to')">
									<template #label>
										<BaseLabel :label="$t('formLabels.reminder_send_to')" :tooltip-content="$t('info.reminder_send_to')" />
									</template>
									<BaseMultiSelectDropdown
										v-model="formData.reminder_send_to"
										disabled
										:dropdown-option="quotationTenderReminderData"
										:get-selected-client="getSelectedReminderData"
									/>
								</el-form-item>
							</div>

							<el-form-item
								v-if="formData.is_reminder"
								class="md:col-span-6 lg:col-span-6 mb-0"
								:rules="[{ required: true }]"
								:label="$t('formLabels.reminder_from_days')"
							>
								<template #label>
									<BaseLabel :label="$t('formLabels.reminder_from_days')" :tooltip-content="$t('info.reminder_from_days')" />
								</template>
								<el-input v-model.trim="formData.reminder_from_days" type="text" name="reminder_from_days" disabled />
							</el-form-item>

							<!-- <div class="flex flex-wrap items-center md:col-span-6 lg:col-span-6 mb-0">
								<div class="inline-flex items-center">
									<span class="text-dark font-bold block">{{ $t("formLabels.allow_one_document") }}</span>
									<span class="text-red-400">*</span>
									<BaseLabel :tooltip-content="$t('info.allow_one_document')" />
								</div>
								<el-radio-group
									v-model="formData.is_allow_all_documents_in_single_document"
									class="flex w-full"
									:disabled="disabled"
									@change="allFileAllowChange"
								>
									<el-radio :label="1" size="large">{{ $t("formLabels.yes") }}</el-radio>
									<el-radio :label="0" size="large">{{ $t("formLabels.no") }}</el-radio>
								</el-radio-group>
							</div> -->

							<div v-if="formData.is_allow_all_documents_in_single_document" class="w-full md:col-span-6 lg:col-span-6 mb-0">
								<div class="inline-flex items-center mr-5">
									<label class="el-form-item__label pr-0">{{ $t("formLabels.attach_document") }}</label>
									<BaseLabel :tooltip-content="$t('info.attach_document')" />
								</div>
								<BaseImage
									:id="'attach_document'"
									ref="attachDocumentRef"
									v-model="addData.attach_document"
									:limit="1"
									:formData="copyEditData.attach_document"
									:disabled="disabled"
									:isShowDescription="false"
									name="attach_document"
									@upload-file="imgOnChange"
									@handle-remove="handleRemove"
								/>

								<a v-if="formData.attach_document_file_name" :href="formData.attach_document"
									>{{ $t("formLabels.dowmload_template") }}:
									<span class="text-primary underline">{{ formData.attach_document_file_name }}</span></a
								>
							</div>

							<div class="w-full md:col-span-6 lg:col-span-6 mb-0">
								<div class="inline-flex items-center mr-5">
									<label class="el-form-item__label pr-0">{{ $t("formLabels.terms_n_conditions") }}</label>
									<BaseLabel :tooltip-content="$t('info.terms_n_conditions')" />
								</div>
								<BaseImage
									:id="'general_terms_and_conditions'"
									ref="generalTermsAndConditionsRef"
									v-model="addData.general_terms_and_conditions"
									:limit="1"
									:formData="copyEditData.general_terms_and_conditions"
									:disabled="disabled"
									:isShowDescription="false"
									name="general_terms_and_conditions"
									@upload-file="imgOnChange"
									@handle-remove="handleRemove"
								/>

								<a
									target="_blank"
									v-if="formData.general_terms_and_conditions_file_name"
									:href="formData.general_terms_and_conditions"
									>{{ $t("formLabels.dowmload_template") }}:
									<span class="text-primary underline">{{ formData.general_terms_and_conditions_file_name }}</span></a
								>
							</div>

							<div class="w-full md:col-span-6 lg:col-span-6 mb-0">
								<div class="inline-flex items-center mr-5">
									<label class="el-form-item__label pr-0">{{ $t("formLabels.sow_sor_documents") }}</label>
									<BaseLabel :tooltip-content="$t('info.sow_sor_documents')" />
								</div>
								<BaseImage
									:id="'sow_or_sor'"
									ref="soworsorRef"
									v-model="addData.sow_or_sor"
									:limit="1"
									:formData="copyEditData.sow_or_sor"
									:disabled="disabled"
									:isShowDescription="false"
									name="sow_or_sor"
									@upload-file="imgOnChange"
									@handle-remove="handleRemove"
								/>

								<a target="_blank" v-if="formData.sow_or_sor_file_name" :href="formData.sow_or_sor"
									>{{ $t("formLabels.dowmload_template") }}:
									<span class="text-primary underline">{{ formData.sow_or_sor_file_name }}</span></a
								>
							</div>

							<div class="w-full md:col-span-6 lg:col-span-6 mb-0">
								<div class="inline-flex items-center mr-5">
									<label class="el-form-item__label pr-0">{{ $t("formLabels.pricing_matrix") }}</label>
									<BaseLabel :tooltip-content="$t('info.pricing_matrix')" />
								</div>
								<BaseImage
									:id="'pricing_matrix'"
									ref="pricingmatrixRef"
									v-model="addData.pricing_matrix"
									:limit="1"
									:formData="copyEditData.pricing_matrix"
									:disabled="disabled"
									name="pricing_matrix"
									:isShowDescription="false"
									@upload-file="imgOnChange"
									@handle-remove="handleRemove"
								/>

								<a target="_blank" v-if="formData.pricing_matrix_file_name" :href="formData.pricing_matrix"
									>{{ $t("formLabels.dowmload_template") }}:
									<span class="text-primary underline">{{ formData.pricing_matrix_file_name }}</span></a
								>
							</div>

							<div v-if="!formData.is_hide_evaluation_matrix_from_supplier" class="w-full md:col-span-6 lg:col-span-6 mb-0">
								<div class="inline-flex items-center mr-5">
									<label class="el-form-item__label pr-0">{{ $t("formLabels.evaluation_matrix") }}</label>
									<span class="text-red-400">*</span>
									<BaseLabel :tooltip-content="$t('info.evaluation_matrix')" />
								</div>
								<BaseImage
									:id="'evaluation_matrix'"
									ref="evaluationmatrixRef"
									v-model="addData.evaluation_matrix"
									:limit="1"
									:formData="copyEditData.evaluation_matrix"
									:disabled="disabled"
									name="evaluation_matrix"
									:class="{
										error: v$.evaluation_matrix.$error,
									}"
									:isShowDescription="false"
									:isRequired="v$.evaluation_matrix.$error"
									@upload-file="imgOnChange"
									@handle-remove="handleRemove"
									@change="v$.evaluation_matrix.$touch"
								/>
								<div>
									<span v-if="v$.evaluation_matrix.$error" class="block text-xs text-red-500 mt-2 w-full">{{
										v$.evaluation_matrix.$errors[0].$message
									}}</span>
									<a target="_blank" v-if="formData.evaluation_matrix_file_name" :href="formData.evaluation_matrix"
										>{{ $t("formLabels.dowmload_template") }}:
										<span class="text-primary underline">{{ formData.evaluation_matrix_file_name }}</span></a
									>
								</div>
							</div>

							<div v-if="formData.business_continuity_policy" class="w-full md:col-span-6 lg:col-span-6 mb-0">
								<div class="inline-flex items-center mr-5">
									<label class="el-form-item__label pr-0">{{ $t("formLabels.business_continuity_policy") }}</label>
									<BaseLabel :tooltip-content="$t('info.business_continuity_policy')" />
								</div>
								<BaseImage
									:id="'business_continuity_policy'"
									ref="businesscontinuitypolicyRef"
									v-model="addData.business_continuity_policy"
									:limit="1"
									:formData="copyEditData.business_continuity_policy"
									:disabled="disabled"
									:isShowDescription="false"
									name="business_continuity_policy"
									@upload-file="imgOnChange"
									@handle-remove="handleRemove"
								/>
							</div>

							<div v-if="formData.anti_corruption_and_bribary_policy" class="w-full md:col-span-6 lg:col-span-6 mb-0">
								<div class="inline-flex items-center mr-5">
									<label class="el-form-item__label pr-0">{{ $t("formLabels.anti_corruption_and_bribary_policy") }}</label>
									<BaseLabel :tooltip-content="$t('info.anti_corruption_and_bribary_policy')" />
								</div>
								<BaseImage
									:id="'anti_corruption_and_bribary_policy'"
									ref="anticorruptionandbribarypolicyRef"
									v-model="addData.anti_corruption_and_bribary_policy"
									:limit="1"
									:formData="copyEditData.anti_corruption_and_bribary_policy"
									:disabled="disabled"
									:isShowDescription="false"
									name="anti_corruption_and_bribary_policy"
									@upload-file="imgOnChange"
									@handle-remove="handleRemove"
								/>
								<!-- <span v-if="v$.anti_corruption_and_bribary_policy.$error" class="block text-xs text-red-500 mt-2 w-full">{{
									v$.anti_corruption_and_bribary_policy.$errors[0].$message
								}}</span> -->
							</div>

							<div v-if="formData.environmental_policy" class="w-full md:col-span-6 lg:col-span-6 mb-0">
								<div class="inline-flex items-center mr-5">
									<label class="el-form-item__label pr-0">{{ $t("formLabels.environmental_policy") }}</label>
									<BaseLabel :tooltip-content="$t('info.environmental_policy')" />
								</div>
								<BaseImage
									:id="'environmental_policy'"
									ref="environmentalpolicyRef"
									v-model="addData.environmental_policy"
									:limit="1"
									:formData="copyEditData.environmental_policy"
									:disabled="disabled"
									:isShowDescription="false"
									name="environmental_policy"
									@upload-file="imgOnChange"
									@handle-remove="handleRemove"
								/>
								<!-- <span v-if="v$.environmental_policy.$error" class="block text-xs text-red-500 mt-2 w-full">{{
									v$.environmental_policy.$errors[0].$message
								}}</span> -->
							</div>

							<div v-if="formData.financial_reports" class="w-full md:col-span-6 lg:col-span-6 mb-0">
								<div class="inline-flex items-center mr-5">
									<label class="el-form-item__label pr-0">{{ $t("formLabels.financial_reports") }}</label>
									<BaseLabel :tooltip-content="$t('info.financial_reports')" />
								</div>
								<BaseImage
									:id="'financial_reports'"
									ref="financialreportsRef"
									v-model="addData.financial_reports"
									:limit="1"
									:formData="copyEditData.financial_reports"
									:disabled="disabled"
									:isShowDescription="false"
									@upload-file="imgOnChange"
									@handle-remove="handleRemove"
								/>
								<!-- <span v-if="v$.financial_reports.$error" class="block text-xs text-red-500 mt-2 w-full">{{
									v$.financial_reports.$errors[0].$message
								}}</span> -->
							</div>

							<div v-if="formData.modern_slavery_policy" class="w-full md:col-span-6 lg:col-span-6 mb-0">
								<div class="inline-flex items-center mr-5">
									<label class="el-form-item__label pr-0">{{ $t("formLabels.modern_slavery_policy") }}</label>
									<BaseLabel :tooltip-content="$t('info.modern_slavery_policy')" />
								</div>
								<BaseImage
									:id="'modern_slavery_policy'"
									ref="modernslaverypolicyRef"
									v-model="addData.modern_slavery_policy"
									:limit="1"
									:formData="copyEditData.modern_slavery_policy"
									:disabled="disabled"
									:isShowDescription="false"
									name="modern_slavery_policy"
									@upload-file="imgOnChange"
									@handle-remove="handleRemove"
								/>
								<!-- <span v-if="v$.modern_slavery_policy.$error" class="block text-xs text-red-500 mt-2 w-full">{{
									v$.modern_slavery_policy.$errors[0].$message
								}}</span> -->
							</div>

							<div v-if="formData.social_values" class="w-full md:col-span-6 lg:col-span-6 mb-0">
								<div class="inline-flex items-center mr-5">
									<label class="el-form-item__label pr-0">{{ $t("formLabels.social_values") }}</label>
									<BaseLabel :tooltip-content="$t('info.social_values')" />
								</div>
								<BaseImage
									:id="'social_values'"
									ref="socialvaluesRef"
									v-model="addData.social_values"
									:limit="1"
									:formData="copyEditData.social_values"
									:disabled="disabled"
									:isShowDescription="false"
									name="social_values"
									@upload-file="imgOnChange"
									@handle-remove="handleRemove"
								/>
								<!-- <span v-if="v$.social_values.$error" class="block text-xs text-red-500 mt-2 w-full">{{
									v$.social_values.$errors[0].$message
								}}</span> -->
							</div>

							<custom-input-add-edit
								ref="customFieldRef"
								:custom-data="customFields"
								module-name="q-and-t-supplier"
								:disabled="disabled"
								custom-class="w-full md:col-span-6 lg:col-span-6 mb-0"
								@update-data="(value) => Object.assign(customFields, value)"
							/>

							<!-- <el-form-item
								:rules="[{ required: false }]"
								class="md:col-span-6 lg:col-span-6 mb-0"
								:label="$t('formLabels.supporting_documents_required')"
							>
								<template #label>
									<BaseLabel
										:label="$t('formLabels.supporting_documents_required')"
										:tooltip-content="$t('info.supporting_documents_required')"
									/>
								</template>

								
								<el-checkbox
									v-model="formData.business_continuity_policy"
									:checked="formData.business_continuity_policy || formData.business_continuity_policy == 1 ? true : false"
									class="flex items-center"
									:label="t('formLabels.business_continuity_policy')"
								>
									{{ $t("formLabels.business_continuity_policy") }}
								</el-checkbox>
								<el-checkbox
									v-model="formData.anti_corruption_and_bribary_policy"
									class="flex items-center"
									:label="t('formLabels.anti_corruption_and_bribary_policy')"
								>
									{{ $t("formLabels.anti_corruption_and_bribary_policy") }}
								</el-checkbox>
								<el-checkbox
									v-model="formData.environmental_policy"
									class="flex items-center"
									:label="t('formLabels.environmental_policy')"
								>
									{{ $t("formLabels.environmental_policy") }}
								</el-checkbox>
								<el-checkbox
									v-model="formData.financial_reports"
									class="flex items-center"
									:label="t('formLabels.financial_reports')"
								>
									{{ $t("formLabels.financial_reports") }}
								</el-checkbox>
								<el-checkbox
									v-model="formData.modern_slavery_policy"
									class="flex items-center"
									:label="t('formLabels.modern_slavery_policy')"
								>
									{{ $t("formLabels.modern_slavery_policy") }}
								</el-checkbox>
								<el-checkbox v-model="formData.social_values" class="flex items-center" :label="t('formLabels.social_values')">
									{{ $t("formLabels.social_values") }}
								</el-checkbox>
							
							</el-form-item> -->
						</div>

						<div class="pt-4 text-right">
							<novok-button class="btn-dark my-1" @click.prevent="navigateTo(localePath('/quotations-tender/supplier-q-t'))">
								<span class="hidden sm:inline-block"> {{ $t("buttons.cancel") }}</span
								><i class="fa-solid fa-xmark sm:hidden"></i>
							</novok-button>

							<novok-button
								v-if="!disabled"
								class="my-1"
								type="info"
								:loading="loading"
								:disabled="loading"
								@click.prevent="onSubmit(1)"
								>{{ $t("buttons.save_draft") }}
							</novok-button>

							<novok-button
								v-if="!disabled"
								class="my-1"
								type="info"
								:loading="loadingSave"
								:disabled="loadingSave"
								@click.prevent="onSubmit(2)"
								>{{ $t("buttons.save") }}
							</novok-button>
						</div>
					</div>
				</div>
			</div>
		</el-form>
	</div>
</template>
