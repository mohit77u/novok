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
		title: "Requests",
	});

	const route = useRoute();
	const tableData = ref<any>([]);
	const total = ref<any>(0);
	const currentPage = ref<any>(1);
	const perPage = ref<any>(10);
	const searchValue = ref<any>("");
	const sortOrder = ref<any>("");
	const sortColumn = ref<any>("");
	const requestType = ref<any>("");
	const requestStatus = ref<any>("");
	const signingEntity = ref<any>("");

	const fullscreenLoading = ref(false);
	const sidebarStore = sidebarItemStore();
	const localePath = useLocalePath();
	const { t } = useI18n();
	const dialogVisible = ref(false);
	const rowId = ref("");
	const authStore = useAuthStore();
	const profileStore = useProfileStore();
	const projectOwnerSearch = ref("");

	interface Item {
		expected_dates_of_completion: String;
		request_type: Number;
	}

	const formatter = (row: Item) => {
		return row.expected_dates_of_completion ? moment(`${row.expected_dates_of_completion}`).format("DD/MM/YYYY  hh:mm A") : "-";
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
		// {
		// 	columnName: "request_number",
		// 	columnLabel: t("columnLabels.request_number"),
		// 	width: "170",
		// 	sorting: true,
		// 	customCellClass: "cellTruncate",
		// },
		{
			columnName: "requester_name",
			columnLabel: t("columnLabels.requestor"),
			width: "270",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "sub_entity_name",
			columnLabel: t("columnLabels.signing_entity"),
			width: "270",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "title",
			columnLabel: t("columnLabels.title"),
			width: "170",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		// {
		// 	columnName: "category_level_1",
		// 	columnLabel: t("columnLabels.category"),
		// 	width: "150",
		// 	sorting: true,
		// 	customCellClass: "cellTruncate",
		// },
		{
			columnName: "expected_dates_of_completion",
			columnLabel: t("columnLabels.expected_date_of_completion"),
			width: "270",
			sorting: true,
			customCellClass: "cellTruncate",
			formatter: formatter,
		},
		// {
		// 	columnName: "business_unit",
		// 	columnLabel: t("columnLabels.business_unit"),
		// 	width: "190",
		// 	sorting: true,
		// 	customCellClass: "cellTruncate",
		// },
		{
			columnName: "request_type",
			columnLabel: t("columnLabels.request_type"),
			width: "190",
			sorting: true,
			customCellClass: "cellTruncate",
			formatter: formatterRequestType,
		},
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
		requestType.value = route.query.requestType ? route.query.requestType : "";
		requestStatus.value = route.query.requestStatus ? route.query.requestStatus : "";
		signingEntity.value = route.query.signingEntity ? route.query.signingEntity : "";

		await getRequestData(
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
			requestType.value,
			requestStatus.value,
			null,
			null,
			signingEntity.value
		);
	};

	const getRequestData = async (
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
		status: any,
		key_supplier: any,
		requestType: any,
		requestStatus: any,
		accessRole: any,
		projectFilterStatus: any,
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
						requestType,
						requestStatus,
						signingEntity,
					},
				}),
				{ replace: true }
			);

			fullscreenLoading.value = true;
			searchValue = encodeURIComponent(searchValue);

			const res: any = await useApiFetch(
				`/requests?page=${currentPage}&perPage=${perPage}&searchValue=${searchValue}&sortOrder=${sortOrder}&sortColumn=${sortColumn}&requestType=${requestType}&status=${requestStatus}&signingEntity=${signingEntity}`,
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

	const handleEdit = (row: any) => {
		const pageDetails = {
			page: route.query?.page,
			perPage: route.query?.perPage,
			searchValue: route.query?.searchValue,
			sortOrder: route.query?.sortOrder,
			sortColumn: route.query?.sortColumn,
			requestType: route.query?.requestType,
			requestStatus: route.query?.requestStatus,
			signingEntity: route.query?.signingEntity,
		};
		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));
		sessionStorage.setItem("redirectFrom", "edit");
		navigateTo(
			localePath({
				path: `/project-pipeline/requests/edit-request/${row.id}`,
			})
		);
	};

	const handleView = (row: any) => {
		const pageDetails = {
			page: route.query?.page,
			perPage: route.query?.perPage,
			searchValue: route.query?.searchValue,
			sortOrder: route.query?.sortOrder,
			sortColumn: route.query?.sortColumn,
			requestType: route.query?.requestType,
			requestStatus: route.query?.requestStatus,
			signingEntity: route.query?.signingEntity,
		};
		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));
		sessionStorage.setItem("redirectFrom", "view");
		navigateTo(
			localePath({
				path: `/project-pipeline/requests/view-request/${row.id}`,
			})
		);
	};

	const exportRequestData = async (data: any) => {
		fullscreenLoading.value = true;
		try {
			const res: any = await useApiFetch(`/requests/export`, {
				method: "POST",
				body: data,
			});
			useToast("success", res.message);
			fullscreenLoading.value = false;
			var a = document.createElement("a");
			a.href = res.data?.export_link;
			a.download = "Request.csv";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);

			fetchList();
		} catch {
			fullscreenLoading.value = false;
		}
	};
</script>
<template>
	<div v-loading="fullscreenLoading">
		<BaseDataTable
			id="request"
			:table-data="tableData"
			:table-column="tableColumn"
			:total="total"
			:edit-icon="hasPermissionTo('request-edit')"
			:stripe="true"
			:add-button="hasPermissionTo('request-create')"
			:is-request-status="true"
			:name="$t('buttons.request')"
			@handale-current-change="getRequestData"
			@handale-size-change="getRequestData"
			@handale-sort-change="getRequestData"
			@handle-edit="handleEdit"
			@handle-view="handleView"
			@search-value="getRequestData"
			@request-filtered-data="getRequestData"
			@export-data="exportRequestData"
		/>
		<!-- <BaseDeleteModal v-if="dialogVisible === true" :dialog-visible="dialogVisible" :delete-api="deleteApi" @dialog-ok-click="dialogOkClick" /> -->
	</div>
</template>
