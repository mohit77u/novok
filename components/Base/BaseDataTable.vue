<!-- eslint-disable vue/require-default-prop -->
<!-- eslint-disable vue/require-valid-default-prop -->
<script setup lang="ts">
	import { Search, ArrowDown } from "@element-plus/icons-vue";
	import moment from "moment";
	import { mobileSidebar } from "~/store/mobileSidebar";
	import { sidebarItemStore } from "~/store/sidebarItem";
	import { useAuthStore } from "~/store/auth";
	import { commaThreeDigitFormat } from "~/helper/common";

	const props = defineProps({
		tableData: {
			type: Array,
			// eslint-disable-next-line vue/require-valid-default-prop
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
		status: {
			type: Boolean,
			default: false,
		},
		editIcon: {
			type: Boolean,
			default: false,
		},
		previewBtn: {
			type: Boolean,
			default: true,
		},
		supplierStatus: {
			type: Boolean,
			default: false,
		},
		isRequestStatus: {
			type: Boolean,
			default: false,
		},
		projectStatus: {
			type: Boolean,
			default: false,
		},
		// searchValue: {
		//   type: String,
		//   default: "",
		// },
		tableRowClassName: Function,
		stripe: {
			type: Boolean,
			default: true,
		},
		addButton: {
			type: Boolean,
			default: true,
		},
		name: {
			type: String,
			default: "",
		},
		id: {
			type: String,
			default: "",
		},
		clientUserIcon: {
			type: Boolean,
			default: false,
		},
		cancelButton: {
			type: Boolean,
			default: false,
		},
		deleteBtn: {
			type: Boolean,
			default: false,
		},
		imageColumn: {
			type: Boolean,
			default: false,
		},
		exportBtn: {
			type: Boolean,
			default: false,
		},
		filterOption: {
			type: Boolean,
			default: false,
		},
		clientUserFilter: {
			type: Boolean,
			default: false,
		},
		supplierFilter: {
			type: Boolean,
			default: false,
		},
		archivedBtn: {
			type: Boolean,
			default: false,
		},
		supplierUserIcon: {
			type: Boolean,
			default: false,
		},
		clientAdminRetry: {
			type: Boolean,
			default: false,
		},
		clientAdminAccess: {
			type: Boolean,
			default: false,
		},
		isBulkUpload: {
			type: Boolean,
			default: false,
		},
		isActionColumn: {
			type: Boolean,
			default: true,
		},
		isSupplierInviteEmail: {
			type: Boolean,
			default: false,
		},
		isActionColumnNotDropdown: {
			type: Boolean,
			default: false,
		},
		gridView: {
			type: Boolean,
			default: true,
		},
		userRoleColumn: {
			type: Boolean,
			default: false,
		},
		projectCodeColumn: {
			type: Boolean,
			default: false,
		},
		isTableOnly: {
			type: Boolean,
			default: false,
		},
		isLoding: {
			type: Boolean,
			default: false,
		},
		clientAdminRequestApproved: {
			type: Boolean,
			default: false,
		},
		tableTopOffset: {
			type: Number,
			default: 0,
		},
		isQtStatus: {
			type: Boolean,
			default: false,
		},
		qtResourceData: {
			type: Array,
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
		"handle-view-client-user",
		"export-data",
		"filtered-data",
		"handle-archvied",
		"handle-supplier-user",
		"handle-client-admin-retry",
		"handle-client-admin-access",
		"bulk-upload-suppliers",
		"supplier-filtered-data",
		"request-filtered-data",
		"reset-filter",
		"supplier-status",
		"selection-status",
		"signing-status",
		"supervision-status",
		"handle-client-admin-request-approved",
		"user-filtered-data",
		"project-filtered-data",
		"qt-reject-status",
		"qt-approve-status",
		"qt-filtered-data",
		"handle-client-admin-subscription-renewal",
		"notifyClientAdmin",
	]);
	const route = useRoute();
	const currentPage = ref<any>(1);
	const perPage = ref<any>(10);
	const searchValue = ref<any>("");
	const sortOrder = ref<any>("");
	const sortColumn = ref<any>("");
	const debounceId = ref<any>(null);
	const defaultSort = ref<any>({});
	const fromDate = ref<any>("");
	const toDate = ref<any>("");
	const isArchived = ref<any>(0);
	const currency = ref("");
	const category = ref("");
	const country = ref("");
	const status = ref("");
	const keySupplier = ref("");
	const requestType = ref("");
	const requestStatus = ref("");
	const signingEntity = ref("");
	const accessRole = ref("");
	const projectFilterStatus = ref("");
	const resetFilter = ref(false);
	const visible = ref(false);
	const rowId = ref("");
	const { t } = useI18n();
	const store = mobileSidebar();
	const tableHeight = ref<any>(null);
	const sidebarStore = sidebarItemStore();
	const localePath = useLocalePath();
	const authStore = useAuthStore();
	const displayView = ref<any>("table");
	const dialogVisible = ref(false);

	const resizableData = ref<any>({});
	// const isProjectOwner = ref(false);
	const columnVisibility = ref<any>({});
	const filteredColumns = ref<any>([]);
	const selectedColumns = ref<any>([]);
	const allTableColumns = ref<any>([]);
	const isTableLoading = ref(false);
	const dialogVisibleSupplierUnapprovedModal = ref(false);
	const dialogVisibleQTRejectModal = ref(false);
	const dialogVisibleQTApproveModal = ref(false);
	const isNotifyQTUser = ref(0);
	const dialogVisibleQTApproveM = ref(false);

	onMounted(() => {
		const element: any = document.getElementById("table");
		const rect = element.getBoundingClientRect();
		tableHeight.value = window.innerHeight - rect.top - 90;

		currentPage.value = route.query.page ? +route.query.page : 1;
		perPage.value = route.query.perPage ? +route.query.perPage : 10;
		searchValue.value = route.query.searchValue ? route.query.searchValue : "";
		sortOrder.value = route.query.sortOrder ? route.query.sortOrder : "";
		sortColumn.value = route.query.sortOrder ? route.query.sortColumn : "";
		defaultSort.value = {
			prop: sortColumn.value,
			order: sortOrder.value === "desc" ? "descending" : "ascending",
		};
		fromDate.value = route.query.fromDate ? route.query.fromDate : "";
		toDate.value = route.query.toDate ? route.query.toDate : "";
		isArchived.value = route.query.isArchived ? route.query.isArchived : 0;
		currency.value = route.query.currency ? route.query.currency : "";
		category.value = route.query.category ? route.query.category : "";
		country.value = route.query.country ? route.query.country : "";
		status.value = route.query.status ? route.query.status : "";
		keySupplier.value = route.query.key_supplier ? route.query.key_supplier : "";
		requestType.value = route.query.requestType ? route.query.requestType : "";
		requestStatus.value = route.query.requestStatus ? route.query.requestStatus : "";
		accessRole.value = route.query.accessRole ? route.query.accessRole : "";
		projectFilterStatus.value = route.query.projectStatus ? route.query.projectStatus : "";
		signingEntity.value = route.query.signingEntity ? route.query.signingEntity : "";

		displayView.value = props.isTableOnly ? "table" : sessionStorage.getItem("displayView") ?? "table";

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
		if (props.imageColumn) {
			if (!filterTableData[props.id]) {
				columnVisibility.value["company_logo"] = true;
			}
			if (!selectedColumnsData[props.id]) {
				selectedColumns.value.push("company_logo");
			}
			allTableColumns.value.push({
				columnName: "company_logo",
				columnLabel: t("columnLabels.company_logo"),
			});
		}
		if (props.projectCodeColumn) {
			if (!filterTableData[props.id]) {
				columnVisibility.value["project_number"] = true;
			}
			if (!selectedColumnsData[props.id]) {
				selectedColumns.value.push("project_number");
			}
			allTableColumns.value.push({
				columnName: "project_number",
				columnLabel: t("columnLabels.project_number"),
			});
		}

		if (props.id === "request") {
			if (!filterTableData[props.id]) {
				columnVisibility.value["request_number"] = true;
			}
			if (!selectedColumnsData[props.id]) {
				selectedColumns.value.push("request_number");
			}
			allTableColumns.value.push({
				columnName: "request_number",
				columnLabel: t("columnLabels.request_number"),
			});
		}

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
		if (props.projectStatus) {
			if (!filterTableData[props.id]) {
				columnVisibility.value["budget"] = true;
			}
			if (!selectedColumnsData[props.id]) {
				selectedColumns.value.push("budget");
			}
			allTableColumns.value.push({
				columnName: "budget",
				columnLabel: t("columnLabels.budget"),
			});
		}

		if (props.isRequestStatus || props.projectStatus) {
			if (!filterTableData[props.id]) {
				columnVisibility.value[props.id + "_" + "status"] = true;
			}
			if (!selectedColumnsData[props.id]) {
				selectedColumns.value.push(props.id + "_" + "status");
			}
			allTableColumns.value.push({
				columnName: props.id + "_" + "status",
				columnLabel: t("columnLabels.Status"),
			});
		}

		if (props.projectStatus) {
			if (!filterTableData[props.id]) {
				columnVisibility.value[props.id + "_" + "approval_authority_status"] = true;
			}
			if (!selectedColumnsData[props.id]) {
				selectedColumns.value.push(props.id + "_" + "approval_authority_status");
			}
			allTableColumns.value.push({
				columnName: props.id + "_" + "approval_authority_status",
				columnLabel: t("columnLabels.approval_authority_status"),
			});
		}

		if (props.status) {
			if (!filterTableData[props.id]) {
				columnVisibility.value["account_status"] = true;
			}
			if (!selectedColumnsData[props.id]) {
				selectedColumns.value.push("account_status");
			}
			allTableColumns.value.push({
				columnName: "account_status",
				columnLabel: t("columnLabels.status"),
			});
		}

		if (props.supplierStatus) {
			if (!filterTableData[props.id]) {
				columnVisibility.value[props.id + "_" + "account_status"] = true;
			}
			if (!selectedColumnsData[props.id]) {
				selectedColumns.value.push(props.id + "_" + "account_status");
			}
			allTableColumns.value.push({
				columnName: props.id + "_" + "account_status",
				columnLabel: t("columnLabels.Status"),
			});
		}

		if (props.isQtStatus) {
			if (!filterTableData[props.id]) {
				columnVisibility.value[props.id + "_" + "tender_status"] = true;
			}
			if (!selectedColumnsData[props.id]) {
				selectedColumns.value.push(props.id + "_" + "tender_status");
			}
			allTableColumns.value.push({
				columnName: props.id + "_" + "tender_status",
				columnLabel: t("columnLabels.Status"),
			});
		}

		filteredColumns.value = props.tableColumn;
	});

	watch(
		() => props.isLoding,
		(value) => {
			isTableLoading.value = value;
		},
		{
			deep: true,
			immediate: true,
		}
	);

	watch(
		() => props.tableTopOffset,
		(value) => {
			const element: any = document.getElementById("table");
			if (element) {
				const rect = element.getBoundingClientRect();
				tableHeight.value = window.innerHeight - props.tableTopOffset;
			}
		},
		{
			deep: true,
			immediate: true,
		}
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
		return perPage.value * (currentPage.value - 1) || 1;
	});

	const to = computed(() => {
		// 2-10*1 = -8
		const highBound = props.total - perPage.value * currentPage.value;

		if (highBound > 0) {
			return perPage.value * currentPage.value;
		} else {
			return props.total;
		}
	});

	const getFooterOpen = computed(() => {
		return store.getFooterOpen;
	});

	const handleCurrentChange = (val: any) => {
		currentPage.value = val;
		emit(
			"handale-current-change",
			val,
			perPage.value,
			searchValue.value,
			sortOrder.value,
			sortColumn.value,
			fromDate.value,
			toDate.value,
			isArchived.value,
			currency.value,
			category.value,
			country.value,
			status.value,
			keySupplier.value,
			requestType.value,
			requestStatus.value,
			accessRole.value,
			projectFilterStatus.value,
			signingEntity.value
		);
	};

	const handleSizeChange = (val: any) => {
		perPage.value = val;
		currentPage.value = 1;
		emit(
			"handale-size-change",
			currentPage.value,
			val,
			searchValue.value,
			sortOrder.value,
			sortColumn.value,
			fromDate.value,
			toDate.value,
			isArchived.value,
			currency.value,
			category.value,
			country.value,
			status.value,
			keySupplier.value,
			requestType.value,
			requestStatus.value,
			accessRole.value,
			projectFilterStatus.value,
			signingEntity.value
		);
	};

	const handleSortChange = (val: any) => {
		// currentPage.value = 1;
		const orderType = val.order === "descending" ? "desc" : val.order === "ascending" ? "asc" : "";
		const columnType = val.order ? val.prop : "";
		sortColumn.value = columnType;
		sortOrder.value = orderType;
		emit(
			"handale-sort-change",
			currentPage.value,
			perPage.value,
			searchValue.value,
			orderType,
			columnType,
			fromDate.value,
			toDate.value,
			isArchived.value,
			currency.value,
			category.value,
			country.value,
			status.value,
			keySupplier.value,
			requestType.value,
			requestStatus.value,
			accessRole.value,
			projectFilterStatus.value,
			signingEntity.value
		);
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

	const handleEdit = (row: any) => {
		emit("handle-edit", row);
	};

	const handleView = (row: any) => {
		emit("handle-view", row);
	};
	const handleDelete = (row: any) => {
		emit("handle-delete", row);
	};

	const handleArchived = (row: any) => {
		emit("handle-archvied", row);
	};

	const handleSupplierUser = (row: any) => {
		emit("handle-supplier-user", row);
	};

	const handleClientAdminRetry = (row: any) => {
		emit("handle-client-admin-retry", row);
	};

	const handleClientAdminAccess = (row: any) => {
		emit("handle-client-admin-access", row);
	};

	const handleClientAdminRequestApproved = (row: any) => {
		emit("handle-client-admin-request-approved", row);
	};

	const supplierStatusClick = (row: any, value: any) => {
		emit("supplier-status", row.id, value, "");
	};

	const QTStatusClick = async (row: any, value: any) => {
		rowId.value = row.id;
		isNotifyQTUser.value = row.notify_project_owner;

		if (value === "1" && row.open_date_time_passed) {
			dialogVisibleQTApproveModal.value = true;
		} else if (value === "2") {
			dialogVisibleQTRejectModal.value = true;
		} else {
			dialogVisibleQTApproveM.value = true;
			// emit("qt-approve-status", row.id, "1", "");
		}
	};

	const supplierStatusAnapprovedClick = (row: any, value: any) => {
		rowId.value = row.id;
		dialogVisibleSupplierUnapprovedModal.value = true;
		// emit("supplier-status", row, value);
	};

	const SupplierUnapprovedData = (Id: any, value: any, formData: any) => {
		if (Id) {
			emit("supplier-status", Id, "2", formData);
		} else {
			emit("supplier-status", rowId.value, "2", formData);
		}
	};

	const QTrejectStatusData = (Id: any, formData: any) => {
		if (Id) {
			emit("qt-reject-status", Id, "2", formData);
		} else {
			emit("qt-reject-status", rowId.value, "2", formData);
		}
	};

	const QTApproveStatusData = (Id: any) => {
		if (Id) {
			emit("qt-approve-status", Id, "1", "");
		} else {
			emit("qt-approve-status", rowId.value, "1", "");
		}
	};

	const clickAdd = () => {
		const clientAdminId = sessionStorage.getItem("client_admin_id") || "";
		const supplierAdminId = route.query?.supplier_admin_id ? route.query?.supplier_admin_id : null;

		if (props.id === "super_user") {
			navigateTo(localePath("/super-admin/add-super-user"));
		} else if (props.id === "client_admin") {
			navigateTo(localePath("/client-admins/add-client-admin"));
		} else if (props.id === "client_manager") {
			navigateTo(localePath("/client-managers/add-client-manager"));
		} else if (props.id === "client_user") {
			navigateTo(localePath(`/client-users/add-client-user/${clientAdminId}`));
		} else if (props.id === "supplier") {
			navigateTo(localePath("/supplier-admins/add-supplier-admin"));
		} else if (props.id === "supplier_user") {
			navigateTo(localePath(`/supplier-users/add-supplier-user/${supplierAdminId}`));
		} else if (props.id === "request") {
			navigateTo(localePath("/project-pipeline/requests/add-request"));
		} else if (props.id === "roles") {
			navigateTo(localePath("/roles-permissions/add-role"));
		} else if (props.id === "custom_field") {
			navigateTo(localePath("/settings/custom-fields/create"));
		} else if (props.id === "signing_entity") {
			navigateTo(localePath("/signing-entity/add-signing-entity"));
		} else if (props.id === "quotation_tender") {
			if (props.qtResourceData?.length) {
				navigateTo(localePath("/quotations-tender/q-t/add-quotations-tender"));
			} else {
				useToast("error", "Please Add Resource Document For Q&T");
			}
		} else {
			navigateTo(localePath("/contracts/add-contract"));
		}
	};

	const debounce = (value: any) => {
		if (debounceId.value) {
			clearTimeout(debounceId.value);
			debounceId.value = null;
		}
		debounceId.value = setTimeout(() => {
			currentPage.value = 1;

			const format = "DD/MM/YYYY";
			if (moment(value, format, true).isValid()) {
				searchValue.value = moment(value, "DD/MM/YYYY").format("YYYY-MM-DD");
			}
			emit(
				"search-value",
				currentPage.value,
				perPage.value,
				searchValue.value,
				sortOrder.value,
				sortColumn.value,
				fromDate.value,
				toDate.value,
				isArchived.value,
				currency.value,
				category.value,
				country.value,
				status.value,
				keySupplier.value,
				requestType.value,
				requestStatus.value,
				accessRole.value,
				projectFilterStatus.value,
				signingEntity.value
			);
		}, 500);
	};

	const toggleFooter = () => {
		store.setFooterOpen();
	};

	const cancelClick = () => {
		// if (props.id === "client_user") {
		//   sidebarStore.setActiveSidebarItem("6"); // 6-> client admins
		//   sidebarStore.setSidebarItem("6");
		if (props.id === "supplier_user") {
			sidebarStore.setActiveSidebarItem("9"); // 9-> supplier
			sidebarStore.setSidebarItem("9");
		}

		const url = props.id === "supplier_user" ? "supplier-admins" : "";
		const pageDetails = JSON.parse(sessionStorage.getItem("pageDetails") || "{}");
		let queryUrl = `/${url}?page=${pageDetails?.page}&perPage=${pageDetails?.perPage}`;

		if (pageDetails?.searchValue) {
			queryUrl = queryUrl + `&searchValue=${pageDetails?.searchValue}`;
		}
		if (pageDetails?.sortOrder) {
			queryUrl = queryUrl + `&sortOrder=${pageDetails?.sortOrder}`;
		}
		if (pageDetails?.sortColumn) {
			queryUrl = queryUrl + `&sortColumn=${pageDetails?.sortColumn}`;
		}
		navigateTo(localePath(queryUrl));
	};

	const getRoleID = computed(() => {
		return authStore.getRoleId;
	});

	const exportData = () => {
		const filterData = {
			fromDate: fromDate.value,
			toDate: toDate.value,
		};
		emit("export-data", filterData);
	};

	const exportRequestData = () => {
		let newObj: any = {};

        const columns: any = [];

		Object.keys(columnVisibility.value).forEach((field: any) => {

            if(columnVisibility.value[field]) {
                if (field === "request_status") {
                    columns.push( {
                        status: t("columnLabels.Status"),
                    });
                } else if (field === "sub_entity_name") {
                    columns.push( {
                        signing_entity: t("columnLabels.signing_entity"),
                    });
                } else if (field === "requester_name") {
                    columns.push( {
                        requester_name: t("columnLabels.requestor"),
                    });
                } else {
                    columns.push( {
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
			requestType: requestType.value,
			status: requestStatus.value,
			searchValue: searchValue.value,
			sortOrder: sortOrder.value,
			sortColumn: sortColumn.value,
			signingEntity: signingEntity.value,
			column: newObj,
		};
		emit("export-data", exportData);
	};

	const exportProjectData = () => {
		let newObj: any = {};

		const columns: any = [];

		Object.keys(columnVisibility.value).forEach((field: any) => {

            if(columnVisibility.value[field]) {
                if (field === "project_status") {
                    columns.push( {
                        status: t("columnLabels.Status"),
                    });
                } else if (field === "project_owner_name") {
                    columns.push( {
                        project_owner: t("columnLabels.project_owner"),
                    });
                } else if (field === "project_code") {
                    columns.push( {
                        project_number: t("columnLabels.project_number"),
                    });
                } else if (field === "sub_entity_name") {
                    columns.push( {
                        signing_entity: t("columnLabels.signing_entity"),
                    });
                } else if (field === "requester_name") {
                    columns.push( {
                        requester_name: t("columnLabels.requestor"),
                    });
                } else if (field === "project_approval_authority_status") {
                    columns.push( {
                        approval_authority_status: t("columnLabels.approval_authority_status"),
                    });
                } else {
                    columns.push( {
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
			status: projectFilterStatus.value,
			searchValue: searchValue.value,
			sortOrder: sortOrder.value,
			sortColumn: sortColumn.value,
			signingEntity: signingEntity.value,
			column: newObj,
		};
		emit("export-data", exportData);
	};

	const exportSupplierData = () => {
		let newObj: any = {};

        const columns: any = [];

        Object.keys(columnVisibility.value).forEach((field: any) => {

            if(columnVisibility.value[field]) 
            {
                if (field === "mobile") {
                    columns.push( {
                        mobile: t("columnLabels.contact_number"),
                    });
                } else if (field === "sup_ref_number") {
                    columns.push( {
                        sup_ref_number: t("columnLabels.ref_number"),
                    });
                } else if (field === "supplier_account_status") {
                    columns.push( {
                        status: t("columnLabels.Status"),
                    });
                } else if (field === "full_name") {
                    columns.push( {
                        user_name: t("columnLabels.full_name"),
                    });
                } else if (field === "category") {
                    columns.push( {
                        category: t("columnLabels.category_level_1"),
                    });
                } else {
                    columns.push( {
                        [field]: t("columnLabels." + field),
                    });
                }
            }
		});

		columns.forEach((obj: any) => {
			const [key, value] = Object.entries(obj)[0];
			if (key != "company_logo") {
				newObj[key] = value;
			}
		});

		const exportData = {
			status: status.value,
			searchValue: searchValue.value,
			sortOrder: sortOrder.value,
			sortColumn: sortColumn.value,
			currency: currency.value,
			category: category.value,
			key_supplier: keySupplier.value,
			country: country.value,
			column: newObj,
		};
		emit("export-data", exportData);
	};

	const bulkUploadSuppliers = () => {
		emit("bulk-upload-suppliers");
	};

	const filteredData = (filterData: any) => {
		fromDate.value = filterData.fromDate;
		toDate.value = filterData.toDate;
		isArchived.value = filterData.isArchived;

		emit(
			"filtered-data",
			currentPage.value,
			perPage.value,
			searchValue.value,
			sortOrder.value,
			sortColumn.value,
			filterData.fromDate,
			filterData.toDate,
			filterData.isArchived,
			currency.value,
			category.value,
			country.value,
			status.value,
			keySupplier.value,
			requestType.value,
			requestStatus.value,
			accessRole.value,
			projectFilterStatus.value,
			signingEntity.value
		);
	};

	const supplierFilteredData = (data: any) => {
		currency.value = data.currency;
		category.value = data.category;
		country.value = data.country;
		status.value = data.status;
		keySupplier.value = data.key_supplier;
		currentPage.value = 1;
		perPage.value = 10;
		searchValue.value = "";
		emit(
			"supplier-filtered-data",
			currentPage.value,
			perPage.value,
			searchValue.value,
			sortOrder.value,
			sortColumn.value,
			fromDate.value,
			toDate.value,
			isArchived.value,
			data.currency,
			data.category,
			data.country,
			data.status,
			data.key_supplier,
			requestType.value,
			requestStatus.value,
			accessRole.value,
			projectFilterStatus.value,
			signingEntity.value
		);
	};

	const requestFilteredData = (data: any) => {
		currentPage.value = 1;
		perPage.value = 10;
		searchValue.value = "";
		requestType.value = data.requestType;
		requestStatus.value = data.status;
		signingEntity.value = data.signingEntity;

		emit(
			"request-filtered-data",
			currentPage.value,
			perPage.value,
			searchValue.value,
			sortOrder.value,
			sortColumn.value,
			fromDate.value,
			toDate.value,
			isArchived.value,
			currency.value,
			category.value,
			country.value,
			status.value,
			keySupplier.value,
			data.requestType,
			data.status,
			accessRole.value,
			projectFilterStatus.value,
			data.signingEntity
		);
	};

	const usersFilteredData = (data: any) => {
		currentPage.value = 1;
		perPage.value = 10;
		searchValue.value = "";
		accessRole.value = data.access_role_id;
		emit(
			"user-filtered-data",
			currentPage.value,
			perPage.value,
			searchValue.value,
			sortOrder.value,
			sortColumn.value,
			fromDate.value,
			toDate.value,
			isArchived.value,
			currency.value,
			category.value,
			country.value,
			status.value,
			keySupplier.value,
			requestType.value,
			requestStatus.value,
			data.access_role_id,
			projectFilterStatus.value,
			signingEntity.value
		);
	};

	const projectFilteredData = (data: any) => {
		currentPage.value = 1;
		perPage.value = 10;
		searchValue.value = "";
		projectFilterStatus.value = data.status;
		signingEntity.value = data.signingEntity;
		emit(
			"project-filtered-data",
			currentPage.value,
			perPage.value,
			searchValue.value,
			sortOrder.value,
			sortColumn.value,
			fromDate.value,
			toDate.value,
			isArchived.value,
			currency.value,
			category.value,
			country.value,
			status.value,
			keySupplier.value,
			requestType.value,
			requestStatus.value,
			accessRole.value,
			projectFilterStatus.value,
			data.signingEntity
		);
	};

	const qtFilteredData = (data: any) => {
		currentPage.value = 1;
		perPage.value = 10;
		searchValue.value = "";
		signingEntity.value = data.signingEntity;
		emit(
			"qt-filtered-data",
			currentPage.value,
			perPage.value,
			searchValue.value,
			sortOrder.value,
			sortColumn.value,
			fromDate.value,
			toDate.value,
			isArchived.value,
			currency.value,
			category.value,
			country.value,
			status.value,
			keySupplier.value,
			requestType.value,
			requestStatus.value,
			accessRole.value,
			data.status,
			signingEntity.value
		);
	};

	const displayViewClick = () => {
		if (props.id != "roles") {
			displayView.value = displayView.value === "table" ? "grid" : "table";
			sessionStorage.setItem("displayView", displayView.value);
		}
	};

	const getStatusText = (microserviceStatus: number) => {
		switch (microserviceStatus) {
			case 0:
				return "Not Started";
			case 1:
				return "In Progress";
			case 2:
				return "Success";
			case 3:
				return "Failed";
		}
	};

	const resetAllFilters = () => {
		currentPage.value = 1;
		perPage.value = 10;
		sortColumn.value = "";
		sortOrder.value = "";
		searchValue.value = "";
		fromDate.value = "";
		toDate.value = "";
		isArchived.value = 0;
		currency.value = "";
		category.value = "";
		country.value = "";
		status.value = "";
		keySupplier.value = "";
		requestType.value = "";
		requestStatus.value = "";
		signingEntity.value = "";
		emit(
			"reset-filter",
			currentPage.value,
			perPage.value,
			searchValue.value,
			sortOrder.value,
			sortColumn.value,
			fromDate.value,
			toDate.value,
			isArchived.value,
			currency.value,
			category.value,
			country.value,
			status.value,
			keySupplier.value,
			requestType.value,
			requestStatus.value,
			signingEntity.value
		);
		resetFilter.value = !resetFilter.value;
	};

	const dialogOkClick = (value: any) => {
		dialogVisible.value = value;
	};
	const click = () => {
		dialogVisible.value = true;
	};

	const dialogOkClickSupplierUnapprovedModal = (value: any) => {
		dialogVisibleSupplierUnapprovedModal.value = value;
	};

	const dialogOkClickQTRejectModal = (value: any) => {
		dialogVisibleQTRejectModal.value = value;
	};
	const dialogOkClickQTApproveModal = (value: any) => {
		dialogVisibleQTApproveModal.value = value;
	};

	const dialogOkClickQTApproveM = (value: any) => {
		dialogVisibleQTApproveM.value = value;
	};

	const isShowEdit = (row: any) => {
		if (props.id === "request") {
			return (
				(row.status !== 2 && props.editIcon && authStore.role_id === "client_admin") ||
				(row.status !== 2 && props.editIcon && row?.isCanChangeStatus && authStore.role_id !== "client_admin")
			);
		} else if (props.id === "project") {
			return row.is_project_owner && row.isCompleted !== "Completed" && props.editIcon;
		} else if (props.id === "quotation_tender") {
			return (row.tender_status === 0 && row.is_created_by_me) || (row.tender_status === 2 && row.is_created_by_me);
		} else if (props.id === "supplier_quotations_tender") {
			return row.tender_status === 3 && row.submission_status !== 2;
		} else {
			return props.editIcon;
		}
	};

	const isShowDeleteBtn = (row: any) => {
		if (props.id === "roles") {
			return props.deleteBtn && row.is_deletable === true;
		} else {
			return props.deleteBtn;
		}
	};

	const handleClientAdminSubscriptionRenewal = (row: any) => {
		emit("handle-client-admin-subscription-renewal", row);
	};

	const changeProjectStatus = (row: any) => {
		const activeTab = useCookie("activeTab");
		activeTab.value = row.active_tab;
		navigateTo(localePath(`/project-pipeline/projects/change-status/${row?.id}?tab=${row?.active_tab}`));
	};
</script>
<template>
	<div class="flex flex-col h-full w-full">
		<div class="flex-1 overflow-x-auto relative flex flex-col">
			<div class="flex flex-wrap justify-between gap-3 p-4">
				<div class="flex">
					<el-form-item class="withIcon tableSearch mb-0">
						<el-input
							v-model="searchValue"
							type="search"
							class="border-0 w-52"
							:placeholder="$t('placeholders.search')"
							:value="searchValue"
							@input="debounce"
						/>
						<div class="absolute leading-none right-0 top-1/2 -translate-y-1/2 text-gray-500 inputIcon">
							<i class="fa-regular fa-magnifying-glass"></i>
						</div>
					</el-form-item>
					<el-tooltip v-if="supplierFilter" placement="top" :content="$t('labels.reset')">
						<novok-button type="info" class="ml-4 btn-icon flex-none" @click="resetAllFilters">
							<i class="fa-regular fa-arrows-rotate"></i>
						</novok-button>
					</el-tooltip>
				</div>

				<div class="flex items-center flex-wrap gap-3">
					<div v-if="cancelButton">
						<el-tooltip placement="top" :content="$t('buttons.back')">
							<novok-button class="btn-dark" @click="cancelClick">
								{{ $t("buttons.back") }}
							</novok-button>
						</el-tooltip>
					</div>

					<!-- grid view -->
					<el-tooltip class="box-item" effect="dark" :content="$t('buttons.change_view')" placement="top">
						<novok-button v-if="gridView" type="info" class="btn-icon" @click="displayViewClick">
							<i v-if="displayView === 'table'" class="fa-regular fa-objects-column"></i>
							<i v-else class="fa-solid fa-list-ul"></i>
						</novok-button>
					</el-tooltip>

					<!-- contact us filter button -->
					<div v-if="filterOption">
						<BaseContactUsFilter @filter-data="filteredData" />
					</div>

					<!-- supplier filter -->
					<div v-if="supplierFilter">
						<BaseSupplierFilter :resetFilter="resetFilter" @filter-data="supplierFilteredData" />
					</div>

					<!-- request filter -->
					<div v-if="id === 'request'">
						<BaseRequestModuleFilter :resetFilter="resetFilter" @filter-data="requestFilteredData" />
					</div>

					<!-- request export -->
					<el-dropdown trigger="click" :hide-on-click="false" class="" v-if="id === 'request'">
						<div>
							<el-tooltip :content="$t('buttons.export_csv')" placement="top">
								<novok-button type="info" class="btn-icon relative m-0 flex-none">
									<i class="fa-solid fa-download"></i>
								</novok-button>
							</el-tooltip>
						</div>
						<template #dropdown>
							<el-dropdown-menu class="max-h-[200px] overflow-y-auto">
								<el-dropdown-item>
									<el-tooltip :content="$t('buttons.export_csv')" placement="left">
										<span @click="exportRequestData">{{ $t("buttons.export") }}</span>
									</el-tooltip>
								</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>

					<!-- client user filter -->
					<div v-if="id === 'client_user'">
						<BaseClientUserFilter :resetFilter="resetFilter" @filter-data="usersFilteredData" />
					</div>

					<!-- project filter -->
					<div v-if="id === 'project'">
						<BaseProjectFilter :resetFilter="resetFilter" @filter-data="projectFilteredData" />
					</div>

					<!-- project export -->
					<el-dropdown trigger="click" :hide-on-click="false" class="" v-if="id === 'project'">
						<div>
							<el-tooltip :content="$t('buttons.export_csv')" placement="top">
								<novok-button type="info" class="btn-icon relative m-0 flex-none">
									<i class="fa-solid fa-download"></i>
								</novok-button>
							</el-tooltip>
						</div>
						<template #dropdown>
							<el-dropdown-menu class="max-h-[200px] overflow-y-auto">
								<el-dropdown-item>
									<el-tooltip :content="$t('buttons.export_csv')" placement="left">
										<span @click="exportProjectData">{{ $t("buttons.export") }}</span>
									</el-tooltip>
								</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>

					<!-- qt filter -->
					<div v-if="id === 'quotation_tender'">
						<QuotationsTenderFilter :resetFilter="resetFilter" @filter-data="qtFilteredData" />
					</div>

					<!-- export btn -->
					<div v-if="exportBtn">
						<el-tooltip :content="$t('buttons.export_csv')" placement="top">
							<novok-button type="info" :disabled="!tableData?.length" @click="exportData">
								<i class="fa-solid fa-download mr-3"></i>
								{{ $t("buttons.export") }}
							</novok-button>
						</el-tooltip>
					</div>

					<!-- invite by email -->
					<div v-if="isSupplierInviteEmail">
						<el-tooltip :content="$t('formLabels.supplier_invite_email')" placement="top">
							<novok-button class="btn-icon" type="info" @click="navigateTo(localePath('/supplier-admins/invite-email'))">
								<i class="fa-regular fa-envelope"></i>
							</novok-button>
						</el-tooltip>
					</div>

					<!-- supplier admin export -->
					<el-dropdown trigger="click" :hide-on-click="false" class="" v-if="id === 'supplier'">
						<div>
							<el-tooltip :content="$t('buttons.export_csv')" placement="top">
								<novok-button type="info" class="btn-icon relative m-0 flex-none">
									<i class="fa-solid fa-download"></i>
								</novok-button>
							</el-tooltip>
						</div>
						<template #dropdown>
							<el-dropdown-menu class="max-h-[200px] overflow-y-auto">
								<el-dropdown-item>
									<el-tooltip :content="$t('buttons.export_csv')" placement="left">
										<span @click="exportSupplierData">{{ $t("buttons.export") }}</span>
									</el-tooltip>
								</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>

					<!-- column filter -->
					<el-dropdown trigger="click" :hide-on-click="false" class="" v-if="allTableColumns.length > 0 && displayView === 'table'">
						<div>
							<el-tooltip class="box-item" effect="dark" :content="$t('buttons.filter_columns')" placement="top">
								<novok-button class="btn-icon" type="info">
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

					<!-- create button -->
					<div v-if="addButton">
						<el-tooltip class="box-item" effect="dark" :content="$t('buttons.create_new') + ' ' + name" placement="top">
							<novok-button @click="clickAdd" class="text-nowrap" type="info">
								{{ $t("buttons.create_new") }} {{ name }}
							</novok-button>
						</el-tooltip>
					</div>

					<div v-if="isBulkUpload">
						<el-tooltip :content="$t('buttons.bulk_upload')" placement="top">
							<novok-button type="info" @click="bulkUploadSuppliers">
								{{ $t("buttons.bulk_upload") }}
							</novok-button>
						</el-tooltip>
					</div>
				</div>
			</div>

			<base-loading :value="isTableLoading" />

			<div v-if="displayView === 'table'" class="px-4 flex-1">
				<el-table
					stripe
					v-loading="isTableLoading"
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
						v-if="imageColumn && columnVisibility['company_logo']"
						prop="company_logo"
						:label="$t('columnLabels.company_logo')"
						:min-width="resizableData[props.id + '_' + 'company_logo'] ?? '150'"
						:fixed="!isMobile ?? false"
					>
						<!-- header with tooltip -->
						<template #header="{ column }">
							<BaseColumnTooltip :column="column" />
						</template>

						<template #default="scope">
							<div class="h-12">
								<NuxtImg v-if="scope.row.company_logo" :src="`${scope.row.company_logo}`" class="h-12" alt="companyLogo" />
							</div>
						</template>
					</el-table-column>

					<el-table-column
						v-if="projectCodeColumn && columnVisibility['project_number']"
						prop="project_number"
						:label="$t('columnLabels.project_number')"
						fixed
						:min-width="resizableData[props.id + '_' + 'project_number'] ?? '150'"
						sortable="custom"
					>
						<!-- header with tooltip -->
						<template #header="{ column }">
							<BaseColumnTooltip :column="column" />
						</template>

						<template #default="scope">
							<el-link
								type="primary"
								class="cursor-pointer hover:text-primary"
								@click="navigateTo(localePath(`/project-pipeline/projects/view-project/${scope.row?.id}`))"
								>{{ scope.row.project_number }}</el-link
							>
						</template>
					</el-table-column>

					<el-table-column
						v-if="id === 'request' && columnVisibility['request_number']"
						prop="request_number"
						:label="$t('columnLabels.request_number')"
						fixed
						:min-width="resizableData[props.id + '_' + 'request_number'] ?? '150'"
						sortable="custom"
					>
						<!-- header with tooltip -->
						<template #header="{ column }">
							<BaseColumnTooltip :column="column" />
						</template>

						<template #default="scope">
							<el-link
								type="primary"
								class="cursor-pointer hover:text-primary"
								@click="navigateTo(localePath(`/project-pipeline/requests/view-request/${scope.row?.id}`))"
								>{{ scope.row.request_number }}</el-link
							>
						</template>
					</el-table-column>

					<template v-if="!isMobile && !imageColumn">
						<el-table-column
							v-for="(data, index) in filteredColumns.slice(0, 1)"
							:key="index"
							:prop="data.columnName"
							:label="data.columnLabel"
							:min-width="resizableData[props.id + '_' + data.columnName] ?? data.width"
							:formatter="data.formatter"
							class="ellipsis"
							:fixed="projectCodeColumn ? false : true"
							:class-name="data.customCellClass || ''"
							:sortable="data.sorting === true ? 'custom' : null"
						>
							<!-- header with tooltip -->
							<template #header="{ column }">
								<span class="header-label">
									<span class="flex items-center">
										{{ column.label }}
										<BaseLabel :tooltip-content="column.label" />
									</span>
								</span>
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
								<span class="header-label">
									<span class="flex items-center">
										{{ column.label }}
										<BaseLabel :tooltip-content="column.label" />
									</span>
								</span>
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
							:class-name="data.customCellClass || ''"
							:sortable="data.sorting === true ? 'custom' : null"
						>
							<!-- header with tooltip -->
							<template #header="{ column }">
								<span class="header-label">
									<span class="flex items-center">
										{{ column.label }}
										<BaseLabel :tooltip-content="column.label" />
									</span>
								</span>
							</template>
						</el-table-column>
					</template>

					<el-table-column
						v-if="projectStatus && columnVisibility['budget']"
						prop="budget"
						:label="$t('columnLabels.budget')"
						:min-width="resizableData[props.id + '_' + 'budget'] ?? '140'"
						sortable="custom"
					>
						<!-- header with tooltip -->
						<template #header="{ column }">
							<BaseColumnTooltip :column="column" />
						</template>

						<template #default="scope">
							<span class="budget">
								{{ scope.row?.budget_currency + " " + commaThreeDigitFormat(scope.row?.budget) }}
								<!-- {{CurrencySymbole[scope.row.budget_currency]}} -->
							</span>
						</template>
					</el-table-column>

					<el-table-column
						v-if="props.status && columnVisibility['account_status']"
						fixed="right"
						prop="account_status"
						:label="$t('columnLabels.status')"
						:min-width="resizableData['account_status'] ?? '150'"
						sortable="custom"
					>
						<!-- header with tooltip -->
						<template #header="{ column }">
							<BaseColumnTooltip :column="column" />
						</template>

						<template #default="scope">
							<el-tag
								class="w-[65px]"
								disable-transitions
								:class="
									scope.row.account_status === 1
										? 'bg-success/10 border border-success text-success text-bold'
										: 'bg-danger/10 border border-danger text-danger text-bold'
								"
							>
								{{ scope.row.account_status === 1 ? "Active" : "Inactive" }}
							</el-tag>
						</template>
					</el-table-column>

					<el-table-column
						v-if="isRequestStatus && columnVisibility[props.id + '_' + 'status']"
						fixed="right"
						prop="status"
						:label="$t('columnLabels.Status')"
						:min-width="resizableData[props.id + '_' + 'status'] ?? '150'"
						sortable="custom"
					>
						<!-- header with tooltip -->
						<template #header="{ column }">
							<BaseColumnTooltip :column="column" />
						</template>

						<template #default="scope">
							<el-tag
								class="w-[65px]"
								disable-transitions
								:class="
									scope.row.status === 1
										? 'bg-primary/10 border border-primary text-primary text-bold'
										: scope.row.status === 2
										? 'bg-success/10 border border-success text-success text-bold'
										: 'bg-danger/10 border border-danger text-danger text-bold'
								"
							>
								{{ scope.row.status === 1 ? "Awaited" : scope.row.status === 2 ? " Approved" : "Rejected" }}
							</el-tag>
						</template>
					</el-table-column>

					<!-- <el-table-column
						v-if="projectStatus && columnVisibility[props.id + '_' + 'status']"
						fixed="right"
						prop="status"
						:label="$t('columnLabels.Status')"
						:min-width="resizableData[props.id + '_' + 'status'] ?? '180'"
						sortable="custom"
					>
						<template #header="{ column }">
							<BaseColumnTooltip :column="column" />
						</template>

						<template #default="scope">
							<div class="flex items-center">
								<el-dropdown trigger="click" :disabled="scope.row.status === 5 || !scope.row.is_project_owner">
									<el-button
										class="default"
										size="small"
										:class="
											scope.row.status == 1
												? 'border border-[purple] hover:border-[purple] focus:border-[purple] bg-[purple]/10 hover:bg-[purple] focus:bg-[purple] text-[purple] hover:text-white focus:text-white'
												: scope.row.status == 2
												? 'border border-[green] hover:border-[green] focus:border-[green] bg-[green]/10 hover:bg-[green] focus:bg-[green] text-[green] hover:text-white focus:text-white'
												: scope.row.status == 3
												? 'border border-[orange] hover:border-[orange] focus:border-[orange] text-[orange] bg-[orange]/10 hover:bg-[orange] focus:bg-[orange] focus:text-white hover:text-white'
												: scope.row.status == 4
												? 'border border-[teal] hover:border-[teal] focus:border-[teal] text-[teal] bg-[teal]/10 hover:bg-[teal] focus:bg-[teal] focus:text-white hover:text-white'
												: scope.row.status == 5
												? 'border border-[red] hover:border-[red] focus:border-[red] text-[red] bg-[red]/10 hover:bg-[red] focus:bg-[red] focus:text-white hover:text-white'
												: ''
										"
									>
										<span>{{
											scope.row.status === 1
												? "Work in Progress"
												: scope.row.status === 2
												? "Sourcing"
												: scope.row.status === 3
												? "Selection"
												: scope.row.status === 4
												? "Signing"
												: scope.row.status === 5
												? "Supervision"
												: ""
										}}</span>
										<i v-if="scope.row.status !== 5 && scope.row.is_project_owner" class="fa-solid fa-angle-down ml-4"></i>
									</el-button>

									<template #dropdown>
										<el-dropdown-menu v-if="scope.row.status === 1">
											<el-dropdown-item @click="projectSourcingStatus(scope.row, '2')"
												><span class="text-[green]">{{ $t("dropdown_labels.sourcing") }}</span></el-dropdown-item
											>
										</el-dropdown-menu>

										<el-dropdown-menu v-else-if="scope.row.status === 2">
											<el-dropdown-item @click="projectSelectionStatus(scope.row, '3')"
												><span class="text-[orange]">{{ $t("dropdown_labels.selection") }}</span></el-dropdown-item
											>
										</el-dropdown-menu>

										<el-dropdown-menu v-else-if="scope.row.status === 3">
											<el-dropdown-item @click="projectSigningStatus(scope.row, '4')"
												><span class="text-[teal]">{{ $t("dropdown_labels.signing") }}</span></el-dropdown-item
											>
										</el-dropdown-menu>

										<el-dropdown-menu v-else-if="scope.row.status === 4">
											<el-dropdown-item @click="projectSupervisionStatus(scope.row, '5')"
												><span class="text-[red]">{{ $t("dropdown_labels.supervision") }}</span></el-dropdown-item
											>
										</el-dropdown-menu>
									</template>
								</el-dropdown>
							</div>
						</template>
					</el-table-column> -->

					<el-table-column
						v-if="projectStatus && columnVisibility[props.id + '_' + 'status']"
						fixed="right"
						prop="status"
						:label="$t('columnLabels.Status')"
						:min-width="resizableData[props.id + '_' + 'status'] ?? '170'"
						sortable="custom"
					>
						<!-- header with tooltip -->
						<template #header="{ column }">
							<BaseColumnTooltip :column="column" />
						</template>

						<template #default="scope">
							<el-tag
								class="w-[95px]"
								disable-transitions
								:class="
									scope.row.status == 1
										? 'border border-newProject hover:border-newProject focus:border-newProject bg-newProject/10 hover:bg-newProject focus:bg-newProject text-newProject hover:text-white focus:text-white'
										: scope.row.status == 2
										? 'border border-onHold hover:border-onHold focus:border-onHold text-onHold bg-onHold/10 hover:bg-onHold focus:bg-onHold focus:text-white hover:text-white'
										: scope.row.status == 3
										? 'border border-sourcing hover:border-sourcing focus:border-sourcing bg-sourcing/10 hover:bg-sourcing focus:bg-sourcing text-sourcing hover:text-white focus:text-white'
										: scope.row.status == 4
										? 'border border-selection hover:border-selection focus:border-selection text-selection bg-selection/10 hover:bg-selection focus:bg-selection focus:text-white hover:text-white'
										: scope.row.status == 5
										? 'border border-signing hover:border-signing focus:border-signing text-signing bg-signing/10 hover:bg-signing focus:bg-signing focus:text-white hover:text-white'
										: 'border border-supervision hover:border-supervision focus:border-supervision text-supervision bg-supervision/10 hover:bg-supervision focus:bg-supervision focus:text-white hover:text-white'
								"
							>
								{{
									scope.row.status === 1
										? "New Project"
										: scope.row.status === 2
										? "On Hold"
										: scope.row.status === 3
										? "Sourcing"
										: scope.row.status === 4
										? "Selection"
										: scope.row.status === 5
										? "Signing"
										: "Supervision"
								}}
							</el-tag>
						</template>
					</el-table-column>

					<el-table-column
						v-if="projectStatus && columnVisibility[props.id + '_' + 'approval_authority_status']"
						fixed="right"
						prop="approval_authority_status"
						:label="$t('columnLabels.approval_authority_status')"
						:min-width="resizableData[props.id + '_' + 'approval_authority_status'] ?? '210'"
						sortable="custom"
					>
						<template #header="{ column }">
							<BaseColumnTooltip :column="column" />
						</template>

						<template #default="scope">
							<el-tag
								class="w-[95px]"
								disable-transitions
								:class="
									scope.row.approval_authority_status == 0
										? 'border border-[purple] hover:border-[purple] focus:border-[purple] bg-[purple]/10 hover:bg-[purple] focus:bg-[purple] text-[purple] hover:text-white focus:text-white'
										: scope.row.approval_authority_status == 1
										? 'border border-amber hover:border-amber focus:border-amber text-amber bg-amber/10 hover:bg-amber focus:bg-amber focus:text-white hover:text-white'
										: scope.row.approval_authority_status == 2
										? 'border border-success hover:border-success focus:border-success bg-success/10 hover:bg-success focus:bg-success text-success hover:text-white focus:text-white'
										: scope.row.approval_authority_status == 3
										? 'border border-danger hover:border-danger focus:border-danger text-danger bg-danger/10 hover:bg-danger focus:bg-danger focus:text-white hover:text-white'
										: ''
								"
							>
								{{
									scope.row.approval_authority_status == 0
										? "Not Assigned"
										: scope.row.approval_authority_status == 1
										? "Awaited"
										: scope.row.approval_authority_status == 2
										? "Approved"
										: scope.row.approval_authority_status == 3
										? "Rejected"
										: ""
								}}
							</el-tag>
						</template>
					</el-table-column>

					<el-table-column
						v-if="supplierStatus && columnVisibility[props.id + '_' + 'account_status']"
						fixed="right"
						prop="account_status"
						:label="$t('columnLabels.Status')"
						:min-width="resizableData[props.id + '_' + 'account_status'] ?? '240'"
						icon="icon"
					>
						<template #header>
							<span class="header-label flex items-center">
								{{ $t("columnLabels.Status") }}
								<span class="ml-2 cursor-pointer" @click="click"><i class="fa-regular fa-circle-info"></i></span>
							</span>
						</template>

						<template #default="scope">
							<div class="flex items-center">
								<el-dropdown trigger="click" :disabled="!editIcon">
									<el-button
										class="default"
										size="small"
										:class="
											scope.row.status == 3
												? 'border border-success hover:border-success focus:border-success bg-success/10 hover:bg-success focus:bg-success text-success hover:text-white focus:text-white'
												: scope.row.status == 4
												? 'border border-[#ff8e28] hover:border-[#ff8e28] focus:border-[#ff8e28] bg-[#ff8e28]/10 hover:bg-[#ff8e28] focus:bg-[#ff8e28] text-[#ff8e28] focus:text-white hover:text-white'
												: scope.row.status == 2
												? 'border border-danger hover:border-danger focus:border-danger bg-danger/10 hover:bg-danger focus:bg-danger focus:text-white hover:text-white text-danger'
												: 'border border-danger hover:border-danger focus:border-danger text-danger bg-danger/10 hover:bg-danger focus:bg-danger focus:text-white hover:text-white'
										"
									>
										<span>{{
											scope.row.status === 1
												? $t("dropdown_labels.uncontracted_unapproved")
												: scope.row.status === 2
												? $t("dropdown_labels.unapproved_contracted")
												: scope.row.status === 3
												? $t("dropdown_labels.approved_contracted")
												: scope.row.status === 4
												? $t("dropdown_labels.approved_uncontracted")
												: ""
										}}</span>
										<i v-if="editIcon" class="fa-solid fa-angle-down ml-4"></i>
									</el-button>

									<template #dropdown>
										<el-dropdown-menu>
											<el-dropdown-item class="hover:!bg-success/10" @click="supplierStatusClick(scope.row, '3')"
												><span class="text-success">{{ $t("dropdown_labels.approved_contracted") }}</span></el-dropdown-item
											>

											<el-dropdown-item class="hover:!bg-[#ff8e28]/10" @click="supplierStatusClick(scope.row, '4')"
												><span class="text-[#ff8e28]">{{
													$t("dropdown_labels.approved_uncontracted")
												}}</span></el-dropdown-item
											>
											<el-dropdown-item class="hover:!bg-danger/10" @click="supplierStatusAnapprovedClick(scope.row, '2')"
												><span class="text-danger">{{ $t("dropdown_labels.unapproved_contracted") }}</span></el-dropdown-item
											>
											<el-dropdown-item class="hover:!bg-danger/10" disabled @click="supplierStatusClick(scope.row, '1')"
												><span class="text-danger">{{
													$t("dropdown_labels.uncontracted_unapproved")
												}}</span></el-dropdown-item
											>
										</el-dropdown-menu>
									</template>
								</el-dropdown>

								<BaseSupplierStatusContentModal :id="scope.row.status" />
							</div>
							<!-- <span class="ml-2 cursor-pointer" :class="scope.row.status == 3 ? 'success' : scope.row.status == 4 ? 'blue' : scope.row.status == 2 ? 'yellow' : 'danger'"><i class="fa fa-info"> </i></span> -->
						</template>
					</el-table-column>

					<el-table-column
						v-if="isQtStatus && columnVisibility[props.id + '_' + 'tender_status']"
						fixed="right"
						prop="tender_status"
						:label="$t('columnLabels.Status')"
						:min-width="resizableData[props.id + '_' + 'tender_status'] ?? '150'"
						sortable="custom"
					>
						<!-- header with tooltip -->
						<template #header="{ column }">
							<BaseColumnTooltip :column="column" />
						</template>

						<template #default="scope">
							<div class="flex items-center">
								<el-dropdown trigger="click" :disabled="!editIcon || scope.row.tender_status != 0 || !scope.row.is_authoriser">
									<el-button
										class="default"
										size="small"
										:class="
											scope.row.tender_status === 0
												? 'border border-primary hover:border-primary focus:border-primary text-primary bg-primary/10 hover:bg-primary focus:bg-primary focus:text-white hover:text-white'
												: scope.row.tender_status === 1
												? 'border border-teal hover:border-teal focus:border-teal text-teal bg-teal/10 hover:bg-teal focus:bg-teal focus:text-white hover:text-white'
												: scope.row.tender_status === 2
												? 'border border-danger hover:border-danger focus:border-danger text-danger bg-danger/10 hover:bg-danger focus:bg-danger focus:text-white hover:text-white'
												: scope.row.tender_status === 3
												? 'border border-success hover:border-success focus:border-success text-success bg-success/10 hover:bg-success focus:bg-success focus:text-white hover:text-white'
												: 'border border-danger hover:border-danger focus:border-danger text-danger bg-danger/10 hover:bg-danger focus:bg-danger focus:text-white hover:text-white'
										"
									>
										<span>{{
											scope.row.tender_status === 0
												? "Awaited"
												: scope.row.tender_status === 1
												? "Upcoming"
												: scope.row.tender_status === 2
												? "Rejected"
												: scope.row.tender_status === 3
												? "Open"
												: "Closed"
										}}</span>
										<i
											v-if="editIcon && scope.row.tender_status == 0 && scope.row.is_authoriser"
											class="fa-solid fa-angle-down ml-4"
										></i>
									</el-button>

									<template #dropdown>
										<el-dropdown-menu v-if="scope.row.tender_status == 0 && scope.row.is_authoriser">
											<el-dropdown-item @click="QTStatusClick(scope.row, '1')"
												><span class="text-[green]">{{ $t("dropdown_labels.approve") }}</span></el-dropdown-item
											>
											<el-dropdown-item @click="QTStatusClick(scope.row, '2')"
												><span class="text-[red]">{{ $t("dropdown_labels.reject") }}</span></el-dropdown-item
											>
										</el-dropdown-menu>
									</template>
								</el-dropdown>
							</div>
						</template>
					</el-table-column>

					<el-table-column
						v-if="clientAdminRetry"
						fixed="right"
						prop="microservice_status"
						:label="$t('columnLabels.tenant_creation')"
						:min-width="resizableData[props.id + '_' + 'microservice_status'] ?? '180'"
						sortable="custom"
					>
						<!-- header with tooltip -->
						<template #header="{ column }">
							<BaseColumnTooltip :column="column" />
						</template>

						<template #default="scope">
							<el-tag
								class="w-[65px]"
								disable-transitions
								:class="
									scope.row.microservice_status === 2
										? 'bg-success/10 border border-success text-success text-bold'
										: 'bg-danger/10 border border-danger text-danger text-bold'
								"
							>
								{{ getStatusText(scope.row.microservice_status) }}
							</el-tag>
						</template>
					</el-table-column>

					<el-table-column
						v-if="userRoleColumn"
						prop="name"
						:label="$t('columnLabels.user_role')"
						:min-width="resizableData[props.id + '_' + 'name'] ?? ''"
						sortable="custom"
					>
						<!-- header with tooltip -->
						<template #header="{ column }">
							<BaseColumnTooltip :column="column" />
						</template>

						<template #default="scope">
							<el-link
								type="primary"
								class="cursor-pointer hover:text-primary"
								@click="navigateTo(localePath(`/roles-permissions/view-role/${scope.row?.id}`))"
								>{{ scope.row.name }}</el-link
							>
						</template>
					</el-table-column>

					<el-table-column v-if="isActionColumn" fixed="right" :label="$t('columnLabels.actions')" width="100" :resizable="false">
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
									<el-dropdown-menu>
									<!-- view-->
									<el-dropdown-item v-if="previewBtn" @click="handleView(scope.row)">
										<i class="fa-regular fa-fw fa-eye"></i>
										{{ $t("labels.view") }}
									</el-dropdown-item>

									<!-- edit-->
									<el-dropdown-item v-if="isShowEdit(scope.row)" @click="handleEdit(scope.row)">
										<i class="fa-regular fa-fw fa-pen-to-square"></i>
										{{ $t("labels.edit") }}
									</el-dropdown-item>

									<!-- delete-->
									<el-dropdown-item v-if="deleteBtn" @click="handleDelete(scope.row)">
										<i class="fa-regular fa-fw fa-trash"></i>
										{{ $t("labels.delete") }}
									</el-dropdown-item>

									<el-dropdown-item v-if="archivedBtn" @click="handleArchived(scope.row)">
										<i :class="+route.query?.isArchived === 1 ? 'fa-solid fa-fw fa-box' : 'fa-solid fa-fw fa-box-taped'"></i>

										{{ +route.query?.isArchived === 0 ? $t("labels.archvie") : $t("labels.unarchvie") }}
									</el-dropdown-item>

									<!--supplier user icon  -->
									<el-dropdown-item v-if="supplierUserIcon" @click="handleSupplierUser(scope.row)">
										<i class="fa-regular fa-fw fa-user"></i>
										{{ $t("labels.supplier_user") }}
									</el-dropdown-item>

									<!-- supplier place order -->
									<el-dropdown-item
										v-if="id === 'supplier' && (scope.row.status == 3 || scope.row.status == 4) && scope.row.place_order"
									>
										<i class="fa-regular fa-cart-circle-check"></i>
										<a :href="scope.row.place_order" target="_blank">{{ $t("labels.place_order") }}</a>
									</el-dropdown-item>

									<!--client admin retry  -->
									<el-dropdown-item
										v-if="scope.row.microservice_status === 3 && clientAdminRetry"
										@click="handleClientAdminRetry(scope.row)"
									>
										<i class="fa-regular fa-fw fa-rotate-right"></i>
										{{ $t("labels.retry") }}
									</el-dropdown-item>

									<!-- client admin retry  -->
									<el-dropdown-item
										v-if="clientAdminAccess && scope.row.microservice_status === 2"
										@click="handleClientAdminAccess(scope.row)"
									>
										<i class="fa-regular fa-fw fa-user-gear"></i>
										{{ $t("labels.client_admin_access") }}
									</el-dropdown-item>

									<!-- client admin subscription renewal  -->
									<el-dropdown-item
										v-if="clientAdminAccess && scope.row?.is_renewal_request"
										@click="handleClientAdminSubscriptionRenewal(scope.row)"
									>
										<i class="fa-regular fa-fw fa-retweet"></i>
										{{ $t("labels.sent_renew_subscription_link") }}
									</el-dropdown-item>

									<!-- client admin request approved -->
									<el-dropdown-item
										v-if="clientAdminRequestApproved && !scope.row?.is_approved"
										@click="handleClientAdminRequestApproved(scope.row)"
									>
										<i class="fa-solid fa-person-circle-check"></i>
										{{ $t("labels.approve_client_admin_request") }}
									</el-dropdown-item>

									<!-- tender-closed-see-responses -->
									<el-dropdown-item
										v-if="props.id === 'quotation_tender' && scope.row?.tender_status === 4"
										@click="navigateTo(localePath(`/quotations-tender/q-t/qt-responses/${scope.row?.id}`))"
									>
										<i class="fa-solid fa-rectangle-list"></i>
										{{ $t("labels.see_responses") }}
									</el-dropdown-item>

									<!-- request change status -->
									<el-dropdown-item
										v-if="props.id === 'request' && authStore.role_id === 'client_admin' && scope.row.status == 1"
										@click="navigateTo(localePath(`/project-pipeline/requests/change-status/${scope.row?.id}`))"
									>
										<i class="fa-light fa-bolt"></i>
										{{ $t("labels.change_status") }}
									</el-dropdown-item>

									<!-- project change status && authStore.role_id === 'client_admin'-->
									<el-dropdown-item
										v-if="
											props.id === 'project' &&
											scope.row.is_approval_authority &&
											scope.row.approval_authority_status == 1 &&
											props.editIcon
										"
										@click="changeProjectStatus(scope.row)"
									>
										<i class="fa-light fa-bolt"></i>
										{{ $t("labels.change_status") }}
									</el-dropdown-item>
								</el-dropdown-menu>
								</template>
							</el-dropdown>
						</template>
					</el-table-column>

					<el-table-column v-if="isActionColumnNotDropdown" fixed="right" :label="$t('columnLabels.actions')" width="100">
						<!-- header with tooltip -->
						<template #header="{ column }">
							<BaseColumnTooltip :column="column" />
						</template>

						<template #default="scope">
							<!-- view-->

							<el-tooltip v-if="previewBtn" placement="left" :content="$t('labels.view')">
								<el-icon class="text-dark/50 mr-2" :size="16" style="cursor: pointer" @click="handleView(scope.row)">
									<i class="fa-regular fa-eye text-dark/50 hover:text-primary"></i>
								</el-icon>
							</el-tooltip>

							<!-- edit-->
							<el-tooltip v-if="editIcon" placement="left" :content="$t('labels.edit')">
								<el-icon class="text-dark/50 mr-2" :size="16" style="cursor: pointer" @click="handleEdit(scope.row)">
									<i class="fa-regular fa-fw fa-pen-to-square text-dark/50 hover:text-primary"></i>
								</el-icon>
							</el-tooltip>

							<!-- delete-->
							<el-tooltip v-if="isShowDeleteBtn(scope.row)" placement="left" :content="$t('labels.delete')">
								<el-icon class="text-dark/50 mr-2" :size="16" style="cursor: pointer" @click="handleDelete(scope.row)">
									<i class="fa-regular fa-trash text-dark/50 hover:text-primary"></i>
								</el-icon>
							</el-tooltip>
						</template>
					</el-table-column>
				</el-table>
			</div>

			<div v-else :style="{ height: `${tableHeight}px` }">
				<BaseGridTable
					:id="props.id"
					:table-data="tableData"
					:preview-btn="previewBtn"
					:edit-icon="editIcon"
					:delete-btn="deleteBtn"
					:archived-btn="archivedBtn"
					@handle-archvied="handleArchived"
					@handle-view="handleView"
					@handle-edit="handleEdit"
					@handle-delete="handleDelete"
					@handle-retry="handleClientAdminRetry"
					@handle-client-admin-access="handleClientAdminAccess"
					@handle-client-admin-request-approved="handleClientAdminRequestApproved"
					@handle-supplier-user="handleSupplierUser"
					@supplier-status="supplierStatusClick"
					@supplier-unapproved-status="SupplierUnapprovedData"
					@qt-reject-status="QTrejectStatusData"
					@qt-approve-status="QTApproveStatusData"
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
				:current-page="currentPage"
				:page-sizes="[10, 25, 50, 100]"
				layout="total, sizes, prev, pager, next"
				:total="total"
				:page-size="perPage"
				:default-current-page="currentPage"
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
			/>
		</div>
	</div>

	<BaseSupplierStatusModal v-if="dialogVisible === true" :dialog-visible="dialogVisible" @dialog-ok-click="dialogOkClick" />

	<base-supplier-un-approved-status-modal
		v-if="dialogVisibleSupplierUnapprovedModal === true"
		:dialog-visible="dialogVisibleSupplierUnapprovedModal"
		:id="rowId"
		@dialog-ok-click="dialogOkClickSupplierUnapprovedModal"
		@status-data="SupplierUnapprovedData"
	/>
	<quotations-tender-reject-modal
		v-if="dialogVisibleQTRejectModal === true"
		:dialog-visible="dialogVisibleQTRejectModal"
		:id="rowId"
		@dialog-ok-click="dialogOkClickQTRejectModal"
		@status-data="QTrejectStatusData"
	/>
	<quotations-tender-approve-modal
		v-if="dialogVisibleQTApproveModal === true"
		:dialog-visible="dialogVisibleQTApproveModal"
		:id="rowId"
		:is-notify-qT-user="isNotifyQTUser"
		
		@dialog-ok-click="dialogOkClickQTApproveModal"
	/>
	<quotations-tender-approve-m
		v-if="dialogVisibleQTApproveM === true"
		:dialog-visible="dialogVisibleQTApproveM"
		:id="rowId"
		@dialog-ok-click="dialogOkClickQTApproveM"
		@status-data="QTApproveStatusData"
	/>
</template>
