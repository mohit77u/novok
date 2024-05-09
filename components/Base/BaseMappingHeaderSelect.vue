<!-- eslint-disable vue/require-valid-default-prop -->
<script lang="ts" setup>
	const selectedValue = ref("");
	const props = defineProps({
		dropdownOption: {
			type: Array,
			default: [],
		},
		getSelectedCountry: {
			type: Object,
			default: {},
		},
		getSelectedData: {
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
		remote: {
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
	const emit = defineEmits(["value", "selected-value", "remote-search"]);

	watch(
		() => props.value,
		(currData) => {
			selectedValue.value = currData;
		},
		{ deep: true, immediate: true }
	);

	const change = (val: any) => {
		emit("value", val);
		emit("selected-value", val);
	};

	const remoteMethod = (val: any) => {
		emit("remote-search", val);
	};

	const keypress = (e: any) => {
		if (props.numberOnly) {
			return NumbersOnly(e, "");
		}
	};
</script>

<template>
	<el-select
		v-model="selectedValue"
		class="w-full"
		filterable
		remote-show-suffix
		:disabled="disabled"
		:default-first-option="false"
		:clearable="clearable"
		@change="change"
		@keypress="keypress(e)"
	>
		<el-option v-for="(item, index) in dropdownOption" :key="'select_' + index" :label="item" :value="item" />
	</el-select>
</template>
