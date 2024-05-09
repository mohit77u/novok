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
		title: "Quotation Tender",
	});

	const route = useRoute();
	const tableData = ref<any>([]);
	const total = ref<any>(0);
	const currentPage = ref<any>(1);
	const perPage = ref<any>(10);
	const searchValue = ref<any>("");
	const sortOrder = ref<any>("");
	const sortColumn = ref<any>("");
	const timezone = ref<any>("");
	const signingEntity = ref<any>("");

	const fullscreenLoading = ref(true);
	const sidebarStore = sidebarItemStore();
	const localePath = useLocalePath();
	const { t } = useI18n();
	const dialogVisible = ref(false);
	const rowId = ref("");
	const authStore = useAuthStore();
	const profileStore = useProfileStore();
	const projectOwnerSearch = ref("");
	const resourceData = ref([]);

	interface Item {
		open_date: String;
		close_date: String;
		open_time: String;
		close_time: String;
	}

	const formatter = (row: Item) => {
		const datetime = row.open_date + " " + row.open_time;
		return row.open_date ? moment(`${datetime}`).format("DD/MM/YYYY hh:mm A") : "-";
	};

	const formatterCloseDate = (row: Item) => {
		const datetime = row.close_date + " " + row.close_time;
		return row.close_date ? moment(`${datetime}`).format("DD/MM/YYYY  hh:mm A") : "-";
	};

	const tableColumn = ref([
		{
			columnName: "qt_code",
			columnLabel: t("columnLabels.qt_code"),
			width: "190",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "project_code",
			columnLabel: t("columnLabels.project_number"),
			width: "150",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "project_owner",
			columnLabel: t("columnLabels.project_owner"),
			width: "150",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "sub_entity_name",
			columnLabel: t("columnLabels.signing_entity"),
			width: "150",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "authoriser_name",
			columnLabel: t("columnLabels.authoriser_name"),
			width: "170",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "title",
			columnLabel: t("columnLabels.title"),
			width: "150",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "open_date",
			columnLabel: t("columnLabels.open_date"),
			width: "200",
			sorting: true,
			customCellClass: "cellTruncate",
			formatter: formatter,
		},

		{
			columnName: "close_date",
			columnLabel: t("columnLabels.close_date"),
			width: "200",
			sorting: true,
			customCellClass: "cellTruncate",
			formatter: formatterCloseDate,
		},
	]);

	const getAuthData = computed(() => {
		timezone.value = profileStore.profileData.user_detail?.timezone;
		return profileStore.profileData.user_detail;
	});

	onMounted(async () => {
		await getResourceData();
		await fetchList();
	});

	const fetchList = async () => {
		currentPage.value = route.query.page ? +route.query.page : 1;
		perPage.value = route.query.perPage ? +route.query.perPage : 10;
		searchValue.value = route.query.searchValue ? route?.query?.searchValue : "";
		sortOrder.value = route.query.sortOrder ? route.query.sortOrder : "";
		sortColumn.value = route.query.sortColumn ? route.query.sortColumn : "";
		signingEntity.value = route.query.signingEntity ? route.query.signingEntity : "";

		// timezone.value = profileStore.profileData.user_detail?.timezone || "Europe/London";

		await getQTData(
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
			null,
			null,
			signingEntity.value
		);
	};

	const getQTData = async (
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
						signingEntity,
					},
				}),
				{ replace: true }
			);

			fullscreenLoading.value = true;
			searchValue = encodeURIComponent(searchValue);

			const res: any = await useApiFetch(
				`/tenders?page=${currentPage}&perPage=${perPage}&searchValue=${searchValue}&sortOrder=${sortOrder}&sortColumn=${sortColumn}&signingEntity=${signingEntity}&timezone=${
					timezone.value || "Europe/London"
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

	watch(getAuthData, async (newValue, oldValue) => {
		// Call your API with the updated value
		await fetchList();
	});

	const handleEdit = (row: any) => {
		const pageDetails = {
			page: route.query?.page,
			perPage: route.query?.perPage,
			searchValue: route.query?.searchValue,
			sortOrder: route.query?.sortOrder,
			sortColumn: route.query?.sortColumn,
			signingEntity: route.query?.signingEntity,
			// timezone: route.query?.timezone,
		};
		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));
		sessionStorage.setItem("redirectFrom", "edit");
		navigateTo(
			localePath({
				path: `/quotations-tender/q-t/edit-qt/${row.id}`,
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
			signingEntity: route.query?.signingEntity,
			// timezone: route.query?.timezone,
		};
		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));
		sessionStorage.setItem("redirectFrom", "view");
		navigateTo(
			localePath({
				path: `/quotations-tender/q-t/view-qt/${row.id}`,
			})
		);
	};

	const statusChangeApi = async (id: any, status: any, formData: any) => {
		fullscreenLoading.value = true;
		const data = { ...formData, tender_status: status };
		try {
			const res: any = await useApiFetch(`/tenders/${id}/change-status`, {
				method: "PATCH",
				body: data,
			});
			useToast("success", res.message);
			fullscreenLoading.value = false;
			fetchList();
		} catch {
			fullscreenLoading.value = false;
		}
	};

	// const handleDelete = (row: any) => {
	// 	rowId.value = row.id;
	// 	dialogVisible.value = true;
	// };

	// const dialogOkClick = (value: any) => {
	// 	dialogVisible.value = value;
	// };

	// const deleteApi = async () => {
	// 	try {
	// 		fullscreenLoading.value = true;
	// 		const res: any = await useApiFetch(`/client-admins/${rowId.value}`, {
	// 			method: "DELETE",
	// 		});

	// 		useToast("success", res.message);
	// 		dialogVisible.value = false;
	// 		getRequestData(currentPage.value, perPage.value, searchValue.value, sortOrder.value, sortColumn.value);
	// 	} catch {
	// 	} finally {
	// 		fullscreenLoading.value = false;
	// 	}
	// };

	const getResourceData = async () => {
		fullscreenLoading.value = true;
		try {
			const res: any = await useApiFetch(`/resources?folderType=3`, {
				method: "GET",
			});
			resourceData.value = res.data?.data;
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};
</script>
<template>
	<div v-loading="fullscreenLoading">
		<div v-if="fullscreenLoading" class="min-h-[500px]"></div>
		<BaseDataTable
			v-else
			id="quotation_tender"
			:table-data="tableData"
			:table-column="tableColumn"
			:total="total"
			:edit-icon="hasPermissionTo('tender-edit')"
			:stripe="true"
			:add-button="hasPermissionTo('tender-create')"
			:is-qt-status="true"
			:name="$t('buttons.quotation_tender')"
			:qt-resource-data="resourceData"
			@handale-current-change="getQTData"
			@handale-size-change="getQTData"
			@handale-sort-change="getQTData"
			@handle-edit="handleEdit"
			@handle-view="handleView"
			@search-value="getQTData"
			@request-filtered-data="getQTData"
			@qt-reject-status="statusChangeApi"
			@qt-approve-status="statusChangeApi"
			@qt-filtered-data="getQTData"
            @notifyClientAdmin="getQTData"
		/>

		<!-- <BaseDeleteModal v-if="dialogVisible === true" :dialog-visible="dialogVisible" :delete-api="deleteApi" @dialog-ok-click="dialogOkClick" /> -->
	</div>
</template>
