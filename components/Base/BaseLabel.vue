<script setup>
	const props = defineProps({
		tooltipContent: {
			type: String,
			default: "",
		},
		label: {
			type: String,
			default: "",
		},
		icon: {
			type: String,
			default: "",
		},
		link: {
			type: String,
			default: "",
		},
		isShowLabel: {
			type: Boolean,
			default: true,
		},
	});
</script>

<template>
	<span>
		<span class="inputLabel">{{ label }}</span>
		<el-tooltip popper-class="max-w-80"  v-if="tooltipContent && isShowLabel" class="box-item" effect="dark" :content="tooltipContent" placement="top">
			<template #content="">
				{{ tooltipContent }}
				<span v-if="link"
					><a :href="link" target="_blank" class="underline underline-offset-4 font-bold"> {{ $t("formLabels.click_here") }}</a></span
				>
			</template>

			<template v-if="icon">
				<span v-html="icon"></span>
			</template>
			<i class="fa-regular fa-circle-info ml-2" v-else></i>
		</el-tooltip>
	</span>
</template>
