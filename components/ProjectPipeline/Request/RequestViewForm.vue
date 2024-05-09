<script setup lang="ts">
	import moment from "moment";

	const props = defineProps({
		cancelBtn: {
			type: Boolean,
			default: true,
		},
	});

	const fullscreenLoading = ref(false);
	const route = useRoute();
	const localePath = useLocalePath();
	const { t } = useI18n();
	const customFields = reactive([]);
	const customFieldRef = ref<any>(null);
	const categories = ref<any>([]);
	const subCategories = ref<any>([]);

	const formData = reactive<any>({});

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

	onMounted(async () => {
		await getEditTableData();
	});

	const getEditTableData = async () => {
		fullscreenLoading.value = true;
		try {
			const res: any = await useApiFetch(`/requests/${route.params?.id}/view`, {
				method: "GET",
			});

			// Object.keys(formData).forEach((field) => {
			// 	if (res?.data?.[field] !== undefined && res?.data?.[field] !== null) {
			// 		formData[field] = res?.data?.[field];
			// 		formData.budget = formData.budget
			// 			.toString()
			// 			.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
			// 			.replace(/\.00$/, "");
			// 	}
			// });

			Object.assign(formData, res?.data);

			Object.assign(customFields, res?.data?.custom_primary_details);

			fullscreenLoading.value = false;
		} catch {
			fullscreenLoading.value = false;
		}
	};
</script>
<template>
	<div class="p-4" v-loading="fullscreenLoading">
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
			<div>
				<label class="font-bold block">{{ $t("formLabels.is_urgent") }}</label>
				<p class="break-words">{{ formData.is_urgent == 1 ? "YES" : "NO" }}</p>
			</div>

			<div v-if="formData.is_urgent">
				<label class="font-bold block">{{ $t("formLabels.information_why_is_urgent") }}</label>
				<p class="break-words">{{ formData.information_why_is_urgent || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.request_number") }}</label>
				<p class="break-words">{{ formData.request_number }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.parent_entity") }}</label>
				<p class="break-words">{{ formData.parent_entity || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.signing_entity") }}</label>
				<p class="break-words">{{ formData.signingEntity?.sub_entity_name || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.request_type") }}</label>
				<p class="break-words">
					{{
						formData.request_type == 1
							? "New requirement"
							: formData.request_type == 2
							? "Renewal"
							: formData.request_type == 3
							? "Compliance"
							: formData.request_type == 4
							? "Benchmarking"
							: formData.request_type == 5
							? "Change Request"
							: ""
					}}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.requestor") }}</label>
				<p class="break-words">
					{{ formData.requester_full_name ? formData.requester_full_name + " " + "(" + formData.requester_email + ")" : "-" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.request_owner") }}</label>
				<p class="break-words">
					{{ formData.request_owner_full_name ? formData.request_owner_full_name + " " + "(" + formData.request_owner_email + ")" : "-" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.title") }}</label>
				<p class="break-words">{{ formData.title || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.requirement/needs") }}</label>
				<p class="break-words">{{ formData.requirement || "-" }}</p>
			</div>
			<div>
				<label class="font-bold block">{{ $t("formLabels.category_level_1") }}</label>
				<p class="break-words">{{ formData.category_level_1?.category_name || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.category_level_2") }}</label>
				<p class="break-words">{{ formData.sub_category_level_2?.category_name || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.personal_data_involved") }}</label>
				<p class="break-words">{{ formData.personal_data_involved == 1 ? "YES" : "NO" || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.currency") }}</label>
				<p class="break-words">{{ formData.budget_currency }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.budget") }}</label>
				<p class="break-words">{{ formData.budget || "-" }}</p>
			</div>
			<div>
				<label class="font-bold block">{{ $t("formLabels.expected_date_of_completion") }}</label>
				<p class="break-words">
					{{
						formData.expected_dates_of_completion ? moment(`${formData.expected_dates_of_completion}`).format("DD/MM/YYYY  hh:mm A") : "-"
					}}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.business_unit") }}</label>
				<p class="break-words">{{ formData.business_unit || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.additional_information") }}</label>
				<p class="break-words">{{ formData.additional_information || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.authorised_signatory") }}</label>
				<p class="break-words">
					{{
						formData.authorised_signatory_full_name
							? formData.authorised_signatory_full_name + " " + "(" + formData.authorised_signatory_email + ")"
							: "-"
					}}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.budget_owner") }}</label>
				<p class="break-words">
					{{ formData.budget_owner_full_name ? formData.budget_owner_full_name + " " + "(" + formData.budget_owner_email + ")" : "-" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.Status") }}</label>
				<el-tag
					class="font-bold"
					:class="
						formData.status == 1
							? 'border border-primary  bg-primary/10  text-primary '
							: formData.status == 2
							? 'border border-success  text-success bg-success/10 '
							: 'border border-danger  text-danger bg-danger/10  '
					"
				>
					{{ formData.status == 1 ? "Awaited" : formData.status == 2 ? "Approved" : formData.status == 3 ? "Rejected" : "" }}
				</el-tag>
			</div>

			<div v-if="formData.status == 3">
				<label class="font-bold block">{{ $t("formLabels.reason_of_reject") }}</label>
				<p class="break-words">
					{{ formData.reason_of_reject }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.do_you_have_identified_supplier") }}</label>
				<p class="break-words">
					{{ formData.have_you_identified_supplier === 1 ? "Yes" : "No" }}
				</p>
			</div>

			<div v-if="formData.have_you_identified_supplier">
				<label class="font-bold block">{{ $t("formLabels.justification") }}</label>
				<p class="break-words">
					{{ formData.justification }}
				</p>
			</div>

			<div v-if="formData.have_you_identified_supplier" class="col-span-1 sm:col-span-2 md:col-span-3 xl:col-span-4 gap-4">
				<label class="font-bold block text-lg">{{ $t("formLabels.stakeholder_details") }}</label>
				<el-table :data="formData?.identified_supplier" :row-class-name="tableRowClassName" stripe>
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

			<custom-input-view v-if="formData?.custom_primary_details?.length" :custom-inputs="formData?.custom_primary_details" />
		</div>
		<div v-if="cancelBtn" class="text-right">
			<novok-button class="btn-dark my-1" @click="CancelRedirect('/project-pipeline/requests')">
				<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
				<i class="fa-solid fa-xmark sm:hidden"></i>
			</novok-button>
		</div>
	</div>
</template>
