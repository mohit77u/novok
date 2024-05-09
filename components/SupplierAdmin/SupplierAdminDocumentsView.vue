<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/attribute-hyphenation -->
<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
	import { supplierStore } from "~/store/supplier";
	import { getErrors } from "~/helper/getErrors";
	import moment from "moment";

	const props = defineProps({
		editData: {
			type: Object,
			// eslint-disable-next-line vue/require-valid-default-prop
			default: {},
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		activeTab: {
			type: String,
			default: "",
		},
	});

	const tableData = ref<any>([]);
	const localePath = useLocalePath();
	const { t } = useI18n();
	const SupplierStore = supplierStore();
	const emit = defineEmits(["active-tab-name"]);
	const route = useRoute();

	watch(
		() => props.editData,
		(value) => {
			if (value && props.activeTab === "supporting-documents") {
				tableData.value = value.documents;
			}
		}
	);

	const documentTypeLabel = (documentType: string) => {
		let label = "-";
		//  'modern_slavery_statement' => 'modern-slavery-statement',
		// 'anti_money_laundering_statement' => 'anti-money-laundering-statement',
		// 'data_protection_policy' => 'data-protection-policy',
		// 'kpi_s_sla_s' => 'kpi-s-sla-s',
		// 'modern_slavery_policy' => 'modern-slavery-policy',
		// 'anti_corruption_and_bribery_policy' => 'anti-corruption-and-bribery-policy',
		// 'environmental_social_and_governance_esg' => 'environmental-social-and-governance-esg',
		// 'insurance_schedule' => 'insurance-schedule',
		// 'other_certificate' => 'other-certificate',
		switch (documentType) {
			case "modern-slavery-statement":
				label = "Modern Slavery Statement";
				break;

			case "anti-money-laundering-statement":
				label = "Anti Money Laundering Statement";
				break;

			case "data-protection-policy":
				label = "Data Protection Policy";
				break;

			case "kpi-s-sla-s":
				label = "KPI's SLA's";
				break;

			case "modern-slavery-policy":
				label = "Modern Slavery Policy";
				break;

			case "anti-corruption-and-bribery-policy":
				label = "Anti Corruption And Bribery Policy";
				break;

			case "environmental-social-and-governance-esg":
				label = "Environmental Social And Governance ESG";
				break;

			case "insurance-schedule":
				label = "Insurance Schedule";
				break;

			case "other-certificate":
				label = "Other Certificate";
				break;

			default:
				label = "-";
				break;
		}

		return label;
	};

	const backClick = () => {
		SupplierStore.setActiveTab("reference");
		emit("active-tab-name", "reference");
		navigateTo(
			localePath({
				path: route.fullPath,
				query: { tab: "reference" },
			}),
			{ replace: true }
		);
	};
</script>

<template>
	<div v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="flex flex-col">
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

		<div class="grid grid-cols-1 p-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
			<custom-input-view v-if="editData?.custom_supporting_documents?.length" :custom-inputs="editData?.custom_supporting_documents" />
		</div>

		<div class="p-4 text-right">
			<novok-button type="cyan" :loading="loading" :disabled="loading" @click.prevent="backClick">
				<i class="fa-regular fa-arrow-left mr-2"></i> {{ $t("buttons.back") }}
			</novok-button>

			<novok-button class="btn-dark my-1" @click="CancelRedirect('/supplier-admins')">
				<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
				<i class="fa-solid fa-xmark sm:hidden"></i>
			</novok-button>
		</div>
	</div>
</template>
