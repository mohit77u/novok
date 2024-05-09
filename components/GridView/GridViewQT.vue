<script setup lang="ts">
	import moment from "moment";

	const props = defineProps({
		tableData: {
			type: Array,
			default: [],
		},
	});
	const dialogVisibleQTRejectModal = ref(false);
	const dialogVisibleQTApproveModal = ref(false);
	const dialogVisibleQTApproveM = ref(false);
	const rowId = ref("");

	const emit = defineEmits(["handle-edit", "handle-view", "qt-approve-status", "qt-reject-status"]);

	const handleEdit = (row: any) => {
		emit("handle-edit", row);
	};

	const handleView = (row: any) => {
		emit("handle-view", row);
	};

	const dialogOkClickQTRejectModal = (value: any) => {
		dialogVisibleQTRejectModal.value = value;
	};
	const dialogOkClickQTApproveModal = (value: any) => {
		dialogVisibleQTApproveModal.value = value;
	};

	const dialogOkClickQTApproveM = (value: any) => {
		dialogVisibleQTApproveM.value = value;
	};

	const QTStatusClick = (row: any, value: any) => {
		rowId.value = row.id;
		if (value === "1" && row.open_date_time_passed) {
			dialogVisibleQTApproveModal.value = true;
		} else if (value === "2") {
			dialogVisibleQTRejectModal.value = true;
		} else {
			dialogVisibleQTApproveM.value = true;
			// emit("qt-approve-status", row.id, "");
		}
	};

	const QTrejectStatusData = (Id: any, formData: any) => {
		emit("qt-reject-status", rowId.value, formData);
	};

	const QTapproveStatusData = (Id: any, formData: any) => {
		emit("qt-approve-status", rowId.value, formData);
	};
</script>

<template>
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 text-sm 2xl:text-base">
		<div class="rounded-lg p-4 bg-[#edeced] shadow-lg" v-for="data in tableData" :key="data.id">
			<div class="flex items-center mb-3">
				<el-dropdown trigger="click" :disabled="data.tender_status != 0 || !data.is_authoriser">
					<el-button
						class="default"
						size="small"
						:class="
							data.tender_status === 0
								? 'bg-primary/10 border border-primary text-primary text-bold'
								: data.tender_status === 1
								? 'bg-info/10 border border-info text-info text-bold'
								: data.tender_status === 2
								? 'bg-danger/10 border border-danger text-danger text-bold'
								: data.tender_status === 3
								? 'bg-success/10 border border-success text-success text-bold'
								: 'bg-danger/10 border border-danger text-danger text-bold'
						"
					>
						<span>{{
							data.tender_status === 0
								? "Awaited"
								: data.tender_status === 1
								? "Upcoming"
								: data.tender_status === 2
								? "Rejected"
								: data.tender_status === 3
								? "Open"
								: "Closed"
						}}</span>
						<i v-if="data.tender_status == 0 && data.is_authoriser" class="fa-solid fa-angle-down ml-4"></i>
					</el-button>

					<template #dropdown>
						<el-dropdown-menu v-if="data.tender_status == 0 && data.is_authoriser">
							<el-dropdown-item @click="QTStatusClick(data, '1')"
								><span class="text-[green]">{{ $t("dropdown_labels.approve") }}</span></el-dropdown-item
							>
							<el-dropdown-item @click="QTStatusClick(data, '2')"
								><span class="text-[red]">{{ $t("dropdown_labels.reject") }}</span></el-dropdown-item
							>
						</el-dropdown-menu>
					</template>
				</el-dropdown>

				<el-dropdown class="ml-auto">
					<span class="px-4 outline-0">
						<i class="fa-solid fa-ellipsis"></i>
					</span>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item @click="handleView(data)"
								><i class="fa-fw fa-light fa-eye"></i> {{ $t("labels.view") }}</el-dropdown-item
							>

							<el-dropdown-item
								v-if="(data.tender_status === 0 && data.is_created_by_me) || (data.tender_status === 2 && data.is_created_by_me)"
								@click="handleEdit(data)"
								><i class="fa-fw fa-light fa-pen"></i> {{ $t("labels.edit") }}</el-dropdown-item
							>

							<el-dropdown-item
								v-if="data.tender_status === 4"
								@click="navigateTo(localePath(`/quotations-tender/q-t/qt-responses/${data?.id}`))"
								><i class="fa-solid fa-rectangle-list"></i> {{ $t("labels.see_responses") }}</el-dropdown-item
							>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
			</div>

			<div class="grid grid-cols-2 text-sm 2xl:text-base xxl:gap-4 gap-2 text-dark">
				<div class="truncate">
					<BaseLabel
						icon='<i class="fa-regular fa-fw fa-code-merge xxl:mr-3 xl:mr-2"></i>'
						:tooltip-content="$t('formLabels.tender_quotation_code')"
					/>
					{{ data.qt_code || "-" }}
				</div>
				<div class="truncate">
					<BaseLabel icon='<i class="fa-regular fa-fw fa-user xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.project_owner')" />
					{{ data.project_owner || "-" }}
				</div>
				<div class="truncate">
					<BaseLabel icon='<i class="fa-regular fa-fw fa-user-pen xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.title')" />
					{{ data.title || "-" }}
				</div>

				<div class="truncate">
					<BaseLabel
						icon='<i class="fa-regular fa-fw fa-calendar-days xxl:mr-3 xl:mr-2"></i>'
						:tooltip-content="$t('formLabels.open_date') + '/' + $t('formLabels.open_time')"
					/>
					{{ data.open_date ? moment(`${data.open_date + " " + data.open_time}`).format("DD/MM/YYYY hh:mm A") : "NA" }}
				</div>
				<div class="truncate">
					<BaseLabel
						icon='<i class="fa-regular fa-fw fa-calendar-days xxl:mr-3 xl:mr-2"></i>'
						:tooltip-content="$t('formLabels.close_date') + '/' + $t('formLabels.close_time')"
					/>
					{{ data.close_date ? moment(`${data.close_date + " " + data.close_time}`).format("DD/MM/YYYY hh:mm A") : "NA" }}
				</div>
			</div>
		</div>
	</div>
	<quotations-tender-reject-modal
		v-if="dialogVisibleQTRejectModal === true"
		:dialog-visible="dialogVisibleQTRejectModal"
		:id="rowId"
		@dialog-ok-click="dialogOkClickQTRejectModal"
		@status-data="QTrejectStatusData"
	/>
	<quotations-tender-approve-modal
		v-if="dialogVisibleQTApproveModal === true"
		:dialog-visible="dialogVisibleQTApproveModal"
		:id="rowId"
		@dialog-ok-click="dialogOkClickQTApproveModal"
		@status-data="QTapproveStatusData"
	/>
	<quotations-tender-approve-m
		v-if="dialogVisibleQTApproveM === true"
		:dialog-visible="dialogVisibleQTApproveM"
		:id="rowId"
		@dialog-ok-click="dialogOkClickQTApproveM"
		@status-data="QTapproveStatusData"
	/>
</template>
