<template>
	<div class="min-h-screen flex flex-col">
		<LoginHeader />
		<div class="flex flex-1">
			<div class="basis-full flex flex-col">
				<slot />

				<LoginFooter />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	onMounted(() => {
		document.documentElement.style.setProperty("--theme", "147 83 162");
	});
</script>
  
  <style>
	/* @import "~/assets/css/main.css"; */
</style>
  