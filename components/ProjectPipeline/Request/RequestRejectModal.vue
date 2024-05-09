<script setup lang="ts">
	import { required, email, minLength, maxLength, helpers, requiredIf } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";

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

	const formData = reactive<any>({
		reason_of_reject: "",
	});

	const rules = computed(() => {
		return {
			reason_of_reject: {
				required: helpers.withMessage(t("formValidations.reason"), required),
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

	watch(
		() => props.dialogVisible,
		(currData) => {
			centerDialogVisible.value = currData;
		},
		{ deep: true, immediate: true }
	);

	const okClick = () => {
		v$.value.$validate();
		if (!v$.value.$error) {
			submit();
		}
	};

	const dialogClose = () => {
		centerDialogVisible.value = false;
		emit("dialogOkClick", false);
	};

	const submit = async () => {
		centerDialogVisible.value = false;
		emit("dialogOkClick", false);
		emit("status-data", formData);
	};
</script>

<template>
	<el-dialog
		v-model="centerDialogVisible"
		class="max-w-[730px] w-[90%] rounded-2xl text-left"
		center
		@close="dialogClose"
		:close-on-click-modal="false"
		:title="$t('labels.request_reject_status')"
	>
		<!-- <h1 class="text-3xl font-bold mb-5 mt-4 text-dark/100">Account Disabled</h1> -->
		<el-form v-loading="fullscreenLoading" class="flex flex-col">
			<div id="super-admin-form">
				<div class="bg-[#fff]">
					<div>
						<div class="grid md:grid-cols-12 gap-5 lg:gap-6">
							<el-form-item :label="$t('formLabels.reason')" :rules="[{ required: true }]" class="md:col-span-12 lg:col-span-12 mb-0">
								<template #label>
									<BaseLabel :label="$t('formLabels.reason')" :tooltip-content="$t('info.reason')" />
								</template>
								<el-input
									name="request_number"
									type="textarea"
									v-model="formData.reason_of_reject"
									:class="{
										error: v$.reason_of_reject.$error,
									}"
									@change="v$.reason_of_reject.$touch"
								/>
								<span v-if="v$.reason_of_reject.$error" class="text-xs text-red-500 mt-2">{{
									v$.reason_of_reject.$errors[0].$message
								}}</span>
							</el-form-item>
						</div>
					</div>
				</div>
			</div>
		</el-form>
		<template #footer>
			<div class="dialog-footer text-center">
				<novok-button type="danger" @click="okClick">
					{{ $t("buttons.reject") }}
				</novok-button>
			</div>
		</template>
	</el-dialog>
</template>
