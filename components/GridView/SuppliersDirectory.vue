<script setup lang="ts">
	const props = defineProps({
		tableData: {
			type: Array,
			default: [],
		},
	});

	const emit = defineEmits(["handle-edit", "handle-view", "handle-supplier-user"]);

	const handleView = (row: any) => {
		emit("handle-view", row);
	};

</script>

<template>
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 text-sm 2xl:text-base">
		<div class="rounded-lg p-4 bg-[#edeced] shadow-lg" v-for="data in tableData" :key="data.id">
			<div class="flex items-center mb-6 xl:mb-4">
				<div class="pr-4 flex-none" v-if="data.company_logo">
					<NuxtImg :src="data.company_logo" class="h-12" />
				</div>
				<div class="flex-1 overflow-hidden">
					<div class="text-sm 2xl:text-base font-bold text-dark truncate" v-if="data.company_name">
						{{ data.company_name }}
					</div>
					<div class="text-xs 2xl:text-sm font-normal text-dark truncate mr-2" v-if="data.company_number">
						{{ data.company_number }}
					</div>
				</div>

				<el-dropdown class="ml-auto mt-2">
					<span class="px-4 outline-0">
						<i class="fa-solid fa-ellipsis"></i>
					</span>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item @click="handleView(data)"><i class="fa-fw fa-light fa-eye"></i> {{ $t("labels.view") }}</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
			</div>

			<div class="grid grid-cols-2 text-sm 2xl:text-base xxl:gap-4 gap-2 text-dark">
				<div v-if="data.sup_ref_number">
                    <BaseLabel 
                        icon='<i class="fa-regular fa-fw fa-id-card xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.supplier_code')" 
                    />
					{{ data.sup_ref_number }}
				</div>
				<div class="truncate" v-if="data.full_name">
					<BaseLabel 
                        icon='<i class="fa-regular fa-fw fa-user xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.full_name')" 
                    />
					{{ data.full_name }}
				</div>

				<div class="truncate" v-if="data.mobile">
					<BaseLabel 
                        icon='<i class="fa-regular fa-fw fa-phone xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.mobile')" 
                    />
					{{ data.mobile_country_code + " " + data.mobile }}
				</div>

				<div class="truncate" v-if="data.email">
					<BaseLabel 
                        icon='<i class="fa-regular fa-fw fa-envelope xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.email')" 
                    />
					{{ data.email }}
				</div>
			</div>
		</div>
	</div>
</template>
