<script setup lang="ts">
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

	const emit = defineEmits(["handle-edit", "handle-view"]);

	onMounted(() => {});

	const handleEdit = (row: any) => {
		emit("handle-edit", row);
	};

	const handleView = (row: any) => {
		emit("handle-view", row);
	};
</script>

<template>
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 text-sm 2xl:text-base">
		<div class="rounded-lg p-4 bg-[#edeced] shadow-lg" v-for="data in tableData" :key="data.id">
			<div class="flex items-center mb-6 xl:mb-4">
				<el-dropdown class="ml-auto mt-2">
					<span class="px-4 outline-0">
						<i class="fa-solid fa-ellipsis"></i>
					</span>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item @click="handleView(data)"
								><i class="fa-fw fa-light fa-eye"></i> {{ $t("labels.view") }}</el-dropdown-item
							>
							<el-dropdown-item v-if="editIcon" @click="handleEdit(data)"
								><i class="fa-fw fa-light fa-pen"></i> {{ $t("labels.edit") }}</el-dropdown-item
							>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
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
				<div class="truncate" v-if="data.mobile">
					<BaseLabel icon='<i class="fa-regular fa-fw fa-phone xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.mobile')" />
					{{ data.mobile_country_code + " " + data.mobile }}
				</div>

				<div class="truncate" v-if="data.email">
					<BaseLabel icon='<i class="fa-regular fa-fw fa-envelope xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.email')" />
					{{ data.email }}
				</div>
			</div>
		</div>
	</div>
</template>
