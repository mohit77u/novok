<script lang="ts" setup>
	import { ElButton } from "element-plus";
	import { sidebarItemStore } from "~/store/sidebarItem";

	definePageMeta({
		layout: "empty",
	});
	const sidebarStore = sidebarItemStore();
	const localePath = useLocalePath();
	const router = useRouter();

	const backClick = () => {
		const authToken = useCookie("auth_token");
		if (authToken.value !== undefined) {
			navigateTo(localePath("/dashboard"));
			sidebarStore.setSidebarItem("1");
			sidebarStore.setActiveSidebarItem("1");
			// router.go(-1);
		} else {
			navigateTo(localePath("/sign-in"));
		}
	};
</script>
<template>
	<div class="bg-primary h-screen flex flex-col">
		<div class="flex justify-between items-center lg:absolute w-full p-3 lg:p-5 2xl:p-6 3xl:p-8">
			<div>
				<NuxtImg class="cursor-pointer" src="/images/logo-white.svg" alt="logo" @click.prevent="navigateTo(localePath('/'))" />
			</div>
		</div>
		<div class="flex flex-col md:flex-row flex-1 justify-center items-center px-5 text-center md:text-left">
			<NuxtImg class="w-full max-w-xs md:max-w-sm lg:max-w-md 2xl:max-w-xl inline-block" src="/images/403.svg" alt="403" />
			<div class="text-white mt-10 md:mt-0 md:ml-10">
				<h1 class="text-5xl sm:text-6xl lg:text-7xl 2xl:text-8xl font-bold mb-3 md:mb-5 lg:mb-8 xl:mb-10">403</h1>
				<h6 class="text-2xl 2xl:text-3xl font-bold mb-2">Access Denied</h6>
				<p class="text-lg mb-10">You don’t have permission to access requested page.</p>
				<novok-button class="btn-white !text-primary font-semibold" @click="backClick">Back to Dashboard</novok-button>
			</div>
		</div>
	</div>
</template>
<style>
	/* @import "~/assets/css/main.css"; */
</style>
