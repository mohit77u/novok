<script setup lang="ts">
	import moment from "moment";
	import { sidebarItemClear } from "../../helper/sidebarItemClear";
	definePageMeta({
		middleware: ["auth", "is-super-user"],
	});

	useHead({
		title: "Client Account Manager",
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
	const dialogVisible = ref(false);
	const rowId = ref("");

	interface Item {
		first_name: string;
		last_name: string;
		status: Number;
		mobile_number: Number;
		country_code: String;
		account_activation_date: String;
		all_clients: Number;
		clients: Array<any>;
		personal_email_id: "";
		preferred_langauge: String;
	}

	const formatter = (row: Item) => {
		return moment(`${row.account_activation_date}`).format("DD/MM/YYYY");
	};

	const formatterMobile = (row: Item) => {
		return `${"(".concat(`${row.country_code}`).concat(")")}`.concat(`${row.mobile_number}`);
	};
	const formatterClient = (row: Item) => {
		return getClients(row);
	};

	const formatterlang = (row: Item) => {
		return row.preferred_langauge ? row.preferred_langauge : "-";
	};

	const getClients = (row: any) => {
		if (row.all_clients === 1) {
			return "All";
		} else if (row.clients?.length === 1) {
			return row.clients.map((item: any) => item?.full_name);
		} else if (row.clients?.length > 1) {
			return row.clients
				.map((item: any) => {
					return item.full_name;
				})
				.join(", ");
		} else {
			return "-";
		}
	};

	const tableColumn = ref([
		// {
		// 	columnName: "employee_id",
		// 	columnLabel: t("columnLabels.employee_id"),
		// 	width: "150",
		// 	sorting: true,
		// },
		{
			columnName: "full_name",
			columnLabel: t("columnLabels.full_name"),
			width: "140",
			customCellClass: "cellTruncate",
			sorting: true,
		},

		{
			columnName: "job_title",
			columnLabel: t("columnLabels.job_title"),
			width: "120",
			customCellClass: "cellTruncate",
			sorting: true,
		},
		{
			columnName: "department",
			columnLabel: t("columnLabels.department"),
			width: "150",
			customCellClass: "cellTruncate",
			sorting: true,
		},
		{
			columnName: "email",
			columnLabel: t("columnLabels.email"),
			width: "140",
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
			columnName: "all_clients",
			columnLabel: t("columnLabels.assign_clients"),
			width: "180",
			sorting: false,
			customCellClass: "cellTruncate",
			formatter: formatterClient,
		},
		{
			columnName: "preferred_langauge",
			columnLabel: t("columnLabels.preferred_language"),
			width: "190",
			customCellClass: "cellTruncate",
			sorting: true,
			formatter: formatterlang,
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
		currentPage.value = route.query.page ? +route.query.page : 1;
		perPage.value = route.query.perPage ? +route.query.perPage : 10;
		searchValue.value = route.query.searchValue ? route?.query?.searchValue : "";
		sortOrder.value = route.query.sortOrder ? route.query.sortOrder : "";
		sortColumn.value = route.query.sortColumn ? route.query.sortColumn : "";
		await getClientManagerLisitngData(currentPage.value, perPage.value, searchValue.value, sortOrder.value, sortColumn.value);
	});

	const getClientManagerLisitngData = async (currentPage: any, perPage: any, searchValue: any, sortOrder: any, sortColumn: any) => {
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
				`/client-account-managers?page=${currentPage}&perPage=${perPage}&searchValue=${searchValue}&sortOrder=${sortOrder}&sortColumn=${sortColumn}`,
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
		};
		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));
		navigateTo(
			localePath({
				path: `/client-managers/edit-client-manager/${row.id}`,
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
		};
		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));

		navigateTo(
			localePath({
				path: `/client-managers/view-client-manager/${row.id}`,
			})
		);
	};

	const handleDelete = (row: any) => {
		rowId.value = row.id;
		dialogVisible.value = true;
	};

	const dialogOkClick = (value: any) => {
		dialogVisible.value = value;
	};

	const deleteApi = async () => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch(`/client-account-managers/${rowId.value}`, {
				method: "DELETE",
			});

			useToast("success", res.message);
			dialogVisible.value = false;
			getClientManagerLisitngData(currentPage.value, perPage.value, searchValue.value, sortOrder.value, sortColumn.value);
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};
</script>
<template>
	<div v-loading="fullscreenLoading">
		<BaseDataTable
			id="client_manager"
			:table-data="tableData"
			:table-column="tableColumn"
			:total="total"
			:status="true"
			:edit-icon="true"
			:stripe="true"
			:add-button="true"
			:name="$t('buttons.manager')"
			@handale-current-change="getClientManagerLisitngData"
			@handale-size-change="getClientManagerLisitngData"
			@handale-sort-change="getClientManagerLisitngData"
			@handle-edit="handleEdit"
			@handle-delete="handleDelete"
			@handle-view="handleView"
			@search-value="getClientManagerLisitngData"
		/>
		<BaseDeleteModal v-if="dialogVisible === true" :dialog-visible="dialogVisible" :delete-api="deleteApi" @dialog-ok-click="dialogOkClick" />
	</div>
</template>
