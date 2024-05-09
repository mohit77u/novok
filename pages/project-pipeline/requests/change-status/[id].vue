<script setup lang="ts">
	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});
	useHead({
		title: "Change Request Status",
	});
</script>

<template>
	<ProjectPipelineRequestChangeStatus />
</template>
