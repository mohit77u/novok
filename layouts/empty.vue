<template>
	<div>
		<slot />
	</div>
</template>

<script lang="ts" setup>
	onMounted(() => {
		// document.documentElement.style.setProperty("--theme", "147 83 162");
		const themeColor = useCookie("theme");
		applyTheme(themeColor.value ?? "147 83 162");
	});

	const applyTheme = (color_code: any) => {
		const themeColor = useCookie("theme");
		themeColor.value = color_code;
		document.documentElement.style.setProperty("--theme", themeColor.value ?? color_code);
	};
</script>

<style>
	/* @import "~/assets/css/main.css"; */
</style>
