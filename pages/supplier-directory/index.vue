<script setup lang="ts">
	import moment from "moment";
	import { sidebarItemClear } from "../../helper/sidebarItemClear";
	definePageMeta({
		middleware: ["auth", "is-super-admin"],
	});

	useHead({
		title: "Supplier Directory",
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
		mobile: Number;
		mobile_country_code: String;
		preferred_langauge: String;
		account_activation_date: String;
	}

	const formatter = (row: Item) => {
		return moment(`${row.account_activation_date}`).format("DD/MM/YYYY");
	};

	const formatterMobile = (row: Item) => {
		return row?.mobile ? `${"(".concat(`${row?.mobile_country_code}`).concat(")")}`.concat(`${row?.mobile}`) : "-";
	};

	const formatterlang = (row: Item) => {
		return row.preferred_langauge ? row.preferred_langauge : "-";
	};

	const tableColumn = ref([
		{
			columnName: "company_name",
			columnLabel: t("columnLabels.reg_company_name"),
			sorting: true,
			width: "210",
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
			columnName: "sup_ref_number",
			columnLabel: t("columnLabels.ref_number"),
			width: "160",
			sorting: true,
		},
		{
			columnName: "full_name",
			columnLabel: t("columnLabels.full_name"),
			width: "140",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		// {
		//   columnName: "new_sup_role",
		//   columnLabel: t("columnLabels.role"),
		//   width: "200",
		//   sorting: true,
		//   customCellClass:"cellTruncate",
		// },
		{
			columnName: "email",
			columnLabel: t("columnLabels.email"),
			width: "120",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "mobile",
			columnLabel: t("columnLabels.contact_number"),
			width: "170",
			sorting: true,
			formatter: formatterMobile,
		},
		{
			columnName: "currency",
			columnLabel: t("columnLabels.currency"),
			width: "130",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "category",
			columnLabel: t("columnLabels.category"),
			width: "140",
			sorting: true,
			customCellClass: "cellTruncate",
		},
	]);

	onMounted(async () => {
		currentPage.value = route.query.page ? +route.query.page : 1;
		perPage.value = route.query.perPage ? +route.query.perPage : 10;
		searchValue.value = route.query.searchValue ? route?.query?.searchValue : "";
		sortOrder.value = route.query.sortOrder ? route.query.sortOrder : "";
		sortColumn.value = route.query.sortColumn ? route.query.sortColumn : "";
		await getSupplierDirectoryLisitngData(currentPage.value, perPage.value, searchValue.value, sortOrder.value, sortColumn.value);
	});

	const getSupplierDirectoryLisitngData = async (currentPage: any, perPage: any, searchValue: any, sortOrder: any, sortColumn: any) => {
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
				`/supplier-marketplace?page=${currentPage}&perPage=${perPage}&searchValue=${searchValue}&sortOrder=${sortOrder}&sortColumn=${sortColumn}`,
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
				path: `/supplier-directory/edit-supplier-directory/${row.id}`,
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
				path: `/supplier-directory/view-supplier-directory/${row.id}`,
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
</script>
<template>
	<div class="h-full overflow-hidden" v-loading="fullscreenLoading">
		<BaseDataTable
			id="supplier_directory"
			:table-data="tableData"
			:table-column="tableColumn"
			:total="total"
			:edit-icon="false"
			:stripe="true"
			:add-button="false"
			:delete-btn="false"
			:image-column="true"
			:name="$t('buttons.super_user')"
			@handale-current-change="getSupplierDirectoryLisitngData"
			@handale-size-change="getSupplierDirectoryLisitngData"
			@handale-sort-change="getSupplierDirectoryLisitngData"
			@handle-edit="handleEdit"
			@handle-delete="handleDelete"
			@handle-view="handleView"
			@search-value="getSupplierDirectoryLisitngData"
		/>
	</div>
</template>
