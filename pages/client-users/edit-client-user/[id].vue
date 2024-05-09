<script setup lang="ts">
	import { required, email, minLength, maxLength, helpers, requiredIf } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import moment from "moment";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import { languageData } from "~/helper/data";
	import { useProfileStore } from "~/store/profile";
	import { removeEmptyValues } from "~/helper/common";

	definePageMeta({
		// layout: "auth",
		middleware: ["auth", "is-client-admin"],
	});

	useHead({
		title: "Edit User",
	});

	let formData = reactive<any>({
		employee_id: "",
		first_name: "",
		last_name: "",
		job_title: "",
		department: "",
		address: "",
		email: "",
		country_code: "+44",
		mobile_number: "",
		city: "",
		country: "",
		state: "",
		post_code: "",
		preferred_langauge: "",
		account_status: 1,
		account_activation_date: "",
		master_user_detail_id: "",
		access_role_id: null,
		is_working_remotly: 1,
	});
	const copyFormData = ref<any>({});
	const loading = ref(false);
	const route = useRoute();
	const fullscreenLoading = ref(false);
	const formHeight = ref<any>(null);
	const localePath = useLocalePath();
	const { t } = useI18n();
	const address = ref("");
	const resendEmailLink = ref(1);
	const accessRoles = ref<any>([]);
	const profileStore = useProfileStore();
	const { getSelectedCountry, getCountry } = useGetSelectedCountry();

	const rules = computed(() => {
		return {
			employee_id: {
				// required: helpers.withMessage(t("formValidations.employee_id"), required),
				maxLength: helpers.withMessage(t("formValidations.employee_id_max"), maxLength(15)),
				name_validation: {
					$validator: PasteCharcAndNum,
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
				required: helpers.withMessage(t("formValidations.user_work_email"), required),
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
				requiredIf: helpers.withMessage(t("formValidations.super_user_address"), requiredIf(!formData.is_working_remotly)),
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

			account_activation_date: {
				required: helpers.withMessage(t("formValidations.date"), required),
			},

			access_role_id: {
				required: helpers.withMessage(t("formValidations.access_role"), required),
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

	onMounted(() => {
		formHeight.value = GetOffset("super-admin-form", 0);
		getEditTableData();
		getAccessRoles();
		formData.account_activation_date = moment().format("YYYY-MM-DD");
		formData.master_user_detail_id = sessionStorage.getItem("client_admin_id") || "";
	});

	const getProfileStoreData = computed(() => {
		return profileStore.getProfileData;
	});

	const getEditTableData = async () => {
		try {
			fullscreenLoading.value = true;

			const res: any = await useApiFetch(`/client-users/${route.params?.id}`, {
				method: "GET",
			});

			resendEmailLink.value = res.data?.is_default_password_changed;
			Object.keys(formData).forEach((field) => {
				formData[field] = res.data?.[field];
				formData["email"] = res.data?.user?.email;
			});

			address.value = res.data?.address;
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
		formData = removeEmptyValues(formData);
		if (!v$.value.$error) {
			submitEditData();
		} else {
			setTimeout(() => {
				const firstErrorElement = document.querySelector(".error");
				if (firstErrorElement) {
					firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
				}
			}, 250);
		}
	};

	const submitEditData = async () => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch(`/client-users/${route.params?.id}`, {
				method: "PATCH",
				body: formData,
			});

			useToast("success", res.message);
			navigateTo(
				localePath({
					path: "/client-users",
					query: {
						client_admin_id: route.query?.client_admin_id,
					},
				})
			);
		} catch {
		} finally {
			fullscreenLoading.value = false;
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

	const getAccessRoles = async () => {
		try {
			const res: any = await useApiFetch("/access-roles", {
				method: "GET",
			});
			accessRoles.value = res.data?.data?.map((role: any) => {
				return {
					label: role.name,
					value: role.id,
				};
			});
		} catch {}
	};

	const dropdownSelectedAccessRole = (value: any) => {
		formData.access_role_id = value;
	};

	const dropdownSelectedPrefLanguage = (value: any) => {
		formData.preferred_langauge = value;
	};

	const getSelectedAccessRole = computed(() => {
		return accessRoles.value.map((role: any) => role.value === formData.access_role_id);
	});

	const getSelectedLanguage = computed(() => {
		return languageData.map((item: any) => item.value === formData.preferred_langauge);
	});

	const cancel = () => {
		const clientAdminId = sessionStorage.getItem("client_admin_id");
		const pageDetails = JSON.parse(sessionStorage.getItem("pageDetails") || "{}");
		let queryUrl = `/client-users?page=${pageDetails?.page}&perPage=${pageDetails?.perPage}&client_admin_id=${clientAdminId}`;
		if (pageDetails?.searchValue) {
			queryUrl = queryUrl + `&searchValue=${pageDetails?.searchValue}`;
		}
		if (pageDetails?.sortOrder) {
			queryUrl = queryUrl + `&sortOrder=${pageDetails?.sortOrder}`;
		}
		if (pageDetails?.sortColumn) {
			queryUrl = queryUrl + `&sortColumn=${pageDetails?.sortColumn}`;
		}
		navigateTo(localePath(queryUrl));
	};

	const isWorkingChange = (value: any) => {
		if (!value) {
			address.value = getProfileStoreData.value?.user_detail?.address;
			formData.address = getProfileStoreData.value?.user_detail?.address;
			formData.city = getProfileStoreData.value?.user_detail?.city;
			formData.state = getProfileStoreData.value?.user_detail?.state;
			formData.country = getProfileStoreData.value?.user_detail?.country;
			formData.post_code = getProfileStoreData.value?.user_detail?.post_code;
		} else {
			address.value = "";
			formData.address = "";
			formData.city = "";
			formData.country = "";
			formData.state = "";
			formData.post_code = "";
		}
	};
</script>

<template>
	<el-form v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="flex flex-col relative" :model="form">
		<div id="super-admin-form">
			<div class="p-6">
				<div class="grid md:grid-cols-2 lg:grid-cols-6 gap-5 lg:gap-6">
					<el-form-item :label="$t('formLabels.employee_id')" class="lg:col-span-3 mb-0">
						<template #label>
							<BaseLabel :label="$t('formLabels.employee_id')" :tooltip-content="$t('info.employee_id')" />
						</template>
						<el-input v-model.trim="formData.employee_id" name="employee_id" type="text" maxLength="15" @keypress="CharcAndNumber" />
					</el-form-item>

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

					<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.user_work_email')" class="lg:col-span-3 mb-0">
						<template #label>
							<BaseLabel :label="$t('formLabels.user_work_email')" :tooltip-content="$t('info.company_email')" />
						</template>
						<div class="relative w-full">
							<el-input
								v-model.trim="formData.email"
								name="email"
								type="text"
								:class="{
									error: v$.email.$error,
								}"
								disabled
								@change="v$.email.$touch"
							/>
							<a
								v-if="resendEmailLink === 0"
								class="cursor-pointer font-bold text-cyan absolute top-2 right-3"
								@click="resendEmailClick(formData.email)"
								>{{ $t("formLabels.resend_email") }}</a
							>
						</div>

						<span v-if="v$.email.$error" class="text-xs text-red-500 mt-2">{{ v$.email.$errors[0].$message }}</span>
					</el-form-item>

					<div class="flex items-start lg:col-span-3 mb-0 label-upper-dropdown">
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

							<span v-if="v$.mobile_number.$error" class="text-xs text-red-500 mt-2">{{ v$.mobile_number.$errors[0].$message }}</span>
						</el-form-item>
					</div>

					<div class="flex flex-wrap items-center md:col-span-3 lg:col-span-3 mb-0">
						<div class="flex items-center w-full">
							<span class="text-dark font-bold flex items-center">
								<span>{{ $t("formLabels.is_working_remotly") }}</span>
								<span class="text-red-400">*</span>
							</span>
							<BaseLabel :tooltip-content="$t('info.is_working_remotly')" />
						</div>
						<el-radio-group v-model="formData.is_working_remotly" :disabled="disabled" @change="isWorkingChange">
							<el-radio :label="1" size="large">{{ $t("formLabels.yes") }}</el-radio>
							<el-radio :label="0" size="large">{{ $t("formLabels.no") }}</el-radio>
						</el-radio-group>
					</div>

					<div class="lg:col-span-3">
						<div class="flex items-center">
							<span class="text-dark font-bold flex items-center">
								<span>{{ $t("formLabels.address") }}</span>
								<span v-if="!formData.is_working_remotly" class="text-red-400">*</span>
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

					<el-form-item :label="$t('formLabels.state')" class="lg:col-span-3 mb-0">
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

					<el-form-item :label="$t('formLabels.post_code')" :rules="[{ required: true }]" class="lg:col-span-3 mb-0">
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

					<el-form-item :label="$t('formLabels.country')" :rules="[{ required: true }]" class="lg:col-span-3 mb-0">
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

					<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.access_role')" class="lg:col-span-3 mb-0">
						<template #label>
							<BaseLabel :label="$t('formLabels.access_role')" :tooltip-content="$t('info.access_role')" />
						</template>
						<BaseSelectDropdown
							v-model="formData.access_role_id"
							:dropdown-option="accessRoles"
							:get-selected-country="getSelectedAccessRole"
							:number-only="false"
							:disabled="disabled"
							name="access_role_id"
							:class="{
								error: v$.access_role_id.$error,
							}"
							@selected-value="dropdownSelectedAccessRole"
							@change="v$.access_role_id.$touch"
						/>
						<span v-if="v$.access_role_id.$error" class="text-xs text-red-500 mt-2">{{ v$.access_role_id.$errors[0].$message }}</span>
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

					<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.date')" class="lg:col-span-3 mb-0">
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

					<div class="lg:col-span-3">
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
				<div class="pt-6 text-right">
					<novok-button class="btn-dark" @click.prevent="cancel"
						><span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span
						><i class="fa-solid fa-xmark sm:hidden"></i
					></novok-button>
					<novok-button class="my-1" type="info" :loading="loading" :disabled="loading" @click.prevent="onSubmit"
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
