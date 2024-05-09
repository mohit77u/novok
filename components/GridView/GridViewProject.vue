<script setup lang="ts">
	import { useAuthStore } from "~/store/auth";
	import moment from "moment";

	const props = defineProps({
		tableData: {
			type: Array,
			default: [],
		},
		editIcon: {
			type: Boolean,
			default: false,
		},
	});

	const emit = defineEmits(["handle-view", "handle-edit"]);
	const authStore = useAuthStore();
	const dialogVisibleProjectSourcingModal = ref(false);
	const dialogVisibleProjectSelectionModal = ref(false);
	const dialogVisibleProjectSigningModal = ref(false);
	const dialogVisibleProjectSupervisionModal = ref(false);
	const dialogVisibleProjectConfirmModal = ref(false);
	const rowId = ref<any>("");
	const localePath = useLocalePath();

	const handleView = (row: any) => {
		emit("handle-view", row);
	};

	const handleEdit = (row: any) => {
		emit("handle-edit", row);
	};

	interface Item {
		// expected_dates_of_completion: String;
		// budget: String;
		activity_type: Number;
		// currency: String;
	}

	const formatterActivityType = (row: Item) => {
		return row.activity_type === 1
			? "Single Source"
			: row.activity_type === 2
			? "Framework"
			: row.activity_type === 3
			? "Stay with incumbent"
			: row.activity_type === 4
			? "Request for Information (RFI)"
			: row.activity_type === 5
			? "Request for Quotation (RFQ)"
			: "Invite to Tender (ITT)";
	};
	const handleChangeStatus = (data: any) => {
		navigateTo(localePath(`/project-pipeline/projects/change-status/${data.id}`));
	};
