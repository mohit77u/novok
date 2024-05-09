<script setup lang="ts">
	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});
	useHead({
		title: "Edit Signing Entity",
	});
</script>

<template>
	<SigningEntityCreateForm />
</template>
