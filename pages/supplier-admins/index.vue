<script setup lang="ts">
	import { sidebarItemClear } from "../../helper/sidebarItemClear";
	import { sidebarItemStore } from "../../store/sidebarItem";
	import { supplierStore } from "~/store/supplier";
	import { dropdownSelectedData } from "~/store/dropdownSelectedData";
	import { maxValue } from "@vuelidate/validators";

	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});

	useHead({
		title: "Suppliers",
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
	const currency = ref<any>("");
	const category = ref<any>("");
	const country = ref<any>("");
	const status = ref<any>("");
	const keySupplier = ref<any>("");

	const fullscreenLoading = ref(false);
	const { t } = useI18n();
	const store = supplierStore();
	const dialogVisible = ref(false);
	const rowId = ref("");
	const storeData = dropdownSelectedData();
	const sidebarStore = sidebarItemStore();

	interface Item {
		mobile: Number;
		key_supplier: Number;
		mobile_country_code: String;
	}

	const formatterMobile = (row: Item) => {
		return row?.mobile ? `${"(".concat(`${row?.mobile_country_code}`).concat(")")}`.concat(`${row?.mobile}`) : "-";
	};

	const keySupplierFormatter = (row: Item) => {
		return row.key_supplier === 0 ? "No" : "Yes";
	};

	const tableColumn = ref([
		{
			columnName: "company_name",
			columnLabel: t("columnLabels.reg_company_name"),
			sorting: true,
			width: "200",
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
			width: "150",
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
		// {
		// 	columnName: "currency",
		// 	columnLabel: t("columnLabels.currency"),
		// 	width: "120",
		// 	sorting: true,
		// 	customCellClass: "cellTruncate",
		// },
		{
			columnName: "category",
			columnLabel: t("columnLabels.category_level_1"),
			width: "170",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "key_supplier",
			columnLabel: t("columnLabels.key_supplier"),
			width: "230",
			sorting: true,
			customCellClass: "cellTruncate",
			formatter: keySupplierFormatter,
		},
	]);

	onMounted(async () => {
		currentPage.value = route.query.page ? +route.query.page : 1;
		perPage.value = route.query.perPage ? +route.query.perPage : 10;
		searchValue.value = route.query.searchValue ? route?.query?.searchValue : "";
		sortOrder.value = route.query.sortOrder ? route.query.sortOrder : "";
		sortColumn.value = route.query.sortColumn ? route.query.sortColumn : "";
		currency.value = route.query.currency ? route.query.currency : "";
		category.value = route.query.category ? route.query.category : "";
		country.value = route.query.country ? route.query.country : "";
		status.value = route.query.status ? route.query.status : "";
		keySupplier.value = route.query.key_supplier ? route.query.key_supplier : "";

		await getSuperAdminLisitngData(
			currentPage.value,
			perPage.value,
			searchValue.value,
			sortOrder.value,
			sortColumn.value,
			null,
			null,
			null,
			currency.value,
			category.value,
			country.value,
			status.value,
			keySupplier.value
		);
	});

	const getSuperAdminLisitngData = async (
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
		key_supplier: any
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
						fromDate,
						toDate,
						isArchived,
						currency,
						category,
						country,
						status,
						key_supplier,
					},
				}),
				{ replace: true }
			);

			fullscreenLoading.value = true;
			searchValue = encodeURIComponent(searchValue);

			const res: any = await useApiFetch(
				`/supplier-admins?page=${currentPage}&perPage=${perPage}&searchValue=${searchValue}&sortOrder=${sortOrder}&sortColumn=${sortColumn}&currency=${currency}&category=${category}&country=${country}&status=${status}&key_supplier=${key_supplier}`,
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
		store.setActiveTab("primary-details");
		storeData.setCountry(row.new_sup_country_id);

		const pageDetails = {
			page: route.query?.page,
			perPage: route.query?.perPage,
			searchValue: route.query?.searchValue,
			sortOrder: route.query?.sortOrder,
			sortColumn: route.query?.sortColumn,
			currency: route.query?.currency,
			category: route.query?.category,
			country: route.query?.country,
			status: route.query?.status,
		};
		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));
		navigateTo(
			localePath({
				path: `/supplier-admins/edit-supplier-admin/${row.id}`,
			})
		);
	};

	const dialogOkClick = (value: any) => {
		dialogVisible.value = value;
	};

	const handleDelete = (row: any) => {
		rowId.value = row.id;
		dialogVisible.value = true;
	};
	const deleteApi = async () => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch(`/supplier-admins/${rowId.value}`, {
				method: "DELETE",
			});

			useToast("success", res.message);
			dialogVisible.value = false;
			getSuperAdminLisitngData(
				currentPage.value,
				perPage.value,
				searchValue.value,
				sortOrder.value,
				sortColumn.value,
				null,
				null,
				null,
				currency.value,
				category.value,
				country.value,
				status.value,
				keySupplier.value
			);
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};
	const handlePreview = (row: any) => {
		const pageDetails = {
			page: route.query?.page,
			perPage: route.query?.perPage,
			searchValue: route.query?.searchValue,
			sortOrder: route.query?.sortOrder,
			sortColumn: route.query?.sortColumn,
			currency: route.query?.currency,
			category: route.query?.category,
			country: route.query?.country,
			status: route.query?.status,
		};
		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));
		navigateTo(
			localePath({
				path: `/supplier-admins/view-supplier-admin/${row.id}`,
				query: { page: "view" },
			})
		);
	};

	const supplierUserClick = (row: any) => {
		const pageDetails = {
			page: route.query?.page,
			perPage: route.query?.perPage,
			searchValue: route.query?.searchValue,
			sortOrder: route.query?.sortOrder,
			sortColumn: route.query?.sortColumn,
			currency: route.query?.currency,
			category: route.query?.category,
			country: route.query?.country,
			status: route.query?.status,
		};
		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));
		const supplier_admin_id = useCookie("supplier_admin_id");
		supplier_admin_id.value = row.tenant_user_detail_id;
		sidebarStore.setActiveSidebarItem("12"); // supplier  user
		sidebarStore.setSidebarItem("12"); //  12-> supplier user
		navigateTo(localePath("/supplier-users"));
	};

	const bulkUploadSuppliers = () => {
		navigateTo(localePath("/supplier-admins/bulk-upload"));
	};

	const supplierStatus = async (id: any, value: any, formData: any) => {
		fullscreenLoading.value = true;
		// const data = {
		// 	status: value,
		// 	reason: formData?.reason,
		// };
		const data = { status: value, ...formData };
		try {
			const res: any = await useApiFetch(`/supplier-admins/${id}/change-status`, {
				method: "POST",
				body: data,
			});
			fullscreenLoading.value = false;
			useToast("success", res.message);
			getSuperAdminLisitngData(
				currentPage.value,
				perPage.value,
				searchValue.value,
				sortOrder.value,
				sortColumn.value,
				null,
				null,
				null,
				currency.value,
				category.value,
				country.value,
				status.value,
				keySupplier.value
			);
		} catch {
			fullscreenLoading.value = false;
		}
	};

	const supplierExport = async (data: any) => {
		fullscreenLoading.value = true;
		try {
			const res: any = await useApiFetch(`/supplier-admins/export`, {
				method: "POST",
				body: data,
			});
			useToast("success", res.message);
			fullscreenLoading.value = false;
			var a = document.createElement("a");
			a.href = res.data?.export_link;
			a.download = "SupplierAdmin.csv";
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
		<BaseDataTable
			id="supplier"
			:table-data="tableData"
			:table-column="tableColumn"
			:total="total"
			:status="false"
			:edit-icon="hasPermissionTo('suppliers-admin-edit')"
			:preview-btn="true"
			:stripe="true"
			:add-button="hasPermissionTo('suppliers-admin-create')"
			:delete-btn="false"
			:image-column="true"
			:supplier-user-icon="hasPermissionTo('suppliers-user-view-all') || hasPermissionTo('suppliers-user-view')"
			:supplier-filter="true"
			:is-bulk-upload="hasPermissionTo('suppliers-admin-create')"
			:is-supplier-invite-email="hasPermissionTo('suppliers-admin-create')"
			:supplier-status="true"
			:name="$t('buttons.supplier')"
			@handale-current-change="getSuperAdminLisitngData"
			@handale-size-change="getSuperAdminLisitngData"
			@handale-sort-change="getSuperAdminLisitngData"
			@handle-edit="handleEdit"
			@handle-delete="handleDelete"
			@handle-view="handlePreview"
			@search-value="getSuperAdminLisitngData"
			@handle-supplier-user="supplierUserClick"
			@supplier-filtered-data="getSuperAdminLisitngData"
			@reset-filter="getSuperAdminLisitngData"
			@bulk-upload-suppliers="bulkUploadSuppliers"
			@supplier-status="supplierStatus"
			@export-data="supplierExport"
		/>
		<BaseDeleteModal v-if="dialogVisible === true" :dialog-visible="dialogVisible" :delete-api="deleteApi" @dialog-ok-click="dialogOkClick" />
	</div>
</template>
