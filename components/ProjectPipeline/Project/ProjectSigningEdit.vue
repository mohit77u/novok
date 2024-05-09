<script setup lang="ts">
	import { required, email, minLength, maxLength, helpers, requiredIf } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import { commaThreeDigitFormat } from "~/helper/common";
	import { CurrencyData, CurrencySymbole } from "~/helper/data";
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
	const localePath = useLocalePath();
	const { t } = useI18n();
	const route = useRoute();
	const loading = ref(false);
	const loadingSave = ref(false);
	const loadingSend = ref(false);

	const formData = reactive<any>({
		project_title: "",
		requirement: "",
		start_date: "",
		target_completion_date: "",
		budget_currency: "",
		budget: "",
		suppliers_ability_to_deliver_requirements: "",
		selection_rationale: "",
		preferred_supplier_due_diligence: "",
		implementation: "",
		actual_savings_currency: "",
		actual_savings: "",
		contract_id: "",
		total_contract_term: "",
		value_of_contract_currency: "",
		value_of_contract: "",
		document: "",
		delete_document_ids: "",
	});

	const fields = ref<any>([
		{
			id: "",
			stakeholder_id: "",
			stakeholder_name: "",
			role_of_stakeholder: "",
			communication_strategy: "",
			approval_provided: "",
			approvalProvidedRequired: false,
		},
	]);

	const copyEditData = ref<any>({
		delete_document_ids: [],
		documents: [],
	});
	const documents = ref<any>([]);
	const deleteIds = ref<any>([]);
	const contractNumbers = ref<any>([]);
	const contractData = ref<any>([]);
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

			start_date: {
				required: helpers.withMessage(t("formValidations.start_date_of_signing"), required),
			},
			target_completion_date: {
				required: helpers.withMessage(t("formValidations.target_completion_date_of_signing"), required),
			},
			budget_currency: {
				required: helpers.withMessage(t("formValidations.currency"), required),
			},
			budget: {
				required: helpers.withMessage(t("formValidations.budget"), required),
			},

			suppliers_ability_to_deliver_requirements: {
				required: helpers.withMessage(t("formValidations.suppliers_ability_to_deliver_requirements"), required),
			},
			selection_rationale: {
				required: helpers.withMessage(t("formValidations.selection_rationale"), required),
			},
			implementation: {
				required: helpers.withMessage(t("formValidations.implementation_transition_plans"), required),
			},
			actual_savings: {
				required: helpers.withMessage(t("formValidations.actual_savings"), required),
			},
			preferred_supplier_due_diligence: {
				required: helpers.withMessage(t("formValidations.preferred_supplier_due_diligence"), required),
			},
			contract_id: {
				required: helpers.withMessage(t("formValidations.contract_number"), required),
			},
			total_contract_term: {
				required: helpers.withMessage(t("formValidations.total_contract_term"), required),
			},
			value_of_contract: {
				required: helpers.withMessage(t("formValidations.value_of_contract"), required),
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

	watch(
		() => props.editData,
		async (currData) => {
			if (currData) {
				if (props.activeTab === "signing") {
					Object.assign(editData.value, currData);
					editData.value.contract_number = currData.contract?.contract_number;

					Object.keys(formData).forEach((field: any) => {
						if (field !== "undefined" || field !== null) {
							formData[field] = currData[field];
						}
					});
					formData.budget = formData.budget
						?.toString()
						?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
						?.replace(/\.00$/, "");
					formData.actual_savings = formData.actual_savings
						?.toString()
						?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
						?.replace(/\.00$/, "");
					formData.value_of_contract = formData.value_of_contract
						?.toString()
						?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
						?.replace(/\.00$/, "");
					formData.actual_savings_currency = currData.budget_currency;
					formData.value_of_contract_currency = currData.budget_currency;

					if (currData.stakeholder_details?.length > 0) {
						fields.value = currData.stakeholder_details;
					}

					const tempDocumentArr: any = [];
					if (currData.documents?.length) {
						currData.documents?.forEach((field: any) => {
							tempDocumentArr.push({
								file_name: field.document_file_name,
								id: field.id,
								document_path: field.document_path,
								mime_type: field.document_extension,
							});
						});
					}

					copyEditData.value.documents = tempDocumentArr;

					await getClientAdminUserList(searchValue.value);
					await getContractNumbers(searchValue.value);
				}
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

			clientAdminUserData.value = res.data?.map((data: any) => {
				return {
					label: data.full_name + " " + "(" + data.email + ")",
					value: data.id,
				};
			});
		} catch {}
	};

	const getContractNumbers = async (value: any) => {
		searchValue.value = value;
		try {
			const res: any = await useApiFetch(`/getContract?searchValue=${value}`, {
				method: "GET",
			});
			contractData.value = res.data;
			contractNumbers.value = res.data?.map((data: any) => {
				return {
					label: data.contract_number,
					value: data.id,
				};
			});
		} catch {}
	};

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
		return clientAdminUserData.value.find((data: any) => data.value == editData.value.project_owner_id);
	});

	const getSelectedApprovalAuthority = computed(() => {
		return clientAdminUserData.value.find((data: any) => data.value === editData.value.approval_authority_id);
	});

	const dropdownSelectedContractNumber = (value: any) => {
		formData.contract_id = value;
		findContractByID(value);
	};

	const getSelectedContractNumber = computed(() => {
		return contractNumbers.value.find((data: any) => data.value == formData.contract_id);
	});

	const findContractByID = (id: any) => {
		const contractObj = contractData.value.find((data: any) => data.id === id);
		formData.value_of_contract = contractObj?.value_of_contract;
	};

	const budgetChange = () => {
		let value = formData.budget.replace(/\D/g, "");
		value = value.slice(0, 10);
		if (value > 0) {
			v$.value.budget.$touch();
			formData.budget = commaThreeDigitFormat(value);
		}
	};

	const actualSavingsChange = () => {
		let value = formData.actual_savings.replace(/\D/g, "");
		value = value.slice(0, 10);
		if (value > 0) {
			v$.value.actual_savings.$touch();
			formData.actual_savings = commaThreeDigitFormat(value);
		}
	};

	const valueOfContractChange = () => {
		let value = formData.value_of_contract.replace(/\D/g, "");
		value = value.slice(0, 10);
		if (value > 0) {
			v$.value.value_of_contract.$touch();
			formData.value_of_contract = commaThreeDigitFormat(value);
		}
	};

	const budgetCurrencyChange = (value: any) => {
		v$.value.budget_currency.$touch();
		formData.actual_savings_currency = value;
		formData.value_of_contract_currency = value;
	};

	const changeApprovalProvidedRequired = (index: any) => {
		if (fields.value[index].approval_provided === "") {
			fields.value[index].approvalProvidedRequired = true;
		} else {
			fields.value[index].approvalProvidedRequired = false;
		}
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

	const onSubmit = async (value: any) => {
		documentRef.value.resetValidation();

		fields.value.forEach((field: any) => {
			if (field.approval_provided === "" || field.approval_provided === null) {
				field.approvalProvidedRequired = true;
			}
		});

		// if (value !== "save_as_draft") {
		v$.value.$validate();

		if (!v$.value.$error) {
			const isValidField = fields.value.every((field: any) => {
				return !field.approvalProvidedRequired;
			});

			if (isValidField) {
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

	const sendApprovalAuthority = async () => {
		try {
			loadingSend.value = true;

			const res: any = await useApiFetch(`/projects/${route.params?.id}/send-for-approval`, {
				method: "POST",
				body: { stage: "signing" },
			});
			useToast("success", res.message);
			navigateTo(localePath("/project-pipeline/projects"));
		} catch {
		} finally {
			loadingSend.value = false;
		}
	};

	const submitEditData = async (value: any, data: any) => {
		formData.action = value;
		formData.budget = formData.budget?.split(",")?.join("") || "";
		formData.actual_savings = formData.actual_savings?.split(",")?.join("") || "";
		formData.value_of_contract = formData.value_of_contract?.split(",")?.join("") || "";

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
				fd.append("stakeholder_details_ids[]", field.id);
				fd.append("approval_provided[]", field.approval_provided);
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
			const res: any = await useApiFetch(`/projects/${route.params?.id}/signing`, {
				method: "POST",
				body: fd,
			});
			useToast("success", res.message);
			// navigateTo(localePath("/project-pipeline/projects"));
			if (value === "save_as_draft") {
				navigateTo(
					localePath({
						path: route.fullPath,
						query: { tab: "signing" },
					}),
					{ replace: true }
				);
				emit("disabledStatus", "signing");
			} else {
				navigateTo(
					localePath({
						path: route.fullPath,
						query: { tab: "supervision" },
					}),
					{ replace: true }
				);
				emit("disabledStatus", "supervision");
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
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							:rules="[{ required: true }]"
							:label="$t('formLabels.request_owner')"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.request_owner')" :tooltip-content="$t('info.request_owner')" />
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
								<BaseLabel :label="$t('formLabels.project_title')" :tooltip-content="$t('info.request_title')" />
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
							:label="$t('formLabels.start_date_of_signing')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.start_date_of_signing')"
									:tooltip-content="$t('info.start_date_of_signing')"
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
							:label="$t('formLabels.target_completion_date_of_signing')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.target_completion_date_of_signing')"
									:tooltip-content="$t('info.target_completion_date_of_signing')"
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
								v-model="editData.approval_authority_id"
								:dropdown-option="clientAdminUserData"
								:get-selected-country="getSelectedApprovalAuthority"
								:number-only="false"
								disabled
								name="approval_authority_id"
							/>
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
							<el-input v-model="editData.role_of_approval_authority" name="role_of_approval_authority" type="text" disabled />
						</el-form-item>

						<el-form-item
							:label="$t('formLabels.suppliers_ability_to_deliver_requirements')"
							:rules="[{ required: true }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.suppliers_ability_to_deliver_requirements')"
									:tooltip-content="$t('info.suppliers_ability_to_deliver_requirements')"
								/>
							</template>
							<el-input
								v-model="formData.suppliers_ability_to_deliver_requirements"
								name="suppliers_ability_to_deliver_requirements"
								type="textarea"
								maxLength="255"
								:disabled="disabled"
								:class="{
									error: v$.suppliers_ability_to_deliver_requirements.$error,
								}"
								@change="v$.suppliers_ability_to_deliver_requirements.$touch"
							/>
							<span v-if="v$.suppliers_ability_to_deliver_requirements.$error" class="text-xs text-red-500 mt-2">{{
								v$.suppliers_ability_to_deliver_requirements.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item
							:label="$t('formLabels.selection_rationale')"
							:rules="[{ required: true }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.selection_rationale')" :tooltip-content="$t('info.selection_rationale')" />
							</template>
							<el-input
								v-model="formData.selection_rationale"
								name="selection_rationale"
								type="textarea"
								maxLength="255"
								:disabled="disabled"
								:class="{
									error: v$.selection_rationale.$error,
								}"
								@change="v$.selection_rationale.$touch"
							/>
							<span v-if="v$.selection_rationale.$error" class="text-xs text-red-500 mt-2">{{
								v$.selection_rationale.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item
							:label="$t('formLabels.preferred_supplier_due_diligence')"
							:rules="[{ required: true }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.preferred_supplier_due_diligence')"
									:tooltip-content="$t('info.preferred_supplier_due_diligence')"
								/>
							</template>
							<el-input
								v-model="formData.preferred_supplier_due_diligence"
								name="preferred_supplier_due_diligence"
								type="textarea"
								maxLength="255"
								:disabled="disabled"
								:class="{
									error: v$.preferred_supplier_due_diligence.$error,
								}"
								@change="v$.preferred_supplier_due_diligence.$touch"
							/>
							<span v-if="v$.preferred_supplier_due_diligence.$error" class="text-xs text-red-500 mt-2">{{
								v$.preferred_supplier_due_diligence.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item
							:label="$t('formLabels.implementation_transition_plans')"
							:rules="[{ required: true }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.implementation_transition_plans')"
									:tooltip-content="$t('info.implementation_transition_plans')"
								/>
							</template>
							<el-input
								v-model="formData.implementation"
								name="implementation"
								type="textarea"
								maxLength="255"
								:disabled="disabled"
								:class="{
									error: v$.implementation.$error,
								}"
								@change="v$.implementation.$touch"
							/>
							<span v-if="v$.implementation.$error" class="text-xs text-red-500 mt-2">{{ v$.implementation.$errors[0].$message }}</span>
						</el-form-item>

						<div class="flex items-start col-span-12 md:col-span-6 2xl:col-span-4 label-upper-dropdown">
							<div class="w-24 flex-initial mt-6">
								<el-input v-model="CurrencySymbole[formData.actual_savings_currency]" name="actual_savings" type="text" disabled />
							</div>
							<el-form-item :label="$t('formLabels.actual_savings')" :rules="[{ required: true }]" class="ml-4 mb-0 w-full mt-6">
								<template #label>
									<BaseLabel :label="$t('formLabels.actual_savings')" :tooltip-content="$t('info.actual_savings')" />
								</template>
								<el-input
									v-model="formData.actual_savings"
									name="actual_savings"
									type="text"
									:class="{
										error: v$.actual_savings.$error,
									}"
									maxLength="10"
									:disabled="disabled"
									@change="actualSavingsChange"
									@keypress="NumbersOnly"
								/>
								<span v-if="v$.actual_savings.$error" class="text-xs text-red-500 mt-2">{{
									v$.actual_savings.$errors[0].$message
								}}</span>
							</el-form-item>
						</div>

						<el-form-item
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							:rules="[{ required: true }]"
							:label="$t('formLabels.contract_number')"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.contract_number')"
									:tooltip-content="$t('info.contract_number')"
									:isShowLabel="false"
								/>
							</template>
							<BaseSelectDropdown
								v-model="formData.contract_id"
								:dropdown-option="contractNumbers"
								:get-selected-country="getSelectedContractNumber"
								:number-only="false"
								:disabled="disabled"
								name="contract_id"
								:class="{
									error: v$.contract_id.$error,
								}"
								:isRemoteSearch="true"
								@remote-search="getContractNumbers"
								@selected-value="dropdownSelectedContractNumber"
								@change="v$.contract_id.$touch"
							/>

							<span v-if="v$.contract_id.$error" class="text-xs text-red-500 mt-2">{{ v$.contract_id.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item
							:label="$t('formLabels.total_contract_term ')"
							:rules="[{ required: true }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.total_contract_term')" :tooltip-content="$t('info.total_contract_term')" />
							</template>
							<el-input
								v-model="formData.total_contract_term"
								name="total_contract_term"
								type="textarea"
								maxLength="255"
								:disabled="disabled"
								:class="{
									error: v$.total_contract_term.$error,
								}"
								@change="v$.total_contract_term.$touch"
							/>
							<span v-if="v$.total_contract_term.$error" class="text-xs text-red-500 mt-2">{{
								v$.total_contract_term.$errors[0].$message
							}}</span>
						</el-form-item>

						<div class="flex items-start col-span-12 md:col-span-6 2xl:col-span-4 label-upper-dropdown">
							<div class="w-24 flex-initial mt-6">
								<el-input
									v-model="CurrencySymbole[formData.value_of_contract_currency]"
									name="value_of_contract"
									type="text"
									disabled
								/>
							</div>
							<el-form-item :label="$t('formLabels.value_of_contract')" :rules="[{ required: true }]" class="ml-4 mb-0 w-full mt-6">
								<template #label>
									<BaseLabel
										:label="$t('formLabels.value_of_contract')"
										:tooltip-content="$t('info.value_of_contract')"
										:isShowLabel="false"
									/>
								</template>
								<el-input
									v-model="formData.value_of_contract"
									name="value_of_contract"
									type="text"
									:disabled="disabled"
									:class="{
										error: v$.value_of_contract.$error,
									}"
									@change="valueOfContractChange"
									@keypress="NumbersOnly"
								/>
								<span v-if="v$.value_of_contract.$error" class="text-xs text-red-500 mt-2">{{
									v$.value_of_contract.$errors[0].$message
								}}</span>
							</el-form-item>
						</div>

						<div class="col-span-12">
							<label class="font-bold text-xl">{{ $t("formLabels.add_stakeholder_details") }}</label>
							<div
								class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 mb-4 gap-4 lg:gap-8 mt-5"
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
										:dropdown-option="clientAdminUserData"
										:number-only="false"
										:get-selected-country="selectedStakeholders(index, 'stakeholder_id')"
										disabled
									/>
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
										disabled
									/>
								</el-form-item>

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
										disabled
									/>
								</el-form-item>

								<el-form-item class="mb-0 w-full" :label="$t('formLabels.approval_provided')" :rules="[{ required: true }]">
									<template #label>
										<BaseLabel
											:label="$t('formLabels.approval_provided')"
											:tooltip-content="$t('info.approval_provided')"
											:isShowLabel="false"
										/>
									</template>
									<el-input
										type="text"
										label="Job Title"
										:name="'fields' + index"
										v-model="fields[index].approval_provided"
										:disabled="disabled"
										maxLength="50"
										:class="{
											error: fields[index].approvalProvidedRequired || fields.approvalProvidedRequired,
										}"
										@blur="changeApprovalProvidedRequired(index)"
									/>
									<span
										v-if="fields[index].approvalProvidedRequired || fields.approvalProvidedRequired"
										class="text-xs text-red-500 mt-2"
									>
										{{ $t("formValidations.approval_provided") }}
									</span>
								</el-form-item>
							</div>
						</div>

						<div class="col-span-12">
							<div class="inline-flex items-center mr-5">
								<label id="upload_documents" class="el-form-item__label pr-0">{{ $t("formLabels.upload_documents") }}</label>
								<BaseLabel :tooltip-content="$t('info.upload_signing_documents')" />
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
					<el-tag v-if="editData.approval_authority_status == 1" class="my-2 mx-3 text-success bg-white text-xl border-none"
						><span class="hidden sm:inline-block"
							>{{ $t("formLabels.approval_authority_status") }} : {{ $t("buttons.sent_for_approval") }}</span
						></el-tag
					>

					<el-tag v-if="editData.approval_authority_status == 2" class="my-2 mx-3 text-success bg-white text-xl border-none"
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
						v-if="editData.active_tab === 'signing'"
						class="my-1"
						type="supervision"
						:loading="loading"
						:class="editData.approval_authority_status !== 2 ? 'disabled:opacity-50' : 'el-button--info'"
						:disabled="loading || editData.approval_authority_status !== 2"
						@click.prevent="onSubmit('move_to_supervision')"
						>{{ $t("buttons.move_to_supervision") }}
					</novok-button>
				</div>
			</div>
		</div>
	</el-form>
</template>
