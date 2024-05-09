<script setup lang="ts">
	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});
	useHead({
		title: "View Role",
	});
</script>

<template>
	<RolesAddEditForm :disabled="true" />
</template>
