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
	const dialogVisibleRejectModal = ref(false);
	const loadingSave = ref(false);
	const loading = ref(false);
	const dialogVisibleApproveModal = ref(false);
	const { t } = useI18n();

	const emit = defineEmits(["active-tab-name"]);

	const tableColumns = ref([
		{
			columnName: "stakeholder.full_name",
			columnLabel: t("columnLabels.stakeholder_name"),
		},
		{
			columnName: "role_of_stakeholder",
			columnLabel: t("columnLabels.job_title"),
		},
		{
			columnName: "communication_strategy",
			columnLabel: t("columnLabels.communication_Strategy"),
		},
	]);

	const nextClick = () => {
		if (props.editData.activity_type == 1 || props.editData.activity_type == 2 || props.editData.activity_type == 3) {
			SupplierStore.setActiveTab("signing");
			emit("active-tab-name", "signing");
			navigateTo(
				localePath({
					path: route.fullPath,
					query: { tab: "signing" },
				}),
				{ replace: true }
			);
		} else {
			SupplierStore.setActiveTab("selection");
			emit("active-tab-name", "selection");
			navigateTo(
				localePath({
					path: route.fullPath,
					query: { tab: "selection" },
				}),
				{ replace: true }
			);
		}
	};

	const backClick = () => {
		SupplierStore.setActiveTab("request");
		emit("active-tab-name", "request");
		navigateTo(
			localePath({
				path: route.fullPath,
				query: { tab: "request" },
			}),
			{ replace: true }
		);
	};

	const changeStatus = async (data: any, value: any) => {
		if (value == 3) {
			loadingSave.value = true;
		} else {
			loading.value = true;
		}
		const statusData = { ...data, status: value, stage: "sourcing" };
		try {
			const res: any = await useApiFetch(`/projects/${route.params?.id}/change-authority-status`, {
				method: "POST",
				body: statusData,
			});

			useToast("success", res.message);
			navigateTo(localePath("/project-pipeline/projects"));
		} catch {
		} finally {
			loading.value = false;
			loadingSave.value = false;
		}
	};

	const dialogOkClickRejectModal = (value: any) => {
		dialogVisibleRejectModal.value = value;
	};

	const rejectStatusData = (data: any) => {
		changeStatus(data, 3);
	};

	const dialogOkClickApproveModal = (value: any) => {
		dialogVisibleApproveModal.value = value;
	};

	const approveStatusData = () => {
		changeStatus("", 2);
	};
</script>

