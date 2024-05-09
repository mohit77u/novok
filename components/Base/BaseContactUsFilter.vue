<script setup lang="ts">
	import { ref } from "vue";
	import moment from "moment";

	const drawer2 = ref(false);
	const emit = defineEmits(["start-date", "end-date", "filterData"]);
	const route = useRoute();

	const filterData = ref<any>({
		fromDate: "",
		toDate: "",
		isArchived: 0,
	});

	onMounted(() => {
		filterData.value.fromDate = route.query.fromDate ? route.query.fromDate : "";
		filterData.value.toDate = route.query.toDate ? route.query.toDate : "";
		filterData.value.isArchived = route.query.isArchived ? +route.query.isArchived : 0;
	});

	const confirmClick = () => {
		emit("filterData", filterData.value);
		drawer2.value = false;
	};

	// const dropdownSelectedFilterFieldValue = (value: any) => {
	//   dataType.value = value;
	// };

	const clearFilter = () => {
		filterData.value.fromDate = "";
		filterData.value.toDate = "";
		filterData.value.isArchived = 0;

		emit("filterData", filterData.value);
		drawer2.value = false;
	};

	const disabledDate = (date: any) => {
		const curretDate = moment(date).format();
		const newDate = filterData?.value.fromDate ? moment(filterData?.value.fromDate)?.format() : "";
		if (curretDate < newDate) {
			return true;
		} else {
			return false;
		}
	};

	const disabledStartDate = (date: any) => {
		const curretDate = moment(date).format();
		const newDate = filterData?.value.toDate ? moment(filterData?.value.toDate)?.format() : "";
		if (filterData?.value.toDate) {
			if (curretDate > newDate) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};

	const getfilterData = computed(() => {
		if (filterData.value.fromDate || filterData.value.toDate || filterData.value.isArchived === 1) {
			return true;
		} else {
			return false;
		}
	});
</script>

<template>
    <el-tooltip :content="$t('formLabels.filter')" placement="top">
        <novok-button class="btn-icon relative" type="info" @click="drawer2 = true">
            <label v-if="getfilterData" class="w-2 h-2 rounded-full bg-red-500 absolute -right-1 -top-1"></label>
            <i class="fa-solid fa-filter"></i>
        </novok-button>
    </el-tooltip>
	<el-form>
		<el-drawer v-model="drawer2" direction="rtl" :show-close="false">
			<template #header="{ close, titleId }">
				<div class="bg-primary flex justify-between p-4">
					<h4 :id="titleId" class="text-white font-semibold text-2xl">
						{{ $t("formLabels.filter") }}
					</h4>
					<div class="bg-[#fff]/10 text-white w-8 h-8 flex items-center justify-center rounded-full cursor-pointer">
						<i class="fa-solid fa-xmark" @click="close"></i>
					</div>
				</div>
			</template>
			<template #default>
				<div class="grid gap-5">
					<el-form-item class="mb-0" :label="$t('formLabels.fromdate')">
						<el-date-picker
							v-model="filterData.fromDate"
							type="date"
							placeholder="DD/MM/YYYY"
							format="DD/MM/YYYY"
							value-format="YYYY-MM-DD"
							:disabled-date="disabledStartDate"
						/>
					</el-form-item>
					<el-form-item class="mb-0" :label="$t('formLabels.todate')">
						<el-date-picker
							v-model="filterData.toDate"
							type="date"
							placeholder="DD/MM/YYYY"
							format="DD/MM/YYYY"
							value-format="YYYY-MM-DD"
							:disabled-date="disabledDate"
						/>
					</el-form-item>
					<div>
						<label class="text-dark font-bold mr-4 my-2 block">{{ $t("filter.view_records") }}</label>
						<el-radio-group v-model="filterData.isArchived" class="ml-4">
							<el-radio :label="0" size="large">{{ $t("filter.active") }}</el-radio>
							<el-radio :label="1" size="large">{{ $t("filter.archived") }}</el-radio>
						</el-radio-group>
					</div>
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
