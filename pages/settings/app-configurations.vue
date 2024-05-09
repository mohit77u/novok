<script setup lang="ts">
	import { required, maxLength, helpers, url } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import { useProfileStore } from "~/store/profile";
	import { CurrencyData } from "~/helper/data";
	import moment from "moment";

	definePageMeta({
		// layout: "auth",
		middleware: ["auth", "is-client-admin"],
	});

	useHead({
		title: "App Configurations",
	});

	const formData = reactive<any>({
		contract_prefix: "",
		contract_nda_prefix: "",
		contract_sow_prefix: "",
		contract_order_form_prefix: "",
		request_number_prefix: "",
		project_code_prefix: "",
		qt_code_prefix: "",
		target_savings: "",
		target_savings_currency: "",
		target_savings_start_date: "",
		target_savings_end_date: "",
		place_order: "",
	});

	const profileStore = useProfileStore();
	const loading = ref(false);
	const fullscreenLoading = ref(false);
	const formHeight = ref<any>(null);
	const localePath = useLocalePath();
	const { t } = useI18n();
	const config = useRuntimeConfig();

	const rules = computed(() => {
		return {
			contract_prefix: {
				required: helpers.withMessage(t("formValidations.contract_prefix"), required),
				maxLength: helpers.withMessage(t("formValidations.contract_prefix_max"), maxLength(10)),
			},
			contract_nda_prefix: {
				required: helpers.withMessage(t("formValidations.contract_nda_prefix"), required),
				maxLength: helpers.withMessage(t("formValidations.contract_nda_prefix_max"), maxLength(10)),
			},
			contract_sow_prefix: {
				required: helpers.withMessage(t("formValidations.contract_sow_prefix"), required),
				maxLength: helpers.withMessage(t("formValidations.contract_sow_prefix_max"), maxLength(10)),
			},
			contract_order_form_prefix: {
				required: helpers.withMessage(t("formValidations.contract_order_form_prefix"), required),
				maxLength: helpers.withMessage(t("formValidations.contract_order_form_prefix_max"), maxLength(10)),
			},
			request_number_prefix: {
				required: helpers.withMessage(t("formValidations.request_number_prefix"), required),
				maxLength: helpers.withMessage(t("formValidations.request_number_prefix_max"), maxLength(10)),
			},
			project_code_prefix: {
				required: helpers.withMessage(t("formValidations.project_code_prefix"), required),
				maxLength: helpers.withMessage(t("formValidations.project_code_prefix_max"), maxLength(10)),
			},
			qt_code_prefix: {
				required: helpers.withMessage(t("formValidations.tender_quotation_code_prefix"), required),
				maxLength: helpers.withMessage(t("formValidations.tender_quotation_code_prefix_max"), maxLength(10)),
			},
			target_savings: {
				required: helpers.withMessage(t("formValidations.target_savings"), required),
				name_validation: {
					$validator: PasteNumberOnly,
					$message: t("copyPasteValidations.number"),
				},
			},
			target_savings_currency: {
				required: helpers.withMessage(t("formValidations.target_savings_currency"), required),
			},
			target_savings_start_date: {
				required: helpers.withMessage(t("formValidations.target_savings_start_date"), required),
			},
			target_savings_end_date: {
				required: helpers.withMessage(t("formValidations.target_savings_end_date"), required),
			},
			place_order: {
				url: helpers.withMessage(t("formValidations.url"), url),
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

	const userDetailId = computed(() => {
		return profileStore?.getProfileData?.user_detail?.id;
	});

	onMounted(async () => {
		formHeight.value = GetOffset("prefix", 0);
		fullscreenLoading.value = true;

		try {
			const res: any = await useApiFetch(`/site-configurations`, {
				method: "GET",
			});

			Object.assign(formData, res?.data);
			formData.target_savings = formData.target_savings?.replace(".00", "") || "";
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	});

	const onSubmit = async () => {
		try {
			// formData.place_order = `https://${formData.place_order}`;

			v$.value.$validate();
			if (!v$.value.$error) {
				fullscreenLoading.value = true;

				const res: any = await useApiFetch(`/site-configurations`, {
					method: "PATCH",
					body: formData,
				});

				useToast("success", res?.message);
			}
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const dropdownSelectedCurrencyValue = (value: any) => {
		formData.target_savings_currency = value;
	};

	const disabledDate = (date: any) => {
		const curretDate = moment(date).format();
		const newDate = formData?.target_savings_start_date ? moment(formData?.target_savings_start_date)?.format() : "";

		if (curretDate < newDate) {
			return true;
		} else {
			return false;
		}
	};

	// const disabledStartDate = (date: any) => {
	// 	var d = new Date();
	// 	d.setDate(d.getDate() - 1);
	// 	if (d > date) {
	// 		return true;
	// 	}
	// };
	const placeOrderChange = (value: any) => {
		if (value.length) {
			if (value.includes("https") || value.includes("http")) {
				v$.value.place_order.$touch();
			} else {
				formData.place_order = "";
				formData.place_order = `https://${value}`;
			}
		}
	};
</script>

<template>
	<el-form v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="flex flex-col relative">
		<div class="p-6 pt-0" id="prefix">
			<div class="flex items-center">
				<h3 class="text-2xl font-bold my-6">System Prefixes</h3>
				<BaseLabel :tooltip-content="$t('info.contract_type_heading')" :isShowLabel="false" />
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 flex-grow w-full">
				<el-form-item :label="$t('formLabels.contract_prefix')" :rules="[{ required: true }]" class="mb-0">
					<template #label>
						<BaseLabel :label="$t('formLabels.contract_prefix')" :tooltip-content="$t('info.contract_prefix')" />
					</template>
					<el-input
						v-model.trim="formData.contract_prefix"
						name="contract_prefix"
						type="text"
						:class="{ error: v$.contract_prefix.$error }"
						@input="
							(value) => {
								formData.contract_prefix = value.toUpperCase();
							}
						"
						@change="v$.contract_prefix.$touch"
						@keypress="CharcAndNumber"
						maxLength="10"
					/>
					<span v-if="v$.contract_prefix.$error" class="text-xs text-red-500 mt-2">{{ v$.contract_prefix.$errors[0].$message }}</span>
				</el-form-item>

				<el-form-item :label="$t('formLabels.contract_nda_prefix')" :rules="[{ required: true }]" class="mb-0">
					<template #label>
						<BaseLabel :label="$t('formLabels.contract_nda_prefix')" :tooltip-content="$t('info.contract_nda_prefix')" />
					</template>
					<el-input
						v-model.trim="formData.contract_nda_prefix"
						name="contract_nda_prefix"
						type="text"
						:class="{ error: v$.contract_nda_prefix.$error }"
						@change="v$.contract_nda_prefix.$touch"
						@input="
							(value) => {
								formData.contract_nda_prefix = value.toUpperCase();
							}
						"
						@keypress="CharcAndNumber"
						maxLength="10"
					/>
					<span v-if="v$.contract_nda_prefix.$error" class="text-xs text-red-500 mt-2">{{
						v$.contract_nda_prefix.$errors[0].$message
					}}</span>
				</el-form-item>

				<el-form-item :label="$t('formLabels.contract_sow_prefix')" :rules="[{ required: true }]" class="mb-0">
					<template #label>
						<BaseLabel :label="$t('formLabels.contract_sow_prefix')" :tooltip-content="$t('info.contract_sow_prefix')" />
					</template>
					<el-input
						v-model.trim="formData.contract_sow_prefix"
						name="contract_sow_prefix"
						type="text"
						:class="{ error: v$.contract_sow_prefix.$error }"
						@change="v$.contract_sow_prefix.$touch"
						@input="
							(value) => {
								formData.contract_sow_prefix = value.toUpperCase();
							}
						"
						@keypress="CharcAndNumber"
						maxLength="10"
					/>
					<span v-if="v$.contract_sow_prefix.$error" class="text-xs text-red-500 mt-2">{{
						v$.contract_sow_prefix.$errors[0].$message
					}}</span>
				</el-form-item>

				<el-form-item :label="$t('formLabels.contract_order_form_prefix')" :rules="[{ required: true }]" class="mb-0">
					<template #label>
						<BaseLabel
							:label="$t('formLabels.contract_order_form_prefix')"
							:tooltip-content="$t('info.contract_order_form_prefix')"
						/>
					</template>
					<el-input
						v-model.trim="formData.contract_order_form_prefix"
						name="contract_order_form_prefix"
						type="text"
						:class="{ error: v$.contract_order_form_prefix.$error }"
						@change="v$.contract_order_form_prefix.$touch"
						@input="
							(value) => {
								formData.contract_order_form_prefix = value.toUpperCase();
							}
						"
						@keypress="CharcAndNumber"
						maxLength="10"
					/>
					<span v-if="v$.contract_order_form_prefix.$error" class="text-xs text-red-500 mt-2">{{
						v$.contract_order_form_prefix.$errors[0].$message
					}}</span>
				</el-form-item>

				<el-form-item :label="$t('formLabels.request_number_prefix')" :rules="[{ required: true }]" class="mb-0">
					<template #label>
						<BaseLabel :label="$t('formLabels.request_number_prefix')" :tooltip-content="$t('info.request_number_prefix')" />
					</template>
					<el-input
						v-model.trim="formData.request_number_prefix"
						name="request_number_prefix"
						type="text"
						:class="{ error: v$.request_number_prefix.$error }"
						@change="v$.request_number_prefix.$touch"
						@input="
							(value) => {
								formData.request_number_prefix = value.toUpperCase();
							}
						"
						maxLength="10"
					/>
					<span v-if="v$.request_number_prefix.$error" class="text-xs text-red-500 mt-2">{{
						v$.request_number_prefix.$errors[0].$message
					}}</span>
				</el-form-item>

				<el-form-item :label="$t('formLabels.project_code_prefix')" :rules="[{ required: true }]" class="mb-0">
					<template #label>
						<BaseLabel :label="$t('formLabels.project_code_prefix')" :tooltip-content="$t('info.project_code_prefix')" />
					</template>
					<el-input
						v-model.trim="formData.project_code_prefix"
						name="project_code_prefix"
						type="text"
						:class="{ error: v$.project_code_prefix.$error }"
						@change="v$.project_code_prefix.$touch"
						@keypress="CharcAndNumber"
						@input="
							(value) => {
								formData.project_code_prefix = value.toUpperCase();
							}
						"
						maxLength="10"
					/>
					<span v-if="v$.project_code_prefix.$error" class="text-xs text-red-500 mt-2">{{
						v$.project_code_prefix.$errors[0].$message
					}}</span>
				</el-form-item>

				<el-form-item :label="$t('formLabels.tender_quotation_code_prefix')" :rules="[{ required: true }]" class="mb-0">
					<template #label>
						<BaseLabel
							:label="$t('formLabels.tender_quotation_code_prefix')"
							:tooltip-content="$t('info.tender_quotation_code_prefix')"
						/>
					</template>
					<el-input
						v-model.trim="formData.qt_code_prefix"
						name="qt_code_prefix"
						type="text"
						:class="{ error: v$.qt_code_prefix.$error }"
						@change="v$.qt_code_prefix.$touch"
						@keypress="CharcAndNumber"
						@input="
							(value) => {
								formData.qt_code_prefix = value.toUpperCase();
							}
						"
						maxLength="10"
					/>
					<span v-if="v$.qt_code_prefix.$error" class="text-xs text-red-500 mt-2">{{ v$.qt_code_prefix.$errors[0].$message }}</span>
				</el-form-item>
			</div>

			<div class="flex items-center">
				<h3 class="text-2xl font-bold my-6">Financial Settings</h3>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 flex-grow w-full">
				<el-form-item :rules="[{ required: true }]" class="mb-0">
					<template #label>
						<BaseLabel :label="$t('formLabels.currency')" :tooltip-content="$t('info.target_savings_currency')" />
					</template>
					<BaseSelectDropdown
						v-model="formData.target_savings_currency"
						name="target_savings_currency"
						:dropdown-option="CurrencyData"
						:number-only="false"
						:class="{
							error: v$.target_savings_currency.$error,
						}"
						@value="dropdownSelectedCurrencyValue"
						@change="v$.target_savings_currency.$touch"
					/>
					<span v-if="v$.target_savings_currency.$error" class="text-xs text-red-500 mt-2">{{
						v$.target_savings_currency.$errors[0].$message
					}}</span>
				</el-form-item>

				<el-form-item :label="$t('formLabels.target_savings_value')" :rules="[{ required: true }]" class="mb-0">
					<template #label>
						<BaseLabel :label="$t('formLabels.target_savings_value')" :tooltip-content="$t('info.target_savings_value')" />
					</template>
					<el-input
						v-model.trim="formData.target_savings"
						name="target_savings"
						type="text"
						:class="{ error: v$.target_savings.$error }"
						@change="v$.target_savings.$touch"
						@keypress="NumbersOnly"
						maxLength="10"
					/>
					<span v-if="v$.target_savings.$error" class="text-xs text-red-500 mt-2">{{ v$.target_savings.$errors[0].$message }}</span>
				</el-form-item>

				<el-form-item :rules="[{ required: true }]" class="mb-0">
					<template #label>
						<BaseLabel :label="$t('formLabels.target_savings_start_date')" :tooltip-content="$t('info.target_savings_start_date')" />
					</template>
					<el-date-picker
						v-model.trim="formData.target_savings_start_date"
						type="date"
						placeholder="DD/MM/YYYY"
						format="DD/MM/YYYY"
						name="target_savings_start_date"
						value-format="YYYY-MM-DD"
						:class="{
							error: v$.target_savings_start_date.$error,
						}"
						@change="startDateChange"
					/>
					<span v-if="v$.target_savings_start_date.$error" class="text-xs text-red-500 mt-2 w-full">{{
						v$.target_savings_start_date.$errors[0].$message
					}}</span>
				</el-form-item>

				<el-form-item :rules="[{ required: true }]" class="mb-0">
					<template #label>
						<BaseLabel :label="$t('formLabels.target_savings_end_date')" :tooltip-content="$t('info.target_savings_end_date')" />
					</template>
					<el-date-picker
						v-model.trim="formData.target_savings_end_date"
						type="date"
						placeholder="DD/MM/YYYY"
						format="DD/MM/YYYY"
						name="target_savings_end_date"
						value-format="YYYY-MM-DD"
						:disabled-date="disabledDate"
						:class="{
							error: v$.target_savings_end_date.$error,
						}"
						@change="startDateChange"
					/>
					<span v-if="v$.target_savings_end_date.$error" class="text-xs text-red-500 mt-2 w-full">{{
						v$.target_savings_end_date.$errors[0].$message
					}}</span>
				</el-form-item>
			</div>

			<div class="flex items-center">
				<h3 class="text-2xl font-bold my-6">System Settings</h3>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 flex-grow w-full">
				<el-form-item :label="$t('formLabels.add_link_to_place_order')" class="mb-0">
					<template #label>
						<BaseLabel :label="$t('formLabels.add_link_to_place_order')" :tooltip-content="$t('info.add_link_to_place_order')" />
					</template>
					<el-input
						v-model.trim="formData.place_order"
						name="place_order"
						type="url"
						:class="{
							error: v$.place_order.$error,
						}"
						@change="placeOrderChange"
					/>
					<span v-if="v$.place_order.$error" class="text-xs text-red-500 mt-2 w-full">{{ v$.place_order.$errors[0].$message }}</span>
				</el-form-item>
			</div>

			<div class="pt-6 text-right">
				<novok-button class="btn-dark my-1" @click="CancelRedirect('/dashboard')"
					><span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span
					><i class="fa-solid fa-xmark sm:hidden"></i
				></novok-button>

				<novok-button class="my-1" type="info" :loading="loading" :disabled="loading" @click.prevent="onSubmit"
					>{{ $t("buttons.save_changes") }}
				</novok-button>
			</div>
		</div>
	</el-form>
</template>
