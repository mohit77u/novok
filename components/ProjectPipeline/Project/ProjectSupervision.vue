<script setup lang="ts">
	import { supplierStore } from "~/store/supplier";
	import moment from "moment";
	import { commaThreeDigitFormat } from "~/helper/common";

	const props = defineProps({
		editData: {
			type: Object,
			default: {},
		},
		isChangeStatus: {
			type: Boolean,
			default: false,
		},
	});

	const SupplierStore = supplierStore();
	const localePath = useLocalePath();
	const route = useRoute();
	const loadingSave = ref(false);
	const loading = ref(false);
	const dialogVisibleApproveModal = ref(false);
	const dialogVisibleRejectModal = ref(false);

	const emit = defineEmits(["active-tab-name"]);
	const backClick = () => {
		SupplierStore.setActiveTab("signing");
		emit("active-tab-name", "signing");
		navigateTo(
			localePath({
				path: route.fullPath,
				query: { tab: "signing" },
			}),
			{ replace: true }
		);
	};

	const nextClick = () => {
		SupplierStore.setActiveTab("documents");
		emit("active-tab-name", "documents");
		navigateTo(
			localePath({
				path: route.fullPath,
				query: { tab: "documents" },
			}),
			{ replace: true }
		);
	};
</script>

<template>
	<div class="p-4">
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
			<div>
				<label class="font-bold block">{{ $t("formLabels.project_number") }}</label>
				<p class="break-words">{{ editData.project_number || "" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.project_owner") }}</label>
				<p class="break-words">
					{{ editData.project_owner ? editData.project_owner?.full_name + " " + "(" + editData.project_owner?.email + ")" : "" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.request_owner") }}</label>
				<p class="break-words">
					{{ editData.request_owner ? editData.request_owner?.full_name + " " + "(" + editData.request_owner?.email + ")" : "" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.project_title") }}</label>
				<p class="break-words">{{ editData.project_title || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.requirement/needs") }}</label>
				<p class="break-words">{{ editData.requirement || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.total_contract_term") }}</label>
				<p class="break-words">{{ editData.total_contract_term || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.value_of_contract") }}</label>
				<p class="break-words">
					{{
						editData.value_of_contract
							? editData.value_of_contract_currency + " " + commaThreeDigitFormat(editData.value_of_contract)
							: "-"
					}}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.contract_number") }}</label>
				<p class="break-words">{{ editData.contractDetails?.contract_number || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.actual_savings") }}</label>
				<p class="break-words">
					{{ editData.actual_savings ? editData.actual_savings_currency + " " + commaThreeDigitFormat(editData.actual_savings) : "-" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.date_of_contract_signature") }}</label>
				<p class="break-words">
					{{
						editData.contractDetails?.date_of_supplier_lead_signature
							? moment(`${editData.contractDetails?.date_of_supplier_lead_signature}`).format("DD/MM/YYYY")
							: "-"
					}}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.start_date_of_contract") }}</label>
				<p class="break-words">
					{{
						editData.contractDetails?.contract_start_date
							? moment(`${editData.contractDetails?.contract_start_date}`).format("DD/MM/YYYY")
							: "-"
					}}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.end_date_of_contract") }}</label>
				<p class="break-words">
					{{
						editData.contractDetails?.contract_end_date
							? moment(`${editData.contractDetails?.contract_end_date}`).format("DD/MM/YYYY")
							: "-"
					}}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.notice_period") }}</label>
				<p class="break-words">{{ editData.contractDetails?.notice_period_days || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.contract_review_date") }}</label>
				<p class="break-words">{{ editData.contract_review_date ? moment(`${editData.contract_review_date}`).format("DD/MM/YYYY") : "-" }}</p>
			</div>

			<div v-if="editData?.supplierHandbook?.length">
				<label class="font-bold">{{ $t("formLabels.supplier_handbook") }}</label>
				<div class="document" v-for="(document, index) in editData?.supplierHandbook" :key="index">
					<a :href="document?.document_path" class="text-primary block truncate" target="_blank">{{ document?.document_file_name }}</a>
				</div>
			</div>

			<div class="document" v-else>
				<label class="font-bold">{{ $t("formLabels.supplier_handbook") }}</label>
				<p>-</p>
			</div>

			<div v-if="editData?.supplierHandbook?.length">
				<label class="font-bold">{{ $t("formLabels.contract_management_toolkit") }}</label>
				<div class="document" v-for="(document, index) in editData?.contractManagementToolkit" :key="index">
					<a :href="document?.document_path" class="text-primary block truncate" target="_blank">{{ document?.document_file_name }}</a>
				</div>
			</div>

			<div class="document" v-else>
				<label class="font-bold">{{ $t("formLabels.contract_management_toolkit") }}</label>
				<p>-</p>
			</div>

			<div v-if="editData?.documents?.length">
				<label class="font-bold">{{ $t("formLabels.Documents") }}</label>
				<div class="document" v-for="(document, index) in editData?.documents" :key="index">
					<a :href="document?.document_path" class="text-primary block truncate" target="_blank">{{ document?.document_file_name }}</a>
				</div>
			</div>

			<div class="document" v-else>
				<label class="font-bold">{{ $t("formLabels.Documents") }}</label>
				<p>-</p>
			</div>
		</div>

		<div class="text-right">
			<novok-button type="cyan" v-if="!isChangeStatus" class="my-1" @click.prevent="backClick">
				<i class="fa-regular fa-arrow-left mr-2"></i> {{ $t("buttons.back") }}
			</novok-button>

			<novok-button class="my-1 btn-dark" @click="CancelRedirect('/project-pipeline/projects')">
				<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
				<i class="fa-solid fa-xmark sm:hidden"></i>
			</novok-button>
		</div>
	</div>
</template>
