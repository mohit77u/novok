<script setup lang="ts">
	import type { TabsPaneContext } from "element-plus";

	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});

	useHead({
		title: "Resources",
	});
	const router = useRouter();
	const route = useRoute();
	const localePath = useLocalePath();

	const searchValue = ref<any>("");
	const activeTab = ref<any>("policy-documents");
	const mode = ref<any>("add");
	const dialogVisible = ref<any>(false);
	const editData = ref<any>({});
	const templateDocuments = ref<any>([]);
	const qaDocuments = ref<any>([]);
	const documentsList = ref<any>([]);
	const archiveDocuments = ref<any>([]);
	const fullscreenLoading = ref(false);
	const isEdit = ref(false);
	const currentPage = ref(1);
	const total = ref(10);
	const perPage = ref(10);
	const debounceId = ref<any>(null);
	const showPagination = ref(false);

	onMounted(() => {
		activeTab.value = route.query.tab ?? activeTab.value;
		let resourcePageDetails: any = sessionStorage.getItem("resourcePageDetails");
		resourcePageDetails = resourcePageDetails ? JSON.parse(resourcePageDetails) : {};
		activeTab.value = resourcePageDetails["activeTab"] ?? activeTab.value;
		currentPage.value = resourcePageDetails["currentPage"] ?? currentPage.value;
		perPage.value = resourcePageDetails["perPage"] ?? perPage.value;
		searchValue.value = resourcePageDetails["searchValue"] ?? searchValue.value;
		getResources();
		// getArchiveDocuments();
	});

	const getResources = async () => {
		fullscreenLoading.value = true;
		const folderType = activeTab.value === "policy-documents" ? 1 : activeTab.value === "templates" ? 2 : 3;
		try {
			const res: any = await useApiFetch(
				`/resources?page=${currentPage.value}&perPage=${perPage.value}&searchValue=${searchValue.value}&folderType=${folderType}`,
				{
					method: "GET",
				}
			);
			total.value = res.data?.total;

			if (total.value > 0) {
				showPagination.value = true;
			} else {
				showPagination.value = false;
			}

			if (folderType === 1) {
				documentsList.value = res.data.data;
			} else if (folderType === 2) {
				templateDocuments.value = res.data.data;
			} else {
				qaDocuments.value = res.data.data;
			}
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const getArchiveDocuments = async () => {
		fullscreenLoading.value = true;
		// const folderType = activeTab.value === "policy-documents" ? 1 : activeTab.value === "templates" ? 2 : 3;
		try {
			const res: any = await useApiFetch(
				`/resources-archives?page=${currentPage.value}&perPage=${perPage.value}&searchValue=${searchValue.value}&folderType=`,
				{
					method: "GET",
				}
			);
			total.value = res.data?.total;
			if (total.value > 0) {
				showPagination.value = true;
			} else {
				showPagination.value = false;
			}
			archiveDocuments.value = res.data.data;
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const handleClick = (tab: TabsPaneContext) => {
		activeTab.value = tab.paneName;
		currentPage.value = 1;
		perPage.value = 10;
		searchValue.value = "";

		handleStorageFilterChange();

		if (activeTab.value === "archive-documents") {
			getArchiveDocuments();
		} else {
			getResources();
		}
		navigateTo(
			localePath({
				path: route.fullPath,
				query: { tab: tab.paneName },
			}),
			{ replace: true }
		);
	};

	const dialogClick = (value: any) => {
		dialogVisible.value = value;
		// getResources();
	};

	const getEditDocument = async (id: any) => {
		fullscreenLoading.value = true;
		try {
			const res: any = await useApiFetch(`/resources/${id}`, {
				method: "GET",
			});
			editData.value = res.data;
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const updateDocument = async (id: any) => {
		isEdit.value = true;
		getEditDocument(id);
		dialogVisible.value = true;
	};

	const handleAddNewDocument = async () => {
		isEdit.value = false;
		dialogVisible.value = true;
	};

	// const deleteDocument = async (id: any) => {
	// 	fullscreenLoading.value = true;
	// 	try {
	// 		const res: any = await useApiFetch(`/resources/${id}`, {
	// 			method: "DELETE",
	// 		});
	// 		useToast("success", res.message);
	// 	} catch {
	// 	} finally {
	// 		fullscreenLoading.value = false;
	// 		getResources();
	// 	}
	// };

	const handleCurrentChange = (val: any) => {
		currentPage.value = val;
		handleStorageFilterChange();
		if (activeTab.value === "archive-documents") {
			getArchiveDocuments();
		} else {
			getResources();
		}
	};

	const handleSizeChange = (val: any) => {
		perPage.value = val;
		handleStorageFilterChange();
		if (activeTab.value === "archive-documents") {
			getArchiveDocuments();
		} else {
			getResources();
		}
	};

	const handleBackTab = () => {
		if (activeTab.value == "qt-documents") {
			activeTab.value = "templates";
		} else if (activeTab.value == "templates") {
			activeTab.value = "policy-documents";
		} else {
			activeTab.value = "policy-documents";
		}
	};

	const handleNextTab = () => {
		if (activeTab.value == "policy-documents") {
			activeTab.value = "templates";
		} else if (activeTab.value == "templates") {
			activeTab.value = "qt-documents";
		} else {
			activeTab.value = "policy-documents";
		}
	};

	const handleStorageFilterChange = () => {
		let resourcePageDetails: any = sessionStorage.getItem("resourcePageDetails");
		resourcePageDetails = resourcePageDetails ? JSON.parse(resourcePageDetails) : {};
		resourcePageDetails["activeTab"] = activeTab.value;
		resourcePageDetails.perPage = perPage.value;
		resourcePageDetails.searchValue = searchValue.value;
		resourcePageDetails.currentPage = currentPage.value;
		sessionStorage.setItem("resourcePageDetails", JSON.stringify(resourcePageDetails));
	};

	const debounce = (value: any) => {
		searchValue.value = value;

		handleStorageFilterChange();

		if (debounceId.value) {
			clearTimeout(debounceId.value);
			debounceId.value = null;
		}
		debounceId.value = setTimeout(() => {
			currentPage.value = 1;
			if (activeTab.value === "archive-documents") {
				getArchiveDocuments();
			} else {
				getResources();
			}
		}, 500);
	};

	const addEditDocument = () => {
		isEdit.value = false;
		getResources();
	};
</script>

<template>
	<div class="resources p-4" v-loading="fullscreenLoading">
		

		<div class="flex flex-wrap justify-between gap-3">
			<div class="max-w-md w-full flex">
				<el-form-item class="withIcon tableSearch mb-0">
					<el-input
						v-model="searchValue"
						type="search"
						class="border-0 w-52"
						:placeholder="$t('placeholders.search')"
						:value="searchValue"
						@input="debounce"
					/>
					<div class="absolute leading-none right-0 top-1/2 -translate-y-1/2 text-gray-500 inputIcon">
						<i class="fa-regular fa-magnifying-glass"></i>
					</div>
				</el-form-item>
			</div>

			<div v-if="hasPermissionTo('resource-create') && activeTab !== 'archive-documents'">
				<el-tooltip class="box-item" effect="dark" :content="$t('buttons.add_new')" placement="top">
					<novok-button type="info" @click="handleAddNewDocument()" class="text-nowrap">
						{{ $t("buttons.add_new") }}
					</novok-button>
				</el-tooltip>
			</div>
		</div>

		<el-tabs v-model="activeTab" class="demo-tabs mt-4" @tab-click="handleClick">
			<el-tab-pane name="policy-documents">
				<template #label>
					<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
						<BaseLabel :label="$t('formLabels.policy_documents')" :tooltip-content="$t('formLabels.policy_documents')" />
					</div>
				</template>

				<ResourceDocuments :active-tab="activeTab" :documents-list="documentsList" @edit-data="updateDocument" @delete-data="getResources" />
			</el-tab-pane>
			<el-tab-pane name="templates">
				<template #label>
					<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
						<BaseLabel :label="$t('formLabels.templates')" :tooltip-content="$t('formLabels.templates')" />
					</div>
				</template>

				<ResourceDocuments
					:active-tab="activeTab"
					:documents-list="templateDocuments"
					@edit-data="updateDocument"
					@delete-data="getResources"
				/>
			</el-tab-pane>
			<el-tab-pane name="qt-documents">
				<template #label>
					<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
						<BaseLabel :label="$t('formLabels.qt_documents')" :tooltip-content="$t('formLabels.qt_documents')" />
					</div>
				</template>

				<ResourceDocuments :active-tab="activeTab" :documents-list="qaDocuments" @edit-data="updateDocument" @delete-data="getResources" />
			</el-tab-pane>
			<el-tab-pane name="archive-documents">
				<template #label>
					<div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
						<BaseLabel :label="$t('formLabels.archive_documents')" :tooltip-content="$t('formLabels.archive_documents')" />
					</div>
				</template>

				<ResourceDocuments :active-tab="activeTab" :documents-list="archiveDocuments" />
			</el-tab-pane>
		</el-tabs>

		<div class="flex items-center justify-center lg:justify-between">
			<div class="flex items-center gap-2">
				<!-- <novok-button type="info" class="btn-dark" @click="handleBackTab" v-if="activeTab != 'policy-documents'">
					{{ $t("buttons.back") }}
				</novok-button>

				<novok-button type="info" @click="handleNextTab" v-if="activeTab != 'qt-documents'">
					{{ $t("buttons.next") }}
				</novok-button> -->
			</div>

			<el-pagination
				v-if="showPagination"
				background
				layout="total, sizes, prev, pager, next"
				:total="total"
				class="mt-4 text-center"
				:page-sizes="[10, 25, 50, 100]"
				:page-size="perPage"
				:default-current-page="currentPage"
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
			/>
		</div>

		<ResourceModal
			v-if="dialogVisible === true"
			:dialog-visible="dialogVisible"
			:edit-data="editData"
			:is-edit="isEdit"
			:document-type="activeTab"
			:mode="mode"
			@dialog-ok-click="dialogClick"
			@add-document="addEditDocument"
		/>
	</div>
</template>
