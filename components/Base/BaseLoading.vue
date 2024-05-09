<template>
	<div v-if="value" class="h-full absolute w-full flex justify-center items-center bg-transparent/10 z-[100]">
		<div class="w-12 h-12 rounded-full animate-spin border-4 border-solid border-l-primary border-b-primary border-t-white/50 border-r-white/50"></div>
		
	</div>
</template>

<script setup lang="ts">
	// import { useFullscreenLoading } from "~/store/fullscreenLoading";

	const props = defineProps({
		value: {
			type: Boolean,
			default: false,
		},
	});

	// const fullscreenLoading = useFullscreenLoading();

	// const isLoading = computed(() => {
	// 	return fullscreenLoading.getLoading;
	// });
</script>

<style lang="scss" scoped>
</style>
