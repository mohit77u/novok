<!-- eslint-disable vue/require-valid-default-prop -->
<!-- eslint-disable camelcase -->
<script setup lang="ts">
	import moment from "moment";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import { contractStore } from "~/store/contract";

	const localePath = useLocalePath();
	const { t } = useI18n();
	const fullscreenLoading = ref(false);
	const loading = ref(false);
	const loadingSave = ref(false);
	const route = useRoute();
	const emit = defineEmits(["active-tab-name", "disable", "disabled"]);
	const store = contractStore();
	const showError = ref(false);
	const getReminderData = ref<any>([]);

	const props = defineProps({
		editData: {
			type: Object,
			default: {},
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	});

	const supplierLeadSignature = ref({});
	const oprationalLeadSignature = ref({});
	const customFields = ref([]);

	watch(
		() => props.editData,
		(currData) => {
			if (currData.tab === "signatory-details" || currData.tab === "all") {
				if (Object.keys(currData || {}).length) {
					currData.documents.forEach((document: any) => {
						if (document.document_type === 2) {
							supplierLeadSignature.value = document;
						} else {
							oprationalLeadSignature.value = document;
						}
					});
				}
				Object.assign(customFields, currData?.custom_signatory_details);
			}
		}
	);

	const cancel = () => {
		navigateTo(localePath("/contracts"));
	};

	const nextClick = () => {
		store.setActiveTab("additional-information");
		emit("active-tab-name", "additional-information");
		navigateTo(
			localePath({
				path: route.fullPath,
				query: { tab: "additional-information" },
			}),
			{ replace: true }
		);
	};

	const backClick = () => {
		store.setActiveTab("upload-contract");
		emit("active-tab-name", "upload-contract");
		navigateTo(
			localePath({
				path: route.fullPath,
				query: { tab: "upload-contract" },
			}),
			{ replace: true }
		);
	};
</script>

<template>
	<div class="p-6">
		<h6 class="pb-2 text-xl font-bold border-b mb-2">
			{{ $t("formLabels.supplier_authorised_signatory") }}
		</h6>
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
			<div>
				<label class="font-bold">{{ $t("formLabels.supplier_authorised_signatory_name") }}</label>
				<p class="break-words">{{ editData?.supplier_authorised_signatory?.full_name || "-" }}</p>
			</div>
			<div>
				<label class="font-bold">{{ $t("formLabels.email") }}</label>
				<p class="break-words">{{ editData?.supplier_authorised_signatory?.email || "-" }}</p>
			</div>
			<div>
				<label class="font-bold">{{ $t("formLabels.date_of_signature") }}</label>
				<p class="break-words">{{ editData.date_of_supplier_authorised_signatory_signature || "-" }}</p>
			</div>
			<div>
				<label class="font-bold">{{ $t("formLabels.signature") }}</label>
				<p v-if="supplierLeadSignature.document_path">
					<a :href="supplierLeadSignature.document_path" class="text-primary truncate" target="_blank">{{
						supplierLeadSignature.file_name || "-"
					}}</a>
				</p>
				<p v-else>-</p>
			</div>
		</div>

		<h6 class="pb-2 text-xl font-bold border-b mb-2 mt-6">
			{{ $t("formLabels.authorised_signatory") }}
		</h6>
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
			<div>
				<label class="font-bold">{{ $t("formLabels.authorised_signatory_name") }}</label>
				<p class="break-words">{{ editData?.authorised_signatory?.full_name || "-" }}</p>
			</div>
			<div>
				<label class="font-bold">{{ $t("formLabels.email") }}</label>
				<p class="break-words">{{ editData?.authorised_signatory?.email || "-" }}</p>
			</div>
			<div>
				<label class="font-bold">{{ $t("formLabels.date_of_signature") }}</label>
				<p class="break-words">{{ editData.date_of_authorised_signatory_signature || "-" }}</p>
			</div>
			<div>
				<label class="font-bold">{{ $t("formLabels.signature") }}</label>
				<p v-if="oprationalLeadSignature.document_path">
					<a :href="oprationalLeadSignature.document_path" class="text-primary truncate" target="_blank">{{
						oprationalLeadSignature.file_name
					}}</a>
				</p>
				<p v-else>-</p>
			</div>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-6" v-if="editData?.custom_signatory_details?.length">
			<custom-input-view :custom-inputs="editData?.custom_signatory_details" />
		</div>
	</div>
	<div class="p-6 text-right">
		<novok-button type="cyan" :loading="loading" :disabled="loading" @click.prevent="backClick">
			<i class="fa-regular fa-arrow-left mr-2"></i> {{ $t("buttons.back") }}
		</novok-button>

		<novok-button class="btn-dark my-1" @click="cancel">
			<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
			<i class="fa-solid fa-xmark sm:hidden"></i>
		</novok-button>

		<novok-button class="my-1" type="info" :loading="loading" :disabled="loading" @click.prevent="nextClick"
			>{{ $t("buttons.next") }}
		</novok-button>
	</div>
</template>
