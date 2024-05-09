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

	const rowId = ref("");
	const dialogVisibleWorkProgressModal = ref(false);
	const dialogVisibleRequestModal = ref(false);
	const dialogVisibleRejectModal = ref(false);
	const authStore = useAuthStore();
	const localePath = useLocalePath();

	const emit = defineEmits(["handle-edit", "handle-view"]);

	const handleEdit = (row: any) => {
		emit("handle-edit", row);
	};
	const handleView = (row: any) => {
		emit("handle-view", row);
	};

	const showEdit = (data: any) => {
		return (
			(data.status !== 2 && props.editIcon && authStore.role_id === "client_admin") ||
			(data.status !== 2 && props.editIcon && data?.isCanChangeStatus && authStore.role_id !== "client_admin")
		);
	};

	const handleChangeStatus = (data: any) => {
		navigateTo(localePath(`/project-pipeline/requests/change-status/${data.id}`));
	};
</script>
<template>
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 text-sm 2xl:text-base">
		<div class="rounded-lg p-4 bg-[#edeced] shadow-lg" v-for="data in tableData" :key="data.id">
			<div class="flex items-center mb-6 xl:mb-4">
				<div class="status flex-1 overflow-hidden">
					<div class="flex items-center">
						<el-tag
							class="w-[65px]"
							disable-transitions
							:class="
								data.status === 1
									? 'bg-primary/10 border border-primary text-primary text-bold'
									: data.status === 2
									? 'bg-success/10 border border-success text-success text-bold'
									: 'bg-danger/10 border border-danger text-danger text-bold'
							"
						>
							{{ data.status === 1 ? "Awaited" : data.status === 2 ? " Approved" : "Rejected" }}
						</el-tag>
					</div>
				</div>

				<el-dropdown class="ml-auto mt-2">
					<span class="px-4 outline-0">
						<i class="fa-solid fa-ellipsis"></i>
					</span>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item @click="handleView(data)"
								><i class="fa-fw fa-light fa-eye"></i> {{ $t("labels.view") }}</el-dropdown-item
							>
							<el-dropdown-item v-if="showEdit(data)" @click="handleEdit(data)"
								><i class="fa-fw fa-light fa-pen"></i> {{ $t("labels.edit") }}</el-dropdown-item
							>

							<el-dropdown-item v-if="authStore.role_id === 'client_admin' && data.status == 1" @click="handleChangeStatus(data)"
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
						:tooltip-content="$t('formLabels.request_number')"
					/>
					{{ data.request_number || "-" }}
				</div>

				<div class="truncate">
					<BaseLabel
						icon='<i class="fa-regular fa-fw fa-user xxl:mr-3 xl:mr-2"></i>'
						:tooltip-content="$t('formLabels.requestor')"
					/>
					{{ data.requester_name || "-" }}
				</div>
				<div class="truncate">
					<BaseLabel icon='<i class="fa-regular fa-fw fa-user-pen xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.title')" />
					{{ data.title || "-" }}
				</div>
				<div class="truncate">
					<BaseLabel
						icon='<i class="fa-regular fa-fw fa-calendar-days xxl:mr-3 xl:mr-2"></i>'
						:tooltip-content="$t('formLabels.expected_date_of_completion')"
					/>
					{{ data.expected_dates_of_completion ? moment(`${data.expected_dates_of_completion}`).format("DD/MM/YYYY  hh:mm A") : "-" }}
				</div>

				<!-- <div class="truncate">
					<BaseLabel
						icon='<i class="fa-regular fa-fw fa-briefcase xxl:mr-3 xl:mr-2"></i>'
						:tooltip-content="$t('formLabels.business_unit')"
					/>
					{{ data.business_unit || "-" }}
				</div> -->
				<div class="truncate">
					<i class="fa-regular fa-code-pull-request xxl:mr-3 xl:mr-2"></i>
					{{
						data.request_type == 1
							? "New requirement"
							: data.request_type == 2
							? "Renewal"
							: data.request_type == 3
							? "Compliance"
							: data.request_type == 4
							? "Benchmarking"
							: "Change Request"
					}}
				</div>
			</div>
		</div>
	</div>
</template>
