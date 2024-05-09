<script setup lang="ts">
	import moment from "moment";
	import { sidebarItemStore } from "~/store/sidebarItem";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import { useAuthStore } from "~/store/auth";
	import { useProfileStore } from "~/store/profile";

	definePageMeta({
		middleware: ["auth"],
	});

	useHead({
		title: "Quotation Tender Responses",
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
	const authStore = useAuthStore();
	const profileStore = useProfileStore();
	const tenderData = ref<any>([]);

	interface Item {
		submission_status: Number;
	}

	const formatterSubmissionStatus = (row: Item) => {
		return row.submission_status === 2 ? "Submitted" : "Not Submitted";
	};
	const tableColumn = ref([
		{
			columnName: "full_name",
			columnLabel: t("columnLabels.supplier_name"),
			width: "190",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "sup_ref_number",
			columnLabel: t("columnLabels.supplier_code"),
			width: "150",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "submission_status",
			columnLabel: t("columnLabels.submission_status"),
			width: "150",
			sorting: true,
			customCellClass: "cellTruncate",
			formatter: formatterSubmissionStatus,
		},
	]);

	onMounted(async () => {
		await fetchList();
	});

	const fetchList = async () => {
		currentPage.value = route.query.page ? +route.query.page : 1;
		perPage.value = route.query.perPage ? +route.query.perPage : 10;
		searchValue.value = route.query.searchValue ? route?.query?.searchValue : "";
		sortOrder.value = route.query.sortOrder ? route.query.sortOrder : "";
		sortColumn.value = route.query.sortColumn ? route.query.sortColumn : "";
		timezone.value = profileStore.profileData.user_detail?.timezone || "Europe/London";

		await getResponsesData(
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

	const getResponsesData = async (
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
				`/tenders/${route.params?.id}/responses?page=${currentPage}&perPage=${perPage}&searchValue=${searchValue}&sortOrder=${sortOrder}&sortColumn=${sortColumn}&timezone=${timezone.value}`,
				{
					method: "GET",
				}
			);

			tableData.value = res.data?.responses?.data;
			tenderData.value = res.data?.tender;
			total.value = res.data?.responses?.total;
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const getAuthData = computed(() => {
		timezone.value = profileStore.profileData.user_detail?.timezone || "Europe/London";
		return profileStore.profileData.user_detail;
	});

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
		sessionStorage.setItem("redirectFrom", "response-view");
		sessionStorage.setItem("qt-responses-id", route.params?.id);
		navigateTo(
			localePath({
				path: `/quotations-tender/supplier-q-t/view-supplier-q-t/${row.id}`,
			})
		);
	};
</script>
<template>
	<div v-loading="fullscreenLoading">
		<div class="flex flex-col">
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
				<div>
					<label class="font-bold block">{{ $t("formLabels.tender_quotation_code") }}</label>
					<p>{{ tenderData?.qt_code }}</p>
				</div>
				<div>
					<label class="font-bold block">{{ $t("formLabels.project_owner") }}</label>
					<p>{{ tenderData?.project_owner }}</p>
				</div>
				<div>
					<label class="font-bold block">{{ $t("formLabels.title") }}</label>
					<p>{{ tenderData?.title }}</p>
				</div>
			</div>
			<div class="flex-1">
				<BaseDataTable
					id="qt-responses"
					:table-data="tableData"
					:table-column="tableColumn"
					:total="total"
					:status="true"
					:edit-icon="false"
					:stripe="true"
					:add-button="false"
					:is-action-column-not-dropdown="true"
					:is-action-column="false"
					:name="$t('buttons.qt-responses')"
					@handale-current-change="getResponsesData"
					@handale-size-change="getResponsesData"
					@handale-sort-change="getResponsesData"
					@handle-view="handleView"
					@search-value="getResponsesData"
				/>
			</div>

            <div class="text-right p-4">
                <novok-button class="btn-dark my-1" @click="CancelRedirect('/quotations-tender/q-t')">
                    <span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
                    <i class="fa-solid fa-xmark sm:hidden"></i>
                </novok-button>
            </div>
		</div>
	</div>
</template>
