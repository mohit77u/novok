<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
	const config = useRuntimeConfig();
</script>
<template>
	<ul class="flex flex-wrap justify-center space-x-10 text-base mb-3 text-white">
		<li class="mb-3">
			<a href="/privacy-policy" target="_blank">Privacy Policy</a>
		</li>
		<li class="mb-3"><a href="javascript:void(0)">GDPR</a></li>
		<li class="mb-3">
			<a href="javascript:void(0)">Data Protection</a>
		</li>
		<li class="mb-3">
			<a :href="config.public.modern_slavery" target="_blank">Modern Slavery</a>
		</li>
		<li class="mb-3"><a href="javascript:void(0)">Media updates</a></li>
	</ul>
	<LoginPartical />
	<div class="w-20 h-20 rounded-full flex items-center justify-center bg-secondary text-white fixed text-4xl right-4 bottom-4">
		<i class="fa-solid fa-user-robot"></i>
	</div>
</template>
