<!-- eslint-disable vue/require-valid-default-prop -->
<script lang="ts" setup>
	const selectedValue = ref<any>([]);
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
		@change="change"
		@remove-tag="removeTag"
		@visible-change="visibleChange"
	>
		<el-option v-for="(item, col) in dropdownOption" :key="col" :label="item.label" :value="item.value"> </el-option>
	</el-select>
</template>
