<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/attribute-hyphenation -->
<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
	import { required, maxLength, helpers, email, minLength, requiredIf } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import { supplierStore } from "~/store/supplier";
	import { useAuthStore } from "~/store/auth";
	import { getErrors } from "~/helper/getErrors";
	import { Pronouns, CompanyTypes, CurrencyData, supplierStatus, supplierStatusCopy } from "~/helper/data";
	import auth from "~/middleware/auth";
	const { getSelectedCountry, getCountry } = useGetSelectedCountry();

	const props = defineProps({
		editData: {
			type: Object,
			// eslint-disable-next-line vue/require-valid-default-prop
			default: {},
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	});

	const formData = reactive<any>({
		tab_name: "primary-details",
		company_id: "",
		company_logo: "",
		company_name: "",
		company_number: "",
		company_address: "",
		company_city: "",
		company_country: "",
		company_state: "",
		company_post_code: "",
		sup_ref_number: "",
		first_name: "",
		last_name: "",
		department: "",
		job_title: "",
		pronouns: "he",
		preffered_name: "",
		cor_address: "",
		cor_city: "",
		cor_country: "",
		cor_state: "",
		cor_post_code: "",
		email: "",
		mobile: "",
		mobile_country_code: "+44",
		is_diverse_company: "NO",
		company_type: "",
		company_vat_number: "",
		company_telephone_country_code: "+44",
		company_telephone: "",
		company_email: "",
		company_website: "",
		company_time_zone: "Europe/London",
		other_company_type: "",
		// currency: "['GBP']",
		category: "",
		sub_category: "",
		is_consent_to_share_with_marketplace: 0,
		is_privacy_agreed: 0,
		key_supplier: 0,
		key_supplier_comment: "",
		status: "",
		reason: "",
		alt_first_name: "",
		alt_last_name: "",
		alt_department: "",
		alt_job_title: "",
		alt_email: "",
		alt_mobile: "",
		alt_mobile_country_code: "+44",
	});
	const fullscreenLoading = ref(false);
	const loading = ref(false);
	const loadingSave = ref(false);
	const supplierCreatedId = ref("");
	const deleteImg = ref(false);
	const authStore = useAuthStore();
	const router = useRouter();

	const localePath = useLocalePath();
	const { t } = useI18n();
	const config = useRuntimeConfig();
	const SupplierStore = supplierStore();
	const emit = defineEmits(["active-tab-name", "disable", "disabled", "editcall"]);
	const route = useRoute();
	const copyFormData = ref<any>([]);
	const companyAddress = ref("");
	const address = ref("");
	const timeZones = ref([]);
	const companyRequired = ref(false);
	const selectedCompanyType = ref<any>({});
	const isFilledPrimaryDetails = ref(null);
	const categories = ref<any>([]);
	const subCategories = ref<any>([]);
	const searchValue = ref("");
	const AddressChecked = ref(false);
	const customFields = reactive([]);
	const customFieldRef = ref<any>(null);
	const selectedCurrency = ref([]);

	const rules = computed(() => {
		return {
			cor_state: {
				required: helpers.withMessage(t("formValidations.state"), required),
				maxLength: helpers.withMessage(t("formValidations.state_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			cor_country: {
				required: helpers.withMessage(t("formValidations.country"), required),
				maxLength: helpers.withMessage(t("formValidations.country_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			cor_city: {
				required: helpers.withMessage(t("formValidations.city_req"), required),
				maxLength: helpers.withMessage(t("formValidations.city"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			cor_address: {
				required: helpers.withMessage(t("formValidations.address"), required),
				maxLength: helpers.withMessage(t("formValidations.address_max"), maxLength(100)),
			},
			first_name: {
				required: helpers.withMessage(t("formValidations.first_name"), required),
				maxLength: helpers.withMessage(t("formValidations.first_name_max"), maxLength(50)),
				name_validation: {
					$validator: PasteCharSpecCharWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			last_name: {
				required: helpers.withMessage(t("formValidations.last_name"), required),
				maxLength: helpers.withMessage(t("formValidations.last_name_max"), maxLength(50)),
				name_validation: {
					$validator: PasteCharSpecCharWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			department: {
				required: helpers.withMessage(t("formValidations.department"), required),
				maxLength: helpers.withMessage(t("formValidations.department_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			job_title: {
				required: helpers.withMessage(t("formValidations.job_title"), required),
				maxLength: helpers.withMessage(t("formValidations.job_title_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			cor_post_code: {
				required: helpers.withMessage(t("formValidations.post_code"), required),
				maxLength: helpers.withMessage(t("formValidations.post_code_max"), maxLength(10)),
				name_validation: {
					$validator: PasteCharcAndNumWithSpace,
					$message: t("copyPasteValidations.charNum"),
				},
			},
			email: {
				required: helpers.withMessage(t("formValidations.email"), required),
				email: helpers.withMessage(t("formValidations.email_valid"), email),
				name_validation: {
					$validator: PasteEmail,
					$message: t("formValidations.email_valid"),
				},
			},

			mobile: {
				required: helpers.withMessage(t("formValidations.contact_number"), required),
				maxLength: helpers.withMessage(t("formValidations.contact_number_max"), minLength(10)),
				name_validation: {
					$validator: PasteNumberOnly,
					$message: t("copyPasteValidations.number"),
				},
			},
			preffered_name: {
				maxLength: helpers.withMessage(t("formValidations.preffered_name_max"), maxLength(50)),
				name_validation: {
					$validator: PasteCharcOnly,
					$message: t("copyPasteValidations.characters"),
				},
			},
			company_name: {
				required: helpers.withMessage(t("formValidations.reg_company_name"), required),
				maxLength: helpers.withMessage(t("formValidations.reg_company_name_max"), maxLength(100)),
			},
			company_number: {
				required: helpers.withMessage(t("formValidations.company_reg_number"), required),
				name_validation: {
					$validator: PasteCharcAndNum,
					$message: t("copyPasteValidations.charNum"),
				},
			},
			company_address: {
				required: helpers.withMessage(t("formValidations.reg_company_address"), required),
				maxLength: helpers.withMessage(t("formValidations.reg_company_address_max"), maxLength(100)),
			},
			company_city: {
				required: helpers.withMessage(t("formValidations.city_req"), required),
				maxLength: helpers.withMessage(t("formValidations.city"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			company_country: {
				required: helpers.withMessage(t("formValidations.country"), required),
				maxLength: helpers.withMessage(t("formValidations.country_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			company_state: {
				required: helpers.withMessage(t("formValidations.state"), required),
				maxLength: helpers.withMessage(t("formValidations.state_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			company_post_code: {
				required: helpers.withMessage(t("formValidations.post_code"), required),
				maxLength: helpers.withMessage(t("formValidations.post_code_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcAndNumWithSpace,
					$message: t("copyPasteValidations.charNum"),
				},
			},
			company_telephone: {
				maxLength: helpers.withMessage(t("formValidations.company_telephone_max"), minLength(10)),
				name_validation: {
					$validator: PasteNumberOnly,
					$message: t("copyPasteValidations.number"),
				},
			},
			company_email: {
				email: helpers.withMessage(t("formValidations.company_email_valid"), email),
				name_validation: {
					$validator: PasteEmail,
					$message: t("formValidations.company_email_valid"),
				},
			},
			company_time_zone: {
				required: helpers.withMessage(t("formValidations.timezone"), required),
			},
			company_vat_number: {
				required: helpers.withMessage(t("formValidations.company_vat_number"), required),
			},
			company_website: {
				required: helpers.withMessage(t("formValidations.company_website"), required),
			},

			category: {
				required: helpers.withMessage(t("formValidations.category_level_1"), required),
			},
			status: {
				required: helpers.withMessage(t("formValidations.Status"), required),
			},
			reason: {
				requiredIf: helpers.withMessage(t("formValidations.reason"), requiredIf(formData.status == 2)),
			},
			alt_first_name: {
				maxLength: helpers.withMessage(t("formValidations.first_name_max"), maxLength(50)),
				name_validation: {
					$validator: PasteCharSpecCharWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			alt_last_name: {
				maxLength: helpers.withMessage(t("formValidations.last_name_max"), maxLength(50)),
				name_validation: {
					$validator: PasteCharSpecCharWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			alt_department: {
				maxLength: helpers.withMessage(t("formValidations.role_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			alt_job_title: {
				maxLength: helpers.withMessage(t("formValidations.job_title_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcAndNumWithSpace,
					$message: t("copyPasteValidations.charNum"),
				},
			},
			alt_email: {
				email: helpers.withMessage(t("formValidations.email_valid"), email),
				name_validation: {
					$validator: PasteEmail,
					$message: t("formValidations.email_valid"),
				},
			},
			alt_mobile: {
				maxLength: helpers.withMessage(t("formValidations.contact_number_max"), minLength(10)),
				name_validation: {
					$validator: PasteNumberOnly,
					$message: t("copyPasteValidations.number"),
				},
			},
		};
	});
	const v$ = useVuelidate(rules, formData);

	watch(
		() => props.editData,
		(currData) => {
			if (currData.tab === "primary-details" || currData.tab === "all") {
				v$.value.$reset();
				if (Object.keys(currData || {}).length) {
					Object.keys(formData).forEach((field: any) => {
						if (currData?.[field] !== undefined && currData?.[field] !== null && currData?.[field] !== "") {
							formData[field] = currData?.[field];
							companyAddress.value = currData?.company_address;
							address.value = currData?.cor_address;
							const is_filled_primary_details = useCookie("is_filled_primary_details");
							is_filled_primary_details.value = currData?.is_filled_primary_details;
							isFilledPrimaryDetails.value = currData?.is_filled_primary_details;
							formData.is_consent_to_share_with_marketplace = currData?.is_consent_to_share_with_marketplace == 1 ? true : false;
							formData.is_privacy_agreed = currData?.is_privacy_agreed == 1 ? true : false;
							copyFormData.value = JSON.parse(JSON.stringify(currData));
						}
					});

					if (formData.status == 1) {
						formData["status"] = "Uncontracted Unapproved";
					}

					// if (currData?.currency) {
					// 	selectedCurrency.value = currData?.currency?.map((name: any) => {
					// 		return {
					// 			label: name,
					// 			value: name,
					// 		};
					// 	});
					// }

					if (formData.company_address === formData.cor_address) {
						AddressChecked.value = true;
					}
				}

				Object.assign(customFields, currData?.custom_primary_details);
			}
		}
	);

	onMounted(async () => {
		copyFormData.value = JSON.parse(JSON.stringify(formData));
		if (!route?.params?.id) {
			await getAutoGenerateNumber();

			const data = await getCustomField("supplier-admin", "primary-details");

			data.forEach((obj: any) => {
				if (obj.input_type === "checkbox") {
					obj.input_value = [];
				} else {
					obj.input_value = "";
				}
			});

			Object.assign(customFields, data);
		}

		getTimeZone();

		await getCategories();
	});

	const getSelectedPronouns = computed(() => {
		const selectedPronous = Pronouns.find((pronouns) => pronouns.value === formData.pronouns);
		return selectedPronous;
	});

	const getSelectedTimeZone = computed(() => {
		const selectedTimeZone = timeZones.value.find((timezone: any) => {
			return timezone.value === formData.company_time_zone;
		});
		return selectedTimeZone;
	});

	const dropdownSelectedPronounsValue = (value: any) => {
		formData.pronouns = value;
	};

	// const getSelectedCurrencyData = computed(() => {
	// 	return selectedCurrency.value;
	// 	// return CurrencyData.find((data) => data.value === formData.currency);
	// });

	// const dropdownSelectedCurrencyValue = (value: any) => {
	// 	formData.currency = value;
	// };

	const getSelectedCategory = computed(() => {
		return categories.value.map((data: any) => data.id === formData.category);
	});

	const dropdownSelectedCategory = (value: any) => {
		formData.category = value;
	};

	const getSelectedSubCategory = computed(() => {
		return subCategories.value.map((data: any) => data.id === formData.sub_category);
	});

	const dropdownSelectedSubCategory = (value: any) => {
		formData.sub_category = value;
	};

	const getAutoGenerateNumber = async () => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch("/supplier-admins/generate/ref-number", {
				method: "GET",
			});
			formData.sup_ref_number = res.data?.new_sup_ref_number;
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const getTimeZone = () => {
		$fetch(`https://worldtimeapi.org/api/timezone/`, {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
		})
			.then((res: any) => {
				timeZones.value = res?.map((field: any) => {
					return {
						label: field,
						value: field,
					};
				});
			})
			.catch((err) => {
				return err;
			});
	};

	const changeAddress = (address: any, id: any) => {
		if (id === "companyaddress") {
			formData.company_address = address;
		} else {
			formData.cor_address = address;
		}
	};

	const getAddress = (address: any, companyAddress: any, id: any) => {
		if (id === "companyaddress") {
			formData.company_address = companyAddress;
			formData.company_city = address?.city;
			formData.company_country = address?.country;
			formData.company_post_code = address?.postal_code;
			formData.company_state = address?.region;
		} else {
			formData.cor_address = companyAddress;
			formData.cor_city = address?.city;
			formData.cor_country = address?.country;
			formData.cor_post_code = address?.postal_code;
			formData.cor_state = address?.region;
		}
	};

	const dropdownSelectedMobileCountryCodeValue = (value: any) => {
		formData.mobile_country_code = value;
	};

	const dropdownSelectedCompanyType = (value: any) => {
		formData.company_type = value;
		companyRequired.value = false;
		formData.other_company_type = "";
	};

	const getSelectedCompanyData = computed(() => {
		selectedCompanyType.value = CompanyTypes.find((company: any) => {
			return company.value === formData.company_type;
		});
		return selectedCompanyType.value;
	});

	const companyTextVisible = computed(() => {
		if (formData.is_diverse_company === "YES" && formData.company_type === "other") {
			return true;
		}
	});

	const dropdownSelectedTimezone = (value: any) => {
		formData.company_time_zone = value;
	};

	const dropdownCompanyTelCountryCode = (value: any) => {
		formData.company_telephone_country_code = value;
	};

	const dropdownSelectedCountryCodeValue = (value: any) => {
		formData.alt_telephone_country_code = value;
	};

	const dropdownSelectedValue = (value: any) => {
		formData.alt_mobile_country_code = value;
	};

	const companyTypeChange = () => {
		if (formData.company_type === "") {
			companyRequired.value = true;
		}
	};

	const diverseCompanyChange = () => {
		formData.other_company_type = "";
		formData.company_type = "";
	};

	const imgOnChange = (value: any) => {
		deleteImg.value = false;
		formData.company_logo = value.file;
	};

	const handleRemove = () => {
		formData.company_logo = "";
		formData.delete_company_logo = 1;
		copyFormData.value.company_logo = "";
		copyFormData.value.delete_company_logo = 1;
		deleteImg.value = true;
	};

	const categoryDropdownSearch = (value: any) => {
		searchValue.value = value;
		if (searchValue) {
			getCategories();
		}
	};

	const getCategories = async () => {
		try {
			const res: any = await useApiFetch(`/categories?perPage=15&sortColumn=&sortOrder=&searchValue=${searchValue.value}&parent_id=0`, {
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
		() => formData.category,
		(val) => {
			getSubCategories(val);
		}
	);

	const handleCategoryChange = async () => {
		formData.sub_category = "";
		getSubCategories();
	};

	const getSubCategories = async (val = 0) => {
		try {
			let CatValue = val ? val : formData.category;

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

	const onSubmit = (value: any) => {
		v$.value.$validate();

		formData.status = formData.status === "Uncontracted Unapproved" ? 1 : formData.status;
		const isValidCustomFields = customFieldRef.value.isValidate();

		if (formData.is_diverse_company === "YES" && formData.company_type === "") {
			companyRequired.value = true;
		}

		formData.is_consent_to_share_with_marketplace = formData.is_consent_to_share_with_marketplace === true ? 1 : 0;
		formData.is_privacy_agreed = formData.is_privacy_agreed === true ? 1 : 0;

		if (!v$.value.$error && !companyRequired.value && isValidCustomFields) {
			if (route.params?.id) {
				submitEditData(value);
			} else {
				submitAddData(value);
			}

			formData.is_consent_to_share_with_marketplace = formData.is_consent_to_share_with_marketplace == 1 ? true : false;
			formData.is_privacy_agreed = formData.is_privacy_agreed == 1 ? true : false;
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
			if (value !== "save") {
				loading.value = true;
			} else {
				loadingSave.value = true;
			}

			const fd = new FormData();
			Object.keys(formData).forEach((field) => {
				fd.append(field, formData?.[field]);
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

			const res: any = await useApiFetch("/supplier-admins", {
				method: "POST",
				body: fd,
			});

			emit("disable", false);
			supplierCreatedId.value = res.data?.id;
			SupplierStore.setNewSupplierId(res.data?.id);

			if (value !== "save") {
				SupplierStore.setActiveTab("compliance-due-diligence");
				emit("active-tab-name", "compliance-due-diligence");
				navigateTo(
					localePath({
						path: `/supplier-admins/edit-supplier-admin/${res.data?.id}`,
						query: { tab: "compliance-due-diligence" },
					}),
					{ replace: true }
				);
			} else if (authStore.role_id === "supplier_admin") {
				console.log("else if");

				useToast("success", res?.message);
				navigateTo(localePath("/dashboard"));
			} else {
				useToast("success", res?.message);
				navigateTo(localePath("/supplier-admins"));
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

			if ((formData.company_logo || formData.company_logo === null) && deleteImg?.value === true) {
				formData.company_logo = "";
			}

			if (formData.company_logo === copyFormData.value.company_logo) {
				formData.company_logo = "";
			}

			if (formData.key_supplier === 0) {
				formData.key_supplier_comment = "";
			}

			const fd = new FormData();
			Object.keys(formData).forEach((field) => {
				fd.append(field, formData?.[field]);
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

			const res: any = await useApiFetch(`/supplier-admins/${route.params?.id}/primary-details`, {
				method: "POST",
				body: fd,
			});

			emit("disabled", true);

			const isProfileSetup = useCookie("is_profile_setup");
			isProfileSetup.value = "1";

			const is_filled_primary_details = useCookie("is_filled_primary_details");
			is_filled_primary_details.value = "1";

			if (value !== "save") {
				SupplierStore.setActiveTab("compliance-due-diligence");
				emit("active-tab-name", "compliance-due-diligence");

				if (route.query.page === "view") {
					navigateTo(
						localePath({
							path: "/supplier-admins/view-supplier-admin/" + route.params.id,
							query: { tab: "compliance-due-diligence", page: "view" },
						}),
						{ replace: true }
					);
				} else {
					navigateTo(
						localePath({
							path: route.fullPath,
							query: { tab: "compliance-due-diligence" },
						}),
						{ replace: true }
					);
				}
			} else {
				if (route.query.page === "view") {
					navigateTo(
						localePath({
							path: "/supplier-admins/view-supplier-admin/" + route.params.id,
							query: { tab: "primary-details", page: "view" },
						}),
						{ replace: true }
					);
				} else if (authStore.role_id === "supplier_admin") {
					navigateTo(localePath("/dashboard"));
				} else {
					navigateTo(localePath("/supplier-admins"));
				}
				emit("editcall");
				useToast("success", res?.message);
			}
		} catch {
		} finally {
			loading.value = false;
			loadingSave.value = false;
		}
	};

	const AddressCheckBoxChange = (value: any) => {
		if (value) {
			formData.cor_address = formData.company_address;
			address.value = formData.company_address;
			formData.cor_city = formData.company_city;
			formData.cor_state = formData.company_state;
			formData.cor_country = formData.company_country;
			formData.cor_post_code = formData.company_post_code;
		} else {
			formData.cor_address = "";
			address.value = "";
			formData.cor_city = "";
			formData.cor_state = "";
			formData.cor_country = "";
			formData.cor_post_code = "";
		}
	};

	const companyAddressChange = () => {
		v$.value.company_address.$touch();
		AddressChecked.value = false;
	};

	const dropdownSelectedStatus = (value: any) => {
		formData.status = value;
	};

	const getSelectedStatus = computed(() => {
		return supplierStatus.map((data: any) => data.value == formData.status);
	});

	const dropdownOptionStatus = computed(() => {
		if (route.params?.id) {
			return supplierStatusCopy;
		} else {
			return supplierStatus;
		}
	});
</script>

<template>
	<div v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="flex flex-col">
		<el-form>
			<div class="p-6">
				<h3 class="pb-3 text-2xl font-bold vishakha">
					{{ $t("formLabels.company_details") }}
					<BaseLabel :tooltip-content="$t('info.company_details')" :isShowLabel="false" />
				</h3>
				<div class="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6 lg:space-x-8">
					<div class="border-dashed border rounded-md border-gray-400 p-4 relative">
						<BaseLabel :tooltip-content="$t('info.reg_company_logo')" class="absolute right-0 top-0" />
						<el-form-item type="file" class="uploadImg mb-0" prop="imgUrl">
							<BaseCompanyLogo
								:limit="1"
								:disabled="disabled"
								:form-data="copyFormData"
								@upload-file="imgOnChange"
								@handle-remove="handleRemove"
								:aspect-ratio="16 / 9"
							/>
						</el-form-item>
					</div>

					<div class="grid md:grid-cols-2 lg:grid-cols-6 gap-5 lg:gap-6 flex-grow w-full">
						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.reg_company_name')" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel
									:label="$t('formLabels.reg_company_name')"
									:tooltip-content="$t('info.reg_company_name')"
									:isShowLabel="false"
								/>
							</template>
							<el-input
								v-model="formData.company_name"
								name="company_name"
								type="text"
								:class="{
									error: v$.company_name.$error,
								}"
								maxLength="100"
								:disabled="disabled"
								@change="v$.company_name.$touch"
							/>
							<span v-if="v$.company_name.$error" class="text-xs text-red-500 mt-2">{{ v$.company_name.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel
									:label="$t('formLabels.company_reg_number')"
									:tooltip-content="$t('info.company_reg_number')"
									:isShowLabel="false"
								/>
							</template>
							<el-input
								v-model.trim="formData.company_number"
								name="company_number"
								type="text"
								:class="{
									error: v$.company_number.$error,
								}"
								:disabled="disabled || isFilledPrimaryDetails"
								@change="v$.company_number.$touch"
								@keypress="CharcAndNumber"
							/>
							<span v-if="v$.company_number.$error" class="text-xs text-red-500 mt-2">{{ v$.company_number.$errors[0].$message }}</span>
						</el-form-item>

						<div class="flex items-start lg:col-span-3 mb-0 label-upper-dropdown">
							<div class="w-32 flex-initial mt-6">
								<BaseCountryDropdown
									v-model.trim="formData.company_telephone_country_code"
									:disabled="disabled"
									:dropdown-option="getCountry"
									:get-selected-country="getSelectedCountry"
									@selected-value="dropdownCompanyTelCountryCode"
								/>
							</div>

							<el-form-item class="ml-4 flex-1 mb-0 mandatory mt-6" :label="$t('formLabels.company_telephone')">
								<template #label>
									<BaseLabel :label="$t('formLabels.company_telephone')" :tooltip-content="$t('info.company_telephone')" />
								</template>
								<el-input
									v-model.trim="formData.company_telephone"
									type="text"
									:disabled="disabled"
									name="company_telephone"
									:class="{
										error: v$.company_telephone.$error,
									}"
									maxLength="10"
									@change="v$.company_telephone.$touch"
									@keypress="NumbersOnly(e)"
								/>
								<span v-if="v$.company_telephone.$error" class="text-xs text-red-500 mt-2">{{
									v$.company_telephone.$errors[0].$message
								}}</span>
							</el-form-item>
						</div>

						<el-form-item :label="$t('formLabels.company_email')" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.company_email')" :tooltip-content="$t('info.email')" />
							</template>
							<el-input
								v-model="formData.company_email"
								type="text"
								:disabled="disabled"
								name="company_email"
								:class="{
									error: v$.company_email.$error,
								}"
								@change="v$.company_email.$touch"
							/>
							<span v-if="v$.company_email.$error" class="text-xs text-red-500 mt-2">{{ v$.company_email.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.company_website')" :rules="[{ required: true }]" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel
									:label="$t('formLabels.company_website')"
									:tooltip-content="$t('info.company_website')"
									:isShowLabel="false"
								/>
							</template>
							<el-input
								v-model="formData.company_website"
								:disabled="disabled"
								type="text"
								name="company_website"
								:class="{
									error: v$.company_website.$error,
								}"
								@change="v$.company_website.$touch"
							/>
							<span v-if="v$.company_website.$error" class="text-xs text-red-500 mt-2">{{
								v$.company_website.$errors[0].$message
							}}</span>
						</el-form-item>

						<div class="lg:col-span-3">
							<div class="flex items-center">
								<span class="text-dark font-bold flex items-center">
									<span>{{ $t("formLabels.reg_company_address") }}</span>
									<span class="text-red-400">*</span>
								</span>
								<BaseLabel :tooltip-content="$t('info.reg_company_address')" :isShowLabel="false" />
							</div>
							<BaseAddress
								id="companyaddress"
								v-model="formData.company_address"
								:address="companyAddress"
								:disabled="disabled"
								name="company_address"
								maxLength="100"
								:class="{ error: v$.company_address.$error }"
								@changed_address="changeAddress"
								@get-address="getAddress"
								@change="companyAddressChange"
							/>
							<span v-if="v$.company_address.$error" class="text-xs text-red-500 mt-2">{{
								v$.company_address.$errors[0].$message
							}}</span>
						</div>

						<el-form-item :label="$t('formLabels.city')" class="lg:col-span-2 mb-0" :rules="[{ required: true }]">
							<template #label>
								<BaseLabel :label="$t('formLabels.city')" :tooltip-content="$t('info.city')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="formData.company_city"
								type="text"
								:disabled="disabled"
								name="company_city"
								:class="{
									error: v$.company_city.$error,
								}"
								maxLength="80"
								@change="v$.company_city.$touch"
								@keypress="CharcterWithWhitespace"
							/>
							<span v-if="v$.company_city.$error" class="text-xs text-red-500 mt-2">{{ v$.company_city.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.state')" class="lg:col-span-2 mb-0" :rules="[{ required: true }]">
							<template #label>
								<BaseLabel :label="$t('formLabels.state')" :tooltip-content="$t('info.state')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="formData.company_state"
								type="text"
								:disabled="disabled"
								name="company_state"
								:class="{
									error: v$.company_state.$error,
								}"
								maxLength="80"
								@change="v$.company_state.$touch"
								@keypress="CharcterWithWhitespace"
							/>
							<span v-if="v$.company_state.$error" class="text-xs text-red-500 mt-2">{{ v$.company_state.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.post_code')" :rules="[{ required: true }]" class="lg:col-span-2 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.post_code')" :tooltip-content="$t('info.post_code')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="formData.company_post_code"
								type="text"
								:disabled="disabled"
								name="company_post_code"
								:class="{
									error: v$.company_post_code.$error,
								}"
								maxLength="10"
								@change="v$.company_post_code.$touch"
								@keypress="CharcAndNumber"
							/>
							<span v-if="v$.company_post_code.$error" class="text-xs text-red-500 mt-2">{{
								v$.company_post_code.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.country')" :rules="[{ required: true }]" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.country')" :tooltip-content="$t('info.country')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="formData.company_country"
								type="text"
								:disabled="disabled"
								name="company_country"
								:class="{
									error: v$.company_country.$error,
								}"
								maxLength="80"
								@change="v$.company_country.$touch"
								@keypress="CharcterWithWhitespace"
							/>
							<span v-if="v$.company_country.$error" class="text-xs text-red-500 mt-2">{{
								v$.company_country.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.company_vat_number')" class="lg:col-span-3 mb-0" :rules="[{ required: true }]">
							<template #label>
								<BaseLabel :label="$t('formLabels.company_vat_number')" :tooltip-content="$t('info.company_vat_number')" />
							</template>
							<el-input
								v-model="formData.company_vat_number"
								name="company_vat_number"
								type="text"
								:disabled="disabled"
                                maxLength="20"
								:class="{
									error: v$.company_vat_number.$error,
								}"
								@change="v$.company_vat_number.$touch"
								@keypress="CharcAndNumber"
							/>
							<span v-if="v$.company_vat_number.$error" class="text-xs text-red-500 mt-2">{{
								v$.company_vat_number.$errors[0].$message
							}}</span>
						</el-form-item>

						<!-- <el-form-item :rules="[{ required: true }]" :label="$t('formLabels.timezone')" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.timezone')" :tooltip-content="$t('info.timezone')" />
							</template>
							<BaseSelectDropdown
								:dropdown-option="timeZones"
								:get-selected-country="getSelectedTimeZone"
								:number-only="false"
								:disabled="disabled"
								name="company_time_zone"
								:class="{
									error: v$.company_time_zone.$error,
								}"
								@selected-value="dropdownSelectedTimezone"
								@change="v$.company_time_zone.$touch"
							/>
							<span v-if="v$.company_time_zone.$error" class="text-xs text-red-500 mt-2">{{
								v$.company_time_zone.$errors[0].$message
							}}</span>
						</el-form-item> -->

						<div class="flex flex-wrap items-center lg:col-span-3 mb-0">
							<div class="flex items-center w-full">
								<span class="text-dark font-bold flex items-center">
									<span>{{ $t("formLabels.diverse_company") }}</span>
									<span class="text-red-400">*</span>
								</span>
								<BaseLabel :tooltip-content="$t('info.diverse_company')" />
							</div>
							<el-radio-group v-model="formData.is_diverse_company" :disabled="disabled" @change="diverseCompanyChange">
								<el-radio label="YES" size="large">Yes</el-radio>
								<el-radio label="NO" size="large">No</el-radio>
							</el-radio-group>
						</div>

						<el-form-item
							v-if="formData.is_diverse_company === 'YES'"
							:rules="[{ required: true }]"
							:label="$t('formLabels.company_type')"
							class="lg:col-span-3 mb-0"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.company_type')" :tooltip-content="$t('info.company_type')" />
							</template>
							<BaseSelectDropdown
								:dropdown-option="CompanyTypes"
								:get-selected-country="getSelectedCompanyData"
								:number-only="false"
								name="company_type"
								:disabled="disabled"
								:class="companyRequired ? 'error' : ''"
								@selected-value="dropdownSelectedCompanyType"
								@blur="companyTypeChange"
								:max-collapse-tags="3"
							/>
							<span v-if="companyRequired" class="text-xs text-red-500 mt-2">{{ "Company Type is required" }}</span>
						</el-form-item>

						<el-form-item
							v-if="companyTextVisible"
							:label="$t('formLabels.company_type')"
							:rules="[{ required: true }]"
							class="lg:col-span-3 mb-0"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.company_type')" :tooltip-content="$t('info.company_type')" />
							</template>
							<el-input v-model="formData.other_company_type" name="company_type" type="text" @keypress="CharcAndNumber" />
						</el-form-item>

						<el-form-item :label="$t('formLabels.category_level_1')" class="lg:col-span-3 mb-0" :rules="[{ required: true }]">
							<template #label>
								<BaseLabel
									:label="$t('formLabels.category_level_1')"
									:tooltip-content="$t('info.category_level_1')"
									:isShowLabel="false"
								/>
							</template>
							<BaseSelectDropdown
								v-model="copyFormData.category"
								:dropdown-option="categories"
								:get-selected-country="getSelectedCategory"
								:number-only="false"
								:isRemoteFilter="true"
								:name="'category'"
								:disabled="disabled"
								:class="{
									error: v$.category.$error,
								}"
								@selected-value="dropdownSelectedCategory"
								@remote-search="categoryDropdownSearch"
								@change="handleCategoryChange"
								@dropdown-change="handleCategoryChange"
							/>

							<span v-if="v$.category.$error" class="text-xs text-red-500 mt-2">{{ v$.category.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.category_level_2')" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel
									:label="$t('formLabels.category_level_2')"
									:tooltip-content="$t('info.category_level_2')"
									:isShowLabel="false"
								/>
							</template>
							<BaseSelectDropdown
								v-model="formData.sub_category"
								:dropdown-option="subCategories"
								:number-only="false"
								:get-selected-country="getSelectedSubCategory"
								:disabled="disabled || !formData.category"
								name="sub_category"
								:isRemoteFilter="true"
								@selected-value="dropdownSelectedSubCategory"
							/>
						</el-form-item>
					</div>
				</div>

				<h3 class="pb-3 text-2xl font-bold mt-10">
					{{ $t("formLabels.supplier-admin-details") }}
					<BaseLabel :tooltip-content="$t('info.supplier_admin_details')" />
				</h3>

				<div class="grid grid-cols-12 gap-5 lg:gap-6">
					<el-form-item :label="$t('formLabels.supplier_code')" class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
						<template #label>
							<BaseLabel :label="$t('formLabels.supplier_code')" :tooltip-content="$t('info.supplier_code')" :isShowLabel="false" />
						</template>
						<el-input v-model="formData.sup_ref_number" type="text" :disabled="true" />
					</el-form-item>

					<el-form-item :rules="[{ required: true }]" class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0" :label="$t('formLabels.first_name')">
						<template #label>
							<BaseLabel :label="$t('formLabels.first_name')" :tooltip-content="$t('info.first_name')" :isShowLabel="false" />
						</template>
						<el-input
							v-model="formData.first_name"
							type="text"
							:disabled="disabled"
							name="first_name"
							:class="{
								error: v$.first_name.$error,
							}"
							@change="v$.first_name.$touch"
							@keypress="CharSpecCharWithWhitespace"
						/>
						<span v-if="v$.first_name.$error" class="text-xs text-red-500 mt-2">{{ v$.first_name.$errors[0].$message }}</span>
					</el-form-item>

					<el-form-item :rules="[{ required: true }]" class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0" :label="$t('formLabels.last_name')">
						<template #label>
							<BaseLabel :label="$t('formLabels.last_name')" :tooltip-content="$t('info.last_name')" :isShowLabel="false" />
						</template>
						<el-input
							v-model="formData.last_name"
							:disabled="disabled"
							type="text"
							name="last_name"
							:class="{
								error: v$.last_name.$error,
							}"
							@change="v$.last_name.$touch"
							@keypress="CharSpecCharWithWhitespace"
						/>
						<span v-if="v$.last_name.$error" class="text-xs text-red-500 mt-2">{{ v$.last_name.$errors[0].$message }}</span>
					</el-form-item>

					<el-form-item :rules="[{ required: true }]" class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0" :label="$t('formLabels.department')">
						<template #label>
							<BaseLabel :label="$t('formLabels.department')" :tooltip-content="$t('info.department')" :isShowLabel="false" />
						</template>
						<el-input
							v-model="formData.department"
							:disabled="disabled"
							type="text"
							name="department"
							:class="{
								error: v$.department.$error,
							}"
							@change="v$.department.$touch"
							@keypress="CharcterWithWhitespace"
						/>
						<span v-if="v$.department.$error" class="text-xs text-red-500 mt-2">{{ v$.department.$errors[0].$message }}</span>
					</el-form-item>

					<el-form-item :rules="[{ required: true }]" class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0" :label="$t('formLabels.job_title')">
						<template #label>
							<BaseLabel :label="$t('formLabels.job_title')" :tooltip-content="$t('info.job_title')" :isShowLabel="false" />
						</template>
						<el-input
							v-model="formData.job_title"
							:disabled="disabled"
							type="text"
							name="job_title"
							:class="{
								error: v$.job_title.$error,
							}"
							@change="v$.job_title.$touch"
							@keypress="CharcterWithWhitespace"
						/>
						<span v-if="v$.job_title.$error" class="text-xs text-red-500 mt-2">{{ v$.job_title.$errors[0].$message }}</span>
					</el-form-item>

					<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0 hidden" :label="$t('formLabels.Pronouns')">
						<template #label>
							<BaseLabel :label="$t('formLabels.Pronouns')" :tooltip-content="$t('info.Pronouns')" />
						</template>
						<BaseSelectDropdown
							:dropdown-option="Pronouns"
							:get-selected-country="getSelectedPronouns"
							:number-only="false"
							:disabled="disabled"
							@selected-value="dropdownSelectedPronounsValue"
						/>
					</el-form-item>

					<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0 hidden" :label="$t('formLabels.preffered_name')">
						<template #label>
							<BaseLabel :label="$t('formLabels.preffered_name')" :tooltip-content="$t('info.preffered_name')" />
						</template>
						<el-input
							v-model.trim="formData.preffered_name"
							type="text"
							:disabled="disabled"
							name="preffered_name"
							:class="{
								error: v$.preffered_name.$error,
							}"
							@change="v$.preffered_name.$touch"
							@keypress="CharcterOnly"
						/>
						<span v-if="v$.preffered_name.$error" class="text-xs text-red-500 mt-2">{{ v$.preffered_name.$errors[0].$message }}</span>
					</el-form-item>

					<div class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
						<div class="flex items-center">
							<span class="text-dark font-bold flex items-center">
								<span>{{ $t("formLabels.address") }}</span>
								<!-- <span class="text-red-400">*</span> -->
							</span>
							<BaseLabel :tooltip-content="$t('info.address')" />
						</div>
						<BaseAddress
							id="address"
							v-model="formData.cor_address"
							:address="address"
							:required="true"
							:disabled="disabled"
							name="cor_address"
							:class="{
								error: v$.cor_address.$error,
							}"
							@changed_address="changeAddress"
							@get-address="getAddress"
							@change="v$.cor_address.$touch"
						/>
						<div>
							<el-checkbox v-if="formData.company_address" class="mt-2" v-model="AddressChecked" @change="AddressCheckBoxChange">{{
								$t("formLabels.same_address_as_above")
							}}</el-checkbox>

							<span v-if="v$.cor_address.$error" class="text-xs text-red-500 mt-2 w-full block">{{
								v$.cor_address.$errors[0].$message
							}}</span>
						</div>
					</div>

					<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0" :label="$t('formLabels.city')" :rules="[{ required: true }]">
						<template #label>
							<BaseLabel :label="$t('formLabels.city')" :tooltip-content="$t('info.city')" :isShowLabel="false" />
						</template>
						<el-input
							v-model="formData.cor_city"
							type="text"
							:disabled="disabled"
							name="cor_city"
							:class="{
								error: v$.cor_city.$error,
							}"
							@change="v$.cor_city.$touch"
							@keypress="CharcterWithWhitespace"
						/>

						<span v-if="v$.cor_city.$error" class="text-xs text-red-500 mt-2">{{ v$.cor_city.$errors[0].$message }}</span>
					</el-form-item>

					<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0" :label="$t('formLabels.state')" :rules="[{ required: true }]">
						<template #label>
							<BaseLabel :label="$t('formLabels.state')" :tooltip-content="$t('info.state')" :isShowLabel="false" />
						</template>
						<el-input
							v-model="formData.cor_state"
							type="text"
							:disabled="disabled"
							name="cor_state"
							:class="{
								error: v$.cor_state.$error,
							}"
							@change="v$.cor_state.$touch"
							@keypress="CharcterWithWhitespace"
						/>
						<span v-if="v$.cor_state.$error" class="text-xs text-red-500 mt-2">{{ v$.cor_state.$errors[0].$message }}</span>
					</el-form-item>

					<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0" :label="$t('formLabels.post_code')" :rules="[{ required: true }]">
						<template #label>
							<BaseLabel :label="$t('formLabels.post_code')" :tooltip-content="$t('info.post_code')" :isShowLabel="false" />
						</template>
						<el-input
							v-model="formData.cor_post_code"
							type="text"
							:disabled="disabled"
							name="cor_post_code"
							:class="{
								error: v$.cor_post_code.$error,
							}"
							maxlength="10"
							@change="v$.cor_post_code.$touch"
							@keypress="CharcAndNumber"
						/>
						<span v-if="v$.cor_post_code.$error" class="text-xs text-red-500 mt-2">{{ v$.cor_post_code.$errors[0].$message }}</span>
					</el-form-item>

					<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0" :label="$t('formLabels.country')" :rules="[{ required: true }]">
						<template #label>
							<BaseLabel :label="$t('formLabels.country')" :tooltip-content="$t('info.country')" :isShowLabel="false" />
						</template>
						<el-input
							v-model="formData.cor_country"
							type="text"
							:disabled="disabled"
							name="cor_country"
							:class="{
								error: v$.cor_country.$error,
							}"
							@change="v$.cor_country.$touch"
							@keypress="CharcterWithWhitespace"
						/>

						<span v-if="v$.cor_country.$error" class="text-xs text-red-500 mt-2">{{ v$.cor_country.$errors[0].$message }}</span>
					</el-form-item>

					<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0" :rules="[{ required: true }]" :label="$t('formLabels.email')">
						<template #label>
							<BaseLabel :label="$t('formLabels.email')" :tooltip-content="$t('info.email')" />
						</template>
						<el-input
							v-model="formData.email"
							type="text"
							:disabled="disabled || route.params?.id"
							name="email"
							:class="{
								error: v$.email.$error,
							}"
							@change="v$.email.$touch"
						/>

						<span v-if="v$.email.$error" class="text-xs text-red-500 mt-2">{{ v$.email.$errors[0].$message }}</span>
					</el-form-item>

					<div class="flex items-start col-span-12 md:col-span-6 2xl:col-span-4 mb-0 label-upper-dropdown">
						<div class="w-32 flex-initial mt-6">
							<BaseSelectDropdown
								v-model.trim="formData.mobile_country_code"
								placeholder="Search Country Code"
								:disabled="disabled"
								:dropdown-option="getCountry"
								:get-selected-country="getSelectedCountry"
								@selected-value="dropdownSelectedMobileCountryCodeValue"
							/>
						</div>
						<el-form-item :rules="[{ required: true }]" class="ml-4 flex-1 mb-0 mandatory mt-6" :label="$t('formLabels.contact_number')">
							<template #label>
								<BaseLabel :label="$t('formLabels.contact_number')" :tooltip-content="$t('info.contact_number')" />
							</template>
							<el-input
								v-model.trim="formData.mobile"
								type="text"
								:disabled="disabled"
								name="mobile"
								:class="{
									error: v$.mobile.$error,
								}"
								maxLength="10"
								@change="v$.mobile.$touch"
								@keypress="NumbersOnly(e)"
							/>
							<span v-if="v$.mobile.$error" class="text-xs text-red-500 mt-2">{{ v$.mobile.$errors[0].$message }}</span>
						</el-form-item>
					</div>

					<div v-if="authStore.role_id !== 'supplier_admin'" class="flex flex-wrap items-center col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
						<div class="flex items-center w-full">
							<span class="text-dark font-bold block">{{ $t("formLabels.is_key_supplier") }}</span>
							<span class="text-red-400">*</span>
							<BaseLabel :tooltip-content="$t('info.is_key_supplier')" :isShowLabel="false" />
						</div>
						<el-radio-group v-model="formData.key_supplier" :disabled="disabled">
							<el-radio :label="1" size="large">Yes</el-radio>
							<el-radio :label="0" size="large">No</el-radio>
						</el-radio-group>
					</div>

					<el-form-item
						v-if="formData.key_supplier === 1"
						class="col-span-8 sm:col-span-4 mb-0"
						:label="$t('formLabels.key_supplier_comment')"
					>
						<template #label>
							<BaseLabel :label="$t('formLabels.key_supplier_comment')" :tooltip-content="$t('info.key_supplier_comment')" />
						</template>
						<el-input
							v-model="formData.key_supplier_comment"
							type="text"
							:disabled="disabled"
							name="key_supplier_comment"
							maxLength="200"
							@keypress="CharcAndNumber"
						/>
					</el-form-item>

					<el-form-item :label="$t('formLabels.Status')" :rules="[{ required: true }]" class="col-span-8 lg:col-span-4 mb-0">
						<template #label>
							<BaseLabel :label="$t('formLabels.Status')" :tooltip-content="$t('info.Status')" />
						</template>
						<BaseSelectDropdown
							v-model="formData.status"
							:dropdown-option="dropdownOptionStatus"
							:number-only="false"
							:get-selected-country="getSelectedStatus"
							:disabled="disabled"
							name="status"
							:class="{
								error: v$.status.$error,
							}"
							@change="v$.status.$touch"
							@selected-value="dropdownSelectedStatus"
						/>
						<span v-if="v$.status.$error" class="text-xs text-red-500 mt-2">{{ v$.status.$errors[0].$message }}</span>
					</el-form-item>

					<el-form-item
						v-if="formData.status == 2"
						:rules="[{ required: true }]"
						class="lg:col-span-4 mb-0"
						:label="$t('formLabels.reason')"
					>
						<template #label>
							<BaseLabel :label="$t('formLabels.reason')" :tooltip-content="$t('info.reason')" />
						</template>
						<el-input
							v-model="formData.reason"
							type="text"
							:disabled="disabled"
							name="reason"
							:class="{
								error: v$.reason.$error,
							}"
							@change="v$.reason.$touch"
							@keypress="CharcterWithWhitespace"
						/>
						<span v-if="v$.reason.$error" class="text-xs text-red-500 mt-2">{{ v$.reason.$errors[0].$message }}</span>
					</el-form-item>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-7 md:gap-8 xl:gap-10 mt-6">
					<custom-input-add-edit
						ref="customFieldRef"
						:custom-data="customFields"
						module-name="supplier-admin"
						:disabled="disabled"
						custom-class="mb-0"
						@update-data="(value) => Object.assign(customFields, value)"
					/>
				</div>

				<h3 class="pb-3 text-2xl font-bold mt-10">
					{{ $t("formLabels.alternate_contact_details") }}
					<BaseLabel :tooltip-content="$t('info.alternate_contact_details')" />
				</h3>

				<div class="grid grid-cols-12 gap-5 lg:gap-6">
					<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0" :label="$t('formLabels.first_name')">
						<template #label>
							<BaseLabel :label="$t('formLabels.first_name')" :tooltip-content="$t('info.first_name')" :isShowLabel="false" />
						</template>
						<el-input
							v-model="formData.alt_first_name"
							type="text"
							:disabled="disabled"
							name="alt_first_name"
							:class="{
								error: v$.alt_first_name.$error,
							}"
							maxLength="50"
							@change="v$.alt_first_name.$touch"
							@keypress="CharSpecCharWithWhitespace"
						/>
						<span v-if="v$.alt_first_name.$error" class="text-xs text-red-500 mt-2">{{ v$.alt_first_name.$errors[0].$message }}</span>
					</el-form-item>

					<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0" :label="$t('formLabels.last_name')">
						<template #label>
							<BaseLabel :label="$t('formLabels.last_name')" :tooltip-content="$t('info.last_name')" :isShowLabel="false" />
						</template>
						<el-input
							v-model="formData.alt_last_name"
							type="text"
							:disabled="disabled"
							name="alt_last_name"
							:class="{
								error: v$.alt_last_name.$error,
							}"
							maxLength="50"
							@change="v$.alt_last_name.$touch"
							@keypress="CharSpecCharWithWhitespace"
						/>
						<span v-if="v$.alt_last_name.$error" class="text-xs text-red-500 mt-2">{{ v$.alt_last_name.$errors[0].$message }}</span>
					</el-form-item>

					<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0" :label="$t('formLabels.department')">
						<template #label>
							<BaseLabel :label="$t('formLabels.department')" :tooltip-content="$t('info.department')" :isShowLabel="false" />
						</template>
						<el-input
							v-model="formData.alt_department"
							type="text"
							:disabled="disabled"
							name="alt_department"
							:class="{
								error: v$.alt_department.$error,
							}"
							maxLength="80"
							@change="v$.alt_department.$touch"
							@keypress="CharcterWithWhitespace"
						/>
						<span v-if="v$.alt_department.$error" class="text-xs text-red-500 mt-2">{{ v$.alt_department.$errors[0].$message }}</span>
					</el-form-item>

					<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0" :label="$t('formLabels.job_title')">
						<template #label>
							<BaseLabel :label="$t('formLabels.job_title')" :tooltip-content="$t('info.job_title')" :isShowLabel="false" />
						</template>
						<el-input
							v-model="formData.alt_job_title"
							type="text"
							:disabled="disabled"
							name="alt_job_title"
							:class="{
								error: v$.alt_job_title.$error,
							}"
							maxLength="80"
							@change="v$.alt_job_title.$touch"
							@keypress="CharcterWithWhitespace"
						/>
						<span v-if="v$.alt_job_title.$error" class="text-xs text-red-500 mt-2">{{ v$.alt_job_title.$errors[0].$message }}</span>
					</el-form-item>

					<el-form-item class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0" :label="$t('formLabels.email')">
						<template #label>
							<BaseLabel :label="$t('formLabels.email')" :tooltip-content="$t('info.email')" />
						</template>
						<el-input
							v-model.trim="formData.alt_email"
							type="text"
							:disabled="disabled"
							name="alt_email"
							:class="{
								error: v$.alt_email.$error,
							}"
							@change="v$.alt_email.$touch"
						/>
						<span v-if="v$.alt_email.$error" class="text-xs text-red-500 mt-2">{{ v$.alt_email.$errors[0].$message }}</span>
					</el-form-item>

					<div class="flex items-start col-span-12 md:col-span-6 2xl:col-span-4 mb-0 label-upper-dropdown">
						<div class="w-32 flex-initial mt-6">
							<BaseCountryDropdown
								v-model.trim="formData.alt_mobile_country_code"
								:disabled="disabled"
								:dropdown-option="getCountry"
								:get-selected-country="getSelectedCountry"
								@selected-value="dropdownSelectedValue"
							/>
						</div>
						<el-form-item class="mb-0 flex-1 ml-4 mt-6" :label="$t('formLabels.contact_number')">
							<template #label>
								<BaseLabel :label="$t('formLabels.contact_number')" :tooltip-content="$t('info.contact_number')" />
							</template>
							<el-input
								v-model.trim="formData.alt_mobile"
								type="text"
								:disabled="disabled"
								name="alt_mobile"
								maxLength="10"
								:class="{
									error: v$.alt_mobile.$error,
								}"
								@change="v$.alt_mobile.$touch"
								@keypress="NumbersOnly"
							/>
							<span v-if="v$.alt_mobile.$error" class="text-xs text-red-500 mt-2">{{ v$.alt_mobile.$errors[0].$message }}</span>
						</el-form-item>
					</div>
				</div>

				<div class="pt-6">
					<div class="flex items-start gap-2 w-full">
						<el-checkbox
							v-model="formData.is_consent_to_share_with_marketplace"
							class="text-gray-600 mr-2"
							:disabled="disabled"
							name="is_consent_to_share_with_marketplace"
							id="supplier_global_customer_checked"
							:checked="formData.is_consent_to_share_with_marketplace == 1 ? true : false"
						/>
						<div class="mt-1">
							<label for="supplier_global_customer_checked" class="text-base">
								{{ $t("formLabels.supplier_global_customer_checked") }}
							</label>
							<a class="text-blue-500 underline" href="https://buyingstation.com" target="_blank">BuyingStation.com</a>
						</div>
					</div>
					<div class="flex items-start gap-2 w-full">
						<el-checkbox
							v-model="formData.is_privacy_agreed"
							class="text-gray-600 mr-2"
							:disabled="disabled"
							name="is_privacy_agreed"
							id="supplier_privacy_checked"
							:checked="formData.is_privacy_agreed == 1 ? true : false"
						/>
						<div class="mt-1">
							<label for="supplier_privacy_checked" class="text-base"> {{ $t("formLabels.supplier_privacy_checked") }} </label>
							<a class="text-blue-500 underline cursor-pointer" href="/privacy-policy" target="_blank"> here.</a>
						</div>
					</div>
					<!-- <div class="flex">
						<p>Read</p>
					</div> -->
				</div>

				<div class="pt-4 text-right">
					<novok-button class="btn-dark my-1" v-if="authStore.role_id !== 'supplier_admin'" @click="CancelRedirect('/supplier-admins')">
						<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
						<i class="fa-solid fa-xmark sm:hidden"></i>
					</novok-button>

					<novok-button
						v-if="!disabled"
						class="my-1"
						type="info"
						:loading="loading"
						:disabled="loading"
						@click.prevent="onSubmit('save&next')"
						>{{ $t("buttons.save&next") }}
					</novok-button>

					<novok-button
						v-if="!disabled"
						class="my-1"
						type="info"
						:loading="loadingSave"
						:disabled="loadingSave"
						@click.prevent="onSubmit('save')"
						>{{ $t("buttons.save") }}
					</novok-button>
				</div>
			</div>
		</el-form>
	</div>
</template>
<style>
	.is-error {
		color: red;
	}
</style>
