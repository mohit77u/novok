<template>
	<div class="p-4">
		<h3 class="text-2xl font-bold mb-6">{{ title }}</h3>

		<custom-fields-save :module-name="customFieldsStore.getActiveTab" />
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

	const title = computed(() => {
		let title = "";
		switch (customFieldsStore.getActiveTab) {
			case "supplier-admin":
				title = t("formLabels.suppliers");
				break;

			case "contract":
				title = t("formLabels.contracts");
				break;

			case "request":
				title = t("formLabels.requests");
				break;

			case "q-and-t-client":
				title = t("formLabels.q_and_t_client");
				break;

			case "q-and-t-supplier":
				title = t("formLabels.q_and_t_supplier");
				break;
		}

		return title;
	});
</script>
