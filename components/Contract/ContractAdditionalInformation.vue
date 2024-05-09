<script setup lang="ts">
	import { CurrencyData, PayGroup, paymentTerms, RiskLeval } from "~/helper/data";
	import { required, helpers, requiredIf, email } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	const { getSelectedCountry, getCountry } = useGetSelectedCountry();
	import { contractStore } from "~/store/contract";

	const localePath = useLocalePath();
	const { t } = useI18n();
	const fullscreenLoading = ref(false);
	const loading = ref(false);
	const loadingSave = ref(false);
	const route = useRoute();
	const ContractStore = contractStore();
	const router = useRouter();
	const emit = defineEmits(["active-tab-name", "disable", "disabled"]);

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
		tab_name: "additional-information",
		manage_subcontractor: 0,
		// subcontractors: [""],
		benchmarking_price_review_date: "",
		country_of_service_product_delivery: [],
		location_served: [],
		exit_plan: 0,
		business_continuity_management: 0,
		payment_terms_days: "",
		rebate: 0,
		termination_for_convenience: 0,
		terms_n_conditions: 0,
		is_software_application: 0,
		volume_discount_rebate_collection_date: "",
	});
	const searchValue = ref("");
	const searchStateValue = ref("");
	const countryData = ref<any>([]);
	const subcontractorsCountry = ref<any>([]);
	const stateData = ref<any>([]);
	const inputs = ref<any>([]);
	const customFields = reactive([]);
	const customFieldRef = ref<any>(null);
	const subContractors = ref<any>([
		{
			subcontractor_name: "",
			product_service_country_name: "",
			reg_country_name: "",
		},
	]);

	const selectedCountryData = ref<any>([
		{
			value: "",
			label: "",
		},
	]);

	const selectedCountry2Data = ref<any>([
		{
			value: "",
			label: "",
		},
	]);
	const rules = computed(() => {
		return {
			payment_terms_days: {
				name_validation: {
					$validator: PasteNumberOnly,
					$message: t("copyPasteValidations.number"),
				},
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

	onMounted(async () => {
		await getCountries(searchValue.value);
		await getStates("", "");
	});

	watch(
		() => route,
		(routeValue) => {},
		{ deep: true, immediate: true }
	);

	watch(
		() => props.editData,
		(currData) => {
			if (currData.tab === "additional-information" || currData.tab === "all") {
				v$.value.$reset();
				if (Object.keys(currData || {}).length) {
					Object.keys(formData).forEach((field: any) => {
						if (
							currData?.contract_additional_info?.[field] !== undefined &&
							currData?.contract_additional_info?.[field] !== null
							// && currData?.contract_additional_info?.[field] !== ""
						) {
							formData[field] = currData?.contract_additional_info?.[field] ?? "";
						} else {
							if (field == "location_served" || field == "country_of_service_product_delivery") {
								formData[field] = [];
							} else {
								formData[field] = "";
							}
						}
					});

					getCountries(searchValue.value);

					if (formData.country_of_service_product_delivery) {
						getStates("", "");
					}
				}

				Object.assign(customFields, currData?.custom_additional_informations);

				if (currData?.contract_additional_info?.manage_subcontractor == 1 && currData?.contract_additional_info?.subcontractors?.length > 0) {
					subContractors.value = currData?.contract_additional_info?.subcontractors;
				}
			}
		}
	);

	const selectedCountry = (index: any, key: any) => {
		const selectedData = subContractors.value[index];

		return {
			label: selectedData[key],
			value: selectedData[key],
		};
	};

	const getCountries = async (value: any) => {
		searchValue.value = value;
		try {
			const res: any = await useApiFetch(`/countries?perPage=50&searchValue=${value}`, {
				method: "GET",
			});

			subcontractorsCountry.value = res.data?.data?.map((country: any) => {
				return {
					label: country.name + " " + country.code,
					value: country.id,
				};
			});

			countryData.value = res.data?.data?.map((country: any) => {
				return {
					label: country.name + " " + country.code,
					value: country.name,
				};
			});
		} catch {}
	};

	const getStates = async (country: any, key: any) => {
		// searchValue.value = value;

		const country_name = formData.country_of_service_product_delivery.join(",");
		const countries = country ? country : country_name;

		try {
			const res: any = await useApiFetch(`/states?perPage=50&searchValue=${searchStateValue.value}&countryName=${countries}&page=`, {
				method: "GET",
			});
			stateData.value = res.data?.data?.map((state: any) => {
				return {
					label: state.name,
					value: state.name,
				};
			});
			if (key === "remove") {
				let namesSet = new Set(res.data?.data.map((obj: any) => obj.name));
				formData.location_served = formData.location_served.filter((item: any) => !namesSet.has(item));
			}
		} catch {}
	};

	const remoteStateSearch = (state: any) => {
		searchStateValue.value = state;
		getStates("", "");
	};

	const getCountryData = computed(() => {
		return countryData.value;
	});

	const getSubcontractorCountryData = computed(() => {
		return subcontractorsCountry.value;
	});

	const getStateData = computed(() => {
		return stateData.value;
	});

	const dropdownSelectedState = (value: any) => {
		formData.location_served = value;
	};

	const dropdownSelectedCountries = (value: any) => {
		if (value) {
			formData.country_of_service_product_delivery = value;
			// const country_data = value.join(",");
			getStates("", "");
		}
	};

	const removeDropdownValue = (value: any) => {
		getStates(value, "remove");
	};

	const getSelectedStateData = computed(() => {
		if (formData.location_served) {
			const data = formData.location_served.map((state: any) => {
				return {
					label: state,
					value: state,
				};
			});
			return data;
		}
		return "";
	});

	const getSelectedCountryData = computed(() => {
		if (formData.country_of_service_product_delivery) {
			const data = formData.country_of_service_product_delivery.map((country: any) => {
				return {
					label: country,
					value: country,
				};
			});
			return data;
		}
		return "";
	});

	const dropdownSelectedCountryCode = (value: any) => {
		formData.primary_contact_country_code = value;
	};

	const onSubmit = (value: any) => {
		v$.value.$validate();
		const isValidCustomFields = customFieldRef.value.isValidate();

		if (!v$.value.$error && isValidCustomFields) {
			submitAddData(value);
		}
	};

	const submitAddData = async (value: any) => {
		if (value !== "save") {
			loading.value = true;
		} else {
			loadingSave.value = true;
		}
		try {
			const fd = new FormData();
			Object.keys(formData).forEach((field) => {
				if (field === "location_served") {
					formData.location_served?.forEach((value: any) => {
						fd.append("location_served[]", value);
					});
				} else if (field === "country_of_service_product_delivery") {
					formData.country_of_service_product_delivery?.forEach((value: any) => {
						fd.append("country_of_service_product_delivery[]", value);
					});
				} else {
					fd.append(field, formData?.[field] ?? "");
				}
			});

			let subContractorsCount = 0;
			subContractors.value.forEach((field: any, index: any) => {
				if (field.subcontractor_name || field.product_service_country_name || field.reg_country_name) {
					fd.append(`subcontractor_name[${subContractorsCount}]`, field.subcontractor_name);
					fd.append(`product_service_country_name[${subContractorsCount}]`, field.product_service_country_name ?? "");
					fd.append(`reg_country_name[${subContractorsCount}]`, field.reg_country_name ?? "");
					subContractorsCount++;
				}
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

			const res: any = await useApiFetch(`/contracts/${route.params.id}/additional-information`, {
				method: "POST",
				body: fd,
			});
			emit("disabled", true);

			if (value !== "save") {
				ContractStore.setActiveTab("supporting-documents");
				emit("active-tab-name", "supporting-documents");

				if (route.query.page === "view") {
					navigateTo(
						localePath({
							path: "/contracts/view-contract/" + route?.params?.id,
							query: { tab: "supporting-documents", page: "view" },
						}),
						{ replace: true }
					);
				} else {
					navigateTo(
						localePath({
							path: route.fullPath,
							query: { tab: "supporting-documents" },
						}),
						{ replace: true }
					);
				}
			} else {
				useToast("success", res?.message);
				sessionStorage.setItem("ContractCreateClick", "0");
				if (route.query.page === "view") {
					navigateTo(
						localePath({
							path: "/contracts/view-contract/" + route?.params?.id,
							query: { tab: "additional-information", page: "view" },
						}),
						{ replace: true }
					);
				}
			}
		} catch (error: any) {
			// useToast("error", error.message);
		} finally {
			loading.value = false;
			loadingSave.value = false;
		}
	};

	const addInput = () => {
		if (subContractors.value.length > 0 && subContractors.value.length < 5) {
			subContractors.value.push({
				subcontractor_name: "",
				product_service_country_name: "",
				reg_country_name: "",
			});

			selectedCountryData.value.push({
				value: "",
				label: "",
			});

			selectedCountry2Data.value.push({
				value: "",
				label: "",
			});
		}
	};
	const removeInput = (index: any) => {
		subContractors.value.splice(index, 1);
	};

	const findCountryById = (id: any) => {
		return subcontractorsCountry.value.find((country: any) => country.value == id);
	};

	const handleCountryChange = (value: any, index: any) => {
		const countryObj = findCountryById(value);
		subContractors.value[index].product_service_country_name = countryObj?.label;
	};

	const handleCountry2Change = (value: any, index: any) => {
		const countryObj = findCountryById(value);
		subContractors.value[index].reg_country_name = countryObj?.label;
	};

	const BackClick = () => {
		ContractBackButton("signatory-details");
		emit("active-tab-name", "signatory-details");
	};

	const dropdownSelectedPaymentTerms = (value: any) => {
		formData.payment_terms_days = value;
	};

	const getSelectedPaymentTerms = computed(() => {
		return paymentTerms.find((data: any) => data.value === formData.payment_terms_days);
	});
</script>

<template>
	<el-form class="p-6">
		<div class="grid md:grid-cols-2 lg:grid-cols-6 gap-5 lg:gap-6">
			<!-- <el-form> -->

			<div class="md:col-span-2 lg:col-span-6 gap-4 grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 xxl:grid-cols-5">
				<el-form-item class="lg:col-span-6 mb-0" :label="$t('formLabels.manage_subcontractors')">
					<template #label>
						<BaseLabel :label="$t('formLabels.manage_subcontractors')" :tooltip-content="$t('info.manage_subcontractors')" />
					</template>
					<el-radio-group v-model="formData.manage_subcontractor" :disabled="disabled">
						<el-radio :label="1" size="large">Yes</el-radio>
						<el-radio :label="0" size="large">No</el-radio>
					</el-radio-group>
				</el-form-item>

				<div class="col-span-12" v-if="formData.manage_subcontractor == 1">
					<div v-for="(input, index) in subContractors" :key="index" class="grid xl:grid-cols-[1fr_1fr_1fr_auto] gap-6 content-end mt-4">
						<el-form-item class="mb-0 grid content-end" :label="$t('formLabels.subcontractors')">
							<template #label>
								<BaseLabel :label="$t('formLabels.subcontractor_name')" :tooltip-content="$t('info.subcontractors')" />
							</template>
							<div class="relative w-full">
								<el-input
									type="text"
									label="sub"
									:name="'subContractors' + index"
									v-model="subContractors[index].subcontractor_name"
									:disabled="disabled"
									maxLength="200"
									@keypress="CharcterWithWhitespace"
								/>
							</div>
						</el-form-item>
						<el-form-item class="mb-0 grid content-end">
							<template #label>
								<BaseLabel
									:label="$t('formLabels.product_service_country_id')"
									:tooltip-content="$t('info.product_service_country_id')"
									:isShowLabel="false"
								/>
							</template>
							<BaseSelectDropdown
								:dropdown-option="getSubcontractorCountryData"
								:get-selected-country="selectedCountry(index, 'product_service_country_name')"
								:number-only="false"
								:isRemoteFilter="true"
								:name="'subContractors' + index"
								:clearable="true"
								:disabled="false"
								@remote-search="getCountries"
								@change="handleCountryChange($event, index)"
							/>
						</el-form-item>
						<el-form-item class="mb-0 grid content-end">
							<template #label>
								<BaseLabel
									:label="$t('formLabels.reg_country_id')"
									:tooltip-content="$t('info.reg_country_id')"
									:isShowLabel="false"
								/>
							</template>
							<BaseSelectDropdown
								:dropdown-option="getSubcontractorCountryData"
								:get-selected-country="selectedCountry(index, 'reg_country_name')"
								:number-only="false"
								:isRemoteFilter="true"
								:name="'subContractors' + index"
								:clearable="true"
								:disabled="false"
								@remote-search="getCountries"
								@change="handleCountry2Change($event, index)"
							/>
						</el-form-item>
						<div class="grid content-end">
							<novok-button type="danger" class="flex-none w-10 h-10" @click="removeInput(index)" v-if="subContractors.length > 1">
								<i class="fa-solid fa-xmark"></i>
							</novok-button>
						</div>
					</div>
					<div class="self-end mt-5">
						<novok-button
							:class="disabled ? 'cursor-not-allowed btn-dark' : 'el-button--info'"
							@click="addInput"
							:disabled="subContractors.length >= 5"
							><i class="fa-solid fa-plus mr-2"></i> ADD</novok-button
						>
					</div>
				</div>
			</div>

			<el-form-item class="lg:col-span-3 mb-0" :label="$t('formLabels.country_of_service_product_delivery')">
				<template #label>
					<BaseLabel
						:label="$t('formLabels.country_of_service_product_delivery')"
						:tooltip-content="$t('info.country_of_service_product_delivery')"
					/>
				</template>
				<BaseMultiSelectDropdown
					:disabled="disabled"
					size="small"
					name="country_of_service_product_delivery"
					:dropdown-option="getCountryData"
					:get-selected-client="getSelectedCountryData"
					:collapse-tag="false"
					@remote-search="getCountries"
					@selected-value="dropdownSelectedCountries"
					@remove-tag="removeDropdownValue"
				/>
			</el-form-item>

			<el-form-item class="lg:col-span-3 mb-0" :label="$t('formLabels.benchmarking_price_review_date')">
				<template #label>
					<BaseLabel
						:label="$t('formLabels.benchmarking_price_review_date')"
						:tooltip-content="$t('info.benchmarking_price_review_date')"
					/>
				</template>
				<el-date-picker
					v-model.trim="formData.benchmarking_price_review_date"
					type="date"
					placeholder="DD/MM/YYYY"
					format="DD/MM/YYYY"
					value-format="YYYY-MM-DD"
					name="benchmarking_price_review_date"
					:disabled="disabled"
				/>
			</el-form-item>

			<el-form-item class="lg:col-span-3 mb-0" :label="$t('formLabels.location_served')">
				<template #label>
					<BaseLabel :label="$t('formLabels.location_served')" :tooltip-content="$t('info.location_served')" :isShowLabel="false" />
				</template>
				<BaseMultiSelectDropdown
					:disabled="disabled"
					size="small"
					name="location_served"
					:dropdown-option="getStateData"
					:get-selected-client="getSelectedStateData"
					:collapse-tag="false"
					@remote-search="remoteStateSearch"
					@selected-value="dropdownSelectedState"
				/>
			</el-form-item>

			<el-form-item class="lg:col-span-3 mb-0" :label="$t('formLabels.exit_plan')">
				<template #label>
					<BaseLabel :label="$t('formLabels.exit_plan')" :tooltip-content="$t('info.exit_plan')" />
				</template>
				<el-radio-group v-model="formData.exit_plan" :disabled="disabled">
					<el-radio :label="1" size="large">Yes</el-radio>
					<el-radio :label="0" size="large">No</el-radio>
				</el-radio-group>
			</el-form-item>

			<el-form-item class="lg:col-span-3 mb-0" :label="$t('formLabels.business_continuity_management')">
				<template #label>
					<BaseLabel
						:label="$t('formLabels.business_continuity_management')"
						:tooltip-content="$t('info.business_continuity_management')"
					/>
				</template>
				<el-radio-group v-model="formData.business_continuity_management" :disabled="disabled">
					<el-radio :label="1" size="large">Yes</el-radio>
					<el-radio :label="0" size="large">No</el-radio>
				</el-radio-group>
			</el-form-item>

			<el-form-item class="lg:col-span-3 mb-0" :label="$t('formLabels.payment_terms_days')">
				<template #label>
					<BaseLabel :label="$t('formLabels.payment_terms_days')" :tooltip-content="$t('info.payment_terms_days')" :isShowLabel="false" />
				</template>
				<BaseSelectDropdown
					v-model="formData.payment_terms_days"
					:dropdown-option="paymentTerms"
					:get-selected-country="getSelectedPaymentTerms"
					:number-only="false"
					name="payment_terms_days"
					:clearable="true"
					:disabled="false"
					@selected-value="dropdownSelectedPaymentTerms"
					@change="v$.payment_terms_days.$touch"
				/>
				<span v-if="v$.payment_terms_days.$error" class="text-xs text-red-500 mt-2">{{ v$.payment_terms_days.$errors[0].$message }}</span>
			</el-form-item>

			<el-form-item class="lg:col-span-3 mb-0" :label="$t('formLabels.rebate')">
				<template #label>
					<BaseLabel :label="$t('formLabels.rebate')" :tooltip-content="$t('info.rebate')" />
				</template>
				<el-radio-group v-model="formData.rebate" :disabled="disabled">
					<el-radio :label="1" size="large">Yes</el-radio>
					<el-radio :label="0" size="large">No</el-radio>
				</el-radio-group>
			</el-form-item>

			<el-form-item class="lg:col-span-3 mb-0" :label="$t('formLabels.volume_discount_rebate_collection_date')" v-if="formData.rebate == 1">
				<template #label>
					<BaseLabel
						:label="$t('formLabels.volume_discount_rebate_collection_date')"
						:tooltip-content="$t('info.volume_discount_rebate_collection_date')"
					/>
				</template>
				<el-date-picker
					v-model="formData.volume_discount_rebate_collection_date"
					type="date"
					placeholder="DD/MM/YYYY"
					format="DD/MM/YYYY"
					value-format="YYYY-MM-DD"
					:disabled="disabled"
					class="w-full"
				/>
			</el-form-item>

			<el-form-item class="lg:col-span-3 mb-0" :label="$t('formLabels.termination_for_convenience')">
				<template #label>
					<BaseLabel :label="$t('formLabels.termination_for_convenience')" :tooltip-content="$t('info.termination_for_convenience')" />
				</template>
				<el-radio-group v-model="formData.termination_for_convenience" :disabled="disabled">
					<el-radio :label="1" size="large">Yes</el-radio>
					<el-radio :label="0" size="large">No</el-radio>
				</el-radio-group>
			</el-form-item>

			<el-form-item class="lg:col-span-3 mb-0" :label="$t('formLabels.terms_n_conditions')">
				<template #label>
					<BaseLabel :label="$t('formLabels.terms_n_conditions')" :tooltip-content="$t('info.terms_n_conditions')" />
				</template>
				<el-radio-group v-model="formData.terms_n_conditions" :disabled="disabled">
					<el-radio :label="1" size="large">Yes</el-radio>
					<el-radio :label="0" size="large">No</el-radio>
				</el-radio-group>
			</el-form-item>

			<el-form-item class="lg:col-span-3 mb-0" :label="$t('formLabels.is_software_application')">
				<template #label>
					<BaseLabel
						:label="$t('formLabels.is_software_application')"
						:tooltip-content="$t('info.is_software_application')"
						:isShowLabel="false"
					/>
				</template>
				<el-radio-group v-model="formData.is_software_application" :disabled="disabled">
					<el-radio :label="1" size="large">Yes</el-radio>
					<el-radio :label="0" size="large">No</el-radio>
				</el-radio-group>
			</el-form-item>

			<custom-input-add-edit
				ref="customFieldRef"
				:custom-data="customFields"
				module-name="contract"
				:disabled="disabled"
				custom-class="lg:col-span-3 mb-0"
				@update-data="(value) => Object.assign(customFields, value)"
			/>
			<!-- </el-form> -->
		</div>

		<!-- buttons -->
		<div class="pt-4 text-right">
			<novok-button type="cyan" @click.prevent="BackClick">
				<i class="fa-regular fa-arrow-left mr-2"></i> {{ $t("buttons.back") }}
			</novok-button>

			<novok-button class="btn-dark my-1" @click.prevent="router.push(localePath('/contracts'))"
				><span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span
				><i class="fa-solid fa-xmark sm:hidden"></i
			></novok-button>

			<novok-button v-if="!disabled" class="my-1" type="info" :loading="loading" :disabled="loading" @click.prevent="onSubmit('save&next')"
				>{{ $t("buttons.save&next") }}
			</novok-button>

			<novok-button v-if="!disabled" class="my-1" type="info" :loading="loadingSave" :disabled="loadingSave" @click.prevent="onSubmit('save')"
				>{{ $t("buttons.save") }}
			</novok-button>
		</div>
	</el-form>
</template>
