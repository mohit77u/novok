<script setup lang="ts">
	const props = defineProps({
		tableData: {
			type: Array,
			default: [],
		},
	});

	const emit = defineEmits(["handle-edit", "handle-view", "handle-retry", "handle-client-admin-access"]);

	const handleEdit = (row: any) => {
		emit("handle-edit", row);
	};

	const handleRetry = (row: any) => {
		emit("handle-retry", row);
	};

	const handleView = (row: any) => {
		emit("handle-view", row);
	};

	const handleClientAdminAccess = (row: any) => {
		emit("handle-client-admin-access", row);
	};
</script>
<template>
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
		<div class="rounded-lg p-4 bg-[#edeced] shadow-lg" v-for="data in tableData" :key="data.id">
			<div class="flex items-center mb-3">
				<div class="status">
					<span
						class="text-xs rounded text-success bg-success/5 border border-success hover:bg-success hover:text-white self-center px-3 py-[2px] inline-block"
						v-if="data.account_status === 1"
					>
						{{ "Active" }}
					</span>
					<span
						class="text-xs rounded text-danger border bg-border/5 border-danger hover:bg-danger hover:text-white self-center px-3 py-[2px] inline-block"
						v-if="data.account_status === 0"
					>
						{{ "Inactive" }}
					</span>
				</div>

				<el-dropdown class="ml-auto">
					<span class="px-4 outline-0">
						<i class="fa-solid fa-ellipsis"></i>
					</span>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item @click="handleEdit(data)"
								><i class="fa-fw fa-light fa-pen"></i> {{ $t("labels.edit") }}</el-dropdown-item
							>

							<el-dropdown-item @click="handleView(data)"
								><i class="fa-fw fa-light fa-eye"></i> {{ $t("labels.view") }}</el-dropdown-item
							>

							<el-dropdown-item v-if="data.microservice_status === 3" @click="handleRetry(data)"
								><i class="fa-fw fa-light fa-rotate-right"></i> {{ $t("labels.retry") }}</el-dropdown-item
							>

							<el-dropdown-item v-if="data.microservice_status === 2" @click="handleClientAdminAccess(data)"
								><i class="fa-regular fa-user-gear text-dark/50 hover:text-primary"></i>
								{{ $t("labels.client_admin_access") }}</el-dropdown-item
							>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
			</div>
			<div class="flex items-start mb-6 xl:mb-4">
				<div class="pr-4 flex-none" v-if="data.company_logo">
					<NuxtImg :src="data.company_logo" class="h-12" />
				</div>
				<div class="flex-1 overflow-hidden">
					<div class="text-sm 2xl:text-base font-bold text-dark truncate" v-if="data.company_name">
						{{ data.company_name }}
					</div>
					<p class="mb-0">
						<span class="text-sm 2xl:text-base font-normal text-dark truncate mr-2" v-if="data.company_number">
							{{ data.company_number }}
						</span>
					</p>
				</div>
			</div>

			<div class="grid grid-cols-2 text-sm 2xl:text-base xxl:gap-4 gap-2 text-dark">
				<div class="truncate" v-if="data.full_name">
					<BaseLabel icon='<i class="fa-regular fa-fw fa-user xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.full_name')" />
					{{ data.full_name }}
				</div>
				<div class="truncate" v-if="data.job_title">
					<BaseLabel icon='<i class="fa-regular fa-fw fa-user-pen xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.job_title')" />
					{{ data.job_title }}
				</div>
				<div class="truncate" v-if="data.department">
					<BaseLabel icon='<i class="fa-regular fa-fw fa-briefcase xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.department')" />
					{{ data.department }}
				</div>
				<div class="truncate" v-if="data.mobile_number">
					<BaseLabel icon='<i class="fa-regular fa-fw fa-phone xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.mobile')" />
					{{ data.country_code + " " + data.mobile_number }}
				</div>

				<div class="truncate" v-if="data.email">
					<BaseLabel icon='<i class="fa-regular fa-fw fa-envelope xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.email')" />
					{{ data.email }}
				</div>
				<!-- <div class="col-span-2">
						{{ $t("columnLabels.tenant_creation") }} :
						{{ data.microservice_status === 1 ? "inProcess" : data.microservice_status === 2 ? "Success" : "Falied" }}
					</div> -->
			</div>
		</div>
	</div>
</template>
