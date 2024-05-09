<script setup lang="ts">
	import { required, email, minLength, maxLength, helpers, requiredIf } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import { languageData } from "~/helper/data";

	const formData = ref<any>({
		sub_entity_name: "",
		contact_person_name: "",
		country_code: "+44",
		contact_number: "",
		email: "",
		address: "",
		country: "",
		state: "",
		city: "",
		post_code: "",
		website: "",
		preferred_language: "English",
	});
	const localePath = useLocalePath();
	const { t } = useI18n();
	const route = useRoute();
	const fullscreenLoading = ref(false);
	const loading = ref(false);
	const address = ref("");
	const { getSelectedCountry, getCountry } = useGetSelectedCountry();

	const rules = computed(() => {
		return {
			sub_entity_name: {
				required: helpers.withMessage(t("formValidations.signing_entity_name"), required),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			contact_person_name: {
				required: helpers.withMessage(t("formValidations.contact_person_name"), required),
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
			contact_number: {
				required: helpers.withMessage(t("formValidations.contact_number"), required),
				name_validation: {
					$validator: PasteNumberOnly,
					$message: t("copyPasteValidations.number"),
				},
			},
			address: {
				required: helpers.withMessage(t("formValidations.super_user_address"), required),
			},
			city: {
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			country: {
				required: helpers.withMessage(t("formValidations.country"), required),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			state: {
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			post_code: {
				required: helpers.withMessage(t("formValidations.post_code"), required),
				name_validation: {
					$validator: PasteCharcAndNumWithSpace,
					$message: t("copyPasteValidations.charNum"),
				},
			},
			preferred_language: {
				required: helpers.withMessage(t("formValidations.preferred_language"), required),
			},
		};
	});

	const v$ = useVuelidate(rules, formData.value);

	onMounted(() => {
		if (route.params?.id) {
			getSigningEntityData();
		}
	});

	const getSigningEntityData = async () => {
		fullscreenLoading.value = true;
		try {
			const res: any = await useApiFetch(`/signing-entities/${route.params?.id}`, {
				method: "GET",
			});
			Object.assign(formData.value, res.data);
			address.value = res.data?.address;
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const dropdownSelectedPrefLanguage = (value: any) => {
		formData.value.preferred_language = value;
	};

	const getSelectedLanguage = computed(() => {
		return languageData.map((item: any) => item.value === formData.value.preferred_language);
	});

	const changeAddress = (address: any, id: any) => {
		formData.value.address = address;
	};

	const getAddress = (address: any, companyAddress: any, id: any) => {
		formData.value.address = companyAddress;
		formData.value.city = address?.city;
		formData.value.country = address?.country;
		formData.value.post_code = address?.postal_code;
		formData.value.state = address?.region;
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
		loading.value = true;
		try {
			const res: any = await useApiFetch(`/signing-entities`, {
				method: "POST",
				body: formData.value,
			});
			useToast("success", res.message);
			navigateTo(localePath("/signing-entity"));
		} catch {
		} finally {
			loading.value = false;
		}
	};
	const submitEditData = async () => {
		loading.value = true;
		try {
			const res: any = await useApiFetch(`/signing-entities/${route.params?.id}`, {
				method: "PATCH",
				body: formData.value,
			});
			useToast("success", res.message);
			navigateTo(localePath("/signing-entity"));
		} catch {
		} finally {
			loading.value = false;
		}
	};
</script>

<template>
	<el-form v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="flex flex-col relative">
		<div id="super-admin-form">
			<div class="bg-[#fff]">
				<div class="p-6">
					<div class="grid grid-cols-12 gap-5 lg:gap-6">
						<el-form-item
							:rules="[{ required: true }]"
							:label="$t('formLabels.sub_entity_name')"
							class="col-span-12 lg:col-span-6 md:col-span-6 sm:col-span-6 xl:col-span-6 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.signing_entity_name')"
									:tooltip-content="$t('info.sub_entity_name')"
								/>
							</template>
							<el-input
								v-model="formData.sub_entity_name"
								name="sub_entity_name"
								type="text"
								:disabled="disabled"
								:class="{
									error: v$.sub_entity_name.$error,
								}"
								maxLength="150"
								@change="v$.sub_entity_name.$touch"
								@keypress="CharcterWithWhitespace"
							/>
							<span v-if="v$.sub_entity_name.$error" class="text-xs text-red-500 mt-2">{{
								v$.sub_entity_name.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item
							:rules="[{ required: true }]"
							:label="$t('formLabels.contact_person_name')"
							class="col-span-12 md:col-span-6 lg:col-span-6 sm:col-span-6 xl:col-span-6 mb-0"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.contact_person_name')" :tooltip-content="$t('info.contact_person_name')" />
							</template>
							<el-input
								v-model="formData.contact_person_name"
								name="contact_person_name"
								type="text"
								:disabled="disabled"
								:class="{
									error: v$.contact_person_name.$error,
								}"
								maxLength="150"
								@change="v$.contact_person_name.$touch"
								@keypress="CharcterWithWhitespace"
							/>
							<span v-if="v$.contact_person_name.$error" class="text-xs text-red-500 mt-2">{{
								v$.contact_person_name.$errors[0].$message
							}}</span>
						</el-form-item>

						<div class="flex items-start lg:col-span-6 label-upper-dropdown">
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
									<BaseLabel
										:label="$t('formLabels.contact_number')"
										:tooltip-content="$t('info.contact_number')"
										:isShowLabel="false"
									/>
								</template>
								<el-input
									v-model.trim="formData.contact_number"
									class="input-with-select"
									type="text"
									name="contact_number"
									:class="{
										error: v$.contact_number.$error,
									}"
									maxLength="10"
									@change="v$.contact_number.$touch"
									@keypress="NumbersOnly"
								>
								</el-input>

								<span v-if="v$.contact_number.$error" class="text-xs text-red-500 mt-2">{{
									v$.contact_number.$errors[0].$message
								}}</span>
							</el-form-item>
						</div>

						<el-form-item :label="$t('formLabels.email')" :rules="[{ required: true }]" class="lg:col-span-6 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.email')" :tooltip-content="$t('info.email')" :isShowLabel="false" />
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
									:disabled="disabled"
								/>
								<!-- <a
									v-if="resendEmailLink === 0"
									class="cursor-pointer font-bold text-cyan absolute top-2 right-3"
									@click="resendEmailClick(copyFormData.email)"
									>{{ $t("formLabels.resend_email") }}</a
								> -->
							</div>

							<span v-if="v$.email.$error" class="text-xs text-red-500 mt-2">{{ v$.email.$errors[0].$message }}</span>
						</el-form-item>

						<div class="lg:col-span-6">
							<div class="flex items-center">
								<span class="text-dark font-bold flex items-center">
									<span>{{ $t("formLabels.address") }}</span>
									<span class="text-red-400">*</span>
								</span>
								<BaseLabel :tooltip-content="$t('info.signing_address')" />
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

						<el-form-item :label="$t('formLabels.post_code')" :rules="[{ required: true }]" class="lg:col-span-6 mb-0">
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

						<el-form-item :label="$t('formLabels.country')" :rules="[{ required: true }]" class="lg:col-span-6 mb-0">
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

						<el-form-item
							:label="$t('formLabels.website')"
							class="col-span-12 lg:col-span-6 md:col-span-6 sm:col-span-6 xl:col-span-6 mb-0"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.website')" :tooltip-content="$t('info.website')" />
							</template>
							<el-input v-model="formData.website" name="website" type="text" :disabled="disabled" />
						</el-form-item>

						<el-form-item :label="$t('formLabels.preferred_language')" :rules="[{ required: true }]" class="lg:col-span-6 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.preferred_language')" :tooltip-content="$t('info.preferred_language')" />
							</template>
							<BaseSelectDropdown
								v-model="formData.preferred_language"
								:dropdown-option="languageData"
								:get-selected-country="getSelectedLanguage"
								:number-only="false"
								name="preferred_language"
								:class="{
									error: v$.preferred_language.$error,
								}"
								@selected-value="dropdownSelectedPrefLanguage"
								@change="v$.preferred_language.$touch"
							/>
							<span v-if="v$.preferred_language.$error" class="text-xs text-red-500 mt-2">{{
								v$.preferred_language.$errors[0].$message
							}}</span>
						</el-form-item>
					</div>
				</div>

				<div class="p-6 text-right">
					<novok-button class="btn-dark my-1" @click.prevent="navigateTo(localePath('/signing-entity'))"
						><span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span
						><i class="fa-solid fa-xmark sm:hidden"></i
					></novok-button>

					<novok-button v-if="!route.params?.id" class="my-1" type="info" :loading="loading" :disabled="loading" @click.prevent="onSubmit"
						>{{ $t("buttons.add_signing_entity") }}
					</novok-button>

					<novok-button v-if="route.params?.id" class="my-1" type="info" :loading="loading" :disabled="loading" @click.prevent="onSubmit"
						>{{ $t("buttons.save_changes") }}
					</novok-button>
				</div>
			</div>
		</div>
	</el-form>
</template>
