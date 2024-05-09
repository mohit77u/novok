<script setup lang="ts">
	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});
	useHead({
		title: "Add Request",
	});
</script>

<template>
	<ProjectPipelineRequestForm />
</template>
