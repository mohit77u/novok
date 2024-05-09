<template>
	<div v-for="data in customInputs" :key="data.id">
		<label class="font-bold">{{ data.input_label }}</label>
		<p class="truncate" v-if="data.input_type == 'radio'">{{ getValueLabel(data.metadata, data.input_value) || "-" }}</p>
		<p class="truncate" v-else-if="data.input_type == 'time'">{{ getFormattedTimeValueWithFormat(data.input_value, "HH:mm") || "-" }}</p>
		<p class="truncate" v-else-if="data.input_type == 'date'">{{ getFormattedDateValue(data.input_value) || "-" }}</p>
		<p class="truncate" v-else-if="data.input_type == 'date-time'">{{ getFormattedDateTimeValue(data.input_value) || "-" }}</p>
		<p class="truncate" v-else-if="data.input_type == 'file' && data.input_value">
			<a :href="data.input_value" target="_blank" class="text-primary block truncate">{{ getFileNameFromURL(data.input_value) || "-" }}</a>
		</p>
		<p class="truncate" v-else>{{ data.input_value || "-" }}</p>
	</div>
</template>

<script setup>
	import {
		getFormattedDateTimeValue,
		getFormattedDateValue,
		getFormattedTimeValueWithFormat,
		getValueLabel,
		getFileNameFromURL,
	} from "~/helper/common";

	const props = defineProps({
		customInputs: {
			type: Array,
			default: [],
		},
	});
</script>

<style lang="scss" scoped>
</style>
