<template>
	<div v-loading="fullscreenLoading" class="bg-[url('/images/loginBottom.webp')] bg-no-repeat h-full p-4">
		<div class="bg-[#fff] p-4">
			<el-form ref="form" :model="form">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<el-form-item class="col-span-2">
						<div class="flex items-start gap-2 w-full">
							<el-checkbox
								v-model="formData.is_assign_delegated"
								class="text-gray-600 mr-2"
								name="is_consent_to_share_with_marketplace"
								id="is_assign_delegated"
								:checked="formData.is_delegated === 1 ? true : false"
							/>
							<div class="mt-1">
								<label for="is_assign_delegated" class="text-base">
									{{ $t("formLabels.i_acknowledge_and_agree_to_delegate_my_authority") }}
								</label>
							</div>
						</div>
					</el-form-item>

					<el-form-item :rules="[{ required: true }]" class="mb-0" :label="$t('formLabels.delegated_start_date')">
						<template #label>
							<BaseLabel :label="$t('formLabels.delegated_start_date')" :tooltip-content="$t('info.delegated_start_date')" />
						</template>
						<el-date-picker
							v-model.trim="formData.delegated_start_date"
							type="date"
							placeholder="DD/MM/YYYY"
							format="DD/MM/YYYY"
							value-format="YYYY-MM-DD"
							name="delegated_start_date"
							:disabled-date="disabledStartDate"
							:disabled="!formData.is_assign_delegated"
							:class="{
								error: v$.delegated_start_date.$error,
							}"
							@change="getListOfClientUser(), v$.delegated_start_date.$touch"
						/>
						<span v-if="v$.delegated_start_date.$error" class="text-xs text-red-500 mt-2 w-full">{{
							v$.delegated_start_date.$errors[0].$message
						}}</span>
					</el-form-item>

					<el-form-item :rules="[{ required: true }]" class="mb-0" :label="$t('formLabels.delegated_end_date')">
						<template #label>
							<BaseLabel :label="$t('formLabels.delegated_end_date')" :tooltip-content="$t('info.delegated_end_date')" />
						</template>
						<el-date-picker
							v-model.trim="formData.delegated_end_date"
							type="date"
							placeholder="DD/MM/YYYY"
							format="DD/MM/YYYY"
							value-format="YYYY-MM-DD"
							name="delegated_end_date"
							:disabled-date="disabledEndDate"
							:disabled="!formData.is_assign_delegated"
							:class="{
								error: v$.delegated_end_date.$error,
							}"
							@change="getListOfClientUser(), v$.delegated_end_date.$touch"
						/>
						<span v-if="v$.delegated_end_date.$error" class="text-xs text-red-500 mt-2 w-full">{{
							v$.delegated_end_date.$errors[0].$message
						}}</span>
					</el-form-item>

					<el-form-item :rules="[{ required: true }]" class="mb-0 flex-1" :label="$t('formLabels.delegated_user_id')">
						<template #label>
							<BaseLabel :label="$t('formLabels.delegated_user_id')" :tooltip-content="$t('info.delegated_user_id')" />
						</template>
						<BaseSelectDropdown
							v-model="formData.delegated_user_id"
							:dropdown-option="clientUsers"
							:number-only="false"
							name="delegated_user_id"
							:class="{
								error: v$.delegated_user_id.$error,
							}"
							:disabled="!isShowClientUsers"
							@change="v$.delegated_user_id.$touch"
						/>
						<span v-if="v$.delegated_user_id.$error" class="text-xs text-red-500 mt-2">{{
							v$.delegated_user_id.$errors[0].$message
						}}</span>
					</el-form-item>
				</div>

				<div class="pt-6 text-right">
					<novok-button class="btn-dark my-1" @click="CancelRedirect('/dashboard')">
						<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
						<i class="fa-solid fa-xmark sm:hidden"></i>
					</novok-button>

					<novok-button
						type="info"
						:loading="loading"
						:disabled="loading || isDisabledSubmit"
						:class="loading ? 'inline-flex justify-center' : ''"
						@click.prevent="onSubmit"
						>{{ $t("buttons.submit") }}</novok-button
					>
				</div>
			</el-form>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { required, helpers } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import { useAuthStore } from "~/store/auth";
	import { sidebarItemStore } from "~/store/sidebarItem";
	import moment from "moment";

	useHead({
		title: "Delegation Authority",
	});

	definePageMeta({
		middleware: ["auth"],
	});

	const sideBarStore = sidebarItemStore();
	const store = useAuthStore();
	const formData = reactive<any>({
		is_assign_delegated: 0,
		delegated_user_id: "",
		delegated_start_date: "",
		delegated_end_date: "",
	});

	const loading = ref(false);
	const fullscreenLoading = ref(false);
	const localePath = useLocalePath();
	const { t } = useI18n();
	const clientUsers = ref<any>([]);

	onMounted(async () => {
		fullscreenLoading.value = true;

		await getDelegationAuthority();
		await getListOfClientUser();

		fullscreenLoading.value = false;
	});

	const rules = computed(() => {
		return {
			delegated_user_id: {
				required: helpers.withMessage(t("formValidations.delegated_user_id"), required),
			},
			delegated_start_date: {
				required: helpers.withMessage(t("formValidations.delegated_start_date"), required),
			},
			delegated_end_date: {
				required: helpers.withMessage(t("formValidations.delegated_end_date"), required),
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

	const isShowClientUsers = computed(() => {
		return formData.delegated_start_date && formData.delegated_end_date;
	});

	const isDisabledSubmit = computed(() => {
		return !formData.id && !formData.is_assign_delegated;
	});

	const disabledEndDate = (date: any) => {
		const curretDate = moment(date).format();
		const delegatedStartDate = formData?.delegated_start_date ? moment(formData?.delegated_start_date)?.format() : "";

		if (moment(formData?.delegated_start_date) > moment(formData?.delegated_end_date)) {
			formData.delegated_end_date = "";
		}

		if (curretDate < delegatedStartDate) {
			return true;
		} else {
			return false;
		}
	};

	const disabledStartDate = (date: any) => {
		const currentDate = moment().startOf("day");
		const selectedDate = moment(date).startOf("day");
		const delegatedEndDate = formData.delegated_end_date ? moment(formData.delegated_end_date).startOf("day") : null;

		if (selectedDate < currentDate) {
			return true;
		} else {
			return false;
		}
	};

	const getDelegationAuthority = async () => {
		try {
			const res: any = await useApiFetch(`/delegate-authority`, {
				method: "GET",
			});

			Object.assign(formData, res?.data);

			formData.is_assign_delegated = res?.data?.id ? true : false;
		} catch {}
	};

	const getListOfClientUser = async () => {
		try {
			if (!isShowClientUsers.value) {
				return false;
			}

			const res: any = await useApiFetch(
				`/delegate-authority-user-list?delegated_start_date=${formData.delegated_start_date}&delegated_end_date=${formData.delegated_end_date}`,
				{
					method: "GET",
				}
			);

			clientUsers.value = res?.data.map((item: any) => {
				return {
					value: item.id,
					label: item.full_name + ' (' + item?.email +')',
				};
			});

			if (!clientUsers.value.some((user: any) => user.value === formData.delegated_user_id)) {
				formData.delegated_user_id = null;
			}
		} catch {}
	};

	const onSubmit = async () => {
		if (formData.is_assign_delegated) {
			await updateDelegationAuthority();
		} else if (formData.id) {
			await revokeDelegationAuthority();
		}
	};

	const updateDelegationAuthority = async () => {
		try {
			v$.value.$validate();
			if (!v$.value.$error) {
				loading.value = true;
				const res: any = await useApiFetch(`/delegate-authority`, {
					method: formData?.id ? "PATCH" : "POST",
					body: {
						delegated_user_id: formData.delegated_user_id,
						delegated_start_date: formData.delegated_start_date,
						delegated_end_date: formData.delegated_end_date,
					},
				});

				useToast("success", res.message);
				sideBarStore.setActiveSidebarItem("1");
				sideBarStore.setSidebarItem("1");
				navigateTo(localePath("/dashboard"));
			}
		} catch {
		} finally {
			loading.value = false;
		}
	};

	const revokeDelegationAuthority = async () => {
		try {
			loading.value = true;
			const res: any = await useApiFetch(`/delegate-authority`, {
				method: "DELETE",
				body: {},
			});

			useToast("success", res.message);
			sideBarStore.setActiveSidebarItem("1");
			sideBarStore.setSidebarItem("1");
			navigateTo(localePath("/dashboard"));
		} catch {
		} finally {
			loading.value = false;
		}
	};
</script>

<style>
	/* @import "~/assets/css/main.css"; */
</style>
