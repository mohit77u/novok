<!-- eslint-disable vue/require-valid-default-prop -->
<!-- eslint-disable camelcase -->
<script setup lang="ts">
	import moment from "moment";
	import { allDocumentType, documentTypeToInfo } from "~/helper/data";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import { contractStore } from "~/store/contract";

	const localePath = useLocalePath();
	const { t } = useI18n();
	const route = useRoute();
	const emit = defineEmits(["active-tab-name"]);
	const store = contractStore();
	const tableData = ref<any>([]);

	const props = defineProps({
		editData: {
			type: Object,
			default: {},
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	});

	watch(
		() => props.editData,
		(value) => {
			if (value) {
				tableData.value = value.documents;
			}
		},
		{ deep: true, immediate: true }
	);

	const documentTypeLabel = (documentType: string) => {
		let label = "-";
		switch (documentType) {
			case "other-certificate":
				label = "Other Certificate";
				break;

			default:
				label = "-";
				break;
		}

		return label;
	};

	const cancel = () => {
		navigateTo(localePath("/contracts"));
	};

	const backClick = () => {
		store.setActiveTab("additional-information");
		emit("active-tab-name", "additional-information");
		navigateTo(
			localePath({
				path: route.fullPath,
				query: { tab: "additional-information" },
			}),
			{ replace: true }
		);
	};
</script>

<template>
	<div>
		<el-table stripe :border="true" :data="tableData" style="width: 100%">
			<el-table-column prop="document_type" :label="$t('labels.document_type')">
				<template #default="scope">
					{{ documentTypeLabel(scope.row.document_type) }}
				</template>
			</el-table-column>
			<el-table-column prop="file_name" :label="$t('labels.file_name')">
				<template #default="scope">
					<a type="primary" class="cursor-pointer hover:text-primary" target="_blank" :href="scope.row.document_path">{{
						scope.row.file_name
					}}</a>
				</template>
			</el-table-column>
			<el-table-column prop="expiry_date" :label="$t('labels.expiry_date')">
				<template #default="scope">
					{{ scope.row.expiry_date ? moment(scope.row.expiry_date).format("DD/MM/YYYY") : "" }}
				</template>
			</el-table-column>
			<el-table-column :label="$t('labels.actions')">
				<template #default="scope">
					<!-- view icon -->
					<a :href="scope.row.document_path" target="_blank">
						<i class="fa-solid fa-eye cursor-pointer hover:text-primary" />
					</a>
				</template>
			</el-table-column>
		</el-table>

		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
			<custom-input-view v-if="editData?.custom_supporting_documents?.length" :custom-inputs="editData?.custom_supporting_documents" />
		</div>

		<div class="p-6 text-right">
			<novok-button type="cyan" class="my-1" :loading="loading" :disabled="loading" @click.prevent="backClick">
				<i class="fa-regular fa-arrow-left mr-2"></i> {{ $t("buttons.back") }}
			</novok-button>

			<novok-button class="btn-dark my-1" @click="cancel">
				<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
				<i class="fa-solid fa-xmark sm:hidden"></i>
			</novok-button>
		</div>
	</div>
</template>
