<script setup lang="ts">
	import { use } from "echarts/core";
	import { supplierStore } from "~/store/supplier";

	const fullscreenLoading = ref(false);
	const editData = ref<any>([]);
	const route = useRoute();

	const currentPage = ref(1);
	const total = ref(10);
	const perPage = ref(10);
	const debounceId = ref<any>(null);
	const searchValue = ref("");
	const showPagination = ref(false);
	const SupplierStore = supplierStore();
	const localePath = useLocalePath();
	const cookieActiveTab = ref<any>("");

	const emit = defineEmits(["active-tab-name"]);

	const props = defineProps({
		activeTab: {
			type: String,
			default: "",
		},
	});

	const getDocumentData = async () => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch(
				`/qt/projects/${route?.params?.id}/tender/suppliers?perPage=${perPage.value}&sortColumn=&sortOrder=&searchValue=${searchValue.value}`,
				{
					method: "GET",
				}
			);
			editData.value = res?.data?.data;
			total.value = res.data?.total;
			if (total.value > 0) {
				showPagination.value = true;
			} else {
				showPagination.value = false;
			}
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	watch(
		() => props.activeTab,
		(currData) => {
			if (currData === "documents") {
				getDocumentData();
			}
		},
		{ deep: true, immediate: true }
	);

	onMounted(() => {
		cookieActiveTab.value = useCookie("activeTab");
		if (props.activeTab === "documents") {
			getDocumentData();
		}
	});

	const handleCurrentChange = (val: any) => {
		currentPage.value = val;

		getDocumentData();
	};

	const handleSizeChange = (val: any) => {
		perPage.value = val;
		// handleStorageFilterChange();

		getDocumentData();
	};

	const debounce = (value: any) => {
		searchValue.value = value;

		// handleStorageFilterChange();

		if (debounceId.value) {
			clearTimeout(debounceId.value);
			debounceId.value = null;
		}
		debounceId.value = setTimeout(() => {
			currentPage.value = 1;

			getDocumentData();
		}, 500);
	};

	const iconClick = (id: any) => {
		// window.alert("Documents coming soon");
		sessionStorage.setItem("project-document-id", id);
		navigateTo(localePath(`/project-pipeline/projects/document-preview/${route.params?.id}`));
	};

	const backClick = () => {
		SupplierStore.setActiveTab("supervision");
		emit("active-tab-name", "supervision");
		navigateTo(
			localePath({
				path: route.fullPath,
				query: { tab: "supervision" },
			}),
			{ replace: true }
		);
	};
</script>

<template>
	<div class="resources p-4" v-loading="fullscreenLoading">
		<div v-if="editData.length" class="flex flex-wrap justify-between gap-3">
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
		</div>

		<template v-if="editData.length">
			<div class="documents grid xxl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-4 mt-4">
				<div class="border-black/10 border rounded-xl" v-for="(supplier, index) in editData" :key="index">
					<div class="border-b border-black/10 p-4 flex items-start justify-between">
						<h2 class="font-bold text-primary truncate">
							{{ supplier.company_name + " " + "(" + supplier.sup_name + ")" }}
						</h2>
					</div>
					<i class="fa-thin fa-folder text-[63px] text-primary block p-4 text-center cursor-pointer" @click="iconClick(supplier?.id)"></i>
				</div>
			</div>
		</template>
		<div v-else>
			<p class="text-center p-10">No Supplier found.</p>
		</div>
		<div class="flex items-center justify-between mt-3">
			<el-pagination
				v-if="showPagination"
				background
				layout="total, sizes, prev, pager, next"
				:total="total"
				class="-ml-4 text-center"
				:page-sizes="[10, 25, 50, 100]"
				:page-size="perPage"
				:default-current-page="currentPage"
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
			/>
			<div class="pl-5 ms-auto">
				<novok-button
					v-if="cookieActiveTab === 'supervision'"
					class="my-1 btn-dark"
					:loading="loading"
					:disabled="loading"
					@click.prevent="backClick"
					>{{ $t("buttons.back") }}
				</novok-button>

				<novok-button class="my-1 btn-dark" @click="CancelRedirect('/project-pipeline/projects')">
					<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
					<i class="fa-solid fa-xmark sm:hidden"></i>
				</novok-button>
			</div>
		</div>
	</div>
</template>
