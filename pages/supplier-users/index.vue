<script setup lang="ts">
	import { sidebarItemClear } from "../../helper/sidebarItemClear";
	import { supplierStore } from "~/store/supplier";
	import { sidebarItemStore } from "~/store/sidebarItem";
	import { useAuthStore } from "~/store/auth";

	definePageMeta({
		middleware: ["auth", "is-supplier-client-admin"],
	});

	useHead({
		title: "Supplier Users",
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
	const store = supplierStore();
	const dialogVisible = ref(false);
	const rowId = ref("");
	// const storeData = dropdownSelectedData();
	const supplierAdminId = ref("");
	const sidebarStore = sidebarItemStore();
	const authStore = useAuthStore();

	interface Item {
		mobile: Number;
		mobile_country_code: String;
	}

	const formatterMobile = (row: Item) => {
		return `${"(".concat(`${row?.mobile_country_code}`).concat(")")}`.concat(`${row?.mobile}`);
	};

	const tableColumn = ref([
		{
			columnName: "full_name",
			columnLabel: t("columnLabels.full_name"),
			width: "230",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "department",
			columnLabel: t("columnLabels.department"),
			width: "200",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "job_title",
			columnLabel: t("columnLabels.job_title"),
			width: "200",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "email",
			columnLabel: t("columnLabels.email"),
			width: "200",
			sorting: true,
		},
		{
			columnName: "mobile",
			columnLabel: t("columnLabels.contact_number"),
			width: "200",
			sorting: true,
			formatter: formatterMobile,
		},
	]);

	onMounted(async () => {
		const supplier_admin_id = useCookie("supplier_admin_id");
		supplierAdminId.value = supplier_admin_id.value || "";
		currentPage.value = route.query.page ? +route.query.page : 1;
		perPage.value = route.query.perPage ? +route.query.perPage : 10;
		searchValue.value = route.query.searchValue ? route?.query?.searchValue : "";
		sortOrder.value = route.query.sortOrder ? route.query.sortOrder : "";
		sortColumn.value = route.query.sortColumn ? route.query.sortColumn : "";
		await getSupplierUserLisitngData(currentPage.value, perPage.value, searchValue.value, sortOrder.value, sortColumn.value);
	});

	const getSupplierUserLisitngData = async (currentPage: any, perPage: any, searchValue: any, sortOrder: any, sortColumn: any) => {
		try {
			const supplier_admin_id = useCookie("supplier_admin_id");
			supplier_admin_id.value = route.query?.supplier_admin_id || supplierAdminId.value;

			navigateTo(
				localePath({
					path: route.fullPath,
					query: {
						page: currentPage,
						perPage,
						searchValue,
						sortOrder,
						sortColumn,
						supplier_admin_id: route?.query?.supplier_admin_id || supplierAdminId.value,
					},
				}),
				{ replace: true }
			);

			fullscreenLoading.value = true;
			searchValue = encodeURIComponent(searchValue);

			const res: any = await useApiFetch(
				`/supplier-users?page=${currentPage}&perPage=${perPage}&searchValue=${searchValue}&sortOrder=${sortOrder}&sortColumn=${sortColumn}&supplier_admin_id=${
					route.query?.supplier_admin_id || supplierAdminId.value
				}`,
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
		store.setActiveTab("supplier-user");
		//   storeData.setCountry(row.new_sup_country_id);

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
				path: `/supplier-users/edit-supplier-user/${row.id}`,
				query: { page: "edit" },
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
			const res: any = await useApiFetch(`/supplier-users/${rowId.value}`, {
				method: "DELETE",
			});

			useToast("success", res.message);
			dialogVisible.value = false;
			getSupplierUserLisitngData(currentPage.value, perPage.value, searchValue.value, sortOrder.value, sortColumn.value);
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};
	const handlePreview = (row: any) => {
		navigateTo(
			localePath({
				path: `/supplier-users/view-supplier-user/${row.id}`,
				query: { page: "view" },
			})
		);
	};

	const getRolId = computed(() => {
		if (authStore.getRoleId === "supplier_admin") {
			return false;
		} else {
			return true;
		}
	});

	const addButton = computed(() => {
		if (total.value < 2) {
			return true;
		} else {
			return false;
		}
	});
</script>
<template>
	<div class="h-full overflow-hidden" v-loading="fullscreenLoading">
		<BaseDataTable
			id="supplier_user"
			:table-data="tableData"
			:table-column="tableColumn"
			:total="total"
			:status="false"
			:edit-icon="hasPermissionTo('suppliers-user-edit')"
			:preview-btn="true"
			:stripe="true"
			:add-button="addButton && hasPermissionTo('suppliers-user-create')"
			:delete-btn="false"
			:cancnovok-button="getRolId"
			:name="$t('buttons.supplier-user')"
			@handale-current-change="getSupplierUserLisitngData"
			@handale-size-change="getSupplierUserLisitngData"
			@handale-sort-change="getSupplierUserLisitngData"
			@handle-edit="handleEdit"
			@handle-delete="handleDelete"
			@handle-view="handlePreview"
			@search-value="getSupplierUserLisitngData"
		/>
		<BaseDeleteModal v-if="dialogVisible === true" :dialog-visible="dialogVisible" :delete-api="deleteApi" @dialog-ok-click="dialogOkClick" />
	</div>
</template>
