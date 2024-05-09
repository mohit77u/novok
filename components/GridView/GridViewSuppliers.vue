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
	const dialogVisibleSupplierUnapprovedModal = ref(false);
	const rowId = ref("");

	const emit = defineEmits(["handle-edit", "handle-view", "handle-supplier-user", "supplier-status", "supplier-unapproved-status"]);

	const handleEdit = (row: any) => {
		emit("handle-edit", row);
	};

	const handleView = (row: any) => {
		emit("handle-view", row);
	};

	const handleSupplierUser = (row: any) => {
		emit("handle-supplier-user", row);
	};

	const supplierStatusClick = (row: any, value: any) => {
		emit("supplier-status", row, value);
	};

	const dialogOkClickSupplierUnapprovedModal = (value: any) => {
		dialogVisibleSupplierUnapprovedModal.value = value;
	};

	const supplierUnapprovedStatusClick = (row: any, value: any) => {
		rowId.value = row.id;
		dialogVisibleSupplierUnapprovedModal.value = true;
		// emit("supplier-status", row, value);
	};

	const SupplierUnapprovedData = (Id: any, value: any, formData: any) => {
		if (Id) {
			emit("supplier-unapproved-status", Id, "2", formData);
		} else {
			emit("supplier-unapproved-status", rowId.value, "2", formData);
		}
	};
</script>

<template>
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 text-sm 2xl:text-base">
		<div class="rounded-lg p-4 bg-[#edeced] shadow-lg" v-for="data in tableData" :key="data.id">
			<div class="flex items-center mb-4">
				<el-dropdown trigger="click" :disabled="!editIcon">
					<el-button
						class="default"
						size="small"
						:class="
							data.status == 3
								? 'border border-success hover:border-success focus:border-success bg-success/10 hover:bg-success focus:bg-success text-success hover:text-white focus:text-white'
								: data.status == 4
								? 'border border-[#ff8e28] hover:border-[#ff8e28] focus:border-[#ff8e28] bg-[#ff8e28]/10 hover:bg-[#ff8e28] focus:bg-[#ff8e28] text-[#ff8e28] focus:text-white hover:text-white'
								: data.status == 2
								? 'border border-danger hover:border-danger focus:border-danger bg-danger/10 hover:bg-danger focus:bg-danger focus:text-white hover:text-white text-danger'
								: 'border border-danger hover:border-danger focus:border-danger text-danger bg-danger/10 hover:bg-danger focus:bg-danger focus:text-white hover:text-white'
						"
					>
						<span>{{
							data.status === 1
								? $t("dropdown_labels.uncontracted_unapproved")
								: data.status === 2
								? $t("dropdown_labels.unapproved_contracted")
								: data.status === 3
								? $t("dropdown_labels.approved_contracted")
								: data.status === 4
								? $t("dropdown_labels.approved_uncontracted")
								: ""
						}}</span>
						<i v-if="editIcon" class="fa-solid fa-angle-down ml-4"></i>
					</el-button>

					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item @click="supplierStatusClick(data, '3')"
								><span class="text-[green]">{{ $t("dropdown_labels.approved_contracted") }}</span></el-dropdown-item
							>

							<el-dropdown-item @click="supplierStatusClick(data, '4')"
								><span class="text-[#ff8e28]">{{ $t("dropdown_labels.approved_uncontracted") }}</span></el-dropdown-item
							>
							<el-dropdown-item @click="supplierUnapprovedStatusClick(data, '2')"
								><span class="text-danger">{{ $t("dropdown_labels.unapproved_contracted") }}</span></el-dropdown-item
							>
							<el-dropdown-item @click="supplierStatusClick(data, '1')"
								><span class="text-danger">{{ $t("dropdown_labels.uncontracted_unapproved") }}</span></el-dropdown-item
							>
						</el-dropdown-menu>
					</template>
				</el-dropdown>

				<BaseSupplierStatusContentModal :id="data.status" />

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

							<el-dropdown-item
								v-if="hasPermissionTo('suppliers-user-view-all') || hasPermissionTo('suppliers-user-view')"
								@click="handleSupplierUser(data)"
								><i class="fa-fw fa-light fa-user"></i> {{ $t("labels.supplier_user") }}</el-dropdown-item
							>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
			</div>
			<div class="flex items-center mb-3 xl:mb-2">
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
			</div>

			<div class="grid grid-cols-2 text-sm 2xl:text-base xxl:gap-4 gap-2 text-dark">
				<!-- <div v-if="data.sup_ref_number">
                    <BaseLabel 
                        icon='<i class="fa-regular fa-fw fa-id-card xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.supplier_code')" 
                    />
                </div> -->

				<div class="truncate" v-if="data.full_name">
					<BaseLabel icon='<i class="fa-regular fa-fw fa-user xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.full_name')" />
					{{ data.full_name }}
				</div>

				<div>
					<BaseLabel
						icon='<i class="fa-regular fa-fw fa-list xxl:mr-3 xl:mr-2"></i>'
						:tooltip-content="$t('formLabels.category_level_1')"
					/>
					{{ data.category || "-" }}
				</div>

				<div class="flex items-center">
					<BaseLabel icon='<i class="fa-regular fa-fw fa-globe xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.country')" />
					<p class="truncate">{{ data.cor_country || "-" }}</p>
				</div>
				<div class="cols-span-2 truncate">
					<BaseLabel
						icon='<i class="fa-regular fa-fw fa-browser xxl:mr-3 xl:mr-2"></i>'
						:tooltip-content="$t('formLabels.company_website')"
					/>
					{{ data.company_website || "-" }}
				</div>

				<!-- <div class="truncate" v-if="data.mobile">
					<i class="fa-regular fa-fw fa-phone xxl:mr-3 xl:mr-2"></i>
					{{ data.mobile_country_code + " " + data.mobile }}
				</div> -->

				<!-- <div class="truncate" v-if="data.email">
					<BaseLabel 
                        icon='<i class="fa-regular fa-fw fa-envelope xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.email')" 
                    />
                </div> -->

				<!-- <div class="truncate">
                    <BaseLabel 
                        icon='<i class="fa-regular fa-fw fa-user-check xxl:mr-3 xl:mr-2"></i>' :tooltip-content="$t('formLabels.is_key_supplier')" 
                    />
                </div> -->
			</div>
		</div>
	</div>
	<base-supplier-un-approved-status-modal
		v-if="dialogVisibleSupplierUnapprovedModal === true"
		:dialog-visible="dialogVisibleSupplierUnapprovedModal"
		:id="rowId"
		@dialog-ok-click="dialogOkClickSupplierUnapprovedModal"
		@status-data="SupplierUnapprovedData"
	/>
</template>
