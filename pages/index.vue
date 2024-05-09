<template>
	<div>
		<NuxtLoadingIndicator />
		<NuxtPage />
	</div>
</template>

<script lang="ts" setup>
	import { sidebarItemStore } from "~/store/sidebarItem";
	const sideBarStore = sidebarItemStore();
	const localePath = useLocalePath();

	onMounted(() => {
		sideBarStore.setSidebarItem("1");
		sideBarStore.setActiveSidebarItem("1");
		const authToken = useCookie("auth_token");

		if (authToken.value !== undefined) {
			navigateTo(localePath("/dashboard"));
		} else {
			navigateTo(localePath("/sign-in"));
		}
	});
</script>
