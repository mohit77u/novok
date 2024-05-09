<!-- eslint-disable vue/require-default-prop -->
<!-- eslint-disable vue/require-valid-default-prop -->
<script setup lang="ts">
	import { Search } from "@element-plus/icons-vue";
	import { mobileSidebar } from "~/store/mobileSidebar";
	import { useAuthStore } from "~/store/auth";

	const props = defineProps({
		tableData: {
			type: Array,
			default: [],
		},
		total: {
			type: Number,
			default: 0,
		},
		tableColumn: {
			type: Array,
			default: [],
		},
		editIcon: {
			type: Boolean,
			default: false,
		},
		preview: {
			type: Boolean,
			default: false,
		},
		tableRowClassName: {
			type: Function,
			// default: Function,
		},
		stripe: {
			type: Boolean,
			default: true,
		},
		name: {
			type: String,
			default: "",
		},
		deleteBtn: {
			type: Boolean,
			default: false,
		},
		emailBtn: {
			type: Boolean,
			default: false,
		},
		statusBtn: {
			type: Boolean,
			default: false,
		},
		previewDocument: {
			type: Boolean,
			default: false,
		},
		cloneContract: {
			type: Boolean,
			default: false,
		},
		id: {
			type: String,
			default: "",
		},
		addButton: {
			type: Boolean,
			default: true,
		},
	});
	const emit = defineEmits([
		"handale-current-change",
		"handale-size-change",
		"handale-sort-change",
		"handle-edit",
		"search-value",
		"handle-view",
		"handle-delete",
		"filter-data-type",
		"search-id",
		"handle-email-trigger",
		"handle-status-change",
		"handle-preview-document",
		"handle-clone-contract",
		"handle-my-contract",
		"handle-validation",
		"export-data",
	]);
	const route = useRoute();
	const { t } = useI18n();
	const filterObject = reactive<any>({
		currentPage: 1,
		perPage: 10,
		searchValue: "",
		sortOrder: "",
		sortColumn: "",
		formDetails: "",
		id: 0,
		contractStartDate: "",
		contractEndDate: "",
		contractOwner: "",
		supplierLead: "",
		contractStatus: "",
		currency: "",
		contractType: "",
		category: "",
		contractValidation: "",
		contractTermType: "",
		noticeDueIntervals: "",
		expiringDays: "",
		myContracts: "",
		contractValueStartFrom: "",
		contractValueStartTo: "",
		signingEntity: "",
	});
	const resetFilter = ref<any>(false);

	const defaultSort = ref<any>({});
	const store = mobileSidebar();
	const tableHeight = ref<any>(null);
	const localePath = useLocalePath();
	const searchOptions = ref<any>([]);
	const selectedValue = ref<any>({
		label: "",
		value: "",
	});
	const loading = ref(false);
	const authStore = useAuthStore();
	const displayView = ref("table");
	const dialogVisible = ref(false);
	const validationRow = ref<any>({});
	const resizableData = ref<any>({});
	const columnVisibility = ref<any>({});
	const filteredColumns = ref<any>([]);
	const selectedColumns = ref<any>([]);
	const allTableColumns = ref<any>([]);

	const router = useRouter();

	onMounted(async () => {
		tableHeight.value = GetOffset("table", 90);
		const pageDetails = JSON.parse(sessionStorage.getItem("pageDetails") || " {}");
		Object.keys(filterObject).forEach((field: any) => {
			filterObject[field] = pageDetails[field] || "";
			filterObject["currentPage"] = +pageDetails.currentPage || 1;
			filterObject["perPage"] = +pageDetails.perPage || 10;
		});
		displayView.value = sessionStorage.getItem("displayView") || "table";

		defaultSort.value = {
			prop: filterObject.sortColumn.value,
			order: filterObject.sortOrder.value === "desc" ? "descending" : "ascending",
		};
		const search_value: any = sessionStorage.getItem("searchValue");
		await remoteMethod("");
		if (filterObject.id) {
			selectedValue.value = +search_value || "";
		}

		const oldResizableData = localStorage.getItem("resizableData");
		resizableData.value = oldResizableData ? JSON.parse(oldResizableData) : {};

		let filterTableData: any = localStorage.getItem("filterTableData");
		if (filterTableData) {
			filterTableData = JSON.parse(filterTableData);
			columnVisibility.value = filterTableData[props.id] ?? {};
		} else {
			filterTableData = {};
		}

		let selectedColumnsData: any = localStorage.getItem("selectedColumnsData");
		if (selectedColumnsData) {
			selectedColumnsData = JSON.parse(selectedColumnsData);
			selectedColumns.value = selectedColumnsData[props.id] ?? [];
		} else {
			selectedColumnsData = {};
		}

		// For static fields
		if (!filterTableData[props.id]) {
			columnVisibility.value["contract_number"] = true;
		}
		if (!selectedColumnsData[props.id]) {
			selectedColumns.value.push("contract_number");
		}
		allTableColumns.value.push({
			columnName: "contract_number",
			columnLabel: t("columnLabels.contract_number"),
		});

		props.tableColumn.map((data: any) => {
			if (!filterTableData[props.id]) {
				columnVisibility.value[data.columnName] = true;
			}
			if (!selectedColumnsData[props.id]) {
				selectedColumns.value.push(data.columnName);
			}
			allTableColumns.value.push(data);
		});

		// For static fields
		if (!filterTableData[props.id]) {
			columnVisibility.value["contract_validation"] = true;
			columnVisibility.value["contract_status"] = true;
		}
		if (!selectedColumnsData[props.id]) {
			selectedColumns.value.push("contract_validation");
			selectedColumns.value.push("contract_status");
		}
		allTableColumns.value.push(
			{
				columnName: "contract_validation",
				columnLabel: t("columnLabels.validation"),
			},
			{
				columnName: "contract_status",
				columnLabel: t("columnLabels.Status"),
			}
		);

		filteredColumns.value = props.tableColumn;
	});

	watch(
		() => props.tableData,
		() => {
			const data: any = props.tableData?.find((item: any) => {
				return item.id === +filterObject.id.value;
			});

			if (data !== undefined) {
				selectedValue.value = {
					label: data?.contract_number + "  " + data?.contract_owner || "",
					value: data?.id || "",
				};
			}
		},

		{ deep: true, immediate: true }
	);

	watch(
		() => columnVisibility,
		(columnVisibilityObject) => {
			let items: any = [];

			if (columnVisibilityObject.value && Object.keys(columnVisibilityObject.value).length > 0) {
				Object.keys(columnVisibilityObject.value).forEach((data: any) => {
					if (columnVisibilityObject.value[data]) {
						const findItem = props.tableColumn.find((column: any) => column.columnName == data);

						if (findItem) {
							items.push(findItem);
						}
					}
				});

				filteredColumns.value = items;
			}
		},

		{ deep: true, immediate: true }
	);

	const handleColumnSelect = (value: any, columnName: any) => {
		columnVisibility.value[columnName] = value;

		let filterTableData: any = localStorage.getItem("filterTableData");
		filterTableData = filterTableData ? JSON.parse(filterTableData) : {};
		filterTableData[props.id] = columnVisibility.value;
		localStorage.setItem("filterTableData", JSON.stringify(filterTableData));

		let selectedColumnsData: any = localStorage.getItem("selectedColumnsData");
		selectedColumnsData = selectedColumnsData ? JSON.parse(selectedColumnsData) : {};
		selectedColumnsData[props.id] = selectedColumns.value;
		localStorage.setItem("selectedColumnsData", JSON.stringify(selectedColumnsData));
	};

	const isMobile = computed(() => {
		if (window.innerWidth < 1023) {
			return true;
		} else {
			return false;
		}
	});

	const from = computed(() => {
		// 10 *(0)
		return filterObject.perPage.value * (filterObject.currentPage.value - 1) || 1;
	});

	const to = computed(() => {
		// 2-10*1 = -8
		const highBound = props.total - filterObject.perPage.value * filterObject.currentPage.value;

		if (highBound > 0) {
			return filterObject.perPage.value * filterObject.currentPage.value;
		} else {
			return props.total;
		}
	});

	const getFooterOpen = computed(() => {
		return store.getFooterOpen;
	});

	const handleCurrentChange = (val: any) => {
		filterObject.currentPage = val;
		sessionStorage.setItem("pageDetails", JSON.stringify(filterObject));
		emit("handale-current-change", filterObject);
	};

	const handleSizeChange = (val: any) => {
		filterObject.perPage = val;
		filterObject.currentPage = 1;
		sessionStorage.setItem("pageDetails", JSON.stringify(filterObject));
		emit("handale-size-change", filterObject);
	};

	const handleSortChange = (val: any) => {
		sessionStorage.setItem("pageDetails", JSON.stringify(filterObject));
		const orderType = val.order === "descending" ? "desc" : val.order === "ascending" ? "asc" : "";
		const columnType = val.order ? val.prop : "";
		filterObject.sortColumn = columnType;
		filterObject.sortOrder = orderType;
		emit("handale-sort-change", filterObject);
	};

	const handleEdit = (row: any) => {
		emit("handle-edit", row);
	};

	const handleView = (row: any) => {
		emit("handle-view", row);
	};
	const handleDelete = (row: any) => {
		emit("handle-delete", row);
	};
	const handleEmailTrigger = (row: any) => {
		emit("handle-email-trigger", row);
	};
	const handleStatusChange = (row: any) => {
		if (getRolId.value === "supplier_admin" || getRolId.value === "supplier_user") {
			return;
		} else {
			const allowStatusChanges = [1, 2, 3];
			if (allowStatusChanges.includes(row.status) && props.statusBtn) {
				emit("handle-status-change", row);
			}
		}
	};
	const handlePreviewDocument = (row: any) => {
		emit("handle-preview-document", row);
	};
	const handleCloneContract = (row: any) => {
		emit("handle-clone-contract", row);
	};
	const validationClick = (row: any) => {
		if (props.statusBtn) {
			dialogVisible.value = true;
			validationRow.value = row;
		}
	};
	const handleValidation = async () => {
		// fullscreenLoading.value = true;
		const data = {
			validation: validationRow.value.validation == 1 ? "0" : "1",
		};
		try {
			const res: any = await useApiFetch(`/contracts/change/validation/${validationRow.value.id}`, {
				method: "PATCH",
				body: data,
			});
			useToast("success", res.message);
			emit("handle-validation", filterObject);
		} catch (error: any) {
			// fullscreenLoading.value = false;
		} finally {
			dialogVisible.value = false;
		}
	};

	const clickAdd = (value: any) => {
		sessionStorage.setItem("ContractCreateClick", "1");
		sessionStorage.setItem("createContractType", value);
		if (value) {
			router.push(
				localePath({
					path: "/contracts/add-contract",
				})
			);
		} else {
			router.push(localePath(`/contracts/add-contract?contract_type=${value}`));
		}
	};

	const toggleFooter = () => {
		store.setFooterOpen();
	};

	const filterDataType = (value: any) => {
		Object.keys(filterObject).forEach((field: any) => {
			filterObject[field] = value[field];
			filterObject["currentPage"] = 1;
			filterObject["perPage"] = 10;
		});
		selectedValue.value = {
			label: "",
			value: "",
		};

		emit("filter-data-type", filterObject);

		sessionStorage.setItem("pageDetails", JSON.stringify(filterObject));
	};

	const remoteMethod = async (value: any) => {
		try {
			loading.value = true;

			const res: any = await useApiFetch(`/contracts/search/suggestions?searchValue=${value}`, {
				method: "GET",
			});

			searchOptions.value = res.data.map((item: any) => {
				return {
					label: item.contract_number + "  " + item.full_name,
					value: item.id,
				};
			});

			return searchOptions.value;
		} catch {
		} finally {
			loading.value = false;
		}
	};

	const handleDragEnd = (newWidth: any, oldWidth: any, column: any, event: any) => {
		let colName = column.property;
		colName = props.id + "_" + colName;

		let newData = {
			...resizableData.value,
			[colName]: newWidth,
		};

		resizableData.value = newData;
		localStorage.setItem("resizableData", JSON.stringify(resizableData.value));
	};

	const change = (value: any) => {
		selectedValue.value = value;
		sessionStorage.setItem("searchValue", value);
		Object.keys(filterObject).forEach((field: any) => {
			filterObject[field] = "";
			filterObject["currentPage"] = 1;
			filterObject["perPage"] = 10;
		});
		filterObject.id = value;
		emit("search-id", filterObject);
		sessionStorage.setItem("pageDetails", JSON.stringify(filterObject));
		resetFilter.value = !resetFilter.value;
	};

	const myContractClick = (value: any) => {
		filterObject.currentPage = 1;
		filterObject.perPage = 10;
		filterObject.myContracts = value;
		emit("handle-my-contract", filterObject);
		sessionStorage.setItem("pageDetails", JSON.stringify(filterObject));
	};

	const getRolId = computed(() => {
		return authStore.getRoleId;
	});

	const displayViewClick = () => {
		displayView.value = displayView.value === "table" ? "grid" : "table";
		sessionStorage.setItem("displayView", displayView.value);
	};

	const resetAllFilters = () => {
		Object.keys(filterObject).forEach((field: any) => {
			filterObject[field] = "";
			filterObject["currentPage"] = 1;
			filterObject["perPage"] = 10;
		});
		emit("search-id", filterObject);
		sessionStorage.setItem("pageDetails", JSON.stringify(filterObject));
		selectedValue.value = {
			label: "",
			value: "",
		};
		resetFilter.value = !resetFilter.value;
	};
	const dialogOkClick = (value: any) => {
		dialogVisible.value = value;
	};
	const validationMsgContent = computed(() => {
		const is_msg = validationRow.value.validation == 1 ? "No" : "Yes";
		return `Are you sure you want to change the validation status to : ${is_msg}`;
	});

	const exportContractData = () => {
		let newObj: any = {};

		const columns: any = [];

		Object.keys(columnVisibility.value).forEach((field: any) => {
			if (columnVisibility.value[field]) {
				if (field === "contract_status") {
					columns.push({
						status: t("columnLabels.Status"),
					});
				} else if (field === "contract_validation") {
					columns.push({
						validation: t("columnLabels.validation"),
					});
				} else if (field === "primary_category") {
					columns.push({
						primary_category: t("columnLabels.category"),
					});
				} else if (field === "sub_entity_name") {
					columns.push({
						signing_entity: t("columnLabels.signing_entity"),
					});
				} else {
					columns.push({
						[field]: t("columnLabels." + field),
					});
				}
			}
		});

		columns.forEach((obj: any) => {
			const [key, value] = Object.entries(obj)[0];
			newObj[key] = value;
		});

		const exportData = {
			searchValue: encodeURIComponent(filterObject.searchValue) ?? "",
			sortColumn: filterObject.sortColumn ?? "",
			sortOrder: filterObject.sortOrder ?? "",
			contractOwner: filterObject.contractOwner ?? "",
			totalContractValueOverTerm: filterObject.totalContractValueOverTerm ?? "",
			contractStartDate: filterObject.contractStartDate ?? "",
			contractEndDate: filterObject.contractEndDate ?? "",
			supplierLead: filterObject.supplierLead ?? "",
			currency: filterObject.currency ?? "",
			contractValidation: filterObject.contractValidation ?? "",
			contractStatus: filterObject.contractStatus ?? "",
			category: filterObject.category ?? "",
			contractType: filterObject.contractType ?? "",
			contractValueStartFrom: filterObject.contractValueStartFrom ?? "",
			contractValueStartTo: filterObject.contractValueStartTo ?? "",
			formDetails: filterObject.formDetails ?? "",
			contractTermType: filterObject.contractTermType ?? "",
			myContracts: filterObject.myContracts ?? "",
			id: filterObject.id ?? "",
			column: newObj,
		};
		emit("export-data", exportData);
	};
