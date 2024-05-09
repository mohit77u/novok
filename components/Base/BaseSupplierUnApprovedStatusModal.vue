<script setup lang="ts">
	import { required, email, minLength, maxLength, helpers, requiredIf } from "@vuelidate/validators";
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

	const formData = reactive<any>({
		reason: "",
	});

	const rules = computed(() => {
		return {
			reason: {
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
		emit("status-data", "", formData?.reason, formData);
	};
</script>

<template>
	<el-dialog
		v-model="centerDialogVisible"
		class="max-w-[730px] w-[90%] rounded-2xl text-left"
		center
		@close="dialogClose"
		:close-on-click-modal="false"
		:title="$t('dropdown_labels.unapproved_contracted')"
	>
		<!-- <h1 class="text-3xl font-bold mb-5 mt-4 text-dark/100">Account Disabled</h1> -->
		<el-form v-loading="fullscreenLoading" class="flex flex-col">
			<div id="super-admin-form">
				<div class="bg-[#fff]">
					<div>
						<div class="grid md:grid-cols-12 gap-5 lg:gap-6">
							<el-form-item class="md:col-span-12 mb-0" :rules="[{ required: true }]" :label="$t('formLabels.reason')">
								<template #label>
									<BaseLabel :label="$t('formLabels.reason')" :tooltip-content="$t('info.reason')" />
								</template>
								<el-input
									v-model="formData.reason"
									type="textarea"
									:disabled="disabled"
									name="reason"
									:class="{
										error: v$.reason.$error,
									}"
									@change="v$.reason.$touch"
									@keypress="CharcterWithWhitespace"
								/>

								<span v-if="v$.reason.$error" class="text-xs text-red-500 mt-2">{{ v$.reason.$errors[0].$message }}</span>
							</el-form-item>
						</div>
					</div>
				</div>
			</div>
		</el-form>
		<template #footer>
			<div class="dialog-footer text-center">
				<novok-button type="info" @click="okClick"> {{ $t("buttons.save") }} </novok-button>
			</div>
		</template>
	</el-dialog>
</template>
