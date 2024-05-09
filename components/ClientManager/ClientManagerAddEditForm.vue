<script setup lang="ts">
	import { required, email, minLength, maxLength, helpers } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import moment from "moment";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import { languageData, CurrencyData } from "~/helper/data";

	definePageMeta({
		middleware: ["auth"],
	});

	const formData = reactive<any>({
		employee_id: "",
		first_name: "",
		last_name: "",
		job_title: "",
		department: "",
		email: "",
		country_code: "+44",
		mobile_number: "",
		address: "",
		country: "",
		state: "",
		city: "",
		post_code: "",
		all_clients: 1,
		client_ids: [],
		preferred_langauge: "English",
		currency: "GBP",
		account_status: 1,
		account_activation_date: "",
	});
	const copyFormData = ref<any>({});
	const loading = ref(false);
	const route = useRoute();
	const fullscreenLoading = ref(false);
	const formHeight = ref<any>(null);
	const clientDropdownData = ref<any>([]);
	const localePath = useLocalePath();
	const { t } = useI18n();
	const selectedClientName = ref<any>([]);
	const address = ref("");
	const resendEmailLink = ref(1);
	const searchValue = ref("");
	const { getSelectedCountry, getCountry } = useGetSelectedCountry();

	const rules = computed(() => {
		return {
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
			employee_id: {
				// required: helpers.withMessage(t("formValidations.employee_id"), required),
				maxLength: helpers.withMessage(t("formValidations.employee_id_max"), maxLength(15)),
				name_validation: {
					$validator: PasteCharcAndNum,
					$message: t("copyPasteValidations.charNum"),
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
				required: helpers.withMessage(t("formValidations.company_email_id"), required),
				email: helpers.withMessage(t("formValidations.company_email_id_valid"), email),
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

	const v$ = useVuelidate(rules, formData);

	onMounted(async () => {
		await getClientApiCall(searchValue.value);
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

			const res: any = await useApiFetch(`/client-account-managers/${route.params?.id}`, {
				method: "GET",
			});

			resendEmailLink.value = res.data?.user?.is_default_password_changed;

			Object.keys(formData).forEach((field) => {
				if (res?.data?.[field] !== undefined && res?.data?.[field] !== null) {
					formData[field] = res?.data?.[field];
					formData["email"] = res?.data?.user?.email;
				}
			});

			address.value = res.data?.address;
			res.data?.clients?.map((item: any) => {
				return formData.client_ids.push(item.id);
			});

			selectedClientName.value = res.data?.clients.map((name: any) => {
				return {
					label: name.full_name,
					value: name.id,
				};
			});
			copyFormData.value = JSON.parse(JSON.stringify(formData));
		} catch {
		} finally {
			setTimeout(() => {
				fullscreenLoading.value = false;
			}, 1000);
		}
	};

	const onSubmit = () => {
		v$.value.$validate();
		if (!v$.value.$error) {
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

			const res: any = await useApiFetch("/client-account-managers", {
				method: "POST",
				body: formData,
			});

			useToast("success", res.message);
			navigateTo(localePath("/client-managers"));
		} catch {
		} finally {
			loading.value = false;
		}
	};

	const submitEditData = async () => {
		try {
			loading.value = true;
			if (formData.all_clients === 1) {
				formData.client_ids = [];
			}

			const res: any = await useApiFetch(`/client-account-managers/${route.params?.id}`, {
				method: "PATCH",
				body: formData,
			});

			useToast("success", res.message);
			navigateTo(localePath("/client-managers"));
		} catch {
		} finally {
			loading.value = false;
		}
	};

	const getClientApiCall = async (value: any) => {
		searchValue.value = value;
		try {
			const res: any = await useApiFetch(`/client-admins?perPage=30&searchValue=${value}`, {
				method: "GET",
			});

			clientDropdownData.value = res.data?.data;
		} catch {}
	};

	const getClients = computed(() => {
		const data = clientDropdownData.value.map((item: any) => {
			return {
				label: item.full_name,
				value: item.id,
			};
		});

		return data;
	});

	const getSelectedClient = computed(() => {
		return selectedClientName.value;
	});

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

	const dropdownSelectedValue = (dropdownValue: any) => {
		formData.country_code = dropdownValue;
	};
	const dropdownSelectedValueClient = (value: any) => {
		formData.client_ids = value;
	};

	const disabledDate = (date: any) => {
		const d = new Date();
		d.setDate(d.getDate() - 1);
		if (date < d) {
			return true;
		}
	};

	const getAddress = (address: any, Address: any) => {
		formData.address = Address;
		formData.city = address?.city;
		formData.country = address?.country;
		formData.post_code = address?.postal_code;
		formData.state = address?.region;
	};

	const changeAddress = (address: any) => {
		formData.address = address;
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
					path: "/client-managers",
					query: data,
				})
			);
		} else {
			navigateTo(localePath("/client-managers"));
		}
	};
</script>

<template>
	<el-form v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="flex flex-col relative">
		<div id="super-admin-form">
			<div class="bg-[#fff]">
				<div class="p-6">
					<div class="grid md:grid-cols-12 gap-5 lg:gap-6">
						<el-form-item :label="$t('formLabels.employee_id')" class="md:col-span-6 lg:col-span-4 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.employee_id')" :tooltip-content="$t('info.employee_id')" />
							</template>
							<el-input
								v-model.trim="formData.employee_id"
								name="employee_id"
								type="text"
								:class="{
									error: v$.employee_id.$error,
								}"
								maxLength="15"
								@change="v$.employee_id.$touch"
								@keypress="CharcAndNumber"
							/>
							<span v-if="v$.employee_id.$error" class="text-xs text-red-500 mt-2">{{ v$.employee_id.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.first_name')" class="md:col-span-6 lg:col-span-4 mb-0">
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

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.last_name')" class="md:col-span-6 lg:col-span-4 mb-0">
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

						<el-form-item :label="$t('formLabels.job_title')" :rules="[{ required: true }]" class="md:col-span-6 mb-0">
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

						<el-form-item :label="$t('formLabels.department')" :rules="[{ required: true }]" class="md:col-span-6 mb-0">
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

						<el-form-item class="md:col-span-6 mb-0" :rules="[{ required: true }]" :label="$t('formLabels.email')">
							<template #label>
								<BaseLabel :label="$t('formLabels.email')" :tooltip-content="$t('info.company_email')" />
							</template>
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
							<a
								v-if="resendEmailLink === 0"
								class="cursor-pointer font-bold text-cyan absolute top-2 right-3"
								@click="resendEmailClick(formData.email)"
								>{{ $t("formLabels.resend_email") }}</a
							>
							<span v-if="v$.email.$error" class="text-xs text-red-500 mt-2">{{ v$.email.$errors[0].$message }}</span>
						</el-form-item>

						<div class="flex items-start md:col-span-6 label-upper-dropdown">
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

						<div class="md:col-span-6">
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

							<span v-if="v$.address.$error" class="text-xs text-red-500 mt-2">{{ v$.address.$errors[0].$message }}</span>
						</div>

						<el-form-item :label="$t('formLabels.city')" class="md:col-span-6 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.city')" :tooltip-content="$t('info.city')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="formData.city"
								type="text"
								name="city"
								:class="{ error: v$.city.$error }"
								maxLength="80"
								@change="v$.city.$touch"
								@keypress="CharcterWithWhitespace"
							/>
							<span v-if="v$.city.$error" class="text-xs text-red-500 mt-2">{{ v$.city.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.state')" class="md:col-span-6 lg:col-span-4 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.state')" :tooltip-content="$t('info.state')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="formData.state"
								type="text"
								name="state"
								:class="{ error: v$.state.$error }"
								maxLength="80"
								@change="v$.state.$touch"
								@keypress="CharcterWithWhitespace"
							/>
							<span v-if="v$.state.$error" class="text-xs text-red-500 mt-2">{{ v$.state.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.post_code')" :rules="[{ required: true }]" class="md:col-span-6 lg:col-span-4 mb-0">
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

						<el-form-item :label="$t('formLabels.country')" :rules="[{ required: true }]" class="md:col-span-6 lg:col-span-4 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.country')" :tooltip-content="$t('info.country')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="formData.country"
								type="text"
								name="country"
								:class="{ error: v$.country.$error }"
								maxLength="80"
								@change="v$.country.$touch"
								@keypress="CharcterWithWhitespace"
							/>
							<span v-if="v$.country.$error" class="text-xs text-red-500 mt-2">{{ v$.country.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.preferred_language')" class="md:col-span-6 lg:col-span-4 mb-0">
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

						<el-form-item :label="$t('formLabels.currency')" class="md:col-span-6 lg:col-span-4 mb-0">
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

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.date')" class="md:col-span-12 lg:col-span-4 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.date')" :tooltip-content="$t('info.date')" />
							</template>
							<el-date-picker
								v-model.trim="formData.account_activation_date"
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

						<div class="md:col-span-12 lg:col-span-4">
							<div class="flex items-center">
								<span class="text-dark font-bold flex items-center">
									<span>{{ $t("formLabels.assign_clients") }}</span>
									<span class="text-red-400">*</span>
								</span>
								<BaseLabel :tooltip-content="$t('info.assign_clients')" />
							</div>
							<div class="relative">
								<div class="flex items-center text-base">
									<el-radio-group v-model="formData.all_clients">
										<el-radio :label="1" size="large">{{ $t("formLabels.all_clients") }}</el-radio>

										<el-radio :label="0" size="large">{{ $t("formLabels.select_client") }}</el-radio>

										<BaseMultiSelectDropdown
											v-if="formData.all_clients === 0"
											:disabled="formData.all_clients === null || formData.all_clients === 1"
											size="small"
											:dropdown-option="getClients"
											:get-selected-client="getSelectedClient"
											:isRemote="true"
											:collapse-tag="true"
                                            @remote-search="getClientApiCall"
											@selected-value="dropdownSelectedValueClient"
										/>
									</el-radio-group>
								</div>
							</div>
						</div>

						<div class="md:col-span-12 lg:col-span-4">
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
				</div>

				<div class="p-6 text-right">
					<novok-button class="btn-dark my-1" @click.prevent="cancel"
						><span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span
						><i class="fa-solid fa-xmark sm:hidden"></i
					></novok-button>

					<novok-button v-if="!route.params?.id" class="my-1" type="info" :loading="loading" :disabled="loading" @click.prevent="onSubmit"
						>{{ $t("buttons.add_client_manager") }}
					</novok-button>

					<novok-button v-else class="my-1" type="info" :loading="loading" :disabled="loading" @click.prevent="onSubmit"
						>{{ $t("buttons.save_changes") }}
					</novok-button>
				</div>
			</div>
		</div>
	</el-form>
</template>
<style>
	/* @import "~/assets/css/main.css"; */
</style>
