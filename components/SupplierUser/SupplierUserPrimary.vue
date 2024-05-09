<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/attribute-hyphenation -->
<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
	import { required, maxLength, helpers, email, minLength } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import { supplierStore } from "~/store/supplier";
	import { getErrors } from "~/helper/getErrors";
	import { Pronouns } from "~/helper/data";
	const { getSelectedCountry, getCountry } = useGetSelectedCountry();
	import { removeEmptyValues } from "~/helper/common";

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

	let formData = reactive<any>({
		tab_name: "supplier-user",
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
		telephone: "",
		mobile: "",
		telephone_country_code: "+44",
		mobile_country_code: "+44",
		alt_first_name: "",
		alt_last_name: "",
		alt_department: "",
		alt_job_title: "",
		alt_email: "",
		alt_telephone: "",
		alt_mobile: "",
		alt_telephone_country_code: "+44",
		alt_mobile_country_code: "+44",
	});
	const fullscreenLoading = ref(false);
	const loading = ref(false);
	const loadingSave = ref(false);
	const supplierCreatedId = ref("");

	const localePath = useLocalePath();
	const { t } = useI18n();
	const SupplierStore = supplierStore();
	const emit = defineEmits(["active-tab-name", "disable", "disabled"]);
	const route = useRoute();
	const copyFormData = ref<any>([]);
	const companyAddress = ref("");
	const address = ref("");
	const rules = computed(() => {
		return {
			cor_state: {
				maxLength: helpers.withMessage(t("formValidations.state_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			cor_country: {
				maxLength: helpers.withMessage(t("formValidations.country_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			cor_city: {
				maxLength: helpers.withMessage(t("formValidations.city"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			cor_address: {
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
			telephone: {
				required: helpers.withMessage(t("formValidations.telephone_no"), required),
				name_validation: {
					$validator: PasteNumberOnly,
					$message: t("copyPasteValidations.number"),
				},
				minLength: helpers.withMessage(t("formValidations.telephone_no_max"), minLength(10)),
			},
			mobile: {
				required: helpers.withMessage(t("formValidations.contact_number"), required),
				name_validation: {
					$validator: PasteNumberOnly,
					$message: t("copyPasteValidations.number"),
				},
				minLength: helpers.withMessage(t("formValidations.contact_number_max"), minLength(10)),
			},
			preffered_name: {
				maxLength: helpers.withMessage(t("formValidations.preffered_name_max"), maxLength(50)),
				name_validation: {
					$validator: PasteCharcOnly,
					$message: t("copyPasteValidations.characters"),
				},
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
				maxLength: helpers.withMessage(t("formValidations.department_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			alt_job_title: {
				maxLength: helpers.withMessage(t("formValidations.job_title_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
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
			alt_telephone: {
				name_validation: {
					$validator: PasteNumberOnly,
					$message: t("copyPasteValidations.number"),
				},
				minLength: helpers.withMessage(t("formValidations.telephone_no_max"), minLength(10)),
			},
			alt_mobile: {
				name_validation: {
					$validator: PasteNumberOnly,
					$message: t("copyPasteValidations.number"),
				},
				minLength: helpers.withMessage(t("formValidations.contact_number_max"), minLength(10)),
			},
		};
	});
	const v$ = useVuelidate(rules, formData);

	watch(
		() => props.editData,
		(currData) => {
			if (currData.tab === "supplier-user" || currData.tab === "all") {
				v$.value.$reset();
				if (Object.keys(currData || {}).length) {
					Object.keys(formData).forEach((field: any) => {
						if (currData?.[field] !== undefined && currData?.[field] !== null && currData?.[field] !== "") {
							formData[field] = currData?.[field];
							companyAddress.value = currData?.company_address;
							address.value = currData?.cor_address;

							copyFormData.value = JSON.parse(JSON.stringify(currData));
						}
					});
				}
			}
		}
	);

	onMounted(() => {
		if (route.query.page !== "edit") {
			formData.supplier_admin_id = route.params?.id ? route.params?.id : "";
		}
		copyFormData.value = JSON.parse(JSON.stringify(formData));
	});

	const getSelectedPronouns = () => {
		return Pronouns.find((pronouns) => pronouns.value === formData.pronouns);
	};

	const dropdownSelectedPronounsValue = (value: any) => {
		formData.pronouns = value;
	};

	const changeAddress = (address: any) => {
		formData.cor_address = address;
	};

	const getAddress = (address: any, companyAddress: any) => {
		formData.cor_address = companyAddress;
		formData.cor_city = address?.city;
		formData.cor_country = address?.country;
		formData.cor_post_code = address?.postal_code;
		formData.cor_state = address?.region;
	};

	const dropdownSelectedTelCountryCodeValue = (value: any) => {
		formData.telephone_country_code = value;
	};

	const dropdownSelectedMobileCountryCodeValue = (value: any) => {
		formData.mobile_country_code = value;
	};

	const dropdownSelectedCountryCodeValue = (value: any) => {
		formData.alt_telephone_country_code = value;
	};

	const dropdownSelectedValue = (value: any) => {
		formData.alt_mobile_country_code = value;
	};

	const onSubmit = (value: any) => {
		v$.value.$validate();
		formData = removeEmptyValues(formData);

		if (!v$.value.$error) {
			if (route.params?.id && route.query.page) {
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
			if (value !== "save") {
				loading.value = true;
			} else {
				loadingSave.value = true;
			}

			const res: any = await useApiFetch("/supplier-users", {
				method: "POST",
				body: formData,
			});

			supplierCreatedId.value = res.data?.id;
			SupplierStore.setNewSupplierId(res.data?.id);
			emit("disable", false);

			if (value !== "save") {
				SupplierStore.setActiveTab("alternative-contact");
				emit("active-tab-name", "alternative-contact");
				navigateTo(
					localePath({
						path: `/supplier-users/edit-supplier-user/${res.data?.id}`,
						query: { tab: "alternative-contact" },
					}),
					{ replace: true }
				);
			} else {
				useToast("success", res?.message);
				navigateTo(localePath("/supplier-users"));
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

			const res: any = await useApiFetch(`/supplier-users/${route.params?.id}/supplier-user`, {
				method: "POST",
				body: formData,
			});

			emit("disabled", true);
			if (value !== "save") {
				SupplierStore.setActiveTab("alternative-contact");
				emit("active-tab-name", "alternative-contact");
			} else {
				useToast("success", res?.message);
				if (route.query.page === "view") {
					navigateTo(
						localePath({
							path: `/supplier-users/view-supplier-user/${route.params?.id}`,
							query: { page: "view" },
						})
					);
				} else {
					navigateTo(localePath("/supplier-users"));
				}
			}
		} catch {
		} finally {
			loading.value = false;
			loadingSave.value = false;
		}
	};

	const cancelClick = () => {
		const supplier_admin_id = useCookie("supplier_admin_id");

		const pageDetails = JSON.parse(sessionStorage.getItem("pageDetails") || "{}");
		const queryUrl = {
			page: pageDetails?.page,
			perPage: pageDetails?.perPage,
			searchValue: pageDetails?.searchValue,
			sortOrder: pageDetails?.sortOrder,
			sortColumn: pageDetails?.sortColumn,
			supplier_admin_id : supplier_admin_id.value,
		};

		if (route.query.page === "view") {
			navigateTo(localePath(`/supplier-users/view-supplier-user/${route.params?.id}?supplier_admin_id=${supplier_admin_id.value}`));
		} else {
			navigateTo(
				localePath({
					name: "supplier-users",
					query: queryUrl,
				})
			);
		}
	};
</script>

<template>
	<div v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="flex flex-col relative">
		<div class="px-6 bg-[#fff]">
			<el-form class="grid grid-cols-8 gap-5 lg:gap-6">
				<h3 class="text-2xl font-bold col-span-8">
					{{ $t("formLabels.primary_details") }}
					<BaseLabel :tooltip-content="$t('info.primary_details')" />
				</h3>
				<el-form-item :rules="[{ required: true }]" class="col-span-8 sm:col-span-4 mb-0" :label="$t('formLabels.first_name')">
					<template #label>
						<BaseLabel :label="$t('formLabels.first_name')" :tooltip-content="$t('info.first_name')" :isShowLabel="false" />
					</template>
					<el-input
						v-model="formData.first_name"
						type="text"
						name="first_name"
						:class="{
							error: v$.first_name.$error,
						}"
						:disabled="disabled"
						maxLength="50"
						@change="v$.first_name.$touch"
						@keypress="CharSpecCharWithWhitespace"
					/>
					<span v-if="v$.first_name.$error" class="text-xs text-red-500 mt-2">{{ v$.first_name.$errors[0].$message }}</span>
				</el-form-item>

				<el-form-item :rules="[{ required: true }]" class="col-span-8 sm:col-span-4 mb-0" :label="$t('formLabels.last_name')">
					<template #label>
						<BaseLabel :label="$t('formLabels.last_name')" :tooltip-content="$t('info.last_name')" :isShowLabel="false" />
					</template>
					<el-input
						v-model="formData.last_name"
						type="text"
						name="last_name"
						:class="{
							error: v$.last_name.$error,
						}"
						maxLength="50"
						:disabled="disabled"
						@change="v$.last_name.$touch"
						@keypress="CharSpecCharWithWhitespace"
					/>
					<span v-if="v$.last_name.$error" class="text-xs text-red-500 mt-2">{{ v$.last_name.$errors[0].$message }}</span>
				</el-form-item>

				<el-form-item :rules="[{ required: true }]" class="col-span-8 sm:col-span-4 mb-0" :label="$t('formLabels.department')">
					<template #label>
						<BaseLabel :label="$t('formLabels.department')" :tooltip-content="$t('info.department')" :isShowLabel="false" />
					</template>
					<el-input
						v-model="formData.department"
						type="text"
						name="department"
						:class="{
							error: v$.department.$error,
						}"
						:disabled="disabled"
						maxLength="80"
						@change="v$.department.$touch"
						@keypress="CharcterWithWhitespace"
					/>
					<span v-if="v$.department.$error" class="text-xs text-red-500 mt-2">{{ v$.department.$errors[0].$message }}</span>
				</el-form-item>

				<el-form-item :rules="[{ required: true }]" class="col-span-8 sm:col-span-4 mb-0" :label="$t('formLabels.job_title')">
					<template #label>
						<BaseLabel :label="$t('formLabels.job_title')" :tooltip-content="$t('info.job_title')" :isShowLabel="false" />
					</template>
					<el-input
						v-model="formData.job_title"
						type="text"
						name="job_title"
						:class="{
							error: v$.job_title.$error,
						}"
						maxLength="80"
						:disabled="disabled"
						@change="v$.job_title.$touch"
						@keypress="CharcterWithWhitespace"
					/>
					<span v-if="v$.job_title.$error" class="text-xs text-red-500 mt-2">{{ v$.job_title.$errors[0].$message }}</span>
				</el-form-item>

				<el-form-item class="col-span-8 sm:col-span-4 mb-0 hidden" :label="$t('formLabels.Pronouns')">
					<template #label>
						<BaseLabel :label="$t('formLabels.Pronouns')" :tooltip-content="$t('info.Pronouns')" :isShowLabel="false" />
					</template>
					<BaseSelectDropdown
						:dropdown-option="Pronouns"
						:get-selected-country="getSelectedPronouns"
						:number-only="false"
						@selected-value="dropdownSelectedPronounsValue"
					/>
				</el-form-item>

				<el-form-item class="col-span-8 sm:col-span-5 md:col-span-3 mb-0 hidden" :label="$t('formLabels.preffered_name')">
					<template #label>
						<BaseLabel :label="$t('formLabels.preffered_name')" :tooltip-content="$t('info.preffered_name')" :isShowLabel="false" />
					</template>
					<el-input
						v-model.trim="formData.preffered_name"
						type="text"
						name="preffered_name"
						:class="{
							error: v$.preffered_name.$error,
						}"
						maxLength="50"
						@change="v$.preffered_name.$touch"
						@keypress="CharcterOnly"
					/>
					<span v-if="v$.preffered_name.$error" class="text-xs text-red-500 mt-2">{{ v$.preffered_name.$errors[0].$message }}</span>
				</el-form-item>

				<div class="col-span-8 sm:col-span-4 mb-0">
					<div class="inline-flex items-center mr-5">
						<span class="text-dark font-bold block">{{ $t("formLabels.address") }}</span>
						<BaseLabel :tooltip-content="$t('info.address')" />
					</div>
					<BaseAddress
						id="address"
						v-model="formData.cor_address"
						:address="address"
						:required="false"
						name="cor_address"
						:class="{
							error: v$.cor_address.$error,
						}"
						:disabled="disabled"
						maxLength="100"
						@changed_address="changeAddress"
						@get-address="getAddress"
						@change="v$.cor_address.$touch"
					/>

					<span v-if="v$.cor_address.$error" class="text-xs text-red-500 mt-2">{{ v$.cor_address.$errors[0].$message }}</span>
				</div>

				<el-form-item class="col-span-8 sm:col-span-4 mb-0" :label="$t('formLabels.city')">
					<template #label>
						<BaseLabel :label="$t('formLabels.city')" :tooltip-content="$t('info.city')" :isShowLabel="false" />
					</template>
					<el-input
						v-model="formData.cor_city"
						type="text"
						name="cor_city"
						:class="{
							error: v$.cor_city.$error,
						}"
						:disabled="disabled"
						maxLength="80"
						@change="v$.cor_city.$touch"
						@keypress="CharcterWithWhitespace"
					/>

					<span v-if="v$.cor_city.$error" class="text-xs text-red-500 mt-2">{{ v$.cor_city.$errors[0].$message }}</span>
				</el-form-item>

				<el-form-item class="col-span-8 sm:col-span-4 mb-0" :label="$t('formLabels.state')">
					<template #label>
						<BaseLabel :label="$t('formLabels.state')" :tooltip-content="$t('info.state')" :isShowLabel="false" />
					</template>
					<el-input
						v-model="formData.cor_state"
						type="text"
						name="cor_state"
						:class="{ error: v$.cor_state.$error }"
						:disabled="disabled"
						maxLength="80"
						@change="v$.cor_state.$touch"
						@keypress="CharcterWithWhitespace"
					/>
					<span v-if="v$.cor_state.$error" class="text-xs text-red-500 mt-2">{{ v$.cor_state.$errors[0].$message }}</span>
				</el-form-item>

				<el-form-item class="col-span-8 sm:col-span-4 mb-0" :label="$t('formLabels.post_code')">
					<template #label>
						<BaseLabel :label="$t('formLabels.post_code')" :tooltip-content="$t('info.post_code')" :isShowLabel="false" />
					</template>
					<el-input
						v-model="formData.cor_post_code"
						type="text"
						name="cor_post_code"
						:class="{
							error: v$.cor_post_code.$error,
						}"
						:disabled="disabled"
						maxlength="10"
						@change="v$.cor_post_code.$touch"
						@keypress="CharcAndNumber"
					/>
					<span v-if="v$.cor_post_code.$error" class="text-xs text-red-500 mt-2">{{ v$.cor_post_code.$errors[0].$message }}</span>
				</el-form-item>

				<el-form-item class="col-span-8 sm:col-span-4 mb-0" :label="$t('formLabels.country')">
					<template #label>
						<BaseLabel :label="$t('formLabels.country')" :tooltip-content="$t('info.country')" :isShowLabel="false" />
					</template>
					<el-input
						v-model="formData.cor_country"
						type="text"
						name="cor_country"
						:class="{ error: v$.cor_country.$error }"
						:disabled="disabled"
						@change="v$.cor_country.$touch"
						@keypress="CharcterWithWhitespace"
					/>

					<span v-if="v$.cor_country.$error" class="text-xs text-red-500 mt-2">{{ v$.cor_country.$errors[0].$message }}</span>
				</el-form-item>

				<el-form-item class="col-span-8 sm:col-span-4 mb-0" :rules="[{ required: true }]" :label="$t('formLabels.email')">
					<template #label>
						<BaseLabel :label="$t('formLabels.email')" :tooltip-content="$t('info.company_email')" />
					</template>
					<el-input
						v-model="formData.email"
						type="text"
						name="email"
						:class="{
							error: v$.email.$error,
						}"
						maxLength="80"
						:disabled="disabled || route.query.page"
						@change="v$.email.$touch"
					/>

					<span v-if="v$.email.$error" class="text-xs text-red-500 mt-2">{{ v$.email.$errors[0].$message }}</span>
				</el-form-item>

				<div class="flex items-start col-span-8 sm:col-span-4 mb-0 label-upper-dropdown">
					<div class="w-32 flex-initial mt-6">
						<BaseCountryDropdown
							v-model.trim="formData.telephone_country_code"
							:dropdown-option="getCountry"
							:get-selected-country="getSelectedCountry"
							:disabled="disabled"
							@selected-value="dropdownSelectedTelCountryCodeValue"
						/>
					</div>

					<el-form-item :rules="[{ required: true }]" class="ml-4 flex-1 mb-0 mandatory mt-6" :label="$t('formLabels.telephone_no')">
						<template #label>
							<BaseLabel :label="$t('formLabels.telephone_no')" :tooltip-content="$t('info.telephone_no')" />
						</template>
						<el-input
							v-model.trim="formData.telephone"
							type="text"
							name="telephone"
							:class="{ error: v$.telephone.$error }"
							:disabled="disabled"
							maxLength="10"
							@change="v$.telephone.$touch"
							@keypress="NumbersOnly"
						/>
						<span v-if="v$.telephone.$error" class="text-xs text-red-500 mt-2">{{ v$.telephone.$errors[0].$message }}</span>
					</el-form-item>
				</div>

				<div class="flex items-start col-span-8 sm:col-span-4 mb-0 label-upper-dropdown">
					<div class="w-32 flex-initial mt-6">
						<BaseCountryDropdown
							v-model.trim="formData.mobile_country_code"
							:dropdown-option="getCountry"
							:get-selected-country="getSelectedCountry"
							:disabled="disabled"
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
							name="mobile"
							:class="{ error: v$.mobile.$error }"
							:disabled="disabled"
							maxLength="10"
							@change="v$.mobile.$touch"
							@keypress="NumbersOnly"
						/>
						<span v-if="v$.mobile.$error" class="text-xs text-red-500 mt-2">{{ v$.mobile.$errors[0].$message }}</span>
					</el-form-item>
				</div>

				<h3 class="text-2xl font-bold mt-2 col-span-8">
					{{ $t("formLabels.alternate_contact_details") }}
					<BaseLabel :tooltip-content="$t('info.alternate_contact_details')" />
				</h3>

				<el-form-item class="col-span-8 sm:col-span-5 md:col-span-3 mb-0" :label="$t('formLabels.first_name')">
					<template #label>
						<BaseLabel :label="$t('formLabels.first_name')" :tooltip-content="$t('info.first_name')" :isShowLabel="false" />
					</template>
					<el-input
						v-model="formData.alt_first_name"
						type="text"
						name="alt_first_name"
						:class="{
							error: v$.alt_first_name.$error,
						}"
						maxLength="50"
						:disabled="disabled"
						@change="v$.alt_first_name.$touch"
						@keypress="CharSpecCharWithWhitespace"
					/>
					<span v-if="v$.alt_first_name.$error" class="text-xs text-red-500 mt-2">{{ v$.alt_first_name.$errors[0].$message }}</span>
				</el-form-item>

				<el-form-item class="col-span-8 sm:col-span-4 md:col-span-3 mb-0" :label="$t('formLabels.last_name')">
					<template #label>
						<BaseLabel :label="$t('formLabels.last_name')" :tooltip-content="$t('info.last_name')" :isShowLabel="false" />
					</template>
					<el-input
						v-model="formData.alt_last_name"
						type="text"
						name="alt_last_name"
						:class="{
							error: v$.alt_last_name.$error,
						}"
						maxLength="50"
						:disabled="disabled"
						@change="v$.alt_last_name.$touch"
						@keypress="CharSpecCharWithWhitespace"
					/>
					<span v-if="v$.alt_last_name.$error" class="text-xs text-red-500 mt-2">{{ v$.alt_last_name.$errors[0].$message }}</span>
				</el-form-item>

				<el-form-item class="col-span-8 sm:col-span-2 mb-0" :label="$t('formLabels.department')">
					<template #label>
						<BaseLabel :label="$t('formLabels.department')" :tooltip-content="$t('info.department')" :isShowLabel="false" />
					</template>
					<el-input
						v-model="formData.alt_department"
						type="text"
						name="alt_department"
						:class="{
							error: v$.alt_department.$error,
						}"
						maxLength="80"
						:disabled="disabled"
						@change="v$.alt_department.$touch"
						@keypress="CharcterWithWhitespace"
					/>
					<span v-if="v$.alt_department.$error" class="text-xs text-red-500 mt-2">{{ v$.alt_department.$errors[0].$message }}</span>
				</el-form-item>

				<el-form-item class="col-span-8 sm:col-span-4 md:col-span-4 mb-0" :label="$t('formLabels.job_title')">
					<template #label>
						<BaseLabel :label="$t('formLabels.job_title')" :tooltip-content="$t('info.job_title')" :isShowLabel="false" />
					</template>
					<el-input
						v-model="formData.alt_job_title"
						type="text"
						name="alt_job_title"
						:class="{
							error: v$.alt_job_title.$error,
						}"
						:disabled="disabled"
						maxLength="80"
						@change="v$.alt_job_title.$touch"
						@keypress="CharcterWithWhitespace"
					/>
					<span v-if="v$.alt_job_title.$error" class="text-xs text-red-500 mt-2">{{ v$.alt_job_title.$errors[0].$message }}</span>
				</el-form-item>

				<el-form-item class="col-span-8 sm:col-span-4 mb-0" :label="$t('formLabels.email')">
					<template #label>
						<BaseLabel :label="$t('formLabels.email')" :tooltip-content="$t('info.company_email')" />
					</template>
					<el-input
						v-model.trim="formData.alt_email"
						type="text"
						name="alt_email"
						:class="{
							error: v$.alt_email.$error,
						}"
						:disabled="disabled"
						@change="v$.alt_email.$touch"
					/>
					<span v-if="v$.alt_email.$error" class="text-xs text-red-500 mt-2">{{ v$.alt_email.$errors[0].$message }}</span>
				</el-form-item>

				<div class="flex items-start col-span-8 sm:col-span-4 label-upper-dropdown">
					<div class="w-32 flex-initial mt-6">
						<BaseCountryDropdown
							v-model.trim="formData.alt_telephone_country_code"
							:dropdown-option="getCountry"
							:get-selected-country="getSelectedCountry"
							:disabled="disabled"
							@selected-value="dropdownSelectedCountryCodeValue"
						/>
					</div>
					<el-form-item class="mb-0 flex-1 ml-4 mt-6" :label="$t('formLabels.telephone_no')">
						<template #label>
							<BaseLabel :label="$t('formLabels.telephone_no')" :tooltip-content="$t('info.telephone_no')" />
						</template>
						<el-input
							v-model.trim="formData.alt_telephone"
							type="text"
							name="alt_telephone"
							maxLength="10"
							:class="{ error: v$.alt_telephone.$error }"
							:disabled="disabled"
							@change="v$.alt_telephone.$touch"
							@keypress="NumbersOnly"
						/>
						<span v-if="v$.alt_telephone.$error" class="text-xs text-red-500 mt-2">{{ v$.alt_telephone.$errors[0].$message }}</span>
					</el-form-item>
				</div>

				<div class="flex items-start col-span-8 sm:col-span-4 label-upper-dropdown">
					<div class="w-32 flex-initial mt-6">
						<BaseCountryDropdown
							v-model.trim="formData.alt_mobile_country_code"
							:dropdown-option="getCountry"
							:get-selected-country="getSelectedCountry"
							:disabled="disabled"
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
							name="alt_mobile"
							maxLength="10"
							:class="{ error: v$.alt_mobile.$error }"
							:disabled="disabled"
							@change="v$.alt_mobile.$touch"
							@keypress="NumbersOnly"
						/>
						<span v-if="v$.alt_mobile.$error" class="text-xs text-red-500 mt-2">{{ v$.alt_mobile.$errors[0].$message }}</span>
					</el-form-item>
				</div>
			</el-form>
			<div class="pt-4 text-right">
				<novok-button class="btn-dark my-1" @click.prevent="cancelClick"
					><span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span
					><i class="fa-solid fa-xmark sm:hidden"></i
				></novok-button>

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
	</div>
</template>
