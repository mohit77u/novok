<template>
	<div class="h-full overflow-hidden" v-loading="fullscreenLoading">
		<BaseDataTable
			id="custom_field"
			:table-data="tableData"
			:table-column="tableColumn"
			:total="total"
			:edit-icon="true"
			:stripe="true"
			:add-button="true"
			:is-action-column="false"
			:is-action-column-not-dropdown="true"
			:grid-view="false"
			:delete-btn="true"
			:preview-btn="false"
			:is-table-only="true"
			:tableTopOffset="tableTopOffset"
			:name="$t('buttons.custom_field')"
			@handale-current-change="getListOfCustomFields"
			@handale-size-change="getListOfCustomFields"
			@handale-sort-change="getListOfCustomFields"
			@search-value="getListOfCustomFields"
			@handle-edit="handleEdit"
			@handle-view="handleView"
			@handle-delete="handleDelete"
		/>

		<BaseDeleteModal
			v-if="dialogVisible === true"
			:dialog-visible="dialogVisible"
			:delete-api="confirmDelete"
			message-content="Are you sure you want to delete this record?"
			@dialog-ok-click="dialogOkClick"
		/>
	</div>
</template>

<script setup lang="ts">
	import { useCustomFieldsStore } from "~/store/customFields";

	const props = defineProps({
		tabName: {
			type: String,
			default: "",
		},
	});

	const customFieldsStore = useCustomFieldsStore();
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
	const formHeight = ref<any>(null);
	const moduleName = ref<string>("");
	const tableTopOffset = ref(0);
	const dialogVisible = ref(false);
	const deleteInfo = ref({ id: null });

	// const tableColumn = ref([

	// ]);

	onMounted(async () => {
		moduleName.value = customFieldsStore.getActiveTab;

		// if (props.tabName !== moduleName.value) {
		// 	currentPage.value = 1;
		// 	perPage.value = 10;
		// 	searchValue.value = "";

		// 	await fetchList();
		// }

		const element: any = document.getElementById("custom_field_list");
		if (element) {
			const rect = element.getBoundingClientRect();
			tableTopOffset.value = 0;
			tableTopOffset.value = rect.top + 80 + 38 + 64;
		}
	});

	const tableColumn = computed(() => {
		const hideTabName = ["request", "q-and-t-client", "q-and-t-supplier"];
		const columns = [
			{
				columnName: "id",
				columnLabel: t("columnLabels.id"),
				width: "50",
				sorting: false,
				customCellClass: "cellTruncate",
			},
			{
				columnName: "tab_name",
				columnLabel: t("columnLabels.tab_name"),
				width: "150",
				sorting: false,
				customCellClass: "cellTruncate",
				isHide: hideTabName.includes(props.tabName),
			},
			{
				columnName: "input_label",
				columnLabel: t("columnLabels.input_label"),
				width: "150",
				sorting: false,
				customCellClass: "cellTruncate",
			},
			{
				columnName: "input_type",
				columnLabel: t("columnLabels.input_type"),
				width: "150",
				sorting: false,
				customCellClass: "cellTruncate",
			},
			{
				columnName: "is_required",
				columnLabel: t("columnLabels.is_required"),
				width: "100",
				sorting: false,
				customCellClass: "cellTruncate",
				formatter: (row: any) => {
					return row?.is_required == 0 ? "No" : "Yes";
				},
			},
		];

		return columns.filter((column) => !column.isHide);
	});

	const fetchList = async () => {
		await getListOfCustomFields(currentPage.value, perPage.value, searchValue.value);
	};

	const getListOfCustomFields = async (currentPage: any, perPage: any, searchValue: any) => {
		fullscreenLoading.value = true;

		navigateTo(
			localePath({
				path: route.fullPath,
				query: {
					page: currentPage,
					perPage,
					searchValue,
					moduleName: moduleName.value,
				},
			}),
			{ replace: true }
		);

		try {
			const res: any = await useApiFetch(
				`/custom-fields?module_name=${moduleName.value}&page=${currentPage}&perPage=${perPage}&searchValue=${searchValue}`,
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

	watch(
		() => customFieldsStore.getActiveTab,
		async (currData: any) => {
			moduleName.value = currData;

			if (route?.query?.moduleName !== moduleName.value) {
				currentPage.value = 1;
				perPage.value = 10;
				searchValue.value = "";
			} else {
				currentPage.value = route.query.page ? route.query.page : 1;
				perPage.value = route.query.perPage ? route.query.perPage : 10;
				searchValue.value = route.query.searchValue ? route?.query?.searchValue : "";
			}

			if (props.tabName === moduleName.value) {
				await fetchList();
			}

			const element: any = document.getElementById("custom_field_list");
			if (element) {
				const rect = element.getBoundingClientRect();
				tableTopOffset.value = 0;
				tableTopOffset.value = rect.top + 80 + 38 + 64;
			}
		},
		{ deep: true, immediate: true }
	);

	const handleEdit = (row: any) => {
		const pageDetails = {
			page: route.query?.page,
			perPage: route.query?.perPage,
			searchValue: route.query?.searchValue,
			moduleName: moduleName.value,
		};

		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));
		navigateTo(
			localePath({
				path: `/settings/custom-fields/${row.id}/edit`,
			})
		);
	};

	const handleDelete = async (row: any) => {
		deleteInfo.value = row;
		dialogVisible.value = true;
	};

	const dialogOkClick = (is_confirm: boolean) => {
		dialogVisible.value = false;
		if (!is_confirm) {
			deleteInfo.value = { id: null };
			return;
		}
	};

	const confirmDelete = async (is_confirm: boolean) => {
		fullscreenLoading.value = true;
		dialogVisible.value = false;
		try {
			const res: any = await useApiFetch(`/custom-fields/${deleteInfo.value?.id}`, {
				method: "DELETE",
			});
			useToast("success", res.message);
			fullscreenLoading.value = false;
			fetchList();
		} catch {
			fullscreenLoading.value = false;
			deleteInfo.value = { id: null };
		}
	};
</script>
