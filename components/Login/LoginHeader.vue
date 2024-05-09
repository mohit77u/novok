<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
	import { contactButtonStore } from "~/store/contactButton";
	import { useProfileStore } from "~/store/profile";

	const store = contactButtonStore();
	const profileStore = useProfileStore();
	const localePath = useLocalePath();

	const contactBtnClick = () => {
		navigateTo(localePath("/contact-us"));
		store.setcontactButton(true);
	};

	const logoClick = () => {
		if (profileStore.$state.profileData?.user_detail?.id?.length) {
			navigateTo(localePath("/dashboard"));
		} else {
			navigateTo(localePath("/"));
		}
	};
</script>

<template>
	<div class="flex justify-between items-center lg:absolute w-full p-3 lg:p-5 2xl:p-6 3xl:p-8">
		<div>
			<NuxtImg
				src="/images/logo-white.svg"
				class="cursor-pointer h-[30px] md:h-[35px] lg:h-[40px] 2xl:h-[45px] 3xl:h-[60px]"
				alt="logo"
				@click.prevent="logoClick"
			/>
		</div>
		<novok-button v-if="!store.contactButton" class="btn-white !text-dark font-semibold" plain @click="contactBtnClick">Contact Us</novok-button>
	</div>
</template>
