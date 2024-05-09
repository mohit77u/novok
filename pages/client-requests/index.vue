<template>
	<div v-loading="fullscreenLoading">
		<BaseDataTable
			id="client_requests"
			:table-data="tableData"
			:table-column="tableColumn"
			:total="total"
			:edit-icon="false"
			:stripe="true"
			:add-button="false"
			:image-column="true"
			:client-admin-request-approved="true"
			@handale-current-change="getClientRequestLisitngData"
			@handale-size-change="getClientRequestLisitngData"
			@handale-sort-change="getClientRequestLisitngData"
			@handle-view="handleView"
			@search-value="getClientRequestLisitngData"
			@handle-client-admin-request-approved="handleClientAdminRequestApproved"
		/>

		<base-client-admin-request-approved-modal :dialog-visible="dialogVisible" :id="rowId" @dialog-ok-click="dialogOkClick" />
	</div>
</template>

<script setup lang="ts">
	import moment from "moment";
	import { sidebarItemStore } from "../../store/sidebarItem";
	import { sidebarItemClear } from "../../helper/sidebarItemClear";
	import { useAuthStore } from "~/store/auth";
	import { useProfileStore } from "~/store/profile";

	definePageMeta({
		middleware: ["auth"],
	});

	useHead({
		title: "Client Requests",
	});

	const route = useRoute();
	const tableData = ref<any>([]);
	const total = ref<any>(0);
	const currentPage = ref<any>(1);
	const perPage = ref<any>(10);
	const searchValue = ref<any>("");
	const sortOrder = ref<any>("");
	const sortColumn = ref<any>("");
	const fullscreenLoading = ref(false);
	const localePath = useLocalePath();
	const { t } = useI18n();
	const rowId = ref("");
	const authStore = useAuthStore();
	const profileStore = useProfileStore();
	const dialogVisible = ref(false);

	interface Item {
		mobile_number: Number;
		country_code: String;
		is_approved: Number;
	}

	const formatterMobile = (row: Item) => {
		return `${"(".concat(`${row.country_code}`).concat(")")}`.concat(`${row.mobile_number}`);
	};

	const formatterIsApproved = (row: Item) => {
		return row.is_approved ? "Yes" : "No";
	};

	const tableColumn = ref([
		{
			columnName: "company_name",
			columnLabel: t("columnLabels.reg_company_name"),
			width: "210",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "company_number",
			columnLabel: t("columnLabels.reg_company_number"),
			width: "220",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "full_name",
			columnLabel: t("columnLabels.full_name"),
			width: "150",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "job_title",
			columnLabel: t("columnLabels.job_title"),
			width: "130",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "department",
			columnLabel: t("columnLabels.department"),
			width: "150",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "email",
			columnLabel: t("columnLabels.email"),
			width: "220",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "mobile_number",
			columnLabel: t("columnLabels.contact_number"),
			width: "180",
			sorting: true,
			formatter: formatterMobile,
		},
		{
			columnName: "is_approved",
			columnLabel: t("columnLabels.is_approved"),
			width: "180",
			sorting: true,
			formatter: formatterIsApproved,
		},
	]);

	onMounted(async () => {
		await fetchClientRequests();
	});

	const fetchClientRequests = async () => {
		currentPage.value = route.query.page ? +route.query.page : 1;
		perPage.value = route.query.perPage ? +route.query.perPage : 10;
		searchValue.value = route.query.searchValue ? route?.query?.searchValue : "";
		sortOrder.value = route.query.sortOrder ? route.query.sortOrder : "";
		sortColumn.value = route.query.sortColumn ? route.query.sortColumn : "";
		await getClientRequestLisitngData(currentPage.value, perPage.value, searchValue.value, sortOrder.value, sortColumn.value);
	};

	const getClientRequestLisitngData = async (currentPage: any, perPage: any, searchValue: any, sortOrder: any, sortColumn: any) => {
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
					},
				}),
				{ replace: true }
			);

			fullscreenLoading.value = true;
			searchValue = encodeURIComponent(searchValue);

			const res: any = await useApiFetch(
				`/client-requests?page=${currentPage}&perPage=${perPage}&searchValue=${searchValue}&sortOrder=${sortOrder}&sortColumn=${sortColumn}`,
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

	const handleView = (row: any) => {
		const pageDetails = {
			page: route.query?.page,
			perPage: route.query?.perPage,
			searchValue: route.query?.searchValue,
			sortOrder: route.query?.sortOrder,
			sortColumn: route.query?.sortColumn,
		};

		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));

		navigateTo(
			localePath({
				path: `/client-requests/view/${row.id}`,
			})
		);
	};

	const handleClientAdminRequestApproved = (row: any) => {
		rowId.value = row?.id;
		dialogVisible.value = true;
	};

	const dialogOkClick = ($visible: boolean, $refresh: boolean = false) => {
		dialogVisible.value = false;

		if ($refresh) {
			fetchClientRequests();
		}
	};
</script>
