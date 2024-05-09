<script setup lang="ts">
	import moment from "moment";
	import { sidebarItemStore } from "../../store/sidebarItem";
	import { sidebarItemClear } from "../../helper/sidebarItemClear";
	import { useAuthStore } from "~/store/auth";
	import { useProfileStore } from "~/store/profile";

	definePageMeta({
		middleware: ["auth", "is-super-user"],
	});

	useHead({
		title: "Client Admin",
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
	const sidebarStore = sidebarItemStore();
	const localePath = useLocalePath();
	const { t } = useI18n();
	const dialogVisible = ref(false);
	const rowId = ref("");
	const authStore = useAuthStore();
	const profileStore = useProfileStore();

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
			width: "180",
			sorting: true,
			formatter,
		},
		{
			columnName: "subscription_stripe_status",
			columnLabel: t("columnLabels.subscription_stripe_status"),
			width: "180",
			sorting: true,
		},
	]);

	onMounted(async () => {
		await fetchClients();
	});

	const fetchClients = async () => {
		currentPage.value = route.query.page ? +route.query.page : 1;
		perPage.value = route.query.perPage ? +route.query.perPage : 10;
		searchValue.value = route.query.searchValue ? route?.query?.searchValue : "";
		sortOrder.value = route.query.sortOrder ? route.query.sortOrder : "";
		sortColumn.value = route.query.sortColumn ? route.query.sortColumn : "";
		await getClientAdminLisitngData(currentPage.value, perPage.value, searchValue.value, sortOrder.value, sortColumn.value);
	};

	const getClientAdminLisitngData = async (currentPage: any, perPage: any, searchValue: any, sortOrder: any, sortColumn: any) => {
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
				`/client-admins?page=${currentPage}&perPage=${perPage}&searchValue=${searchValue}&sortOrder=${sortOrder}&sortColumn=${sortColumn}`,
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

	// const handleViewClientUser = (row: any) => {
	//   const pageDetails = {
	//     page: route.query?.page,
	//     perPage: route.query?.perPage,
	//     searchValue: route.query?.searchValue,
	//     sortOrder: route.query?.sortOrder,
	//     sortColumn: route.query?.sortColumn,
	//   };
	//   sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));
	//   sessionStorage.setItem("client_admin_id", row.id);
	//   sidebarStore.setActiveSidebarItem("8"); // client user
	//   sidebarStore.setSidebarItem("8"); // 8 -> client user
	//   navigateTo(
	//     localePath({
	//       path: "/client-users",
	//       query: { client_admin_id: row.id },
	//     })
	//   );
	// };

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
				path: `/client-admins/edit-client-admin/${row.id}`,
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
				path: `/client-admins/view-client-admin/${row.id}`,
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
			const res: any = await useApiFetch(`/client-admins/${rowId.value}`, {
				method: "DELETE",
			});

			useToast("success", res.message);
			dialogVisible.value = false;
			getClientAdminLisitngData(currentPage.value, perPage.value, searchValue.value, sortOrder.value, sortColumn.value);
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const handleClientAdminRetry = async (row: any) => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch(`/client-admins/${row.id}/recreate-tenant-db`, {
				method: "POST",
				body: {},
			});

			fetchClients();
			useToast("success", res.message);
		} catch {
		} finally {
			fullscreenLoading.value = false;
			setTimeout(() => {
				fetchClients();
			}, 10000);
		}
	};

	const handleClientAdminSubscriptionRenewal = async (row: any) => {
		try {

			fullscreenLoading.value = true;
			const res: any = await useApiFetch(`/renew-subscription`, {
				method: "POST",
				body: {
					master_user_detail_id: row?.id,
				},
			});

			useToast("success", res.message);
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const handleClientAdminAccess = async (row: any) => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch(`/client-admin-layout`, {
				method: "POST",
				body: {
					client_admin_id: row?.id,
				},
			});

			sessionStorage.setItem("client_admin_id", res?.data?.client_admin_id);
			//  4 is client admin role id
			authStore.setRoleId(4);
			const roleId = useCookie("role_id");
			roleId.value = authStore.getRoleId;

			profileStore.setCompanyLogo(row?.company_logo);
			// sidebarStore.setSidebarItem("1"); // 1-dashboard
			// sidebarStore.setActiveSidebarItem("1");
			// navigateTo(localePath("/dashboard"));
			navigateTo(localePath("/account-switch"));
			useToast("success", res?.message);
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};
</script>
<template>
	<div v-loading="fullscreenLoading">
		<BaseDataTable
			id="client_admin"
			:table-data="tableData"
			:table-column="tableColumn"
			:total="total"
			:status="true"
			:edit-icon="true"
			:stripe="true"
			:add-button="authStore.role_id !== 'client_account_manager'"
			:image-column="true"
			:client-admin-retry="true"
			:client-admin-access="true"
			:name="$t('buttons.client_admin')"
			@handale-current-change="getClientAdminLisitngData"
			@handale-size-change="getClientAdminLisitngData"
			@handale-sort-change="getClientAdminLisitngData"
			@handle-edit="handleEdit"
			@handle-delete="handleDelete"
			@handle-view="handleView"
			@search-value="getClientAdminLisitngData"
			@handle-client-admin-retry="handleClientAdminRetry"
			@handle-client-admin-access="handleClientAdminAccess"
			@handle-client-admin-subscription-renewal="handleClientAdminSubscriptionRenewal"
		/>
		<BaseDeleteModal v-if="dialogVisible === true" :dialog-visible="dialogVisible" :delete-api="deleteApi" @dialog-ok-click="dialogOkClick" />
	</div>
</template>
