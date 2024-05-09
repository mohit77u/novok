<template>
	<el-form v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="flex flex-col relative">
		<div id="custom_field">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-7 md:gap-8 xl:gap-10">
				<el-form-item v-if="!hideTabName.includes(formData.module_name)" class="mb-0 flex-1" :rules="[{ required: true }]">
					<template #label>
						<BaseLabel :label="$t('formLabels.tab_name')" :tooltip-content="$t('info.tab_name')" />
					</template>

					<BaseSelectDropdown v-model="formData.tab_name" :dropdown-option="tabOptions" />

					<span v-if="v$.tab_name.$error" class="text-xs text-red-500 mt-2">{{ v$.tab_name.$errors[0].$message }}</span>
				</el-form-item>

				<el-form-item class="mb-0 flex-1" :rules="[{ required: true }]">
					<template #label>
						<BaseLabel :label="$t('formLabels.input_label')" :tooltip-content="$t('info.input_label')" />
					</template>

					<el-input
						v-model="formData.input_label"
						type="text"
						name="input_label"
						:disabled="disabled"
						maxLength="100"
						:class="{
							error: v$.input_label.$error,
						}"
						@keypress="CharcterWithWhitespace"
						@change="v$.input_label.$touch"
					/>

					<span v-if="v$.input_label.$error" class="text-xs text-red-500 mt-2">{{ v$.input_label.$errors[0].$message }}</span>
				</el-form-item>

				<el-form-item class="mb-0 flex-1" :rules="[{ required: true }]">
					<template #label>
						<BaseLabel :label="$t('formLabels.input_type')" :tooltip-content="$t('info.input_type')" />
					</template>

					<BaseSelectDropdown v-model="formData.input_type" :dropdown-option="inputTypeOptions" @selectedValue="inputTypeChange" />

					<span v-if="v$.input_type.$error" class="text-xs text-red-500 mt-2">{{ v$.input_type.$errors[0].$message }}</span>
				</el-form-item>

				<el-form-item class="mb-0 flex-1" :rules="[{ required: true }]">
					<template #label>
						<BaseLabel :label="$t('formLabels.is_required')" :tooltip-content="$t('info.is_required')" />
					</template>
					<div class="w-full pt-4">
						<el-radio-group v-model="formData.is_required" size="large">
							<el-radio :label="1">Yes</el-radio>
							<el-radio :label="0">No</el-radio>
						</el-radio-group>
					</div>
				</el-form-item>

				<el-form-item v-if="isShowLength" class="mb-0 flex-1" :rules="[{ required: true }]">
					<template #label>
						<BaseLabel :label="$t('formLabels.max_length')" :tooltip-content="$t('info.max_length')" />
					</template>

					<el-input
						v-model.number="formData.max_length"
						type="text"
						name="max_length"
						:disabled="disabled"
						maxLength="3"
						:class="{
							error: v$.max_length.$error,
						}"
						@keypress="NumbersOnly"
						@change="
							v$.max_length.$touch;
							handleLength('max');
						"
					/>

					<span v-if="v$.max_length.$error" class="text-xs text-red-500 mt-2">{{ v$.max_length.$errors[0].$message }}</span>

					<span v-if="!v$.max_length.$error && lengthError.maxLength" class="text-xs text-red-500 mt-2">{{ lengthError.maxLength }}</span>
				</el-form-item>

				<el-form-item v-if="isShowLength" class="mb-0 flex-1" :rules="[{ required: true }]">
					<template #label>
						<BaseLabel :label="$t('formLabels.min_length')" :tooltip-content="$t('info.min_length')" />
					</template>

					<el-input
						v-model.number="formData.min_length"
						type="text"
						name="min_length"
						:disabled="disabled"
						maxLength="3"
						:class="{
							error: v$.min_length.$error,
						}"
						@keypress="NumbersOnly"
						@change="
							v$.min_length.$touch;
							handleLength('min');
						"
					/>

					<span v-if="v$.min_length.$error" class="text-xs text-red-500 mt-2">{{ v$.min_length.$errors[0].$message }}</span>

					<span v-if="!v$.min_length.$error && lengthError.minLength" class="text-xs text-red-500 mt-2">{{ lengthError.minLength }}</span>
				</el-form-item>
			</div>

			<h3 v-if="isShowOptions" class="pb-3 pt-4 text-2xl font-bold my-6">{{ $t("header.options_metadata") }}</h3>

			<div v-if="isShowOptions" class="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-7 md:gap-8 xl:gap-10">
				<el-form-item class="mb-0 flex-1" :rules="[{ required: true }]">
					<template #label>
						<BaseLabel :label="$t('formLabels.add_option')" :tooltip-content="$t('info.add_option')" />
					</template>

					<el-input
						v-model="metadata.option"
						type="text"
						name="option"
						maxLength="100"
						:class="{
							error: vmetadata$.option.$error,
						}"
						@change="vmetadata$.option.$touch"
					>
						<template #append>
							<novok-button type="info" class="!text-white" @click.prevent="addOptions">{{ $t("buttons.add") }} </novok-button>
						</template>
					</el-input>

					<span v-if="vmetadata$.option.$error" class="text-xs text-red-500 mt-2">{{ vmetadata$.option.$errors[0].$message }}</span>
					<span v-if="v$.metadata.$error" class="text-xs text-red-500 mt-2">{{ v$.metadata.$errors[0].$message }}</span>
				</el-form-item>

				<el-form-item class="mb-0 flex-1" :rules="[{ required: true }]">
					<template #label>
						<BaseLabel :label="$t('formLabels.options')" :tooltip-content="$t('info.options')" />
					</template>

					<div class="flex flex-wrap gap-2 pt-3">
						<el-tag
							v-for="tag in formData.metadata"
							:key="tag"
							effect="plain"
							class="border-primary"
							closable
							@close="removeOptions(tag)"
						>
							{{ tag }}
						</el-tag>
					</div>
				</el-form-item>
			</div>

			<h3 v-if="isShowRadio" class="pb-3 pt-4 text-2xl font-bold my-6">{{ $t("header.radio_metadata") }}</h3>

			<div v-if="isShowRadio" class="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-7 md:gap-8 xl:gap-10">
				<el-form-item class="mb-0 flex-1" :rules="[{ required: true }]">
					<template #label>
						<BaseLabel :label="$t('formLabels.option_yes')" :tooltip-content="$t('info.option_yes')" />
					</template>

					<el-input
						v-model="radio.option_yes"
						type="text"
						name="option_yes"
						maxLength="100"
						:class="{
							error: vradio$.option_yes.$error,
						}"
						@change="vradio$.option_yes.$touch"
					>
					</el-input>

					<span v-if="vradio$.option_yes.$error" class="text-xs text-red-500 mt-2">{{ vradio$.option_yes.$errors[0].$message }}</span>
				</el-form-item>

				<el-form-item class="mb-0 flex-1" :rules="[{ required: true }]">
					<template #label>
						<BaseLabel :label="$t('formLabels.option_no')" :tooltip-content="$t('info.option_no')" />
					</template>

					<el-input
						v-model="radio.option_no"
						type="text"
						name="option_no"
						maxLength="100"
						:class="{
							error: vradio$.option_no.$error,
						}"
						@change="vradio$.option_no.$touch"
					>
					</el-input>

					<span v-if="vradio$.option_no.$error" class="text-xs text-red-500 mt-2">{{ vradio$.option_no.$errors[0].$message }}</span>
				</el-form-item>
			</div>

			<h3 v-if="isShowFile" class="pb-3 pt-4 text-2xl font-bold my-6">{{ $t("header.file_metadata") }}</h3>

			<div v-if="isShowFile" class="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-7 md:gap-8 xl:gap-10">
				<el-form-item class="mb-0 flex-1" :rules="[{ required: true }]">
					<template #label>
						<BaseLabel :label="$t('formLabels.extension_type')" :tooltip-content="$t('info.extension_type')" />
					</template>

					<BaseMultiSelectDropdown
						size="small"
						name="extension_type"
						:dropdown-option="fileExtensionType"
						:get-selected-client="selectFileExtensionType"
						:collapse-tag="true"
						@selected-value="(value) => (filemeta.extension_type = value)"
					/>

					<span v-if="vfilemeta$.extension_type.$error" class="text-xs text-red-500 mt-2">
						{{ vfilemeta$.extension_type.$errors[0].$message }}
					</span>
				</el-form-item>

				<!-- <el-form-item class="mb-0 flex-1" :rules="[{ required: true }]">
					<template #label>
						<BaseLabel :label="$t('formLabels.max_allow_files')" :tooltip-content="$t('info.max_allow_files')" />
					</template>

					<el-input
						v-model.trim="filemeta.max_allow_files"
						type="text"
						name="max_allow_files"
						maxLength="2"
						:class="{
							error: vfilemeta$.max_allow_files.$error,
						}"
						@keypress="NumbersOnly"
						@change="vfilemeta$.max_allow_files.$touch"
					>
					</el-input>

					<span v-if="vfilemeta$.max_allow_files.$error" class="text-xs text-red-500 mt-2">{{
						vfilemeta$.max_allow_files.$errors[0].$message
					}}</span>
				</el-form-item> -->

				<el-form-item class="mb-0 flex-1" :rules="[{ required: true }]">
					<template #label>
						<BaseLabel :label="$t('formLabels.max_upload_size')" :tooltip-content="$t('info.max_upload_size')" />
					</template>

					<el-input
						v-model.trim="filemeta.max_upload_size"
						type="text"
						name="max_upload_size"
						maxLength="2"
						:class="{
							error: vfilemeta$.max_upload_size.$error,
						}"
						@keypress="NumbersOnly"
						@change="vfilemeta$.max_upload_size.$touch"
					>
					</el-input>

					<span v-if="vfilemeta$.max_upload_size.$error" class="text-xs text-red-500 mt-2">{{
						vfilemeta$.max_upload_size.$errors[0].$message
					}}</span>
				</el-form-item>
			</div>

			<div class="pt-6 text-right">
				<novok-button class="btn-dark my-1" @click="CancelRedirect('/settings/custom-fields')">
					<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
					<i class="fa-solid fa-xmark sm:hidden"> </i>
				</novok-button>

				<novok-button class="my-1" type="info" :loading="loading" :disabled="loading" @click.prevent="onSubmit"
					>{{ $t("buttons.save") }}
				</novok-button>
			</div>
		</div>
	</el-form>
