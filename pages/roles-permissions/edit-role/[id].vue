<script setup lang="ts">
	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});
	useHead({
		title: "Edit Role",
	});
</script>

<template>
	<RolesAddEditForm />
</template>
