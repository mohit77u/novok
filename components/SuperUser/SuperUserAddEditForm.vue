<!-- eslint-disable vue/no-template-shadow -->
<script setup lang="ts">
	import { required, email, minLength, maxLength, helpers } from "@vuelidate/validators";
	import { ref } from "vue";
	import { useVuelidate } from "@vuelidate/core";
	import moment from "moment";

	import { Delete } from "@element-plus/icons-vue";
	import type { UploadProps, UploadInstance, UploadRawFile } from "element-plus";
	import { genFileId } from "element-plus";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import { languageData, CurrencyData } from "~/helper/data";
	import { removeEmptyValues } from "~/helper/common";

	definePageMeta({
		middleware: ["auth"],
	});

	let formData = reactive<any>({
		company_logo: "",
		company_name: "",
		company_number: "",
		company_address: "",
		company_country: "",
		company_state: "",
		company_city: "",
		company_post_code: "",
		company_hq_address: "",
		company_hq_country: "",
		company_hq_state: "",
		company_hq_city: "",
		company_hq_post_code: "",
		company_website: "",
		additional_information: "",
		first_name: "",
		last_name: "",
		job_title: "",
		department: "",
		email: "",
		address: "",
		country_code: "+44",
		mobile_number: "",
		city: "",
		state: "",
		country: "",
		post_code: "",
		preferred_langauge: "English",
		currency: "GBP",
		account_status: 1,
		account_activation_date: "",
		company_id: "",
	});
	const copyFormData = ref<any>({});
	const loading = ref(false);
	const route = useRoute();
	const fullscreenLoading = ref(false);
	const dialogVisible = ref(false);
	const formHeight = ref<any>(null);
	const localePath = useLocalePath();
	const { t } = useI18n();
	const upload = ref<UploadInstance>();
	const file = ref<any>(null);
	const dialogImageUrl = ref("");
	const imageUrl = ref("");
	const fileList = ref<any>([]);
	const deleteImg = ref(false);
	const address = ref<any>("");
	const companyAddress = ref("");
	const companyHqAddress = ref("");
	const disabledDeleteIcon = ref("false");
	const config = useRuntimeConfig();
	const resendEmailLink = ref(1);
	const { getSelectedCountry, getCountry } = useGetSelectedCountry();
	const url = ref<any>("true");
	const AddressChecked = ref(false);

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
			company_city: {
				maxLength: helpers.withMessage(t("formValidations.city"), maxLength(80)),
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
			company_hq_address: {
				required: helpers.withMessage(t("formValidations.company_hq_address"), required),
				maxLength: helpers.withMessage(t("formValidations.company_hq_address_max"), maxLength(100)),
			},
			company_hq_country: {
				required: helpers.withMessage(t("formValidations.country"), required),
				maxLength: helpers.withMessage(t("formValidations.country_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			company_hq_state: {
				maxLength: helpers.withMessage(t("formValidations.state_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			company_hq_city: {
				maxLength: helpers.withMessage(t("formValidations.city"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			company_hq_post_code: {
				required: helpers.withMessage(t("formValidations.post_code"), required),
				maxLength: helpers.withMessage(t("formValidations.post_code_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcAndNumWithSpace,
					$message: t("copyPasteValidations.charNum"),
				},
			},
			company_website: {
				url: helpers.withMessage(t("formValidations.company_website"), helpers.regex(/^(ftp:\/\/|http:\/\/|https:\/\/|www\.)[^ "]+$/)),
			},
			additional_information: {
				maxLength: helpers.withMessage(t("formValidations.company_additional_information_max"), maxLength(50)),
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

	const v$: any = useVuelidate(rules, copyFormData);

	watch(
		() => formData,
		(currData) => {
			if (imageUrl.value) {
				disabledDeleteIcon.value = "false";
				fileList.value = [
					{
						name: "img.jpeg",
						url: imageUrl,
					},
				];
			} else if (currData?.company_logo) {
				if (currData?.is_default_company_logo === "true") {
					disabledDeleteIcon.value = "true";
				} else {
					disabledDeleteIcon.value = "false";
				}
				fileList.value = [
					{
						name: "img.jpeg",
						url: `${formData?.company_logo} `,
					},
				];
			} else {
				disabledDeleteIcon.value = "true";
				fileList.value = [
					{
						name: "img.jpeg",
						url: config.public.default_user_link,
					},
				];
			}
		},
		{ deep: true }
	);

	onMounted(() => {
		formHeight.value = GetOffset("super-admin-form", 0);

		formData.account_activation_date = moment().format("YYYY-MM-DD");
		formData.id = route?.params?.id;
		copyFormData.value = JSON.parse(JSON.stringify(formData));
		if (route.params?.id) {
			getEditTableData();
		}
		url.value = sessionStorage.getItem("url");
	});

	const getAddress = (address: any, companyAddress: any, id: any) => {
		if (id === "companyaddress") {
			copyFormData.value.company_address = companyAddress;
			copyFormData.value.company_city = address?.city;
			copyFormData.value.company_country = address?.country;
			copyFormData.value.company_post_code = address?.postal_code;
			copyFormData.value.company_state = address?.region;
		} else if (id === "companyhqaddress") {
			copyFormData.value.company_hq_address = companyAddress;
			copyFormData.value.company_hq_city = address?.city;
			copyFormData.value.company_hq_country = address?.country;
			copyFormData.value.company_hq_post_code = address?.postal_code;
			copyFormData.value.company_hq_state = address?.region;
		} else {
			copyFormData.value.address = companyAddress;
			copyFormData.value.city = address?.city;
			copyFormData.value.country = address?.country;
			copyFormData.value.post_code = address?.postal_code;
			copyFormData.value.state = address?.region;
		}
	};

	const changeAddress = (address: any, id: any) => {
		if (id === "companyaddress") {
			copyFormData.value.company_address = address;
		} else if (id === "companyhqaddress") {
			copyFormData.value.company_hq_address = address;
		} else {
			copyFormData.value.address = address;
		}
	};

	const getEditTableData = () => {
		fullscreenLoading.value = true;

		useGet(`/super-users/${route.params?.id}`)
			.then((res: any) => {
				resendEmailLink.value = res.data?.user?.is_default_password_changed;
				Object.keys(formData).forEach((field) => {
					formData[field] = res?.data?.[field];
				});
				Object.keys(res?.data?.company).forEach((field) => {
					formData[field] = res?.data?.company?.[field] || "";
				});

				if (formData.company_address === formData.address) {
					AddressChecked.value = true;
				}

				formData.company_id = res.data?.company?.id;
				formData.email = res.data?.user?.email;
				address.value = res.data?.address;
				companyAddress.value = res.data?.company?.company_address;
				companyHqAddress.value = res.data?.company?.company_hq_address;
				disabledDeleteIcon.value = res?.data?.company?.is_default_company_logo;

				// isDeleteShow.value = res.data?.sub_users_count;
				copyFormData.value = JSON.parse(JSON.stringify(formData));
			})
			.catch((err) => {
				if (err.statusCode === 401) {
					sidebarItemClear();
				} else if (err.statusCode === 404) {
					navigateTo(localePath("/404"));
				} else if (err.statusCode === 500) {
					navigateTo(localePath("/500"));
				} else {
					useToast("error", err.data?.message);
				}
			})
			.finally(() => {
				setTimeout(() => {
					fullscreenLoading.value = false;
				}, 1000);
			});
	};

	const onSubmit = () => {
		v$.value.$validate();
		formData = removeEmptyValues(formData);
		if (!v$.value.$error) {
			// formData.company_address = formData.company_address.trim();
			// formData.company_name = formData.company_name.trim();
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

	const submitAddData = () => {
		loading.value = true;
		const fd = new FormData();
		Object.keys(copyFormData.value).forEach((field) => {
			fd.append(field, copyFormData.value?.[field]);
		});

		usePost("/super-users", fd)
			.then((res: any) => {
				if (res.status_code === 201) {
					useToast("success", res.message);
					navigateTo(localePath("/super-admin"));
				}
			})
			.catch((err) => {
				if (err.statusCode === 401) {
					sidebarItemClear();
				} else if (err.statusCode === 404) {
					navigateTo(localePath("/404"));
				} else if (err.statusCode === 500) {
					navigateTo(localePath("/500"));
				} else if (err.data?.errors) {
					useToast("error", getErrors(err.data?.errors));
				} else {
					useToast("error", err.data?.message);
				}
			})
			.finally(() => {
				loading.value = false;
			});
	};

	const submitEditData = () => {
		fullscreenLoading.value = true;

		if ((copyFormData.value.company_logo || copyFormData.value.company_logo === null) && deleteImg?.value === true) {
			copyFormData.value.company_logo = "";
		}

		if (formData.company_logo === copyFormData.value.company_logo) {
			copyFormData.value.company_logo = "";
		}

		copyFormData.value._method = "PATCH";

		const fd = new FormData();
		Object.keys(copyFormData.value).forEach((field) => {
			fd.append(field, copyFormData.value?.[field]);
		});

		usePost(`/super-users/${route.params?.id}`, fd)
			.then((res: any) => {
				if (res.status_code === 200) {
					useToast("success", res.message);
					navigateTo(localePath("/super-admin"));
				}
			})
			.catch((err) => {
				if (err.statusCode === 401) {
					sidebarItemClear();
				} else if (err.statusCode === 404) {
					navigateTo(localePath("/404"));
				} else if (err.statusCode === 500) {
					navigateTo(localePath("/500"));
				} else if (err.data?.errors) {
					useToast("error", getErrors(err.data?.errors));
				} else {
					useToast("error", err.data?.message);
				}
			})
			.finally(() => {
				fullscreenLoading.value = false;
			});
	};

	const resendEmailClick = (email: string) => {
		fullscreenLoading.value = true;
		usePost("/resend/email", { email: email })
			.then((res: any) => {
				if (res.status_code === 200) {
					useToast("success", res.message);
				}
			})
			.catch((err) => {
				if (err.status_code === 401) {
					sidebarItemClear();
				}
				if (err.data?.errors) {
					useToast("error", getErrors(err.data?.errors));
				} else {
					useToast("error", err.data?.message);
				}
			})
			.finally(() => {
				fullscreenLoading.value = false;
			});
	};

	const dropdownSelectedValue = (dropdownValue: any) => {
		copyFormData.value.country_code = dropdownValue;
	};

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
					path: "/super-admin",
					query: data,
				})
			);
		} else {
			navigateTo(localePath("/super-admin"));
		}
	};

	const handleExceed: UploadProps["onExceed"] = (files) => {
		upload.value!.clearFiles();
		const file = files[0] as UploadRawFile;
		file.uid = genFileId();
		upload.value!.handleStart(file);
	};

	const handleRemove = () => {
		fileList.value = [];
		imageUrl.value = "";
		copyFormData.value.company_logo = "";
		if (route.params?.id) {
			copyFormData.value.delete_company_logo = 1;
			deleteImg.value = true;
		}
	};

	const onChange: UploadProps["onChange"] = (uploadFile: any) => {
		file.value = uploadFile.file;
		copyFormData.value.company_logo = file.value;
		deleteImg.value = false;
		disabledDeleteIcon.value = "false";
	};

	const AddressCheckBoxChange = (value: any) => {
		if (value) {
			copyFormData.value.address = copyFormData.value.company_address;
			address.value = copyFormData.value.company_address;
			copyFormData.value.city = copyFormData.value.company_city;
			copyFormData.value.state = copyFormData.value.company_state;
			copyFormData.value.country = copyFormData.value.company_country;
			copyFormData.value.post_code = copyFormData.value.company_post_code;
		} else {
			copyFormData.value.address = "";
			address.value = "";
			copyFormData.value.city = "";
			copyFormData.value.state = "";
			copyFormData.value.country = "";
			copyFormData.value.post_code = "";
		}
	};

	const companyAddressChange = () => {
		v$.value.company_address.$touch();
		AddressChecked.value = false;
	};
</script>

<template>
	<el-form v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="p-6 relative">
		<div id="super-admin-form">
			<div class="overflow-auto bg-[#fff]">
				<h3 class="pb-3 text-2xl font-bold">
					{{ $t("formLabels.company_details") }}
					<BaseLabel :tooltip-content="$t('info.company_details')" />
				</h3>
				<div class="py-6">
					<div class="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6 lg:space-x-8">
						<div class="border-dashed border rounded-md border-gray-400 p-4 relative">
							<BaseLabel :tooltip-content="$t('info.reg_company_logo')" class="absolute right-0 top-0" />
							<el-form-item type="file" class="uploadImg mb-0" prop="imgUrl">
								<BaseCompanyLogo
									:limit="1"
									:disabled="false"
									:form-data="copyFormData"
									@upload-file="onChange"
									@handle-remove="handleRemove"
									:aspect-ratio="16 / 9"
								/>
							</el-form-item>
						</div>

						<div class="grid md:grid-cols-2 lg:grid-cols-6 gap-5 lg:gap-6 flex-grow w-full">
							<el-form-item :label="$t('formLabels.reg_company_name')" :rules="[{ required: true }]" class="lg:col-span-3 mb-0">
								<template #label>
									<BaseLabel
										:label="$t('formLabels.reg_company_name')"
										:tooltip-content="$t('info.reg_company_name')"
										:isShowLabel="false"
									/>
								</template>

								<el-input
									v-model="copyFormData.company_name"
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
									v-model.trim="copyFormData.company_number"
									name="company_number"
									type="text"
									:class="{
										error: v$.company_number.$error,
									}"
									@change="v$.company_number.$touch"
									@keypress="CharcAndNumber"
									:disabled="route.params?.id"
								/>
								<span v-if="v$.company_number.$error" class="text-xs text-red-500 mt-2">{{
									v$.company_number.$errors[0].$message
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
									v-model="copyFormData.company_city"
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
									v-model="copyFormData.company_state"
									type="text"
									name="company_state"
									:class="{
										error: v$.company_state.$error,
									}"
									maxLength="80"
									@change="v$.company_state.$touch"
									@keypress="CharcterWithWhitespace"
								/>
								<span v-if="v$.company_state.$error" class="text-xs text-red-500 mt-2">{{
									v$.company_state.$errors[0].$message
								}}</span>
							</el-form-item>

							<el-form-item :label="$t('formLabels.post_code')" :rules="[{ required: true }]" class="lg:col-span-2 mb-0">
								<template #label>
									<BaseLabel :label="$t('formLabels.post_code')" :tooltip-content="$t('info.post_code')" :isShowLabel="false" />
								</template>
								<el-input
									v-model="copyFormData.company_post_code"
									type="text"
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

							<el-form-item :label="$t('formLabels.country')" :rules="[{ required: true }]" class="lg:col-span-2 mb-0">
								<template #label>
									<BaseLabel :label="$t('formLabels.country')" :tooltip-content="$t('info.country')" :isShowLabel="false" />
								</template>
								<el-input
									v-model="copyFormData.company_country"
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
				</div>
			</div>

			<div class="overflow-auto rounded-lg bg-[#fff] my-5">
				<h3 class="pb-3 text-2xl font-bold">
					{{ $t("formLabels.company_headquarter_details") }}
					<BaseLabel :tooltip-content="$t('info.company_headquarter_details')" />
				</h3>
				<div class="py-6">
					<div class="grid md:grid-cols-2 lg:grid-cols-6 gap-5 lg:gap-6">
						<div class="lg:col-span-3">
							<div class="flex items-center">
								<span class="text-dark font-bold flex items-center">
									<span>{{ $t("formLabels.company_hq_address") }}</span>
									<span class="text-red-400">*</span>
								</span>
								<BaseLabel :tooltip-content="$t('info.company_hq_address')" :isShowLabel="false" />
							</div>
							<BaseAddress
								id="companyhqaddress"
								v-model="formData.company_hq_address"
								:address="companyHqAddress"
								name="company_hq_address"
								:class="{
									error: v$.company_hq_address.$error,
								}"
								maxLength="100"
								@changed_address="changeAddress"
								@get-address="getAddress"
								@change="v$.company_hq_address.$touch"
							/>
							<span v-if="v$.company_hq_address.$error" class="text-xs text-red-500 mt-2">{{
								v$.company_hq_address.$errors[0].$message
							}}</span>
						</div>

						<el-form-item :label="$t('formLabels.city')" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.city')" :tooltip-content="$t('info.city')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="copyFormData.company_hq_city"
								type="text"
								name="company_hq_city"
								:class="{
									error: v$.company_hq_city.$error,
								}"
								maxLength="80"
								@change="v$.company_hq_city.$touch"
								@keypress="CharcterWithWhitespace"
							/>
							<span v-if="v$.company_hq_city.$error" class="text-xs text-red-500 mt-2">{{
								v$.company_hq_city.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.state')" class="lg:col-span-2 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.state')" :tooltip-content="$t('info.state')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="copyFormData.company_hq_state"
								type="text"
								name="company_hq_state"
								:class="{
									error: v$.company_hq_state.$error,
								}"
								maxLength="80"
								@change="v$.company_hq_state.$touch"
								@keypress="CharcterWithWhitespace"
							/>
							<span v-if="v$.company_hq_state.$error" class="text-xs text-red-500 mt-2">{{
								v$.company_hq_state.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.post_code')" :rules="[{ required: true }]" class="lg:col-span-2 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.post_code')" :tooltip-content="$t('info.post_code')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="copyFormData.company_hq_post_code"
								type="text"
								name="company_hq_post_code"
								:class="{
									error: v$.company_hq_post_code.$error,
								}"
								maxLength="10"
								@change="v$.company_hq_post_code.$touch"
								@keypress="CharcAndNumber"
							/>
							<span v-if="v$.company_hq_post_code.$error" class="text-xs text-red-500 mt-2">{{
								v$.company_hq_post_code.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.country')" :rules="[{ required: true }]" class="lg:col-span-2 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.country')" :tooltip-content="$t('info.country')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="copyFormData.company_hq_country"
								type="text"
								name="company_country"
								:class="{
									error: v$.company_hq_country.$error,
								}"
								maxLength="80"
								@change="v$.company_hq_country.$touch"
								@keypress="CharcterWithWhitespace"
							/>
							<span v-if="v$.company_hq_country.$error" class="text-xs text-red-500 mt-2">{{
								v$.company_hq_country.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.company_website')" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel
									:label="$t('formLabels.company_website')"
									:tooltip-content="$t('info.company_website')"
									:isShowLabel="false"
								/>
							</template>
							<el-input
								v-model="copyFormData.company_website"
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

						<el-form-item :label="$t('formLabels.company_addtional_info')" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel
									:label="$t('formLabels.company_addtional_info')"
									:tooltip-content="$t('info.company_addtional_info')"
									:isShowLabel="false"
								/>
							</template>
							<el-input
								v-model="copyFormData.additional_information"
								type="text"
								name="additional_information"
								:class="{
									error: v$.additional_information.$error,
								}"
								@change="v$.additional_information.$touch"
							/>
							<span v-if="v$.additional_information.$error" class="text-xs text-red-500 mt-2">{{
								v$.additional_information.$errors[0].$message
							}}</span>
						</el-form-item>
					</div>
				</div>
			</div>

			<div class="overflow-auto rounded-lg bg-[#fff]">
				<h3 class="pb-3 text-2xl font-bold">
					{{ $t("formLabels.super_user_details") }}
					<BaseLabel :tooltip-content="$t('info.super_user_details')" :isShowLabel="false" />
				</h3>
				<div class="py-6">
					<div class="grid md:grid-cols-2 lg:grid-cols-6 gap-5 lg:gap-6">
						<el-form-item :label="$t('formLabels.first_name')" :rules="[{ required: true }]" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.first_name')" :tooltip-content="$t('info.first_name')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="copyFormData.first_name"
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

						<el-form-item :label="$t('formLabels.last_name')" :rules="[{ required: true }]" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.last_name')" :tooltip-content="$t('info.last_name')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="copyFormData.last_name"
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
								v-model="copyFormData.job_title"
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
								v-model="copyFormData.department"
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

						<el-form-item :label="$t('formLabels.email')" :rules="[{ required: true }]" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.email')" :tooltip-content="$t('info.company_email')" />
							</template>
							<div class="relative w-full">
								<el-input
									v-model.trim="copyFormData.email"
									name="email"
									type="text"
									:class="{
										error: v$.email.$error,
									}"
									@change="v$.email.$touch"
									:disabled="route.params?.id"
								/>
								<a
									v-if="resendEmailLink === 0"
									class="cursor-pointer font-bold text-cyan absolute top-2 right-3"
									@click="resendEmailClick(copyFormData.email)"
									>{{ $t("formLabels.resend_email") }}</a
								>
							</div>

							<span v-if="v$.email.$error" class="text-xs text-red-500 mt-2">{{ v$.email.$errors[0].$message }}</span>
						</el-form-item>

						<div class="flex items-start lg:col-span-3 label-upper-dropdown">
							<div class="w-24 flex-initial mt-6">
								<BaseCountryDropdown
									v-model="copyFormData.country_code"
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
									v-model.trim="copyFormData.mobile_number"
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
									v-if="copyFormData.company_address"
									class="mt-2 text-base"
									v-model="AddressChecked"
									@change="AddressCheckBoxChange"
									>{{ $t("formLabels.same_address_as_above") }}</el-checkbox
								>
								<span v-if="v$.address.$error" class="text-xs text-red-500 mt-2 w-full block">{{
									v$.address.$errors[0].$message
								}}</span>
							</div>

							<!-- <span v-if="v$.address.$error" class="text-xs text-red-500 mt-2">{{ v$.address.$errors[0].$message }}</span> -->
						</div>

						<el-form-item :label="$t('formLabels.city')" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.city')" :tooltip-content="$t('info.city')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="copyFormData.city"
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
								v-model="copyFormData.state"
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
								v-model="copyFormData.post_code"
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
								v-model="copyFormData.country"
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
								v-model="copyFormData.preferred_langauge"
								:dropdown-option="languageData"
								:get-selected-country="getSelectedLanguage"
								:number-only="false"
								name="preferred_langauge"
								:class="{
									error: v$.preferred_langauge.$error,
								}"
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
								v-model="copyFormData.currency"
								name="currency"
								:dropdown-option="CurrencyData"
								:get-selected-country="getSelectedCurrencyData"
								:number-only="false"
								:class="{
									error: v$.currency.$error,
								}"
								@selected-value="dropdownSelectedCurrencyValue"
								@change="v$.currency.$touch"
							/>
							<span v-if="v$.currency.$error" class="text-xs text-red-500 mt-2">{{ v$.currency.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.date')" :rules="[{ required: true }]" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.date')" :tooltip-content="$t('info.date')" />
							</template>
							<el-date-picker
								v-model.trim="copyFormData.account_activation_date"
								type="date"
								placeholder="DD/MM/YYYY"
								format="DD/MM/YYYY"
								value-format="YYYY-MM-DD"
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

						<div class="mb-3 lg:col-span-3">
							<div class="flex items-center mb-2">
								<span class="text-dark font-bold block">{{ $t("formLabels.status") }}</span>
								<BaseLabel :tooltip-content="$t('info.status')" />
							</div>
							<el-radio-group v-model="copyFormData.account_status" size="large">
								<el-radio-button :label="1">{{ $t("formLabels.active") }}</el-radio-button>
								<el-radio-button :label="0">{{ $t("formLabels.inactive") }}</el-radio-button>
							</el-radio-group>
						</div>
					</div>
				</div>
			</div>

			<div class="pt-6 text-right">
				<novok-button class="btn-dark my-1" @click.prevent="cancel"
					><span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span
					><i class="fa-solid fa-xmark sm:hidden"></i
				></novok-button>

				<novok-button v-if="!route.params?.id" class="my-1" type="info" :loading="loading" :disabled="loading" @click.prevent="onSubmit"
					>{{ $t("buttons.add_super_user") }}
				</novok-button>

				<novok-button v-else class="my-1" type="info" :loading="loading" :disabled="loading" @click.prevent="onSubmit"
					>{{ $t("buttons.save_changes") }}
				</novok-button>
			</div>
		</div>
	</el-form>
</template>

<style>
	/* @import "~/assets/css/main.css"; */
	.google-autocomplete-input {
		width: 100%;
	}
</style>
