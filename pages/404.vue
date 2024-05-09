<script lang="ts" setup>
	import { ElButton } from "element-plus";
	import { sidebarItemStore } from "~/store/sidebarItem";

	definePageMeta({
		layout: "empty",
	});
	const sideBarstore = sidebarItemStore();
	const localePath = useLocalePath();
	const router = useRouter();

	const backClick = () => {
		const authToken = useCookie("auth_token");
		if (authToken.value !== undefined) {
			navigateTo(localePath("/dashboard"));
			sideBarstore.setSidebarItem("1");
			sideBarstore.setActiveSidebarItem("1");
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
		<div class="flex flex-col md:flex-row flex-1 justify-center items-center px-5 text-center md:text-left h-[calc(100vh-66px)]">
			<NuxtImg class="max-h-[300px] xl:max-h-[500px] sm:h-3/6 inline-block" src="/images/404.svg" alt="404" />
			<div class="text-white mt-10 md:mt-0 md:ml-10">
				<h1 class="text-5xl sm:text-6xl lg:text-7xl 2xl:text-8xl font-bold mb-3 md:mb-5 lg:mb-8 xl:mb-10">404</h1>
				<h6 class="text-2xl 2xl:text-3xl font-bold mb-2">Oops. This page has gone missing.</h6>
				<p class="text-lg mb-10">You may have mistyped the address or the page may have moved.</p>
				<novok-button class="btn-white !text-primary font-semibold" @click="backClick">Back to Dashboard</novok-button>
			</div>
		</div>
	</div>
</template>
<style>
	/* @import "~/assets/css/main.css"; */
</style>
