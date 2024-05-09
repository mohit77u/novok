<script setup lang="ts">
	import { required, helpers, requiredIf } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import moment from "moment";

	const props = defineProps({
		dialogVisible: Boolean,
		id: {
			type: String,
			default: "",
		},
	});
	const emit = defineEmits(["dialogOkClick", "status-data"]);
	const centerDialogVisible = ref(false);
	const localePath = useLocalePath();
	const { t } = useI18n();
	const loading = ref(false);
	const statusData = ref({
		project_owner_id: "",
		expected_start_date: "",
		target_end_date: "",
	});
	const projetOwners = ref<any>([]);
	const searchValue = ref("");

	const rules = computed(() => {
		return {
			project_owner_id: {
				required: helpers.withMessage(t("formValidations.project_owner"), required),
			},
			expected_start_date: {
				required: helpers.withMessage(t("formValidations.expected_start_date"), required),
			},
			target_end_date: {
				required: helpers.withMessage(t("formValidations.target_end_date"), required),
			},
		};
	});

	const v$ = useVuelidate(rules, statusData.value);

	onMounted(async () => {
		await getProjectOwnerList();
	});

	watch(
		() => props.dialogVisible,
		(currData) => {
			centerDialogVisible.value = currData;
		},
		{ deep: true, immediate: true }
	);

	const okClick = () => {
		submit();
	};

	const dialogClose = () => {
		centerDialogVisible.value = false;
		emit("dialogOkClick", false);
	};

	const submit = async () => {
		v$.value.$validate();

		if (!v$.value.$error) {
			centerDialogVisible.value = false;
			emit("dialogOkClick", false);
			emit("status-data", statusData.value);
		}
	};

	const getProjectOwnerList = async () => {
		try {
			const res: any = await useApiFetch(`/project-ms/users?searchValue=${searchValue.value}`, {
				method: "GET",
			});

			projetOwners.value = res.data?.map((data: any) => {
				return {
					label: data?.full_name + " " + "(" + data.email + ")",
					value: data?.id,
				};
			});
		} catch {}
	};

	const dropdownSelectedProjectOwner = (value: any) => {
		statusData.value.project_owner_id = value;
	};

	const getSelectedProjectOwner = computed(() => {
		return projetOwners.value?.find((data: any) => data.value == statusData.value.project_owner_id);
	});

	const disabledStartDate = (date: any) => {
		var d = new Date();
		d.setDate(d.getDate() - 1);
		if (d > date) {
			return true;
		}
	};

	const disabledDate = (date: any) => {
		const curretDate = moment(date).format();
		const newDate = statusData?.value.expected_start_date ? moment(statusData?.value.expected_start_date)?.format() : "";
		if (curretDate < newDate) {
			return true;
		} else {
			return false;
		}
	};
</script>

<template>
	<el-dialog
		v-model="centerDialogVisible"
		class="max-w-[730px] w-[90%] rounded-2xl text-left"
		center
		@close="dialogClose"
		:close-on-click-modal="false"
		:title="$t('labels.request_approve_status')"
	>
		<el-form v-loading="fullscreenLoading" class="flex flex-col">
			<div id="super-admin-form">
				<div class="bg-[#fff]">
					<div>
						<el-form-item
							class="col-span-12 lg:col-span-4 md:col-span-4 sm:col-span-6 xl:col-span-4 mb-0"
							:label="$t('formLabels.project_owner')"
							:rules="[{ required: true }]"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.project_owner')" :tooltip-content="$t('info.project_owner')" />
							</template>
							<BaseSelectDropdown
								v-model="statusData.project_owner_id"
								name="project_owner_id"
								:dropdown-option="projetOwners"
								:number-only="false"
								:disabled="disabled"
								:is-remote-search="true"
								:get-selected-country="getSelectedProjectOwner"
								:class="{
									error: v$.project_owner_id.$error,
								}"
								@change="v$.project_owner_id.$touch"
								@selected-value="dropdownSelectedProjectOwner"
							/>
							<span v-if="v$.project_owner_id.$error" class="text-xs text-red-500 mt-2">{{
								v$.project_owner_id.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item
							:rules="[{ required: true }]"
							:label="$t('formLabels.expected_start_date')"
							class="col-span-12 lg:col-span-4 md:col-span-4 sm:col-span-6 xl:col-span-4 mb-0 mt-2"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.expected_start_date')"
									:tooltip-content="$t('info.expected_start_date')"
									:isShowLabel="false"
								/>
							</template>
							<el-date-picker
								v-model.trim="statusData.expected_start_date"
								type="date"
								placeholder="DD/MM/YYYY"
								format="DD/MM/YYYY"
								value-format="YYYY-MM-DD"
								name="expected_start_date"
								:disabled="disabled"
								:class="{
									error: v$.expected_start_date.$error,
								}"
								:disabled-date="disabledStartDate"
								@change="v$.expected_start_date.$touch"
							/>

							<span v-if="v$.expected_start_date.$error" class="text-xs text-red-500 mt-2 w-full">{{
								v$.expected_start_date.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item
							:rules="[{ required: true }]"
							:label="$t('formLabels.target_end_date')"
							class="col-span-12 lg:col-span-4 md:col-span-4 sm:col-span-6 xl:col-span-4 mb-0 mt-2"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.target_end_date')"
									:tooltip-content="$t('info.target_end_date')"
									:isShowLabel="false"
								/>
							</template>
							<el-date-picker
								v-model.trim="statusData.target_end_date"
								type="date"
								placeholder="DD/MM/YYYY"
								format="DD/MM/YYYY"
								value-format="YYYY-MM-DD"
								name="target_end_date"
								:disabled="disabled"
								placement="top"
								:class="{
									error: v$.target_end_date.$error,
								}"
								:disabled-date="disabledDate"
								@change="v$.target_end_date.$touch"
							/>

							<span v-if="v$.target_end_date.$error" class="text-xs text-red-500 mt-2 w-full">{{
								v$.target_end_date.$errors[0].$message
							}}</span>
						</el-form-item>
					</div>
				</div>
			</div>
		</el-form>
		<template #footer>
			<div class="dialog-footer text-center">
				<novok-button type="success" :loading="loading" @click="okClick">
					{{ $t("buttons.approve") }}
				</novok-button>
			</div>
		</template>
	</el-dialog>
</template>

