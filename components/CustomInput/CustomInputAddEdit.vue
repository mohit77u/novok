<template>
	<el-form-item
		v-for="custom_input in customData"
		:rules="[{ required: custom_input?.is_required }]"
		:key="custom_input.id"
		:label="$t('formLabels.key_supplier_comment')"
		:class="customClass"
	>
		<template #label>
			<BaseLabel :label="custom_input.input_label" />
		</template>

		<!-- If input text -->
		<el-input
			v-if="custom_input.input_type === 'text'"
			v-model="formData[custom_input.input_label.toLowerCase().replace(/ /g, '_')]"
			type="text"
			:name="custom_input.input_label"
			:disabled="disabled"
			:maxlength="custom_input.max_length"
			:minlength="custom_input.min_length"
			:class="{
				error: v$[custom_input.input_label.toLowerCase().replace(/ /g, '_')]?.$error,
			}"
			@change="v$[custom_input.input_label.toLowerCase().replace(/ /g, '_')]?.$touch"
		/>

		<!-- If input textarea -->
		<el-input
			v-else-if="custom_input.input_type === 'textarea'"
			v-model="formData[custom_input.input_label.toLowerCase().replace(/ /g, '_')]"
			:autosize="{ minRows: 1, maxRows: 4 }"
			type="textarea"
			class="mt-[15px]"
			:name="custom_input.input_label"
			:disabled="disabled"
			:maxlength="custom_input.max_length"
			:minlength="custom_input.min_length"
			:class="{
				error: v$[custom_input.input_label.toLowerCase().replace(/ /g, '_')]?.$error,
			}"
			@change="v$[custom_input.input_label.toLowerCase().replace(/ /g, '_')]?.$touch"
		/>

		<!-- If input dropdown -->
		<BaseSelectDropdown
			v-else-if="custom_input.input_type === 'dropdown'"
			v-model="formData[custom_input.input_label.toLowerCase().replace(/ /g, '_')]"
			:name="custom_input.input_label"
			:disabled="disabled"
			:dropdown-option="dropdownOptions(custom_input.metadata)"
			:class="{
				error: v$[custom_input.input_label.toLowerCase().replace(/ /g, '_')]?.$error,
			}"
			@selected-value="v$[custom_input.input_label.toLowerCase().replace(/ /g, '_')]?.$touch"
		/>

		<!-- If input checkbox -->
		<el-checkbox-group
			v-else-if="custom_input.input_type === 'checkbox'"
			v-model="formData[custom_input.input_label.toLowerCase().replace(/ /g, '_')]"
			:disabled="disabled"
		>
			<el-checkbox v-for="option in custom_input.metadata" :key="option" :label="option" />
		</el-checkbox-group>

		<!-- If input radio -->
		<div class="w-full pt-4" v-else-if="custom_input.input_type === 'radio'">
			<el-radio-group v-model="formData[custom_input.input_label.toLowerCase().replace(/ /g, '_')]" :disabled="disabled" size="large">
				<el-radio :label="custom_input.metadata[0].value">{{ custom_input.metadata[0].label }}</el-radio>
				<el-radio :label="custom_input.metadata[1].value">{{ custom_input.metadata[1].label }}</el-radio>
			</el-radio-group>
		</div>

		<!-- If input date time -->
		<el-date-picker
			v-else-if="custom_input.input_type === 'date-time'"
			v-model="formData[custom_input.input_label.toLowerCase().replace(/ /g, '_')]"
			type="datetime"
			placeholder="DD/MM/YYYY HH:mm"
			format="DD/MM/YYYY hh:mm A"
			value-format="YYYY-MM-DD HH:mm"
			:name="custom_input.input_label"
			:disabled="disabled"
			:class="{
				error: v$[custom_input.input_label.toLowerCase().replace(/ /g, '_')]?.$error,
			}"
			@change="changeDate"
		/>

		<!-- If input date -->
		<el-date-picker
			v-else-if="custom_input.input_type === 'date'"
			v-model="formData[custom_input.input_label.toLowerCase().replace(/ /g, '_')]"
			type="date"
			placeholder="DD/MM/YYYY"
			format="DD/MM/YYYY"
			value-format="YYYY-MM-DD"
			:name="custom_input.input_label"
			:disabled="disabled"
			:class="{
				error: v$[custom_input.input_label.toLowerCase().replace(/ /g, '_')]?.$error,
			}"
			@change="v$[custom_input.input_label.toLowerCase().replace(/ /g, '_')]?.$touch"
		/>

		<!-- If input time -->
		<el-time-picker
			v-else-if="custom_input.input_type === 'time'"
			v-model="formData[custom_input.input_label.toLowerCase().replace(/ /g, '_')]"
			type="date"
			format="hh:mm:ss"
			value-format="HH:mm"
			placeholder="hh:mm:ss"
			:name="custom_input.input_label"
			:disabled="disabled"
			:class="{
				error: v$[custom_input.input_label.toLowerCase().replace(/ /g, '_')]?.$error,
			}"
			@change="v$[custom_input.input_label.toLowerCase().replace(/ /g, '_')]?.$touch"
		/>

		<custom-input-file
			v-else-if="custom_input.input_type === 'file'"
			:id="custom_input.label?.replace(/ /g, '_')"
			:ref="custom_input.label?.replace(/ /g, '_')"
			:extensions-type="custom_input.metadata?.extension_type"
			:file-size="custom_input.metadata?.max_upload_size"
			:form-data="formData[custom_input.input_label.toLowerCase().replace(/ /g, '_')]"
			:disabled="disabled"
			:name="custom_input.input_label"
			:class-name="{
				error: v$[custom_input.input_label.toLowerCase().replace(/ /g, '_')]?.$error,
			}"
			@show-error="(value) => (showError = value)"
			@upload-file="
				(value) => {
					formData[custom_input.input_label.toLowerCase().replace(/ /g, '_')] = value.file;
				}
			"
			@handle-remove="
				(value) => {
					formData[custom_input.input_label.toLowerCase().replace(/ /g, '_')] = '';
				}
			"
		/>

		<div class="flex-wrap w-full">
			<span
				v-if="v$[custom_input.input_label.toLowerCase().replace(/ /g, '_')]?.$error && custom_input.input_type !== 'file'"
				class="text-xs text-red-500 mt-2"
				>{{ v$[custom_input.input_label.toLowerCase().replace(/ /g, "_")]?.$errors[0].$message }}</span
			>

			<span
				v-if="v$[custom_input.input_label.toLowerCase().replace(/ /g, '_')]?.$error && custom_input.input_type === 'file' && !showError"
				class="text-xs text-red-500 mt-2"
				>{{ v$[custom_input.input_label.toLowerCase().replace(/ /g, "_")]?.$errors[0].$message }}</span
			>
		</div>
	</el-form-item>
