<script setup lang="ts">
	const props = defineProps({
		tableData: {
			type: Array,
			default: [],
		},
	});
	const route = useRoute();

	const emit = defineEmits(["handle-archived", "handle-view"]);

	const handleArchived = (row: any) => {
		emit("handle-archived", row);
	};

	const handleView = (row: any) => {
		emit("handle-view", row);
	};
</script>
<template>
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 text-sm 2xl:text-base">
		<div class="rounded-lg p-4 bg-[#edeced] shadow-lg" v-for="data in tableData" :key="data.id">
			<div class="flex items-center mb-6 xl:mb-4">
				<div class="flex-1 overflow-hidden">
					<div class="text-sm 2xl:text-base font-bold text-dark truncate" v-if="data.company_name">
						{{ data.company_name }}
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
							<el-dropdown-item @click="handleArchived(data)">
								<i :class="+route.query?.isArchived === 1 ? 'fa-light fa-fw fa-box-archive' : 'fa-light fa-fw fa-box-archive'"></i
								>{{ +route.query?.isArchived === 1 ? $t("labels.unarchvie") : $t("labels.archvie") }}
							</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
			</div>

			<div class="grid grid-cols-2 text-sm 2xl:text-base xxl:gap-4 gap-2 text-dark">
				<div class="truncate" v-if="data.full_name">
					<BaseLabel icon='<i class="fa-regular fa-fw fa-user xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.full_name')" />
					{{ data.full_name }}
				</div>

				<div class="truncate" v-if="data.mobile_number">
					<BaseLabel icon='<i class="fa-regular fa-fw fa-phone xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.contact_number')" />
					{{ data.country_code + " " + data.mobile_number }}
				</div>
				<div class="truncate" v-if="data.mobile">
					<BaseLabel icon='<i class="fa-regular fa-fw fa-phone xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.contact_number')" />
					{{ data.mobile_country_code + " " + data.mobile }}
				</div>

				<div class="truncate" v-if="data.created_at">
					<BaseLabel
						icon='<i class="fa-regular fa-fw fa-calendar-days xxl:mr-3 xl:mr-2"></i>'
						:tooltip-content="$t('formLabels.created_date')"
					/>
					{{ data.created_at }}
				</div>

				<div class="truncate">
					<BaseLabel icon='<i class="fa-regular fa-fw fa-envelope xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.email')" />
					{{ data.email }}
				</div>
				<div v-if="data.is_existing_user === 1 || data.is_existing_user === 0">
					<BaseLabel
						icon='<i class="fa-regular fa-fw fa-user-plus xxl:mr-3 xl:mr-2"></i>'
						:tooltip-content="$t('formLabels.are_you_an_existing_user')"
					/>
					<!-- {{ "Existing User" }} : -->
					{{ data.is_existing_user === 1 ? "Yes" : "No" }}
				</div>

				<div class="truncate">
					<BaseLabel icon='<i class="fa-regular fa-fw fa-clipboard xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.subject')" />
					{{ data.subject || "-" }}
				</div>
			</div>
		</div>
	</div>
</template>
