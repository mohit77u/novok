<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
	import { ref } from "vue";
	import { filterData, ContractStatusData, CurrencyData, ContractData, ContractTermType, ContractExpiringDays, months } from "~/helper/data";
	import moment from "moment";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";

	const localePath = useLocalePath();
	const drawer2 = ref(false);
	const filteredData = reactive<any>({
		currentPage: 1,
		perPage: 10,
		searchValue: "",
		sortOrder: "",
		sortColumn: "",
		formDetails: "",
		id: 0,
		contractStartDate: "",
		contractEndDate: "",
		contractOwner: "",
		supplierLead: "",
		contractStatus: "",
		currency: "",
		contractType: "",
		category: "",
		contractValidation: "",
		contractTermType: "",
		noticeDueIntervals: "",
		expiringDays: "",
		myContracts: 0,
		contractValueStartFrom: "",
		contractValueStartTo: "",
		signingEntity: "",
	});
	const props = defineProps({
		resetFilter: {
			type: Boolean,
			default: false,
		},
	});

	const clientManagers = ref<any>([]);
	const searchValue = ref<any>("");
	const supplierLeads = ref<any>([]);
	const categories = ref<any>([]);
	const showError = ref(false);
	const validationFilter = [
		{
			label: "All",
			value: "",
		},
		{
			label: "Yes",
			value: 1,
		},
		{
			label: "No",
			value: 0,
		},
	];

	const emit = defineEmits(["filter-data-type"]);
	const route = useRoute();
	const isFilterApplied = ref(false);
	const noticeFilterDropdownValues = ref<any>([]);
	const subEntityData = ref<any>([]);
	const isLoading = ref(true);

	watch(
		() => props.resetFilter,
		(currData) => {
			Object.keys(filteredData).forEach((field: any) => {
				filteredData[field] = "";
			});
		},
		{ deep: true }
	);
	onMounted(async () => {
		const pageDetails = JSON.parse(sessionStorage.getItem("pageDetails") || " {}");
		Object.keys(filteredData).forEach((field: any) => {
			filteredData[field] = pageDetails[field] || "";
			filteredData["contractValidation"] = pageDetails.contractValidation === "" ? "" : pageDetails.contractValidation;
			filteredData["currentPage"] = +pageDetails.currentPage || 1;
			filteredData["perPage"] = +pageDetails.perPage || 10;
		});
	});

	const fetchData = async () => {
		isLoading.value = true;
		await getClientManagers(searchValue.value);
		await getSupplierLeads(searchValue.value);
		await primaryCategory(searchValue.value);
		await getSubEntityData(searchValue.value);
		noticeFilterDropdowns();
	};

	const confirmClick = () => {
		if (!showError.value) {
			filteredData.id = "";
			filteredData.searchValue = "";
			emit("filter-data-type", filteredData);
			drawer2.value = false;
			isFilterApplied.value = true;
		}
	};

	const noticeFilterDropdowns: any = () => {
		// Set the date to the next month
		const nextMonth = moment().clone().add(1, "month");

		// Initialize an array to store the months and years
		const monthsAndYears: any = [];

		// Loop to get the next 12 months
		for (let i = 0; i < 6; i++) {
			// Get the month and year
			const value = nextMonth.format("YYYY-MM");

			const [year, month] = value.split("-");
			// Add to the array
			monthsAndYears.push({
				label: months[month] + " " + year,
				value: value,
			});

			// Move to the next month
			nextMonth.add(1, "month");
		}

		noticeFilterDropdownValues.value = monthsAndYears;
	};

	const dropdownSelectedFilterFieldValue = (value: any) => {
		filteredData.formDetails = value;
	};

	const getSelectedTitle = computed(() => {
		return filterData.find((data) => +data.value === filteredData.formDetails);
	});

	const clearFilter = () => {
		Object.keys(filteredData).forEach((field: any) => {
			filteredData[field] = "";
			filteredData["currentPage"] = 1;
			filteredData["perPage"] = 10;
		});
		emit("filter-data-type", filteredData);
		drawer2.value = false;
		isFilterApplied.value = false;
	};

	const disabledDate = (date: any) => {
		const curretDate = moment(date).format();
		const newDate = filteredData.contractStartDate ? moment(filteredData.contractStartDate)?.format() : "";

		if (curretDate < newDate) {
			return true;
		} else {
			return false;
		}
	};

	const disabledStartDate = (date: any) => {
		const curretDate = moment(date).format();
		const newDate = filteredData.contractEndDate ? moment(filteredData.contractEndDate.contract_end_date)?.format() : "";
		if (filteredData.contractEndDate) {
			if (curretDate < newDate) {
				return false;
			} else {
				return true;
			}
		} else {
			return false;
		}
	};

	const dropdownSelectedManagerValue = (value: any) => {
		filteredData.contractOwner = value;
	};

	const dropdownSelectedSupplierLead = (value: any) => {
		filteredData.supplierLead = value;
	};

	const dropdownSelectedStatus = (value: any) => {
		filteredData.contractStatus = value;
	};
	const dropdownSelectedCurrency = (value: any) => {
		filteredData.currency = value;
	};
	const dropdownSelectedContractType = (value: any) => {
		filteredData.contractType = value;
	};
	const dropdownSelectedCategory = (value: any) => {
		filteredData.category = value;
	};
	const dropdownSelectedContractTermType = (value: any) => {
		filteredData.contractTermType = value;
	};
	const dropdownSelectedFilterContractValidation = (value: any) => {
		filteredData.contractValidation = value;
	};
	const dropdownSelectedNoticePeriodValue = (value: any) => {
		filteredData.noticeDueIntervals = value;
	};

	const dropdownSelectedExpiringDaysValue = (value: any) => {
		filteredData.expiringDays = value;
	};

	const dropdownSelectedSigningEntity = (value: any) => {
		filteredData.signingEntity = value;
	};

	const getSelectedSigningEntity = computed(() => {
		return subEntityData.value.find((data: any) => data.value == filteredData.signingEntity);
	});

	const getSelectedNoticePeriod = computed(() => {
		return noticeFilterDropdownValues.value.find((data: any) => data.value == filteredData.noticeDueIntervals);
	});

	const getSelectedExpiringDays = computed(() => {
		return ContractExpiringDays.find((data: any) => data.value == filteredData.expiringDays);
	});

	const getSelectedMangers = computed(() => {
		return clientManagers.value.find((data: any) => data.value === +filteredData.contractOwner);
	});

	const getSelectedSupplierLead = computed(() => {
		return supplierLeads.value.find((data: any) => data.value === +filteredData.supplierLead);
	});

	const getSelectedStatus = computed(() => {
		return ContractStatusData.find((data: any) => data.value === +filteredData.contractStatus);
	});

	const getSelectedCurrency = computed(() => {
		return CurrencyData.find((data: any) => data.value === filteredData.currency);
	});

	const getSelectedContractTermType = computed(() => {
		return ContractTermType.find((data: any) => data.value === filteredData.contractTermType);
	});

	const getContractValidation = computed(() => {
		return validationFilter.find((data: any) => data.value === filteredData.contractValidation);
	});

	const getSelectedContractType = computed(() => {
		return ContractData.find((data: any) => data.value === +filteredData.contractType);
	});

	const getSelectedCategory = computed(() => {
		return categories.value.find((data: any) => data.value === +filteredData.category);
	});

	const getClientManagers = async (value: any) => {
		try {
			searchValue.value = value;
			const client_admin_id = sessionStorage.getItem("client_admin_id");
			const res: any = await useApiFetch(`/contract-owners?perPage=${15}&searchValue=${value}&parent_id=${client_admin_id}`, {
				method: "GET",
			});

			clientManagers.value = res.data?.map((data: any) => {
				return {
					label: data.full_name + "(" + data.email + ")",
					value: data.id,
				};
			});
		} catch {}
	};

	const getSupplierLeads = async (value: any) => {
		try {
			searchValue.value = value;
			const res: any = await useApiFetch(`/suppliers?searchValue=${value}`, {
				method: "GET",
			});

			supplierLeads.value = res.data?.map((data: any) => {
				return {
					label: data.full_name + "(" + data.company_name + ")",
					value: data.id,
				};
			});
		} catch {}
	};

	const getSubEntityData = async (value: any) => {
		searchValue.value = value;
		try {
			const res: any = await useApiFetch(`/contract-ms/signing-entities?perPage=20&sortColumn=&sortOrder=&searchValue=${searchValue.value}`, {
				method: "GET",
			});

			subEntityData.value = res.data?.map((data: any) => {
				return {
					label: data.sub_entity_name,
					value: data.id,
				};
			});
		} catch {
		} finally {
			isLoading.value = false;
		}
	};

	const primaryCategory = async (value: any) => {
		try {
			const res: any = await useApiFetch(`/categories?parent_id=0&perPage=15&searchValue=${value}`, {
				method: "GET",
			});

			categories.value = res.data?.data.map((category: any) => {
				return {
					label: category.category_name,
					value: category.id,
				};
			});
		} catch (error) {}
	};

	const getfilterData = computed(() => {
		if (
			filteredData.contractOwner !== "" ||
			filteredData.contractStartDate !== "" ||
			filteredData.contractEndDate !== "" ||
			filteredData.supplierLead !== "" ||
			filteredData.contractStatus ||
			filteredData.currency !== "" ||
			filteredData.contractType !== "" ||
			filteredData.contractTermType !== "" ||
			filteredData.category !== "" ||
			filteredData.contractValidation !== "" ||
			filteredData.formDetails !== "" ||
			filteredData.contractValueStartFrom !== "" ||
			filteredData.contractValueStartTo !== "" ||
			filteredData.noticeDueIntervals !== "" ||
			filteredData.expiringDays !== "" ||
			filteredData.signingEntity !== ""
		) {
			return true;
		} else {
			return false;
		}
	});

	const dateChange = () => {
		if (filteredData.contractStartDate == null) {
			filteredData.contractStartDate = "";
		}
		if (filteredData.contractEndDate == null) {
			filteredData.contractEndDate = "";
		}
	};
	const contractToChange = (value: any) => {
		if (value < filteredData.contractValueStartFrom) {
			showError.value = true;
		} else {
			showError.value = false;
		}
	};
	const filterClick = async () => {
		drawer2.value = true;
		showError.value = false;
		const pageDetails = JSON.parse(sessionStorage.getItem("pageDetails") || " {}");
		Object.keys(filteredData).forEach((field: any) => {
			filteredData[field] = pageDetails[field] || "";
			filteredData["currentPage"] = +pageDetails.currentPage || 1;
			filteredData["perPage"] = +pageDetails.perPage || 10;
			filteredData["contractTermType"] = pageDetails.contractTermType === 0 ? 0 : pageDetails.contractTermType === 1 ? 1 : "";
			filteredData["contractValidation"] = pageDetails.contractValidation === 0 ? 0 : pageDetails.contractValidation === 1 ? 1 : "";
		});
		await fetchData();
	};

	const closeClick = (close: any) => {
		close();
		isFilterApplied.value = false;
	};