</template>

<script setup lang="ts">
	import useVuelidate from "@vuelidate/core";
	import { helpers, maxLength, minLength, required, requiredIf } from "@vuelidate/validators";

	const props = defineProps({
		customData: {
			type: Array,
			default: [],
		},

		moduleName: {
			type: String,
			default: "",
		},

		disabled: {
			type: Boolean,
			default: false,
		},

		customClass: {
			type: String,
			default: "",
		},
	});

	const formData = reactive<any>({});
	const checkRules = reactive<any>({});
	const showError = ref(false);
	const emit = defineEmits(["update-data"]);

	watch(
		() => props.customData,
		(curData) => {
			curData.forEach((data: any) => {
				if (data.input_type === "checkbox" && typeof data.input_value === "string") {
					formData[data.input_label.toLowerCase().replace(/ /g, "_")] = data.input_value.split(",");
				} else if (data.input_type === "checkbox") {
					formData[data.input_label.toLowerCase().replace(/ /g, "_")] = data.input_value ?? [];
				} else if (data.input_type === "radio") {
					formData[data.input_label.toLowerCase().replace(/ /g, "_")] = isNaN(parseInt(data.input_value)) ? "" : parseInt(data.input_value);
				} else {
					formData[data.input_label.toLowerCase().replace(/ /g, "_")] = data.input_value ?? "";
				}

				checkRules[data.input_label.toLowerCase().replace(/ /g, "_")] = {
					input_label: data.input_label,
					input_type: data.input_type,
					is_required: data.is_required,
					min_length: data.min_length,
					max_length: data.max_length,
				};
			});
		},
		{ deep: true, immediate: true }
	);

	const rules = computed(() => {
		const validationRules: any = {};
		for (const key in formData) {
			if (checkRules[key].input_type === "text" || checkRules[key].input_type === "textarea") {
				validationRules[key] = {
					requiredIf: helpers.withMessage(`${checkRules[key].input_label} is Required`, requiredIf(checkRules[key].is_required)),
					maxLength: helpers.withMessage(
						`${checkRules[key].input_label} must have ${checkRules[key].max_length} characters`,
						maxLength(checkRules[key].max_length)
					),
					minLength: helpers.withMessage(
						`${checkRules[key].input_label} must have at least ${checkRules[key].min_length} characters`,
						minLength(checkRules[key].min_length)
					),
				};
			} else {
				validationRules[key] = {
					requiredIf: helpers.withMessage(`${checkRules[key].input_label} is Required`, requiredIf(checkRules[key].is_required)),
				};
			}
		}

		return validationRules;
	});

	const v$ = useVuelidate(rules, formData);

	const dropdownOptions = (options: any) => {
		return options.map((item: string) => {
			return {
				label: item,
				value: item,
			};
		});
	};

	const isValidate = () => {
		v$.value.$validate();
		if (!v$.value.$error) {
			updateData();
			return true;
		} else {
			return false;
		}
	};

	const updateData = () => {
		const data = props.customData.map((data: any) => {
			data.module_name = props.moduleName;
			data.input_value = formData[data.input_label.toLowerCase().replace(/ /g, "_")];
			return data; // Return the modified object
		});

		emit("update-data", data);
	};

	defineExpose({ isValidate, updateData });
</script>

<style lang="scss" scoped>
</style>
