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
	const loading = ref(false);
	const loadingSave = ref(false);
	const supplierCreatedId = ref("");
	const deleteImg = ref(false);

	const localePath = useLocalePath();
	const { t } = useI18n();
	const config = useRuntimeConfig();
	const SupplierStore = supplierStore();
	const emit = defineEmits(["active-tab-name", "disable", "disabled"]);
	const route = useRoute();
	const copyFormData = ref<any>([]);
	const customFields = reactive([]);

	watch(
		() => props.editData,
		(val: any) => {
			if (props.activeTab === "reference") {
				Object.assign(customFields, val?.custom_references1);
			}
		}
	);

	const nextClick = () => {
		SupplierStore.setActiveTab("supporting-documents");
		emit("active-tab-name", "supporting-documents");
		navigateTo(
			localePath({
				path: route.fullPath,
				query: { tab: "supporting-documents" },
			}),
			{ replace: true }
		);
	};

	const backClick = () => {
		SupplierStore.setActiveTab("compliance-due-diligence");
		emit("active-tab-name", "compliance-due-diligence");
		navigateTo(
			localePath({
				path: route.fullPath,
				query: { tab: "compliance-due-diligence" },
			}),
			{ replace: true }
		);
	};
</script>

<template>
	<div v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="flex flex-col">
		<div class="p-6">
			<h3 class="pb-3 text-2xl font-bold">
				{{ $t("header.reference_1") }}
			</h3>
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
				<div>
					<label class="font-bold">{{ $t("formLabels.first_name") }}</label>
					<p class="break-words">{{ editData.ref_1_first_name || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.last_name") }}</label>
					<p class="break-words">{{ editData.ref_1_last_name || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.reg_company_name") }}</label>
					<p class="break-words">{{ editData.ref_1_company_name || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.role") }}</label>
					<p class="break-words">{{ editData.ref_1_role || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.email") }}</label>
					<p class="break-words">{{ editData.ref_1_email || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.contact_number") }}</label>
					<p class="break-words">
						{{ editData.ref_1_contact_number ? editData.ref_1_country_code + " " + editData.ref_1_contact_number : "-" }}
					</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.service_provided_description") }}</label>
					<p class="break-words">{{ editData.ref_1_service_provided_description || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.service_provided_date") }}</label>
					<p class="break-words">
						{{ editData.ref_1_service_provided_date ? moment(`${editData.ref_1_service_provided_date}`).format("DD/MM/YYYY") : "-" }}
					</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.add_comments") }}</label>
					<p class="break-words">{{ editData.ref_1_comment || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.upload_evidence_document") }}</label>
					<a
						:href="editData.ref_one_evidence_document"
						target="_blank"
						class="text-primary block truncate"
						v-if="editData.ref_one_evidence_document"
						>{{ editData.file_name_ref_one }}</a
					>
					<p v-else>-</p>
				</div>

				<custom-input-view v-if="editData?.custom_references1?.length" :custom-inputs="editData?.custom_references1" />
			</div>

			<template v-if="editData.is_ref_2 == 1">
				<h3 class="pb-3 text-2xl font-bold mt-4">
					{{ $t("header.reference_2") }}
				</h3>
				<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
					<div>
						<label class="font-bold">{{ $t("formLabels.first_name") }}</label>
						<p class="break-words">{{ editData.ref_2_first_name || "-" }}</p>
					</div>

					<div>
						<label class="font-bold">{{ $t("formLabels.last_name") }}</label>
						<p class="break-words">{{ editData.ref_2_last_name || "-" }}</p>
					</div>

					<div>
						<label class="font-bold">{{ $t("formLabels.reg_company_name") }}</label>
						<p class="break-words">{{ editData.ref_2_company_name || "-" }}</p>
					</div>

					<div>
						<label class="font-bold">{{ $t("formLabels.role") }}</label>
						<p class="break-words">{{ editData.ref_2_role || "-" }}</p>
					</div>

					<div>
						<label class="font-bold">{{ $t("formLabels.email") }}</label>
						<p class="break-words">{{ editData.ref_2_email || "-" }}</p>
					</div>

					<div>
						<label class="font-bold">{{ $t("formLabels.contact_number") }}</label>
						<p class="break-words">
							{{ editData.ref_2_contact_number ? editData.ref_2_country_code + " " + editData.ref_2_contact_number : "-" }}
						</p>
					</div>

					<div>
						<label class="font-bold">{{ $t("formLabels.service_provided_description") }}</label>
						<p class="break-words">{{ editData.ref_2_service_provided_description || "-" }}</p>
					</div>

					<div>
						<label class="font-bold">{{ $t("formLabels.service_provided_date") }}</label>
						<p class="break-words">
							{{ editData.ref_2_service_provided_date ? moment(`${editData.ref_2_service_provided_date}`).format("DD/MM/YYYY") : "-" }}
						</p>
					</div>

					<div>
						<label class="font-bold">{{ $t("formLabels.add_comments") }}</label>
						<p class="break-words">{{ editData.ref_2_comment || "-" }}</p>
					</div>

					<div>
						<label class="font-bold">{{ $t("formLabels.upload_evidence_document") }}</label>
						<a
							:href="editData.ref_two_evidence_document"
							target="_blank"
							class="text-primary block break-words"
							v-if="editData.ref_two_evidence_document"
							>{{ editData.file_name_ref_two }}</a
						>
						<p v-else>-</p>
					</div>

					<custom-input-view v-if="editData?.custom_references1?.length" :custom-inputs="editData?.custom_references1" />
				</div>
			</template>
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
