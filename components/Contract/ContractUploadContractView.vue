<!-- eslint-disable vue/require-valid-default-prop -->
<!-- eslint-disable camelcase -->
<script setup lang="ts">
	import moment from "moment";
	import { reminderData, contractType, contractTypeCopy, FormContractStatusData } from "~/helper/data";

	import { ContractData, CurrencyData, CurrencySymbole, ContractTermType } from "~/helper/data";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import { contractStore } from "~/store/contract";
	import {
		commaThreeDigitFormat,
		getFormattedDateTimeValue,
		getFormattedDateValue,
		getFormattedTimeValue,
		getValueLabel,
		getFileNameFromURL,
	} from "~/helper/common";

	const localePath = useLocalePath();
	const { t } = useI18n();
	const fullscreenLoading = ref(false);
	const loading = ref(false);
	const loadingSave = ref(false);
	const route = useRoute();
	const emit = defineEmits(["active-tab-name", "disable", "disabled"]);
	const store = contractStore();
	const showError = ref(false);
	const getReminderData = ref<any>([]);

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

	const contract_number = ref(0);
	const contract_id = ref();
	const searchValue = ref("");
	const clientManagers = ref<any>([]);
	const supplierLeads = ref<any>([]);
	const clientLeads = ref<any>([]);
	const showContractDates = ref(true);
	const customFields = ref<any>([]);

	watch(
		() => props.editData,
		(val: any) => {
			Object.assign(customFields, val?.custom_upload_contracts);
		},
		{ deep: true, immediate: true }
	);

	const cancel = () => {
		navigateTo(localePath("/contracts"));
	};

	const nextClick = () => {
		store.setActiveTab("signatory-details");
		emit("active-tab-name", "signatory-details");
		navigateTo(
			localePath({
				path: route.fullPath,
				query: { tab: "signatory-details" },
			}),
			{ replace: true }
		);
	};

	const backClick = () => {
		store.setActiveTab("primary-details");
		emit("active-tab-name", "primary-details");
		navigateTo(
			localePath({
				path: route.fullPath,
				query: { tab: "primary-details" },
			}),
			{ replace: true }
		);
	};
</script>

<template>
	<div class="tab mb-5">
		<!-- upload-contract details -->
		<div class="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
			<div>
				<label class="font-bold">{{ $t("formLabels.contract_copy_available") }}</label>
				<p class="break-words">{{ editData.contract_copy_available === 1 ? "YES" : "NO" }}</p>
			</div>

			<div v-if="editData.contract_copy_available === 0">
				<label class="font-bold">{{ $t("formLabels.reason") }}</label>
				<p class="break-words">{{ editData.contract_copy_comments }}</p>
			</div>

			<div v-if="editData.contract_copy_available === 1">
				<template v-if="editData.documents.length">
					<div v-for="document in editData.documents" :key="document.id">
						<label class="font-bold">{{ $t("formLabels.upload_contract") }}</label>
						<a :href="document.document_path" class="text-primary block truncate">{{ document.file_name }}</a>
					</div>
				</template>
				<template v-else>
					<label class="font-bold">{{ $t("formLabels.upload_contract") }}</label>
					<p>-</p>
				</template>
			</div>

			<custom-input-view v-if="editData?.custom_upload_contracts?.length" :custom-inputs="editData?.custom_upload_contracts" />
		</div>

		<div class="p-6 text-right">
			<novok-button type="cyan" class="my-1" :loading="loading" :disabled="loading" @click.prevent="backClick">
				<i class="fa-regular fa-arrow-left mr-2"></i> {{ $t("buttons.back") }}
			</novok-button>

			<novok-button class="btn-dark my-1" @click="cancel">
				<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
				<i class="fa-solid fa-xmark sm:hidden"></i>
			</novok-button>

			<novok-button class="my-1" type="info" :loading="loading" :disabled="loading" @click.prevent="nextClick"
				>{{ $t("buttons.next") }}
			</novok-button>
		</div>
	</div>
</template>
