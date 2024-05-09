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

	const fullscreenLoading = ref(false);
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
		submission_status: Number;
	}

	const formatter = (row: Item) => {
		const datetime = row.open_date + " " + row.open_time;
		return row.open_date ? moment(`${datetime}`).format("DD/MM/YYYY hh:mm A") : "-";
	};

	const formatterCloseDate = (row: Item) => {
		const datetime = row.close_date + " " + row.close_time;
		return row.close_date ? moment(`${datetime}`).format("DD/MM/YYYY  hh:mm A") : "-";
	};

	const formatterSubmissionStatus = (row: Item) => {
		return row.submission_status === 0 ? "New" : row.submission_status === 1 ? "Draft" : "Submitted";
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

		{
			columnName: "submission_status",
			columnLabel: t("columnLabels.submission_status"),
			width: "200",
			sorting: true,
			customCellClass: "cellTruncate",
			formatter: formatterSubmissionStatus,
		},
	]);

	onMounted(async () => {
		await fetchList();
		// await getResourceData();
	});

	const fetchList = async () => {
		currentPage.value = route.query.page ? +route.query.page : 1;
		perPage.value = route.query.perPage ? +route.query.perPage : 10;
		searchValue.value = route.query.searchValue ? route?.query?.searchValue : "";
		sortOrder.value = route.query.sortOrder ? route.query.sortOrder : "";
		sortColumn.value = route.query.sortColumn ? route.query.sortColumn : "";
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
			null
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
		requestStatus: any
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
					},
				}),
				{ replace: true }
			);

			fullscreenLoading.value = true;
			searchValue = encodeURIComponent(searchValue);

			const res: any = await useApiFetch(
				`/tender-quotations?page=${currentPage}&perPage=${perPage}&searchValue=${searchValue}&sortOrder=${sortOrder}&sortColumn=${sortColumn}&timezone=${
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

	const getAuthData = computed(() => {
		timezone.value = profileStore.profileData.user_detail?.timezone;
		return profileStore.profileData.user_detail;
	});

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
			// timezone: route.query?.timezone,
		};
		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));
		sessionStorage.setItem("redirectFrom", "edit");
		navigateTo(
			localePath({
				path: `/quotations-tender/supplier-q-t/edit-supplier-q-t/${row.id}`,
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
			// timezone: route.query?.timezone,
		};
		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));
		sessionStorage.setItem("redirectFrom", "view");
		navigateTo(
			localePath({
				path: `/quotations-tender/supplier-q-t/view-supplier-q-t/${row.id}`,
			})
		);
	};
</script>
<template>
	<div v-loading="fullscreenLoading">
		<BaseDataTable
			id="supplier_quotations_tender"
			:table-data="tableData"
			:table-column="tableColumn"
			:total="total"
			:edit-icon="true"
			:stripe="true"
			:add-button="false"
			:is-qt-status="true"
			:name="$t('buttons.supplier_quotation_tender')"
			:qt-resource-data="resourceData"
			@handale-current-change="getQTData"
			@handale-size-change="getQTData"
			@handale-sort-change="getQTData"
			@handle-edit="handleEdit"
			@handle-view="handleView"
			@search-value="getQTData"
			@request-filtered-data="getQTData"
		/>
		<!-- <BaseDeleteModal v-if="dialogVisible === true" :dialog-visible="dialogVisible" :delete-api="deleteApi" @dialog-ok-click="dialogOkClick" /> -->
	</div>
</template>
