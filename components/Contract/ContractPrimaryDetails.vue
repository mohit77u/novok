<!-- eslint-disable vue/require-valid-default-prop -->
<!-- eslint-disable camelcase -->
<script setup lang="ts">
	import { required, helpers, requiredIf, maxValue, email } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import moment from "moment";
	import { reminderData, contractType, contractTypeCopy, FormContractStatusData } from "~/helper/data";

	import { ContractData, CurrencyData, CurrencySymbole, ContractTermType } from "~/helper/data";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import { contractStore } from "~/store/contract";
	import { commaThreeDigitFormat } from "~/helper/common";
	import { useProfileStore } from "~/store/profile";

	const localePath = useLocalePath();
	const { t } = useI18n();
	const fullscreenLoading = ref(false);
	const loading = ref(false);
	const loadingSave = ref(false);
	const route = useRoute();
	const emit = defineEmits(["active-tab-name", "disable", "disabled"]);
	const store = contractStore();
	const showError = ref(false);
	const getReminderData = ref<any>([]);
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

	const formData = reactive<any>({
		tab_name: "primary-details",
		project_code: "",
		title: "",
		contract_type: "",
		contract_number: "",
		contract_owner_id: "",
		tenant_supplier_id: "",
		currency: "GBP",
		value_of_contract: "",
		contract_term_type: "",
		is_reminders_set: 0,
		reminder_from_days: "",
		frequency_of_days: "",
		reminder_send_to: [],
		is_reminder_send_to: 1,
		contract_start_date: "",
		contract_end_date: "",
		status: "",
		notice_period_days: null,
		contract_description: "",
		currency_symbol: "",
		estimated_budget: "",
		budget_owner_id: "",
		signing_entity_id: "",
		parent_entity: "",
		authorised_signatory_id: "",
		supplier_authorised_signatory_id: "",
		master_contract_id: "",
		department_line_of_business: "",
		is_personal_data_involved: 0,
		category_level_1: "",
		category_level_2: "",
		category_level_3: "",
	});
	const contract_number = ref(0);
	const contract_id = ref();
	const searchValue = ref("");
	const clientManagers = ref<any>([]);
	const supplierLeads = ref<any>([]);
	const clientLeads = ref<any>([]);
	const showContractDates = ref(true);
	const isClone = ref(0);
	const dialogVisible = ref(false);
	const showReminderError = ref(false);
	const showNoticePeriodError = ref(false);
	const categoryId = ref(0);
	const categories = ref<any>([]);
	const masterContracts = ref<any>([]);
	const profileStore = useProfileStore();
	const subEntityData = ref<any>([]);

	const rules = computed(() => {
		return {
			project_code: {
				name_validation: {
					$validator: PasteCharcAndNum,
					$message: t("copyPasteValidations.charNum"),
				},
			},
			parent_entity: {
				required: helpers.withMessage(t("formValidations.parent_entity"), required),
				// name_validation: {
				// 	$validator: PasteCharcAndNumWithSpace,
				// 	$message: t("copyPasteValidations.charNum"),
				// },
			},
			title: {
				required: helpers.withMessage(t("formValidations.contract_title"), required),
			},
			contract_owner_id: {
				required: helpers.withMessage(t("formValidations.contract_owner"), required),
			},
			tenant_supplier_id: {
				required: helpers.withMessage(t("formValidations.supplier_name"), required),
			},
			contract_number: {
				required: helpers.withMessage(t("formValidations.contract_number"), required),
			},
			contract_type: {
				required: helpers.withMessage(t("formValidations.contract_type"), required),
			},
			currency: {
				required: helpers.withMessage(t("formValidations.currency"), required),
			},
			value_of_contract: {
				required: helpers.withMessage(t("formValidations.value_of_contract"), required),
				name_validation: {
					$validator: PasteNumberWithSpecialCharc,
					$message: t("copyPasteValidations.number"),
				},
			},
			contract_term_type: {
				required: helpers.withMessage(t("formValidations.contract_term_type"), required),
			},
			status: {
				required: helpers.withMessage(t("formValidations.Status"), required),
			},
			contract_start_date: {
				requiredIf: helpers.withMessage(t("formValidations.contract_start_date"), requiredIf(formData.status == 3 || formData.status == 4)),
			},
			contract_end_date: {
				requiredIf: helpers.withMessage(t("formValidations.contract_end_date"), requiredIf(formData.status == 3 || formData.status == 4)),
			},
			notice_period_days: {
				required: helpers.withMessage(t("formValidations.notice_period_days"), required),
			},
			reminder_from_days: {
				requiredIf: helpers.withMessage(t("formValidations.reminder_from_days"), requiredIf(formData.is_reminders_set)),
				name_validation: {
					$validator: PasteNumberOnly,
					$message: t("copyPasteValidations.number"),
				},
			},
			frequency_of_days: {
				requiredIf: helpers.withMessage(t("formValidations.frequency_of_days"), requiredIf(formData.is_reminders_set)),
				name_validation: {
					$validator: PasteNumberOnly,
					$message: t("copyPasteValidations.number"),
				},
			},
			contract_description: {
				required: helpers.withMessage(t("formValidations.contract_description"), required),
				name_validation: {
					$validator: PasteCharcAndNumWithSpace,
					$message: t("copyPasteValidations.charNum"),
				},
			},
			estimated_budget: {
				required: helpers.withMessage(t("formValidations.estimated_budget"), required),
				name_validation: {
					$validator: PasteNumberWithSpecialCharc,
					$message: t("copyPasteValidations.number"),
				},
			},
			department_line_of_business: {
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			category_level_1: {
				required: helpers.withMessage(t("formValidations.category_level_1"), required),
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

	watch(
		() => props.editData,
		(currData) => {
			if (currData.tab === "primary-details" || currData.tab === "all") {
				v$.value.$reset();
				showError.value = false;
				if (Object.keys(currData || {}).length) {
					Object.keys(formData).forEach((field: any) => {
						if (currData?.[field] !== undefined && currData?.[field] !== null && currData?.[field] !== "") {
							formData[field] = currData?.[field];
							contract_number.value = currData.contract_type;
							store.setContractNumber(currData.contract_number);
							formData.reminder_send_to = currData.reminder_send_to.map((data: any) => data.reminder_send_to);
							// formData.contract_type = contractTypeCopy[currData.contract_type];

							if (currData.status == 3 || currData.status == 4) {
								showContractDates.value = true;
							} else {
								showContractDates.value = false;
							}
							isClone.value = currData?.is_cloned;
						}
					});
					const tempObj: any = [];

					currData.reminder_send_to.forEach((key: any) => {
						reminderData.forEach((field: any) => {
							if (field.value === key.reminder_send_to) {
								tempObj.push({
									label: field.label,
									value: field.value,
								});
							}
						});
					});

					getReminderData.value = tempObj;
				}

				Object.assign(customFields, currData?.custom_primary_details);
			}
		}
	);

	onMounted(async () => {
		await getClientManagers("");
		await getSupplierLeads("");
		await categoryLavelOneApiCall();
		await getMasterContracts("");
		formData.currency_symbol = CurrencySymbole[formData.currency];
		formData.estimated_budget = commaThreeDigitFormat(formData.estimated_budget);

		if (!route.params?.id) {
			const contract_type = sessionStorage.getItem("createContractType") || "";
			formData.contract_type = contractType[contract_type];
			contract_number.value = contractType[contract_type];
			await getAutoGenerateNumber();

			const data = await getCustomField("contract", "primary-details");

			data.forEach((obj: any) => {
				if (obj.input_type === "checkbox") {
					obj.input_value = [];
				} else {
					obj.input_value = "";
				}
			});
			formData.parent_entity = profileStore.$state.profileData?.user_detail?.company?.company_name;
			Object.assign(customFields, data);
		}
		await getSubEntityData();
	});

	const getAutoGenerateNumber = async () => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch(`/generate-contract-number?contract_type=${contract_number.value}`, {
				method: "GET",
			});

			formData.contract_number = res.data?.contract_number;
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const getClientManagers = async (value: any) => {
		try {
			searchValue.value = value;
			fullscreenLoading.value = true;

			const res: any = await useApiFetch(`/contract-owners?perPage=${15}&searchValue=${value}`, {
				method: "GET",
			});

			clientManagers.value = res.data?.map((data: any) => {
				return {
					label: data.full_name + " " + "(" + data.email + ")",
					value: data.id,
				};
			});
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const getSupplierLeads = async (value: any) => {
		try {
			searchValue.value = value;
			fullscreenLoading.value = true;

			const res: any = await useApiFetch(`/suppliers?searchValue=${value}`, {
				method: "GET",
			});

			supplierLeads.value = res.data?.map((data: any) => {
				return {
					label: data.company_name + " " + "(" + data.full_name + ")",
					value: data.id,
				};
			});
		} catch {
		} finally {
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

	const dropdownSelectedManagerValue = (value: any) => {
		formData.contract_owner_id = value;
		// getSupplierLeads(searchValue.value);
	};

	const dropdownSelectedSupplierLead = (value: any) => {
		formData.tenant_supplier_id = value;
	};

	const dropdownSelectedSubEntity = (value: any) => {
		formData.signing_entity_id = value;
	};

	const getSelectedSubEntity = computed(() => {
		return subEntityData.value.find((data: any) => data.value === formData.signing_entity_id);
	});

	const getSelectedCurrencyData = computed(() => {
		return CurrencyData.find((data) => data.value === formData.currency);
	});

	const dropdownSelectedCurrencyValue = (value: any) => {
		formData.currency = value;
	};

	const getSelectedMangers = computed(() => {
		return clientManagers.value.find((data: any) => data.value === formData.contract_owner_id);
	});

	const getSelectedSupplierLead = computed(() => {
		return supplierLeads.value.find((data: any) => data.value === formData.tenant_supplier_id);
	});

	const getSelectedContractTerm = computed(() => {
		return ContractTermType.find((data) => data.value === formData.contract_term_type);
	});

	const getSelectedStatus = computed(() => {
		return FormContractStatusData.find((data) => data.value === formData.status);
	});

	const dropdownSelectedContractTerm = computed((value: any) => {
		formData.contract_term_type = value;
	});

	const dropdownSelectedStatus = computed((value: any) => {
		formData.status = value;
	});

	const onSubmit = (value: any) => {
		formData.estimated_budget = formData.estimated_budget ? formData.estimated_budget.replace(/\D/g, "") : "";

		if (!formData.reminder_send_to.length && formData.is_reminders_set === 1) {
			showError.value = true;
		}

		v$.value.$validate();

		const isValidCustomFields = customFieldRef.value.isValidate();

		if (!v$.value.$error && !showError.value && !showReminderError.value && !showNoticePeriodError.value && isValidCustomFields) {
			if (route.params?.id) {
				submitEditData(value);
			} else {
				submitAddData(value);
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

	const submitAddData = async (value: any) => {
		try {
			formData.contract_type = contract_number.value;
			if (value !== "save") {
				loading.value = true;
			} else {
				loadingSave.value = true;
			}

			const fd = new FormData();
			Object.keys(formData).forEach((field) => {
				if (field === "reminder_send_to") {
					formData.reminder_send_to?.forEach((value: any) => {
						fd.append("reminder_send_to" + "[]", value);
					});
				} else {
					fd.append(field, formData?.[field]);
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

			const res: any = await useApiFetch("/contracts", {
				method: "POST",
				body: fd,
			});

			emit("disable", false);
			contract_id.value = res.data?.id;

			store.setContractNumber(formData.contract_number);
			if (value !== "save") {
				store.setActiveTab("upload-contract");
				emit("active-tab-name", "upload-contract");
				navigateTo(
					localePath({
						path: `/contracts/edit-contract/${res.data?.id}`,
						query: { tab: "upload-contract" },
					}),
					{ replace: true }
				);
			} else {
				navigateTo(localePath("/contracts"));
				useToast("success", res?.message);
			}
		} catch {
		} finally {
			loading.value = false;
			loadingSave.value = false;
		}
	};

	const submitEditData = async (value: any) => {
		try {
			if (value !== "save") {
				loading.value = true;
			} else {
				loadingSave.value = true;
			}

			formData.contract_type = contract_number.value;

			emit("disabled", true);

			const fd = new FormData();
			Object.keys(formData).forEach((field) => {
				if (field === "reminder_send_to") {
					formData.reminder_send_to?.forEach((value: any) => {
						fd.append("reminder_send_to" + "[]", value);
					});
				} else {
					fd.append(field, formData?.[field]);
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

			const res: any = await useApiFetch(`/contracts/${route.params?.id}/primary-details`, {
				method: "POST",
				body: fd,
			});

			store.setContractNumber(formData.contract_number);

			if (value !== "save") {
				store.setActiveTab("upload-contract");
				emit("active-tab-name", "upload-contract");
				if (route.query.page == "view") {
					navigateTo(
						localePath({
							path: "/contracts/view-contract/" + route?.params?.id,
							query: { tab: "upload-contract", page: "view" },
						}),
						{ replace: true }
					);
				} else {
					navigateTo(
						localePath({
							path: route.fullPath,
							query: { tab: "upload-contract" },
						}),
						{ replace: true }
					);
				}
			} else {
				useToast("success", res.message);
				sessionStorage.setItem("ContractCreateClick", "0");
				if (route.query.page == "view") {
					navigateTo(
						localePath({
							path: "/contracts/view-contract/" + route?.params?.id,
							query: { tab: "primary-details", page: "view" },
						}),
						{ replace: true }
					);
				} else {
					navigateTo(localePath("/contracts"));
				}
			}

			formData.contract_type = contractTypeCopy[formData.contract_type];
		} catch {
		} finally {
			loading.value = false;
			loadingSave.value = false;
		}
	};

	const disabledDate = (date: any) => {
		if (formData.status == 4) {
			var d = new Date();
			d.setDate(d.getDate() - 1);
			if (date > d) {
				return true;
			}
		} else {
			const curretDate = moment(date).format();
			const newDate = formData?.contract_start_date ? moment(formData?.contract_start_date)?.format() : "";

			if (curretDate < newDate) {
				return true;
			} else {
				return false;
			}
		}
	};

	const disabledStartDate = (date: any) => {
		if (formData.status == 4) {
			var d = new Date();
			d.setDate(d.getDate() - 1);
			if (date > d) {   
				return true;
			}
		} else {
			const curretDate = moment(date).format();
			const newDate = formData.contract_end_date ? moment(formData.contract_end_date)?.format() : "";
			if (formData.contract_end_date) {
				if (curretDate < newDate) {
					return false;
				} else {
					return true;
				}
			} else {
				return false;
			}
		}
	};

	const currecyChange = (value: any) => {
		v$.value.currency.$touch();
		const data: any = CurrencySymbole;
		formData.currency_symbol = data[formData.currency];
	};

	const reminderSetChange = () => {
		formData.reminder_send_to = [];
		getReminderData.value = [];
		formData.reminder_from_days = "";
		formData.frequency_of_days = "";
		v$.value.$reset();
		showError.value = false;
		showNoticePeriodError.value = false;
		showReminderError.value = false;
	};

	const dropdownSelectedReminderValue = (data: any) => {
		showError.value = false;
		formData.reminder_send_to = data;
	};

	const dropdownValue = () => {
		if (!formData.reminder_send_to.length && formData.is_reminders_set === 1) {
			showError.value = true;
		}
	};

	const isShowMasterContract = computed(() => {
		return formData.contract_type === 3;
	});

	const getSelectedReminderData = computed(() => {
		return getReminderData.value;
	});

	const dropdownSelectedContractData = (value: any) => {
		formData.contract_type = value;
		contract_number.value = value;
		getAutoGenerateNumber();
	};

	const getSelectedContractType = computed(() => {
		ContractData.find((data) => {
			return data.value === formData.contract_type;
		});
	});

	const valueOfContractChange = () => {
		let value = formData.value_of_contract.replace(/\D/g, "");
		value = value.slice(0, 10);
		if (value > 0) {
			v$.value.value_of_contract.$touch();
			formData.value_of_contract = commaThreeDigitFormat(value);
		}
	};

	const budgetChange = () => {
		let value = formData.estimated_budget.replace(/\D/g, "");
		value = value.slice(0, 10);
		if (value > 0) {
			v$.value.estimated_budget.$touch();
			formData.estimated_budget = commaThreeDigitFormat(value);
		}
	};

	const statusChange = () => {
		v$.value.status.$touch();
		v$.value.contract_start_date.$reset();
		v$.value.contract_end_date.$reset();
		formData.contract_end_date = "";
		formData.contract_start_date = "";
		if (formData.status == 3 || formData.status == 4) {
			showContractDates.value = true;
		} else {
			showContractDates.value = false;
		}
	};

	const deleteContract = async () => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch(`/contracts/${route.params?.id}`, {
				method: "DELETE",
			});

			useToast("success", res.message);
			dialogVisible.value = false;
			navigateTo(localePath("/contracts"));
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const dialogOkClick = (value: any) => {
		dialogVisible.value = value;
	};

	const cancel = () => {
		if (isClone.value === 1 && !formData.title) {
			dialogVisible.value = true;
		} else {
			navigateTo(localePath("/contracts"));
		}
	};

	const reminderChange = (value: any) => {
		v$.value.reminder_from_days.$touch();
		if (formData.reminder_from_days.length && +formData.reminder_from_days < +formData.notice_period_days) {
			showReminderError.value = true;
		} else {
			showReminderError.value = false;
		}
	};

	const noticePeriodChange = (value: any) => {
		v$.value.notice_period_days.$touch();
		if (formData.notice_period_days.length && formData.reminder_from_days.length && +formData.notice_period_days > +formData.reminder_from_days) {
			showNoticePeriodError.value = true;
		} else {
			showNoticePeriodError.value = false;
		}
	};

	const getMasterContracts = async (value: any) => {
		try {
			searchValue.value = value;
			const res = await useApiFetch(`/master-contracts-list?searchValue=${searchValue.value}&contract_id=${route.params?.id}`, {
				method: "GET",
			});

			masterContracts.value = res?.data.map((contract: any) => {
				return {
					label: contract.contract_number + " - " + contract.title,
					value: contract.id,
				};
			});
		} catch {}
	};

	const categoryLavelOneApiCall = async () => {
		const data = await getCategoriesApiCall(0);
		categories.value = data.map((category: any) => {
			return {
				label: category.category_name,
				value: category.id,
			};
		});

		await categoryLevelTwoApiCall();
	};

	const categoryLevelTwoApiCall = async () => {
		const data = await getCategoriesApiCall(formData.category_level_1);
		categories.value = data.map((category: any) => {
			return {
				label: category.category_name,
				value: category.id,
			};
		});

		await categoryLavelThreeApiCall();
	};

	const categoryLavelThreeApiCall = async () => {
		const data = await getCategoriesApiCall(formData.category_level_2);
		categories.value = data.map((category: any) => {
			return {
				label: category.category_name,
				value: category.id,
			};
		});
	};

	const getCategoriesApiCall = async (categoryId: any) => {
		try {
			const res = await useApiFetch(`/categories?parent_id=${categoryId}&perPage=15&searchValue=${searchValue.value}`, {
				method: "GET",
			});

			return res.data?.data;
		} catch {}
	};

	const getCategories = async () => {
		const data = await getCategoriesApiCall(categoryId.value);
		categories.value = data.map((category: any) => {
			return {
				label: category.category_name,
				value: category.id,
			};
		});

		return categories.value;
	};

	const getSelectedCategoryData = computed(() => {
		return categories.value.find((data: any) => data.value === formData.category_level_1);
	});

	const getSelectedSecondCategoryData = computed(() => {
		categories.value.find((data: any) => {
			return data.value === formData.category_level_2;
		});
	});

	const getSelectedThirdCategoryData = computed(() => {
		return categories.value.find((data: any) => data.value === formData.category_level_3);
	});

	const categoryLevelOneSelected = (value: any) => {
		formData.category_level_1 = value;
		categoryId.value = value;
		formData.category_level_2 = "";
		formData.category_level_3 = "";
	};

	const categoryLevelTwoSelected = (value: any) => {
		formData.category_level_2 = value;
		categoryId.value = value;
		formData.category_level_3 = "";
		getCategories();
	};

	const categoryLevelThreeSelected = (value: any) => {
		formData.category_level_3 = value;
		categoryId.value = value;
		getCategories();
	};

	const categoryLevelOneChange = () => {
		categories.value = [];
		categoryId.value = 0;
		getCategories();
	};

	const categoryLevelTwoChange = () => {
		categories.value = [];
		categoryId.value = formData.category_level_1;
		getCategories();
	};

	const categoryLevelThreeChange = () => {
		categories.value = [];
		categoryId.value = formData.category_level_2;
		getCategories();
	};

	const searchCategoryLevel = (value: any) => {
		searchValue.value = value;
		if (searchValue) {
			getCategories();
		}
	};
</script>

<template>
	<div class="p-6">
		<el-form class="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-7 md:gap-8 xl:gap-10">
			<el-form-item class="mb-0 flex-1" :label="$t('formLabels.project_number')">
				<template #label>
					<BaseLabel :label="$t('formLabels.project_number')" :tooltip-content="$t('info.project_number')" />
				</template>
				<el-input
					v-model.trim="formData.project_code"
					type="text"
					name="project_code"
					:disabled="disabled"
					maxLength="10"
					:class="{
						error: v$.project_code.$error,
					}"
					@keypress="CharcAndNumber"
					@change="v$.project_code.$touch"
				/>
				<span v-if="v$.project_code.$error" class="text-xs text-red-500 mt-2">{{ v$.project_code.$errors[0].$message }}</span>
			</el-form-item>

			<el-form-item class="mb-0 flex-1" :rules="[{ required: true }]" :label="$t('formLabels.parent_entity')">
				<template #label>
					<BaseLabel :label="$t('formLabels.parent_entity')" :tooltip-content="$t('info.parent_entity')" :isShowLabel="false" />
				</template>
				<el-input
					v-model="formData.parent_entity"
					type="text"
					name="parent_entity"
					:disabled="disabled"
					maxLength="100"
					:class="{
						error: v$.parent_entity.$error,
					}"
					@change="v$.parent_entity.$touch"
				/>
				<span v-if="v$.parent_entity.$error" class="text-xs text-red-500 mt-2">{{ v$.parent_entity.$errors[0].$message }}</span>
			</el-form-item>

			<el-form-item class="mb-0" :label="$t('formLabels.signing_entity')">
				<template #label>
					<BaseLabel :label="$t('formLabels.signing_entity')" :tooltip-content="$t('info.signing_entity')" />
				</template>
				<BaseSelectDropdown
					v-model="formData.signing_entity_id"
					name="sub_entity"
					:dropdown-option="subEntityData"
					:number-only="false"
					:disabled="disabled"
					:get-selected-country="getSelectedSubEntity"
					@selected-value="dropdownSelectedSubEntity"
				/>
			</el-form-item>

			<el-form-item :rules="[{ required: true }]" class="mb-0 flex-1" :label="$t('formLabels.contract_title')">
				<template #label>
					<BaseLabel :label="$t('formLabels.contract_title')" :tooltip-content="$t('info.title')" :isShowLabel="false" />
				</template>
				<el-input
					v-model="formData.title"
					type="text"
					name="title"
					:class="{
						error: v$.title.$error,
					}"
					maxLength="50"
					:disabled="disabled"
					@change="v$.title.$touch"
				/>
				<span v-if="v$.title.$error" class="text-xs text-red-500 mt-2">{{ v$.title.$errors[0].$message }}</span>
			</el-form-item>

			<el-form-item :rules="[{ required: true }]" class="mb-0 flex-1" :label="$t('formLabels.contract_description')">
				<template #label>
					<BaseLabel :label="$t('formLabels.contract_description')" :tooltip-content="$t('info.contract_description')" :isShowLabel="false" />
				</template>
				<el-input
					v-model="formData.contract_description"
					type="text"
					name="contract_description"
					:class="{
						error: v$.contract_description.$error,
					}"
					maxLength="200"
					:disabled="disabled"
					@change="v$.contract_description.$touch"
					@keypress="CharcAndNumber"
				/>
				<span v-if="v$.contract_description.$error" class="text-xs text-red-500 mt-2">{{ v$.contract_description.$errors[0].$message }}</span>
			</el-form-item>

			<el-form-item :rules="[{ required: true }]" class="mb-0 flex-1" :label="$t('formLabels.contract_type')">
				<template #label>
					<BaseLabel :label="$t('formLabels.contract_type')" :tooltip-content="$t('info.contract_type')" :isShowLabel="false" />
				</template>
				<BaseSelectDropdown
					v-model="formData.contract_type"
					:dropdown-option="ContractData"
					:get-selected-country="getSelectedContractType"
					:number-only="false"
					name="contract_type"
					:class="{
						error: v$.contract_type.$error,
					}"
					:disabled="disabled"
					@selected-value="dropdownSelectedContractData"
					@change="v$.contract_type.$touch"
				/>
				<span v-if="v$.contract_type.$error" class="text-xs text-red-500 mt-2">{{ v$.contract_type.$errors[0].$message }}</span>
			</el-form-item>

			<el-form-item :rules="[{ required: true }]" class="mb-0 flex-1" :label="$t('formLabels.contract_number')">
				<template #label>
					<BaseLabel :label="$t('formLabels.contract_number')" :tooltip-content="$t('info.contract_number')" />
				</template>
				<el-input
					v-model.trim="formData.contract_number"
					type="text"
					name="contract_number"
					:class="{
						error: v$.contract_number.$error,
					}"
					:disabled="disabled"
					@change="v$.contract_number.$touch"
					@keypress="CharcAndNumber"
				/>
				<span v-if="v$.contract_number.$error" class="text-xs text-red-500 mt-2">{{ v$.contract_number.$errors[0].$message }}</span>
			</el-form-item>

			<el-form-item v-if="isShowMasterContract" class="mb-0" :label="$t('formLabels.master_contract_id')">
				<template #label>
					<BaseLabel :label="$t('formLabels.master_contract_id')" :tooltip-content="$t('info.master_contract_id')" :isShowLabel="false" />
				</template>
				<BaseSelectDropdown
					v-model="formData.master_contract_id"
					:dropdown-option="masterContracts"
					:get-selected-country="
						() => {
							masterContracts.value.find((data) => data.value === formData.master_contract_id);
						}
					"
					:number-only="false"
					:isRemoteFilter="true"
					:disabled="disabled"
					name="master_contract_id"
					@remote-search="getMasterContracts"
					@selected-value="
						(value) => {
							formData.master_contract_id = value;
						}
					"
				/>
			</el-form-item>

			<el-form-item class="mb-0" :rules="[{ required: true }]" :label="$t('formLabels.contract_owner')">
				<template #label>
					<BaseLabel :label="$t('formLabels.contract_owner')" :tooltip-content="$t('info.contract_owner')" :isShowLabel="false" />
				</template>
				<BaseSelectDropdown
					v-model="formData.contract_owner_id"
					:dropdown-option="clientManagers"
					:get-selected-country="getSelectedMangers"
					:number-only="false"
					:isRemoteFilter="true"
					name="contract_owner_id"
					:class="{
						error: v$.contract_owner_id.$error,
					}"
					:disabled="disabled"
					@remote-search="getClientManagers"
					@selected-value="dropdownSelectedManagerValue"
					@change="v$.contract_owner_id.$touch"
				/>
				<span v-if="v$.contract_owner_id.$error" class="text-xs text-red-500 mt-2">{{ v$.contract_owner_id.$errors[0].$message }}</span>
			</el-form-item>

			<el-form-item class="mb-0" :rules="[{ required: true }]" :label="$t('formLabels.supplier_name')">
				<template #label>
					<BaseLabel :label="$t('formLabels.supplier_name')" :tooltip-content="$t('info.supplier_name')" />
				</template>
				<BaseSelectDropdown
					v-model="formData.tenant_supplier_id"
					:dropdown-option="supplierLeads"
					:get-selected-country="getSelectedSupplierLead"
					:number-only="false"
					:isRemoteFilter="true"
					:disabled="disabled"
					name="tenant_supplier_id"
					:class="{
						error: v$.tenant_supplier_id.$error,
					}"
					@remote-search="getSupplierLeads"
					@selected-value="dropdownSelectedSupplierLead"
					@change="v$.tenant_supplier_id.$touch"
				/>
				<span v-if="v$.tenant_supplier_id.$error" class="text-xs text-red-500 mt-2">{{ v$.tenant_supplier_id.$errors[0].$message }}</span>
			</el-form-item>

			<el-form-item :rules="[{ required: true }]" class="mb-0" :label="$t('formLabels.category_level_1')">
				<template #label>
					<BaseLabel :label="$t('formLabels.category_level_1')" :tooltip-content="$t('info.category_level_1')" :isShowLabel="false" />
				</template>
				<BaseSelectDropdown
					v-model="formData.category_level_1"
					:dropdown-option="categories"
					:get-selected-country="getSelectedCategoryData"
					:number-only="false"
					:isRemoteFilter="true"
					name="category_level_1"
					:class="{
						error: v$.category_level_1.$error,
					}"
					:disabled="disabled"
					@selected-value="categoryLevelOneSelected"
					@remote-search="searchCategoryLevel"
					@change="v$.category_level_1.$touch"
					@dropdown-change="categoryLevelOneChange"
				/>
				<span v-if="v$.category_level_1.$error" class="text-xs text-red-500 mt-2">{{ v$.category_level_1.$errors[0].$message }}</span>
			</el-form-item>

			<el-form-item class="mb-0" :label="$t('formLabels.category_level_2')">
				<template #label>
					<BaseLabel :label="$t('formLabels.category_level_2')" :tooltip-content="$t('info.category_level_2')" :isShowLabel="false" />
				</template>
				<BaseSelectDropdown
					v-model="formData.category_level_2"
					:dropdown-option="categories"
					:get-selected-country="getSelectedSecondCategoryData"
					:number-only="false"
					:isRemoteFilter="true"
					name="category_level_2"
					:disabled="!formData.category_level_1 || disabled"
					@remote-search="searchCategoryLevel"
					@selected-value="categoryLevelTwoSelected"
					@dropdown-change="categoryLevelTwoChange"
				/>
			</el-form-item>

			<el-form-item class="mb-0" :label="$t('formLabels.category_level_3')">
				<template #label>
					<BaseLabel :label="$t('formLabels.category_level_3')" :tooltip-content="$t('info.category_level_3')" :isShowLabel="false" />
				</template>
				<BaseSelectDropdown
					v-model="formData.category_level_3"
					:dropdown-option="categories"
					:get-selected-country="getSelectedThirdCategoryData"
					:number-only="false"
					:isRemoteFilter="true"
					name="category_level_3"
					:disabled="!formData.category_level_2 || disabled"
					@remote-search="searchCategoryLevel"
					@selected-value="categoryLevelThreeSelected"
					@dropdown-change="categoryLevelThreeChange"
				/>
			</el-form-item>

			<el-form-item class="mb-0" :label="$t('formLabels.currency')" :rules="[{ required: true }]">
				<template #label>
					<BaseLabel :label="$t('formLabels.currency')" :tooltip-content="$t('info.currency')" />
				</template>
				<BaseSelectDropdown
					v-model="formData.currency"
					name="currency"
					:dropdown-option="CurrencyData"
					:get-selected-country="getSelectedCurrencyData"
					:number-only="false"
					:class="{
						error: v$.currency.$error,
					}"
					:disabled="disabled"
					@selected-value="dropdownSelectedCurrencyValue"
					@change="currecyChange"
				/>
				<span v-if="v$.currency.$error" class="text-xs text-red-500 mt-2">{{ v$.currency.$errors[0].$message }}</span>
			</el-form-item>

			<div class="flex items-start label-upper-dropdown">
				<div class="w-10 flex-initial mt-6">
					<el-form-item class="mb-0 flex-1">
						<el-input v-model.trim="formData.currency_symbol" type="text" disabled />
					</el-form-item>
				</div>

				<el-form-item :rules="[{ required: true }]" class="ml-3 flex-1 mt-6" :label="$t('formLabels.value_of_contract')" >
					<template #label>
						<BaseLabel :label="$t('formLabels.value_of_contract')" :tooltip-content="$t('info.value_of_contract')" :isShowLabel="false" />
					</template>
					<el-input
						v-model.trim="formData.value_of_contract"
						type="text"
						name="value_of_contract"
						:class="{
							error: v$.value_of_contract.$error,
						}"
						:disabled="disabled"
						maxLength="13"
						@change="valueOfContractChange"
						@keypress="NumbersOnly"
					/>
					<span v-if="v$.value_of_contract.$error" class="text-xs text-red-500 mt-2">{{ v$.value_of_contract.$errors[0].$message }}</span>
				</el-form-item>
			</div>

			<div class="flex items-center">
				<div class="inline-flex items-center mr-5">
					<span class="text-dark font-bold block">{{ $t("formLabels.is_personal_data_involved") }}</span>
					<BaseLabel :tooltip-content="$t('info.is_personal_data_involved')" :isShowLabel="false" />
				</div>
				<el-radio-group v-model="formData.is_personal_data_involved" class="ml-4" :disabled="disabled">
					<el-radio :label="1" size="large">{{ $t("formLabels.yes") }}</el-radio>
					<el-radio :label="0" size="large">{{ $t("formLabels.no") }}</el-radio>
				</el-radio-group>
			</div>

			<div class="flex items-start label-upper-dropdown">
				<div class="w-10 flex-initial mt-6">
					<el-form-item class="mb-0 flex-1">
						<el-input v-model.trim="formData.currency_symbol" type="text" disabled />
					</el-form-item>
				</div>

				<el-form-item :rules="[{ required: true }]" class="ml-3 flex-1 mt-6" :label="$t('formLabels.estimated_budget')">
					<template #label>
						<BaseLabel :label="$t('formLabels.estimated_budget')" :tooltip-content="$t('info.estimated_budget')" :isShowLabel="false" />
					</template>
					<el-input
						v-model.trim="formData.estimated_budget"
						type="text"
						name="estimated_budget"
						:class="{
							error: v$.estimated_budget.$error,
						}"
						:disabled="disabled"
						maxLength="13"
						@change="budgetChange"
						@keypress="NumbersOnly"
					/>
					<span v-if="v$.estimated_budget.$error" class="text-xs text-red-500 mt-2">{{ v$.estimated_budget.$errors[0].$message }}</span>
				</el-form-item>
			</div>

			<el-form-item class="mb-0" :label="$t('formLabels.budget_owner')">
				<template #label>
					<BaseLabel :label="$t('formLabels.budget_owner')" :tooltip-content="$t('info.budget_owner')" :isShowLabel="false" />
				</template>
				<BaseSelectDropdown
					v-model="formData.budget_owner_id"
					:dropdown-option="clientManagers"
					:get-selected-country="
						() => {
							clientManagers.value.find((data) => data.value === formData.budget_owner_id);
						}
					"
					:number-only="false"
					:isRemoteFilter="true"
					name="budget_owner_id"
					:disabled="disabled"
					@remote-search="getClientManagers"
					@selected-value="
						(value) => {
							formData.budget_owner_id = value;
						}
					"
				/>
			</el-form-item>

			<el-form-item class="mb-0" :label="$t('formLabels.authorised_signatory_id')">
				<template #label>
					<BaseLabel :label="$t('formLabels.authorised_signatory_id')" :tooltip-content="$t('info.authorised_signatory_id')" />
				</template>
				<BaseSelectDropdown
					v-model="formData.authorised_signatory_id"
					:dropdown-option="clientManagers"
					:get-selected-country="
						() => {
							clientManagers.value.find((data) => data.value === formData.authorised_signatory_id);
						}
					"
					:number-only="false"
					:isRemoteFilter="true"
					name="authorised_signatory_id"
					:disabled="disabled"
					@remote-search="getClientManagers"
					@selected-value="
						(value) => {
							formData.authorised_signatory_id = value;
						}
					"
				/>
			</el-form-item>

			<el-form-item class="mb-0" :label="$t('formLabels.supplier_authorised_signatory_id')">
				<template #label>
					<BaseLabel
						:label="$t('formLabels.supplier_authorised_signatory_id')"
						:tooltip-content="$t('info.supplier_authorised_signatory_id')"
						:isShowLabel="false"
					/>
				</template>
				<BaseSelectDropdown
					v-model="formData.supplier_authorised_signatory_id"
					:dropdown-option="supplierLeads"
					:get-selected-country="
						() => {
							supplierLeads.value.find((data) => data.value === formData.supplier_authorised_signatory_id);
						}
					"
					:number-only="false"
					:isRemoteFilter="true"
					:disabled="disabled"
					name="supplier_authorised_signatory_id"
					@remote-search="getSupplierLeads"
					@selected-value="
						(value) => {
							formData.supplier_authorised_signatory_id = value;
						}
					"
				/>
			</el-form-item>

			<el-form-item class="mb-0" :label="$t('formLabels.department_line_of_business')">
				<template #label>
					<BaseLabel :label="$t('formLabels.department_line_of_business')" :tooltip-content="$t('info.department_line_of_business')"/>
				</template>
				<el-input
					v-model="formData.department_line_of_business"
					type="text"
					name="department_line_of_business"
					:disabled="disabled"
					maxLength="250"
					:class="{
						error: v$.department_line_of_business.$error,
					}"
					@change="v$.department_line_of_business.$touch"
					@keypress="CharcterWithWhitespace"
				/>
				<span v-if="v$.department_line_of_business.$error" class="text-xs text-red-500 mt-2">{{
					v$.department_line_of_business.$errors[0].$message
				}}</span>
			</el-form-item>

			<el-form-item class="mb-0" :rules="[{ required: true }]" :label="$t('formLabels.contract_term_type')">
				<template #label>
					<BaseLabel :label="$t('formLabels.contract_term_type')" :tooltip-content="$t('info.contract_term_type')" :isShowLabel="false" />
				</template>
				<BaseSelectDropdown
					v-model="formData.contract_term_type"
					name="contract_term_type"
					:class="{
						error: v$.contract_term_type.$error,
					}"
					:dropdown-option="ContractTermType"
					:get-selected-country="getSelectedContractTerm"
					:number-only="false"
					:disabled="disabled"
					@change="v$.contract_term_type.$touch"
					@selected-value="dropdownSelectedContractTerm"
				/>
				<span v-if="v$.contract_term_type.$error" class="text-xs text-red-500 mt-2">{{ v$.contract_term_type.$errors[0].$message }}</span>
			</el-form-item>

			<el-form-item class="mb-0" :rules="[{ required: true }]" :label="$t('formLabels.Status')">
				<template #label>
					<BaseLabel :label="$t('formLabels.Status')" :tooltip-content="$t('info.Status')" :isShowLabel="false" />
				</template>
				<BaseSelectDropdown
					v-model="formData.status"
					name="status"
					:class="{
						error: v$.status.$error,
					}"
					:dropdown-option="FormContractStatusData"
					:get-selected-country="getSelectedStatus"
					:number-only="false"
					:disabled="disabled || route.params?.id"
					@change="statusChange"
					@selected-value="dropdownSelectedStatus"
				/>
				<span v-if="v$.status.$error" class="text-xs text-red-500 mt-2">{{ v$.status.$errors[0].$message }}</span>
			</el-form-item>

			<div v-if="formData.status === 5 || formData.status === 6">
				<el-form-item class="mb-0" :rules="[{ required: true }]" :label="$t('formLabels.reason')">
					<template #label>
						<BaseLabel :label="$t('formLabels.reason')" :tooltip-content="$t('info.reason')" :isShowLabel="false" />
					</template>
					<el-input v-model="editData.reason" type="textarea" name="reason" :disabled="disabled" class="mt-4" />
				</el-form-item>
			</div>

			<el-form-item v-if="showContractDates" :rules="[{ required: true }]" class="mb-0" :label="$t('formLabels.contract_start_date')">
				<template #label>
					<BaseLabel :label="$t('formLabels.contract_start_date')" :tooltip-content="$t('info.contract_start_date')" :isShowLabel="false" />
				</template>
				<el-date-picker
					v-model.trim="formData.contract_start_date"
					type="date"
					placeholder="DD/MM/YYYY"
					format="DD/MM/YYYY"
					value-format="YYYY-MM-DD"
					name="contract_start_date"
					:disabled-date="disabledStartDate"
					:class="{
						error: v$.contract_start_date.$error,
					}"
					:disabled="disabled || route.params?.id"
					@change="v$.contract_start_date.$touch"
				/>
				<span v-if="v$.contract_start_date.$error" class="text-xs text-red-500 mt-2 w-full">{{
					v$.contract_start_date.$errors[0].$message
				}}</span>
			</el-form-item>

			<el-form-item v-if="showContractDates" :rules="[{ required: true }]" class="mb-0" :label="$t('formLabels.contract_end_date')">
				<template #label>
					<BaseLabel :label="$t('formLabels.contract_end_date')" :tooltip-content="$t('info.contract_end_date')" :isShowLabel="false" />
				</template>
				<el-date-picker
					v-model.trim="formData.contract_end_date"
					type="date"
					placeholder="DD/MM/YYYY"
					format="DD/MM/YYYY"
					value-format="YYYY-MM-DD"
					name="contract_end_date"
					:disabled-date="disabledDate"
					:class="{
						error: v$.contract_end_date.$error,
					}"
					:disabled="disabled || route.params?.id"
					@change="v$.contract_end_date.$touch"
				/>
				<span v-if="v$.contract_end_date.$error" class="text-xs text-red-500 mt-2 w-full">{{
					v$.contract_end_date.$errors[0].$message
				}}</span>
			</el-form-item>

			<el-form-item :rules="[{ required: true }]" class="mb-0 flex-1" :label="$t('formLabels.notice_period_days')">
				<template #label>
					<BaseLabel :label="$t('formLabels.notice_period_days')" :tooltip-content="$t('info.notice_period_days')" :isShowLabel="false" />
				</template>
				<el-input
					v-model.trim="formData.notice_period_days"
					type="text"
					name="notice_period_days"
					:class="{
						error: v$.notice_period_days.$error,
					}"
					maxLength="2"
					:disabled="disabled"
					@input="noticePeriodChange"
					@keypress="NumbersOnly"
				/>
				<span v-if="v$.notice_period_days.$error" class="text-xs text-red-500 mt-2">{{ v$.notice_period_days.$errors[0].$message }}</span>
				<span v-if="showNoticePeriodError" class="text-xs text-red-500 mt-2">{{
					"Notice Period Days should be less than the reminder days"
				}}</span>
			</el-form-item>

			<div class="flex items-center">
				<div class="inline-flex items-center mr-5">
					<span class="text-dark font-bold block">{{ $t("formLabels.reminders_set") }}</span>
					<BaseLabel :tooltip-content="$t('info.reminders_set')" :isShowLabel="false" />
				</div>
				<el-radio-group v-model="formData.is_reminders_set" class="ml-4" :disabled="disabled" @change="reminderSetChange">
					<el-radio :label="1" size="large">{{ $t("formLabels.yes") }}</el-radio>
					<el-radio :label="0" size="large">{{ $t("formLabels.no") }}</el-radio>
				</el-radio-group>
			</div>

			<div v-if="formData.is_reminders_set && !disabled">
				<el-form-item class="mb-0" :rules="[{ required: true }]" :label="$t('formLabels.reminder_send_to')">
					<template #label>
						<BaseLabel :label="$t('formLabels.reminder_send_to')" :tooltip-content="$t('info.reminder_send_to')" :isShowLabel="false" />
					</template>
					<BaseMultiSelectDropdown
						:disabled="disabled"
						:dropdown-option="reminderData"
						:get-selected-client="getSelectedReminderData"
						@selected-value="dropdownSelectedReminderValue"
						@blur="dropdownValue"
						:class="showError ? 'error' : ''"
					/>
				</el-form-item>
				<span v-if="formData.is_reminders_set && showError" class="text-xs text-red-500 mt-2">{{
					t("formValidations.reminder_send_to")
				}}</span>
			</div>

			<div v-if="formData.is_reminders_set && disabled">
				<p class="text-dark font-bold">{{ $t("formLabels.reminder_send_to") }}<span class="text-danger">*</span></p>
				<ul class="flex gap-1 mt-4">
					<li
						v-for="data in getSelectedReminderData"
						:key="data.value"
						class="bg-dark/10 rounded-md py-1 px-2 d-inline-block font-bold text-dark/80"
					>
						{{ data.label }}
					</li>
				</ul>
			</div>

			<div v-if="formData.is_reminders_set">
				<!-- <p class=">{{ $t("formLabels.sentence") }}</p> -->
				<el-form-item :rules="[{ required: true }]">
					<div class="flex flex-col w-full">
						<div class="flex items-center">
							<span class="text-dark font-bold text-base"
								>{{ $t("formLabels.send_reminders_from_days") }}<span class="text-danger">*</span>
								:
							</span>
							<BaseLabel :tooltip-content="$t('info.send_reminders_from_days')" :isShowLabel="false" />
							<el-input
								v-model="formData.reminder_from_days"
								size="small"
								class="inline-block w-14 mx-3 text-center"
								type="text"
								maxLength="2"
								:disabled="disabled"
								:class="{
									error: v$.reminder_from_days.$error,
								}"
								@input="reminderChange"
								@keypress="NumbersOnly"
							/>
						</div>
						<span v-if="v$.reminder_from_days.$error" class="text-xs text-red-500 mt-2 w-full">{{
							v$.reminder_from_days.$errors[0].$message
						}}</span>
						<span v-if="showReminderError" class="text-xs text-red-500 mt-2 block w-full">{{
							"Reminder days should be greater than the notice period days"
						}}</span>
						<!-- <span v-if="showReminderError" class="text-xs text-red-500 mt-2 block w-full">{{
							$t("formValidations.reminder_from_days")
						}}</span> -->

						<div class="flex items-center mt-4">
							<span class="text-dark font-bold text-base"
								>{{ $t("formLabels.at_frequency_days") }}<span class="text-danger">*</span> :
							</span>
							<BaseLabel :tooltip-content="$t('info.at_frequency_days')" :isShowLabel="false" />
							<el-input
								v-model="formData.frequency_of_days"
								size="small"
								class="inline-block w-14 mx-3 text-center"
								type="text"
								name="frequency_of_days"
								:disabled="disabled"
								maxLength="2"
								:class="{
									error: v$.frequency_of_days.$error,
								}"
								@change="v$.frequency_of_days.$touch"
								@keypress="NumbersOnly"
							/>
						</div>
						<span v-if="v$.frequency_of_days.$error" class="text-xs text-red-500 mt-2 w-full">{{
							v$.frequency_of_days.$errors[0].$message
						}}</span>
						<!-- <span v-if="showFrequencyError" class="text-xs text-red-500 mt-2 block w-full">{{
							$t("formValidations.frequency_of_days")
						}}</span> -->
					</div>
				</el-form-item>
			</div>

			<custom-input-add-edit
				ref="customFieldRef"
				:custom-data="customFields"
				module-name="contract"
				:disabled="disabled"
				custom-class="mb-0 flex-1"
				@update-data="(value) => Object.assign(customFields, value)"
			/>
		</el-form>

		<!-- buttons -->
		<div class="pt-6 text-right">
			<novok-button class="btn-dark my-1" @click.prevent="cancel"
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
		<BaseDeleteModal
			v-if="dialogVisible === true"
			:dialog-visible="dialogVisible"
			:delete-api="deleteContract"
			message-content="You did't fill these form details so Are you sure you want to delete this contract ? "
			@dialog-ok-click="dialogOkClick"
		/>
	</div>
</template>
