<!-- eslint-disable vue/require-valid-default-prop -->
<!-- eslint-disable camelcase -->
<script setup lang="ts">
	import moment from "moment";
	import { reminderData, contractType, contractTypeCopy, FormContractStatusData } from "~/helper/data";

	import { ContractData, CurrencyData, CurrencySymbole, ContractTermType } from "~/helper/data";
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
		(currData) => {
			if (currData.tab === "primary-details" || currData.tab === "all") {
				// v$.value.$reset();
				if (Object.keys(currData || {}).length) {
					const tempObj: any = [];

					currData.reminder_send_to.forEach((key: any) => {
						reminderData.forEach((field: any) => {
							if (field.value === key.reminder_send_to) {
								tempObj.push({
									label: field.label,
									value: field.value,
								});
							}
						});
					});

					getReminderData.value = tempObj;

					if (currData.status == 3 || currData.status == 4) {
						showContractDates.value = true;
					} else {
						showContractDates.value = false;
					}
				}

				Object.assign(customFields, currData?.custom_primary_details);
			}
		}
	);

	const cancel = () => {
		navigateTo(localePath("/contracts"));
	};

	const nextClick = () => {
		store.setActiveTab("upload-contract");
		emit("active-tab-name", "upload-contract");
		navigateTo(
			localePath({
				path: route.fullPath,
				query: { tab: "upload-contract" },
			}),
			{ replace: true }
		);
	};
</script>