</template>

<script setup lang="ts">
	import useVuelidate from "@vuelidate/core";
	import { helpers, required, requiredIf, minLength, maxLength, minValue } from "@vuelidate/validators";
	import { contractsTabOptions, suppliersAdminTabOptions, inputTypeOptions, fileExtensionType } from "~/helper/data";
	import { useCustomFieldsStore } from "~/store/customFields";

	const props = defineProps({
		moduleName: {
			type: String,
			default: "",
		},
		id: {
			type: Number,
			default: 0,
		},
	});

	const customFieldsStore = useCustomFieldsStore();
	const fullscreenLoading = ref<boolean>(false);
	const loading = ref<boolean>(false);
	const { t } = useI18n();
	const formHeight = ref<any>("");
	const hideTabName = ["request", "q-and-t-client", "q-and-t-supplier"];

	const formData = reactive<any>({
		module_name: "",
		tab_name: "",
		input_label: "",
		input_type: "",
		min_length: "",
		max_length: "",
		is_required: 0,
		metadata: [],
	});

	const lengthError = ref<any>({
		maxLength: "",
		minLength: "",
	});

	const metadata = reactive<any>({
		option: "",
	});

	const radio = reactive<any>({
		option_yes: "",
		option_no: "",
	});

	const filemeta = reactive<any>({
		extension_type: "",
		// max_allow_files: "",
		max_upload_size: "",
	});

	onMounted(async () => {
		formHeight.value = GetOffset("custom_field", 0);
		formData.module_name = props.moduleName;

		const pageDetails = {
			moduleName: props.moduleName,
		};

		if (hideTabName.includes(props.moduleName)) {
			formData.tab_name = "primary-details";
		}

		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));

		if (props.id > 0) {
			fullscreenLoading.value = true;

			try {
				const res: any = await useApiFetch(`/custom-fields/${props.id}`, {
					method: "GET",
				});

				Object.assign(formData, res?.data);

				if (isShowRadio.value) {
					radio.option_yes = formData?.metadata[0]?.label;
					radio.option_no = formData?.metadata[1]?.label;
				}

				if (isShowFile.value) {
					Object.assign(filemeta, formData?.metadata);
				}
			} catch {
			} finally {
				fullscreenLoading.value = false;
			}
		}
	});

	const tabOptions = computed(() => {
		if (props.moduleName === "supplier-admin") {
			return suppliersAdminTabOptions;
		} else {
			return contractsTabOptions;
		}
	});

	const handleLength = (type: any) => {
		if (type == "max") {
			if (formData.max_length < formData.min_length) {
				lengthError.value.maxLength = t("formValidations.min_length_value");
			} else {
				lengthError.value.maxLength = "";
			}
		} else {
			if (formData.min_length > formData.max_length) {
				lengthError.value.minLength = t("formValidations.max_length_value");
			} else {
				lengthError.value.minLength = "";
			}
		}
	};

	const isShowLength = computed(() => {
		const options = ["text", "textarea"];
		return options.includes(formData.input_type);
	});

	const isShowOptions = computed(() => {
		const options = ["checkbox", "dropdown"];
		return options.includes(formData.input_type);
	});

	const isShowRadio = computed(() => {
		return formData.input_type === "radio";
	});

	const isShowFile = computed(() => {
		return formData.input_type === "file";
	});

	const rules = computed(() => {
		return {
			tab_name: {
				required: helpers.withMessage(t("formValidations.tab_name"), required),
			},
			input_label: {
				required: helpers.withMessage(t("formValidations.input_label"), required),
			},
			input_type: {
				required: helpers.withMessage(t("formValidations.input_type"), required),
			},
			min_length: {
				requiredIf: helpers.withMessage(t("formValidations.min_length"), requiredIf(isShowLength.value)),
			},
			max_length: {
				requiredIf: helpers.withMessage(t("formValidations.max_length"), requiredIf(isShowLength.value)),
			},
			is_required: {
				required: helpers.withMessage(t("formValidations.is_required"), required),
			},
			metadata: {
				requiredIf: helpers.withMessage(t("formValidations.metadata"), requiredIf(isShowOptions.value || isShowRadio.value || isShowFile.value)),
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

	const rulesMetadata = computed(() => {
		return {
			option: {
				required: helpers.withMessage(t("formValidations.option"), required),
				unique: helpers.withMessage(t("formValidations.option_unique"), (value: string) => {
					const options: string[] = formData.metadata ? formData.metadata : [];
					return !options.map((option) => option.toLowerCase()).includes(value.toLowerCase());
				}),
			},
		};
	});

	const vmetadata$ = useVuelidate(rulesMetadata, metadata);

	const rulesRadio = computed(() => {
		return {
			option_yes: {
				required: helpers.withMessage(t("formValidations.option_yes"), required),
			},
			option_no: {
				required: helpers.withMessage(t("formValidations.option_no"), required),
			},
		};
	});

	const vradio$ = useVuelidate(rulesRadio, radio);

	const rulesFilemeta = computed(() => {
		return {
			extension_type: {
				required: helpers.withMessage(t("formValidations.extension_type"), required),
			},
			// max_allow_files: {
			// 	required: helpers.withMessage(t("formValidations.max_allow_files"), required),
			// },
			max_upload_size: {
				required: helpers.withMessage(t("formValidations.max_upload_size"), required),
				minValue: helpers.withMessage(t("formValidations.min_upload_size"), minValue(1)),
			},
		};
	});

	const vfilemeta$ = useVuelidate(rulesFilemeta, filemeta);

	const selectFileExtensionType = computed(() => {
		return fileExtensionType.filter((val) => {
			return filemeta.extension_type.includes(val.value);
		});
	});

	const inputTypeChange = (value: any) => {
		v$.value.$validate();
		vmetadata$.value.$validate();
		vradio$.value.$validate();
		vfilemeta$.value.$validate();

		formData.min_length = "";
		formData.max_length = "";
		formData.is_required = 0;
		formData.metadata = [];

		metadata.option = "";

		radio.option_yes = "";
		radio.option_no = "";

		filemeta.extension_type = "";
		// filemeta.max_allow_files = "";
		filemeta.max_upload_size = "";

		v$.value.$reset();
		vmetadata$.value.$reset();
		vradio$.value.$reset();
		vfilemeta$.value.$reset();
	};

	const addOptions = async () => {
		vmetadata$.value.$validate();
		if (!vmetadata$.value.$error) {
			const options: string[] = formData.metadata ? formData.metadata : [];
			options.push(metadata.option);

			metadata.option = "";
			formData.metadata = options;

			vmetadata$.value.$reset();
		}
	};

	const removeOptions = async (optionIndex: string) => {
		const options: string[] = formData.metadata;

		options.splice(options.indexOf(optionIndex), 1);
		formData.metadata = options;
	};

	const prepareForValidation = async () => {
		let isValidate = true;
		if (isShowRadio.value) {
			vradio$.value.$validate();
			if (vradio$.value.$error) {
				isValidate = false;
			} else {
				const radioMeta = [
					{
						label: radio.option_yes,
						value: 1,
					},
					{
						label: radio.option_no,
						value: 0,
					},
				];

				formData.metadata = radioMeta;
			}
		}

		if (isShowFile.value) {
			vfilemeta$.value.$validate();
			if (vfilemeta$.value.$error) {
				isValidate = false;
			} else {
				formData.metadata = filemeta;
			}
		}

		v$.value.$validate();
		if (v$.value.$error) {
			isValidate = false;
		}

		return isValidate;
	};

	const onSubmit = async () => {
		loading.value = true;
		try {
			const isValidate = await prepareForValidation();

			if (isValidate && !lengthError.value.minLength && !lengthError.value.maxLength) {
				let res = {
					message: "",
				};

				if (props.id > 0) {
					res = await useApiFetch(`/custom-fields/${props.id}`, {
						method: "PATCH",
						body: formData,
					});
				} else {
					res = await useApiFetch(`/custom-fields`, {
						method: "POST",
						body: formData,
					});
				}

				useToast("success", res?.message);
				CancelRedirect("/settings/custom-fields");
			}
		} catch (error) {
		} finally {
			loading.value = false;
		}
	};
</script>

