<!-- eslint-disable vue/require-valid-default-prop -->
<script setup lang="ts">
	import { required, helpers, requiredIf } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import { getDisabledStartDates } from "~/helper/disabledDates";
	import moment from "moment";

	const props = defineProps({
		dialogStatusVisible: Boolean,
		dropdownOption: {
			type: Array,
			default: [],
		},
		// selectedStatusData: {
		// 	type: Object,
		// 	default: {},
		// },
		selectedStatusData: {
			type: Object,
			default: {},
		},
		contractNumber: {
			type: String,
			default: "",
		},
		statusApi: {
			type: Function,
			default: null,
		},
	});
	const emit = defineEmits(["dialogOkClick", "selected-value"]);
	const centerDialogVisible = ref(false);
	const selectedValue = ref<any>({
		label: "",
		value: "",
	});
	const statusData = reactive<any>({
		status: "",
		contract_start_date: "",
		contract_end_date: "",
		contract_foreclose_date: "",
		reason: "",
	});
	const showContractDates = ref(false);
	const showForCloseDate = ref(false);
	const { t } = useI18n();

	const rules = computed(() => {
		return {
			contract_start_date: {
				requiredIf: helpers.withMessage(t("formValidations.contract_start_date"), requiredIf(statusData.status == 3 || statusData.status == 4)),
			},
			contract_end_date: {
				requiredIf: helpers.withMessage(t("formValidations.contract_end_date"), requiredIf(statusData.status == 3 || statusData.status == 4)),
			},
			contract_foreclose_date: {
				requiredIf: helpers.withMessage(
					t("formValidations.contract_expiry_date"),
					requiredIf(statusData.status == 5 || statusData.status == 6)
				),
			},
            reason: {
				requiredIf: helpers.withMessage(
					t("formValidations.reason"),
					requiredIf(statusData.status == 5 || statusData.status == 6)
				),
			},
		};
	});

	const v$ = useVuelidate(rules, statusData);

	watch(
		() => props.dialogStatusVisible,
		(currData) => {
			centerDialogVisible.value = currData;
		},
		{ deep: true, immediate: true }
	);

	// watch(
	// 	() => props.selectedStatusData,
	// 	(currData) => {
	// 		selectedValue.value = currData?.value || "";
	// 		statusData.status = currData.value || "";
	// 		if (currData.value == 3 || currData.value == 4) {
	// 			showContractDates.value = true;
	// 		} else {
	// 			showContractDates.value = false;
	// 		}
	// 	},
	// 	{ deep: true, immediate: true }
	// );

	watch(
		() => props.selectedStatusData,
		(currData) => {
			// selectedValue.value = currData?.value || "";
			statusData.contract_start_date = currData.contract_start_date;
			statusData.contract_end_date = currData.contract_end_date;
			statusData.status = currData.status;
			statusData.reason = currData.reason;
			selectedValue.value = currData.status;
			// if (currData.status == 3 || currData.status == 4) {
			// 	showContractDates.value = true;
			// } else {
			// 	showContractDates.value = false;
			// }
			// if (currData.status == 5 || currData.status == 6) {
			// 	showForCloseDate.value = true;
			// } else {
			// 	showForCloseDate.value = false;
			// }
		},
		{ deep: true, immediate: true }
	);

	const change = (val: any) => {
		statusData.contract_start_date = "";
		statusData.contract_end_date = "";
		v$.value.$reset();
		if (val == 3 || val == 4) {
			showContractDates.value = true;
		} else {
			showContractDates.value = false;
		}
		if (val == 5 || val == 6) {
			showForCloseDate.value = true;
		} else {
			showForCloseDate.value = false;
		}
		statusData.status = val;
	};

	const okClick = () => {
		emit("selected-value", statusData);
		v$.value.$validate();
		if (!v$.value.$error) {
			props.statusApi();
		}
	};

	const cancel = () => {
		centerDialogVisible.value = false;
		emit("dialogOkClick", false);
	};

	const disabledEndDate = (date: any) => {
		const curretDate = moment(date).format();
		const newDate = statusData?.contract_start_date ? moment(statusData?.contract_start_date)?.format() : "";

		if (curretDate < newDate) {
			return true;
		} else {
			return false;
		}
	};

	const disabledStartDate = (date: any) => {
		var d = new Date();
		if (date > d) {
			return true;
		}
	};

	const disabledDate = (date: any) => {
		var d = new Date();
		d.setDate(d.getDate() - 1);
		if (d > date) {
			return true;
		}
	};
</script>

