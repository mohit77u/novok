<template>
	<div class="min-h-screen flex flex-col">
		<LoginHeader />

		<base-renewal-sucess-modal :dialogVisible="centerDialogVisibleRenewal" />

		<el-dialog
			v-model="centerDialogVisible"
			class="max-w-[540px] w-[90%] rounded-2xl noHeader"
			:center="true"
			:close-on-press-escape="false"
			:close-on-click-modal="false"
			:show-close="false"
			:align-center="true"
		>
			<h1 class="text-3xl font-bold mb-5 mt-4 text-dark/100 text-center">Payment Processed!</h1>
			<div class="text-gray text-base">
				<p class="pb-3">
					We're happy to let you know that your card details have been securely saved, and payment will be automatically deducted once your
					account is activated.
				</p>
				<p class="pb-3">Your account is on its way!</p>

				<p>
					We're currently creating your account and you'll receive an email with login details in next 3 days. Please check your inbox (and
					spam folder, just in case) for further instructions.
				</p>
			</div>
			<template #footer>
				<div class="dialog-footer text-center">
					<novok-button type="info" @click="okClick"> Close </novok-button>
				</div>
			</template>
		</el-dialog>

		<div v-show="!centerDialogVisibleRenewal" class="flex flex-1 flex-col">
			<div class="flex items-center justify-center flex-1 px-3 lg:pt-20">
				<div
					class="w-full lg:w-10/12 xl:w-7/12 xxl:w-6/12 p-5 md:p-6 lg:p-8 xl:p-10 rounded-md border-t-[6px] border-primary shadow-md my-5 bg-[#fff]"
				>
					<h6 class="text-3xl font-bold text-dark">Sign Up</h6>
					<p class="text-gray mt-4 mb-10">Enter your details below to create your account and get started.</p>

					<el-form class="flex flex-col">
						<div class="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6 lg:space-x-8">
							<div class="border-dashed border rounded-md border-gray-400 p-4">
								<el-form-item type="file" class="uploadImg mb-0" prop="imgUrl">
									<BaseCompanyLogo
										:limit="1"
										:form-data="formData"
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
										@change="v$.company_name.$touch"
									/>
									<span v-if="v$.company_name.$error" class="text-xs text-red-500 mt-2">{{
										v$.company_name.$errors[0].$message
									}}</span>
								</el-form-item>

								<el-form-item :label="$t('formLabels.reg_company_number')" :rules="[{ required: true }]" class="lg:col-span-3 mb-0">
									<template #label>
										<BaseLabel :label="$t('formLabels.reg_company_number')" :tooltip-content="$t('info.reg_company_number')" :isShowLabel="false"/>
									</template>
									<el-input
										v-model.trim="formData.company_number"
										name="company_number"
										type="text"
										:class="{
											error: v$.company_number.$error,
										}"
										@change="v$.company_number.$touch"
										@keypress="CharcAndNumber"
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
										<BaseLabel :tooltip-content="$t('info.reg_company_address')" :isShowLabel="false"/>
									</div>
									<BaseAddress
										id="companyaddress"
										v-model="formData.company_address"
										:address="companyAddress"
										name="company_address"
										:class="{
											error: v$.company_address.$error,
										}"
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
										<BaseLabel :label="$t('formLabels.city')" :tooltip-content="$t('info.city')" :isShowLabel="false"/>
									</template>
									<el-input
										v-model="formData.company_city"
										type="text"
										name="company_city"
										:class="{
											error: v$.company_city.$error,
										}"
										@change="v$.company_city.$touch"
										@keypress="CharcterWithWhitespace"
									/>
									<span v-if="v$.company_city.$error" class="text-xs text-red-500 mt-2">{{
										v$.company_city.$errors[0].$message
									}}</span>
								</el-form-item>

								<el-form-item :label="$t('formLabels.state')" class="lg:col-span-3 mb-0">
									<template #label>
										<BaseLabel :label="$t('formLabels.state')" :tooltip-content="$t('info.state')" :isShowLabel="false"/>
									</template>
									<el-input
										v-model="formData.company_state"
										type="text"
										name="company_state"
										:class="{
											error: v$.company_state.$error,
										}"
										@change="v$.company_state.$touch"
										@keypress="CharcterWithWhitespace"
									/>
									<span v-if="v$.company_state.$error" class="text-xs text-red-500 mt-2">{{
										v$.company_state.$errors[0].$message
									}}</span>
								</el-form-item>

								<el-form-item :label="$t('formLabels.post_code')" :rules="[{ required: true }]" class="lg:col-span-3 mb-0">
									<template #label>
										<BaseLabel :label="$t('formLabels.post_code')" :tooltip-content="$t('info.post_code')" :isShowLabel="false"/>
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

								<el-form-item :label="$t('formLabels.country')" :rules="[{ required: true }]" class="lg:col-span-3 mb-0">
									<template #label>
										<BaseLabel :label="$t('formLabels.country')" :tooltip-content="$t('info.country')" :isShowLabel="false"/>
									</template>
									<el-input
										v-model="formData.company_country"
										type="text"
										name="company_country"
										:class="{
											error: v$.company_country.$error,
										}"
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
							<div class="grid md:grid-cols-2 lg:grid-cols-6 gap-5 lg:gap-6">
								<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.first_name')" class="lg:col-span-3 mb-0">
									<template #label>
										<BaseLabel :label="$t('formLabels.first_name')" :tooltip-content="$t('info.first_name')" :isShowLabel="false"/>
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
										<BaseLabel :label="$t('formLabels.last_name')" :tooltip-content="$t('info.last_name')" :isShowLabel="false"/>
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
										<BaseLabel :label="$t('formLabels.job_title')" :tooltip-content="$t('info.job_title')" :isShowLabel="false"/>
									</template>
									<el-input
										v-model="formData.job_title"
										name="job_title"
										type="text"
										:class="{
											error: v$.job_title.$error,
										}"
										@change="v$.job_title.$touch"
										@keypress="CharcAndNumber"
									/>
									<span v-if="v$.job_title.$error" class="text-xs text-red-500 mt-2">{{ v$.job_title.$errors[0].$message }}</span>
								</el-form-item>

								<el-form-item :label="$t('formLabels.department')" :rules="[{ required: true }]" class="lg:col-span-3 mb-0">
									<template #label>
										<BaseLabel :label="$t('formLabels.department')" :tooltip-content="$t('info.department')" :isShowLabel="false"/>
									</template>
									<el-input
										v-model="formData.department"
										name="department"
										type="text"
										:class="{
											error: v$.department.$error,
										}"
										@change="v$.department.$touch"
										@keypress="CharcterWithWhitespace"
									/>
									<span v-if="v$.department.$error" class="text-xs text-red-500 mt-2">{{ v$.department.$errors[0].$message }}</span>
								</el-form-item>

								<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.email')" class="lg:col-span-3 mb-0">
									<template #label>
										<BaseLabel :label="$t('formLabels.email')" :tooltip-content="$t('info.email')" />
									</template>
									<div class="relative w-full">
										<el-input
											v-model.trim="formData.email"
											name="email"
											type="text"
											:class="{
												error: v$.email.$error,
											}"
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
									<el-form-item
										:rules="[{ required: true }]"
										class="ml-4 flex-1 mb-0 mt-6"
										:label="$t('formLabels.contact_number')"
									>
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
										<BaseLabel :tooltip-content="$t('info.address')" :isShowLabel="false"/>
									</div>
									<BaseAddress
										id="address"
										v-model="formData.address"
										:address="address"
										name="address"
										:class="{
											error: v$.address.$error,
										}"
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
										<BaseLabel :label="$t('formLabels.city')" :tooltip-content="$t('info.city')" :isShowLabel="false"/>
									</template>
									<el-input
										v-model="formData.city"
										type="text"
										name="city"
										:class="{
											error: v$.city.$error,
										}"
										@change="v$.city.$touch"
										@keypress="CharcterWithWhitespace"
									/>
									<span v-if="v$.city.$error" class="text-xs text-red-500 mt-2">{{ v$.city.$errors[0].$message }}</span>
								</el-form-item>

								<el-form-item :label="$t('formLabels.state')" class="lg:col-span-2 mb-0">
									<template #label>
										<BaseLabel :label="$t('formLabels.state')" :tooltip-content="$t('info.state')" :isShowLabel="false"/>
									</template>
									<el-input
										v-model="formData.state"
										type="text"
										name="state"
										:class="{
											error: v$.state.$error,
										}"
										@change="v$.state.$touch"
										@keypress="CharcterWithWhitespace"
									/>
									<span v-if="v$.state.$error" class="text-xs text-red-500 mt-2">{{ v$.state.$errors[0].$message }}</span>
								</el-form-item>

								<el-form-item :label="$t('formLabels.post_code')" :rules="[{ required: true }]" class="lg:col-span-2 mb-0">
									<template #label>
										<BaseLabel :label="$t('formLabels.post_code')" :tooltip-content="$t('info.post_code')" :isShowLabel="false"/>
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
										<BaseLabel :label="$t('formLabels.country')" :tooltip-content="$t('info.country')" :isShowLabel="false"/>
									</template>
									<el-input
										v-model="formData.country"
										type="text"
										name="country"
										:class="{
											error: v$.country.$error,
										}"
										@change="v$.country.$touch"
										@keypress="CharcterWithWhitespace"
									/>
									<span v-if="v$.country.$error" class="text-xs text-red-500 mt-2">{{ v$.country.$errors[0].$message }}</span>
								</el-form-item>
							</div>
						</div>

						<div class="items-start mt-5">
							<div class="flex flex-wrap items-center w-full">
								<el-checkbox
									v-model="terms_n_conditions"
									id="terms_n_conditions"
									class="text-gray-600 mr-2"
									name="consent_to_privacy_policy"
									@change="termsChange"
								/>

								<label class="text-base" for="terms_n_conditions">
									I agreed to the
									<a class="text-blue-500 underline" href="/terms-of-use" target="_blank">terms and conditions.</a>

									<span class="text-danger">*</span></label
								>
							</div>
							<span v-if="showError" class="text-xs text-red-500 mt-2">{{ $t("formValidations.terms_n_conditions") }}</span>
						</div>

						<div class="text-center mt-4 md:mt-6 lg:mt-8 2xl:mt-10">
							<novok-button type="info" class="font-semibold" :loading="loading" :disabled="loading" @click.prevent="onSubmit">
								Sign Up And Proceed to Pay
							</novok-button>
						</div>

						<div class="text-center font-normal mt-4 md:mt-6 lg:mt-8 2xl:mt-10">
							Already have an account? <router-link class="text-primary font-bold" to="/sign-in">Sign In</router-link>
						</div>
					</el-form>
				</div>
			</div>
			<LoginFooter />
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { required, email, minLength, maxLength, helpers, sameAs } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import { sidebarItemClear } from "../helper/sidebarItemClear";

	definePageMeta({
		layout: "empty",
	});

	useHead({
		title: "Sign Up",
	});

	const loading = ref(false);
	const config = useRuntimeConfig();
	const localePath = useLocalePath();
	const { t } = useI18n();
	const address = ref("");
	const companyAddress = ref<any>("");
	const deleteImg = ref(false);
	const route = useRoute();
	const fullscreenLoading = ref(false);
	const formHeight = ref<any>(null);
	const centerDialogVisible = ref(false);
	const centerDialogVisibleRenewal = ref(false);

	const formData = reactive<any>({
		checkout_session_id: "",
		company_logo: "",
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
	});

	const AddressChecked = ref(false);
	const terms_n_conditions = ref(0);
	const showError = ref(false);

	const { getSelectedCountry, getCountry } = useGetSelectedCountry();

	onMounted(async () => {
		if (route?.query?.signup_id) {
			await getUserSignupRequest(route?.query?.signup_id);
		}

		if (route?.query?.type === "success" && route?.query?.is_renewal === "no") {
			centerDialogVisible.value = true;
		}

		if (route?.query?.type === "success" && route?.query?.is_renewal === "yes") {
			centerDialogVisibleRenewal.value = true;
			return false;
		}
	});

	const rules = computed(() => {
		return {
			company_name: {
				required: helpers.withMessage(t("formValidations.reg_company_name"), required),
				maxLength: helpers.withMessage(t("formValidations.reg_company_name_max"), maxLength(100)),
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
		};
	});

	const v$ = useVuelidate(rules, formData);

	const termsChange = (value: any) => {
		if (value == 0) {
			showError.value = true;
		} else {
			showError.value = false;
		}
	};

	const dropdownSelectedValue = (dropdownValue: any) => {
		formData.country_code = dropdownValue;
	};

	const imgOnChange = (value: any) => {
		deleteImg.value = false;
		formData.company_logo = value.file;
	};

	const handleRemove = () => {
		formData.company_logo = "";
		deleteImg.value = true;
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

	const AddressCheckBoxChange = (value: any) => {
		if (value) {
			formData.address = formData.company_address;
			address.value = formData.company_address;
			formData.city = formData.company_city;
			formData.state = formData.company_state;
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

	const okClick = () => {
		navigateTo(localePath("/sign-in"));
	};

	const getUserSignupRequest = async (signup_id: string) => {
		try {
			fullscreenLoading.value = true;

			const res: any = await useApiFetch(`/sign-up/${signup_id}`, {
				method: "GET",
			});

			Object.assign(formData, res?.data);
			address.value = formData?.address;
			companyAddress.value = formData?.company_address;
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const onSubmit = async () => {
		try {
			if (terms_n_conditions.value == 0) {
				showError.value = true;
			} else {
				showError.value = false;
			}
			v$.value.$validate();
			if (!v$.value.$error && terms_n_conditions.value != 0) {
				loading.value = true;

				const fd = new FormData();
				Object.keys(formData).forEach((field) => {
					fd.append(field, formData?.[field]);
				});

				const res: any = await useApiFetch("/sign-up", {
					method: "POST",
					body: fd,
				});

				useToast("success", res?.message);
				navigateTo({
					path: "/pricing-plans",
					query: {
						signup_id: res?.data?.id,
					},
				});
			}
		} catch {
		} finally {
			loading.value = false;
		}
	};
</script>

<style lang="scss" scoped>
</style>
