<script setup lang="ts">
	import moment from "moment";
	import { sidebarItemStore } from "~/store/sidebarItem";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import { useAuthStore } from "~/store/auth";
	import { useProfileStore } from "~/store/profile";

	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});

	useHead({
		title: "Project",
	});

	const route = useRoute();
	const tableData = ref<any>([]);
	const total = ref<any>(0);
	const currentPage = ref<any>(1);
	const perPage = ref<any>(10);
	const searchValue = ref<any>("");
	const sortOrder = ref<any>("");
	const sortColumn = ref<any>("");
	const status = ref<any>("");
	const signingEntity = ref<any>("");
	const fullscreenLoading = ref(false);
	const sidebarStore = sidebarItemStore();
	const localePath = useLocalePath();
	const { t } = useI18n();
	const dialogVisible = ref(false);
	const rowId = ref("");
	const authStore = useAuthStore();
	const profileStore = useProfileStore();
	const projectOwnerSearch = ref<any>("");

	interface Item {
		expected_dates_of_completion: String;
		activity_type: Number;
		request_type: Number;
	}

	const formatter = (row: Item) => {
		return row.expected_dates_of_completion ? moment(`${row.expected_dates_of_completion}`).format("DD/MM/YYYY  hh:mm A") : "-";
	};

	const formatterActivityType = (row: Item) => {
		return row.activity_type === 1
			? "Single Source"
			: row.activity_type === 2
			? "Framework"
			: row.activity_type === 3
			? "Stay with incumbent"
			: row.activity_type === 4
			? "Request for Information (RFI)"
			: row.activity_type === 5
			? "Request for Quotation (RFQ)"
			: "Invite to Tender (ITT)";
	};

	const formatterRequestType = (row: Item) => {
		return row.request_type === 1
			? "New requirement"
			: row.request_type === 2
			? "Renewal"
			: row.request_type === 3
			? "Compliance"
			: row.request_type === 4
			? "Benchmarking"
			: row.request_type === 5
			? "Change Request"
			: "-";
	};

	const tableColumn = ref([
		{
			columnName: "request_type",
			columnLabel: t("columnLabels.request_type"),
			width: "200",
			sorting: true,
			customCellClass: "cellTruncate",
			formatter: formatterRequestType,
		},
		{
			columnName: "requester_name",
			columnLabel: t("columnLabels.requestor"),
			width: "270",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "project_owner_name",
			columnLabel: t("columnLabels.project_owner"),
			width: "200",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "sub_entity_name",
			columnLabel: t("columnLabels.signing_entity"),
			width: "200",
			sorting: true,
			customCellClass: "cellTruncate",
		},

		{
			columnName: "project_title",
			columnLabel: t("columnLabels.project_title"),
			width: "130",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		// {
		// 	columnName: "budget",
		// 	columnLabel: t("columnLabels.budget"),
		// 	width: "120",
		// 	sorting: true,
		// 	customCellClass: "cellTruncate",
		// },
		{
			columnName: "activity_type",
			columnLabel: t("columnLabels.activity_type"),
			width: "210",
			sorting: true,
			customCellClass: "cellTruncate",
			formatter: formatterActivityType,
		},
		// {
		// 	columnName: "expected_dates_of_completion",
		// 	columnLabel: t("columnLabels.expected_date_of_completion"),
		// 	width: "250",
		// 	sorting: true,
		// 	customCellClass: "cellTruncate",
		// 	formatter: formatter,
		// },
	]);

	onMounted(async () => {
		await fetchList();
	});

	const fetchList = async () => {
		currentPage.value = route.query.page ? +route.query.page : 1;
		perPage.value = route.query.perPage ? +route.query.perPage : 10;
		searchValue.value = route.query.searchValue ? route?.query?.searchValue : "";
		sortOrder.value = route.query.sortOrder ? route.query.sortOrder : "";
		sortColumn.value = route.query.sortColumn ? route.query.sortColumn : "";
		status.value = route.query.projectStatus ? route.query.projectStatus : "";
		signingEntity.value = route.query.signingEntity ? route.query.signingEntity : "";

		await getProjectData(
			currentPage.value,
			perPage.value,
			searchValue.value,
			sortOrder.value,
			sortColumn.value,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			status.value,
			signingEntity.value
		);
	};

	const getProjectData = async (
		currentPage: any,
		perPage: any,
		searchValue: any,
		sortOrder: any,
		sortColumn: any,
		fromDate: any,
		toDate: any,
		isArchived: any,
		currency: any,
		category: any,
		country: any,
		sstatus: any,
		keySupplier: any,
		requestType: any,
		requestStatus: any,
		accessRole: any,
		status: any,
		signingEntity: any
	) => {
		try {
			navigateTo(
				localePath({
					path: route.fullPath,
					query: {
						page: currentPage,
						perPage,
						searchValue,
						sortOrder,
						sortColumn,
						projectStatus: status,
						signingEntity,
					},
				}),
				{ replace: true }
			);

			fullscreenLoading.value = true;
			searchValue = encodeURIComponent(searchValue);

			const res: any = await useApiFetch(
				`/projects?page=${currentPage}&perPage=${perPage}&searchValue=${searchValue}&sortOrder=${sortOrder}&sortColumn=${sortColumn}&status=${status}&signingEntity=${signingEntity}`,
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

	const getAuthData = computed(() => {
		return profileStore.profileData.user_detail;
	});

	// const handleEdit = (row: any) => {
	// 	const pageDetails = {
	// 		page: route.query?.page,
	// 		perPage: route.query?.perPage,
	// 		searchValue: route.query?.searchValue,
	// 		sortOrder: route.query?.sortOrder,
	// 		sortColumn: route.query?.sortColumn,
	// 	};
	// 	sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));
	// 	navigateTo(
	// 		localePath({
	// 			path: `/project-pipeline/requests/edit-request/${row.id}`,
	// 		})
	// 	);
	// };

	const handleView = (row: any) => {
		const pageDetails = {
			page: route.query?.page,
			perPage: route.query?.perPage,
			searchValue: route.query?.searchValue,
			sortOrder: route.query?.sortOrder,
			sortColumn: route.query?.sortColumn,
			projectStatus: route.query?.projectStatus,
			signingEntity: route.query?.signingEntity,
		};
		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));
		const activeTab = useCookie("activeTab");
		activeTab.value = row.active_tab;
		navigateTo(
			localePath({
				path: `/project-pipeline/projects/view-project/${row.id}`,
				query: {
					tab: row.active_tab,
				},
			})
		);
	};

	const statusChangeApi = async (formData: any, id: any, status: any) => {
		fullscreenLoading.value = true;

		try {
			const res: any = await useApiFetch(`/projects/${id}/change-status/${status}`, {
				method: "POST",
				body: formData,
			});
			useToast("success", res.message);
			fullscreenLoading.value = false;
			fetchList();
		} catch {
			fullscreenLoading.value = false;
		}
	};

	const projectExport = async (data: any) => {
		fullscreenLoading.value = true;
		try {
			const res: any = await useApiFetch(`/projects/export`, {
				method: "POST",
				body: data,
			});
			useToast("success", res.message);
			fullscreenLoading.value = false;
			var a = document.createElement("a");
			a.href = res.data?.export_link;
			a.download = "Project.csv";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);

			fetchList();
		} catch {
			fullscreenLoading.value = false;
		}
	};

	const handleEdit = (row: any) => {
		const pageDetails = {
			page: route.query?.page,
			perPage: route.query?.perPage,
			searchValue: route.query?.searchValue,
			sortOrder: route.query?.sortOrder,
			sortColumn: route.query?.sortColumn,
			projectStatus: route.query?.projectStatus,
			signingEntity: route.query?.signingEntity,
		};
		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));
		sessionStorage.setItem("redirectFrom", "edit");
		const activeTab = useCookie("activeTab");
		activeTab.value = row.active_tab;

		navigateTo(
			localePath({
				path: `/project-pipeline/projects/edit-project/${row.id}`,
				query: {
					tab: row.active_tab,
				},
			})
		);
	};
	const handleDelete = () => {};
</script>
<template>
	<div v-loading="fullscreenLoading">
		<BaseDataTable
			id="project"
			:project-code-column="true"
			:table-data="tableData"
			:table-column="tableColumn"
			:total="total"
			:edit-icon="hasPermissionTo('project-edit')"
			:stripe="true"
			:add-button="false"
			:is-action-column="true"
			:project-status="true"
			:name="$t('buttons.project')"
			@handale-current-change="getProjectData"
			@handale-size-change="getProjectData"
			@handale-sort-change="getProjectData"
			@handle-edit="handleEdit"
			@handle-delete="handleDelete"
			@handle-view="handleView"
			@search-value="getProjectData"
			@sourcing-status="statusChangeApi"
			@selection-status="statusChangeApi"
			@signing-status="statusChangeApi"
			@supervision-status="statusChangeApi"
			@project-filtered-data="getProjectData"
			@export-data="projectExport"
		/>
		<!-- <BaseDeleteModal v-if="dialogVisible === true" :dialog-visible="dialogVisible" :delete-api="deleteApi" @dialog-ok-click="dialogOkClick" /> -->
	</div>
</template>
