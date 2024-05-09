<template>
	<div class="min-h-screen flex flex-col">
		<LoginHeader />
		<div class="flex flex-1">
			<div class="basis-full lg:basis-6/12 xxl:basis-5/12 flex flex-col">
				<slot />

				<LoginFooter />
			</div>
			<LoginVideo />
		</div>
	</div>
</template>

<script lang="ts" setup>
	onMounted(() => {
		document.documentElement.style.setProperty("--theme", "147 83 162");

		// Retrieve the error message from localStorage
		const errorMessage = localStorage.getItem("errorMessage");

		// If there's an error message, display it in the toast
		if (errorMessage) {
			useToast("error", errorMessage);

			// Clear the error message from localStorage after displaying it
			localStorage.removeItem("errorMessage");
		}
	});
</script>


<style>
	/* @import "~/assets/css/main.css"; */
</style>
