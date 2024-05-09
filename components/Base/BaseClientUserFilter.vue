<script setup lang="ts">
	import { ref } from "vue";
	import moment from "moment";
	import { CurrencyData, SupplierStatus, keySupplierOptions } from "~/helper/data";

	const drawer2 = ref(false);
	const emit = defineEmits(["start-date", "end-date", "filterData"]);
	const route = useRoute();

	const filterData = reactive<any>({
		access_role_id: "",
	});
	const accessRoles = ref<any>([]);

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
		filterData.access_role_id = route.query.accessRole ? route.query.accessRole : "";
	});

	const fetchData = async () => {
		await getAccessRoles();
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
		if (filterData.access_role_id) {
			return true;
		} else {
			return false;
		}
	});

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
		filterData.access_role_id = value;
	};

	const getSelectedAccessRole = computed(() => {
		const data = accessRoles.value.find((data: any) => {
			return data.value == filterData.access_role_id;
		});
		return data;
	});

	const filterClick = async () => {
		await fetchData();
		drawer2.value = true;
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
				<div class="grid gap-5">
					<el-form-item class="lg:col-span-3 mb-0" :label="$t('formLabels.access_role')">
						<BaseSelectDropdown
							size="small"
							name="key_supplier"
							:number-only="false"
							:clearable="true"
							:dropdown-option="accessRoles"
							:get-selected-country="getSelectedAccessRole"
							@selected-value="dropdownSelectedAccessRole"
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
