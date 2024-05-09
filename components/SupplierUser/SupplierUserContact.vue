<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
	import { email, maxLength, helpers, minLength } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";

	import { supplierStore } from "~/store/supplier";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import { getErrors } from "~/helper/getErrors";

	const props = defineProps({
		editData: {
			type: Object,
			// eslint-disable-next-line vue/require-valid-default-prop
			default: {},
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	});

	const formData = reactive<any>({
		tab_name: "alternative-contact",
		alt_first_name: "",
		alt_last_name: "",
		alt_department: "",
		alt_job_title: "",
		alt_email: "",
		alt_telephone: "",
		alt_mobile: "",
		alt_telephone_country_code: "+44",
		alt_mobile_country_code: "+44",
	});
	const loadingSave = ref(false);
	const loading = ref(false);
	const localePath = useLocalePath();
	const { t } = useI18n();
	const route = useRoute();
	const store = supplierStore();
	const emit = defineEmits(["active-tab-name"]);

	const { getSelectedCountry, getCountry } = useGetSelectedCountry();

	const rules = computed(() => {
		return {
			alt_first_name: {
				maxLength: helpers.withMessage(t("formValidations.first_name_max"), maxLength(50)),
				name_validation: {
					$validator: PasteCharSpecCharWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			alt_last_name: {
				maxLength: helpers.withMessage(t("formValidations.last_name_max"), maxLength(50)),
				name_validation: {
					$validator: PasteCharSpecCharWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			alt_department: {
				maxLength: helpers.withMessage(t("formValidations.department_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			alt_job_title: {
				maxLength: helpers.withMessage(t("formValidations.job_title_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.charNum"),
				},
			},
			alt_email: {
				email: helpers.withMessage(t("formValidations.email_valid"), email),
				name_validation: {
					$validator: PasteEmail,
					$message: t("formValidations.email_valid"),
				},
			},
			alt_telephone: {
				name_validation: {
					$validator: PasteNumberOnly,
					$message: t("copyPasteValidations.number"),
				},
				minLength: helpers.withMessage(t("formValidations.telephone_no_max"), minLength(10)),
			},
			alt_mobile: {
				name_validation: {
					$validator: PasteNumberOnly,
					$message: t("copyPasteValidations.number"),
				},
				minLength: helpers.withMessage(t("formValidations.contact_number_max"), minLength(10)),
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

	watch(
		() => props.editData,
		(currData) => {
			if (currData.tab === "alternative-contact" || currData.tab === "all") {
				v$.value.$reset();
				if (Object.keys(currData || {}).length) {
					Object.keys(formData).forEach((field: any) => {
						if (currData?.[field] !== undefined && currData?.[field] !== null && currData?.[field] !== "") {
							formData[field] = currData?.[field];
						}
					});
				}
			}
		}
	);

	onMounted(() => {});

	const dropdownSelectedCountryCodeValue = (value: any) => {
		formData.alt_telephone_country_code = value;
	};

	const dropdownSelectedValue = (value: any) => {
		formData.alt_mobile_country_code = value;
	};

	const onSubmit = () => {
		v$.value.$validate();
		if (!v$.value.$error) {
			submitAddData();
		}
	};

	const submitAddData = async () => {
		try {
			loading.value = true;

			const res: any = await useApiFetch(`/supplier-users/${route.params?.id}/alternative-contact`, {
				method: "POST",
				body: formData,
			});

			navigateTo(localePath("supplier-users"));
			store.setActiveTab("supplier-user");
			emit("active-tab-name", "supplier-user");
			useToast("success", res.message);
		} catch {
		} finally {
			loading.value = false;
			loadingSave.value = false;
		}
	};

	const cancelClick = () => {
		const supplier_admin_id = useCookie('supplier_admin_id');
		const pageDetails = JSON.parse(sessionStorage.getItem("pageDetails") || "{}");
		const queryUrl = {
			page: pageDetails?.page,
			perPage: pageDetails?.perPage,
			searchValue: pageDetails?.searchValue,
			sortOrder: pageDetails?.sortOrder,
			sortColumn: pageDetails?.sortColumn,
		};

		if (route.query.page === "view") {
			navigateTo(localePath(`/supplier-users/view-supplier-user/${route.params?.id}?supplier_admin_id=${supplier_admin_id.value}`));
		} else {
			navigateTo(
				localePath({
					name: "supplier-users",
					query: queryUrl,
				})
			);
		}
	};
</script>

<template>
	<div class="p-6 rounded-lg">
		<el-form class="grid grid-cols-8 gap-5 lg:gap-6">
			<el-form-item class="col-span-8 sm:col-span-5 md:col-span-3 mb-0" :label="$t('formLabels.first_name')">
				<template #label>
					<BaseLabel :label="$t('formLabels.first_name')" :tooltip-content="$t('info.first_name')" />
				</template>
				<el-input
					v-model="formData.alt_first_name"
					type="text"
					name="alt_first_name"
					:class="{
						error: v$.alt_first_name.$error,
					}"
					maxLength="50"
					:disabled="disabled"
					@change="v$.alt_first_name.$touch"
					@keypress="CharSpecCharWithWhitespace"
				/>
				<span v-if="v$.alt_first_name.$error" class="text-xs text-red-500 mt-2">{{ v$.alt_first_name.$errors[0].$message }}</span>
			</el-form-item>

			<el-form-item class="col-span-8 sm:col-span-4 md:col-span-3 mb-0" :label="$t('formLabels.last_name')">
				<template #label>
					<BaseLabel :label="$t('formLabels.last_name')" :tooltip-content="$t('info.last_name')" />
				</template>
				<el-input
					v-model="formData.alt_last_name"
					type="text"
					name="alt_last_name"
					:class="{
						error: v$.alt_last_name.$error,
					}"
					maxLength="50"
					:disabled="disabled"
					@change="v$.alt_last_name.$touch"
					@keypress="CharSpecCharWithWhitespace"
				/>
				<span v-if="v$.alt_last_name.$error" class="text-xs text-red-500 mt-2">{{ v$.alt_last_name.$errors[0].$message }}</span>
			</el-form-item>

			<el-form-item class="col-span-8 sm:col-span-2 mb-0" :label="$t('formLabels.department')">
				<template #label>
					<BaseLabel :label="$t('formLabels.department')" :tooltip-content="$t('info.department')" />
				</template>
				<el-input
					v-model="formData.alt_department"
					type="text"
					name="alt_department"
					:class="{
						error: v$.alt_department.$error,
					}"
					maxLength="80"
					:disabled="disabled"
					@change="v$.alt_department.$touch"
					@keypress="CharcterWithWhitespace"
				/>
				<span v-if="v$.alt_department.$error" class="text-xs text-red-500 mt-2">{{ v$.alt_department.$errors[0].$message }}</span>
			</el-form-item>

			<el-form-item class="col-span-8 sm:col-span-4 md:col-span-4 mb-0" :label="$t('formLabels.job_title')">
				<template #label>
					<BaseLabel :label="$t('formLabels.job_title')" :tooltip-content="$t('info.job_title')" />
				</template>
				<el-input
					v-model="formData.alt_job_title"
					type="text"
					name="alt_job_title"
					:class="{
						error: v$.alt_job_title.$error,
					}"
					:disabled="disabled"
					maxLength="80"
					@change="v$.alt_job_title.$touch"
					@keypress="CharcterWithWhitespace"
				/>
				<span v-if="v$.alt_job_title.$error" class="text-xs text-red-500 mt-2">{{ v$.alt_job_title.$errors[0].$message }}</span>
			</el-form-item>

			<el-form-item class="col-span-8 sm:col-span-4 mb-0" :label="$t('formLabels.email')">
				<template #label>
					<BaseLabel :label="$t('formLabels.email')" :tooltip-content="$t('info.email')" />
				</template>
				<el-input
					v-model.trim="formData.alt_email"
					type="text"
					name="alt_email"
					:class="{
						error: v$.alt_email.$error,
					}"
					:disabled="disabled"
					@change="v$.alt_email.$touch"
				/>
				<span v-if="v$.alt_email.$error" class="text-xs text-red-500 mt-2">{{ v$.alt_email.$errors[0].$message }}</span>
			</el-form-item>

			<div class="flex items-start col-span-8 sm:col-span-4 label-upper-dropdown">
				<div class="w-32 flex-initial mt-6">
					<BaseCountryDropdown
						v-model.trim="formData.alt_telephone_country_code"
						:dropdown-option="getCountry"
						:get-selected-country="getSelectedCountry"
						:disabled="disabled"
						@selected-value="dropdownSelectedCountryCodeValue"
					/>
				</div>
				<el-form-item class="mb-0 flex-1 ml-4 mt-6" :label="$t('formLabels.telephone_no')">
					<template #label>
						<BaseLabel :label="$t('formLabels.telephone_no')" :tooltip-content="$t('info.telephone_no')" />
					</template>
					<el-input
						v-model.trim="formData.alt_telephone"
						type="text"
						name="alt_telephone"
						maxLength="10"
						:class="{ error: v$.alt_telephone.$error }"
						:disabled="disabled"
						@change="v$.alt_telephone.$touch"
						@keypress="NumbersOnly(e)"
					/>
					<span v-if="v$.alt_telephone.$error" class="text-xs text-red-500 mt-2">{{ v$.alt_telephone.$errors[0].$message }}</span>
				</el-form-item>
			</div>

			<div class="flex items-start col-span-8 sm:col-span-4 label-upper-dropdown">
				<div class="w-32 flex-initial mt-6">
					<BaseCountryDropdown
						v-model.trim="formData.alt_mobile_country_code"
						:dropdown-option="getCountry"
						:get-selected-country="getSelectedCountry"
						:disabled="disabled"
						@selected-value="dropdownSelectedValue"
					/>
				</div>
				<el-form-item class="mb-0 flex-1 ml-4 mt-6" :label="$t('formLabels.contact_number')">
					<template #label>
						<BaseLabel :label="$t('formLabels.contact_number')" :tooltip-content="$t('info.contact_number')" />
					</template>
					<el-input
						v-model.trim="formData.alt_mobile"
						type="text"
						name="alt_mobile"
						maxLength="10"
						:class="{ error: v$.alt_mobile.$error }"
						:disabled="disabled"
						@change="v$.alt_mobile.$touch"
						@keypress="NumbersOnly(e)"
					/>
					<span v-if="v$.alt_mobile.$error" class="text-xs text-red-500 mt-2">{{ v$.alt_mobile.$errors[0].$message }}</span>
				</el-form-item>
			</div>
		</el-form>
		<!-- buttons -->
		<div class="pt-4 text-right">
			<novok-button class="btn-dark my-1" @click.prevent="cancelClick"
				><span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span
				><i class="fa-solid fa-xmark sm:hidden"></i
			></novok-button>

			<novok-button v-if="!disabled" class="my-1" type="info" :loading="loading" :disabled="loading" @click.prevent="onSubmit"
				>{{ $t("buttons.addSupplierUser") }}
			</novok-button>
		</div>
	</div>
</template>
