<!-- eslint-disable vue/require-valid-default-prop -->
<!-- eslint-disable camelcase -->
<script setup lang="ts">
	import moment from "moment";
	import { reminderData, contractType, contractTypeCopy, FormContractStatusData } from "~/helper/data";

	import { ContractData, CurrencyData, CurrencySymbole, ContractTermType, PayGroup, RiskLeval } from "~/helper/data";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import { contractStore } from "~/store/contract";
	import { commaThreeDigitFormat, getFormattedDateTimeValue, getFormattedDateValue, getFormattedTimeValue, getValueLabel } from "~/helper/common";

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
			Object.assign(customFields, val?.custom_additional_informations);
		},
		{ deep: true, immediate: true }
	);

	const cancel = () => {
		navigateTo(localePath("/contracts"));
	};

	const getSelectedPayGroup = (id: any) => {
		const data = PayGroup.find((data: any) => data.value == id);
		return data?.label;
	};

	const getSelectedRiskLeval = (id: any) => {
		const data = RiskLeval.find((data: any) => data.value == id);
		return data?.label;
	};

	const nextClick = () => {
		store.setActiveTab("supporting-documents");
		emit("active-tab-name", "supporting-documents");
		navigateTo(
			localePath({
				path: route.fullPath,
				query: { tab: "supporting-documents" },
			}),
			{ replace: true }
		);
	};

	const backClick = () => {
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
</script>

<template>
	<div class="p-6" v-if="editData">
        <div class="col-span-12">
            <label class="font-bold">{{ $t("formLabels.manage_subcontractors") }}</label>
            <p class="break-words">
                {{ editData.contract_additional_info?.manage_subcontractor == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}
            </p>
        </div>

        <div class="col-span-12" v-if="editData.contract_additional_info?.manage_subcontractor == 1">
            <h3 class="pb-2 col-span-12 text-xl font-bold mt-3 border-b mb-2">
                {{ $t("formLabels.subcontractors") }}
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-4" v-for="(data, index) in editData.contract_additional_info?.subcontractors" :key="index">
                <div>
                    <label class="font-bold">{{ $t("formLabels.subcontractor_name") }}</label>
                    <p class="break-words">{{ data?.subcontractor_name?.length ? data?.subcontractor_name : '-' }}</p>
                </div>
                <div>
                    <label class="font-bold">{{ $t("formLabels.product_service_country_id") }}</label>
                    <p class="break-words">{{ data?.product_service_country_name?.length ? data?.product_service_country_name : '-' }}</p>
                </div>
                <div>
                    <label class="font-bold">{{ $t("formLabels.reg_country_id") }}</label>
                    <p class="break-words">{{ data?.reg_country_name?.length ? data?.reg_country_name : '-' }}</p>
                </div>
            </div>
        </div>

		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
			

			<div>
				<label class="font-bold">{{ $t("formLabels.country_of_service_product_delivery") }}</label>
				<p class="break-words">
					<ul class="flex flex-wrap" v-if="editData?.contract_additional_info?.country_of_service_product_delivery?.length > 0">
						<li
							v-for="(data, index) in editData?.contract_additional_info?.country_of_service_product_delivery"
							:key="index"
							class=" text-dark/80 inline-block"
						>
							{{ data }},&nbsp;
						</li>
					</ul>
					<span v-else>-</span>
				</p>
			</div>

            <div>
				<label class="font-bold">{{ $t("formLabels.benchmarking_price_review_date") }}</label>
				<p class="break-words">{{ editData.contract_additional_info?.benchmarking_price_review_date ? moment(`${editData.contract_additional_info?.benchmarking_price_review_date}`).format("DD/MM/YYYY") : "-" }}</p>
			</div>

			<div>
				<label class="font-bold">{{ $t("formLabels.location_served") }}</label>
				<p class="break-words">
					<ul class="flex flex-wrap" v-if="editData?.contract_additional_info?.location_served?.length > 0">
						<li
							v-for="(data, index) in editData?.contract_additional_info?.location_served"
							:key="index"
							class=" text-dark/80 inline-block"
						>
							{{ data }},&nbsp;
						</li>
					</ul>
					<span v-else>-</span>
				</p>
			</div>
			
			<div>
				<label class="font-bold">{{ $t("formLabels.exit_plan") }}</label>
				<p class="break-words">
					{{ editData.contract_additional_info?.exit_plan == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}
				</p>
			</div>

            <div>
				<label class="font-bold">{{ $t("formLabels.governing_law") }}</label>
				<p class="break-words">
					{{ editData.contract_additional_info?.governing_law || '-' }}
				</p>
			</div>

            <div>
				<label class="font-bold">{{ $t("formLabels.business_continuity_management") }}</label>
				<p class="break-words">
					{{ editData.contract_additional_info?.business_continuity_management == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}
				</p>
			</div>
			
			<div>
				<label class="font-bold">{{ $t("formLabels.payment_terms_days") }}</label>
				<p class="break-words">{{ editData.contract_additional_info?.payment_terms_days ?? "-" }}</p>
			</div>
						
			<div>
				<label class="font-bold">{{ $t("formLabels.rebate") }}</label>
				<p class="break-words">
					{{ editData.contract_additional_info?.rebate == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}
				</p>
			</div>	

            <div v-if="editData.contract_additional_info?.rebate == 1">
				<label class="font-bold">{{ $t("formLabels.volume_discount_rebate_collection_date") }}</label>
				<p class="break-words">
					{{                     editData.contract_additional_info?.volume_discount_rebate_collection_date ? moment(`${editData.contract_additional_info?.volume_discount_rebate_collection_date}`).format("DD/MM/YYYY") : "-"  }}
				</p>
			</div>			
			
			<div>
				<label class="font-bold">{{ $t("formLabels.termination_for_convenience") }}</label>
				<p class="break-words">
					{{ editData.contract_additional_info?.termination_for_convenience == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}
				</p>
			</div>

			<div>
				<label class="font-bold">{{ $t("formLabels.terms_n_conditions") }}</label>
				<p class="break-words">
					{{ editData.contract_additional_info?.terms_n_conditions == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}
				</p>
			</div>

			<div>
				<label class="font-bold">{{ $t("formLabels.is_software_application") }}</label>
				<p class="break-words">
					{{ editData.contract_additional_info?.is_software_application == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}
				</p>
			</div>
            
			

            <custom-input-view v-if="editData?.custom_additional_informations?.length" :custom-inputs="editData?.custom_additional_informations" />
		</div>

		<div class="text-right">
            <novok-button type="cyan" :loading="loading" :disabled="loading" @click.prevent="backClick">
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
