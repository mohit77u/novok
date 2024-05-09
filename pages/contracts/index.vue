<script setup lang="ts">
	import moment from "moment";
	import { sidebarItemClear } from "../../helper/sidebarItemClear";
	import { contractStore } from "~/store/contract";
	import { ContractStatusData, FormContractStatusActiveData } from "~/helper/data";

	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});

	useHead({
		title: "Contracts",
	});

	const localePath = useLocalePath();
	const route = useRoute();
	const tableData = ref<any>([]);
	const total = ref<any>(0);

	// const currentPage = ref<any>(1);
	// const perPage = ref<any>(10);
	// const searchValue = ref<any>("");
	// const sortOrder = ref<any>("");
	// const sortColumn = ref<any>("");
	// const formDetails = ref<any>("");
	const fullscreenLoading = ref(false);
	// const id = ref<any>(0);
	const { t } = useI18n();
	const store = contractStore();
	const dialogVisible = ref(false);
	const deleteItemId = ref(0);
	const dialogStatusVisible = ref(false);
	const contractStatusId = ref(1);
	const statusChangeRowId = ref(0);
	const contractNumber = ref("");
	const dialogVisiblee = ref(false);
	const previewData = ref([]);
	const router = useRouter();

	const filteredData = reactive<any>({
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
		myContracts: 0,
		contractValueStartFrom: "",
		contractValueStartTo: "",
		noticeDueIntervals: "",
		expiringDays: "",
		signingEntity: "",
	});

	const formData = reactive<any>({
		status: 1,
		contract_start_date: "",
		contract_end_date: "",
		contract_foreclose_date: "",
		reason: "",
	});

	interface Item {
		contract_start_date: string;
		contract_end_date: String;
		status: Number;
		contract_type: Number;
		currency_symbol: String;
		currency: String;
		contract_term_type: Number;
	}

	const formatterStartDate = (row: Item) => {
		return row.contract_start_date ? moment(`${row.contract_start_date}`).format("DD/MM/YYYY") : "-";
	};

	const formatterEndDate = (row: Item) => {
		return row.contract_end_date ? moment(`${row.contract_end_date}`).format("DD/MM/YYYY") : "-";
	};
	const formatterContractType = (row: Item) => {
		switch (row.contract_type) {
			case 1:
				return "Contract";
			case 2:
				return "NDA";
			case 3:
				return "SOW";
			case 4:
				return "Order From";
		}
	};
	const formatterCurrency = (row: Item) => {
		return row.currency_symbol + " " + row.currency;
	};
	const ContractTermTypeFormatter = (row: Item) => {
		return row.contract_term_type === 0 ? "Fixed" : row.contract_term_type === 1 ? "Auto-Renewed" : "-";
	};

	const tableColumn = ref([
		{
			columnName: "title",
			columnLabel: t("columnLabels.contract_title"),
			width: "160",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "sub_entity_name",
			columnLabel: t("columnLabels.signing_entity"),
			width: "190",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "supplier_name",
			columnLabel: t("columnLabels.supplier_name"),
			width: "160",
			customCellClass: "cellTruncate",
			sorting: true,
		},
		{
			columnName: "contract_owner",
			columnLabel: t("columnLabels.contract_owner"),
			width: "170",
			customCellClass: "cellTruncate",
			sorting: true,
		},

		{
			columnName: "contract_start_date",
			columnLabel: t("columnLabels.contract_start_date"),
			width: "190",
			sorting: true,
			formatter: formatterStartDate,
		},

		{
			columnName: "contract_end_date",
			columnLabel: t("columnLabels.contract_end_date"),
			width: "190",
			sorting: true,
			formatter: formatterEndDate,
		},
		{
			columnName: "contract_type",
			columnLabel: t("columnLabels.contract_type"),
			width: "150",
			sorting: true,
			formatter: formatterContractType,
		},
		{
			columnName: "currency",
			columnLabel: t("columnLabels.currency"),
			width: "120",
			sorting: true,
			formatter: formatterCurrency,
		},

		{
			columnName: "value_of_contract",
			columnLabel: t("columnLabels.value_of_contract"),
			width: "180",
			sorting: true,
		},
		{
			columnName: "category_level_1",
			columnLabel: t("columnLabels.category_level_1"),
			width: "180",
			sorting: true,
		},
		{
			columnName: "contract_term_type",
			columnLabel: t("columnLabels.contract_term_type"),
			width: "190",
			sorting: true,
			formatter: ContractTermTypeFormatter,
		},
	]);

	onMounted(async () => {
		await fetchContractListingData();
	});

	const fetchContractListingData = async () => {
		const pageDetails = JSON.parse(sessionStorage.getItem("pageDetails") || " {}");

		Object.keys(filteredData).forEach((field: any) => {
			filteredData[field] = pageDetails[field] || "";
			filteredData["contractValidation"] = pageDetails.contractValidation === "" ? "" : pageDetails.contractValidation;
		});

		await getContractLisitngData(filteredData);
	};

	const getContractLisitngData = async (data: any) => {
		try {
			fullscreenLoading.value = true;
			data.searchValue = encodeURIComponent(filteredData.searchValue);

			const res: any = await useApiFetch(
				`/contracts?page=${data.currentPage}&perPage=${data.perPage}&searchValue=${data.searchValue}&sortOrder=${data.sortOrder}&sortColumn=${data.sortColumn}&formDetails=${data.formDetails}&id=${data.id}&contractStartDate=${data.contractStartDate}&contractEndDate=${data.contractEndDate}&contractOwner=${data.contractOwner}&supplierLead=${data.supplierLead}&contractStatus=${data.contractStatus}&currency=${data.currency}&contractType=${data.contractType}&category=${data.category}&contractValidation=${data.contractValidation}&contractTermType=${data.contractTermType}&myContracts=${data.myContracts}&contractValueStartFrom=${data.contractValueStartFrom}&contractValueStartTo=${data.contractValueStartTo}&noticeDueIntervals=${data.noticeDueIntervals}&expiringDays=${data.expiringDays}&signingEntity=${data.signingEntity}`,
				{
					method: "GET",
				}
			);

			tableData.value = res.data?.data;
			total.value = res.data?.total;
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const handleEdit = (row: any) => {
		sessionStorage.setItem("ContractCreateClick", "0");
		store.setActiveTab("primary-details");
		sessionStorage.setItem("redirectFrom", "edit");
		navigateTo(
			localePath({
				path: `/contracts/edit-contract/${row.id}`,
			})
		);
	};

	const dialogOkClick = (value: any) => {
		dialogVisible.value = value;
	};

	const handleDelete = (row: any) => {
		deleteItemId.value = row.id;
		dialogVisible.value = true;
	};

	const deleteApi = async () => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch(`/contracts/${deleteItemId.value}`, {
				method: "DELETE",
			});

			useToast("success", res.message);
			dialogVisible.value = false;
			getContractLisitngData(filteredData);
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const handleStatusChange = (row: any) => {
		dialogStatusVisible.value = true;
		contractStatusId.value = row.status;
		statusChangeRowId.value = row.id;
		contractNumber.value = row.contract_number;
		formData.contract_start_date = row.contract_start_date;
		formData.contract_end_date = row.contract_end_date;
		formData.status = row.status;
		formData.reason = row.reason;
	};

	const dialogStatusOkClick = (value: any) => {
		dialogStatusVisible.value = value;
	};

	const statusDropdownOptions = computed(() => {
		switch (formData.status) {
			case 1:
				return [
					{
						label: "Draft",
						value: 1,
					},
					{
						label: "Pending",
						value: 2,
					},
					{
						label: "Active",
						value: 3,
					},
				];

			case 2:
				return [
					{
						label: "Pending",
						value: 2,
					},
					{
						label: "Active",
						value: 3,
					},
				];

			case 3:
				return [
					{
						label: "Active",
						value: 3,
					},
					{
						label: "Terminated",
						value: 5,
					},
					{
						label: "Breached",
						value: 6,
					},
				];

			default:
				break;
		}
	});

	// const getSelectedStatusData = computed(() => {
	// 	return ContractStatusData.find((status: any) => status.value === contractStatusId.value);
	// });

	const getSelectedStatusData = computed(() => {
		return formData;
	});

	const StatusSelectedValue = (value: any) => {
		Object.keys(formData).forEach((field: any) => {
			formData[field] = value[field];
		});
	};

	const statusChangeApi = async () => {
		try {
			dialogStatusVisible.value = false;
			fullscreenLoading.value = true;

			const res: any = await useApiFetch(`/contracts/change/status/${statusChangeRowId.value}`, {
				method: "PATCH",
				body: formData,
			});

			useToast("success", res.message);
			fetchContractListingData();
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const handleEmailTrigger = async (row: any) => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch("/contracts/missing-fields/reminder-email", {
				method: "POST",
				body: { id: row.id },
			});

			useToast("success", res.message);
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const handleView = (row: any) => {
		navigateTo(
			localePath({
				path: `/contracts/view-contract/${row.id}`,
				query: { page: "view" },
			})
		);
	};

	const dialogClick = (value: any) => {
		dialogVisiblee.value = value;
	};

	const handlePreviewDocument = (row: any) => {
		previewDocument(row.id);
		dialogVisiblee.value = true;
	};

	const handleCloneContract = async (row: any) => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch("/contracts/clone", {
				method: "POST",
				body: { contract_id: row.id },
			});

			router.push(localePath(`/contracts/edit-contract/${res.data?.contract_id}`));
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const previewDocument = async (id: any) => {
		try {
			const res: any = await useApiFetch(`/contracts/${id}/preview-documents`, {
				method: "GET",
			});

			previewData.value = res.data;
		} catch {}
	};

	const contractExport = async (data: any) => {
		fullscreenLoading.value = true;
		try {
			const res: any = await useApiFetch(`/contracts/export`, {
				method: "POST",
				body: data,
			});
			useToast("success", res.message);
			fullscreenLoading.value = false;
			var a = document.createElement("a");
			a.href = res.data?.export_link;
			a.download = "Contract.csv";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		} catch {
			fullscreenLoading.value = false;
		}
	};
</script>
<template>
	<div class="h-full overflow-hidden" v-loading="fullscreenLoading">
		<BaseContractDataTable
			id="contract"
			:table-data="tableData"
			:table-column="tableColumn"
			:total="total"
			:edit-icon="hasPermissionTo('contracts-edit')"
			:stripe="true"
			:email-btn="true"
			:delete-btn="false"
			:status-btn="hasPermissionTo('contracts-edit')"
			:preview="true"
			:preview-document="true"
			:clone-contract="hasPermissionTo('contracts-create')"
			:add-button="hasPermissionTo('contracts-create')"
			:name="$t('buttons.contract')"
			@handale-current-change="getContractLisitngData"
			@handale-size-change="getContractLisitngData"
			@handale-sort-change="getContractLisitngData"
			@handle-edit="handleEdit"
			@handle-delete="handleDelete"
			@search-value="getContractLisitngData"
			@filter-data-type="getContractLisitngData"
			@search-id="getContractLisitngData"
			@handle-email-trigger="handleEmailTrigger"
			@handle-view="handleView"
			@handle-status-change="handleStatusChange"
			@handle-preview-document="handlePreviewDocument"
			@handle-clone-contract="handleCloneContract"
			@handle-my-contract="getContractLisitngData"
			@handle-validation="getContractLisitngData"
			@export-data="contractExport"
		/>
		<BaseDeleteModal v-if="dialogVisible === true" :dialog-visible="dialogVisible" :delete-api="deleteApi" @dialog-ok-click="dialogOkClick" />
		<BaseContractStatusModal
			v-if="dialogStatusVisible === true"
			:dialog-status-visible="dialogStatusVisible"
			:status-api="statusChangeApi"
			:dropdown-option="statusDropdownOptions"
			:selected-status-data="getSelectedStatusData"
			:contract-number="contractNumber"
			@dialog-ok-click="dialogStatusOkClick"
			@selected-value="StatusSelectedValue"
		/>
	</div>
	<BaseDocumentModal
		v-if="dialogVisiblee === true"
		:dialog-visible="dialogVisiblee"
		:message-content="messageContent"
		:preview-data="previewData"
		@dialog-ok-click="dialogClick"
	/>
</template>
