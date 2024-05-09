<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/require-valid-default-prop -->
<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
	import moment from "moment";
	import { required, helpers, email } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import { supplierStore } from "~/store/supplier";
	const { getSelectedCountry, getCountry } = useGetSelectedCountry();

	const props = defineProps({
		editData: {
			type: Object,
			default: {},
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	});

	const formData = reactive<any>({
		tab_name: "compliance-due-diligence",
		credit_score_dnb_number: "",
		credit_score_report_date: "",
		dpo_first_name: "",
		dpo_last_name: "",
		dpo_email: "",
		dpo_country_code: "+44",
		dpo_mobile_number: "",
		ico_number: "",
		credit_safe_score: "",
		credit_score_source: "",
	});
	const loadingSave = ref(false);
	const loading = ref(false);
	const localePath = useLocalePath();
	const { t } = useI18n();
	const route = useRoute();
	const emit = defineEmits(["active-tab-name", "disabled"]);
	const store = supplierStore();
	const customFields = reactive([]);
	const customFieldRef = ref<any>(null);

	const rules = computed(() => {
		return {
			dpo_email: {
				email: helpers.withMessage(t("formValidations.email_valid"), email),
				name_validation: {
					$validator: PasteEmail,
					$message: t("formValidations.email_valid"),
				},
			},
		};
	});
	const v$ = useVuelidate(rules, formData);

	watch(
		() => props.editData,
		(currData) => {
			if (currData.tab === "compliance-due-diligence" || currData.tab === "all") {
				//   v$.value.$reset();
				if (Object.keys(currData || {}).length) {
					Object.keys(formData).forEach((field: any) => {
						if (currData?.[field] !== undefined && currData?.[field] !== null && currData?.[field] !== "") {
							formData[field] = currData?.[field];
						}
					});
				}

				Object.assign(customFields, currData?.custom_compliance_due_diligences);
			}
		}
	);

	onMounted(() => {});

	const onSubmit = (value: any) => {
		v$.value.$validate();
		if (!v$.value.$error) {
			const isValidCustomFields = customFieldRef.value.isValidate();
			if (isValidCustomFields) {
				submitAddData(value);
			}
		}
	};

	const submitAddData = async (value: any) => {
		try {
			if (value !== "save") {
				loading.value = true;
			} else {
				loadingSave.value = true;
			}

			emit("disabled", true);

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

			const res: any = await useApiFetch(`/supplier-admins/${route?.params?.id}/compliance-due-diligence`, {
				method: "POST",
				body: fd,
			});

			if (value !== "save") {
				store.setActiveTab("reference");
				emit("active-tab-name", "reference");

				if (route.query.page === "view") {
					navigateTo(
						localePath({
							path: "/supplier-admins/view-supplier-admin/" + route.params?.id,
							query: { tab: "reference", page: "view" },
						})
					);
				} else {
					navigateTo(
						localePath({
							path: route.fullPath,
							query: { tab: "reference" },
						}),
						{ replace: true }
					);
				}
			} else {
				if (route.query.page === "view") {
					navigateTo(
						localePath({
							path: "/supplier-admins/view-supplier-admin/" + route.params?.id,
							query: { tab: "compliance-due-diligence", page: "view" },
						})
					);
				}
				useToast("success", res.message);
			}
		} catch {
		} finally {
			loading.value = false;
			loadingSave.value = false;
		}
	};

	const dropdownDPOCountryCode = (value: any) => {
		formData.dpo_country_code = value;
	};

	const disabledDate = (date: any) => {
		const curretDate = moment(date).format();
		const newDate = formData?.com_credit_safe_from ? moment(formData?.com_credit_safe_from)?.format() : "";
		if (curretDate < newDate) {
			return true;
		} else {
			return false;
		}
	};

	const BackClick = () => {
		SupplierBackButton("primary-details");
		emit("active-tab-name", "primary-details");
	};
</script>

<template>
	<el-form>
		<div class="p-6">
			<h3 class="pb-3 text-2xl font-bold">
				{{ $t("formLabels.dpo_details") }}
				<BaseLabel :tooltip-content="$t('info.dpo_details')" />
			</h3>
			<div class="grid md:grid-cols-2 lg:grid-cols-6 gap-5 lg:gap-6 flex-grow w-full">
				<el-form-item :label="$t('formLabels.first_name')" class="lg:col-span-3 mb-0">
					<template #label>
						<BaseLabel :label="$t('formLabels.first_name')" :tooltip-content="$t('info.first_name')" :isShowLabel="false" />
					</template>
					<el-input
						v-model="formData.dpo_first_name"
						name="dpo_first_name"
						type="text"
						:disabled="disabled"
						@keypress="CharSpecCharWithWhitespace"
					/>
				</el-form-item>

				<el-form-item :label="$t('formLabels.last_name')" class="lg:col-span-3 mb-0">
					<template #label>
						<BaseLabel :label="$t('formLabels.last_name')" :tooltip-content="$t('info.last_name')" :isShowLabel="false" />
					</template>
					<el-input
						v-model="formData.dpo_last_name"
						name="dpo_last_name"
						type="text"
						:disabled="disabled"
						@keypress="CharSpecCharWithWhitespace"
					/>
				</el-form-item>

				<el-form-item class="lg:col-span-3 mb-0">
					<template #label>
						<BaseLabel :label="$t('formLabels.email')" :tooltip-content="$t('info.email')" :isShowLabel="false" />
					</template>
					<el-input
						v-model="formData.dpo_email"
						name="dpo_email"
						type="text"
						:disabled="disabled"
						:class="{
							error: v$.dpo_email.$error,
						}"
						@change="v$.dpo_email.$touch"
					/>
					<span v-if="v$.dpo_email.$error" class="text-xs text-red-500 mt-2">{{ v$.dpo_email.$errors[0].$message }}</span>
				</el-form-item>

				<div class="flex items-start lg:col-span-3 mb-0 label-upper-dropdown">
					<div class="w-32 flex-initial mt-6">
						<BaseCountryDropdown
							v-model.trim="formData.dpo_country_code"
							:disabled="disabled"
							:dropdown-option="getCountry"
							:get-selected-country="getSelectedCountry"
							@selected-value="dropdownDPOCountryCode"
						/>
					</div>

					<el-form-item class="ml-4 flex-1 mb-0 mandatory mt-6" :label="$t('formLabels.contact_number')">
						<template #label>
							<BaseLabel :label="$t('formLabels.contact_number')" :tooltip-content="$t('info.contact_number')" :isShowLabel="false" />
						</template>
						<el-input v-model.trim="formData.dpo_mobile_number" type="text" :disabled="disabled" maxLength="10" @keypress="NumbersOnly" />
					</el-form-item>
				</div>
			</div>
			<div class="mt-5">
				<h3 class="pb-3 text-2xl font-bold">
					{{ $t("formLabels.credit_score") }}
				</h3>
				<div class="grid md:grid-cols-2 gap-5 lg:gap-6 flex-grow w-full">
					<el-form-item class="flex-1 mb-0 mandatory">
						<template #label>
							<BaseLabel :label="$t('formLabels.dnb_number')" :tooltip-content="$t('info.dnb_number')" :isShowLabel="false" />
						</template>
						<el-input
							v-model.trim="formData.credit_score_dnb_number"
							type="text"
							:disabled="disabled"
							name="credit_score_dnb_number"
							@keypress="NumbersOnly"
						/>
					</el-form-item>

					<el-form-item class="flex-1 mb-0 mandatory" :label="$t('formLabels.credit_safe_score')">
						<template #label>
							<BaseLabel :label="$t('formLabels.credit_safe_score')" :tooltip-content="$t('info.credit_safe_score')" />
						</template>
						<el-input
							v-model.trim="formData.credit_safe_score"
							type="text"
							:disabled="disabled"
							name="credit_safe_score"
							@keypress="NumbersOnly"
						/>
					</el-form-item>

					<el-form-item class="flex-1 mb-0 mandatory">
						<template #label>
							<BaseLabel
								:label="$t('formLabels.source_of_credit_score')"
								:tooltip-content="$t('info.source_of_credit_score')"
								:isShowLabel="false"
							/>
						</template>
						<el-input v-model="formData.credit_score_source" type="text" :disabled="disabled" name="credit_score_source" />
					</el-form-item>

					<el-form-item class="mb-0 block">
						<template #label>
							<BaseLabel :label="$t('formLabels.report_date')" :tooltip-content="$t('info.report_date')" :isShowLabel="false" />
						</template>
						<el-date-picker
							v-model.trim="formData.credit_score_report_date"
							type="date"
							placeholder="DD/MM/YYYY"
							format="DD/MM/YYYY"
							value-format="YYYY-MM-DD"
							:disabled="disabled"
							name="credit_score_report_date"
							class="block"
						/>
					</el-form-item>

					<el-form-item class="flex-1 mb-0 mandatory" :label="$t('formLabels.ico_number')">
						<template #label>
							<BaseLabel
								:label="$t('formLabels.ico_number')"
								:tooltip-content="$t('info.ico_number')"
								link="https://ico.org.uk/about-the-ico/what-we-do/register-of-fee-payers/#:~:text=If%20you%20don't%20have,recommend%20searching%20using%20your%20postcode"
							/>
						</template>
						<el-input v-model="formData.ico_number" type="text" :disabled="disabled" name="ico_number" @keypress="CharcAndNumber" />
					</el-form-item>

					<custom-input-add-edit
						custom-class=""
						ref="customFieldRef"
						:disabled="disabled"
						:custom-data="customFields"
						module-name="supplier-admin"
						@update-data="(value) => Object.assign(customFields, value)"
					/>
				</div>
				<div class="pt-6 flex justify-end">
					<novok-button type="cyan" class="my-1" @click.prevent="BackClick">
						<i class="fa-regular fa-arrow-left mr-2"></i> {{ $t("buttons.back") }}
					</novok-button>

					<novok-button class="btn-dark my-1" @click.prevent="CancelRedirect('/supplier-admins')"
						><span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span
						><i class="fa-solid fa-xmark sm:hidden"></i
					></novok-button>

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
		</div>
	</el-form>

	<!-- buttons -->
</template>
