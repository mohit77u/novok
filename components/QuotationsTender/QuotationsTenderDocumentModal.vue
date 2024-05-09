<script setup lang="ts">
	import { activityType } from "~/helper/data";
	import moment from "moment";

	const props = defineProps({
		dialogVisible: Boolean,
		id: {
			type: String,
			default: "",
		},
	});
	const emit = defineEmits(["dialogOkClick", "document-data"]);
	const centerDialogVisible = ref(false);
	const searchValue = ref("");
	const resourceDocuments = ref([]);
	const localePath = useLocalePath();
	const { t } = useI18n();
	const fullscreenLoading = ref(false);

	const formData = reactive<any>({
		document_id: "",
	});
	const documents = ref<any>({});

	watch(
		() => props.dialogVisible,
		(currData) => {
			centerDialogVisible.value = currData;
		},
		{ deep: true, immediate: true }
	);

	onMounted(async () => {
		await getResourceDocuments(searchValue.value);
	});

	// const okClick = () => {
	// 	submit();
	// };

	const dialogClose = () => {
		centerDialogVisible.value = false;
		emit("dialogOkClick", false);
	};

	// const submit = async () => {
	// 	centerDialogVisible.value = false;
	// 	emit("dialogOkClick", false);
	// 	emit("status-data", formData, "");
	// };

	const getResourceDocuments = async (value: any) => {
		fullscreenLoading.value = true;
		try {
			const res: any = await useApiFetch(`/qt/resources?perPage=100&sortColumn=&sortOrder=&searchValue=&folderType=3`, {
				method: "GET",
			});
			resourceDocuments.value = res.data?.data;
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const documentClick = () => {
		centerDialogVisible.value = false;
		formData.document_id = documents.value.id;
		emit("dialogOkClick", false);
		emit("document-data", documents.value, props.id);
	};

	const documentChange = (document: any) => {
		documents.value = document;
	};
</script>

<template>
	<el-dialog
		v-model="centerDialogVisible"
		class="max-w-[730px] w-[90%] rounded-2xl text-left"
		center
		@close="dialogClose"
		:close-on-click-modal="false"
		:title="$t('labels.select_document')"
	>
		<!-- <h1 class="text-3xl font-bold mb-5 mt-4 text-dark/100">Account Disabled</h1> -->
		<el-form v-loading="fullscreenLoading" class="flex flex-col">
			<div id="super-admin-form">
				<div class="bg-[#fff]">
					<div>
						<!-- <div class="grid md:grid-cols-12 gap-5 lg:gap-6" > -->
						<ul v-for="document in resourceDocuments" :key="document.id">
							<!-- <li class="text-primary underline cursor-pointer mt-2" @click="documentClick(document)">
								{{ document.document_file_name }}
							</li> -->
							<el-radio-group v-model="formData.document_id" :disabled="disabled" @change="documentChange">
								<el-radio :label="document" size="large">{{ document.document_name }}</el-radio>
							</el-radio-group>
						</ul>

						<!-- </div> -->
					</div>
				</div>
			</div>
		</el-form>
		<template #footer>
			<div class="dialog-footer text-center">
				<novok-button type="info" @click="documentClick">
					{{ $t("buttons.save") }}
				</novok-button>
			</div>
		</template>
	</el-dialog>
</template>