<template>
	<el-dialog v-model="centerDialogVisible" class="max-w-[540px] w-[90%] rounded-2xl" title="Change Status" center @close="cancel">
		<h1 class="text-base font-bold mb-5 mt-4 text-dark/100">{{ $t('formLabels.status_for_contract') }} : {{ props.contractNumber }}</h1>
		<!-- <div class="flex justify-center w-full"> -->
		<el-select
			v-model="selectedValue"
			class="w-full"
			placeholder="Select status"
			filterable
			remote-show-suffix
			:default-first-option="false"
			@change="change"
		>
			<el-option
				v-for="item in dropdownOption"
				:key="item.value"
				:label="item.label"
				:value="item.value"
				:disabled="props.selectedStatusData.status === item.value"
			/>
		</el-select>

		<el-form>
			<el-form-item v-if="showContractDates" :rules="[{ required: true }]" class="mt-3" :label="$t('formLabels.contract_start_date')">
                <template #label>
                    <BaseLabel
                        :label="$t('formLabels.contract_start_date')"
                        :tooltip-content="$t('info.contract_start_date')"
                    />
                </template>
				<el-date-picker
					v-model.trim="statusData.contract_start_date"
					type="date"
					placeholder="DD/MM/YYYY"
					format="DD/MM/YYYY"
					value-format="YYYY-MM-DD"
					name="contract_start_date"
					:disabled-date="disabledStartDate"
					:class="{
						error: v$.contract_start_date.$error,
					}"
					:disabled="disabled"
					@change="v$.contract_start_date.$touch"
				/>
				<span v-if="v$.contract_start_date.$error" class="text-xs text-red-500 mt-2 w-full">{{
					v$.contract_start_date.$errors[0].$message
				}}</span>
			</el-form-item>

			<el-form-item v-if="showContractDates" :rules="[{ required: true }]" class="mt-3" :label="$t('formLabels.contract_end_date')">
                <template #label>
                    <BaseLabel
                        :label="$t('formLabels.contract_end_date')"
                        :tooltip-content="$t('info.contract_end_date')"
                    />
                </template>
				<el-date-picker
					v-model.trim="statusData.contract_end_date"
					type="date"
					placeholder="DD/MM/YYYY"
					format="DD/MM/YYYY"
					value-format="YYYY-MM-DD"
					name="contract_end_date"
					:disabled-date="disabledEndDate"
					:class="{
						error: v$.contract_end_date.$error,
					}"
					:disabled="disabled"
					@change="v$.contract_end_date.$touch"
				/>
				<span v-if="v$.contract_end_date.$error" class="text-xs text-red-500 mt-2 w-full">{{
					v$.contract_end_date.$errors[0].$message
				}}</span>
			</el-form-item>

			<el-form-item v-if="showForCloseDate" :rules="[{ required: true }]" class="mt-3" :label="$t('formLabels.contract_expiry_date')">
                <template #label>
                    <BaseLabel
                        :label="$t('formLabels.contract_expiry_date')"
                        :tooltip-content="$t('info.contract_expiry_date')"
                    />
                </template>
				<el-date-picker
					v-model.trim="statusData.contract_foreclose_date"
					type="date"
					placeholder="DD/MM/YYYY"
					format="DD/MM/YYYY"
					value-format="YYYY-MM-DD"
					name="contract_foreclose_date"
					:disabled-date="disabledDate"
					:class="{
						error: v$.contract_foreclose_date.$error,
					}"
					@change="v$.contract_foreclose_date.$touch"
				/>
				<span v-if="v$.contract_foreclose_date.$error" class="text-xs text-red-500 mt-2 w-full">{{
					v$.contract_foreclose_date.$errors[0].$message
				}}</span>
			</el-form-item>

            <el-form-item v-if="showForCloseDate" :rules="[{ required: true }]" class="mt-3" :label="$t('formLabels.reason')">
                <template #label>
                    <BaseLabel
                        :label="$t('formLabels.reason')"
                        :tooltip-content="$t('info.reason')"
                    />
                </template>
				<el-input
                    v-model="statusData.reason"
                    type="textarea"
                    :class="{
						error: v$.reason.$error,
					}"
                    name="reason"
                    @change="v$.reason.$touch"
                />
				<span v-if="v$.reason.$error" class="text-xs text-red-500 mt-2 w-full">{{
					v$.reason.$errors[0].$message
				}}</span>
			</el-form-item>
		</el-form>

		<!-- </div> -->

		<template #footer>
			<span class="dialog-footer">
				<novok-button class="btn-dark" @click="cancel"> {{ $t("buttons.cancel") }} </novok-button>
				<novok-button type="info" @click="okClick">
					{{ $t("buttons.update") }}
				</novok-button>
			</span>
		</template>
	</el-dialog>
</template>
