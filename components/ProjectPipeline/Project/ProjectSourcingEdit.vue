<script setup lang="ts">
	import { required, email, minLength, maxLength, helpers, requiredIf } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import { commaThreeDigitFormat } from "~/helper/common";
	import { CurrencyData, CurrencySymbole } from "~/helper/data";
	import { useProfileStore } from "~/store/profile";
	import { use } from "echarts/core";
	import moment from "moment";

	const emit = defineEmits(["disabledStatus"]);

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
	const editData = ref<any>({});
	const clientAdminUserData = ref<any>([]);
	const searchValue = ref("");
	const profileStore: any = useProfileStore();
	const localePath = useLocalePath();
	const { t } = useI18n();
	const route = useRoute();
	const signingEntity = ref("");
	const loading = ref(false);
	const loadingSave = ref(false);
	const loadingSend = ref(false);
	const selectedStakeholdersData = ref<any>([
		{
			value: "",
			label: "",
		},
	]);
	const filteredSuppliersList = ref<any>([]);
	const subEntityData = ref<any>([]);
	const stakeholdersDetails = ref<any>([]);
	const clientAdminUserDropdownData = ref<any>([]);
	const clientAdminUserAllData = ref<any>([]);

	const formData = reactive<any>({
		action: "",
		project_title: "",
		requirement: "",
		expected_dates_of_completion: "",
		start_date: "",
		target_completion_date: "",
		budget_currency: "",
		budget: "",
		approval_authority_id: "",
		role_of_approval_authority: "",
		spend_analysis: "",
		market_analysis: "",
		estimated_savings: "",
		estimated_savings_currency: "",
		benefits: "",
		route_selection_and_approach: "",
		document: "",
		delete_document_ids: "",
	});

	const fields = ref<any>([
		{
			stakeholder_id: "",
			stakeholder_name: "",
			role_of_stakeholder: "",
			communication_strategy: "",
			stakeholderNameRequired: false,
			jobTitleRequired: false,
			communicationStrategyRequired: false,
		},
	]);

	const copyEditData = ref<any>({
		delete_document_ids: [],
		documents: [],
	});
	const documents = ref<any>([]);
	const deleteIds = ref<any>([]);
	const documentRef = ref<any>(null);

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
			expected_dates_of_completion: {
				required: helpers.withMessage(t("formValidations.expected_date_of_completion"), required),
			},
			start_date: {
				required: helpers.withMessage(t("formValidations.start_date_of_sourcing"), required),
			},
			target_completion_date: {
				required: helpers.withMessage(t("formValidations.target_completion_date_of_sourcing"), required),
			},
			budget_currency: {
				required: helpers.withMessage(t("formValidations.currency"), required),
			},
			budget: {
				required: helpers.withMessage(t("formValidations.budget"), required),
			},
			approval_authority_id: {
				required: helpers.withMessage(t("formValidations.approval_authority"), required),
				name_validation: {
					$validator: PasteCharcAndNumWithSpace,
					$message: t("copyPasteValidations.charNum"),
				},
			},
			// role_of_approval_authority: {
			// 	required: helpers.withMessage(t("formValidations.role_of_approval_authority"), required),
			// 	name_validation: {
			// 		$validator: PasteCharcAndNumWithSpace,
			// 		$message: t("copyPasteValidations.charNum"),
			// 	},
			// },
			spend_analysis: {
				required: helpers.withMessage(t("formValidations.spend_analysis"), required),
			},
			market_analysis: {
				required: helpers.withMessage(t("formValidations.market_analysis"), required),
			},
			estimated_savings: {
				required: helpers.withMessage(t("formValidations.estimated_savings"), required),
			},
			benefits: {
				required: helpers.withMessage(t("formValidations.benefits"), required),
			},
			route_selection_and_approach: {
				required: helpers.withMessage(t("formValidations.agreed_project_type"), required),
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

	watch(
		() => props.editData,
		async (currData) => {
			if (props.activeTab === "sourcing") {
				Object.assign(editData.value, currData);

				Object.keys(formData).forEach((field: any) => {
					if (field !== "undefined" || field !== null) {
						formData[field] = currData[field];
					}
				});
				formData.estimated_savings_currency = currData.budget_currency;
				// formData.role_of_approval_authority = profileStore.$state.profileData.user_detail?.job_title;

				formData.budget = formData.budget
					?.toString()
					?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
					?.replace(/\.00$/, "");
				formData.estimated_savings = formData.estimated_savings
					?.toString()
					?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
					?.replace(/\.00$/, "");

				const tempArr: any = [];
				if (currData.documents?.length) {
					currData.documents?.forEach((field: any) => {
						tempArr.push({
							file_name: field.document_file_name,
							id: field.id,
							document_path: field.document_path,
							mime_type: field.document_extension,
						});
					});
				}

				copyEditData.value.documents = tempArr;
				if (currData.stakeholder_details?.length > 0) {
					fields.value = currData.stakeholder_details;
				}
				await getClientAdminUserList(searchValue.value);
				await getSubEntityData();
			}
		}
	);

	const selectedStakeholders = (index: any, key: any) => {
		const selectedData = fields.value[index];

		return {
			label: selectedData?.[key],
			value: selectedData?.[key],
		};
	};

	const getClientAdminUserList = async (value: any) => {
		searchValue.value = value;
		try {
			const res: any = await useApiFetch(`/project-ms/users?searchValue=${value}`, {
				method: "GET",
			});
			clientAdminUserAllData.value = res.data;

			clientAdminUserData.value = res.data?.map((data: any) => {
				return {
					label: data.full_name + " " + "(" + data.email + ")",
					value: data.id,
				};
			});
			clientAdminUserDropdownData.value = res.data?.map((data: any) => {
				return {
					label: data.full_name + " " + "(" + data.email + ")",
					value: data.id,
				};
			});
			filterStakeholders();
		} catch {}
	};

	const getSubEntityData = async () => {
		try {
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
		}
	};

	const getSelectedSubEntity = computed(() => {
		return subEntityData.value.find((data: any) => data.value === editData.value.signing_entity_id);
	});

	const disabledStartDate = (date: any) => {
		var d = new Date();
		d.setDate(d.getDate() - 1);
		if (d > date) {
			return true;
		}
	};

	const disabledDate = (date: any) => {
		const curretDate = moment(date).format();
		const newDate = formData.start_date ? moment(formData.start_date)?.format() : "";
		if (curretDate < newDate) {
			return true;
		} else {
			return false;
		}
	};

	const getSelectedRequestOwnerData = computed(() => {
		return clientAdminUserData.value.find((data: any) => data.value === editData.value.request_owner_id);
	});

	const getSelectedProjectOwner = computed(() => {
		return clientAdminUserData.value.find((data: any) => data.value === editData.value.project_owner_id);
	});

	const getSelectedApprovalAuthority = computed(() => {
		return clientAdminUserData.value.find((data: any) => data.value === formData.approval_authority_id);
	});

	const dropdownSelectedApprovalAuthority = (value: any) => {
		formData.approval_authority_id = value;
		findApprovalDataByID(value);
	};

	const findApprovalDataByID = (id: any) => {
		const data = clientAdminUserAllData.value.find((data: any) => data.id == id);
		formData.role_of_approval_authority = data.job_title || "";
	};

	const budgetChange = () => {
		let value = formData.budget.replace(/\D/g, "");
		value = value.slice(0, 10);
		if (value > 0) {
			v$.value.budget.$touch();
			formData.budget = commaThreeDigitFormat(value);
		}
	};

	const estimatedSavingsChange = () => {
		let value = formData.estimated_savings.replace(/\D/g, "");
		value = value.slice(0, 10);
		if (value > 0) {
			v$.value.estimated_savings.$touch();
			formData.estimated_savings = commaThreeDigitFormat(value);
		}
	};

	const sendApprovalAuthority = async () => {
		try {
			loadingSend.value = true;

			const res: any = await useApiFetch(`/projects/${route.params?.id}/send-for-approval`, {
				method: "POST",
				body: { stage: "sourcing" },
			});
			useToast("success", res.message);
			navigateTo(localePath("/project-pipeline/projects"));
		} catch {
		} finally {
			loadingSend.value = false;
		}
	};

	const onSubmit = async (value: any) => {
		documentRef.value.resetValidation();
		// if (value !== "save_as_draft") {
		fields.value.forEach((field: any) => {
			if (field.stakeholder_name === "") {
				field.stakeholderNameRequired = true;
			}
			if (field.role_of_stakeholder === "") {
				field.jobTitleRequired = true;
			}
			if (field.communication_strategy === "") {
				field.communicationStrategyRequired = true;
			}
		});

		v$.value.$validate();
		if (!v$.value.$error) {
			const isValid = fields.value.every((field: any) => {
				return !field.stakeholderNameRequired && !field.jobTitleRequired && !field.communicationStrategyRequired;
			});
			if (isValid) {
				if (value === "send_for_approval") {
					await submitEditData("save_as_draft", "send_for_approval");
				} else {
					submitEditData(value, "");
				}
			}
		} else {
			setTimeout(() => {
				const firstErrorElement = document?.querySelector(".error");
				if (firstErrorElement) {
					firstErrorElement.scrollIntoView({
						behavior: "smooth",
						block: "center",
					});
				}
			}, 250);
		}
		// } else {
		// 	submitEditData(value);
		// }
	};

	const submitEditData = async (value: any, data: any) => {
		formData.action = value;
		formData.budget = formData.budget?.split(",")?.join("") || "";
		formData.estimated_savings = formData.estimated_savings?.split(",")?.join("") || "";

		const fd = new FormData();
		Object.keys(formData).forEach((field) => {
			if (field === "document") {
				documents?.value?.forEach((value: any) => {
					fd.append("document" + "[]", value);
				});
			} else if (field === "delete_document_ids") {
				deleteIds.value.forEach((value: any) => {
					fd.append("delete_document_ids" + "[]", value);
				});
			} else {
				fd.append(field, formData[field]);
			}
		});

		if (fields.value.length) {
			fields.value.map((field: any, index: any) => {
				fd.append("stakeholder_id[]", field.stakeholder_id);
				fd.append("role_of_stakeholder[]", field.role_of_stakeholder);
				fd.append("communication_strategy[]", field.communication_strategy);
			});
		}

		try {
			if (data === "send_for_approval") {
				loadingSend.value = true;
			} else if (value === "save_as_draft") {
				loadingSave.value = true;
			} else {
				loading.value = true;
			}
			const res: any = await useApiFetch(`/projects/${route.params?.id}/sourcing`, {
				method: "POST",
				body: fd,
			});
			useToast("success", res.message);

			// navigateTo(localePath("/project-pipeline/projects"));
			if (value === "save_as_draft") {
				navigateTo(
					localePath({
						path: route.fullPath,
						query: { tab: "sourcing" },
					}),
					{ replace: true }
				);
				emit("disabledStatus", "sourcing");
			} else if (value === "move_to_selection") {
				navigateTo(
					localePath({
						path: route.fullPath,
						query: { tab: "selection" },
					}),
					{ replace: true }
				);
				emit("disabledStatus", "selection");
			} else {
				navigateTo(
					localePath({
						path: route.fullPath,
						query: { tab: "signing" },
					}),
					{ replace: true }
				);
				emit("disabledStatus", "signing");
			}
			if (data === "send_for_approval") {
				await sendApprovalAuthority();
			}
		} catch {
		} finally {
			loading.value = false;
			loadingSave.value = false;
			loadingSend.value = false;
			documents.value = [];
			deleteIds.value = [];
		}
	};

	const filterStakeholders = () => {
		const supplierIdsToRemove = new Set(fields.value.map((item: any) => item.stakeholder_id));

		let filteredArr: any = [];

		// Add disabled true
		clientAdminUserDropdownData.value.map((item: any) => {
			if (supplierIdsToRemove.has(item.value)) {
				item.disabled = true;
			} else {
				item.disabled = false;
			}
			filteredArr.push(item);
		});

		filteredSuppliersList.value = filteredArr;
	};

	const changeJobTitle = (index: any) => {
		if (fields.value[index].role_of_stakeholder === "") {
			fields.value[index].jobTitleRequired = true;
		} else {
			fields.value[index].jobTitleRequired = false;
		}
	};

	const changeCommunicationStrategy = (index: any) => {
		if (fields.value[index].communication_strategy === "") {
			fields.value[index].communicationStrategyRequired = true;
		} else {
			fields.value[index].communicationStrategyRequired = false;
		}
	};

	const findStakeholdersById = (id: any) => {
		return clientAdminUserAllData.value.find((data: any) => data.id == id);
	};

	const handleFieldStakeholderValue = (value: any, index: any) => {
		const Obj = findStakeholdersById(value);
		fields.value[index].stakeholder_name = value;
		fields.value[index].stakeholder_id = Obj.id;
		fields.value[index].role_of_stakeholder = Obj.job_title;
		filterStakeholders();
		if (fields.value[index].stakeholder_name === "") {
			fields.value[index].stakeholderNameRequired = true;
		} else {
			fields.value[index].stakeholderNameRequired = false;
		}

		if (fields.value[index].role_of_stakeholder === "") {
			fields.value[index].jobTitleRequired = true;
		} else {
			fields.value[index].jobTitleRequired = false;
		}
	};
	const removeInput = (index: any) => {
		fields.value.splice(index, 1);
		filterStakeholders();
	};

	const addInput = () => {
		if (fields.value.length > 0 && fields.value.length < 5) {
			fields.value.push({
				stakeholder_id: "",
				stakeholder_name: "",
				role_of_stakeholder: "",
				communication_strategy: "",
				stakeholderNameRequired: false,
				jobTitleRequired: false,
				communicationStrategyRequired: false,
			});

			selectedStakeholdersData.value.push({
				value: "",
				label: "",
			});
			filterStakeholders();
		}
	};

	const budgetCurrencyChange = (value: any) => {
		v$.value.budget_currency.$touch();
		formData.estimated_savings_currency = value;
	};

	const handleRemove = (value: any) => {
		documents.value[value.id] = "";
		deleteIds.value.push(value.name);
		documents.value = documents.value?.filter((data: any) => data.uid !== value.file.uid);
	};

	const MultiImgOnChange = (value: any) => {
		// copyFormData?.value.other_certificate.push(value.file);
		documents?.value.push(value.file);
	};

	const startDateChange = () => {
		v$.value.start_date.$touch();
		formData.target_completion_date = "";
		v$.value.target_completion_date.$reset();
	};
</script>

<template>
	<el-form v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="flex flex-col relative">
		<div id="super-admin-form">
			<div class="bg-[#fff]">
				<div class="p-6">
					<div class="grid grid-cols-12 gap-5 lg:gap-6">
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
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							:rules="[{ required: true }]"
							:label="$t('formLabels.project_owner')"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.project_owner')" :tooltip-content="$t('info.project_owner')" :isShowLabel="false" />
							</template>
							<BaseSelectDropdown
								:dropdown-option="clientAdminUserData"
								:get-selected-country="getSelectedProjectOwner"
								:number-only="false"
								disabled
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
								v-model="formData.requirement"
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
							/>
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
								:disabled-date="disabledStartDate"
								@change="v$.expected_dates_of_completion.$touch"
							/>

							<span v-if="v$.expected_dates_of_completion.$error" class="text-xs text-red-500 mt-2 w-full">{{
								v$.expected_dates_of_completion.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item
							:rules="[{ required: true }]"
							:label="$t('formLabels.start_date_of_sourcing')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.start_date_of_sourcing')"
									:tooltip-content="$t('info.start_date_of_sourcing')"
									:isShowLabel="false"
								/>
							</template>
							<el-date-picker
								v-model.trim="formData.start_date"
								type="date"
								placeholder="DD/MM/YYYY"
								format="DD/MM/YYYY"
								value-format="YYYY-MM-DD"
								name="start_date"
								:disabled="disabled"
								:class="{
									error: v$.start_date.$error,
								}"
								:disabled-date="disabledStartDate"
								@change="startDateChange"
							/>

							<span v-if="v$.start_date.$error" class="text-xs text-red-500 mt-2 w-full">{{ v$.start_date.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item
							:rules="[{ required: true }]"
							:label="$t('formLabels.target_completion_date_of_sourcing')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.target_completion_date_of_sourcing')"
									:tooltip-content="$t('info.target_completion_date_of_sourcing')"
									:isShowLabel="false"
								/>
							</template>
							<el-date-picker
								v-model.trim="formData.target_completion_date"
								type="date"
								placeholder="DD/MM/YYYY"
								format="DD/MM/YYYY"
								value-format="YYYY-MM-DD"
								name="target_completion_date"
								:disabled="disabled"
								:class="{
									error: v$.target_completion_date.$error,
								}"
								:disabled-date="disabledDate"
								@change="v$.target_completion_date.$touch"
							/>

							<span v-if="v$.target_completion_date.$error" class="text-xs text-red-500 mt-2 w-full">{{
								v$.target_completion_date.$errors[0].$message
							}}</span>
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
								@change="budgetCurrencyChange"
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
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							:rules="[{ required: true }]"
							:label="$t('formLabels.approval_authority')"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.approval_authority')" :tooltip-content="$t('info.approval_authority')" />
							</template>
							<BaseSelectDropdown
								v-model="formData.approval_authority_id"
								:dropdown-option="clientAdminUserData"
								:get-selected-country="getSelectedApprovalAuthority"
								:number-only="false"
								:disabled="disabled"
								name="approval_authority_id"
								:class="{
									error: v$.approval_authority_id.$error,
								}"
								:isRemoteSearch="true"
								@remote-search="getClientAdminUserList"
								@selected-value="dropdownSelectedApprovalAuthority"
								@change="v$.approval_authority_id.$touch"
							/>

							<span v-if="v$.approval_authority_id.$error" class="text-xs text-red-500 mt-2">{{
								v$.approval_authority_id.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item
							:label="$t('formLabels.role_of_approval_authority')"
							:rules="[{ required: false }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.role_of_approval_authority')"
									:tooltip-content="$t('info.role_of_approval_authority')"
									:isShowLabel="false"
								/>
							</template>
							<el-input
								v-model="formData.role_of_approval_authority"
								name="role_of_approval_authority"
								type="text"
								maxLength="255"
								disabled
							/>
						</el-form-item>

						<el-form-item
							:label="$t('formLabels.spend_analysis')"
							:rules="[{ required: true }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.spend_analysis')" :tooltip-content="$t('info.spend_analysis')" />
							</template>
							<el-input
								v-model="formData.spend_analysis"
								name="spend_analysis"
								type="textarea"
								maxLength="255"
								:disabled="disabled"
								:class="{
									error: v$.spend_analysis.$error,
								}"
								@change="v$.spend_analysis.$touch"
							/>
							<span v-if="v$.spend_analysis.$error" class="text-xs text-red-500 mt-2">{{ v$.spend_analysis.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item
							:label="$t('formLabels.market_analysis')"
							:rules="[{ required: true }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.market_analysis')" :tooltip-content="$t('info.market_analysis')" />
							</template>
							<el-input
								v-model="formData.market_analysis"
								name="market_analysis"
								type="textarea"
								maxLength="255"
								:disabled="disabled"
								:class="{
									error: v$.market_analysis.$error,
								}"
								@change="v$.market_analysis.$touch"
							/>
							<span v-if="v$.market_analysis.$error" class="text-xs text-red-500 mt-2">{{
								v$.market_analysis.$errors[0].$message
							}}</span>
						</el-form-item>

						<div class="flex items-start col-span-12 md:col-span-6 2xl:col-span-4 label-upper-dropdown">
							<div class="w-24 flex-initial mt-6">
								<el-input
									v-model="CurrencySymbole[formData.estimated_savings_currency]"
									name="estimated_savings"
									type="text"
									disabled
								/>
							</div>
							<el-form-item :label="$t('formLabels.estimated_savings')" :rules="[{ required: true }]" class="ml-4 mb-0 w-full mt-6">
								<template #label>
									<BaseLabel
										:label="$t('formLabels.estimated_savings')"
										:tooltip-content="$t('info.estimated_savings')"
										:isShowLabel="false"
									/>
								</template>
								<el-input
									v-model="formData.estimated_savings"
									name="estimated_savings"
									type="text"
									:class="{
										error: v$.estimated_savings.$error,
									}"
									maxLength="10"
									:disabled="disabled"
									@change="estimatedSavingsChange"
									@keypress="NumbersOnly"
								/>
								<span v-if="v$.estimated_savings.$error" class="text-xs text-red-500 mt-2">{{
									v$.estimated_savings.$errors[0].$message
								}}</span>
							</el-form-item>
						</div>

						<el-form-item
							:label="$t('formLabels.benefits')"
							:rules="[{ required: true }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.benefits')" :tooltip-content="$t('info.benefits')" />
							</template>
							<el-input
								v-model="formData.benefits"
								name="benefits"
								type="textarea"
								maxLength="255"
								:disabled="disabled"
								:class="{
									error: v$.benefits.$error,
								}"
								@change="v$.benefits.$touch"
							/>
							<span v-if="v$.benefits.$error" class="text-xs text-red-500 mt-2">{{ v$.benefits.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item
							:label="$t('formLabels.agreed_project_type')"
							:rules="[{ required: true }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.agreed_project_type')" :tooltip-content="$t('info.agreed_project_type')" />
							</template>
							<el-input
								v-model="formData.route_selection_and_approach"
								name="route_selection_and_approach"
								type="textarea"
								maxLength="255"
								:disabled="disabled"
								:class="{
									error: v$.route_selection_and_approach.$error,
								}"
								@change="v$.route_selection_and_approach.$touch"
							/>
							<span v-if="v$.route_selection_and_approach.$error" class="text-xs text-red-500 mt-2">{{
								v$.route_selection_and_approach.$errors[0].$message
							}}</span>
						</el-form-item>

						<div class="col-span-12">
							<label class="font-bold text-xl">{{ $t("formLabels.add_stakeholder_details") }}</label>
							<BaseLabel :tooltip-content="$t('info.add_stakeholder_details')" />

							<div
								class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-4 gap-4 lg:gap-8 mt-5"
								v-for="(input, index) in fields"
								:key="index"
							>
								<el-form-item class="mb-0 w-full" :label="$t('formLabels.stakeholder_name')" :rules="[{ required: true }]">
									<template #label>
										<BaseLabel
											:label="$t('formLabels.stakeholder_name')"
											:tooltip-content="$t('info.stakeholder_name')"
											:isShowLabel="false"
										/>
									</template>
									<BaseSelectDropdown
										:name="'fields' + index"
										:dropdown-option="clientAdminUserDropdownData"
										:number-only="false"
										:get-selected-country="selectedStakeholders(index, 'stakeholder_id')"
										:disabled="disabled"
										:isRemoteFilter="true"
										:class="{
											error: fields[index].stakeholderNameRequired || fields.stakeholderNameRequired,
										}"
										@remote-search="getClientAdminUserList"
										@change="handleFieldStakeholderValue($event, index)"
									/>
									<span
										v-if="fields[index].stakeholderNameRequired || fields.stakeholderNameRequired"
										class="text-xs text-red-500 mt-2"
										>{{ $t("formValidations.stakeholder_name") }}</span
									>
								</el-form-item>

								<el-form-item class="mb-0 w-full" :label="$t('formLabels.job_title')" :rules="[{ required: true }]">
									<template #label>
										<BaseLabel :label="$t('formLabels.job_title')" :tooltip-content="$t('info.job_title')" :isShowLabel="false" />
									</template>
									<el-input
										type="text"
										label="Job Title"
										:name="'fields' + index"
										v-model="fields[index].role_of_stakeholder"
										:disabled="disabled"
										maxLength="50"
										:class="{
											error: fields[index].jobTitleRequired || fields.jobTitleRequired,
										}"
										@blur="changeJobTitle(index)"
									/>
									<span v-if="fields[index].jobTitleRequired || fields.jobTitleRequired" class="text-xs text-red-500 mt-2">
										{{ $t("formValidations.job_title") }}
									</span>
								</el-form-item>

								<div class="flex sm:col-span-2 lg:col-span-1">
									<el-form-item class="mb-0 w-full" :label="$t('formLabels.communication_Strategy')" :rules="[{ required: true }]">
										<template #label>
											<BaseLabel
												:label="$t('formLabels.communication_Strategy')"
												:tooltip-content="$t('info.communication_Strategy')"
												:isShowLabel="false"
											/>
										</template>
										<el-input
											type="text"
											label="Communication Strategy"
											:name="'fields' + index"
											v-model="fields[index].communication_strategy"
											:disabled="disabled"
											maxLength="50"
											:class="{
												error: fields[index].communicationStrategyRequired || fields.communicationStrategyRequired,
											}"
											@blur="changeCommunicationStrategy(index)"
										/>
										<span
											v-if="fields[index].communicationStrategyRequired || fields.communicationStrategyRequired"
											class="text-xs text-red-500 mt-2"
										>
											{{ $t("formValidations.communication_Strategy") }}
										</span>
									</el-form-item>

									<novok-button
										type="danger"
										class="flex-none mt-6 w-[40px] h-[40px] ml-4 lg:ml-8"
										@click="removeInput(index)"
										v-if="fields.length > 1 && !disabled"
									>
										<i class="fa-solid fa-xmark"></i>
									</novok-button>
								</div>
							</div>

							<novok-button
								v-if="!disabled"
								:class="fields.length >= 5 ? 'btn-dark' : 'el-button--info'"
								@click="addInput"
								:disabled="disabled || fields.length >= 5"
								><i class="fa-solid fa-plus mr-2"></i> {{ $t("buttons.add") }}</novok-button
							>
						</div>

						<div class="col-span-12">
							<div class="inline-flex items-center mr-5">
								<label id="upload_documents" class="el-form-item__label pr-0">{{ $t("formLabels.upload_documents") }}</label>
								<BaseLabel :tooltip-content="$t('info.upload_sourcing_documents')" />
							</div>
							<BaseMultipleImage
								:id="'document'"
								ref="documentRef"
								:limit="5"
								:form-data="copyEditData.documents"
								:disabled="disabled"
								@upload-file="MultiImgOnChange"
								@handle-remove="handleRemove"
							/>
						</div>
					</div>
				</div>

				<div class="p-6 text-right">
					<el-tag v-if="editData.approval_authority_status == 1" class="my-2 mx-3 text-info bg-white text-xl border-none"
						><span class="hidden sm:inline-block"
							>{{ $t("formLabels.approval_authority_status") }} : {{ $t("buttons.sent_for_approval") }}</span
						></el-tag
					>

					<el-tag v-if="editData.approval_authority_status == 2" class="my-2 mx-3 text-info bg-white text-xl border-none"
						><span class="hidden sm:inline-block"
							>{{ $t("formLabels.approval_authority_status") }} : {{ $t("buttons.approved") }}</span
						></el-tag
					>

					<novok-button class="btn-dark my-1" @click.prevent="navigateTo(localePath('/project-pipeline/projects'))"
						><span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span
						><i class="fa-solid fa-xmark sm:hidden"></i
					></novok-button>

					<novok-button
						v-if="editData.approval_authority_status == 0 || editData.approval_authority_status == 3"
						class="my-1"
						type="info"
						:loading="loadingSend"
						:disabled="loadingSend"
						@click.prevent="onSubmit('send_for_approval')"
						>{{ $t("buttons.send_to_approval_authority") }}
					</novok-button>

					<novok-button
						v-if="editData.approval_authority_status == 0 || editData.approval_authority_status == 3"
						class="my-1"
						type="info"
						:loading="loadingSave"
						:disabled="loadingSave"
						@click.prevent="onSubmit('save_as_draft')"
						>{{ $t("buttons.save_draft") }}
					</novok-button>

					<novok-button
						v-if="
							editData.active_tab === 'sourcing' &&
							(editData.activity_type == 4 || editData.activity_type == 5 || editData.activity_type == 6)
						"
						class="my-1"
						type="selection"
						:loading="loading"
						:class="editData.approval_authority_status !== 2 ? 'disabled:opacity-50' : 'el-button--info'"
						:disabled="loading || editData.approval_authority_status !== 2"
						@click.prevent="onSubmit('move_to_selection')"
						>{{ $t("buttons.move_to_selection") }}
					</novok-button>

					<novok-button
						v-if="
							editData.active_tab === 'sourcing' &&
							(editData.activity_type == 1 || editData.activity_type == 2 || editData.activity_type == 3)
						"
						class="my-1"
						type="signing"
						:loading="loading"
						:class="editData.approval_authority_status !== 2 ? 'disabled:opacity-50' : 'el-button--info'"
						:disabled="loading || editData.approval_authority_status !== 2"
						@click.prevent="onSubmit('move_to_signing')"
						>{{ $t("buttons.move_to_signing") }}
					</novok-button>
				</div>
			</div>
		</div>
	</el-form>
</template>