</script>
<template>
	<div class="flex flex-col h-full w-full">
		<div class="flex-1 overflow-x-auto">
			<div class="flex flex-wrap items-center p-4 gap-2">
				<el-select
					v-model="selectedValue"
					filterable
					remote
					reserve-keyword
					clearable
					placeholder="Please enter a keyword"
					:remote-method="remoteMethod"
					:loading="loading"
					:prefix-icon="Search"
					fit-input-width="true"
					@change="change"
					class="w-56"
				>
					<el-option v-for="item in searchOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
				</el-select>

				<el-radio-group
					v-if="getRolId !== 'supplier_admin' && getRolId !== 'supplier_user'"
					class="flex flex-nowrap"
					v-model="filterObject.myContracts"
				>
					<el-radio :label="1" size="large" @click="myContractClick(1)">{{ $t("formLabels.my_contracts") }}</el-radio>

					<el-radio label="" size="large" @click="myContractClick(0)">{{ $t("formLabels.all_contracts") }}</el-radio>
				</el-radio-group>

				<el-tooltip placement="top" :content="$t('labels.reset')">
					<novok-button
						v-if="getRolId !== 'supplier_admin' && getRolId !== 'supplier_user'"
						type="info"
						class="btn-icon flex-none"
						@click="resetAllFilters"
					>
						<i class="fa-regular fa-arrows-rotate"></i>
					</novok-button>
				</el-tooltip>

				<span class="lg:ml-auto">
					<!-- grid view -->
					<el-tooltip class="box-item" effect="dark" :content="$t('buttons.change_view')" placement="top">
						<novok-button type="info" class="btn-icon flex-none" @click="displayViewClick">
							<i v-if="displayView === 'table'" class="fa-regular fa-objects-column"></i>
							<i v-else class="fa-solid fa-list-ul"></i>
						</novok-button>
					</el-tooltip>
				</span>

				<!-- filter -->
				<BaseFilter @filter-data-type="filterDataType" :reset-filter="resetFilter" />

				<!-- contract export -->
				<el-dropdown trigger="click" :hide-on-click="false" class="">
					<div>
						<el-tooltip :content="$t('buttons.export_csv')" placement="top">
							<novok-button type="info" class="btn-icon relative m-0 flex-none"> <i class="fa-solid fa-download"></i> </novok-button>
						</el-tooltip>
					</div>
					<template #dropdown>
						<el-dropdown-menu class="max-h-[200px] overflow-y-auto">
							<el-dropdown-item>
								<el-tooltip :content="$t('buttons.export_csv')" placement="left">
									<span @click="exportContractData">{{ $t("buttons.export") }}</span>
								</el-tooltip>
							</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>

				<!-- column filter -->
				<el-dropdown v-if="displayView === 'table'" trigger="click" :hide-on-click="false" class="">
					<div>
						<el-tooltip class="box-item" effect="dark" :content="$t('buttons.filter_columns')" placement="top">
							<novok-button type="info" class="btn-icon">
								<i class="fa-regular fa-table-columns"></i>
							</novok-button>
						</el-tooltip>
					</div>

					<template #dropdown>
						<el-dropdown-menu class="max-h-[200px] overflow-y-auto">
							<el-checkbox-group v-model="selectedColumns">
								<el-dropdown-item v-for="(data, index) in allTableColumns" :key="index">
									<el-checkbox
										:id="data.columnName"
										:name="data.columnName"
										:label="data.columnName"
										@change="handleColumnSelect($event, data.columnName)"
									>
										{{ data.columnLabel }}
									</el-checkbox>
								</el-dropdown-item>
							</el-checkbox-group>
						</el-dropdown-menu>
					</template>
				</el-dropdown>

				<!-- create btn -->
				<el-dropdown v-if="addButton && getRolId !== 'supplier_admin' && getRolId !== 'supplier_user'">
					<novok-button type="info" class="flex items-center">
						<i class="fa-solid fa-plus mr-2"></i>
						<span>{{ $t("buttons.create") }}</span>
					</novok-button>

					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item @click="clickAdd('Contract')">
								<el-tooltip placement="left" :content="$t('dropdown_labels.contract')">
									{{ $t("dropdown_labels.contract") }}
								</el-tooltip>
							</el-dropdown-item>
							<el-dropdown-item @click="clickAdd('NDA')">
								<el-tooltip placement="left" :content="$t('dropdown_labels.NDA')">
									{{ $t("dropdown_labels.NDA") }}
								</el-tooltip>
							</el-dropdown-item>
							<el-dropdown-item @click="clickAdd('SOW')">
								<el-tooltip placement="left" :content="$t('dropdown_labels.SOW')">
									{{ $t("dropdown_labels.SOW") }}
								</el-tooltip>
							</el-dropdown-item>
							<el-dropdown-item @click="clickAdd('Order From')">
								<el-tooltip placement="left" :content="$t('dropdown_labels.order_form')">
									{{ $t("dropdown_labels.order_form") }}
								</el-tooltip>
							</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>

				<!-- bulk upload -->
				<el-tooltip placement="top" :content="$t('buttons.bulk_upload')">
					<novok-button
						v-if="addButton && getRolId !== 'supplier_admin' && getRolId !== 'supplier_user'"
						type="info"
						@click="navigateTo(localePath('/contracts/bulk-upload'))"
					>
						{{ $t("buttons.bulk_upload") }}
					</novok-button>
				</el-tooltip>
			</div>

			<div v-if="displayView === 'table'" class="px-4 flex-1">
				<el-table
					stripe
					id="table"
					ref="table"
					:data="tableData"
					style="width: 100%"
					:height="tableHeight"
					:row-class-name="tableRowClassName"
					empty-text="No data found."
					:default-sort="defaultSort"
					header-cell-class-name="whitespace-nowrap"
					@sort-change="handleSortChange"
					@header-dragend="handleDragEnd"
					:border="true"
				>
					<el-table-column
						v-if="columnVisibility['contract_number']"
						:label="$t('columnLabels.contract_number')"
						prop="contract_number"
						fixed="left"
						:min-width="resizableData[props.id + '_' + 'contract_number'] ?? '180'"
					>
						<!-- header with tooltip -->
						<template #header="{ column }">
							<BaseColumnTooltip :column="column" />
						</template>

						<template #default="scope">
							<el-link type="primary" class="cursor-pointer hover:text-primary" @click="handleView(scope.row)">{{
								scope.row.contract_number
							}}</el-link>
						</template>
					</el-table-column>

					<template v-if="!isMobile">
						<el-table-column
							v-for="(data, index) in filteredColumns.slice(0, 1)"
							:key="index"
							:prop="data.columnName"
							:label="data.columnLabel"
							:min-width="resizableData[props.id + '_' + data.columnName] ?? data.width"
							:formatter="data.formatter"
							class="ellipsis"
							:class-name="data.customCellClass || ''"
							:sortable="data.sorting === true ? 'custom' : null"
						>
							<!-- header with tooltip -->
							<template #header="{ column }">
								<BaseColumnTooltip :column="column" />
							</template>
						</el-table-column>

						<el-table-column
							v-for="(data, index) in filteredColumns.slice(1)"
							:key="index"
							:prop="data.columnName"
							:label="data.columnLabel"
							:min-width="resizableData[props.id + '_' + data.columnName] ?? data.width"
							:formatter="data.formatter"
							class="ellipsis"
							:class-name="data.customCellClass || ''"
							:sortable="data.sorting === true ? 'custom' : null"
						>
							<!-- header with tooltip -->
							<template #header="{ column }">
								<BaseColumnTooltip :column="column" />
							</template>
						</el-table-column>
					</template>

					<template v-else>
						<el-table-column
							v-for="(data, index) in filteredColumns"
							:key="index"
							:prop="data.columnName"
							:label="data.columnLabel"
							:min-width="resizableData[props.id + '_' + data.columnName] ?? data.width"
							:formatter="data.formatter"
							class="ellipsis"
							:sortable="data.sorting === true ? 'custom' : null"
						>
							<!-- header with tooltip -->
							<template #header="{ column }">
								<BaseColumnTooltip :column="column" />
							</template>
						</el-table-column>
					</template>

					<el-table-column
						v-if="columnVisibility['contract_validation']"
						:label="$t('columnLabels.validation')"
						prop="contract_validation"
						:min-width="resizableData[props.id + '_' + 'contract_validation'] ?? '110'"
					>
						<!-- header with tooltip -->
						<template #header="{ column }">
							<BaseColumnTooltip :column="column" />
						</template>

						<template #default="scope">
							<el-tag
								style="cursor: pointer"
								:class="
									scope.row.validation === 0
										? 'border border-danger hover:border-danger focus:border-danger text-danger bg-danger/10 hover:bg-danger focus:bg-danger focus:text-white hover:text-white'
										: 'border border-success hover:border-success focus:border-success bg-success/10 hover:bg-success focus:bg-success text-success hover:text-white focus:text-white'
								"
								@click="validationClick(scope.row)"
								>{{ scope.row.validation === 0 ? "No" : "Yes" }}</el-tag
							>
						</template>
					</el-table-column>

					<el-table-column
						v-if="columnVisibility['contract_status']"
						fixed="right"
						:label="$t('columnLabels.Status')"
						prop="contract_status"
						:min-width="resizableData[props.id + '_' + 'contract_status'] ?? '130'"
					>
						<!-- header with tooltip -->
						<template #header="{ column }">
							<BaseColumnTooltip :column="column" />
						</template>

						<template #default="scope">
							<el-tag
								:class="
									scope.row.status === 1
										? 'bg-primary/10 text-primary border-primary cursor-pointer'
										: scope.row.status === 2
										? 'bg-warning/10 text-warning border-warning cursor-pointer'
										: scope.row.status === 3
										? 'bg-success/10 text-success border-success cursor-pointer'
										: scope.row.status === 4
										? 'bg-danger/10 text-danger border-danger events-none cursor-not-allowed'
										: scope.row.status === 5
										? 'bg-danger/10 text-danger border-danger events-none cursor-not-allowed'
										: 'bg-danger/10 text-danger border-danger events-none cursor-not-allowed'
								"
								@click="handleStatusChange(scope.row)"
								>{{
									scope.row.status === 1
										? $t("dropdown_labels.draft")
										: scope.row.status === 2
										? $t("dropdown_labels.pending")
										: scope.row.status === 3
										? $t("formLabels.active")
										: scope.row.status === 4
										? $t("formLabels.expired")
										: scope.row.status === 5
										? $t("dropdown_labels.terminated")
										: $t("dropdown_labels.breached")
								}}</el-tag
							>
						</template>
					</el-table-column>

					<el-table-column fixed="right" :label="$t('columnLabels.actions')" width="100" :resizable="false">
						<!-- header with tooltip -->
						<template #header="{ column }">
							<BaseColumnTooltip :column="column" />
						</template>
						<template #default="scope">
							<el-dropdown trigger="click">
								<span class="el-dropdown-link">
									<i class="fa-solid fa-ellipsis p-3"></i>
								</span>

								<template #dropdown>
									<el-dropdown-menu v-if="getRolId === 'supplier_admin' || getRolId === 'supplier_user'">
										<el-dropdown-item @click="handleView(scope.row)">
											<i class="fa-regular fa-fw fa-eye"></i>
											{{ $t("labels.view") }}
										</el-dropdown-item>
									</el-dropdown-menu>
									<el-dropdown-menu v-else>
										<el-dropdown-item @click="handleView(scope.row)">
											<i class="fa-regular fa-fw fa-eye"></i>
											{{ $t("labels.view") }}
										</el-dropdown-item>

										<el-dropdown-item
											v-if="scope.row.status !== 4 && scope.row.status !== 5 && scope.row.status !== 6 && editIcon"
											@click="handleEdit(scope.row)"
										>
											<i class="fa-regular fa-fw fa-pen-to-square"></i>
											{{ $t("labels.edit") }}
										</el-dropdown-item>
										<el-dropdown-item
											v-if="scope.row.status !== 4 && scope.row.status !== 5 && scope.row.status !== 6 && editIcon"
											@click="handleEmailTrigger(scope.row)"
										>
											<i class="fa-regular fa-fw fa-paper-plane"></i>
											{{ $t("labels.email_trigger") }}
										</el-dropdown-item>
										<el-dropdown-item @click="handlePreviewDocument(scope.row)">
											<i class="fa-regular fa-fw fa-file"></i>
											{{ $t("labels.preview-document") }}
										</el-dropdown-item>
										<el-dropdown-item @click="handleCloneContract(scope.row)" v-if="addButton">
											<i class="fa-regular fa-fw fa-clone"></i>
											{{ $t("labels.clone") }}
										</el-dropdown-item>
									</el-dropdown-menu>
								</template>
							</el-dropdown>

							<!-- <el-tooltip
								v-if="preview"
								placement="left"
								:content="$t('labels.view')"
							>
								<el-icon
									class="text-dark/50 mr-2"
									:size="16"
									style="cursor: pointer"
									@click="handleView(scope.row)"
								>
									<i
										class="fa-regular fa-eye text-dark/50 hover:text-primary"
									></i>
								</el-icon>
							</el-tooltip>
							<el-tooltip
								v-if="editIcon"
								placement="left"
								:content="$t('labels.edit')"
							>
								<el-icon
									class="text-dark/50 mr-2"
									:size="16"
									style="cursor: pointer"
									@click="handleEdit(scope.row)"
								>
									<i
										class="fa-regular fa-pen-to-square text-dark/50 hover:text-primary"
									></i>
								</el-icon>
							</el-tooltip>
							<el-tooltip
								v-if="deleteBtn && getRolId === 'super_user'"
								placement="left"
								:content="$t('labels.delete')"
							>
								<el-icon
									class="text-dark/50 mr-2"
									:size="16"
									style="cursor: pointer"
									@click="handleDelete(scope.row)"
								>
									<i
										class="fa-regular fa-trash text-dark/50 hover:text-primary"
									></i>
								</el-icon>
							</el-tooltip>
							<el-tooltip
								v-if="emailBtn && scope.row.is_missing === '1'"
								placement="left"
								:content="$t('labels.email_trigger')"
							>
								<el-icon
									class="text-dark/50 mr-2"
									:size="16"
									style="cursor: pointer"
									@click="handleEmailTrigger(scope.row)"
								>
									<i
										class="fa-regular fa-paper-plane text-dark/50 hover:text-primary"
									></i>
								</el-icon>
							</el-tooltip>
							<el-tooltip
								v-if="previewDocument"
								placement="left"
								:content="$t('labels.preview-document')"
							>
								<el-icon
									class="text-dark/50 mr-2"
									:size="16"
									style="cursor: pointer"
									@click="handlePreviewDocument(scope.row)"
								>
									<i
										class="fa-regular fa-file text-dark/50 hover:text-primary"
									></i>
								</el-icon>
							</el-tooltip>
							<el-tooltip
								v-if="cloneContract"
								placement="left"
								:content="$t('labels.clone')"
							>
								<el-icon
									class="text-dark/50 mr-2"
									:size="16"
									style="cursor: pointer"
									@click="handleCloneContract(scope.row)"
								>
									<i
										class="fa-regular fa-clone text-dark/50 hover:text-primary"
									></i>
								</el-icon>
							</el-tooltip> -->
						</template>
					</el-table-column>
				</el-table>
			</div>

			<div v-else :style="{ height: `${tableHeight}px` }">
				<BaseGridTable
					:id="props.id"
					:edit-icon="editIcon"
					:table-data="tableData"
					@handle-view="handleView"
					@handle-edit="handleEdit"
					@handle-delete="handleDelete"
					@handle-email-trigger="handleEmailTrigger"
					@handle-archvied="handleArchived"
					@handle-retry="handleRetry"
					@handle-preview-document="handlePreviewDocument"
					@handle-clone="handleCloneContract"
					@handle-status-change="handleStatusChange"
				/>
			</div>
		</div>
		<div
			v-if="tableData?.length"
			:class="getFooterOpen ? 'translate-y-full' : 'translate-y-0 border-t border-t-gray-400'"
			class="bg-[#fff] left-0 bottom-0 px-4 py-3 flex flex-wrap justify-center xl:justify-between items-center lg:border-0 lg:static lg:translate-y-0 fixed w-full z-[3] transition-all"
		>
			<span
				v-if="!$device.isDesktop"
				class="absolute bottom-full left-5 bg-primary px-2 text-white rounded-t-lg lg:hidden"
				:class="$device.isDesktop ? 'd-none' : ''"
				@click="toggleFooter"
				><i class="fa-regular fa-chevron-down"></i
			></span>
			<p class="text-dark/50 lg:hidden xl:block">Showing {{ from }} to {{ to }} of {{ total }} entries</p>
			<el-pagination
				class="text-center"
				background
				:current-page="filterObject.currentPage"
				:page-sizes="[10, 25, 50, 100]"
				layout="total, sizes, prev, pager, next"
				:total="total"
				:page-size="filterObject.perPage"
				:default-current-page="filterObject.currentPage"
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
			/>
		</div>
	</div>
	<BaseDialog
		v-if="dialogVisible === true"
		:dialog-visible="dialogVisible"
		:dialog-api="handleValidation"
		:message-content="validationMsgContent"
		header="Alert"
		@dialog-ok-click="dialogOkClick"
	/>
</template>