<template>
	<div class="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
		<div>
			<label class="font-bold">{{ $t("formLabels.project_number") }}</label>
			<p class="break-words">{{ editData?.project_code != "" ? editData?.project_code : "-" }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.parent_entity") }}</label>
			<p class="break-words">{{ editData?.parent_entity }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.signing_entity") }}</label>
			<p class="break-words">{{ editData?.signing_entity?.sub_entity_name ?? "-" }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.contract_title") }}</label>
			<p class="break-words">{{ editData?.title ?? "-" }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.contract_description") }}</label>
			<p class="break-words">{{ editData?.contract_description != "" ? editData?.contract_description : "-" }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.contract_type") }}</label>
			<p class="break-words">{{ contractTypeCopy[editData?.contract_type] ?? "-" }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.contract_number") }}</label>
			<p class="break-words">{{ editData?.contract_number ?? "-" }}</p>
		</div>
		<div v-if="contractTypeCopy[editData?.contract_type] === 'SOW'">
			<label class="font-bold">{{ $t("formLabels.master_contract_id") }}</label>
			<p class="break-words">
				{{
					editData?.master_contract?.contract_number
						? `${editData?.master_contract?.contract_number} (${editData?.master_contract?.title})`
						: "-"
				}}
			</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.contract_owner") }}</label>
			<p class="break-words">
				{{ editData?.contract_owner?.full_name ? `${editData?.contract_owner?.full_name} (${editData?.contract_owner?.email})` : "-" }}
			</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.supplier_name") }}</label>
			<p class="break-words">
				{{
					editData?.tenant_supplier?.full_name
						? `${editData?.tenant_supplier?.full_name} (${editData?.tenant_supplier?.company_name})`
						: "-"
				}}
			</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.category_level_1") }}</label>
			<p class="break-words">{{ editData?.category_level_one?.category_name ?? "-" }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.category_level_2") }}</label>
			<p class="break-words">{{ editData?.category_level_two?.category_name ?? "-" }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.category_level_3") }}</label>
			<p class="break-words">{{ editData?.category_level_three?.category_name ?? "-" }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.currency") }}</label>
			<p class="break-words">{{ editData?.currency != "" ? editData?.currency : "-" }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.value_of_contract") }}</label>
			<p class="break-words">
				<span v-if="editData?.value_of_contract != ''">
					{{ editData?.currency_symbol }} {{ commaThreeDigitFormat(parseInt(editData?.value_of_contract)) }}
				</span>
				<span v-else>-</span>
			</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.is_personal_data_involved") }}</label>
			<p class="break-words">{{ editData?.is_personal_data_involved === 0 ? "No" : "Yes" }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.estimated_budget") }}</label>
			<p class="break-words">
				<span v-if="editData?.estimated_budget != ''">
					{{ editData?.currency_symbol }} {{ commaThreeDigitFormat(parseInt(editData?.estimated_budget)) }}
				</span>
				<span v-else>-</span>
			</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.budget_owner") }}</label>
			<p class="break-words">
				{{ editData?.budget_owner?.full_name ? `${editData?.budget_owner?.full_name} (${editData?.budget_owner?.email})` : "-" }}
			</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.authorised_signatory_id") }}</label>
			<p class="break-words">
				{{
					editData?.authorised_signatory?.full_name
						? `${editData?.authorised_signatory?.full_name} (${editData?.authorised_signatory?.email})`
						: "-"
				}}
			</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.supplier_authorised_signatory_id") }}</label>
			<p class="break-words">
				{{
					editData?.supplier_authorised_signatory?.full_name
						? `${editData?.supplier_authorised_signatory?.full_name} (${editData?.supplier_authorised_signatory?.company_name})`
						: "-"
				}}
			</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.department_line_of_business") }}</label>
			<p class="break-words">{{ editData?.department_line_of_business ?? "-" }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.contract_term_type") }}</label>
			<p class="break-words">{{ editData?.contract_term_type === 0 ? "Fixed" : "Auto-Renewed" ?? "-" }}</p>
		</div>
		<div>
			<label class="font-bold block">{{ $t("formLabels.Status") }}</label>
			<el-tag
				:class="
					editData.status === 1
						? 'bg-primary/10 text-primary border-primary cursor-pointer'
						: editData.status === 2
						? 'bg-warning/10 text-warning border-warning cursor-pointer'
						: editData.status === 3
						? 'bg-success/10 text-success border-success cursor-pointer'
						: editData.status === 4
						? 'bg-danger/10 text-danger border-danger events-none cursor-not-allowed'
						: editData.status === 5
						? 'bg-danger/10 text-danger border-danger events-none cursor-not-allowed'
						: 'bg-danger/10 text-danger border-danger events-none cursor-not-allowed'
				"
			>
				{{
					editData?.status === 1
						? "Draft"
						: editData?.status === 2
						? "Pending"
						: editData?.status === 3
						? "Active"
						: editData?.status === 4
						? "Expired"
						: editData?.status === 5
						? "Terminated"
						: "Expired" ?? "-"
				}}
			</el-tag>
		</div>
		<div v-if="showContractDates">
			<label class="font-bold">{{ $t("formLabels.contract_start_date") }}</label>
			<p class="break-words">{{ editData?.contract_start_date != "" ? editData?.contract_start_date : "-" }}</p>
		</div>
		<div v-if="showContractDates">
			<label class="font-bold">{{ $t("formLabels.contract_end_date") }}</label>
			<p class="break-words">{{ editData?.contract_end_date != "" ? editData?.contract_end_date : "-" }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.notice_period_days") }}</label>
			<p class="break-words">{{ editData?.notice_period_days ?? "-" }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.reminders_set") }}</label>
			<p class="break-words">{{ editData?.is_reminders_set == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}</p>
		</div>
		<div v-if="editData?.is_reminders_set == 1">
			<label class="font-bold">{{ $t("formLabels.reminder_send_to") }}</label>
			<ul class="flex gap-1" v-for="data in getReminderData" :key="data.id">
				<li class="d-inline-block">
					<span class="mr-1">&#8226;</span>
					{{ data.label || "" }}
				</li>
			</ul>
		</div>
		<div v-if="editData?.is_reminders_set == 1">
			<label class="font-bold">{{ $t("formLabels.send_reminders_from_days") }}</label>
			<p class="break-words">{{ editData?.reminder_from_days }}</p>
		</div>
		<div v-if="editData?.is_reminders_set == 1">
			<label class="font-bold">{{ $t("formLabels.at_frequency_days") }}</label>
			<p class="break-words">{{ editData?.frequency_of_days }}</p>
		</div>
		<div v-if="editData?.status === 5 || editData?.status === 6">
			<label class="font-bold">{{ $t("formLabels.reason") }}</label>
			<p class="break-words">{{ editData?.reason }}</p>
		</div>

		<custom-input-view v-if="editData?.custom_primary_details?.length" :custom-inputs="editData?.custom_primary_details" />
	</div>
	<div class="p-6 text-right">
		<novok-button class="btn-dark my-1" @click="cancel">
			<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
			<i class="fa-solid fa-xmark sm:hidden"></i>
		</novok-button>

		<novok-button class="my-1" type="info" :loading="loading" :disabled="loading" @click.prevent="nextClick"
			>{{ $t("buttons.next") }}
		</novok-button>
	</div>
</template>
