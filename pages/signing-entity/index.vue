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
		title: "Signing Entity",
	});

	const route = useRoute();
	const tableData = ref<any>([]);
	const total = ref<any>(0);
	const currentPage = ref<any>(1);
	const perPage = ref<any>(10);
	const searchValue = ref<any>("");
	const sortOrder = ref<any>("");
	const sortColumn = ref<any>("");
	const status = ref<any>("");
	const fullscreenLoading = ref(false);
	const sidebarStore = sidebarItemStore();
	const localePath = useLocalePath();
	const { t } = useI18n();
	const dialogVisible = ref(false);
	const rowId = ref("");
	const authStore = useAuthStore();
	const profileStore = useProfileStore();
	const projectOwnerSearch = ref<any>("");

	interface Item {
		contact_number: "";
		country_code: "";
	}

	const formatter = (row: Item) => {
		return "(" + row.country_code + ")" + " " + row.contact_number;
	};

	const tableColumn = ref([
		{
			columnName: "sub_entity_name",
			columnLabel: t("columnLabels.sub_entity_name"),
			width: "170",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "contact_person_name",
			columnLabel: t("columnLabels.contact_person_name"),
			width: "200",
			sorting: true,
			customCellClass: "cellTruncate",
		},
		{
			columnName: "contact_number",
			columnLabel: t("columnLabels.contact_number"),
			width: "170",
			sorting: true,
			customCellClass: "cellTruncate",
			formatter: formatter,
		},
		{
			columnName: "email",
			columnLabel: t("columnLabels.email"),
			width: "120",
			sorting: true,
			customCellClass: "cellTruncate",
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
		await getSigningEntityData(currentPage.value, perPage.value, searchValue.value, sortOrder.value, sortColumn.value);
	};

	const getSigningEntityData = async (currentPage: any, perPage: any, searchValue: any, sortOrder: any, sortColumn: any) => {
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
				`/signing-entities?page=${currentPage}&perPage=${perPage}&searchValue=${searchValue}&sortOrder=${sortOrder}&sortColumn=${sortColumn}`,
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
				path: `/signing-entity/edit-signing-entity/${row.id}`,
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
			projectStatus: route.query?.projectStatus,
		};
		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));

		navigateTo(
			localePath({
				path: `/signing-entity/view-signing-entity/${row.id}`,
			})
		);
	};

	const handleDelete = () => {};
</script>
<template>
	<div v-loading="fullscreenLoading">
		<BaseDataTable
			id="signing_entity"
			:table-data="tableData"
			:table-column="tableColumn"
			:total="total"
			:edit-icon="true"
			:stripe="true"
			:add-button="true"
			:is-action-column="true"
			:name="$t('buttons.signing_entity')"
			@handale-current-change="getSigningEntityData"
			@handale-size-change="getSigningEntityData"
			@handale-sort-change="getSigningEntityData"
			@handle-edit="handleEdit"
			@handle-delete="handleDelete"
			@handle-view="handleView"
			@search-value="getSigningEntityData"
		/>
		<!-- <BaseDeleteModal v-if="dialogVisible === true" :dialog-visible="dialogVisible" :delete-api="deleteApi" @dialog-ok-click="dialogOkClick" /> -->
	</div>
</template>
