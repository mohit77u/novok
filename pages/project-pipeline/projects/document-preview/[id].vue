<script setup lang="ts">
	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});
	useHead({
		title: "View Document",
	});
</script>

<template>
	<ProjectPipelineProjectDocumentPreview />
</template>
