<script setup lang="ts">
	import moment from "moment";

	const props = defineProps({
		tableData: {
			type: Array,
			default: [],
		},
	});

	const emit = defineEmits(["handle-edit", "handle-view"]);

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
			<div class="flex items-center mb-3">
				<el-dropdown class="ml-auto">
					<span class="px-4 outline-0">
						<i class="fa-solid fa-ellipsis"></i>
					</span>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item @click="handleView(data)"
								><i class="fa-fw fa-light fa-eye"></i> {{ $t("labels.view") }}</el-dropdown-item
							>
							<el-dropdown-item @click="handleEdit(data)"
								><i class="fa-fw fa-light fa-edit"></i> {{ $t("labels.edit") }}</el-dropdown-item
							>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
			</div>

			<div class="grid grid-cols-2 text-sm 2xl:text-base xxl:gap-4 gap-2 text-dark">
				<div class="truncate">
					<BaseLabel icon='<i class="fa-regular fa-fw fa-user xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.sub_entity_name')" />
					{{ data.sub_entity_name || "-" }}
				</div>
				<div class="truncate">
					<BaseLabel
						icon='<i class="fa-regular fa-fw fa-user-pen xxl:mr-3 xl:mr-2"></i>'
						:tooltip-content="$t('formLabels.contact_person_name')"
					/>
					{{ data.contact_person_name || "-" }}
				</div>
				<div class="truncate">
					<BaseLabel icon='<i class="fa-regular fa-fw fa-phone xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.contact_number')" />
					{{ data.country_code + " " + data.contact_number || "-" }}
				</div>
				<div class="truncate">
					<BaseLabel icon='<i class="fa-regular fa-fw fa-envelope xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.email')" />
					{{ data.email || "-" }}
				</div>
			</div>
		</div>
	</div>
</template>
