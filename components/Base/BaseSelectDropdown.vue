<!-- eslint-disable vue/require-valid-default-prop -->
<script lang="ts" setup>
	const selectedValue = ref<any>({
		label: "",
		value: "",
	});
	const props = defineProps({
		dropdownOption: {
			type: Array,
			default: [],
		},
		getSelectedCountry: {
			type: Object,
			default: {},
		},

		numberOnly: {
			type: Boolean,
			default: true,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		isRemoteFilter: {
			type: Boolean,
			default: false,
		},
		name: {
			type: String,
			default: "",
		},
		clearable: {
			type: Boolean,
			default: false,
		},
		value: {
			type: String,
			default: "",
		},
	});
	const emit = defineEmits(["selected-value", "search-value", "remote-search", "dropdown-change", "remove-tag", "value"]);

	const change = (val: any) => {
		emit("value", val);
		emit("selected-value", val);
	};

	const visibleChange = (val: any) => {
		if (val) {
			emit("dropdown-change", props.name);
		}
	};

	const remoteMethod = (val: any) => {
		emit("remote-search", val);
	};

	const keypress = (e: any) => {
		if (props.numberOnly) {
			return NumbersOnly(e, "");
		}
	};

	const removeTag = (val: any) => {
		emit("remove-tag", val);
	};

	watch(
		() => props.getSelectedCountry,
		(currData) => {
			selectedValue.value = currData?.value;
		},
		{ deep: true, immediate: true }
	);
</script>

<template>
	<el-select
		v-if="isRemoteFilter"
		v-model="selectedValue"
		class="w-full"
		filterable
		remote
		:remote-method="remoteMethod"
		remote-show-suffix
		:disabled="disabled"
		:default-first-option="false"
		:clearable="clearable"
		@change="change"
		@keypress="keypress(e)"
		@visible-change="visibleChange"
		@remove-tag="removeTag"
	>
		<el-option v-for="item in dropdownOption" :key="item.value" :label="item.label" :value="item.value" :disabled="item.disabled ?? false" />
	</el-select>

	<el-select
		v-else
		v-model="selectedValue"
		class="w-full"
		filterable
		:disabled="disabled"
		:default-first-option="false"
		:clearable="clearable"
		@change="change"
		@keypress="keypress(e)"
		@visible-change="visibleChange"
		@remove-tag="removeTag"
	>
		<el-option v-for="item in dropdownOption" :key="item.value" :label="item.label" :value="item.value" :disabled="item.disabled ?? false" />
	</el-select>
</template>
