<template>
	<el-dialog
		v-model="centerDialogVisible"
		class="max-w-[540px] w-[90%] rounded-2xl noHeader"
		center
		:close-on-press-escape="!saveLoading"
		:align-center="true"
		@close="cancel"
	>
		<h1 class="text-3xl font-bold mb-5 mt-4 text-dark/100 text-center">
			{{ $t("header.approve_client_admin") }}
		</h1>
		<div v-loading="fullscreenLoading">
			<el-form-item class="mb-0" :label="$t('formLabels.super_user')">
				<BaseSelectDropdown
					v-model="formData.super_user_id"
					:dropdown-option="superUsers"
					:get-selected-country="getSelectedMangers"
					:number-only="false"
					name="contractOwner"
					:clearable="true"
					:disabled="saveLoading"
					@selected-value="
						(value) => {
							formData.super_user_id = value;
						}
					"
					:class="{ error: v$.super_user_id.$error }"
				/>
				<span v-if="v$.super_user_id.$error" class="text-xs text-red-500 mt-2">{{ v$.super_user_id.$errors[0].$message }} </span>
			</el-form-item>
		</div>
		<template #footer>
			<span class="dialog-footer">
				<novok-button :disabled="saveLoading" class="btn-dark" @click="cancel"> {{ $t("buttons.cancel") }} </novok-button>
				<novok-button :disabled="saveLoading" type="info" @click="okClick">
					<span>{{ $t("buttons.assign") }}</span> <i v-if="saveLoading" class="ms-2 fa-solid fa-circle-notch fa-spin"></i>
				</novok-button>
			</span>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
	import { required, helpers } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";

	const props = defineProps({
		dialogVisible: {
			type: Boolean,
			default: false,
		},
		id: {
			type: Number,
			default: 0,
		},
	});

	const formData = reactive({
		super_user_id: "",
	});
	const superUsers = ref([]);
	const { t } = useI18n();
	const fullscreenLoading = ref(false);
	const saveLoading = ref(false);
	const localePath = useLocalePath();
	const emit = defineEmits(["dialogOkClick"]);

	const centerDialogVisible = ref(false);

	const rules = computed(() => {
		return {
			super_user_id: {
				required: helpers.withMessage(t("formValidations.super_user_id"), required),
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

	const okClick = async () => {
		try {
			v$.value.$validate();
			if (!v$.value.$error) {
				saveLoading.value = true;
				const res: any = await useApiFetch(`/client-requests/${props.id}/approved`, {
					method: "POST",
					body: formData,
				});

				useToast("success", res.message);
				emit("dialogOkClick", false, true);
				navigateTo(localePath("/client-requests"));
			}
		} catch {
		} finally {
			emit("dialogOkClick", false);
			saveLoading.value = false;
		}
	};

	const cancel = () => {
		centerDialogVisible.value = false;
		emit("dialogOkClick", false);
	};

	const getSuperUsers = async () => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch(`/super-users?perPage=50`, {
				method: "GET",
			});

			superUsers.value = res.data?.data?.map((data: any) => {
				return {
					label: data.full_name,
					value: data.id,
				};
			});
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	watch(
		() => props.dialogVisible,
		(currData) => {
			if (currData) {
				getSuperUsers();
			}
			formData.super_user_id = "";
			v$.value.$reset();
			centerDialogVisible.value = currData;
		},
		{ deep: true, immediate: true }
	);
</script>
