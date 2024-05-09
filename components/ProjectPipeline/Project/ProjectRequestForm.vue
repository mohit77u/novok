<script setup lang="ts">
	import { supplierStore } from "~/store/supplier";
	import moment from "moment";
	import { commaThreeDigitFormat } from "~/helper/common";

	const props = defineProps({
		editData: {
			type: Object,
		},
	});

	const SupplierStore = supplierStore();
	const localePath = useLocalePath();
	const route = useRoute();
	const { t } = useI18n();

	const emit = defineEmits(["active-tab-name"]);

	const tableColumns = ref([
		{
			columnName: "supplier_name",
			columnLabel: t("columnLabels.supplier_name"),
		},
		{
			columnName: "supplier_email",
			columnLabel: t("formLabels.supplier_email"),
		},
	]);

	const nextClick = () => {
		SupplierStore.setActiveTab("sourcing");
		emit("active-tab-name", "sourcing");
		navigateTo(
			localePath({
				path: route.fullPath,
				query: { tab: "sourcing" },
			}),
			{ replace: true }
		);
	};
</script>

<template>
	<div class="p-4">
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
			<div>
				<label class="font-bold block">{{ $t("formLabels.is_urgent") }}</label>
				<p class="break-words">
					{{ editData.is_urgent == 1 ? "YES" : "NO" }}
				</p>
			</div>

			<div v-if="editData.is_urgent">
				<label class="font-bold block">{{ $t("formLabels.information_why_is_urgent") }}</label>
				<p class="break-words">
					{{ editData.information_why_is_urgent || "-" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.request_number") }}</label>
				<p class="break-words">{{ editData.request_number }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.project_number") }}</label>
				<p class="break-words">{{ editData.project_number }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.parent_entity") }}</label>
				<p class="break-words">{{ editData.parent_entity || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.signing_entity") }}</label>
				<p class="break-words">
					{{ editData.signing_entity?.sub_entity_name || "-" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.request_type") }}</label>
				<!-- <p class="break-words" :class="editData.status == 1 ? 'New Project' : editData.status == 2 ? 'text-onHold' : editData.status == 3 ? 'sourcing' : editData.status == 4 ? 'asdd' : editData.status == 5 ? 'asasa' : "" "> -->
				<p class="break-words">
					{{
						editData.request_type == 1
							? "New requirement"
							: editData.request_type == 2
							? "Renewal"
							: editData.request_type == 3
							? "Compliance"
							: editData.request_type == 4
							? "Benchmarking"
							: editData.request_type == 5
							? "Change Request"
							: ""
					}}
				</p>
			</div>
			<div>
				<label class="font-bold block">{{ $t("formLabels.requestor") }}</label>
				<p class="break-words">
					{{ editData.requester ? editData.requester?.full_name + " " + "(" + editData.requester?.email + ")" : "-" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.request_owner") }}</label>
				<p class="break-words">
					{{ editData.request_owner ? editData.request_owner?.full_name + " " + "(" + editData.request_owner?.email + ")" : "-" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.project_owner") }}</label>
				<p class="break-words">
					{{ editData.project_owner ? editData.project_owner?.full_name + " " + "(" + editData.project_owner?.email + ")" : "-" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.project_title") }}</label>
				<p class="break-words">{{ editData.project_title || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.requirement/needs") }}</label>
				<p class="break-words">{{ editData.requirement || "-" }}</p>
			</div>
			<div>
				<label class="font-bold block">{{ $t("formLabels.category_level_1") }}</label>
				<p class="break-words">
					{{ editData.category_level_one?.category_name || "-" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.category_level_2") }}</label>
				<p class="break-words">
					{{ editData.category_level_two?.category_name || "-" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.personal_data_involved") }}</label>
				<p class="break-words">
					{{ editData.personal_data_involved == 1 ? "YES" : "NO" || "-" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.currency") }}</label>
				<p class="break-words">{{ editData.budget_currency || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.budget") }}</label>
				<p class="break-words">{{ commaThreeDigitFormat(editData.budget) || "-" }}</p>
			</div>
			<div>
				<label class="font-bold block">{{ $t("formLabels.expected_date_of_completion") }}</label>
				<p class="break-words">
					{{
						editData.expected_dates_of_completion ? moment(`${editData.expected_dates_of_completion}`).format("DD/MM/YYYY  hh:mm A") : "-"
					}}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.business_unit") }}</label>
				<p class="break-words">{{ editData.business_unit || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.additional_information") }}</label>
				<p class="break-words">
					{{ editData.additional_information || "-" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.authorised_signatory") }}</label>
				<p class="break-words">
					{{
						editData.authorised_signatory
							? editData.authorised_signatory?.full_name + " " + "(" + editData.authorised_signatory?.email + ")"
							: "-"
					}}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.budget_owner") }}</label>
				<p class="break-words">
					{{ editData.budget_owner ? editData.budget_owner?.full_name + " " + "(" + editData.budget_owner?.email + ")" : "-" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.activity_type") }}</label>
				<p class="break-words">
					{{
						editData.activity_type === 1
							? "Single Source"
							: editData.activity_type === 2
							? "Framework"
							: editData.activity_type === 3
							? "Stay with incumbent"
							: editData.activity_type === 4
							? "Request for Information (RFI)"
							: editData.activity_type === 5
							? "Request for Quotation (RFQ)"
							: editData.activity_type === 6
							? "Invite to Tender (ITT)"
							: ""
					}}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.comment_for_selected_activity_type") }}</label>
				<p class="break-words">
					{{ editData.comment_for_selected_activity_type || "-" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.Status") }}</label>
				<el-tag
					class="break-words font-bold"
					:class="
						editData.status == 1
							? 'border border-newProject bg-newProject/10 text-newProject'
							: editData.status == 2
							? 'border border-onHold bg-onHold/10 text-onHold'
							: editData.status == 3
							? 'border border-sourcing bg-sourcing/10 text-sourcing'
							: editData.status == 4
							? 'border border-selection bg-selection/10 text-selection'
							: editData.status == 5
							? 'border border-signing bg-signing/10 text-signing'
							: editData.status == 6
							? 'border border-supervision bg-supervision/10 text-supervision'
							: ''
					"
				>
					{{
						editData.status == 1
							? "New Project"
							: editData.status == 2
							? "On hold"
							: editData.status == 3
							? "Sourcing"
							: editData.status == 4
							? "Selection"
							: editData.status == 5
							? "Signing"
							: editData.status == 6
							? "Supervision"
							: ""
					}}
				</el-tag>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.do_you_have_identified_supplier") }}</label>
				<p class="break-words">
					{{ editData.have_you_identified_supplier === 1 ? "Yes" : "No" }}
				</p>
			</div>

			<div v-if="editData.have_you_identified_supplier == 1">
				<label class="font-bold block">{{ $t("formLabels.justification") }}</label>
				<p class="break-words">
					{{ editData.justification || "-" }}
				</p>
			</div>

			<div v-if="editData.have_you_identified_supplier" class="col-span-1 sm:col-span-2 md:col-span-3 xl:col-span-4 gap-4">
				<label class="font-bold block text-lg">{{ $t("formLabels.stakeholder_details") }}</label>
				<el-table :data="editData?.identified_suppliers" :row-class-name="tableRowClassName" stripe>
					<el-table-column v-for="column in tableColumns" :key="column.id" :prop="column.columnName" :label="column.columnLabel" />
					<el-table-column prop="attach_quotation" :label="$t('formLabels.attach_quotation')">
						<template #default="{ row }">
							<el-link v-if="row.attach_quotation" :href="row.attach_quotation" target="_blank" class="text-primary">{{
								row.file_name
							}}</el-link>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</div>
		<div class="text-right">
			<novok-button class="btn-dark my-1" @click="CancelRedirect('/project-pipeline/projects')">
				<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
				<i class="fa-solid fa-xmark sm:hidden"></i>
			</novok-button>

			<novok-button
				v-if="editData.active_tab !== 'request'"
				class="my-1"
				type="info"
				:loading="loading"
				:disabled="loading"
				@click.prevent="nextClick"
				>{{ $t("buttons.next") }}
			</novok-button>
		</div>
	</div>
</template>
