<script setup lang="ts">
	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});
	useHead({
		title: "View Request",
	});
</script>

<template>
	<ProjectPipelineRequestViewForm />
</template>