</script>
<template>
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 text-sm 2xl:text-base">
		<div class="rounded-lg p-4 bg-[#edeced] shadow-lg" v-for="data in tableData" :key="data.id">
			<div class="flex items-center mb-6 xl:mb-4">
				<div class="flex items-center">
					<el-tag
						class="w-[95px]"
						disable-transitions
						:class="
							data.status == 1
								? 'border border-[purple] hover:border-[purple] focus:border-[purple] bg-[purple]/10 hover:bg-[purple] focus:bg-[purple] text-[purple] hover:text-white focus:text-white'
								: data.status == 2
								? 'border border-[orange] hover:border-[orange] focus:border-[orange] text-[orange] bg-[orange]/10 hover:bg-[orange] focus:bg-[orange] focus:text-white hover:text-white'
								: data.status == 3
								? 'border border-[green] hover:border-[green] focus:border-[green] bg-[green]/10 hover:bg-[green] focus:bg-[green] text-[green] hover:text-white focus:text-white'
								: data.status == 4
								? 'border border-[teal] hover:border-[teal] focus:border-[teal] text-[teal] bg-[teal]/10 hover:bg-[teal] focus:bg-[teal] focus:text-white hover:text-white'
								: data.status == 5
								? 'border border-[#3f51b5] hover:border-[#3f51b5] focus:border-[#3f51b5] text-[#3f51b5] bg-[#3f51b5]/10 hover:bg-[#3f51b5] focus:bg-[pink] focus:text-white hover:text-white'
								: 'border border-[#b5693f] hover:border-[#b5693f] focus:border-[#b5693f] text-[#b5693f] bg-[#b5693f]/10 hover:bg-[#b5693f] focus:bg-[#b5693f] focus:text-white hover:text-white'
						"
					>
						{{
							data.status === 1
								? "New Project"
								: data.status === 2
								? " On Hold"
								: data.status === 3
								? "Sourcing"
								: data.status === 4
								? "Selection"
								: data.status === 5
								? "Signing"
								: "Supervision"
						}}
					</el-tag>
				</div>

				<el-dropdown class="ml-auto mt-2">
					<span class="px-4 outline-0">
						<i class="fa-solid fa-ellipsis"></i>
					</span>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item @click="handleView(data)"
								><i class="fa-fw fa-light fa-eye"></i>{{ $t("labels.view") }}</el-dropdown-item
							>

							<el-dropdown-item
								v-if="data.is_project_owner && data.isCompleted !== 'Completed' && props.editIcon"
								@click="handleEdit(data)"
								><i class="fa-fw fa-light fa-edit"></i>{{ $t("labels.edit") }}</el-dropdown-item
							>

							<el-dropdown-item
								v-if="data.is_approval_authority && data.approval_authority_status == 1"
								@click="handleChangeStatus(data)"
								><i class="fa-light fa-bolt"></i> {{ $t("labels.change_status") }}</el-dropdown-item
							>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
			</div>

			<div class="grid grid-cols-2 text-sm 2xl:text-base xxl:gap-4 gap-2 text-dark">
				<div>
					<BaseLabel
						icon='<i class="fa-regular fa-fw fa-id-card xxl:mr-3 xl:mr-2"></i>'
						:tooltip-content="$t('formLabels.project_number')"
					/>
					<el-link
						type="primary"
						class="cursor-pointer hover:text-primary"
						@click="navigateTo(localePath(`/project-pipeline/projects/view-project/${data?.id}`))"
						>{{ data.project_number || "-" }}</el-link
					>
				</div>
				<div class="truncate">
					<BaseLabel
						icon='<i class="fa-regular fa-code-pull-request xxl:mr-3 xl:mr-2"></i>'
						:tooltip-content="$t('formLabels.request_type')"
					/>
					{{
						data.request_type === 1
							? "New requirement"
							: data.request_type === 2
							? "Renewal"
							: data.request_type === 3
							? "Compliance"
							: data.request_type === 4
							? "Benchmarking"
							: data.request_type === 5
							? "Change Request"
							: "-"
					}}
				</div>

				<div class="truncate">
					<BaseLabel icon='<i class="fa-regular fa-fw fa-user-pen xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.requestor')" />
					{{ data.requester_name || "-" }}
				</div>

				<div class="truncate">
					<BaseLabel icon='<i class="fa-regular fa-fw fa-user xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.project_owner')" />
					{{ data.project_owner_name || "-" }}
				</div>

				<div class="truncate">
					<BaseLabel
						icon='<i class="fa-regular fa-fw fa-briefcase xxl:mr-3 xl:mr-2"></i>'
						:tooltip-content="$t('formLabels.project_title')"
					/>
					{{ data.project_title || "-" }}
				</div>

				<div class="truncate">
					<BaseLabel
						icon='<i class="fa-regular fa-fw fa-chart-line xxl:mr-3 xl:mr-2"></i>'
						:tooltip-content="$t('formLabels.activity_type')"
					/>
					<span v-if="data.activity_type">{{ formatterActivityType(data) }}</span>
					<span v-else>-</span>
				</div>

				<div class="truncate">
					<BaseLabel
						icon='<i class="fa-regular fa-fw fa-chart-mixed-up-circle-dollar xxl:mr-3 xl:mr-2"></i>'
						:tooltip-content="$t('formLabels.budget')"
					/>
					{{ data.budget || "-" }}
				</div>
				<div class="truncate">
					<BaseLabel
						icon='<i class="fa-regular fa-signal xxl:mr-3 xl:mr-2"></i>'
						:tooltip-content="$t('formLabels.approval_authority_status')"
					/>
					<span
						:class="
							data.approval_authority_status == 0
								? 'text-[purple] font-bold'
								: data.approval_authority_status == 1
								? 'text-[orange] font-bold'
								: data.approval_authority_status == 2
								? 'text-[green] font-bold'
								: data.approval_authority_status == 3
								? 'text-[red] font-bold'
								: ''
						"
					>
						{{
							data.approval_authority_status === 0
								? "Not Assigned"
								: data.approval_authority_status === 1
								? "Awaited"
								: data.approval_authority_status === 2
								? "Approved"
								: data.approval_authority_status === 3
								? "Rejected"
								: ""
						}}
					</span>
				</div>
			</div>
		</div>
	</div>
</template>
