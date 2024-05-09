<script setup lang="ts">
	import moment from "moment";
	import { sidebarItemClear } from "../../helper/sidebarItemClear";
	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});

	useHead({
		title: "Users",
	});

	const route = useRoute();
	const tableData = ref<any>([]);
	const total = ref<any>(0);
	const currentPage = ref<any>(1);
	const perPage = ref<any>(10);
	const searchValue = ref<any>("");
	const sortOrder = ref<any>("");
	const sortColumn = ref<any>("");
	const accessRole = ref<any>("");
	const fullscreenLoading = ref(false);
	// const clientAdminId = ref("");
	const localePath = useLocalePath();
	const { t } = useI18n();
	const rowId = ref("");
	const dialogVisible = ref(false);

	interface Item {
		first_name: string;
		last_name: string;
		status: number;
		mobile_number: number;
		country_code: string;
		company_address: string;
		account_activation_date: string;
		preferred_langauge: string;
	}

	const formatter = (row: Item) => {
		return moment(`${row.account_activation_date}`).format("DD/MM/YYYY");
	};

	const formatterMobile = (row: Item) => {
		return `${"(".concat(`${row.country_code}`).concat(")")}`.concat(`${row.mobile_number}`);
	};

	const formatterlang = (row: Item) => {
		return row.preferred_langauge ? row.preferred_langauge : "-";
	};

	const tableColumn = ref([
		// {
		// 	columnName: "employee_id",
		// 	columnLabel: t("columnLabels.employee_id"),
		// 	width: "140",
		// 	sorting: true,
		// },
		{
			columnName: "full_name",
			columnLabel: t("columnLabels.full_name"),
			width: "140",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "job_title",
			columnLabel: t("columnLabels.job_title"),
			width: "120",
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
			columnLabel: t("columnLabels.user_work_email"),
			width: "170",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "mobile_number",
			columnLabel: t("columnLabels.contact_number"),
			width: "170",
			sorting: true,
			formatter: formatterMobile,
		},
		{
			columnName: "access_role_name",
			columnLabel: t("columnLabels.access_role"),
			width: "170",
			sorting: true,
		},
		{
			columnName: "preferred_langauge",
			columnLabel: t("columnLabels.preferred_language"),
			width: "190",
			sorting: true,
			formatter: formatterlang,
			customCellClass: "cellTruncate",
		},

		{
			columnName: "account_activation_date",
			columnLabel: t("columnLabels.date"),
			width: "170",
			sorting: true,
			formatter,
		},
	]);

	onMounted(async () => {
		// clientAdminId.value = sessionStorage.getItem("client_admin_id") || "";
		await fetchList();
	});

	const fetchList = async () => {
		currentPage.value = route.query.page ? +route.query.page : 1;
		perPage.value = route.query.perPage ? +route.query.perPage : 10;
		searchValue.value = route.query.searchValue ? route?.query?.searchValue : "";
		sortOrder.value = route.query.sortOrder ? route.query.sortOrder : "";
		sortColumn.value = route.query.sortColumn ? route.query.sortColumn : "";
		accessRole.value = route.query.accessRole ? route.query.accessRole : "";
		await getClientUserLisitngData(
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
			accessRole.value
		);
	};

	const getClientUserLisitngData = async (
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
		accessRole: any
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
						accessRole,
					},
				}),
				{ replace: true }
			);

			fullscreenLoading.value = true;
			searchValue = encodeURIComponent(searchValue);

			const res: any = await useApiFetch(
				`/client-users?page=${currentPage}&perPage=${perPage}&searchValue=${searchValue}&sortOrder=${sortOrder}&sortColumn=${sortColumn}&access_role_id=${accessRole}`,
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
		const pageDetails = {
			page: route.query?.page,
			perPage: route.query?.perPage,
			searchValue: route.query?.searchValue,
			sortOrder: route.query?.sortOrder,
			sortColumn: route.query?.sortColumn,
			accessRole: route.query?.accessRole,
		};
		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));
		navigateTo(
			localePath({
				path: `/client-users/edit-client-user/${row.master_user_detail_id}`,
				// query: { client_admin_id: route.query?.client_admin_id },
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
			accessRole: route.query?.accessRole,
		};
		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));

		navigateTo(
			localePath({
				path: `/client-users/view-client-user/${row.master_user_detail_id}`,
			})
		);
	};

	const handleDelete = (row: any) => {
		rowId.value = row.master_user_detail_id;
		dialogVisible.value = true;
	};

	const dialogOkClick = (value: any) => {
		dialogVisible.value = value;
	};

	const deleteApi = async () => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch(`/client-users/${rowId.value}`, {
				method: "DELETE",
			});

			useToast("success", res.message);
			dialogVisible.value = false;
			await fetchList();
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};
</script>
<template>
	<div class="h-full overflow-hidden" v-loading="fullscreenLoading">
		<BaseDataTable
			id="client_user"
			:table-data="tableData"
			:table-column="tableColumn"
			:total="total"
			:status="true"
			:edit-icon="hasPermissionTo('clients-user-edit')"
			:stripe="true"
			:client-user-filter="true"
			:add-button="hasPermissionTo('clients-user-create')"
			:name="$t('buttons.client_user')"
			@handale-current-change="getClientUserLisitngData"
			@handale-size-change="getClientUserLisitngData"
			@handale-sort-change="getClientUserLisitngData"
			@handle-edit="handleEdit"
			@handle-view="handleView"
			@handle-delete="handleDelete"
			@search-value="getClientUserLisitngData"
			@user-filtered-data="getClientUserLisitngData"
		/>
		<BaseDeleteModal v-if="dialogVisible === true" :dialog-visible="dialogVisible" :delete-api="deleteApi" @dialog-ok-click="dialogOkClick" />
	</div>
</template>
