<!-- eslint-disable vue/require-valid-default-prop -->
<script lang="ts" setup>
	import type { CheckboxValueType } from "element-plus";

	const selectedValue = ref<any>([]);
	const checkAll = ref(false);
	const indeterminate = ref(false);

	const props = defineProps({
		dropdownOption: {
			type: Array,
			default: [],
		},
		getSelectedClient: {
			type: Object,
			default: {},
		},
		placeholder: {
			type: String,
			default: "",
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		collapseTag: {
			type: Boolean,
			default: false,
		},
	});
	const emit = defineEmits(["selected-value", "search-value", "remote-search", "remove-tag", "visible-change"]);

	const change = (val: any) => {
		emit("selected-value", val);
	};

	const remoteMethod = (val: any) => {
		emit("remote-search", val);
	};

	const removeTag = (val: any) => {
		emit("remove-tag", val);
	};

	const visibleChange = (val: any) => {
		emit("visible-change", val);
	};

	watch(selectedValue, (val) => {
		if (val.length === 0) {
			checkAll.value = false;
			indeterminate.value = false;
		} else if (val.length === props.dropdownOption.length) {
			checkAll.value = true;
			indeterminate.value = false;
		} else {
			indeterminate.value = true;
		}
	});

	watch(
		() => props.getSelectedClient,
		(currData) => {
			selectedValue.value = [];
			if (currData.length) {
				selectedValue.value = currData?.map((item: any) => item.value);
			}
		},
		{ deep: true, immediate: true }
	);
	watch(
		() => props.disabled,
		(currData) => {
			if (currData) {
				selectedValue.value = [];
			}
		},
		{ deep: true, immediate: true }
	);

	const handleCheckAll = (val: CheckboxValueType) => {
		indeterminate.value = false;
		if (val) {
			selectedValue.value = props.dropdownOption.map((_: any) => _.value);
			emit("selected-value", selectedValue.value);
		} else {
			selectedValue.value = [];
		}
	};
</script>

<template>
	<el-select
		v-model="selectedValue"
		class="w-full"
		:placeholder="placeholder"
		filterable
		:collapse-tags="collapseTag"
		remote-show-suffix
		remote
		:remote-method="remoteMethod"
		:default-first-option="false"
		:disabled="disabled"
		multiple
		:popper-append-to-body="false"
		popper-class="custom-header"
		@change="change"
		@remove-tag="removeTag"
		@visible-change="visibleChange"
	>
		<template #header>
			<el-checkbox v-model="checkAll" :indeterminate="indeterminate" @change="handleCheckAll"> All </el-checkbox>
		</template>
		<el-option v-for="(item, col) in dropdownOption" :key="col" :label="item.label" :value="item.value"> </el-option>
	</el-select>
</template>