</script>

<template>
	<div>
		<el-tooltip placement="top" :content="$t('formLabels.filter')">
			<novok-button class="btn-icon relative m-0 flex-none" type="info" @click="filterClick">
				<label v-if="getfilterData" class="w-2 h-2 rounded-full bg-red-500 absolute -right-1 -top-1"></label>
				<i class="fa-solid fa-filter"></i>
			</novok-button>
		</el-tooltip>
		<el-form>
			<el-drawer v-model="drawer2" direction="rtl" :show-close="false">
				<template #header="{ close, titleId }">
					<div class="bg-primary flex justify-between p-4">
						<h4 :id="titleId" class="text-white font-semibold text-2xl">{{ $t("formLabels.filter") }}</h4>
						<div class="bg-[#fff]/10 text-white w-8 h-8 flex items-center justify-center rounded-full cursor-pointer">
							<i class="fa-solid fa-xmark" @click="closeClick(close)"></i>
						</div>
					</div>
				</template>
				<template #default>
					<el-skeleton :loading="isLoading" class="grid grid-flow-row gap-4 px-4 mt-4">
						<template #template>
							<el-skeleton-item variant="row" style="height: 40px" />
							<el-skeleton-item variant="row" style="height: 40px" />
							<el-skeleton-item variant="row" style="height: 40px" />
							<el-skeleton-item variant="row" style="height: 40px" />
							<el-skeleton-item variant="row" style="height: 40px" />
							<el-skeleton-item variant="row" style="height: 40px" />
							<el-skeleton-item variant="row" style="height: 40px" />
							<el-skeleton-item variant="row" style="height: 40px" />
							<el-skeleton-item variant="row" style="height: 40px" />
							<el-skeleton-item variant="row" style="height: 40px" />
							<el-skeleton-item variant="row" style="height: 40px" />
							<el-skeleton-item variant="row" style="height: 40px" />
						</template>
					</el-skeleton>
					<!--missing field -->
					<div v-if="!isLoading" class="grid gap-5">
						<el-form-item class="mb-0" :label="$t('formLabels.form_details')">
							<BaseSelectDropdown
								placeholder="Search data type"
								:dropdown-option="filterData"
								:get-selected-country="getSelectedTitle"
								:number-only="false"
								@selected-value="dropdownSelectedFilterFieldValue"
							/>
						</el-form-item>
						<el-form-item class="mb-0" :label="$t('formLabels.contract_start_date')">
							<el-date-picker
								v-model="filteredData.contractStartDate"
								type="date"
								placeholder="DD/MM/YYYY"
								format="DD/MM/YYYY"
								value-format="YYYY-MM-DD"
								:disabled-date="disabledStartDate"
								@change="dateChange"
							/>
						</el-form-item>
						<el-form-item class="mb-0" :label="$t('formLabels.contract_end_date')">
							<el-date-picker
								v-model="filteredData.contractEndDate"
								type="date"
								placeholder="DD/MM/YYYY"
								format="DD/MM/YYYY"
								value-format="YYYY-MM-DD"
								:disabled-date="disabledDate"
								@change="dateChange"
							/>
						</el-form-item>
						<el-form-item class="mb-0" :label="$t('formLabels.contract_owner')">
							<BaseSelectDropdown
								:dropdown-option="clientManagers"
								:get-selected-country="getSelectedMangers"
								:number-only="false"
								name="contractOwner"
								:clearable="true"
								:isRemoteFilter="true"
								@remote-search="getClientManagers"
								@selected-value="dropdownSelectedManagerValue"
							/>
						</el-form-item>
						<el-form-item class="mb-0" :label="$t('formLabels.signing_entity')">
							<BaseSelectDropdown
								:dropdown-option="subEntityData"
								:get-selected-country="getSelectedSigningEntity"
								:number-only="false"
								name="signing_entity"
								:clearable="true"
								:isRemoteFilter="true"
								@remote-search="getClientManagers"
								@selected-value="dropdownSelectedSigningEntity"
							/>
						</el-form-item>
						<el-form-item class="mb-0" :label="$t('formLabels.supplier_lead_name')">
							<BaseSelectDropdown
								:dropdown-option="supplierLeads"
								:get-selected-country="getSelectedSupplierLead"
								:number-only="false"
								name="supplierLead"
								:clearable="true"
								:isRemoteFilter="true"
								@remote-search="getSupplierLeads"
								@selected-value="dropdownSelectedSupplierLead"
							/>
						</el-form-item>
						<el-form-item class="mb-0" :label="$t('formLabels.Status')">
							<BaseSelectDropdown
								:dropdown-option="ContractStatusData"
								:get-selected-country="getSelectedStatus"
								name="status"
								:number-only="false"
								:clearable="true"
								@selected-value="dropdownSelectedStatus"
							/>
						</el-form-item>
						<el-form-item class="mb-0" :label="$t('formLabels.currency')">
							<BaseSelectDropdown
								:dropdown-option="CurrencyData"
								:get-selected-country="getSelectedCurrency"
								name="currency"
								:clearable="true"
								@selected-value="dropdownSelectedCurrency"
							/>
						</el-form-item>
						<el-form-item class="mb-0" :label="$t('formLabels.contract_type')">
							<BaseSelectDropdown
								:dropdown-option="ContractData"
								:get-selected-country="getSelectedContractType"
								name="currency"
								:number-only="false"
								:clearable="true"
								@selected-value="dropdownSelectedContractType"
							/>
						</el-form-item>
						<el-form-item class="mb-0" :label="$t('formLabels.category_level_1')">
							<BaseSelectDropdown
								:dropdown-option="categories"
								:get-selected-country="getSelectedCategory"
								name="category"
								:number-only="false"
								:clearable="true"
								:isRemoteFilter="true"
								@remote-search="primaryCategory"
								@selected-value="dropdownSelectedCategory"
							/>
						</el-form-item>
						<el-form-item class="mb-0" :label="$t('formLabels.contract_term_type')">
							<BaseSelectDropdown
								:dropdown-option="ContractTermType"
								:get-selected-country="getSelectedContractTermType"
								name="ContractTermType"
								:number-only="false"
								:clearable="true"
								@selected-value="dropdownSelectedContractTermType"
							/>
						</el-form-item>

						<el-form-item class="mb-0 flex-1" :label="$t('formLabels.contract_value_from')">
							<el-input
								v-model.trim="filteredData.contractValueStartFrom"
								type="number"
								name="contractValueStartFrom"
								min="0"
								@keypress="NumbersOnly"
							/>
						</el-form-item>

						<el-form-item class="mb-0 flex-1" :label="$t('formLabels.contract_value_to')">
							<el-input
								v-model.trim="filteredData.contractValueStartTo"
								type="number"
								name="contractValueStartTo"
								min="0"
								@change="contractToChange"
								@keypress="NumbersOnly"
							/>
						</el-form-item>
						<span v-if="showError" class="text-danger">{{ "Please enter value greater than the contract from value" }}</span>

						<div class="">
							<label class="text-dark font-bold mr-4 my-2 block">{{ $t("formLabels.validation") }} </label>
							<BaseSelectDropdown
								:dropdown-option="validationFilter"
								:get-selected-country="getContractValidation"
								:number-only="false"
								@selected-value="dropdownSelectedFilterContractValidation"
							/>
						</div>

						<el-form-item class="mb-0" :label="$t('formLabels.contract_expiring_days')">
							<BaseSelectDropdown
								:dropdown-option="ContractExpiringDays"
								:get-selected-country="getSelectedExpiringDays"
								name="ContractExpiringDays"
								:number-only="false"
								:clearable="true"
								@selected-value="dropdownSelectedExpiringDaysValue"
							/>
						</el-form-item>

						<el-form-item class="mb-0" :label="$t('formLabels.notice_due')">
							<BaseSelectDropdown
								:dropdown-option="noticeFilterDropdownValues"
								:get-selected-country="getSelectedNoticePeriod"
								name="NoticePeriodInterval"
								:number-only="false"
								:clearable="true"
								@selected-value="dropdownSelectedNoticePeriodValue"
							/>
						</el-form-item>
					</div>
				</template>
				<template #footer>
					<div class="grid grid-flow-col justify-end gap-4">
						<div>
							<novok-button class="btn-dark" @click="clearFilter">{{ $t("buttons.clear_all") }}</novok-button>
						</div>
						<novok-button type="info" @click="confirmClick">{{ $t("buttons.apply") }}</novok-button>
					</div>
				</template>
			</el-drawer>
		</el-form>
	</div>
</template>
<style>
	/* @import "~/assets/css/main.css"; */
</style>
