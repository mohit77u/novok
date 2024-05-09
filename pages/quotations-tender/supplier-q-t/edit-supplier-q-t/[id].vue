<script setup lang="ts">
	definePageMeta({
		middleware: ["auth"],
	});

	useHead({
		title: "Edit Supplier Quotations & Tender",
	});

	const localePath = useLocalePath();
	const fullscreenLoading = ref(false);

	onMounted(() => {});
</script>

<template>
	<quotations-tender-supplier-form />
</template>
