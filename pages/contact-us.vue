<script lang="ts" setup>
	import { required, email, minLength, maxLength, helpers, sameAs } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import { sidebarItemClear } from "../helper/sidebarItemClear";
	//
	//

	definePageMeta({
		layout: "empty",
	});

	useHead({
		title: "Contact Us",
	});
	const loading = ref(false);
	const config = useRuntimeConfig();
	const localePath = useLocalePath();

	const formData = reactive<any>({
		company_name: "",
		first_name: "",
		last_name: "",
		email: "",
		country_code: "+44",
		mobile_number: "",
		subject: "",
		message: "",
		is_existing_user: 0,
		consent_to_privacy_policy: 0,
	});

	const { getSelectedCountry, getCountry } = useGetSelectedCountry();

	const rules = computed(() => {
		return {
			company_name: {
				required: helpers.withMessage("Reg. Company name is required", required),
				maxLength: helpers.withMessage("Reg. Company name must have 100 characters.", maxLength(100)),
			},
			first_name: {
				required: helpers.withMessage("Firstname is required", required),
				maxLength: helpers.withMessage("Firstname must have 50 characters.", maxLength(50)),
			},
			last_name: {
				required: helpers.withMessage("Lastname is required", required),
				maxLength: helpers.withMessage("Lastname must have 50 characters.", maxLength(50)),
			},
			email: {
				required: helpers.withMessage("Email is required", required),
				email: helpers.withMessage("Please enter valid Email address.", email),
			},
			mobile_number: {
				required: helpers.withMessage("Contact Number is required", required),
				minLength: helpers.withMessage("Contact number must have 10 digits.", minLength(10)),
				maxLength: helpers.withMessage("Contact number must have 10 characters.", maxLength(10)),
			},
			subject: {
				required: helpers.withMessage("Subject is required", required),
				maxLength: helpers.withMessage("Subject must have 255 characters.", maxLength(255)),
			},
			message: {
				required: helpers.withMessage("Message is required", required),
				maxLength: helpers.withMessage("Message must have 2000 characters.", maxLength(2000)),
			},
			consent_to_privacy_policy: {
				sameAs: helpers.withMessage("Consent to privacy policy is required", sameAs(true)),
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

	const dropdownSelectedValue = (dropdownValue: any) => {
		formData.country_code = dropdownValue;
	};

	const onSubmit = async () => {
		try {
			v$.value.$validate();
			if (!v$.value.$error) {
				loading.value = true;
				formData.subject = formData.subject?.trim();
				formData.message = formData.message?.trim();

				const res: any = await useApiFetch("/save-contact-us", {
					method: "POST",
					body: formData,
				});

				useToast("success", res?.message);
				navigateTo(localePath("/sign-in"));
			}
		} catch {
		} finally {
			loading.value = false;
		}
	};
</script>

<template>
	<div class="min-h-screen flex flex-col">
		<LoginHeader />
		<div class="flex flex-1 flex-col">
			<div class="flex items-center justify-center flex-1 px-3 lg:pt-20">
				<div
					class="w-full lg:w-10/12 xl:w-7/12 xxl:w-6/12 p-5 md:p-6 lg:p-8 xl:p-10 rounded-md border-t-[6px] border-primary shadow-md my-5 bg-[#fff]"
				>
					<h6 class="text-3xl font-bold text-dark">Contact Us</h6>
					<p class="text-gray mt-4 mb-10">Send us your questions and concerns</p>

					<el-form>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<el-form-item :rules="[{ required: true }]" label="Reg. Company Name">
								<template #label>
									<BaseLabel label="Reg. Company Name" :isShowLabel="false" />
								</template>
								<el-input
									v-model="formData.company_name"
									type="text"
									name="company_name"
									:class="{
										error: v$.company_name.$error,
									}"
									maxLength="100"
									@change="v$.company_name.$touch"
								/>
								<span v-if="v$.company_name.$error" class="text-xs text-red-500 mt-2">{{ v$.company_name.$errors[0].$message }}</span>
							</el-form-item>

							<el-form-item :rules="[{ required: true }]" label="First Name">
								<template #label>
									<BaseLabel label="First Name" :isShowLabel="false" />
								</template>
								<el-input
									v-model.trim="formData.first_name"
									type="text"
									name="first_name"
									:class="{
										error: v$.first_name.$error,
									}"
									maxLength="50"
									@change="v$.first_name.$touch"
									@keypress="CharSpecCharWithWhitespace(e, formData?.first_name?.length)"
								/>
								<span v-if="v$.first_name.$error" class="text-xs text-red-500 mt-2">{{ v$.first_name.$errors[0].$message }}</span>
							</el-form-item>

							<el-form-item :rules="[{ required: true }]" label="Last Name">
								<template #label>
									<BaseLabel label="Last Name" :isShowLabel="false" />
								</template>
								<el-input
									v-model.trim="formData.last_name"
									type="text"
									name="last_name"
									:class="{
										error: v$.last_name.$error,
									}"
									maxLength="50"
									@change="v$.last_name.$touch"
									@keypress="CharSpecCharWithWhitespace(e, formData?.last_name?.length)"
								/>
								<span v-if="v$.last_name.$error" class="text-xs text-red-500 mt-2">{{ v$.last_name.$errors[0].$message }}</span>
							</el-form-item>

							<el-form-item :rules="[{ required: true }]" label="Email ID">
								<template #label>
									<BaseLabel :label="$t('formLabels.email')" :tooltip-content="$t('info.company_email')" />
								</template>
								<el-input
									v-model.trim="formData.email"
									type="text"
									name="email"
									:class="{
										error: v$.email.$error,
									}"
									@change="v$.email.$touch"
								/>
								<span v-if="v$.email.$error" class="text-xs text-red-500 mt-2">{{ v$.email.$errors[0].$message }}</span>
							</el-form-item>

							<div class="flex items-start label-upper-dropdown">
								<div class="w-32 flex-initial mt-6">
									<BaseCountryDropdown
										:dropdown-option="getCountry"
										:get-selected-country="getSelectedCountry"
										@selected-value="dropdownSelectedValue"
									/>
								</div>

								<el-form-item :rules="[{ required: true }]" class="ml-4 flex-1 mt-6" label="Contact Number">
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

							<el-form-item :rules="[{ required: true }]" label="Subject">
								<template #label>
									<BaseLabel label="Subject" :isShowLabel="false" />
								</template>
								<el-input
									v-model="formData.subject"
									type="text"
									name="subject"
									:class="{
										error: v$.subject.$error,
									}"
									maxLength="255"
									@change="v$.subject.$touch"
								/>
								<span v-if="v$.subject.$error" class="text-xs text-red-500 mt-2">{{ v$.subject.$errors[0].$message }}</span>
							</el-form-item>

							<el-form-item :rules="[{ required: true }]" class="md:col-span-2" label="Message">
								<template #label>
									<BaseLabel label="Message" :isShowLabel="false" />
								</template>
								<el-input
									v-model="formData.message"
									type="textarea"
									:rows="5"
									name="message"
									maxLength="2000"
									:class="{
										error: v$.message.$error,
									}"
									@change="v$.message.$touch"
								/>

								<span v-if="v$.message.$error" class="text-xs text-red-500 mt-2">{{ v$.message.$errors[0].$message }}</span>
							</el-form-item>

							<div class="flex items-start md:col-span-2">
								<div class="flex flex-wrap items-center w-full">
									<span class="text-dark text-base mr-4">
										{{ $t("formLabels.are_you_an_existing_user") }}<span class="text-danger">*</span>
									</span>
									<el-radio-group v-model="formData.is_existing_user" size="large">
										<el-radio-button :label="1">{{ $t("formLabels.yes") }}</el-radio-button>
										<el-radio-button :label="0">{{ $t("formLabels.no") }}</el-radio-button>
									</el-radio-group>
								</div>
							</div>

							<div class="flex items-start md:col-span-2">
								<div class="flex flex-wrap items-center w-full">
									<el-checkbox
										v-model="formData.consent_to_privacy_policy"
										class="text-gray-600 mr-2"
										name="consent_to_privacy_policy"
										:class="{
											error: v$.consent_to_privacy_policy.$error,
										}"
										@change="v$.consent_to_privacy_policy.$touch"
									/>
									<label class="text-base">
										I declare that I have read, understood and agreed to the
										<a class="text-blue-500 underline" :href="config.public.privacy_policy" target="_blank">privacy policy.</a>

										<span class="text-danger">*</span></label
									>

									<span v-if="v$.consent_to_privacy_policy.$error" class="text-xs text-red-500 mt-2 block w-full pl-7">{{
										v$.consent_to_privacy_policy.$errors[0].$message
									}}</span>
								</div>
							</div>
						</div>
						<div class="text-center my-9">
							<novok-button type="info" class="font-semibold" :loading="loading" :disabled="loading" @click.prevent="onSubmit"
								>Submit</novok-button
							>
						</div>
						<p class="mb-0 text-center">
							<a class="text-cyan font-semibold cursor-pointer" @click="navigateTo(localePath('/sign-in'))"
								><i class="fa-solid fa-chevron-left mr-3"></i> Back to login</a
							>
						</p>
					</el-form>
				</div>
			</div>
			<LoginFooter />
		</div>
	</div>
</template>
<style>
	/* @import "~/assets/css/main.css"; */
</style>