<template>
	<div class="p-4">
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
			<div class="break-words">
				<label class="font-bold block">{{ $t("formLabels.project_number") }}</label>
				<p class="break-words">{{ editData.project_number || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.project_owner") }}</label>
				<p class="break-words">
					{{ editData.project_owner ? editData.project_owner?.full_name + " " + "(" + editData.project_owner?.email + ")" : "-" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.request_owner") }}</label>
				<p class="break-words">
					{{ editData.request_owner ? editData.request_owner?.full_name + " " + "(" + editData.request_owner?.email + ")" : "-" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.project_title") }}</label>
				<p class="break-words">{{ editData.project_title || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.requirement") }}</label>
				<p class="break-words">{{ editData.requirement || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.parent_entity") }}</label>
				<p class="break-words">{{ editData.parent_entity || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.signing_entity") }}</label>
				<p class="break-words">{{ editData.signing_entity?.sub_entity_name || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.expected_date_of_completion") }}</label>
				<p class="break-words">
					{{ editData.expected_dates_of_completion ? moment(`${editData.expected_dates_of_completion}`).format("DD/MM/YYYY") : "-" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.start_date_of_sourcing") }}</label>
				<p class="break-words">{{ editData.start_date ? moment(`${editData.start_date}`).format("DD/MM/YYYY") : "-" }}</p>
			</div>
			<div>
				<label class="font-bold block">{{ $t("formLabels.target_completion_date_of_sourcing") }}</label>
				<p class="break-words">
					{{ editData.target_completion_date ? moment(`${editData.target_completion_date}`).format("DD/MM/YYYY") : "-" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.budget") }}</label>
				<p class="break-words">{{ editData.budget ? editData.budget_currency + " " + commaThreeDigitFormat(editData.budget) : "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.approval_authority") }}</label>
				<p class="break-words">
					{{
						editData.approval_authority
							? editData.approval_authority?.full_name + " " + "(" + editData.approval_authority?.email + ")"
							: "-"
					}}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.role_of_approval_authority") }}</label>
				<p class="break-words">{{ editData.role_of_approval_authority || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.spend_analysis") }}</label>
				<p class="break-words">{{ editData.spend_analysis || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.market_analysis") }}</label>
				<p class="break-words">{{ editData.market_analysis || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.estimated_savings") }}</label>
				<p class="break-words">
					{{
						editData.estimated_savings
							? editData.estimated_savings_currency + " " + commaThreeDigitFormat(editData.estimated_savings)
							: "-"
					}}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.benefits") }}</label>
				<p class="break-words">{{ editData.benefits || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.agreed_project_type") }}</label>
				<p class="break-words">{{ editData.route_selection_and_approach || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.approval_authority_status") }}</label>
				<p class="break-words">
					<el-tag
						:class="
							editData.approval_authority_status == 0
								? 'border border-[purple] bg-[purple]/10'
								: editData.approval_authority_status == 1
								? 'border border-amber  text-amber bg-amber/10'
								: editData.approval_authority_status == 2
								? 'border border-success  text-success bg-success/10'
								: editData.approval_authority_status == 3
								? 'border border-danger  text-danger bg-danger/10'
								: ''
						"
					>
						{{
							editData.approval_authority_status == 0
								? "Not Assign"
								: editData.approval_authority_status == 1
								? "Awaited"
								: editData.approval_authority_status == 2
								? "Approved"
								: editData.approval_authority_status == 3
								? "Rejected"
								: ""
						}}
					</el-tag>
				</p>
			</div>

			<div v-if="editData.approval_authority_status == 3">
				<label class="font-bold block">{{ $t("formLabels.reason_of_reject") }}</label>
				<p class="break-words">{{ editData.reason_of_reject || "-" }}</p>
			</div>

			<div class="col-span-1 sm:col-span-2 md:col-span-3 xl:col-span-4 gap-4">
				<label class="font-bold block text-lg">{{ $t("formLabels.stakeholder_details") }}</label>
				<el-table class="max-h-[250px]" style="width: 100%" :data="editData?.stakeholder_details" :row-class-name="tableRowClassName" stripe>
					<el-table-column v-for="column in tableColumns" :key="column.id" :prop="column.columnName" :label="column.columnLabel" />
				</el-table>
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

			<novok-button class="btn-dark my-1" @click="CancelRedirect('/project-pipeline/projects')">
				<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
				<i class="fa-solid fa-xmark sm:hidden"></i>
			</novok-button>

			<novok-button
				v-if="!isChangeStatus && editData.active_tab !== 'sourcing'"
				class="my-1"
				type="info"
				:loading="loading"
				:disabled="loading"
				@click.prevent="nextClick"
				>{{ $t("buttons.next") }}
			</novok-button>

			<novok-button
				v-if="isChangeStatus"
				class="my-1"
				type="success"
				:loading="loading"
				:disabled="loading"
				@click.prevent="dialogVisibleApproveModal = true"
				>{{ $t("buttons.approve") }}
			</novok-button>

			<novok-button
				v-if="isChangeStatus"
				class="my-1"
				type="danger"
				:loading="loadingSave"
				:disabled="loadingSave"
				@click.prevent="dialogVisibleRejectModal = true"
				>{{ $t("buttons.reject") }}
			</novok-button>
		</div>
	</div>
	<project-pipeline-project-reject-modal
		v-if="dialogVisibleRejectModal === true"
		:dialog-visible="dialogVisibleRejectModal"
		:id="route.params?.id"
		@dialog-ok-click="dialogOkClickRejectModal"
		@status-data="rejectStatusData"
	/>
	<project-pipeline-project-approve-modal
		v-if="dialogVisibleApproveModal === true"
		:dialog-visible="dialogVisibleApproveModal"
		:id="route.params?.id"
		@dialog-ok-click="dialogOkClickApproveModal"
		@status-data="approveStatusData"
	/>
</template>
