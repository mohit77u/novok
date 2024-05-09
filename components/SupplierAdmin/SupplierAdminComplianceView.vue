<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/attribute-hyphenation -->
<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
	import { supplierStore } from "~/store/supplier";
	import moment from "moment";

	const props = defineProps({
		editData: {
			type: Object,
			// eslint-disable-next-line vue/require-valid-default-prop
			default: {},
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		activeTab: {
			type: String,
			default: "",
		},
	});

	const fullscreenLoading = ref(false);

	const localePath = useLocalePath();
	const { t } = useI18n();
	const config = useRuntimeConfig();
	const SupplierStore = supplierStore();
	const emit = defineEmits(["active-tab-name", "disable", "disabled"]);
	const route = useRoute();

	const customFields = reactive([]);

	watch(
		() => props.editData,
		(val: any) => {
			if (props.activeTab === "compliance") {
				Object.assign(customFields, val?.custom_compliance_due_diligences);
			}
		}
	);

	const nextClick = () => {
		SupplierStore.setActiveTab("reference");
		emit("active-tab-name", "reference");
		navigateTo(
			localePath({
				path: route.fullPath,
				query: { tab: "reference" },
			}),
			{ replace: true }
		);
	};

	const backClick = () => {
		SupplierStore.setActiveTab("primary-details");
		emit("active-tab-name", "primary-details");
		navigateTo(
			localePath({
				path: route.fullPath,
				query: { tab: "primary-details" },
			}),
			{ replace: true }
		);
	};
</script>

<template>
	<div v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="flex flex-col">
		<div class="p-6">
			<h6 class="pb-2 text-xl font-bold border-b mb-2">
				{{ $t("formLabels.dpo_details") }}
			</h6>
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
				<div>
					<label class="font-bold">{{ $t("formLabels.first_name") }}</label>
					<p class="break-words">{{ editData.dpo_first_name || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.last_name") }}</label>
					<p class="break-words">{{ editData.dpo_last_name || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.email") }}</label>
					<p class="break-words">{{ editData.dpo_email || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.contact_number") }}</label>
					<p class="break-words">{{ editData.dpo_mobile_number ? editData.dpo_country_code + " " + editData.dpo_mobile_number : "-" }}</p>
				</div>
			</div>

			<h6 class="pb-2 text-xl font-bold border-b mb-2 mt-10">
				{{ $t("formLabels.credit_score") }}
			</h6>
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
				<div>
					<label class="font-bold">{{ $t("formLabels.dnb_number") }}</label>
					<p class="break-words">
						{{ editData.credit_score_dnb_number || "-" }}
					</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.credit_safe_score") }}</label>
					<p class="break-words">{{ editData.credit_safe_score || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.source_of_credit_score") }}</label>
					<p class="break-words">{{ editData.credit_score_source || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.report_date") }}</label>
					<p class="break-words">
						{{ editData.credit_score_report_date ? moment(`${editData.credit_score_report_date}`).format("DD/MM/YYYY") : "-" }}
					</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.ico_number") }}</label>
					<p class="break-words">{{ editData.ico_number || "-" }}</p>
				</div>
			</div>

			<div
				class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-6"
				v-if="editData?.custom_compliance_due_diligences?.length"
			>
				<custom-input-view
					v-if="editData?.custom_compliance_due_diligences?.length"
					:custom-inputs="editData?.custom_compliance_due_diligences"
				/>
			</div>
		</div>

		<div class="p-4 text-right">
			<novok-button type="cyan" :loading="loading" :disabled="loading" @click.prevent="backClick">
				<i class="fa-regular fa-arrow-left mr-2"></i> {{ $t("buttons.back") }}
			</novok-button>

			<novok-button class="btn-dark my-1" @click="CancelRedirect('/supplier-admins')">
				<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
				<i class="fa-solid fa-xmark sm:hidden"></i>
			</novok-button>

			<novok-button class="my-1" type="info" :loading="loading" :disabled="loading" @click.prevent="nextClick"
				>{{ $t("buttons.next") }}
			</novok-button>
		</div>
	</div>
</template>
