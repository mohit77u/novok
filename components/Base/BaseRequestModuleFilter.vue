<script setup lang="ts">
	import { ref } from "vue";
	import moment from "moment";
	import { requestType, requestStatus } from "~/helper/data";

	const drawer2 = ref(false);
	const emit = defineEmits(["start-date", "end-date", "filterData"]);
	const route = useRoute();
	const subEntityData = ref<any>([]);
	const searchValue = ref<any>("");
	const isLoading = ref(true);

	const filterData = reactive<any>({
		requestType: "",
		status: "",
		signingEntity: "",
	});

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
		},
		{ deep: true }
	);

	onMounted(async () => {
		filterData.requestType = route.query.requestType ? route.query.requestType : "";
		filterData.status = route.query.requestStatus ? route.query.requestStatus : "";
		filterData.signingEntity = route.query.signingEntity ? route.query.signingEntity : "";
	});

	const fetchData = async () => {
		isLoading.value = true;
		await getSubEntityData(searchValue.value);
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

	const confirmClick = () => {
		emit("filterData", filterData);
		drawer2.value = false;
	};

	const clearFilter = () => {
		Object.keys(filterData).forEach((field: any) => {
			filterData[field] = "";
		});

		emit("filterData", filterData);
		drawer2.value = false;
	};

	const getfilterData = computed(() => {
		if (filterData.requestType || filterData.status || filterData.signingEntity) {
			return true;
		} else {
			return false;
		}
	});

	const dropdownSelectedRequestType = (value: any) => {
		filterData.requestType = value;
	};

	const getSelectedRequestType = computed(() => {
		return requestType.find((data) => data.value == filterData.requestType);
	});

	const dropdownSelectedRequestStatus = (value: any) => {
		filterData.status = value;
	};

	const getSelectedRequestStatus = computed(() => {
		return requestStatus.find((data) => data.value == filterData.status);
	});

	const dropdownSelectedSubEntity = (value: any) => {
		filterData.signingEntity = value;
	};

	const getSelectedSubEntity = computed(() => {
		return subEntityData.value.find((data: any) => data.value == filterData.signingEntity);
	});

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
					</template>
				</el-skeleton>
				<div v-if="!isLoading" class="grid gap-5">
					<el-form-item :label="$t('formLabels.request_type')" class="lg:col-span-3 mb-0">
						<BaseSelectDropdown
							:dropdown-option="requestType"
							:get-selected-country="getSelectedRequestType"
							:number-only="false"
							:clearable="true"
							:name="'requestType'"
							@selected-value="dropdownSelectedRequestType"
						/>
					</el-form-item>

					<el-form-item :label="$t('formLabels.Status')" class="lg:col-span-3 mb-0">
						<BaseSelectDropdown
							:dropdown-option="requestStatus"
							:get-selected-country="getSelectedRequestStatus"
							:number-only="false"
							:clearable="true"
							:name="'requestType'"
							@selected-value="dropdownSelectedRequestStatus"
						/>
					</el-form-item>

					<el-form-item :label="$t('formLabels.signing_entity')" class="lg:col-span-3 mb-0">
						<BaseSelectDropdown
							:dropdown-option="subEntityData"
							:get-selected-country="getSelectedSubEntity"
							:number-only="false"
							:clearable="true"
							:is-remote-search="true"
							:name="'signing_entity'"
							@remote-search="getSubEntityData"
							@selected-value="dropdownSelectedSubEntity"
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
