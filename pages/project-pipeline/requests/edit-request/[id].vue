<script setup lang="ts">
	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});
	useHead({
		title: "Edit Request",
	});
</script>

<template>
	<ProjectPipelineRequestForm />
</template>
