<script lang="ts" setup>
	import { ref } from "vue";
	import type { TabsPaneContext } from "element-plus";
	const { t } = useI18n();
	import { reminderData, contractType, contractTypeCopy, FormContractStatusData, documentTypeToInfo } from "~/helper/data";
	import { contractStore } from "~/store/contract";

	useHead({
		title: "View Contract",
	});

	const activeTab = ref<any>("primary-details");
	const store = contractStore();
	const route = useRoute();
	const editData = ref<any>({});
	const fullscreenLoading = ref(true);
	const localePath = useLocalePath();
	const disabled = ref(true);
	const buttonName = ref<any>(t("buttons.edit"));
	const tabs = ref<any>("");
	const btn = ref<any>("");
	const disabledStatus = ref([4, 5, 6]);
	const getReminderData = ref<any>([]);

	onMounted(async () => {
		activeTab.value = route.query?.tab ? route.query?.tab : activeTab.value;
		store.setActiveTab(activeTab.value);
		await getEditData(activeTab.value);
		// const scrollBar = tabs.value.$el.querySelector(".el-tabs__nav-scroll");
		// scrollBar.appendChild(btn.value.$el);
		// scrollBar.classList.add("mr-20");
	});

	const handleClick = (tab: TabsPaneContext) => {
		buttonName.value = disabled.value ? t("buttons.edit") : "";
		store.setActiveTab(tab.paneName);
		editData.value = {};
		getEditData(tab.paneName);
		navigateTo(
			localePath({
				path: route.fullPath,
				query: { tab: tab.paneName },
			}),
			{ replace: true }
		);
	};

	const activeTabName = (value: any) => {
		activeTab.value = value;
		getEditData(value);
	};

	const getEditData = async (tabName: any) => {
		try {
			const res: any = await useApiFetch(`/contracts/${route?.params?.id}`, {
				method: "GET",
			});

			editData.value = { ...res?.data, tab: tabName };

			const tempObj: any = [];

			editData.value.reminder_send_to.forEach((key: any) => {
				reminderData.forEach((field: any) => {
					if (field.value === key.reminder_send_to) {
						tempObj.push({
							label: field.label,
							value: field.value,
						});
					}
				});
			});

			const getDocumentData: any = documentTypeToInfo;
			const tempArr: any = [];
			editData.value.documents.forEach((document: any) => {
				if (document.document_type === 12) {
					tempArr.push(document);
				} else {
					editData.value[getDocumentData[document.document_type]] = document;
				}
			});

			editData.value.other_certificate = tempArr;
			getReminderData.value = tempObj;

			fullscreenLoading.value = false;
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const iconClick = () => {
		disabled.value = !disabled.value;
		buttonName.value = disabled.value ? t("buttons.edit") : "";
		const scrollBar = tabs.value.$el.querySelector(".el-tabs__nav-scroll");
		scrollBar.classList.remove("mr-20");
	};

	const disabledData = (value: any) => {
		disabled.value = value;
		buttonName.value = disabled.value ? t("buttons.edit") : "";
		const scrollBar = tabs.value.$el.querySelector(".el-tabs__nav-scroll");
		scrollBar.classList.add("mr-20");
	};

	const getData = computed(() => {
		return buttonName.value;
	});

	const getSelectedReminderData = computed(() => {
		return getReminderData.value;
	});

	const handleEditClick = (tab: any) => {
		navigateTo(
			localePath({
				path: "/contracts/edit-contract/" + route.params.id,
				query: { tab: tab },
			}),
			{ replace: true }
		);
	};
</script>

<template>
	<div class="p-4" v-if="!fullscreenLoading">
		<!-- primary details tab -->
		<div class="tab mb-5">
			<div class="flex items-center justify-between">
				<div class="labels flex items-center gap-1">
					<h2 class="text-2xl font-bold">{{ $t("formLabels.primary_details") }}</h2>
					<BaseLabel :tooltip-content="$t('formLabels.primary_details')" />
				</div>
				<novok-button ref="btn" type="info" @click="handleEditClick('primary-details')">
					{{ $t("buttons.edit") }}
				</novok-button>
			</div>

			<!-- primary tab details -->
			<div class="tab-details mt-4">
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.project_number") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.project_code ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.contract_title") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.title ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.contract_type") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_type ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.contract_number") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_number ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.contract_owner") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_owner ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.supplier_name") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.tenant_supplier_id ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.currency") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.currency ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.value_of_contract") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.currency_symbol }} {{ editData.value_of_contract }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.contract_term_type") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_term_type ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.Status") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.status ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.contract_start_date") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_start_date ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.contract_end_date") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_end_date ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.notice_period_days") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.notice_period_days ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.reminders_set") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.is_reminders_set == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0" v-if="editData.is_reminders_set == 1">
					<dt class="font-bold leading-6">{{ $t("formLabels.reminder_send_to") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						<ul class="flex gap-1">
							<li
								v-for="data in getSelectedReminderData"
								:key="data.value"
								class="bg-dark/10 rounded-md py-1 px-2 d-inline-block font-bold text-dark/80"
							>
								{{ data.label }}
							</li>
						</ul>
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0" v-if="editData.is_reminders_set == 1">
					<dt class="font-bold leading-6">{{ $t("formLabels.send_reminders_from_days") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.reminder_from_days }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0" v-if="editData.is_reminders_set == 1">
					<dt class="font-bold leading-6">{{ $t("formLabels.at_frequency_days") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.frequency_of_days }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0" v-if="editData.status === 5 || editData.status === 6">
					<dt class="font-bold leading-6">{{ $t("formLabels.reason") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.reason }}</dd>
				</div>
			</div>
		</div>

		<!-- upload-contract tab -->
		<div class="tab mb-5">
			<div class="flex items-center justify-between">
				<div class="labels flex items-center gap-1">
					<h2 class="text-2xl font-bold">{{ $t("formLabels.upload_contract") }}</h2>
					<BaseLabel :tooltip-content="$t('formLabels.upload_contract')" />
				</div>
				<novok-button ref="btn" type="info" @click="handleEditClick('upload-contract')">
					{{ $t("buttons.edit") }}
				</novok-button>
			</div>

			<!-- upload-contract details -->
			<div class="tab-details mt-4">
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.upload_contract") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{ editData.upload_contract ?? "-" }}
					</dd>
				</div>
			</div>
		</div>

		<!-- secondary details tab -->
		<div class="tab mb-5">
			<div class="flex items-center justify-between">
				<div class="labels flex items-center gap-1">
					<h2 class="text-2xl font-bold">{{ $t("formLabels.secondary_details") }}</h2>
					<BaseLabel :tooltip-content="$t('formLabels.secondary_details')" />
				</div>
				<novok-button ref="btn" type="info" @click="handleEditClick('secondary-details')">
					{{ $t("buttons.edit") }}
				</novok-button>
			</div>

			<!-- secondary tab details -->
			<div class="tab-details mt-4">
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.operational_lead_name") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.operational_lead_name ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.email") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.operational_lead_email ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.supplier_lead_name") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.supplier_lead_id ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.email") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.supplier_lead_email ?? "-" }}</dd>
				</div>
			</div>
		</div>

		<!-- categorization details tab -->
		<div class="tab mb-5">
			<div class="flex items-center justify-between">
				<div class="labels flex items-center gap-1">
					<h2 class="text-2xl font-bold">{{ $t("formLabels.categorisation") }}</h2>
					<BaseLabel :tooltip-content="$t('formLabels.categorisation')" />
				</div>
				<novok-button ref="btn" type="info" @click="handleEditClick('categorization')">
					{{ $t("buttons.edit") }}
				</novok-button>
			</div>

			<!-- categorization tab details -->
			<div class="tab-details mt-4">
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.primary_category") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						<span v-if="editData.primary_category" class="bg-dark/10 rounded-md py-1 px-2 d-inline-block font-bold text-dark/80">
							{{ editData.primary_category.category_name }}
						</span>
						<span v-else>-</span>
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.secondary_categoriazation") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						<span v-if="editData.secondary_categoriazation" class="bg-dark/10 rounded-md py-1 px-2 d-inline-block font-bold text-dark/80">
							{{ editData.secondary_categoriazation.category_name }}
						</span>
						<span v-else>-</span>
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.third_categoriazation") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						<span v-if="editData.third_categoriazation" class="bg-dark/10 rounded-md py-1 px-2 d-inline-block font-bold text-dark/80">
							{{ editData.third_categoriazation.category_name }}
						</span>
						<span v-else>-</span>
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.fourth_categoriazation") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						<span v-if="editData.fourth_categoriazation" class="bg-dark/10 rounded-md py-1 px-2 d-inline-block font-bold text-dark/80">
							{{ editData.fourth_categoriazation.category_name }}
						</span>
						<span v-else>-</span>
					</dd>
				</div>
			</div>
		</div>

		<!-- signatory details tab -->
		<div class="tab mb-5">
			<div class="flex items-center justify-between">
				<div class="labels flex items-center gap-1">
					<h2 class="text-2xl font-bold">{{ $t("formLabels.signatory_details") }}</h2>
					<BaseLabel :tooltip-content="$t('formLabels.signatory_details')" />
				</div>
				<novok-button ref="btn" type="info" @click="handleEditClick('signatory-details')">
					{{ $t("buttons.edit") }}
				</novok-button>
			</div>

			<!-- secondary tab details -->
			<div class="tab-details mt-4">
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.supplier_lead_name") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.supplier_lead_name ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.email") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.supplier_lead_email ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.date_of_signature") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.date_of_supplier_authorised_signatory_signature ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.signature") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.supplier_authorised_signatory_signature ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.operational_lead_name") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.operational_lead_id ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.email") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.operational_lead_email ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.date_of_signature") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.date_of_authorised_signatory_signature ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.signature") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.authorised_signatory_signature ?? "-" }}</dd>
				</div>
			</div>
		</div>

		<!-- supporting information tab -->
		<div class="tab mb-5">
			<div class="flex items-center justify-between">
				<div class="labels flex items-center gap-1">
					<h2 class="text-2xl font-bold">{{ $t("formLabels.supporting_information") }}</h2>
					<BaseLabel :tooltip-content="$t('formLabels.supporting_information')" />
				</div>
				<novok-button ref="btn" type="info" @click="handleEditClick('supporting-information')">
					{{ $t("buttons.edit") }}
				</novok-button>
			</div>

			<!-- secondary tab details -->
			<div class="tab-details mt-4">
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.subcontractors") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						<ul class="flex gap-1">
							<li
								v-for="(data, index) in editData.contract_supporting_info.subcontractors"
								:key="index"
								class="bg-dark/10 rounded-md py-1 px-2 d-inline-block font-bold text-dark/80"
							>
								{{ data }}
							</li>
						</ul>
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.manage_subcontractors") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{ editData.contract_supporting_info.manage_subcontractors == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.any_material_subcontractors") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.any_material_subcontractors ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.additional_comments") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.additional_comments ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.alternative_service_goods_provider") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.alternative_service_goods_provider ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.benchmarking_price_review_date") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.benchmarking_price_review_date ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.country_of_service_product_delivery") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						<ul class="flex gap-1" v-if="editData.contract_supporting_info.country_of_service_product_delivery.length > 0">
							<li
								v-for="(data, index) in editData.contract_supporting_info.country_of_service_product_delivery"
								:key="index"
								class="bg-dark/10 rounded-md py-1 px-2 d-inline-block font-bold text-dark/80"
							>
								{{ data }}
							</li>
						</ul>
						<span v-else>-</span>
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.location_served") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						<ul class="flex gap-1" v-if="editData.contract_supporting_info.location_served.length > 0">
							<li
								v-for="(data, index) in editData.contract_supporting_info.location_served"
								:key="index"
								class="bg-dark/10 rounded-md py-1 px-2 d-inline-block font-bold text-dark/80"
							>
								{{ data }}
							</li>
						</ul>
						<span v-else>-</span>
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.service_provision") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.service_provision ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.service_provision_two") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.service_provision_two ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.service_provision_three") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.service_provision_three ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.service_provision_four") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.service_provision_four ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.country_of_sub_contractor_registration") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{ editData.contract_supporting_info.country_of_sub_contractor_registration ?? "-" }}
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.country_of_sub_contractor_registration_two") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{ editData.contract_supporting_info.country_of_sub_contractor_registration_two ?? "-" }}
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.country_of_sub_contractor_registration_three") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{ editData.contract_supporting_info.country_of_sub_contractor_registration_three ?? "-" }}
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.country_of_sub_contractor_registration_four") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{ editData.contract_supporting_info.country_of_sub_contractor_registration_four ?? "-" }}
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.department") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.department ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.does_it_align_to_key_business_risk") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{ editData.contract_supporting_info.does_it_align_to_key_business_risk == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}
					</dd>
				</div>
				<div
					class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0"
					v-if="editData.contract_supporting_info.does_it_align_to_key_business_risk"
				>
					<dt class="font-bold leading-6">{{ $t("formLabels.explain_the_risk") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.explain_the_risk ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.estimated_annual_budget_cost") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.estimated_annual_budget_cost ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.estimated_annual_budget_cost_currency") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{ editData.contract_supporting_info.estimated_annual_budget_cost_currency ?? "-" }}
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.executive_sponsor_name") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.executive_sponsor_name ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.executive_sponsor_email") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.executive_sponsor_email ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.exit_plan") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{ editData.contract_supporting_info.exit_plan == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.governing_law") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.governing_law ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.is_service_provided_by_client") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{ editData.contract_supporting_info.is_service_provided_by_client == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.is_disaster_recovery_in_place") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{ editData.contract_supporting_info.is_disaster_recovery_in_place == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.is_third_party_supporting_time_critical_business_operations") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{
							editData.contract_supporting_info.is_third_party_supporting_time_critical_business_operations == 1
								? $t("formLabels.yes")
								: $t("formLabels.no")
						}}
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.is_personal_data") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{ editData.contract_supporting_info.is_personal_data == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.is_cloud_service_provider") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{ editData.contract_supporting_info.is_cloud_service_provider == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.is_this_outsourcing_contract") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{ editData.contract_supporting_info.is_this_outsourcing_contract == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.risk_assessment_due") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.risk_assessment_due ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.legal_name_of_contracting_entity") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.legal_name_of_contracting_entity ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.data_stored_in_country_one") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.data_stored_in_country_one ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.data_stored_in_country_two") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.data_stored_in_country_two ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.data_stored_in_country_three") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.data_stored_in_country_three ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.audit_date") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.audit_date ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.parent_contracting_company") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.parent_contracting_company ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.notice_period_days") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.notice_period_days ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.is_one_off_spend") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{ editData.contract_supporting_info.is_one_off_spend == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.master_contract_name") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.master_contract_name ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.master_contract_number") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.master_contract_number ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.payment_terms_days") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.payment_terms_days ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.pay_group") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.pay_group ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.primary_contact_name") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.primary_contact_name ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.primary_contact_title") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.primary_contact_title ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.primary_contact_email") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.primary_contact_email ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.primary_contact_number") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{ editData.contract_supporting_info.primary_contact_country_code }}
						{{ editData.contract_supporting_info.primary_contact_number }}
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.rebate") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{ editData.contract_supporting_info.rebate == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.regulatory_notification") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{ editData.contract_supporting_info.regulatory_notification == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.risk_level") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">{{ editData.contract_supporting_info.risk_level ?? "-" }}</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.SLAs") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{ editData.contract_supporting_info.SLAs == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.termination_for_convenience") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{ editData.contract_supporting_info.termination_for_convenience == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.terms_n_conditions") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{ editData.contract_supporting_info.terms_n_conditions == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.is_software_application") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{ editData.contract_supporting_info.is_software_application == 1 ? $t("formLabels.yes") : $t("formLabels.no") }}
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.volume_discount_rebate_collection_date") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						{{ editData.contract_supporting_info.volume_discount_rebate_collection_date ?? "-" }}
					</dd>
				</div>
			</div>
		</div>

		<!-- supporting_documents tab -->
		<div class="tab mb-5">
			<div class="flex items-center justify-between">
				<div class="labels flex items-center gap-1">
					<h2 class="text-2xl font-bold">{{ $t("formLabels.supporting_documents") }}</h2>
					<BaseLabel :tooltip-content="$t('formLabels.supporting_documents')" />
				</div>
				<novok-button ref="btn" type="info" @click="handleEditClick('supporting-documents')">
					{{ $t("buttons.edit") }}
				</novok-button>
			</div>

			<!-- supporting documents details -->
			<div class="tab-details mt-4">
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.gdpr") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						<a
							class="text-blue-500 hover:underline hover:underline-offset-4"
							target="blank"
							:href="editData.gdpr.document_path"
							v-if="editData.gdpr"
							>{{ editData.gdpr.document_path }}</a
						>
						<span v-else>-</span>
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.kpi") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						<a
							class="text-blue-500 hover:underline hover:underline-offset-4"
							target="blank"
							:href="editData.kpis.document_path"
							v-if="editData.kpis"
							>{{ editData.kpis.document_path }}</a
						>
						<span v-else>-</span>
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.sla") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						<a
							class="text-blue-500 hover:underline hover:underline-offset-4"
							target="blank"
							:href="editData.SLAs.document_path"
							v-if="editData.SLAs"
							>{{ editData.SLAs.document_path }}</a
						>
						<span v-else>-</span>
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.sustainability") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						<a
							class="text-blue-500 hover:underline hover:underline-offset-4"
							target="blank"
							:href="editData.sustainability.document_path"
							v-if="editData.sustainability"
							>{{ editData.sustainability.document_path }}</a
						>
						<span v-else>-</span>
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.modern_slavery") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						<a
							class="text-blue-500 hover:underline hover:underline-offset-4"
							target="blank"
							:href="editData.modern_slavery.document_path"
							v-if="editData.modern_slavery"
							>{{ editData.modern_slavery.document_path }}</a
						>
						<span v-else>-</span>
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.anti_money_laundering") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						<a
							class="text-blue-500 hover:underline hover:underline-offset-4"
							target="blank"
							:href="editData.anti_money_laundering.document_path"
							v-if="editData.anti_money_laundering"
							>{{ editData.anti_money_laundering.document_path }}</a
						>
						<span v-else>-</span>
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.esg") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						<a
							class="text-blue-500 hover:underline hover:underline-offset-4"
							target="blank"
							:href="editData.esg.document_path"
							v-if="editData.esg"
							>{{ editData.esg.document_path }}</a
						>
						<span v-else>-</span>
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.social_value") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						<a
							class="text-blue-500 hover:underline hover:underline-offset-4"
							target="blank"
							:href="editData.social_value.document_path"
							v-if="editData.social_value"
							>{{ editData.social_value.document_path }}</a
						>
						<span v-else>-</span>
					</dd>
				</div>
				<div class="detail mb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
					<dt class="font-bold leading-6">{{ $t("formLabels.other_certificate") }}</dt>
					<dd class="leading-6 sm:col-span-2 sm:mt-0">
						<template v-if="editData.other_certificate">
							<a
								class="text-blue-500 block mb-1 hover:underline hover:underline-offset-4"
								target="blank"
								:href="data.document_path"
								v-for="(data, index) in editData.other_certificate"
								:key="index"
								>{{ data.document_path }}</a
							>
						</template>
						<span v-else>-</span>
					</dd>
				</div>
			</div>
		</div>
	</div>
</template>
<style>
	/* @import "~/assets/css/main.css"; */
</style>
