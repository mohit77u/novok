<script setup lang="ts">
	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});

	useHead({
		title: "Roles And Permissions",
	});

	const localePath = useLocalePath();
	const { t } = useI18n();
	const tableData = ref<any>([]);
	const debounceId = ref<any>(null);
	const fullscreenLoading = ref(false);
	const route = useRoute();
	const total = ref<any>(0);
	const currentPage = ref<any>(1);
	const perPage = ref<any>(10);
	const searchValue = ref<any>("");
	const sortOrder = ref<any>("");
	const sortColumn = ref<any>("");

	const tableColumn = ref([
		// {
		// 	columnName: "id",
		// 	columnLabel: t("columnLabels.id"),
		// 	width: "100",
		// 	sorting: true,
		// 	customCellClass: "cellTruncate",
		// },
		// {
		// 	columnName: "name",
		// 	columnLabel: t("columnLabels.user_role"),
		// 	width: "100",
		// 	sorting: true,
		// 	customCellClass: "cellTruncate",
		// },
	]);

	onMounted(() => {
		fetchList();
	});

	const fetchList = () => {
		currentPage.value = route.query.page ? +route.query.page : 1;
		perPage.value = route.query.perPage ? +route.query.perPage : 10;
		searchValue.value = route.query.searchValue ? route?.query?.searchValue : "";
		sortOrder.value = route.query.sortOrder ? route.query.sortOrder : "";
		sortColumn.value = route.query.sortColumn ? route.query.sortColumn : "";
		getListOfUserRoles(currentPage.value, perPage.value, searchValue.value, sortOrder.value, sortColumn.value);
	};

	const getListOfUserRoles = async (currentPage: any, perPage: any, searchValue: any, sortOrder: any, sortColumn: any) => {
		fullscreenLoading.value = true;
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
		try {
			const res: any = await useApiFetch(
				`/access-roles?page=${currentPage}&perPage=${perPage}&searchValue=${searchValue}&sortOrder=${sortOrder}&sortColumn=${sortColumn}`,
				{
					method: "GET",
				}
			);
			tableData.value = res.data?.data;
			total.value = res.data?.total;
			fullscreenLoading.value = false;
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
		};
		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));
		sessionStorage.setItem("redirectFrom", "edit");
		navigateTo(
			localePath({
				path: `/roles-permissions/edit-role/${row.id}`,
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
		sessionStorage.setItem("redirectFrom", "view");
		navigateTo(
			localePath({
				path: `/roles-permissions/view-role/${row.id}`,
			})
		);
	};

	const handleDelete = async (row: any) => {
		fullscreenLoading.value = true;
		try {
			const res: any = await useApiFetch(`/access-roles/${row.id}`, {
				method: "DELETE",
			});
			useToast("success", res.message);
			fullscreenLoading.value = false;
			fetchList();
		} catch {
			fullscreenLoading.value = false;
		}
	};
</script>

<template>
	<div v-loading="fullscreenLoading">
		<BaseDataTable
			id="roles"
			:table-data="tableData"
			:table-column="tableColumn"
			:total="total"
			:edit-icon="hasPermissionTo('role-edit')"
			:stripe="true"
			:add-button="hasPermissionTo('role-create')"
			:is-action-column="false"
			:is-action-column-not-dropdown="true"
			:grid-view="false"
			:delete-btn="hasPermissionTo('role-delete')"
			:user-role-column="true"
			:is-table-only="true"
			:name="$t('buttons.role')"
			@handale-current-change="getListOfUserRoles"
			@handale-size-change="getListOfUserRoles"
			@handale-sort-change="getListOfUserRoles"
			@search-value="getListOfUserRoles"
			@handle-edit="handleEdit"
			@handle-view="handleView"
			@handle-delete="handleDelete"
		/>
	</div>
</template>
