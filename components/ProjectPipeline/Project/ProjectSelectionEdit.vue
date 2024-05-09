<script setup lang="ts">
	import { required, email, minLength, maxLength, helpers, requiredIf } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import { commaThreeDigitFormat } from "~/helper/common";
	import { CurrencyData, CurrencySymbole } from "~/helper/data";
	import moment from "moment";
	import supplier from "~/middleware/supplier";

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
	const supplierData = ref<any>([]);
	const supplierDropdownData = ref<any>([]);
	const suppliersAllData = ref<any>([]);
	const filteredSuppliersList = ref<any>([]);
	const chosenSuppliersData = ref<any>([]);
	const documentRef = ref<any>(null);

	const formData = reactive<any>({
		project_title: "",
		requirement: "",
		start_date: "",
		target_completion_date: "",
		budget_currency: "",
		budget: "",
		spend_analysis: "",
		market_analysis: "",
		final_specification: "",
		benefits: "",
		estimated_savings_currency: "",
		estimated_savings: "",
		chosen_supplier_id: "",
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

	const selectedSuppliersData = ref<any>([
		{
			value: "",
			label: "",
		},
	]);

	const supplierFields = ref<any>([
		{
			tenant_supplier_id: "",
			// supplier_name: "",
			adjudication_score: "",
			due_diligence: "",
			site_visit: "",
			further_commentary: "",
			priority_order: "",
			supplierNameRequired: false,
			adjudicationScoreRequired: false,
			// dueDiligenceRequired: false,
			// siteVisitRequired: false,
			// furtherCommentaryRequired: false,
			// priorityOrderRequired: false,
		},
	]);
	const copyEditData = ref<any>({
		delete_document_ids: [],
		documents: [],
	});
	const documents = ref<any>([]);
	const deleteIds = ref<any>([]);

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
				required: helpers.withMessage(t("formValidations.start_date_of_selection"), required),
			},
			target_completion_date: {
				required: helpers.withMessage(t("formValidations.target_completion_date_of_selection"), required),
			},
			budget_currency: {
				required: helpers.withMessage(t("formValidations.currency"), required),
			},
			budget: {
				required: helpers.withMessage(t("formValidations.budget"), required),
			},

			spend_analysis: {
				required: helpers.withMessage(t("formValidations.spend_analysis"), required),
			},
			market_analysis: {
				required: helpers.withMessage(t("formValidations.market_analysis"), required),
			},
			benefits: {
				required: helpers.withMessage(t("formValidations.benefits"), required),
			},
			estimated_savings: {
				required: helpers.withMessage(t("formValidations.estimated_savings"), required),
			},
			final_specification: {
				required: helpers.withMessage(t("formValidations.final_specification"), required),
			},
			chosen_supplier_id: {
				required: helpers.withMessage(t("formValidations.chosen_supplier"), required),
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

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

	const getSupplierList = async (value: any) => {
		searchValue.value = value;
		try {
			const res: any = await useApiFetch(`/project-ms/suppliers?searchValue=${value}`, {
				method: "GET",
			});
			suppliersAllData.value = res.data;

			supplierData.value = res.data?.map((data: any) => {
				return {
					label: data.company_name + " " + "(" + data.email + ")",
					value: data.id,
				};
			});

			supplierDropdownData.value = res.data?.map((data: any) => {
				return {
					label: data.company_name + " " + "(" + data.email + ")",
					value: data.id,
				};
			});
			filterSuppliers();
		} catch {}
	};

	watch(
		() => props.editData,
		async (currData) => {
			if (currData) {
				if (props.activeTab === "selection") {
					Object.assign(editData.value, currData);

					Object.keys(formData).forEach((field: any) => {
						if (field !== "undefined" || field !== null) {
							formData[field] = currData[field];
						}
					});

					// formData.estimated_savings_currency = currData.budget_currency;

					formData.budget = formData.budget
						?.toString()
						?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
						?.replace(/\.00$/, "");

					formData.estimated_savings = formData.estimated_savings
						?.toString()
						?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
						?.replace(/\.00$/, "");

					if (currData.stakeholder_details?.length > 0) {
						fields.value = currData.stakeholder_details;
					}
					if (currData.supplier_details?.length > 0) {
						supplierFields.value = currData.supplier_details;
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

					// copyFormData.value = JSON.parse(JSON.stringify(formData));
					await getClientAdminUserList(searchValue.value);
					await getSupplierList(searchValue.value);

					const tempArr: any = [];
					if (currData.supplier_details?.length > 0) {
						currData.supplier_details.forEach((data: any) => {
							suppliersAllData.value.map((field: any) => {
								if (field.id == data.tenant_supplier_id) {
									tempArr.push(field);
								}
							});
						});
					}

					chosenSuppliersData.value = tempArr;
				}
			}
		},
		{ immediate: true }
	);

	onMounted(async () => {
		// if (props.activeTab === "selection") {
		// 	await getClientAdminUserList(searchValue.value);
		// }
	});

	const selectedStakeholders = (index: any, key: any) => {
		const selectedData = fields.value[index];

		return {
			label: selectedData?.[key],
			value: selectedData?.[key],
		};
	};

	const selectedSuppliers = (index: any, key: any) => {
		const selectedData = supplierFields.value[index];

		return {
			label: selectedData?.[key],
			value: selectedData?.[key],
		};
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
		return clientAdminUserData.value.find((data: any) => data.value === editData.value.project_owner_id);
	});

	const getSelectedApprovalAuthority = computed(() => {
		return clientAdminUserData.value.find((data: any) => data.value === editData.value.approval_authority_id);
	});

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

	const budgetCurrencyChange = (value: any) => {
		v$.value.budget_currency.$touch();
		formData.estimated_savings_currency = value;
	};

	const filterSuppliers = () => {
		const supplierIdsToRemove = new Set(supplierFields.value.map((item: any) => item.tenant_supplier_id));

		let filteredArr: any = [];

		// Add disabled true
		supplierDropdownData.value.map((item: any) => {
			if (supplierIdsToRemove.has(item.value)) {
				item.disabled = true;
			} else {
				item.disabled = false;
			}
			filteredArr.push(item);
		});

		filteredSuppliersList.value = filteredArr;
	};

	const findSupplierById = (id: any) => {
		return suppliersAllData.value.find((data: any) => data.id == id);
	};

	const handleFieldSupplierValue = (value: any, index: any) => {
		formData.chosen_supplier_id = "";
		const Obj = findSupplierById(value);
		chosenSuppliersData.value.push(Obj);
		supplierFields.value[index].tenant_supplier_id = value;
		// supplierFields.value[index].supplier_ = Obj.id;
		// supplierFields.value[index].role_of_stakeholder = Obj.job_title;
		filterSuppliers();
		if (supplierFields.value[index].tenant_supplier_id === "") {
			supplierFields.value[index].supplierNameRequired = true;
		} else {
			supplierFields.value[index].supplierNameRequired = false;
		}

		const filteredArray2: any = [];

		supplierFields.value.forEach((data: any) => {
			chosenSuppliersData.value.forEach((item: any) => {
				if (data.tenant_supplier_id == item.id) {
					filteredArray2.push(item);
				}
			});
		});
		chosenSuppliersData.value = filteredArray2;
	};

	const getChosenSuppliers = computed(() => {
		const data = chosenSuppliersData.value.map((data: any) => {
			return {
				label: data.company_name + " " + "(" + data.email + ")",
				value: data.id,
			};
		});

		return data;
	});

	const dropdownSelectedChosenSupplier = (value: any) => {
		formData.chosen_supplier_id = value;
	};

	const getSelectedChosenSupplier = computed(() => {
		return chosenSuppliersData.value.find((data: any) => data.value == formData.chosen_supplier_id);
	});

	const removeInput = (index: any) => {
		supplierFields.value.splice(index, 1);
		chosenSuppliersData.value.splice(index, 1);
		formData.chosen_supplier_id = "";
		filterSuppliers();
	};

	const addInput = () => {
		if (supplierFields.value.length > 0 && supplierFields.value.length < 5) {
			supplierFields.value.push({
				tenant_supplier_id: "",
				adjudication_score: "",
				due_diligence: "",
				site_visit: "",
				further_commentary: "",
				priority_order: "",
				supplierNameRequired: false,
				adjudicationScoreRequired: false,
				// dueDiligenceRequired: false,
				// siteVisitRequired: false,
				// furtherCommentaryRequired: false,
				// priorityOrderRequired: false,
			});

			selectedSuppliersData.value.push({
				value: "",
				label: "",
			});
			filterSuppliers();
		}
	};

	const changeAdjudicationScore = (index: any) => {
		if (supplierFields.value[index].adjudication_score === "") {
			supplierFields.value[index].adjudicationScoreRequired = true;
		} else {
			supplierFields.value[index].adjudicationScoreRequired = false;
		}
	};

	// const changeDueDiligence = (index: any) => {
	// 	if (supplierFields.value[index].due_diligence === "") {
	// 		supplierFields.value[index].dueDiligenceRequired = true;
	// 	} else {
	// 		supplierFields.value[index].dueDiligenceRequired = false;
	// 	}
	// };

	// const changeSiteVisit = (index: any) => {
	// 	if (supplierFields.value[index].site_visit === "") {
	// 		supplierFields.value[index].siteVisitRequired = true;
	// 	} else {
	// 		supplierFields.value[index].siteVisitRequired = false;
	// 	}
	// };

	// const changefurtherCommentary = (index: any) => {
	// 	if (supplierFields.value[index].further_commentary === "") {
	// 		supplierFields.value[index].furtherCommentaryRequired = true;
	// 	} else {
	// 		supplierFields.value[index].furtherCommentaryRequired = false;
	// 	}
	// };

	// const changePriorityOrderRequired = (index: any) => {
	// 	if (supplierFields.value[index].priority_order === "") {
	// 		supplierFields.value[index].priorityOrderRequired = true;
	// 	} else {
	// 		supplierFields.value[index].priorityOrderRequired = false;
	// 	}
	// };

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

		supplierFields.value.forEach((field: any) => {
			if (field.tenant_supplier_id === "") {
				field.supplierNameRequired = true;
			}
			if (field.adjudication_score === "") {
				field.adjudicationScoreRequired = true;
			}
			// if (field.due_diligence === "") {
			// 	field.dueDiligenceRequired = true;
			// }
			// if (field.site_visit === "") {
			// 	field.siteVisitRequired = true;
			// }
			// if (field.further_commentary === "") {
			// 	field.furtherCommentaryRequired = true;
			// }
			// if (field.priority_order === "") {
			// 	field.priorityOrderRequired = true;
			// }
		});

		fields.value.forEach((field: any) => {
			if (field.approval_provided === "" || field.approval_provided === null) {
				field.approvalProvidedRequired = true;
			}
		});

		v$.value.$validate();

		if (!v$.value.$error) {
			const isValid = supplierFields.value.every((field: any) => {
				return (
					!field.supplierNameRequired && !field.adjudicationScoreRequired
					// !field.dueDiligenceRequired &&
					// !field.siteVisitRequired &&
					// !field.furtherCommentaryRequired &&
					// !field.priorityOrderRequired
				);
			});

			const isValidField = fields.value.every((field: any) => {
				return !field.approvalProvidedRequired;
			});

			if (isValid && isValidField) {
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
	};

	const sendApprovalAuthority = async () => {
		try {
			loadingSend.value = true;

			const res: any = await useApiFetch(`/projects/${route.params?.id}/send-for-approval`, {
				method: "POST",
				body: { stage: "selection" },
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
		formData.budget = formData.budget.split(",").join("");
		formData.estimated_savings = formData.estimated_savings.split(",").join("");

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

		if (supplierFields.value.length) {
			supplierFields.value.map((field: any, index: any) => {
				fd.append("tenant_supplier_ids[]", field.tenant_supplier_id);
				fd.append("adjudication_score[]", field.adjudication_score);
				fd.append("due_diligence[]", field.due_diligence || "");
				fd.append("site_visit[]", field.site_visit || "");
				fd.append("further_commentary[]", field.further_commentary || "");
				fd.append("priority_order[]", field.priority_order || "");
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
			const res: any = await useApiFetch(`/projects/${route.params?.id}/selection`, {
				method: "POST",
				body: fd,
			});
			useToast("success", res.message);
			// navigateTo(localePath("/project-pipeline/projects"));
			if (value === "save_as_draft") {
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
							:label="$t('formLabels.start_date_of_selection')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.start_date_of_selection')"
									:tooltip-content="$t('info.start_date_of_selection')"
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
							:label="$t('formLabels.target_completion_date_of_selection')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.target_completion_date_of_selection')"
									:tooltip-content="$t('info.target_completion_date_of_selection')"
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
							:label="$t('formLabels.spend_analysis')"
							:rules="[{ required: true }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.spend_analysis')"
									:tooltip-content="$t('info.spend_analysis')"
									:isShowLabel="false"
								/>
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
								<BaseLabel
									:label="$t('formLabels.market_analysis')"
									:tooltip-content="$t('info.market_analysis')"
									:isShowLabel="false"
								/>
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

						<el-form-item
							:label="$t('formLabels.final_specification')"
							:rules="[{ required: true }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.final_specification')" :tooltip-content="$t('info.final_specification')" />
							</template>
							<el-input
								v-model="formData.final_specification"
								name="final_specification"
								type="textarea"
								maxLength="255"
								:disabled="disabled"
								:class="{
									error: v$.final_specification.$error,
								}"
								@change="v$.final_specification.$touch"
							/>
							<span v-if="v$.final_specification.$error" class="text-xs text-red-500 mt-2">{{
								v$.final_specification.$errors[0].$message
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
										label="approval_provided"
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
							<label class="font-bold text-xl">{{ $t("formLabels.supplier_details") }}</label>
							<BaseLabel :tooltip-content="$t('info.supplier_details')" />
							<div
								class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 mb-4 gap-4 mt-5"
								v-for="(input, index) in supplierFields"
								:key="index"
							>
								<el-form-item class="mb-0 w-full" :label="$t('formLabels.supplier_name')" :rules="[{ required: true }]">
									<template #label>
										<BaseLabel
											:label="$t('formLabels.supplier_name')"
											:tooltip-content="$t('info.supplier_name')"
											:isShowLabel="false"
										/>
									</template>
									<BaseSelectDropdown
										:name="'supplierFields' + index"
										:dropdown-option="supplierDropdownData"
										:number-only="false"
										:get-selected-country="selectedSuppliers(index, 'tenant_supplier_id')"
										:disabled="disabled"
										:isRemoteFilter="true"
										:class="{
											error: supplierFields[index].supplierNameRequired || supplierFields.supplierNameRequired,
										}"
										@remote-search="getSupplierList"
										@change="handleFieldSupplierValue($event, index)"
									/>
									<span
										v-if="supplierFields[index].supplierNameRequired || supplierFields.supplierNameRequired"
										class="text-xs text-red-500 mt-2"
										>{{ $t("formValidations.supplier_name") }}</span
									>
								</el-form-item>

								<el-form-item class="mb-0 w-full" :label="$t('formLabels.adjudication_score')" :rules="[{ required: true }]">
									<template #label>
										<BaseLabel
											:label="$t('formLabels.adjudication_score')"
											:tooltip-content="$t('info.adjudication_score')"
											:isShowLabel="false"
										/>
									</template>
									<el-input
										type="text"
										label="adjudication_score"
										:name="'supplierFields' + index"
										v-model="supplierFields[index].adjudication_score"
										:disabled="disabled"
										maxLength="3"
										:class="{
											error: supplierFields[index].adjudicationScoreRequired || supplierFields.adjudicationScoreRequired,
										}"
										@blur="changeAdjudicationScore(index)"
										@keypress="NumbersOnly"
									/>
									<span
										v-if="supplierFields[index].adjudicationScoreRequired || supplierFields.adjudicationScoreRequired"
										class="text-xs text-red-500 mt-2"
									>
										{{ $t("formValidations.adjudication_score") }}
									</span>
								</el-form-item>

								<el-form-item class="mb-0 w-full" :label="$t('formLabels.due_diligence')" :rules="[{ required: false }]">
									<template #label>
										<BaseLabel
											:label="$t('formLabels.due_diligence')"
											:tooltip-content="$t('info.due_diligence')"
											:isShowLabel="false"
										/>
									</template>
									<el-input
										type="textarea"
										label="due_diligence"
										:name="'supplierFields' + index"
										v-model="supplierFields[index].due_diligence"
										:disabled="disabled"
										maxLength="50"
									/>
									<!-- <span
										v-if="supplierFields[index].dueDiligenceRequired || supplierFields.dueDiligenceRequired"
										class="text-xs text-red-500 mt-2"
									>
										{{ $t("formValidations.due_diligence") }}
									</span> -->
								</el-form-item>

								<el-form-item class="mb-0 w-full" :label="$t('formLabels.site_visit')" :rules="[{ required: false }]">
									<template #label>
										<BaseLabel
											:label="$t('formLabels.site_visit')"
											:tooltip-content="$t('info.site_visit')"
											:isShowLabel="false"
										/>
									</template>
									<el-input
										type="textarea"
										label="site_visit"
										:name="'supplierFields' + index"
										v-model="supplierFields[index].site_visit"
										:disabled="disabled"
										maxLength="50"
									/>
									<!-- <span
										v-if="supplierFields[index].siteVisitRequired || supplierFields.siteVisitRequired"
										class="text-xs text-red-500 mt-2"
									>
										{{ $t("formValidations.site_visit") }}
									</span> -->
								</el-form-item>

								<el-form-item class="mb-0 w-full" :label="$t('formLabels.further_commentary')" :rules="[{ required: false }]">
									<template #label>
										<BaseLabel
											:label="$t('formLabels.further_commentary')"
											:tooltip-content="$t('info.further_commentary')"
											:isShowLabel="false"
										/>
									</template>
									<el-input
										type="textarea"
										label="further_commentary"
										:name="'supplierFields' + index"
										v-model="supplierFields[index].further_commentary"
										:disabled="disabled"
										maxLength="50"
									/>
									<!-- <span
										v-if="supplierFields[index].furtherCommentaryRequired || supplierFields.furtherCommentaryRequired"
										class="text-xs text-red-500 mt-2"
									>
										{{ $t("formValidations.further_commentary") }}
									</span> -->
								</el-form-item>

								<div class="flex sm:col-span-2 lg:col-span-1">
									<el-form-item class="mb-0 w-full" :label="$t('formLabels.priority_order')" :rules="[{ required: false }]">
										<template #label>
											<BaseLabel
												:label="$t('formLabels.priority_order')"
												:tooltip-content="$t('info.priority_order')"
												:isShowLabel="false"
											/>
										</template>
										<el-input
											type="textarea"
											label="priority_order"
											:name="'supplierFields' + index"
											v-model="supplierFields[index].priority_order"
											:disabled="disabled"
											maxLength="2"
											@keypress="NumbersOnly"
										/>
										<!-- <span
											v-if="supplierFields[index].priorityOrderRequired || supplierFields.priorityOrderRequired"
											class="text-xs text-red-500 mt-2"
										>
											{{ $t("formValidations.priority_order") }}
										</span> -->
									</el-form-item>

									<novok-button
										type="danger"
										class="flex-none mt-6 w-[40px] h-[40px] ml-4 lg:ml-8"
										@click="removeInput(index)"
										v-if="supplierFields.length > 1 && !disabled"
									>
										<i class="fa-solid fa-xmark"></i>
									</novok-button>
								</div>
							</div>

							<novok-button
								v-if="!disabled"
								:class="supplierFields.length >= 5 ? 'disabled:opacity-50' : 'el-button--info'"
								@click="addInput"
								:disabled="disabled || supplierFields.length >= 5"
								><i class="fa-solid fa-plus mr-2"></i> {{ $t("buttons.add") }}</novok-button
							>
						</div>

						<el-form-item
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							:rules="[{ required: true }]"
							:label="$t('formLabels.chosen_supplier')"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.chosen_supplier')" :tooltip-content="$t('info.chosen_supplier')" />
							</template>
							<BaseSelectDropdown
								v-model="formData.chosen_supplier_id"
								:dropdown-option="getChosenSuppliers"
								:get-selected-country="getSelectedChosenSupplier"
								:number-only="false"
								:disabled="disabled || getChosenSuppliers.length === 0"
								name="chosen_supplier_id"
								:class="{
									error: v$.chosen_supplier_id.$error,
								}"
								@selected-value="dropdownSelectedChosenSupplier"
								@change="v$.chosen_supplier_id.$touch"
							/>

							<span v-if="v$.chosen_supplier_id.$error" class="text-xs text-red-500 mt-2">{{
								v$.chosen_supplier_id.$errors[0].$message
							}}</span>
						</el-form-item>

						<div class="col-span-12">
							<div class="inline-flex items-center mr-5">
								<label id="upload_documents" class="el-form-item__label pr-0">{{ $t("formLabels.upload_documents") }}</label>
								<BaseLabel :tooltip-content="$t('info.upload_selection_documents')" />
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
						><span class="hidden sm:inline-block">
							{{ $t("formLabels.approval_authority_status") }} :{{ $t("buttons.approved") }}</span
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
						v-if="editData.active_tab === 'selection'"
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
