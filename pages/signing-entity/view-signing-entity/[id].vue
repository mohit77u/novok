<script setup lang="ts">
	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});
	useHead({
		title: "View Signing Entity",
	});
</script>

<template>
	<SigningEntityView />
</template>
