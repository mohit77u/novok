<script lang="ts" setup>
	import { useAuthStore } from "~/store/auth";
	const { submit, mounted, loading } = useSelectAccount();

	definePageMeta({
		layout: "auth",
		middleware: ["guest"],
	});

	useHead({
		title: "Select Account",
	});
	const store: any = useAuthStore();
	const config = useRuntimeConfig();

	const onSubmit = async (id: number) => {
		await submit(id, "select_account");
	};
</script>

<template>
	<div class="flex items-center justify-center flex-1 px-3 lg:pt-20">
		<div
			class="sm:w-8/12 md:w-7/12 lg:w-10/12 xl:w-9/12 2xl:w-7/12 3xl:w-7/12 p-5 md:p-6 lg:p-8 xl:p-10 rounded-md border-t-[6px] border-primary shadow-md my-5 bg-[#fff]"
		>
			<h6 class="text-3xl font-bold text-dark">Select Account</h6>
			<p class="text-gray mt-4 mb-10">Please select any one account that you would like to access</p>

			<div class="grid flex-col gap-y-3">
				<div
					v-for="account in store.accountsList"
					:key="account?.id"
					class="flex items-center hover:cursor-pointer border border-dark/30 p-3 rounded-md hover:bg-primary/10 hover:border-primary"
					@click="onSubmit(account?.id)"
				>
					<NuxtImg v-if="account?.company_logo" :src="account?.company_logo" class="w-10 h-10 rounded-md object-cover" alt="profile" />
					<NuxtImg v-else :src="config.public.default_user_link" class="w-10 h-10 rounded-md object-cover" alt="profile" />

					<!-- {{ account }} -->
					<div class="ml-4 hidden lg:block">
						<span class="block text-dark font-bold">{{ account?.company_name || "" }}</span>
						<span class="block text-dark/60 text-sm">{{ account?.role_name }}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style>
	/* @import "~/assets/css/main.css"; */
</style>
