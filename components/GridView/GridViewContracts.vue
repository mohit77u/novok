<script setup lang="ts">
	import { useAuthStore } from "~/store/auth";

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

	const emit = defineEmits([
		"handle-edit",
		"handle-view",
		"handle-email-trigger",
		"handle-preview-document",
		"handle-clone-contract",
		"handle-status-change",
	]);

	const authStore = useAuthStore();

	const getRolId = computed(() => {
		return authStore.getRoleId;
	});

	const handleEdit = (row: any) => {
		emit("handle-edit", row);
	};

	const handleView = (row: any) => {
		emit("handle-view", row);
	};

	const handleEmailTrigger = (row: any) => {
		emit("handle-email-trigger", row);
	};

	const handlePreviewDocument = (row: any) => {
		emit("handle-preview-document", row);
	};

	const handleCloneContract = (row: any) => {
		emit("handle-clone-contract", row);
	};

	const handleStatusChange = (row: any) => {
		emit("handle-status-change", row);
	};
</script>
<template>
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 text-sm 2xl:text-base">
		<div class="rounded-lg p-4 bg-[#edeced] shadow-lg" v-for="data in tableData" :key="data.id">
			<div class="flex items-center mb-2">
				<div class="status">
					<span
						@click="handleStatusChange(data)"
						class="text-xs rounded border self-center px-3 py-[2px] inline-block"
						:class="
							data.status === 1
								? 'bg-primary/10 text-primary border-primary cursor-pointer'
								: data.status === 2
								? 'bg-warning/10 text-warning border-warning cursor-pointer'
								: data.status === 3
								? 'bg-success/10 text-success border-success cursor-pointer'
								: data.status === 4
								? 'bg-danger/10 text-danger border-danger events-none cursor-not-allowed'
								: data.status === 5
								? 'bg-danger/10 text-danger border-danger events-none cursor-not-allowed'
								: 'bg-danger/10 text-danger border-danger events-none cursor-not-allowed'
						"
					>
						{{
							data.status === 1
								? $t("dropdown_labels.draft")
								: data.status === 2
								? $t("dropdown_labels.pending")
								: data.status === 3
								? $t("formLabels.active")
								: data.status === 4
								? $t("formLabels.expired")
								: data.status === 5
								? $t("dropdown_labels.terminated")
								: $t("dropdown_labels.breached")
						}}
					</span>
				</div>
				<el-dropdown class="ml-auto">
					<span class="px-4 outline-0">
						<i class="fa-solid fa-ellipsis"></i>
					</span>
					<template #dropdown>
						<el-dropdown-menu v-if="getRolId === 'supplier_admin' || getRolId === 'supplier_user'">
							<el-dropdown-item @click="handleView(data)">
								<i class="fa-regular fa-fw fa-eye"></i>
								{{ $t("labels.view") }}
							</el-dropdown-item>
						</el-dropdown-menu>
						<el-dropdown-menu v-else>
							<el-dropdown-item @click="handleView(data)"
								><i class="fa-fw fa-light fa-eye"></i> {{ $t("labels.view") }}</el-dropdown-item
							>
							<el-dropdown-item
								v-if="data.status !== 4 && data.status !== 5 && data.status !== 6 && editIcon"
								@click="handleEdit(data)"
							>
								<i class="fa-fw fa-light fa-pen"></i> {{ $t("labels.edit") }}
							</el-dropdown-item>

							<el-dropdown-item
								v-if="data.status !== 4 && data.status !== 5 && data.status !== 6 && editIcon"
								@click="handleEmailTrigger(data)"
							>
								<i class="fa-regular fa-fw fa-paper-plane"></i>{{ $t("labels.email_trigger") }}
							</el-dropdown-item>

							<el-dropdown-item @click="handlePreviewDocument(data)"
								><i class="fa-regular fa-fw fa-file"></i>{{ $t("labels.preview-document") }}</el-dropdown-item
							>

							<el-dropdown-item v-if="hasPermissionTo('contracts-create')" @click="handleCloneContract(data)"
								><i class="fa-regular fa-fw fa-clone"></i>{{ $t("labels.clone") }}</el-dropdown-item
							>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
			</div>

			<div class="flex-1 overflow-hidden mt-2 mb-3">
				<div class="text-sm 2xl:text-base font-bold text-dark truncate">
					{{ data.title || "-" }}
				</div>
				<div class="text-xs 2xl:text-xs font-bold text-dark truncate">
					{{ data.contract_number || "-" }}
				</div>
			</div>

			<div class="grid grid-cols-2 text-sm 2xl:text-base xxl:gap-4 gap-2 text-dark">
				<div>
					<BaseLabel
						icon='<i class="fa-regular fa-fw fa-id-card xxl:mr-3 xl:mr-2"></i>'
						:tooltip-content="$t('formLabels.supplier_name')"
					/>
					{{ data.supplier_name || "-" }}
				</div>

				<div class="truncate">
					<BaseLabel
						icon='<i class="fa-regular fa-fw fa-calendar-days xxl:mr-3 xl:mr-2"></i>'
						:tooltip-content="$t('formLabels.contract_start_date')"
					/>
					<span class="font-bold">Start : </span>{{ data.contract_start_date || "-" }}
				</div>
				<div class="truncate">
					<BaseLabel
						icon='<i class="fa-regular fa-fw fa-calendar-days xxl:mr-3 xl:mr-2"></i>'
						:tooltip-content="$t('formLabels.contract_end_date')"
					/>
					<span class="font-bold">End : </span>{{ data.contract_end_date || "-" }}
				</div>
			</div>
		</div>
	</div>
</template>
