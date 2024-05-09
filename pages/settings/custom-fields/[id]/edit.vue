
<template>
	<div class="p-4">
		<h3 class="text-2xl font-bold mb-6">{{ title }}</h3>

		<custom-fields-save :module-name="customFieldsStore.getActiveTab" :id="route?.params?.id" />
	</div>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	import { useCustomFieldsStore } from "~/store/customFields";

	definePageMeta({
		middleware: ["auth"],
	});

	useHead({
		title: "Custom Fields Create",
	});

	const { t } = useI18n();
	const customFieldsStore = useCustomFieldsStore();
	const route = useRoute();

	const title = computed(() => {
		if (customFieldsStore.getActiveTab === "supplier") {
			return t("header.suppliers_admin");
		} else {
			return t("header.contracts");
		}
	});
</script>
