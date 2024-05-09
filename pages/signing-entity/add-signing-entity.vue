<script setup lang="ts">
	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});
	useHead({
		title: "Add Signing Entity",
	});
</script>

<template>
	<SigningEntityCreateForm />
</template>
