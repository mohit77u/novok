<script setup lang="ts">
	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});

	useHead({
		title: "Add Quotations & Tender",
	});

	const localePath = useLocalePath();
	const fullscreenLoading = ref(false);

	onMounted(() => {});
</script>

<template>
	<quotations-tender-add-edit-form />
</template>
