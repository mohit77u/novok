<script setup lang="ts">
	import { useVuelidate } from "@vuelidate/core";
	import { required, email, minLength, maxLength, helpers, requiredIf } from "@vuelidate/validators";
	import { commaThreeDigitFormat, getTimeZoneList } from "~/helper/common";
	import { ContractData, CurrencyData, CurrencySymbole, ContractTermType } from "~/helper/data";
	import { quotationTenderReminderData, QTactivityType, QTdocuments, QTdocumentsFileName } from "~/helper/data";
	import moment from "moment";
	import supplier from "~/middleware/supplier";
	import { useProfileStore } from "~/store/profile";
	import { useFullscreenLoading } from "~/store/fullscreenLoading";

	definePageMeta({
		middleware: ["auth"],
	});

	useHead({
		title: "Add Quotations & Tender",
	});

	const props = defineProps({
		disabled: {
			type: Boolean,
			default: false,
		},
	});

	let formData = ref<any>({
		qt_code: "",
		project_code: "",
		project_owner: "",
		signing_entity_id: "",
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
		combined_q_and_t_document: 0,
		attach_document: "",
		general_terms_and_conditions: "",
		sow_or_sor: "",
		pricing_matrix: "",
		evaluation_matrix: "",
		is_hide_evaluation_matrix_from_supplier: 0,
		business_continuity_policy: 0,
		anti_corruption_and_bribary_policy: 0,
		environmental_policy: 0,
		financial_reports: 0,
		modern_slavery_policy: 0,
		social_values: 0,
		delete_document_ids: "",
		timezone: "Europe/London",
	});
	const copyData = ref<any>({});
	const categories = ref<any>([]);
	const subCategories = ref<any>([]);
	const searchValue = ref<any>("");
	const evaluationMatrixRef = ref<any>(null);
	const attachDocumentRef = ref<any>(null);
	const termsNconditionsRef = ref<any>(null);
	const sowSorDocumentsRef = ref<any>(null);
	const pricingMatrixRef = ref<any>(null);
	const getReminderData = ref<any>([]);
	const dialogVisible = ref(false);
	const sowDialogVisible = ref(false);
	const profileStore = useProfileStore();

	const localePath = useLocalePath();
	const fullscreenLoading = ref<any>(false);
	const loading = ref<any>(false);
	const loadingSave = ref<any>(false);
	// const showError = ref<any>(false);
	const countryData = ref<any>([]);
	const projectData = ref<any>([]);
	const projectAllData = ref<any>([]);
	const supplierData = ref<any>([]);
	const document_id = ref("");
	const deleteDocumentIds = ref<any>([]);
	const copyEditData = ref<any>({
		attach_document: "",
		general_terms_and_conditions: "",
		sow_or_sor: "",
		pricing_matrix: "",
		evaluation_matrix: "",
	});
	const fields = ref<any>([
		{
			supplier_id: "",
			// supplier_name: "",
			supplier_code: "",
			supplierNameRequired: false,
			supplierCodeRequired: false,
		},
	]);
	const customFields = reactive([]);
	const customFieldRef = ref<any>(null);

	const fileLabels = ref<any>({
		attach_document_file_name: "",
		general_terms_and_conditions_file_name: "",
		sow_or_sor_file_name: "",
		pricing_matrix_file_name: "",
		evaluation_matrix_file_name: "",
		isGeneralFileError: false,
		isSowFileError: false,
		isPriceMatrixFileError: false,
		isEvaluationFileError: false,
	});

	const files = ref<any>({
		general_terms_and_conditions: "general_terms_and_conditions_file_name",
		sow_or_sor: "sow_or_sor_file_name",
		pricing_matrix: "pricing_matrix_file_name",
		evaluation_matrix: "evaluation_matrix_file_name",
	});

	// const deleteFile = ref<any>({
	// 	general_terms_and_conditions: "is_delete_general_terms_and_conditions",
	// 	sow_or_sor: "is_delete_sow_or_sor",
	// 	pricing_matrix: "is_delete_pricing_matrix",
	// 	evaluation_matrix: "is_delete_evaluation_matrix",
	// });
	const signingEntityName = ref("");
	const parentEntityName = ref("");
	const attechDocument = ref<any>([]);
	const assignedSuppliers = ref<any>([]);
	const filteredSuppliersList = ref<any>([]);
	const supplierAllData = ref<any>({});
	const authorisers = ref<any>([]);
	const selectedSuppliersData = ref<any>([
		{
			value: "",
			label: "",
		},
	]);

	const { t } = useI18n();
	const route = useRoute();

	const rules = computed(() => {
		return {
			qt_code: {
				required: helpers.withMessage(t("formValidations.tender_quotation_code"), required),
			},
			project_code: {
				required: helpers.withMessage(t("formValidations.project_number"), required),
			},
			project_owner: {
				required: helpers.withMessage(t("formValidations.project_owner"), required),
			},
			authoriser_id: {
				required: helpers.withMessage(t("formValidations.qt_authoriser"), required),
			},
			title: {
				required: helpers.withMessage(t("formValidations.title"), required),
				name_validation: {
					$validator: PasteCharcAndNumWithSpace,
					$message: t("copyPasteValidations.charNum"),
				},
			},
			activity_type: {
				required: helpers.withMessage(t("formValidations.activity_type"), required),
			},
			country_to_serve: {
				required: helpers.withMessage(t("formValidations.country"), required),
			},
			project_summary: {
				required: helpers.withMessage(t("formValidations.project_summary"), required),
				name_validation: {
					$validator: PasteCharcAndNumWithSpace,
					$message: t("copyPasteValidations.charNum"),
				},
			},
			category_level_1: {
				required: helpers.withMessage(t("formValidations.category_level_1"), required),
			},
			estimated_contract_value: {
				// name_validation: {
				// 	$validator: PasteNumberOnly,
				// 	$message: t("copyPasteValidations.number"),
				// },
			},
			open_date: {
				required: helpers.withMessage(t("formValidations.open_date"), required),
			},
			open_time: {
				required: helpers.withMessage(t("formValidations.open_time"), required),
			},
			clarification_open_date: {
				required: helpers.withMessage(t("formValidations.clarification_open_date"), required),
			},
			clarification_open_time: {
				required: helpers.withMessage(t("formValidations.clarification_open_time"), required),
			},
			clarification_close_date: {
				required: helpers.withMessage(t("formValidations.clarification_close_date"), required),
			},
			clarification_close_time: {
				required: helpers.withMessage(t("formValidations.clarification_close_time"), required),
			},
			close_date: {
				required: helpers.withMessage(t("formValidations.close_date"), required),
			},
			close_time: {
				required: helpers.withMessage(t("formValidations.close_time"), required),
			},
			reminder_send_to: {
				requiredIf: helpers.withMessage(t("formValidations.reminder_send_to"), requiredIf(formData.value.is_reminder)),
			},
			reminder_from_days: {
				requiredIf: helpers.withMessage(t("formValidations.reminder_from_days"), requiredIf(formData.value.is_reminder)),
				name_validation: {
					$validator: PasteNumberOnly,
					$message: t("copyPasteValidations.number"),
				},
			},
			attach_document: {
				requiredIf: helpers.withMessage(t("formValidations.attach_document"), requiredIf(formData.value.combined_q_and_t_document == 1)),
			},
			general_terms_and_conditions: {
				requiredIf: helpers.withMessage(t("formValidations.general_terms_and_conditions"), requiredIf(!formData.value.combined_q_and_t_document)),
			},
			sow_or_sor: {
				requiredIf: helpers.withMessage(t("formValidations.sow_or_sor"), requiredIf(!formData.value.combined_q_and_t_document)),
			},
			pricing_matrix: {
				requiredIf: helpers.withMessage(t("formValidations.pricing_matrix"), requiredIf(!formData.value.combined_q_and_t_document)),
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

	onMounted(async () => {
		// formData.currency_symbol = CurrencySymbole[formData.currency];

		await getProjectCode(searchValue.value);
		await getSuppliers(searchValue.value);
		await getAuthorisers(searchValue.value);
		await getCategories();
		await getCountries(searchValue.value);

		if (!route.params?.id) {
			const data = await getCustomField("q-and-t-client", "primary-details");
			data.forEach((obj: any) => {
				if (obj.input_type === "checkbox") {
					obj.input_value = [];
				} else {
					obj.input_value = "";
				}
			});

			Object.assign(customFields, data);

			await getQTCode();
		} else {
			await getEditData();
		}
	});

	const getAuthData = computed(() => {
		formData.value.timezone = profileStore.profileData.user_detail?.timezone ?? "Europe/London";
		return profileStore.profileData.user_detail;
	});

	watch(
		() => formData.value.category_level_1,
		(val) => {
			getSubCategories(val);
		}
	);

	const getEditData = async () => {
		useFullscreenLoading;
		fullscreenLoading.value = true;
		try {
			const res: any = await useApiFetch(`/tenders/${route.params?.id}?timezone=${formData.value.timezone}`, {
				method: "GET",
			});

			Object.assign(customFields, res.data?.custom_primary_details);

			const updatedFormData: any = {};
			Object.keys(formData.value).forEach((field: any) => {
				if (field !== undefined && field !== null) {
					// if (res.data?.[field] !== null) {
					updatedFormData[field] = res.data?.[field];
					// }
				}
				updatedFormData["country_to_serve"] = res.data?.country_to_serve?.length ? res.data?.country_to_serve?.split(",") : [];
				updatedFormData["reminder_send_to"] = res.data?.reminder_send_to?.length ? res.data?.reminder_send_to?.split(",") : [];
				updatedFormData["timezone"] = getAuthData.value?.timezone || "Europe/London";
			});

			formData.value = updatedFormData;
			signingEntityName.value = res.data?.signing_entity?.sub_entity_name;
			parentEntityName.value = res.data?.parent_entity;

			res.data?.documents.forEach((document: any) => {
				formData.value[QTdocuments[document.document_type]] = document.document_path;

				copyEditData.value[QTdocuments[document.document_type]] = { ...document, file_name: document.document_file_name };
				fileLabels.value[QTdocumentsFileName[document.document_type]] = document.document_file_name;
			});

			// Object.keys(fileLabels.value).forEach((field: any) => {
			// 	fileLabels.value[field] = formData.value?.[field];
			// });

			// if (res.data?.attach_document?.length) {
			// 	copyEditData.value.attach_document = {
			// 		document_path: res.data?.attach_document,
			// 		id: res.data?.id,
			// 		file_name: res.data?.attach_document_file_name,
			// 	};
			// }
			assignedSuppliers.value = res?.data?.assigned_suppliers;
			prepareSupplierNameCode(res?.data?.assigned_suppliers ?? []);

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

			formData.value.business_continuity_policy = formData.value.business_continuity_policy == 1 ? true : false;
			formData.value.anti_corruption_and_bribary_policy = formData.value.anti_corruption_and_bribary_policy == 1 ? true : false;
			formData.value.environmental_policy = formData.value.environmental_policy == 1 ? true : false;
			formData.value.financial_reports = formData.value.financial_reports == 1 ? true : false;
			formData.value.modern_slavery_policy = formData.value.modern_slavery_policy == 1 ? true : false;
			formData.value.social_values = formData.value.social_values == 1 ? true : false;

			if (formData.value.reminder_from_days === null) {
				formData.value.reminder_from_days = "";
			}
			if (formData.value.category_level_2 === null) {
				formData.value.category_level_2 = "";
			}

			(formData.value.open_time = moment(formData.value.open_date + " " + formData.value.open_time).format("hh:mm A")),
				(formData.value.close_time = moment(formData.value.close_date + " " + formData.value.close_time).format("hh:mm A")),
				(formData.value.clarification_open_time = moment(
					formData.value.clarification_open_date + " " + formData.value.clarification_open_time
				).format("hh:mm A")),
				(formData.value.clarification_close_time = moment(
					formData.value.clarification_close_date + " " + formData.value.clarification_close_time
				).format("hh:mm A"));

			getCountries(searchValue.value);

			copyData.value = JSON.parse(JSON.stringify(formData.value));
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	watchEffect(async () => {
		// This function will run every time the store updates
		// Access the computed property to trigger its evaluation

		getAuthData.value;
		// await getEditData();
	});

	const prepareSupplierNameCode = async (suppliers: any) => {
		let fieldsData: any = [];
		let selectedSuppData: any = [];

		if (suppliers?.length > 0) {
			suppliers?.forEach((field: any, index: any) => {
				fieldsData.push({
					// supplier_name: field?.company?.company_name || "",
					supplier_code: field?.sup_ref_number || "",
					supplier_id: field.id || "",
					supplierNameRequired: false,
					supplierCodeRequired: false,
				});
				selectedSuppData.push({
					label: field?.company?.company_name,
					value: field?.id,
				});
			});
			fields.value = fieldsData;
			selectedSuppliersData.value = selectedSuppData;
		}
	};

	const filterSuppliers = () => {
		const supplierIdsToRemove = new Set(fields.value.map((item: any) => item.supplier_id));

		let filteredArr: any = [];

		// Add disabled true
		supplierData.value.map((item: any) => {
			if (supplierIdsToRemove.has(item.value)) {
				item.disabled = true;
			} else {
				item.disabled = false;
			}
			filteredArr.push(item);
		});

		filteredSuppliersList.value = filteredArr;
	};

	const getAuthorisers = async (value: any) => {
		searchValue.value = value;
		try {
			const res: any = await useApiFetch(`/tender-authoriser-list?perPage=15&sortColumn=&sortOrder=&searchValue=${value}`, {
				method: "GET",
			});
			authorisers.value = res.data?.data?.map((data: any) => {
				return {
					label: data.full_name + " " + "(" + data.email + ")",
					value: data.id,
				};
			});
		} catch {}
	};

	const getCategories = async () => {
		try {
			const res: any = await useApiFetch(`/qt/categories?perPage=15&sortColumn=&sortOrder=&searchValue=${searchValue.value}&parent_id=0`, {
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

			const res: any = await useApiFetch(`/qt/categories?parent_id=${CatValue}&perPage=15&searchValue=${searchValue.value}`, {
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

	const getCountries = async (value: any) => {
		searchValue.value = value;
		try {
			const res: any = await useApiFetch(`/qt/countries?perPage=50&searchValue=${value}`, {
				method: "GET",
			});
			countryData.value = res.data?.data?.map((country: any) => {
				return {
					label: country.name + " " + country.code,
					value: country.name,
				};
			});
		} catch {}
	};

	const getQTCode = async () => {
		try {
			const res: any = await useApiFetch(`/generate-qt-code`, {
				method: "GET",
			});
			formData.value.qt_code = res.data?.qt_code;
		} catch {}
	};

	const getProjectCode = async (value: any) => {
		searchValue.value = value;
		try {
			const res: any = await useApiFetch(`/qt/projects?perPage=50&searchValue=${value}`, {
				method: "GET",
			});
			projectAllData.value = res.data.data;
			projectData.value = res.data?.data?.map((projectcode: any) => {
				return {
					label: projectcode.project_number,
					value: projectcode.project_number,
				};
			});
		} catch {}
	};

	const getSuppliers = async (value: any) => {
		searchValue.value = value;
		try {
			const res: any = await useApiFetch(`/qt/suppliers?perPage=50&searchValue=${value}`, {
				method: "GET",
			});
			supplierAllData.value = res.data.data;
			supplierData.value = res.data?.data?.map((supplier: any) => {
				return {
					label: supplier.company_name + " " + "(" + supplier.full_name + ")",
					value: supplier.id,
				};
			});

			filterSuppliers();
		} catch {}
	};

	const getCountryData = computed(() => {
		return countryData.value;
	});

	const getSelectedCountryData = computed(() => {
		const data = formData.value.country_to_serve?.map((country: any) => {
			return {
				label: country,
				value: country,
			};
		});
		return data;
	});

	const dropdownSelectedCountries = (value: any) => {
		formData.value.country_to_serve = value;
	};

	const handleCategoryChange = async () => {
		formData.value.sub_category = "";
		getSubCategories();
	};
	const categoryDropdownSearch = (value: any) => {
		searchValue.value = value;
		if (searchValue) {
			getCategories();
		}
	};

	const getSelectedCategory = computed(() => {
		return categories.value.map((data: any) => data.id === formData.value.category_level_1);
	});

	const dropdownSelectedCategory = (value: any) => {
		formData.value.category_level_1 = value;
	};

	const getSelectedSubCategory = computed(() => {
		return subCategories.value.find((data: any) => data.value == formData.value.category_level_2);
	});

	const dropdownSelectedSubCategory = (value: any) => {
		formData.value.sub_category = value;
	};

	const getSelectedCurrencyData = computed(() => {
		return CurrencyData.find((data) => data.value === formData.value.currency);
	});

	const dropdownSelectedCurrencyValue = (value: any) => {
		formData.value.estimated_contract_value_currency = value;
	};

	// const dropdownValue = () => {
	// 	if (formData.is_reminder === 1) {
	// 		// showError.value = true;
	// 	}
	// };

	const reminderChange = () => {
		v$.value.reminder_send_to.$reset();
		formData.value.reminder_send_to = [];
	};

	const publicTenderChange = async () => {};

	const estimatedContractChange = () => {
		v$.value.estimated_contract_value.$touch();
		let value = formData.value.estimated_contract_value.replace(/\D/g, "");
		value = value.slice(0, 10);
		if (value > 0) {
			formData.value.estimated_contract_value = commaThreeDigitFormat(value);
		}
	};

	const imgOnChange = (value: any) => {
		attechDocument.value = [];
		formData.value.attach_document = value.file;
		attechDocument.value.push(value.file);
	};

	const handleRemove = (value: any) => {
		if (value.name !== "") {
			formData.value.attach_document = "";
			formData.value.is_delete_attach_document = 1;
			copyEditData.value.attach_document = "";
			attechDocument.value = [];
			// formData.do_you_have_identified_supplier = 0;
		}
	};

	const disabledStartDate = (date: any) => {
		var d = new Date();
		d.setDate(d.getDate() - 1);
		if (date < d) {
			return true;
		}
	};

	const disabledCloseDate = (date: any) => {
		const curretDate = moment(date).format();
		const newDate = formData.value.open_date ? moment(formData.value.open_date)?.format() : "";
		if (curretDate < newDate) {
			return true;
		} else {
			return false;
		}
	};

	const disabledCheckInOpenDate = (date: any) => {
		const curretDate = moment(date).format();
		const openDate = formData.value.open_date ? moment(formData.value.open_date)?.format() : "";
		const closeDate = formData.value.close_date ? moment(formData.value.close_date)?.format() : "";

		if (curretDate >= openDate && curretDate <= closeDate) {
			return false;
		} else {
			return true;
		}
	};

	const disabledCheckInCloseDate = (date: any) => {
		const curretDate = moment(date).format();
		const checkInOpenDate = formData.value.clarification_open_date ? moment(formData.value.clarification_open_date)?.format() : "";
		const closeDate = formData.value.close_date ? moment(formData.value.close_date)?.format() : "";
		if (curretDate >= checkInOpenDate && curretDate <= closeDate) {
			return false;
		} else {
			return true;
		}
	};

	const getSelectedReminderData = computed(() => {
		let data = [];
		if (formData.value?.reminder_send_to?.length) {
			data = formData.value?.reminder_send_to?.map((data: any) => {
				return {
					label: data.label,
					value: data.value,
				};
			});
		}
		return data;
	});

	const dropdownSelectedReminderValue = (data: any) => {
		// showError.value = false;
		formData.value.reminder_send_to = data;
	};

	const dropdownSelectedActivityType = (value: any) => {
		formData.value.activity_type = value;
	};

	const getSelectedActivityType = computed(() => {
		return QTactivityType.map((data: any) => data.value === formData.value.activity_type);
	});

	const dropdownSelectedProjectCode = (value: any) => {
		formData.value.project_code = value;
		const projectOwnerObj = projectAllData.value.find((field: any) => field.project_number === formData.value.project_code);
		formData.value.project_owner = projectOwnerObj.project_owner_name;
		formData.value.signing_entity_id = projectOwnerObj.signing_entity_id;
		signingEntityName.value = projectOwnerObj.signing_entity_name;
		parentEntityName.value = projectOwnerObj.parent_entity;
		formData.value.parent_entity = projectOwnerObj.parent_entity;
	};

	const getSelectedProjectCode = computed(() => {
		return projectData.value.map((data: any) => data.value === formData.value.project_code);
	});

	const dropdownSelectedAuthorisers = (value: any) => {
		formData.value.authoriser_id = value;
	};

	const getSelectedAuthorisers = computed(() => {
		return authorisers.value.map((data: any) => data.value === formData.value.authoriser_id);
	});

	const removeInput = (index: any) => {
		fields.value.splice(index, 1);
		filterSuppliers();
	};

	const addInput = () => {
		if (fields.value.length > 0 && fields.value.length < 5) {
			fields.value.push({
				// supplier_name: "",
				supplier_code: "",
				supplier_id: "",
				supplierNameRequired: false,
				supplierCodeRequired: false,
			});

			selectedSuppliersData.value.push({
				value: "",
				label: "",
			});
		}
	};

	const changeSupplierName = (index: any) => {
		if (fields.value[index].supplier_id === "") {
			fields.value[index].supplierNameRequired = true;
		} else {
			fields.value[index].supplierNameRequired = false;
			fields.value[index].supplierCodeRequired = false;
			const supplierSelectedObj = supplierAllData.value.find((supplier: any) => supplier.id === fields.value[index].supplier_id);

			if (supplierSelectedObj) {
				fields.value[index].supplier_code = supplierSelectedObj?.sup_ref_number;
				fields.value[index].supplier_id = supplierSelectedObj?.id;
			}

			filterSuppliers();
		}
	};

	const findSupplierById = (id: any) => {
		return supplierAllData.value.find((supplier: any) => supplier.id == id);
	};

	const handleFieldSuppValue = (value: any, index: any) => {
		const suppObj = findSupplierById(value);
		fields.value[index].supplier_id = value;
		// fields.value[index].supplier_id = suppObj.id;

		selectedSuppliersData.value[index].value = value;
		selectedSuppliersData.value[index].label = suppObj?.company_name;
	};

	const dialogOkClick = (value: any) => {
		dialogVisible.value = value;
	};

	const sowDocumentModalClick = (id: any) => {
		sowDialogVisible.value = true;
	};

	const sowDialogOkClick = (value: any) => {
		sowDialogVisible.value = value;
	};

	const documentModalClick = (id: any) => {
		document_id.value = id;
		dialogVisible.value = true;
		fileLabels.value.isGeneralFileError = false;
		fileLabels.value.isSowFileError = false;
		fileLabels.value.isPriceMatrixFileError = false;
		fileLabels.value.isEvaluationFileError = false;
	};

	const documentData = (document: any, id: any) => {
		formData.value[id] = document.id;
		const data = files.value[id];
		fileLabels.value[data] = document.document_file_name;
	};

	const removeFile = (id: any) => {
		const data = files.value[id];
		formData.value[id] = "";
		fileLabels.value[data] = "";
		// const deletefiles = deleteFile.value[id];
		// formData.value[deletefiles] = 1 || 0;

		const updatedObj = copyEditData.value[id];
		deleteDocumentIds.value.push(updatedObj?.id);
	};

	const allFileAllowChange = () => {
		fileLabels.value.isGeneralFileError = false;
		fileLabels.value.isSowFileError = false;
		fileLabels.value.isPriceMatrixFileError = false;
		// fileLabels.value.isEvaluationFileError = false;
		v$.value.attach_document.$reset();
		attechDocument.value = [];
		formData.value.attach_document = "";
		copyEditData.value.attach_document = "";
		formData.value.is_delete_attach_document = 1;
	};

	const onSubmit = () => {
		if (!formData.value.timezone) {
			formData.value.timezone = "Europe/London";
		}

		v$.value.$validate();

		formData.value.estimated_contract_value = formData.value.estimated_contract_value
			? formData.value.estimated_contract_value.toString().replace(/,/g, "")
			: "";

		fields.value.forEach((field: any) => {
			if (field.supplier_id === "") {
				field.supplierNameRequired = true;
			}
			if (field.supplier_code === "") {
				field.supplierCodeRequired = true;
			}
		});

		if (
			(formData.value.general_terms_and_conditions === "" ||
				formData.value.general_terms_and_conditions === null ||
				formData.value.general_terms_and_conditions === undefined) &&
			!formData.value.combined_q_and_t_document
		) {
			fileLabels.value.isGeneralFileError = true;
		}
		if (
			(formData.value.sow_or_sor === "" || formData.value.sow_or_sor === null || formData.value.sow_or_sor === undefined) &&
			!formData.value.combined_q_and_t_document
		) {
			fileLabels.value.isSowFileError = true;
		}
		if (
			(formData.value.pricing_matrix === "" || formData.value.pricing_matrix === null || formData.value.pricing_matrix === undefined) &&
			!formData.value.combined_q_and_t_document
		) {
			fileLabels.value.isPriceMatrixFileError = true;
		}
		if (formData.value.evaluation_matrix === "" || formData.value.evaluation_matrix === null || formData.value.evaluation_matrix === undefined) {
			fileLabels.value.isEvaluationFileError = true;
		}

		const isValidCustomFields = customFieldRef.value.isValidate();

		if (
			!v$.value.$error &&
			!fileLabels.value.isGeneralFileError &&
			!fileLabels.value.isSowFileError &&
			!fileLabels.value.isPriceMatrixFileError &&
			!fileLabels.value.isEvaluationFileError &&
			isValidCustomFields
		) {
			const isValid = fields.value.every((field: any) => {
				return !field.supplierNameRequired && !field.supplierCodeRequired;
			});

			let copyFormData = {
				...formData.value,
				business_continuity_policy: formData.value.business_continuity_policy ? 1 : 0,
				anti_corruption_and_bribary_policy: formData.value.anti_corruption_and_bribary_policy ? 1 : 0,
				environmental_policy: formData.value.environmental_policy ? 1 : 0,
				financial_reports: formData.value.financial_reports ? 1 : 0,
				modern_slavery_policy: formData.value.modern_slavery_policy ? 1 : 0,
				social_values: formData.value.social_values ? 1 : 0,
				open_time: moment(formData.value.open_date + " " + formData.value.open_time).format("HH:mm"),
				close_time: moment(formData.value.close_date + " " + formData.value.close_time).format("HH:mm"),
				clarification_open_time: moment(formData.value.clarification_open_date + " " + formData.value.clarification_open_time).format("HH:mm"),
				clarification_close_time: moment(formData.value.clarification_close_date + " " + formData.value.clarification_close_time).format("HH:mm"),
			};

			if (route.params?.id) {
				if (isValid) {
					submitEditData(copyFormData);
				}
			} else {
				if (isValid) {
					submitAddData(copyFormData);
				}
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

	const submitAddData = async (copyFormData: any) => {
		loading.value = true;
		const fd = new FormData();

		Object.keys(copyFormData).forEach((field) => {
			if (field === "attach_document") {
				attechDocument.value?.forEach((value: any) => {
					fd.append("attach_document", value);
				});
			} else if (field === "delete_document_ids") {
				deleteDocumentIds.value?.forEach((value: any) => {
					fd.append("delete_document_ids[]", value);
				});
			} else {
				fd.append(field, copyFormData[field]);
			}
		});

		fields.value.map((field: any) => {
			fd.append("tenant_supplier_id[]", field.supplier_id);
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
			const res: any = await useApiFetch(`/tenders`, {
				method: "POST",
				body: fd,
			});
			useToast("success", res.message);
			navigateTo(localePath("/quotations-tender/q-t"));
		} catch {
		} finally {
			loading.value = false;
		}
	};

	const submitEditData = async (copyFormData: any) => {
		loading.value = true;
		copyFormData._method = "PATCH";

		if (copyFormData.attach_document === copyData.value.attach_document) {
			copyFormData.attach_document = "";
		}
		if (copyFormData.general_terms_and_conditions === copyData.value.general_terms_and_conditions) {
			copyFormData.general_terms_and_conditions = "";
		}
		if (copyFormData.sow_or_sor === copyData.value.sow_or_sor) {
			copyFormData.sow_or_sor = "";
		}
		if (copyFormData.pricing_matrix === copyData.value.pricing_matrix) {
			copyFormData.pricing_matrix = "";
		}
		if (copyFormData.evaluation_matrix === copyData.value.evaluation_matrix) {
			copyFormData.evaluation_matrix = "";
		}

		const fd = new FormData();

		Object.keys(copyFormData).forEach((field) => {
			if (field === "attach_document") {
				attechDocument.value?.forEach((value: any) => {
					fd.append("attach_document", value);
				});
			} else if (field === "delete_document_ids") {
				deleteDocumentIds.value?.forEach((value: any) => {
					fd.append("delete_document_ids[]", value);
				});
			} else {
				fd.append(field, copyFormData[field]);
			}
		});

		fields.value.map((field: any) => {
			fd.append("tenant_supplier_id[]", field.supplier_id);
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
			const res: any = await useApiFetch(`/tenders/${route.params?.id}`, {
				method: "POST",
				body: fd,
			});
			useToast("success", res.message);
			navigateTo(localePath("/quotations-tender/q-t"));
		} catch {
		} finally {
			loading.value = false;
		}
	};

	const updateSowDocumentsList = (data: any) => {
		documentData(data, "sow_or_sor");
	};

	const openDateChange = () => {
		v$.value.open_date.$touch();
		formData.value.close_date = "";
		formData.value.clarification_open_date = "";
		formData.value.clarification_close_date = "";
		v$.value.close_date.$reset();
		v$.value.clarification_open_date.$reset();
		v$.value.clarification_close_date.$reset();
	};
</script>

<template>
	<div>
		<el-form v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="flex flex-col relative">
			<div id="super-admin-form">
				<div class="bg-[#fff]">
					<div class="p-6">
						<div class="grid md:grid-cols-12 gap-5 lg:gap-6">
							<el-form-item
								:rules="[{ required: true }]"
								:label="$t('formLabels.tender_quotation_code')"
								class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							>
								<template #label>
									<BaseLabel :label="$t('formLabels.tender_quotation_code')" :tooltip-content="$t('info.tender_quotation_code')" :isShowLabel="false"/>
								</template>

								<el-input
									v-model.trim="formData.qt_code"
									name="qt_code"
									type="text"
									:disabled="disabled"
									:class="{
										error: v$.qt_code.$error,
									}"
									maxLength="10"
									@change="v$.qt_code.$touch"
								/>

								<span v-if="v$.qt_code.$error" class="text-xs text-red-500 mt-2">{{ v$.qt_code.$errors[0].$message }}</span>
							</el-form-item>

							<el-form-item
								:rules="[{ required: true }]"
								:label="$t('formLabels.project_number')"
								class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							>
								<template #label>
									<BaseLabel :label="$t('formLabels.project_number')" :tooltip-content="$t('info.project_number_QT')" />
								</template>

								<BaseSelectDropdown
									v-model="formData.project_code"
									name="project_code"
									:class="{
										error: v$.project_code.$error,
									}"
									:dropdown-option="projectData"
									:get-selected-country="getSelectedProjectCode"
									:number-only="false"
									:isRemoteFilter="true"
									:disabled="disabled"
									@remote-search="getProjectCode"
									@change="v$.project_code.$touch"
									@selected-value="dropdownSelectedProjectCode"
								/>
								<span v-if="v$.project_code.$error" class="text-xs text-red-500 mt-2">{{ v$.project_code.$errors[0].$message }}</span>
							</el-form-item>

							<el-form-item
								:rules="[{ required: true }]"
								:label="$t('formLabels.project_owner')"
								class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							>
								<template #label>
									<BaseLabel :label="$t('formLabels.project_owner')" :tooltip-content="$t('info.project_owner')" :isShowLabel="false" />
								</template>

								<el-input
									v-model.trim="formData.project_owner"
									name="project_owner"
									type="text"
									disabled
									:class="{
										error: v$.project_owner.$error,
									}"
									@change="v$.project_owner.$touch"
								/>

								<span v-if="v$.project_owner.$error" class="text-xs text-red-500 mt-2">{{
									v$.project_owner.$errors[0].$message
								}}</span>
							</el-form-item>

							<el-form-item :label="$t('formLabels.parent_entity')" class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
								<template #label>
									<BaseLabel :label="$t('formLabels.parent_entity')" :tooltip-content="$t('info.parent_entity')" :isShowLabel="false" />
								</template>

								<el-input v-model.trim="parentEntityName" name="parent_entity" type="text" disabled />
							</el-form-item>

							<el-form-item :label="$t('formLabels.signing_entity')" class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
								<template #label>
									<BaseLabel :label="$t('formLabels.signing_entity')" :tooltip-content="$t('info.signing_entity')" :isShowLabel="false" />
								</template>

								<el-input v-model.trim="signingEntityName" name="signing_entity_id" type="text" disabled />
							</el-form-item>

							<el-form-item
								:rules="[{ required: true }]"
								:label="$t('formLabels.qt_authoriser')"
								class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							>
								<template #label>
									<BaseLabel :label="$t('formLabels.qt_authoriser')" :tooltip-content="$t('info.qt_authoriser')" :isShowLabel="false" />
								</template>

								<BaseSelectDropdown
									v-model="formData.authoriser_id"
									name="authoriser_id"
									:class="{
										error: v$.authoriser_id.$error,
									}"
									:dropdown-option="authorisers"
									:get-selected-country="getSelectedAuthorisers"
									:number-only="false"
									:isRemoteFilter="true"
									:disabled="disabled || route.params?.id"
									@remote-search="getAuthorisers"
									@change="v$.authoriser_id.$touch"
									@selected-value="dropdownSelectedAuthorisers"
								/>
								<span v-if="v$.authoriser_id.$error" class="text-xs text-red-500 mt-2">{{
									v$.authoriser_id.$errors[0].$message
								}}</span>
							</el-form-item>

							<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.title')" class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
								<template #label>
									<BaseLabel :label="$t('formLabels.title')" :tooltip-content="$t('info.title')" />
								</template>

								<el-input
									v-model="formData.title"
									name="title"
									type="text"
									:disabled="disabled"
									:class="{
										error: v$.title.$error,
									}"
									maxLength="255"
									@change="v$.title.$touch"
									@keypress="CharcAndNumber"
								/>

								<span v-if="v$.title.$error" class="text-xs text-red-500 mt-2">{{ v$.title.$errors[0].$message }}</span>
							</el-form-item>

							<el-form-item
								:rules="[{ required: true }]"
								:label="$t('formLabels.activity_type')"
								class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
								:isShowLabel="false"
							>
								<template #label>
									<BaseLabel :label="$t('formLabels.activity_type')" :tooltip-content="$t('info.activity_type')" />
								</template>

								<BaseSelectDropdown
									v-model="formData.activity_type"
									name="activity_type"
									:class="{
										error: v$.activity_type.$error,
									}"
									:dropdown-option="QTactivityType"
									:get-selected-country="getSelectedActivityType"
									:number-only="false"
									:disabled="disabled"
									@change="v$.activity_type.$touch"
									@selected-value="dropdownSelectedActivityType"
								/>
								<span v-if="v$.activity_type.$error" class="text-xs text-red-500 mt-2">{{
									v$.activity_type.$errors[0].$message
								}}</span>
							</el-form-item>

							<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.country')" class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
								<template #label>
									<BaseLabel :label="$t('formLabels.country')" :tooltip-content="$t('info.countryQT')" />
								</template>

								<BaseMultiSelectDropdown
									:disabled="disabled"
									size="small"
									name="country_to_serve"
									:dropdown-option="getCountryData"
									:get-selected-client="getSelectedCountryData"
									:collapse-tag="false"
									:class="{
										error: v$.country_to_serve.$error,
									}"
									@change="v$.country_to_serve.$touch"
									@remote-search="getCountries"
									@selected-value="dropdownSelectedCountries"
								/>
								<span v-if="v$.country_to_serve.$error" class="text-xs text-red-500 mt-2">{{
									v$.country_to_serve.$errors[0].$message
								}}</span>
							</el-form-item>

							<el-form-item
								:rules="[{ required: true }]"
								:label="$t('formLabels.project_summary')"
								class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							>
								<template #label>
									<BaseLabel :label="$t('formLabels.project_summary')" :tooltip-content="$t('info.project_summary')" :isShowLabel="false" />
								</template>

								<el-input
									v-model="formData.project_summary"
									name="project_summary"
									type="text"
									:disabled="disabled"
									:class="{
										error: v$.project_summary.$error,
									}"
									maxLength="255"
									@change="v$.project_summary.$touch"
									@keypress="CharcAndNumber"
								/>

								<span v-if="v$.project_summary.$error" class="text-xs text-red-500 mt-2">{{
									v$.project_summary.$errors[0].$message
								}}</span>
							</el-form-item>

							<el-form-item
								:rules="[{ required: true }]"
								:label="$t('formLabels.category_level_1')"
								class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							>
								<template #label>
									<BaseLabel :label="$t('formLabels.category_level_1')" :tooltip-content="$t('info.category_level_1')" :isShowLabel="false" />
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
									@change="handleCategoryChange"
									@dropdown-change="handleCategoryChange"
								/>

								<span v-if="v$.category_level_1.$error" class="text-xs text-red-500 mt-2">{{
									v$.category_level_1.$errors[0].$message
								}}</span>
							</el-form-item>

							<el-form-item :label="$t('formLabels.category_level_2')" class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
								<template #label>
									<BaseLabel :label="$t('formLabels.category_level_2')" :tooltip-content="$t('info.category_level_2')" :isShowLabel="false" />
								</template>
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

							<div class="flex flex-wrap items-center col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
								<div class="flex items-center w-full">
									<span class="text-dark font-bold flex items-center">
										<span>{{ $t("formLabels.is_public_tender") }}</span>
										<span class="text-red-400">*</span>
									</span>
									<BaseLabel :tooltip-content="$t('info.is_public_tender')" />
								</div>
								<el-radio-group v-model="formData.is_this_public_tender" :disabled="disabled" @change="publicTenderChange">
									<el-radio :label="1" size="large">{{ $t("formLabels.yes") }}</el-radio>
									<el-radio :label="0" size="large">{{ $t("formLabels.no") }}</el-radio>
								</el-radio-group>
							</div>

							<div class="col-span-12">
								<div class="grid sm:grid-cols-2 gap-4 mb-6" v-for="(input, index) in fields" :key="index">
									<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.supplier_name')" class="mb-0">
										<template #label>
											<BaseLabel :label="$t('formLabels.supplier_name')" :tooltip-content="$t('info.supplier_name')" :isShowLabel="false" />
										</template>
										<BaseSelectDropdown
											:name="'fields' + index"
											:dropdown-option="filteredSuppliersList"
											:number-only="false"
											:get-selected-country="selectedSuppliersData[index]"
											:disabled="disabled"
											:isRemoteFilter="true"
											:class="{
												error: fields[index].supplierNameRequired || fields.supplierNameRequired,
											}"
											@remote-search="getSuppliers"
											@blur="changeSupplierName(index)"
											@change="handleFieldSuppValue($event, index)"
										/>

                                        <span v-if="fields[index].supplierNameRequired || fields.supplierNameRequired" class="text-xs text-red-500 mt-2">
                                            {{ $t("formValidations.supplier_name") }}
                                        </span>
									</el-form-item>

									<div class="flex w-full">
										<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.supplier_1_code')" class="w-full mb-0">
											<template #label>
												<BaseLabel :label="$t('formLabels.supplier_1_code')" :tooltip-content="$t('info.supplier_1_code')" :isShowLabel="false" />
											</template>

											<el-input
												:name="'fields' + index"
												v-model="fields[index].supplier_code"
												type="text"
												disabled
												:class="{
													error: fields[index].supplierCodeRequired || fields.supplierCodeRequired,
												}"
											/>

											<span v-if="fields[index].supplierCodeRequired || fields.supplierCodeRequired" class="text-xs text-red-500 mt-2">{{
												$t("formValidations.supplier_code")
											}}</span>
										</el-form-item>

										<novok-button type="danger" class="w-[40px] h-[40px] mt-6 ms-3" @click="removeInput(index)" v-if="fields.length > 1">
											<i class="fa-solid fa-xmark"></i>
										</novok-button>
									</div>
								</div>

								<novok-button
									:class="disabled ? 'btn-dark' : 'el-button--info'"
									@click="addInput"
									:disabled="disabled || fields.length >= 5"
									><i class="fa-solid fa-plus mr-2"></i> {{ $t("buttons.add") }}</novok-button
								>
							</div>

							<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0" :label="$t('formLabels.currency')">
								<template #label>
									<BaseLabel :label="$t('formLabels.currency')" :tooltip-content="$t('info.currency')" :isShowLabel="false" />
								</template>
								<BaseSelectDropdown
									v-model="formData.estimated_contract_value_currency"
									name="currency"
									:dropdown-option="CurrencyData"
									:number-only="false"
									:disabled="disabled"
								/>
							</el-form-item>

							<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0" :label="$t('formLabels.estimated_contract_value')">
								<template #label>
									<BaseLabel :label="$t('formLabels.estimated_contract_value')" :tooltip-content="$t('info.value_of_contract')" />
								</template>
								<el-input
									v-model.trim="formData.estimated_contract_value"
									type="text"
									name="estimated_contract_value"
									:disabled="disabled"
									maxLength="10"
									:class="{
										error: v$.estimated_contract_value.$error,
									}"
									@change="estimatedContractChange"
									@keypress="NumbersOnly"
								/>
								<span v-if="v$.estimated_contract_value.$error" class="text-xs text-red-500 mt-2">{{
									v$.estimated_contract_value.$errors[0].$message
								}}</span>
							</el-form-item>

							<div class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
								<div class="flex items-center w-full">
									<span class="text-dark font-bold flex items-center">
										<span>{{ $t("formLabels.hide_from_supplier") }}</span>
									</span>
									<BaseLabel :tooltip-content="$t('info.hide_from_supplier')" />
								</div>
								<el-radio-group v-model="formData.is_hide_estimated_contract_value_from_supplier" :disabled="disabled">
									<el-radio :label="1" size="large">{{ $t("formLabels.yes") }}</el-radio>
									<el-radio :label="0" size="large">{{ $t("formLabels.no") }}</el-radio>
								</el-radio-group>
							</div>

							<!-- <div class="flex flex-wrap items-center col-span-12 md:col-span-6 2xl:col-span-4 mb-0"></div> -->

							<el-form-item :rules="[{ required: true }]" class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0" :label="$t('formLabels.open_date')">
								<template #label>
									<BaseLabel :label="$t('formLabels.open_date')" :tooltip-content="$t('info.open_date')" />
								</template>
								<el-date-picker
									v-model.trim="formData.open_date"
									type="date"
									placeholder="DD/MM/YYYY"
									format="DD/MM/YYYY"
									value-format="YYYY-MM-DD"
									name="open_date"
									:disabled-date="disabledStartDate"
									:class="{
										error: v$.open_date.$error,
									}"
									:disabled="disabled"
									@change="openDateChange"
								/>
								<span v-if="v$.open_date.$error" class="text-xs text-red-500 mt-2 w-full">{{
									v$.open_date.$errors[0].$message
								}}</span>
							</el-form-item>

							<el-form-item :rules="[{ required: true }]" class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0" :label="$t('formLabels.open_time')">
								<template #label>
									<BaseLabel :label="$t('formLabels.open_time')" :tooltip-content="$t('info.open_time')" />
								</template>
								<!-- <el-time-picker
									v-model.trim="formData.open_time"
									name="open_time"
									format="hh:mm A"
									placeholder="hh"
									:class="{ error: v$.open_time.$error }"
									value-format="HH:mm"
									:disabled="disabled"
									@change="v$.open_time.$touch"
								/> -->
								<el-time-select
									v-model="formData.open_time"
									class="w-full"
									start="00:00"
									step="00:30"
									end="23:59"
									placeholder="hh"
									format="hh:mm A"
									:class="{ error: v$.open_time.$error }"
									:disabled="disabled"
									@change="v$.open_time.$touch"
								/>
								<span v-if="v$.open_time.$error" class="text-xs text-red-500 mt-2 w-full">{{
									v$.open_time.$errors[0].$message
								}}</span>
							</el-form-item>

							<el-form-item :rules="[{ required: true }]" class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0" :label="$t('formLabels.close_date')">
								<template #label>
									<BaseLabel :label="$t('formLabels.close_date')" :tooltip-content="$t('info.close_date')" />
								</template>
								<el-date-picker
									v-model.trim="formData.close_date"
									type="date"
									placeholder="DD/MM/YYYY"
									format="DD/MM/YYYY"
									value-format="YYYY-MM-DD"
									name="close_date"
									:disabled-date="disabledCloseDate"
									:class="{
										error: v$.close_date.$error,
									}"
									:disabled="disabled || !formData.open_date"
									@change="v$.close_date.$touch"
								/>
								<span v-if="v$.close_date.$error" class="text-xs text-red-500 mt-2 w-full">{{
									v$.close_date.$errors[0].$message
								}}</span>
							</el-form-item>

							<el-form-item :rules="[{ required: true }]" class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0" :label="$t('formLabels.close_time')">
								<template #label>
									<BaseLabel :label="$t('formLabels.close_time')" :tooltip-content="$t('info.close_time')" />
								</template>
								<!-- <el-time-picker
									v-model.trim="formData.close_time"
									name="close_time"
									format="hh:mm A"
									placeholder="hh"
									:class="{ error: v$.close_time.$error }"
									value-format="HH:mm"
									:disabled="disabled || !formData.open_time"
									@change="v$.close_time.$touch"
								/> -->
								<el-time-select
									v-model="formData.close_time"
									class="w-full"
									start="00:00"
									step="00:30"
									end="23:59"
									placeholder="hh"
									format="hh:mm A"
									:class="{ error: v$.close_time.$error }"
									:disabled="disabled || !formData.open_time"
									@change="v$.close_time.$touch"
								/>
								<span v-if="v$.close_time.$error" class="text-xs text-red-500 mt-2 w-full">{{
									v$.close_time.$errors[0].$message
								}}</span>
							</el-form-item>

							<el-form-item
								:rules="[{ required: true }]"
								class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
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
									value-format="YYYY-MM-DD"
									name="clarification_open_date"
									:disabled-date="disabledCheckInOpenDate"
									:class="{
										error: v$.clarification_open_date.$error,
									}"
									:disabled="disabled || !formData.close_date"
									@change="v$.clarification_open_date.$touch"
								/>
								<span v-if="v$.clarification_open_date.$error" class="text-xs text-red-500 mt-2 w-full">{{
									v$.clarification_open_date.$errors[0].$message
								}}</span>
							</el-form-item>

							<el-form-item
								:rules="[{ required: true }]"
								class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
								:label="$t('formLabels.clarification_open_time')"
							>
								<template #label>
									<BaseLabel
										:label="$t('formLabels.clarification_open_time')"
										:tooltip-content="$t('info.clarification_open_time')"
									/>
								</template>
								<!-- <el-time-picker
									v-model.trim="formData.clarification_open_time"
									name="clarification_open_time"
									format="hh A"
									placeholder="hh"
									:class="{
										error: v$.clarification_open_time.$error,
									}"
									value-format="HH:00"
									:disabled="disabled || !formData.close_date"
									@change="v$.clarification_open_time.$touch"
								/> -->
								<el-time-select
									v-model="formData.clarification_open_time"
									class="w-full"
									start="00:00"
									step="00:30"
									end="23:59"
									placeholder="hh"
									format="hh:mm A"
									:class="{ error: v$.clarification_open_time.$error }"
									:disabled="disabled || !formData.close_date"
									@change="v$.clarification_open_time.$touch"
								/>
								<span v-if="v$.clarification_open_time.$error" class="text-xs text-red-500 mt-2 w-full">{{
									v$.clarification_open_time.$errors[0].$message
								}}</span>
							</el-form-item>

							<el-form-item
								:rules="[{ required: true }]"
								class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
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
									value-format="YYYY-MM-DD"
									name="clarification_close_date"
									:disabled-date="disabledCheckInCloseDate"
									:class="{
										error: v$.clarification_close_date.$error,
									}"
									:disabled="disabled || !formData.clarification_open_date"
									@change="v$.clarification_close_date.$touch"
								/>
								<span v-if="v$.clarification_close_date.$error" class="text-xs text-red-500 mt-2 w-full">{{
									v$.clarification_close_date.$errors[0].$message
								}}</span>
							</el-form-item>

							<el-form-item
								:rules="[{ required: true }]"
								class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
								:label="$t('formLabels.clarification_close_time')"
							>
								<template #label>
									<BaseLabel
										:label="$t('formLabels.clarification_close_time')"
										:tooltip-content="$t('info.clarification_close_time')"
									/>
								</template>
								<!-- <el-time-picker
									v-model.trim="formData.clarification_close_time"
									name="clarification_close_time"
									format="hh A"
									placeholder="hh"
									:class="{
										error: v$.clarification_close_time.$error,
									}"
									value-format="HH:00"
									:disabled="disabled || !formData.clarification_open_date"
									@change="v$.clarification_close_time.$touch"
								/> -->
								<el-time-select
									v-model="formData.clarification_close_time"
									class="w-full"
									start="00:00"
									step="00:30"
									end="23:59"
									placeholder="hh"
									format="hh:mm A"
									:class="{ error: v$.clarification_close_time.$error }"
									:disabled="disabled || !formData.clarification_open_date"
									@change="v$.clarification_close_time.$touch"
								/>
								<span v-if="v$.clarification_close_time.$error" class="text-xs text-red-500 mt-2 w-full">{{
									v$.clarification_close_time.$errors[0].$message
								}}</span>
							</el-form-item>

							<div class="col-span-12 md:col-span-6 2xl:col-span-4">
								<div class="flex flex-wrap items-center">
									<div class="inline-flex items-center w-full">
										<span class="text-dark font-bold block">{{ $t("formLabels.reminders_set") }}</span>
										<span class="text-red-400">*</span>
										<BaseLabel :tooltip-content="$t('info.reminders_set')" />
									</div>
									<el-radio-group
										v-model="formData.is_reminder"
										class="flex w-full items-center"
										:disabled="disabled"
										@change="reminderChange"
									>
										<el-radio :label="1" size="large">{{ $t("formLabels.yes") }}</el-radio>
										<el-radio :label="0" size="large">{{ $t("formLabels.no") }}</el-radio>
									</el-radio-group>
								</div>
							</div>

							<div v-if="formData.is_reminder" class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
								<el-form-item class="mb-0" :rules="[{ required: true }]" :label="$t('formLabels.reminder_send_to')">
									<template #label>
										<BaseLabel :label="$t('formLabels.reminder_send_to')" :tooltip-content="$t('info.reminder_send_to')" />
									</template>
									<BaseMultiSelectDropdown
										v-model="formData.reminder_send_to"
										:disabled="disabled"
										:dropdown-option="quotationTenderReminderData"
										:get-selected-client="getSelectedReminderData"
										:class="{
											error: v$.reminder_send_to.$error,
										}"
										@selected-value="dropdownSelectedReminderValue"
										@change="v$.reminder_send_to.$touch"
									/>
									<span v-if="v$.reminder_send_to.$error" class="text-xs text-red-500 mt-2 w-full">{{
										v$.reminder_send_to.$errors[0].$message
									}}</span>
								</el-form-item>
								<!-- <span v-if="formData.is_reminder && showError" class="text-xs text-red-500 mt-2">{{
									t("formValidations.reminder_send_to")
								}}</span> -->
							</div>

							<el-form-item
								v-if="formData.is_reminder"
								class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
								:rules="[{ required: true }]"
								:label="$t('formLabels.reminder_from_days')"
							>
								<template #label>
									<BaseLabel :label="$t('formLabels.reminder_from_days')" :tooltip-content="$t('info.reminder_from_days')" />
								</template>
								<el-input
									v-model.trim="formData.reminder_from_days"
									type="text"
									name="reminder_from_days"
									:disabled="disabled"
									maxLength="2"
									:class="{
										error: v$.reminder_from_days.$error,
									}"
									@keypress="NumbersOnly"
								/>
								<span v-if="v$.reminder_from_days.$error" class="text-xs text-red-500 mt-2">{{
									v$.reminder_from_days.$errors[0].$message
								}}</span>
							</el-form-item>

							<div class="col-span-12 md:col-span-6 2xl:col-span-4">
								<div class="flex flex-wrap items-start">
									<div class="inline-flex items-center">
										<span class="text-dark font-bold block">{{ $t("formLabels.combined_q_and_t_document") }}</span>
										<span class="text-red-400">*</span>
										<BaseLabel :tooltip-content="$t('info.combined_q_and_t_document')" />
									</div>
									<el-radio-group
										v-model="formData.combined_q_and_t_document"
										class="flex w-full"
										:disabled="disabled"
										@change="allFileAllowChange"
									>
										<el-radio :label="1" size="large">{{ $t("formLabels.yes") }}</el-radio>
										<el-radio :label="0" size="large">{{ $t("formLabels.no") }}</el-radio>
									</el-radio-group>
								</div>
							</div>

							<div v-if="formData.combined_q_and_t_document" class="w-full col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
								<div class="inline-flex items-center mr-5">
									<label class="el-form-item__label pr-0">{{ $t("formLabels.attach_document") }}</label>
									<span class="text-red-400">*</span>
									<BaseLabel :tooltip-content="$t('info.attach_document')" :isShowLabel="false"/>
								</div>
								<BaseImage
									:id="'attach_document'"
									ref="attachDocumentRef"
									v-model="formData.attach_document"
									:limit="1"
									:formData="copyEditData.attach_document"
									:disabled="disabled"
									:class="{
										error: v$.attach_document.$error,
									}"
									name="attach_document"
									@change="v$.attach_document.$touch"
									@upload-file="imgOnChange"
									@handle-remove="handleRemove"
								/>
								<span v-if="v$.attach_document.$error" class="text-xs text-red-500 mt-2 w-full">{{
									v$.attach_document.$errors[0].$message
								}}</span>
							</div>

							<div class="w-full col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
								<div class="inline-flex items-center mr-5">
									<label class="el-form-item__label pr-0">{{ $t("formLabels.terms_n_conditions") }}</label>
									<span v-if="!formData.combined_q_and_t_document" class="text-red-400">*</span>
									<BaseLabel :tooltip-content="$t('info.terms_n_conditionsQT')" />
								</div>
								<div class="flex items-center">
									<novok-button type="info" @click="documentModalClick('general_terms_and_conditions')">{{
										$t("formLabels.select_file")
									}}</novok-button>
									<div class="w-full flex justify-between">
										<p class="truncate ml-2">{{ fileLabels.general_terms_and_conditions_file_name }}</p>
										<span
											v-if="formData.general_terms_and_conditions"
											class="cursor-pointer"
											@click="removeFile('general_terms_and_conditions')"
											><i class="fa-regular fa-close"></i
										></span>
									</div>
								</div>
								<hr :class="{ 'bg-red-500': fileLabels.isGeneralFileError }" />
								<span v-if="fileLabels.isGeneralFileError" class="text-xs text-red-500 mt-2 w-full">{{
									$t("formValidations.general_terms_and_conditions")
								}}</span>
							</div>

							<div class="w-full col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
								<div class="inline-flex items-center mr-5">
									<label class="el-form-item__label pr-0">{{ $t("formLabels.sow_sor_documents") }}</label>
									<span v-if="!formData.combined_q_and_t_document" class="text-red-400">*</span>
									<BaseLabel :tooltip-content="$t('info.sow_sor_documents')" />

									<div class="ai-generate cursor-pointer ml-3">
										<BaseLabel
											icon='<i class="fa-regular fa-wand-magic-sparkles text-primary"></i>'
											:tooltip-content="$t('info.ai_sow_sor_documents')"
											@click="sowDocumentModalClick"
										/>
									</div>
								</div>
								<div class="flex items-center">
									<novok-button type="info" @click="documentModalClick('sow_or_sor')">{{
										$t("formLabels.select_file")
									}}</novok-button>
									<div class="w-full flex justify-between">
										<p class="truncate ml-2">{{ fileLabels.sow_or_sor_file_name }}</p>
										<span v-if="formData.sow_or_sor" class="cursor-pointer" @click="removeFile('sow_or_sor')"
											><i class="fa-regular fa-close"></i
										></span>
									</div>
								</div>
								<hr :class="{ 'bg-red-500': fileLabels.isSowFileError }" />
								<span v-if="fileLabels.isSowFileError" class="text-xs text-red-500 mt-2 w-full">{{
									$t("formValidations.sow_or_sor")
								}}</span>
							</div>

							<div class="w-full col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
								<div class="inline-flex items-center mr-5">
									<label class="el-form-item__label pr-0">{{ $t("formLabels.pricing_matrix") }}</label>
									<span v-if="!formData.combined_q_and_t_document" class="text-red-400">*</span>
									<BaseLabel :tooltip-content="$t('info.pricing_matrix')" />
								</div>
								<div class="flex items-center">
									<novok-button type="info" @click="documentModalClick('pricing_matrix')">{{
										$t("formLabels.select_file")
									}}</novok-button>
									<div class="w-full flex justify-between">
										<p class="truncate ml-2">{{ fileLabels.pricing_matrix_file_name }}</p>
										<span v-if="formData.pricing_matrix" class="cursor-pointer" @click="removeFile('pricing_matrix')"
											><i class="fa-regular fa-close"></i
										></span>
									</div>
								</div>
								<hr :class="{ 'bg-red-500': fileLabels.isPriceMatrixFileError }" />
								<span v-if="fileLabels.isPriceMatrixFileError" class="text-xs text-red-500 mt-2 w-full">{{
									$t("formValidations.pricing_matrix")
								}}</span>
							</div>

							<div class="w-full col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
								<div class="inline-flex items-center mr-5">
									<label class="el-form-item__label pr-0">{{ $t("formLabels.evaluation_matrix") }}</label>
									<span class="text-red-400">*</span>
									<BaseLabel :tooltip-content="$t('info.evaluation_matrix')" />
								</div>
								<div class="flex items-center">
									<novok-button type="info" @click="documentModalClick('evaluation_matrix')">{{
										$t("formLabels.select_file")
									}}</novok-button>
									<div class="w-full flex justify-between">
										<p class="truncate ml-2">{{ fileLabels.evaluation_matrix_file_name }}</p>
										<span v-if="formData.evaluation_matrix" class="cursor-pointer" @click="removeFile('evaluation_matrix')"
											><i class="fa-regular fa-close"></i
										></span>
									</div>
								</div>
								<hr :class="{ 'bg-red-500': fileLabels.isEvaluationFileError }" />
								<span v-if="fileLabels.isEvaluationFileError" class="text-xs text-red-500 mt-2 w-full">{{
									$t("formValidations.evaluation_matrix")
								}}</span>
							</div>

							<div class="col-span-12 md:col-span-6 2xl:col-span-4">
								<div class="flex items-start flex-wrap">
									<div class="flex items-center w-full">
										<span class="text-dark font-bold flex items-center">
											<span>{{ $t("formLabels.hide_evaluation_matrix") }}</span>
										</span>
										<BaseLabel :tooltip-content="$t('info.hide_evaluation_matrix')" :isShowLabel="false" />
									</div>
									<el-radio-group v-model="formData.is_hide_evaluation_matrix_from_supplier" :disabled="disabled">
										<el-radio :label="1" size="large">{{ $t("formLabels.yes") }}</el-radio>
										<el-radio :label="0" size="large">{{ $t("formLabels.no") }}</el-radio>
									</el-radio-group>
								</div>
							</div>

							<el-form-item
								:rules="[{ required: false }]"
								class="col-span-12 mb-0"
								:label="$t('formLabels.supporting_documents_required')"
							>
								<template #label>
									<BaseLabel
										:label="$t('formLabels.supporting_documents_required')"
										:tooltip-content="$t('info.supporting_documents_required')"
									/>
								</template>

								<!-- <el-checkbox-group> -->
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
								<!-- </el-checkbox-group> -->
							</el-form-item>

							<custom-input-add-edit
								ref="customFieldRef"
								:custom-data="customFields"
								module-name="q-and-t-client"
								:disabled="disabled"
								custom-class="w-full col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
								@update-data="(value) => Object.assign(customFields, value)"
							/>
						</div>

						<div class="pt-4 text-right">
							<novok-button class="btn-dark my-1" @click.prevent="navigateTo(localePath('/quotations-tender/q-t'))">
								<span class="hidden sm:inline-block"> {{ $t("buttons.cancel") }}</span
								>
							</novok-button>

							<novok-button
								v-if="!disabled"
								class="my-1"
								type="info"
								:loading="loading"
								:disabled="loadingSave"
								@click.prevent="onSubmit()"
								>{{ $t("buttons.save") }}
							</novok-button>
						</div>
					</div>
				</div>
			</div>
		</el-form>

		<quotations-tender-document-modal
			v-if="dialogVisible"
			:dialog-visible="dialogVisible"
			:id="document_id"
			@dialog-ok-click="dialogOkClick"
			@document-data="documentData"
		/>

		<quotations-tender-sow-modal
			v-if="sowDialogVisible"
			:dialog-visible="sowDialogVisible"
			@dialog-ok-click="sowDialogOkClick"
			@update-sow="updateSowDocumentsList"
		/>
	</div>
</template>
