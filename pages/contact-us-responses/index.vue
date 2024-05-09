<!-- eslint-disable camelcase -->
<script setup lang="ts">
	import moment from "moment";
	import { sidebarItemClear } from "../../helper/sidebarItemClear";

	definePageMeta({
		middleware: ["auth", "is-super-admin"],
	});
	useHead({
		title: "Contact Us Inquiries",
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
	const fromDate = ref<any>("");
	const toDate = ref<any>("");
	const isArchived = ref<any>(0);
	const is_archived = ref<any>(1);

	interface Item {
		first_name: string;
		last_name: string;
		mobile_number: Number;
		country_code: String;
		subject: String;
		message: String;
		is_read: Number;
		created_at: String;
		is_existing_user: Number;
	}

	const formatterMobile = (row: Item) => {
		return `${"(".concat(`${row.country_code}`).concat(")")}`.concat(`${row.mobile_number}`);
	};

	const formatterDate = (row: Item) => {
		return moment(`${row.created_at}`).format("DD/MM/YYYY");
	};

	const formatterExisitngUser = (row: Item) => {
		return row.is_existing_user === 1 ? "Yes" : "No";
	};

	const tableColumn = ref([
		{
			columnName: "company_name",
			columnLabel: t("columnLabels.reg_company_name"),
			width: "200",
			sorting: true,
		},
		{
			columnName: "full_name",
			columnLabel: t("columnLabels.full_name"),
			width: "140",
			sorting: true,
		},
		{
			columnName: "email",
			columnLabel: t("columnLabels.email"),
			width: "140",
			sorting: true,
		},
		{
			columnName: "mobile_number",
			columnLabel: t("columnLabels.contact_number"),
			width: "170",
			sorting: true,
			formatter: formatterMobile,
		},
		{
			columnName: "subject",
			columnLabel: t("columnLabels.subject"),
			sorting: true,
			width: "130",
			customCellClass: "cellTruncate",
		},
		{
			columnName: "message",
			columnLabel: t("columnLabels.message"),
			width: "130",
			customCellClass: "cellTruncate",
		},
		{
			columnName: "is_existing_user",
			columnLabel: t("columnLabels.is_existing_user"),
			width: "150",
			sorting: true,
			customCellClass: "cellTruncate",
			formatter: formatterExisitngUser,
		},
		{
			columnName: "created_at",
			columnLabel: t("columnLabels.created_date"),
			width: "150",
			customCellClass: "cellTruncate",
			formatter: formatterDate,
		},
	]);

	const tableRowClassName = ({ row }: { row: Item }) => {
		if (row?.is_read === 1) {
			return "";
		} else {
			return "unread";
		}
	};

	onMounted(async () => {
		currentPage.value = route.query.page ? +route.query.page : 1;
		perPage.value = route.query.perPage ? +route.query.perPage : 10;
		searchValue.value = route.query.searchValue ? route?.query?.searchValue : "";
		sortOrder.value = route.query.sortOrder ? route.query.sortOrder : "";
		sortColumn.value = route.query.sortColumn ? route.query.sortColumn : "";
		fromDate.value = route.query.fromDate ? route.query.fromDate : "";
		toDate.value = route.query.toDate ? route.query.toDate : "";
		isArchived.value = route.query.isArchived ? route.query.isArchived : 0;

		await getContactUsResponseData(
			currentPage.value,
			perPage.value,
			searchValue.value,
			sortOrder.value,
			sortColumn.value,
			fromDate.value,
			toDate.value,
			isArchived.value
		);
	});

	const getContactUsResponseData = async (
		currentPage: any,
		perPage: any,
		searchValue: any,
		sortOrder: any,
		sortColumn: any,
		fromDate: any,
		toDate: any,
		isArchived: any
	) => {
		try {
			navigateTo(
				localePath({
					path: route.fullPath,
					query: { page: currentPage, perPage, searchValue, sortOrder, sortColumn, fromDate, toDate, isArchived },
				}),
				{ replace: true }
			);

			fullscreenLoading.value = true;
			searchValue = encodeURIComponent(searchValue);

			const res: any = await useApiFetch(
				`/contact-us?page=${currentPage}&perPage=${perPage}&searchValue=${searchValue}&sortOrder=${sortOrder}&sortColumn=${sortColumn}&fromDate=${fromDate}&toDate=${toDate}&isArchived=${isArchived}`,
				{
					method: "GET",
				}
			);

			tableData.value = res.data?.data;
			total.value = res.data?.total;
			// is_archived.value = res.data?.data.is_archived;
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const handleView = (row: any) => {
		const pageDetails = {
			page: route.query?.page,
			perPage: route.query?.perPage,
			searchValue: route.query?.searchValue,
			sortOrder: route.query?.sortOrder,
			sortColumn: route.query?.sortColumn,
			fromDate: route.query?.fromDate,
			toDate: route.query?.toDate,
			isArchived: route?.query?.isArchived,
		};
		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));
		navigateTo(
			localePath({
				path: `/contact-us-responses/view-responses/${row.id}`,
			})
		);
	};

	const handleArchvied = async (row: any) => {
		try {
			fullscreenLoading.value = true;

			is_archived.value = route.query.isArchived ? (+route.query.isArchived === 1 ? 0 : 1) : "";
			isArchived.value = route.query?.isArchived || "";
			fromDate.value = route.query?.fromDate ? route.query?.fromDate : "";
			toDate.value = route.query?.toDate ? route.query?.toDate : "";

			const res: any = await useApiFetch(`/contact-us/${row.id}?is_archived=${is_archived.value}`, {
				method: "DELETE",
			});

			useToast("success", res.message);
			getContactUsResponseData(
				currentPage.value,
				perPage.value,
				searchValue.value,
				sortOrder.value,
				sortColumn.value,
				fromDate.value,
				toDate.value,
				isArchived.value
			);
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const exportData = async (filterData: any) => {
		try {
			fullscreenLoading.value = true;
			const isArchivedValue = route.query?.isArchived ? +route.query?.isArchived : 0;
			const res: any = await useApiFetch(`/contact-us/export?isArchived=${isArchivedValue}`, {
				method: "POST",
				body: filterData,
			});

			const link: any = document.createElement("a");
			link.download = "file";
			link.href = res.data.export_link;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			useToast("success", res?.message);
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};
</script>
<template>
	<div class="h-full overflow-hidden" v-loading="fullscreenLoading">
		<BaseDataTable
			id="contact_us_inquiry"
			:table-data="tableData"
			:table-column="tableColumn"
			:total="total"
			:status="false"
			:edit-icon="false"
			:stripe="false"
			:add-button="false"
			:delete-btn="false"
			:export-btn="true"
			:archived-btn="true"
			:filter-option="true"
			:table-row-class-name="tableRowClassName"
			@handale-current-change="getContactUsResponseData"
			@handale-size-change="getContactUsResponseData"
			@handale-sort-change="getContactUsResponseData"
			@search-value="getContactUsResponseData"
			@handle-view="handleView"
			@export-data="exportData"
			@filtered-data="getContactUsResponseData"
			@handle-archvied="handleArchvied"
		/>
	</div>
</template>
