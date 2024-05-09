<script setup lang="ts">
	import { required, email, minLength, maxLength, helpers } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import moment from "moment";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import { languageData, CurrencyData } from "~/helper/data";
	import { removeEmptyValues } from "~/helper/common";

	definePageMeta({
		middleware: ["auth"],
	});

	let formData = reactive<any>({
		company_name: "",
		company_number: "",
		company_address: "",
		company_city: "",
		company_state: "",
		company_post_code: "",
		company_country: "",
		first_name: "",
		last_name: "",
		email: "",
		country_code: "+44",
		mobile_number: "",
		job_title: "",
		department: "",
		address: "",
		city: "",
		state: "",
		country: "",
		post_code: "",
		preferred_langauge: "English",
		currency: "GBP",
		account_status: 1,
		account_activation_date: "",
		company_id: "",
		company_logo: "",
	});
	const copyFormData = ref<any>({});
	const loading = ref(false);
	const route = useRoute();
	const fullscreenLoading = ref(false);
	const formHeight = ref<any>(null);
	const localePath = useLocalePath();
	const { t } = useI18n();
	const address = ref("");
	const companyAddress = ref<any>("");
	const deleteImg = ref(false);
	const resendEmailLink = ref(1);
	const AddressChecked = ref(false);

	const { getSelectedCountry, getCountry } = useGetSelectedCountry();

	const rules = computed(() => {
		return {
			company_name: {
				required: helpers.withMessage(t("formValidations.reg_company_name"), required),
				maxLength: helpers.withMessage(t("formValidations.reg_company_name_max"), maxLength(100)),
				// name_validation: {
				//   $validator: PasteCharcAndNumWithSpace,
				//   $message: t("copyPasteValidations.charNum"),
				// },
			},
			company_number: {
				required: helpers.withMessage(t("formValidations.reg_company_number"), required),
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
				maxLength: helpers.withMessage(t("formValidations.state_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			company_post_code: {
				required: helpers.withMessage(t("formValidations.post_code"), required),
				name_validation: {
					$validator: PasteCharcAndNumWithSpace,
					$message: t("copyPasteValidations.charNum"),
				},
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
			email: {
				required: helpers.withMessage(t("formValidations.email"), required),
				email: helpers.withMessage(t("formValidations.email_valid"), email),
				name_validation: {
					$validator: PasteEmail,
					$message: t("formValidations.email_valid"),
				},
			},
			mobile_number: {
				required: helpers.withMessage(t("formValidations.contact_number"), required),
				minLength: helpers.withMessage(t("formValidations.contact_number_min"), minLength(10)),
				maxLength: helpers.withMessage(t("formValidations.contact_number_max"), maxLength(10)),
				name_validation: {
					$validator: PasteNumberOnly,
					$message: t("copyPasteValidations.number"),
				},
			},
			job_title: {
				required: helpers.withMessage(t("formValidations.job_title"), required),
				maxLength: helpers.withMessage(t("formValidations.job_title_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcAndNumWithSpace,
					$message: t("copyPasteValidations.charNum"),
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
			address: {
				required: helpers.withMessage(t("formValidations.super_user_address"), required),
				maxLength: helpers.withMessage(t("formValidations.super_user_address_max"), maxLength(100)),
			},
			city: {
				maxLength: helpers.withMessage(t("formValidations.city"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			country: {
				required: helpers.withMessage(t("formValidations.country"), required),
				maxLength: helpers.withMessage(t("formValidations.country_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			state: {
				maxLength: helpers.withMessage(t("formValidations.state_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			post_code: {
				required: helpers.withMessage(t("formValidations.post_code"), required),
				maxLength: helpers.withMessage(t("formValidations.post_code_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcAndNumWithSpace,
					$message: t("copyPasteValidations.charNum"),
				},
			},
			preferred_langauge: {
				maxLength: helpers.withMessage(t("formValidations.preferred_langauge_max"), maxLength(50)),
				name_validation: {
					$validator: PasteCharcOnly,
					$message: t("copyPasteValidations.characters"),
				},
			},
			currency: {
				maxLength: helpers.withMessage(t("formValidations.currency_max"), maxLength(50)),
			},
			account_activation_date: {
				required: helpers.withMessage(t("formValidations.date"), required),
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

	onMounted(async () => {
		copyFormData.value = JSON.parse(JSON.stringify(formData));
		formHeight.value = GetOffset("super-admin-form", 0);
		formData.account_activation_date = moment().format("YYYY-MM-DD");
		if (route.params?.id) {
			await getEditTableData();
		}
	});

	const dropdownSelectedPrefLanguage = (value: any) => {
		copyFormData.value.preferred_langauge = value;
	};

	const getSelectedLanguage = computed(() => {
		return languageData.map((item: any) => item.value === copyFormData.value.preferred_langauge);
	});

	const getSelectedCurrencyData = computed(() => {
		return CurrencyData.find((data) => data.value === copyFormData.value.currency);
	});

	const dropdownSelectedCurrencyValue = (value: any) => {
		copyFormData.value.currency = value;
	};

	const getEditTableData = async () => {
		try {
			fullscreenLoading.value = true;

			const res: any = await useApiFetch(`/client-admins/${route.params?.id}`, {
				method: "GET",
			});

			resendEmailLink.value = res.data?.user?.is_default_password_changed;
			Object.keys(formData).forEach((field) => {
				if (field !== null && field !== undefined && field !== "" && field !== "null" && field !== "undefined") {
					formData[field] = res?.data?.[field] || "";
					formData["email"] = res?.data?.user?.email;
					formData["currency"] = res.data?.currency || "GBP";
				}
			});

			if (res?.data?.company) {
				Object.keys(res?.data?.company)?.forEach((field) => {
					formData[field] = res?.data?.company?.[field];
					formData["company_id"] = res?.data?.company?.id;
				});
			}

			if (formData.company_address === formData.address) {
				AddressChecked.value = true;
			}

			companyAddress.value = res.data?.company?.company_address;
			address.value = res.data?.address;
			formData.preferred_langauge =
				formData.preferred_langauge != null && formData.preferred_langauge != "null" && formData.preferred_langauge != undefined
					? formData.preferred_langauge
					: "";
			formData.currency = formData.currency != null && formData.currency != "null" && formData.currency != undefined ? formData.currency : "";
			copyFormData.value = JSON.parse(JSON.stringify(formData));
		} catch {
		} finally {
			setTimeout(() => {
				fullscreenLoading.value = false;
			}, 1000);
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
			formData.address = companyAddress;
			formData.city = address?.city;
			formData.country = address?.country;
			formData.post_code = address?.postal_code;
			formData.state = address?.region;
		}
	};

	const changeAddress = (address: any, id: any) => {
		if (id === "companyaddress") {
			formData.company_address = address;
		} else {
			formData.address = address;
		}
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

	const onSubmit = () => {
		v$.value.$validate();
		if (!v$.value.$error) {
			formData.company_address = formData.company_address.trim();
			formData.company_name = formData.company_name.trim();
			formData = removeEmptyValues(formData);
			if (route.params?.id) {
				submitEditData();
			} else {
				submitAddData();
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
		try {
			loading.value = true;
			const fd = new FormData();
			Object.keys(formData).forEach((field) => {
				fd.append(field, formData?.[field]);
			});

			const res: any = await useApiFetch("/client-admins", {
				method: "POST",
				body: fd,
			});

			useToast("success", res.message);
			navigateTo(localePath("/client-admins"));
		} catch {
		} finally {
			loading.value = false;
		}
	};

	const submitEditData = async () => {
		try {
			loading.value = true;
			formData._method = "PATCH";

			if ((formData.company_logo || formData.company_logo === null) && deleteImg?.value === true) {
				formData.company_logo = "";
			}

			if (formData.company_logo === copyFormData.value.company_logo) {
				formData.company_logo = "";
			}

			const fd = new FormData();
			Object.keys(formData).forEach((field) => {
				fd.append(field, formData?.[field]);
			});

			const res: any = await useApiFetch(`/client-admins/${route.params?.id}`, {
				method: "POST",
				body: fd,
				headers: {
					ContentType: "multipart/form-data",
				},
			});

			useToast("success", res.message);
			navigateTo(localePath("/client-admins"));
		} catch {
		} finally {
			loading.value = false;
		}
	};

	const dropdownSelectedValue = (dropdownValue: any) => {
		formData.country_code = dropdownValue;
	};

	const resendEmailClick = async (email: string) => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch("/resend/email", {
				method: "POST",
				body: { email: email },
			});

			useToast("success", res.message);
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const disabledDate = (date: any) => {
		const d = new Date();
		d.setDate(d.getDate() - 1);
		if (date < d) {
			return true;
		}
	};

	const cancel = () => {
		if (route.params?.id) {
			const pageDetails = JSON.parse(sessionStorage.getItem("pageDetails") || "{}");
			const data = {
				page: pageDetails?.page,
				perPage: pageDetails?.perPage,
				searchValue: pageDetails?.searchValue,
				sortOrder: pageDetails?.sortOrder,
				sortColumn: pageDetails?.sortColumn,
			};

			navigateTo(
				localePath({
					path: "/client-admins",
					query: data,
				})
			);
		} else {
			navigateTo(localePath("/client-admins"));
		}
	};

	const AddressCheckBoxChange = (value: any) => {
		if (value) {
			formData.address = formData.company_address;
			address.value = formData.company_address;
			formData.city = formData.company_city || "";
			formData.state = formData.company_state || "";
			formData.country = formData.company_country;
			formData.post_code = formData.company_post_code;
		} else {
			formData.address = "";
			address.value = "";
			formData.city = "";
			formData.state = "";
			formData.country = "";
			formData.post_code = "";
		}
	};

	const companyAddressChange = () => {
		v$.value.company_address.$touch();
		AddressChecked.value = false;
	};
</script>

<template>
	<el-form v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="flex flex-col relative">
		<div id="super-admin-form">
			<div class="p-6">
				<h3 class="pb-3 text-2xl font-bold">
					{{ $t("formLabels.company_details") }}
					<BaseLabel :tooltip-content="$t('info.company_details')" />
				</h3>
				<div class="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6 lg:space-x-8">
					<div class="border-dashed border rounded-md border-gray-400 p-4">
						<el-form-item type="file" class="uploadImg mb-0" prop="imgUrl">
							<BaseCompanyLogo
								:limit="1"
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
								@change="v$.company_name.$touch"
							/>
							<span v-if="v$.company_name.$error" class="text-xs text-red-500 mt-2">{{ v$.company_name.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.reg_company_number')" :rules="[{ required: true }]" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel
									:label="$t('formLabels.reg_company_number')"
									:tooltip-content="$t('info.reg_company_number')"
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
								maxLength="20"
								:disabled="route.params?.id"
								@change="v$.company_number.$touch"
								@keypress="CharcAndNumber"
							/>
							<span v-if="v$.company_number.$error" class="text-xs text-red-500 mt-2">{{ v$.company_number.$errors[0].$message }}</span>
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
								name="company_address"
								:class="{
									error: v$.company_address.$error,
								}"
								maxLength="100"
								@changed_address="changeAddress"
								@get-address="getAddress"
								@change="companyAddressChange"
							/>
							<span v-if="v$.company_address.$error" class="text-xs text-red-500 mt-2">{{
								v$.company_address.$errors[0].$message
							}}</span>
						</div>

						<el-form-item :label="$t('formLabels.city')" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.city')" :tooltip-content="$t('info.city')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="formData.company_city"
								type="text"
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

						<el-form-item :label="$t('formLabels.state')" class="lg:col-span-2 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.state')" :tooltip-content="$t('info.state')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="formData.company_state"
								type="text"
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
								maxLength="10"
								name="company_post_code"
								:class="{
									error: v$.company_post_code.$error,
								}"
								@change="v$.company_post_code.$touch"
								@keypress="CharcAndNumber"
							/>
							<span v-if="v$.company_post_code.$error" class="text-xs text-red-500 mt-2">{{
								v$.company_post_code.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.country')" :rules="[{ required: true }]" class="lg:col-span-2 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.country')" :tooltip-content="$t('info.country')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="formData.company_country"
								type="text"
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
					</div>
				</div>
				<div class="mt-5 lg:mt-10 xl:mt-14">
					<h3 class="pb-3 text-2xl font-bold">
						{{ $t("formLabels.client-admin-details") }}
						<BaseLabel :tooltip-content="$t('info.client_admin_details')" :isShowLabel="false" />
					</h3>
					<div class="grid md:grid-cols-2 lg:grid-cols-6 gap-5 lg:gap-6">
						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.first_name')" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.first_name')" :tooltip-content="$t('info.first_name')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="formData.first_name"
								name="first_name"
								type="text"
								:class="{
									error: v$.first_name.$error,
								}"
								maxLength="50"
								@change="v$.first_name.$touch"
								@keypress="CharSpecCharWithWhitespace"
							/>
							<span v-if="v$.first_name.$error" class="text-xs text-red-500 mt-2">{{ v$.first_name.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.last_name')" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.last_name')" :tooltip-content="$t('info.last_name')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="formData.last_name"
								name="last_name"
								type="text"
								:class="{
									error: v$.last_name.$error,
								}"
								maxLength="50"
								@change="v$.last_name.$touch"
								@keypress="CharSpecCharWithWhitespace"
							/>
							<span v-if="v$.last_name.$error" class="text-xs text-red-500 mt-2">{{ v$.last_name.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.job_title')" :rules="[{ required: true }]" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.job_title')" :tooltip-content="$t('info.job_title')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="formData.job_title"
								name="job_title"
								type="text"
								:class="{
									error: v$.job_title.$error,
								}"
								maxLength="80"
								@change="v$.job_title.$touch"
								@keypress="CharcAndNumber"
							/>
							<span v-if="v$.job_title.$error" class="text-xs text-red-500 mt-2">{{ v$.job_title.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.department')" :rules="[{ required: true }]" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.department')" :tooltip-content="$t('info.department')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="formData.department"
								name="department"
								type="text"
								:class="{
									error: v$.department.$error,
								}"
								maxLength="80"
								@change="v$.department.$touch"
								@keypress="CharcterWithWhitespace"
							/>
							<span v-if="v$.department.$error" class="text-xs text-red-500 mt-2">{{ v$.department.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.email')" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.email')" :tooltip-content="$t('info.company_email')" />
							</template>
							<div class="relative w-full">
								<el-input
									v-model.trim="formData.email"
									name="email"
									type="text"
									:class="{
										error: v$.email.$error,
									}"
									:disabled="route.params?.id"
									@change="v$.email.$touch"
								/>
							</div>
							<a
								v-if="resendEmailLink === 0"
								class="cursor-pointer font-bold text-cyan absolute top-2 right-3"
								@click="resendEmailClick(formData.email)"
								>{{ $t("formLabels.resend_email") }}</a
							>

							<span v-if="v$.email.$error" class="text-xs text-red-500 mt-2">{{ v$.email.$errors[0].$message }}</span>
						</el-form-item>

						<div class="flex items-start lg:col-span-3 label-upper-dropdown">
							<div class="w-24 flex-initial mt-6">
								<BaseCountryDropdown
									v-model="formData.country_code"
									:dropdown-option="getCountry"
									:get-selected-country="getSelectedCountry"
									@selected-value="dropdownSelectedValue"
								/>
							</div>
							<el-form-item :rules="[{ required: true }]" class="ml-4 flex-1 mb-0 mt-6" :label="$t('formLabels.contact_number')">
								<template #label>
									<BaseLabel :label="$t('formLabels.contact_number')" :tooltip-content="$t('info.contact_number')" />
								</template>
								<el-input
									v-model.trim="formData.mobile_number"
									class="input-with-select"
									type="text"
									name="mobile_number"
									:class="{
										error: v$.mobile_number.$error,
									}"
									maxLength="10"
									@change="v$.mobile_number.$touch"
									@keypress="NumbersOnly(e)"
								>
								</el-input>

								<span v-if="v$.mobile_number.$error" class="text-xs text-red-500 mt-2">{{
									v$.mobile_number.$errors[0].$message
								}}</span>
							</el-form-item>
						</div>

						<div class="lg:col-span-3">
							<div class="flex items-center">
								<span class="text-dark font-bold flex items-center">
									<span>{{ $t("formLabels.address") }}</span>
									<span class="text-red-400">*</span>
								</span>
								<BaseLabel :tooltip-content="$t('info.address')" :isShowLabel="false" />
							</div>
							<BaseAddress
								id="address"
								v-model="formData.address"
								:address="address"
								name="address"
								:class="{
									error: v$.address.$error,
								}"
								maxLength="100"
								@changed_address="changeAddress"
								@get-address="getAddress"
								@change="v$.address.$touch"
							/>
							<div>
								<el-checkbox
									v-if="formData.company_address"
									class="mt-2 text-base"
									v-model="AddressChecked"
									@change="AddressCheckBoxChange"
									>{{ $t("formLabels.same_address_as_above") }}</el-checkbox
								>
								<span v-if="v$.address.$error" class="text-xs text-red-500 mt-2 w-full block">{{
									v$.address.$errors[0].$message
								}}</span>
							</div>
						</div>

						<el-form-item :label="$t('formLabels.city')" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.city')" :tooltip-content="$t('info.city')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="formData.city"
								type="text"
								name="city"
								:class="{
									error: v$.city.$error,
								}"
								maxLength="80"
								@change="v$.city.$touch"
								@keypress="CharcterWithWhitespace"
							/>
							<span v-if="v$.city.$error" class="text-xs text-red-500 mt-2">{{ v$.city.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.state')" class="lg:col-span-2 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.state')" :tooltip-content="$t('info.state')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="formData.state"
								type="text"
								name="state"
								:class="{
									error: v$.state.$error,
								}"
								maxLength="80"
								@change="v$.state.$touch"
								@keypress="CharcterWithWhitespace"
							/>
							<span v-if="v$.state.$error" class="text-xs text-red-500 mt-2">{{ v$.state.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.post_code')" :rules="[{ required: true }]" class="lg:col-span-2 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.post_code')" :tooltip-content="$t('info.post_code')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="formData.post_code"
								type="text"
								name="post_code"
								:class="{
									error: v$.post_code.$error,
								}"
								maxLength="10"
								@change="v$.post_code.$touch"
								@keypress="CharcAndNumber"
							/>
							<span v-if="v$.post_code.$error" class="text-xs text-red-500 mt-2">{{ v$.post_code.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.country')" :rules="[{ required: true }]" class="lg:col-span-2 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.country')" :tooltip-content="$t('info.country')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="formData.country"
								type="text"
								name="country"
								:class="{
									error: v$.country.$error,
								}"
								maxLength="80"
								@change="v$.country.$touch"
								@keypress="CharcterWithWhitespace"
							/>
							<span v-if="v$.country.$error" class="text-xs text-red-500 mt-2">{{ v$.country.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.preferred_language')" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.preferred_language')" :tooltip-content="$t('info.preferred_language')" />
							</template>
							<BaseSelectDropdown
								v-model="formData.preferred_langauge"
								:dropdown-option="languageData"
								:get-selected-country="getSelectedLanguage"
								:number-only="false"
								:disabled="disabled"
								name="preferred_langauge"
								:class="{ error: v$.preferred_langauge.$error }"
								@selected-value="dropdownSelectedPrefLanguage"
								@change="v$.preferred_langauge.$touch"
							/>
							<span v-if="v$.preferred_langauge.$error" class="text-xs text-red-500 mt-2">{{
								v$.preferred_langauge.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.currency')" class="lg:col-span-3 mb-0">
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
							/>
							<span v-if="v$.currency.$error" class="text-xs text-red-500 mt-2">{{ v$.currency.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.date')" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.date')" :tooltip-content="$t('info.date')" />
							</template>
							<el-date-picker
								v-model.trim="formData.account_activation_date"
								type="date"
								format="DD/MM/YYYY"
								value-format="YYYY-MM-DD"
								placeholder="DD/MM/YYYY"
								name="account_activation_date"
								:class="{
									error: v$.account_activation_date.$error,
								}"
								:disabled-date="disabledDate"
								@change="v$.account_activation_date.$touch"
							/>
							<span v-if="v$.account_activation_date.$error" class="text-xs text-red-500 mt-2 w-full">{{
								v$.account_activation_date.$errors[0].$message
							}}</span>
						</el-form-item>

						<div class="lg:col-span-3 mb-0">
							<div class="flex items-center mb-2">
								<span class="text-dark font-bold block">{{ $t("formLabels.status") }}</span>
								<BaseLabel :tooltip-content="$t('info.status')" />
							</div>
							<el-radio-group v-model="formData.account_status" size="large">
								<el-radio-button :label="1">{{ $t("formLabels.active") }}</el-radio-button>
								<el-radio-button :label="0">{{ $t("formLabels.inactive") }}</el-radio-button>
							</el-radio-group>
						</div>
					</div>
					<div class="pt-4 text-right">
						<novok-button class="btn-dark my-1" @click.prevent="cancel"
							><span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span
							><i class="fa-solid fa-xmark sm:hidden"></i
						></novok-button>

						<novok-button
							v-if="!route.params?.id"
							class="my-1"
							type="info"
							:loading="loading"
							:disabled="loading"
							@click.prevent="onSubmit"
							>{{ $t("buttons.add_client_admin") }}
						</novok-button>

						<novok-button v-else type="info" class="my-1" :loading="loading" :disabled="loading" @click.prevent="onSubmit"
							>{{ $t("buttons.save_changes") }}
						</novok-button>
					</div>
				</div>
			</div>
		</div>
	</el-form>
</template>
<style>
	/* @import "~/assets/css/main.css"; */
</style>
