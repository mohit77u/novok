<script setup lang="ts">
	import { ref } from "vue";
	import moment from "moment";
	import { CurrencyData, SupplierStatus, keySupplierOptions } from "~/helper/data";

	const drawer2 = ref(false);
	const emit = defineEmits(["start-date", "end-date", "filterData"]);
	const route = useRoute();

	const filterData = reactive<any>({
		currency: [],
		category: "",
		country: "",
		status: "",
		key_supplier: "",
	});
	const countryData = ref<any>([]);
	const searchValue = ref("");
	const selectedCountry = ref("");
	const categories = ref<any>([]);
	const selectedCurrency = ref<any>([]);
	const selectedStatusArr = ref<any>([]);
	const isLoading = ref(true);

	const props = defineProps({
		resetFilter: {
			type: Boolean,
			default: false,
		},
	});

	watch(
		() => props.resetFilter,
		(currData) => {
			Object.keys(filterData).forEach((field: any) => {
				filterData[field] = "";
			});

			selectedStatusArr.value = [];
		},
		{ deep: true }
	);

	onMounted(async () => {
		filterData.currency = route.query.currency ? route.query.currency : "";
		filterData.category = route.query.category ? parseInt(route.query.category) : "";
		filterData.country = route.query.country ? route.query.country : "";
		filterData.status = route.query.status ? route.query.status : "";
		filterData.key_supplier = route.query.key_supplier ? route.query.key_supplier : "";

		if (Array.isArray(route.query.status)) {
			selectedStatusArr.value = route.query.status?.map((name: any) => {
				return {
					label: name,
					value: parseInt(name),
				};
			});
		} else {
			if (route.query.status) {
				selectedStatusArr.value = [
					{
						label: route.query.status,
						value: parseInt(route.query.status),
					},
				];
			}
		}

		if (Array.isArray(route.query.currency)) {
			selectedCurrency.value = route.query.currency?.map((name: any) => {
				return {
					label: name,
					value: name,
				};
			});
		} else {
			if (route.query.currency) {
				selectedCurrency.value = [
					{
						label: route.query.currency,
						value: route.query.currency,
					},
				];
			}
		}
		selectedCountry.value = route.query.country ? route.query.country : "";
	});

	const fetchData = async () => {
		isLoading.value = true;
		selectedCountry.value = route.query.country ? route.query.country : "";
		await getCountries(searchValue.value);
		await getCategories();
		if (filterData.category) {
			dropdownSelectedCategory(filterData.category);
		}
	};

	const confirmClick = () => {
		emit("filterData", filterData);
		drawer2.value = false;
	};

	const clearFilter = () => {
		Object.keys(filterData).forEach((field: any) => {
			filterData[field] = "";
		});

		selectedStatusArr.value = [];

		emit("filterData", filterData);
		drawer2.value = false;
	};

	const getfilterData = computed(() => {
		if (filterData.currency?.length || filterData.country || filterData.category || filterData.status || filterData.key_supplier) {
			return true;
		} else {
			return false;
		}
	});

	const dropdownSelectedCurrencyValue = (value: any) => {
		filterData.currency = value;
	};

	const getSelectedCurrencyData = computed(() => {
		return selectedCurrency.value;
		// return CurrencyData.find((data) => data.value === filterData.currency);
	});

	const getCountries = async (value: any) => {
		searchValue.value = value;
		try {
			const res: any = await useApiFetch(`/countries?perPage=50&searchValue=${value}`, {
				method: "GET",
			});

			countryData.value = res.data?.data?.map((country: any) => {
				return {
					label: country.name,
					value: country.name,
				};
			});
		} catch {}
	};

	const getCountryData = computed(() => {
		return countryData.value;
	});

	const selectedStatus = (value: any) => {
		filterData.status = value;
	};

	const getSelectedStatus = computed(() => {
		return selectedStatusArr.value;
	});

	const selectedKeySupplier = (value: any) => {
		filterData.key_supplier = value;
	};

	const getSelectedkeySupplier = computed(() => {
		return keySupplierOptions.find((data) => data.value == parseInt(filterData.key_supplier));
	});

	const getCategories = async () => {
		try {
			const res: any = await useApiFetch(`/categories?perPage=15&sortColumn=&sortOrder=&searchValue=${searchValue.value}&parent_id=0`, {
				method: "GET",
			});
			categories.value = res.data?.data?.map((data: any) => {
				return {
					label: data.category_name,
					value: data.id,
				};
			});
		} catch {
		} finally {
			isLoading.value = false;
		}
	};

	const dropdownSelectedCategory = (value: any) => {
		filterData.category = value;
	};

	const getSelectedCategory = computed(() => {
		return categories.value.map((data: any) => data.id === filterData.category);
	});

	const categoryDropdownSearch = (value: any) => {
		searchValue.value = value;
		if (searchValue) {
			getCategories();
		}
	};

	const filterClick = async () => {
		drawer2.value = true;
		await fetchData();
	};
</script>

<template>
	<el-tooltip :content="$t('formLabels.filter')" placement="top">
		<novok-button class="btn-icon relative" type="info" @click="filterClick">
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
						<i class="fa-solid fa-xmark" @click="close"></i>
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
					</template>
				</el-skeleton>
				<div class="grid gap-5" v-if="!isLoading">
					<!-- <el-form-item class="lg:col-span-3 mb-0" :label="$t('formLabels.currency')">
						<BaseMultiSelectDropdown
							name="currency"
							:dropdown-option="CurrencyData"
							:get-selected-client="getSelectedCurrencyData"
							:number-only="false"
							:disabled="disabled"
							:clearable="true"
							@selected-value="dropdownSelectedCurrencyValue"
						/>
					</el-form-item> -->

					<el-form-item :label="$t('formLabels.category_level_1')" class="lg:col-span-3 mb-0">
						<BaseSelectDropdown
							v-model="filterData.category"
							:dropdown-option="categories"
							:get-selected-country="getSelectedCategory"
							:number-only="false"
							:isRemoteFilter="true"
							:clearable="true"
							:name="'category'"
							@selected-value="dropdownSelectedCategory"
							@remote-search="categoryDropdownSearch"
						/>
					</el-form-item>

					<el-form-item class="lg:col-span-3 mb-0" :label="$t('formLabels.country')">
						<BaseSelectDropdown
							v-model="filterData.country"
							size="small"
							name="country"
							:number-only="false"
							:clearable="true"
							:isRemoteFilter="true"
							:dropdown-option="getCountryData"
							@remote-search="getCountries"
						/>
					</el-form-item>

					<el-form-item class="lg:col-span-3 mb-0" :label="$t('formLabels.Status')">
						<BaseMultiSelectDropdown
							size="small"
							name="status"
							:number-only="false"
							:clearable="true"
							:dropdown-option="SupplierStatus"
							:get-selected-client="getSelectedStatus"
							@selected-value="selectedStatus"
						/>
					</el-form-item>

					<el-form-item class="lg:col-span-3 mb-0" :label="$t('formLabels.is_key_supplier')">
						<BaseSelectDropdown
							size="small"
							name="key_supplier"
							:number-only="false"
							:clearable="true"
							:dropdown-option="keySupplierOptions"
							:get-selected-country="getSelectedkeySupplier"
							@selected-value="selectedKeySupplier"
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
</template>
<style>
	/* @import "~/assets/css/main.css"; */
</style>
