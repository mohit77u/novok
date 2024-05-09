<script setup lang="ts">
	import moment from "moment";

	definePageMeta({
		middleware: ["auth", "is-super-admin"],
	});

	useHead({
		title: "BS Client Database",
	});

	const localePath = useLocalePath();
	const route = useRoute();
	const tableData = ref<any>([]);
	const total = ref<any>(0);
	const currentPage = ref<any>(1);
	const perPage = ref<any>(10);
	const searchValue = ref<any>("");
	const sortOrder = ref<any>("");
	const sortColumn = ref<any>("");
	const fullscreenLoading = ref(false);

	const { t } = useI18n();
	const dialogVisible = ref(false);
	const rowId = ref("");

	interface Item {
		first_name: string;
		last_name: string;
		status: Number;
		mobile_number: Number;
		country_code: String;
		company_address: String;
		account_activation_date: String;
		preferred_langauge: String;
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
		{
			columnName: "company_name",
			columnLabel: t("columnLabels.reg_company_name"),
			width: "210",
			customCellClass: "cellTruncate",
			sorting: true,
		},
		{
			columnName: "company_number",
			columnLabel: t("columnLabels.reg_company_number"),
			width: "220",
			sorting: true,
		},
		{
			columnName: "full_name",
			columnLabel: t("columnLabels.full_name"),
			width: "160",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "job_title",
			columnLabel: t("columnLabels.job_title"),
			width: "150",
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
			width: "180",
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
			columnName: "preferred_langauge",
			columnLabel: t("columnLabels.preferred_language"),
			width: "200",
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
		currentPage.value = route.query.page ? +route.query.page : 1;
		perPage.value = route.query.perPage ? +route.query.perPage : 10;
		searchValue.value = route.query.searchValue ? route?.query?.searchValue : "";
		sortOrder.value = route.query.sortOrder ? route.query.sortOrder : "";
		sortColumn.value = route.query.sortColumn ? route.query.sortColumn : "";
		await getSuperAdminLisitngData(currentPage.value, perPage.value, searchValue.value, sortOrder.value, sortColumn.value);
	});

	const getSuperAdminLisitngData = async (currentPage: any, perPage: any, searchValue: any, sortOrder: any, sortColumn: any) => {
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
				`/super-users?page=${currentPage}&perPage=${perPage}&searchValue=${searchValue}&sortOrder=${sortOrder}&sortColumn=${sortColumn}`,
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
				path: `/super-admin/edit-super-user/${row.id}`,
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
				path: `/super-admin/view-super-user/${row.id}`,
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
			const res: any = await useApiFetch(`/super-users/${rowId.value}`, {
				method: "DELETE",
			});

			useToast("success", res.message);
			dialogVisible.value = false;
			getSuperAdminLisitngData(currentPage.value, perPage.value, searchValue.value, sortOrder.value, sortColumn.value);
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};
</script>
<template>
	<div class="h-full overflow-hidden" v-loading="fullscreenLoading">
		<BaseDataTable
			id="super_user"
			:table-data="tableData"
			:table-column="tableColumn"
			:total="total"
			:status="true"
			:edit-icon="true"
			:stripe="true"
			:add-button="true"
			:delete-btn="false"
			:image-column="true"
			:name="$t('buttons.super_user')"
			@handale-current-change="getSuperAdminLisitngData"
			@handale-size-change="getSuperAdminLisitngData"
			@handale-sort-change="getSuperAdminLisitngData"
			@handle-edit="handleEdit"
			@handle-delete="handleDelete"
			@handle-view="handleView"
			@search-value="getSuperAdminLisitngData"
		/>
		<BaseDeleteModal v-if="dialogVisible === true" :dialog-visible="dialogVisible" :delete-api="deleteApi" @dialog-ok-click="dialogOkClick" />
	</div>
</template>
