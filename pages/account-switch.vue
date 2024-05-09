<template>
	<div class="bg-black/10 flex items-center justify-center h-screen">
		<div class="text-center">
			<i class="fas fa-exchange-alt animate-pulse text-5xl text-primary mb-6"></i>
			<p class="text-2xl text-primary font-bold mb-2">Your account switching...</p>
			<p class="text-lg text-primary font-semibold">Please wait for a moment.</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { sidebarItemStore } from "~/store/sidebarItem";

	const sidebarStore = sidebarItemStore();
	const localePath = useLocalePath();

	definePageMeta({
		layout: "empty",
	});

	onMounted(() => {
		setTimeout(() => {
			sidebarStore.setSidebarItem("1"); // 1-dashboard
			sidebarStore.setActiveSidebarItem("1");

			// navigateTo(localePath("/dashboard")).then(() => {
			// 	window.location.reload();
			// });

			window.location.href = localePath("/dashboard");
		}, 3000);
	});
</script>

<style lang="css" scoped>
	/* Custom styles */
	@keyframes pulse {
		0% {
			transform: scale(0.95);
			box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
		}

		50% {
			transform: scale(1);
			box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
		}

		100% {
			transform: scale(0.95);
			box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
		}
	}
</style>
