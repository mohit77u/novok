<script setup lang="ts">
	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});
	useHead({
		title: "Add Role",
	});
</script>

<template>
	<RolesAddEditForm />
</template>
