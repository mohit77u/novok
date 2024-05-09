<script lang="ts" setup>
	import { ElButton } from "element-plus";
	import { sidebarItemStore } from "~/store/sidebarItem";

	definePageMeta({
		layout: "empty",
	});

	const sideBarStore = sidebarItemStore();
	const localePath = useLocalePath();
	const router = useRouter();

	const backClick = () => {
		const authToken = useCookie("auth_token");
		if (authToken.value !== undefined) {
			navigateTo(localePath("/dashboard"));
			sideBarStore.setSidebarItem("1");
			sideBarStore.setActiveSidebarItem("1");
			// router.go(-1);
		} else {
			navigateTo(localePath("/sign-in"));
		}
	};
</script>
<template>
	<div class="bg-primary h-screen flex flex-col">
		<NuxtImg src="/images/501.svg" class="h-20 absolute left-1/2 -translate-x-1/2 top-0 hidden md:block" alt="501" />
		<div class="flex justify-between items-center lg:absolute w-full p-3 lg:p-5 2xl:p-6 3xl:p-8">
			<div>
				<NuxtImg class="cursor-pointer" src="/images/logo-white.svg" alt="logo" @click.prevent="navigateTo(localePath('/'))" />
			</div>
		</div>
		<div class="flex flex-col md:flex-row flex-1 justify-center items-center px-5 text-center md:text-left h-[calc(100vh-66px)]">
			<div class="basis-6/12 md:basis-6/12 lg:basis-5/12 sm:text-right max-h-[300px] xl:max-h-[500px] sm:h-3/6">
				<NuxtImg class="h-full inline-block" src="/images/500.svg" alt="500" />
			</div>
			<div class="text-white mt-10 md:mt-0 md:pl-10 basis-6/12">
				<h1 class="text-5xl sm:text-6xl lg:text-7xl 2xl:text-8xl font-bold mb-3 md:mb-5 lg:mb-8 xl:mb-10">500</h1>
				<h6 class="text-2xl 2xl:text-3xl font-bold mb-2">Something went wrong!</h6>
				<p class="text-lg mb-10">Server Error 500. Our staff has been notified, thank you for your understanding.</p>
				<novok-button class="btn-white !text-primary font-semibold" @click="backClick">Back to Dashboard</novok-button>
			</div>
		</div>
	</div>
</template>
<style>
	/* @import "~/assets/css/main.css"; */
</style>
