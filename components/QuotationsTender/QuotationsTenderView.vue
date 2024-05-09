<script setup lang="ts">
	import { supplierStore } from "~/store/supplier";
	import { CurrencySymbole, QTdocuments } from "~/helper/data";
	import moment from "moment";
	import { useVuelidate } from "@vuelidate/core";
	import { required, email, minLength, maxLength, helpers, requiredIf } from "@vuelidate/validators";

	const props = defineProps({
		editData: {
			type: Object,
		},
	});

	const copyEditData = ref<any>({
		attach_document: "",
		general_terms_and_conditions: "",
		sow_or_sor: "",
		pricing_matrix: "",
		evaluation_matrix: "",
	});
	const currentPage = ref(1);
	const pageSize = ref(5);
	const total = ref(0);

	const SupplierStore = supplierStore();
	const localePath = useLocalePath();
	const route = useRoute();
	const supplierData = ref<any>([]);
	const { t } = useI18n();
	const fullscreenLoading = ref(false);
	const reminderSendTo = ref<any>([]);
	const loading = ref(false);
	const assignedSuppliers = ref<any>([]);
	const loadMoreLoading = ref(false);
	// const value = ref<CheckboxValueType[]>([]);
	// const checkAll = ref(false);
	// const indeterminate = ref(false);

	const emit = defineEmits(["active-tab-name"]);

	const formData = reactive({
		supplier_ids: [],
	});

	// const rules = computed(() => {
	// 	return {
	// 		answer: {
	// 			required: helpers.withMessage(t("formValidations.answer"), required),
	// 		},
	// 	};
	// });

	// const v$ = useVuelidate(rules, formData);

	watch(
		() => props.editData,
		async (val: any) => {
			val?.documents?.forEach((document: any) => {
				copyEditData.value[QTdocuments[document.document_type]] = document;
			});

			if (val.reminder_send_to) {
				const reminderData = val.reminder_send_to?.split(",").map(Number);
				if (reminderData.includes(1)) {
					reminderSendTo.value.push("Supplier Admin");
				}
				if (reminderData.includes(2)) {
					reminderSendTo.value.push("Project Owner");
				}
				if (reminderData.includes(3)) {
					reminderSendTo.value.push("Project Creator (Client Admin)");
				}
			}
			await getQuestionAnsList();
			await getAssignedSuppliers();
		}
	);

	const getQuestionAnsList = async () => {
		fullscreenLoading.value = true;
		try {
			const res: any = await useApiFetch(
				`/tender-clarifications/${route.params.id}/client-admin/question-answer?perPage=${pageSize.value}&page=${currentPage.value}&sortColumn=&sortOrder=&searchValue=`,
				{
					method: "GET",
				}
			);

			supplierData.value = res.data?.data.map((item: any) => {
				return { ...item, Adminanswer: "", isRequired: false, assigned_suppliers: 1 };
			});
			total.value = res.data?.total;
		} catch (error) {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const onSubmit = async (data: any) => {
		if (data.Adminanswer === "") {
			data.isRequired = true;
		} else {
			data.isRequired = false;
		}

		if (!data.isRequired) {
			sendAnswer(data);
		}
	};

	const getAssignedSuppliers = async () => {
		try {
			loading.value = true;
			const res: any = await useApiFetch(`/tenders/${route.params.id}/assigned-suppliers?perPage=25&searchValue=`, {
				method: "GET",
			});

			assignedSuppliers.value = res.data.data.map((item: any) => {
				return {
					label: item.full_name,
					value: item.id,
				};
			});
		} catch {
		} finally {
			loading.value = false;
		}
	};

	const sendAnswer = async (data: any) => {
		const newData = {
			answer: data.Adminanswer,
			all_suppliers: data.assigned_suppliers,
			supplier_ids: formData.supplier_ids,
		};

		try {
			loading.value = true;
			const res: any = await useApiFetch(`/tender-clarifications/${data.id}`, {
				method: "PATCH",
				body: newData,
			});
			useToast("success", res.message);
			navigateTo(localePath("/quotations-tender/q-t"));
		} catch {
		} finally {
			loading.value = false;
		}
	};

	const dropdownSelectedAssignedSuppliers = (data: any) => {
		formData.supplier_ids = data;
	};

	const getSelectedAssignedSuppliers = computed(() => {
		return assignedSuppliers.value.find((item: any) => item.value === formData.supplier_ids);
	});

	const supplierChange = (value: any) => {
		if (value.Adminanswer === "") {
			value.isRequired = true;
		} else {
			value.isRequired = false;
		}
	};

	const handleCurrentChange = (val: number) => {
		currentPage.value = val;
		getQuestionAnsList();
	};

	const handleSizeChange = (val: number) => {
		currentPage.value = 1;
		pageSize.value = val;
		getQuestionAnsList();
	};

    const LoadMore = async() => {
        loadMoreLoading.value = true;
        let pageNumber  = total.value / pageSize.value;
            pageNumber  = Math.ceil(pageNumber);

        if(currentPage.value <= pageNumber) {
            currentPage.value = currentPage.value + 1
            
            const res: any = await useApiFetch(
                `/tender-clarifications/${route.params.id}/client-admin/question-answer?perPage=${pageSize.value}&page=${currentPage.value}&sortColumn=&sortOrder=&searchValue=`,
                {
                    method: "GET",
                }
            );
    
            res.data?.data.map((item: any) => {
                const data =  { ...item, Adminanswer: "", isRequired: false, assigned_suppliers: 1 };
                supplierData.value .push(data);
            });
        }

        loadMoreLoading.value = false;
	};

    
</script>

<template>
	<div class="p-4" v-loading="fullscreenLoading">
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
			<div>
				<label class="font-bold block">{{ $t("formLabels.tender_quotation_code") }}</label>
				<p class="break-words">{{ editData.qt_code }}</p>
			</div>
			<div>
				<label class="font-bold block">{{ $t("formLabels.project_number") }}</label>
				<p class="break-words">{{ editData.project_code }}</p>
			</div>
			<div>
				<label class="font-bold block">{{ $t("formLabels.project_owner") }}</label>
				<p class="break-words">{{ editData.project_owner }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.parent_entity") }}</label>
				<p class="break-words">{{ editData?.parent_entity }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.signing_entity") }}</label>
				<p class="break-words">{{ editData?.signing_entity?.sub_entity_name }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.qt_authoriser") }}</label>
				<p class="break-words">
					{{ editData?.authoriser ? editData?.authoriser?.full_name + " " + "(" + editData?.authoriser?.email + ")" : "-" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.title") }}</label>
				<p class="break-words">{{ editData.title }}</p>
			</div>
			<div>
				<label class="font-bold block">{{ $t("formLabels.activity_type") }}</label>
				<p class="break-words">
					{{
						editData.activity_type === 1
							? "Request for Quotation"
							: editData.activity_type === 2
							? "Request for Price"
							: editData.activity_type === 3
							? "Request for Information"
							: "-"
					}}
				</p>
			</div>
			<div>
				<label class="font-bold block">{{ $t("formLabels.country") }}</label>
				<p class="break-words">
					{{ editData.country_to_serve }}
				</p>
			</div>
			<div>
				<label class="font-bold block">{{ $t("formLabels.project_summary") }}</label>
				<p class="break-words">{{ editData.project_summary }}</p>
			</div>
			<div>
				<label class="font-bold block">{{ $t("formLabels.category_level_1") }}</label>
				<p class="break-words">{{ editData.category_level_one?.category_name || "-" }}</p>
			</div>
			<div>
				<label class="font-bold block">{{ $t("formLabels.category_level_2") }}</label>
				<p class="break-words">{{ editData.category_level_two?.category_name || "-" }}</p>
			</div>
			<div>
				<label class="font-bold block">{{ $t("formLabels.is_public_tender") }}</label>
				<p class="break-words">{{ editData.is_this_public_tender === 1 ? "Yes" : "No" || "-" }}</p>
			</div>
			<div class="col-span-1 sm:col-span-2 md:col-span-3 xl:col-span-4">
				<label class="font-bold block text-lg">{{ $t("formLabels.suppliers") }}</label>
				<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
					<div v-for="data in editData.assigned_suppliers" :key="data.id">
						<p class="break-words">
							<label class="font-bold">{{ $t("formLabels.supplier_name") }}</label> :
							{{ data.company_name ? data?.company_name + ' ' + "(" + data.full_name + ")" : '-' }}
						</p>
						<p class="break-words">
							<label class="font-bold">{{ $t("formLabels.supplier_code") }}</label> : {{ data.sup_ref_number }}
						</p>
					</div>
				</div>
			</div>
			<div>
				<label class="font-bold block">{{ $t("formLabels.estimated_contract_value") }}</label>
				<p class="break-words">
					{{
						editData.estimated_contract_value
							? CurrencySymbole[editData.estimated_contract_value_currency] + " " + editData.estimated_contract_value
							: "-"
					}}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.hide_from_supplier") }}</label>
				<p class="break-words">{{ editData.is_hide_estimated_contract_value_from_supplier === 1 ? "Yes" : "No" || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.open_date/time") }}</label>
				<p class="break-words">
					{{ editData.open_date ? moment(`${editData.open_date + " " + editData.open_time}`).format("DD/MM/YYYY hh:mm A") : "NA" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.close_date/time") }}</label>
				<p class="break-words">
					{{ editData.close_date ? moment(`${editData.close_date + " " + editData.close_time}`).format("DD/MM/YYYY hh:mm A") : "NA" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.clarification_open_date/time") }}</label>
				<p class="break-words">
					{{
						editData.clarification_open_date
							? moment(`${editData.clarification_open_date + " " + editData.clarification_open_time}`).format("DD/MM/YYYY hh:mm A")
							: "NA"
					}}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.clarification_close_date/time") }}</label>
				<p class="break-words">
					{{
						editData.clarification_close_date
							? moment(`${editData.clarification_close_date + " " + editData.clarification_close_time}`).format("DD/MM/YYYY hh:ss A")
							: "NA"
					}}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.reminders_set") }}</label>
				<p class="break-words">{{ editData.is_reminder === 1 ? "Yes" : "No" || "-" }}</p>
			</div>

			<div v-if="editData.is_reminder">
				<label class="font-bold block">{{ $t("formLabels.reminder_send_to") }}</label>
				<p v-for="data in reminderSendTo" :key="data.id">
					{{ data }}
					<!-- {{ editData.reminder_send_to }} -->
				</p>
			</div>

			<div v-if="editData.is_reminder">
				<label class="font-bold block">{{ $t("formLabels.reminder_from_days") }}</label>
				<p class="break-words">{{ editData.reminder_from_days }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.combined_q_and_t_document") }}</label>
				<p class="break-words">{{ editData.combined_q_and_t_document === 1 ? "Yes" : "No" || "-" }}</p>
			</div>

			<div v-if="editData.combined_q_and_t_document">
				<label class="font-bold block">{{ $t("formLabels.attach_document") }}</label>
				<a
					:class="copyEditData?.attach_document.document_file_name ? 'text-primary underline cursor-pointer break-words' : ''"
					:href="copyEditData.attach_document.document_path"
					target="_blank"
					>{{ copyEditData?.attach_document?.document_file_name || "-" }}</a
				>
			</div>
			<div class="grid col-span-1 sm:col-span-2 md:col-span-3 xl:col-span-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
				<div>
					<label class="font-bold block">{{ $t("formLabels.terms_n_conditions") }}</label>
					<a
						:href="copyEditData.general_terms_and_conditions.document_path"
						:class="
							copyEditData.general_terms_and_conditions.document_file_name ? 'text-primary underline cursor-pointer break-words' : ''
						"
						target="_blank"
						>{{ copyEditData.general_terms_and_conditions.document_file_name || "-" }}</a
					>
				</div>

				<div>
					<label class="font-bold block">{{ $t("formLabels.sow_sor_documents") }}</label>
					<a
						:href="copyEditData.sow_or_sor.document_path"
						:class="copyEditData.sow_or_sor.document_file_name ? 'text-primary underline cursor-pointer break-words' : ''"
						target="_blank"
						>{{ copyEditData.sow_or_sor.document_file_name || "-" }}</a
					>
				</div>

				<div>
					<label class="font-bold block">{{ $t("formLabels.pricing_matrix") }}</label>
					<a
						:href="copyEditData.pricing_matrix.document_path"
						:class="copyEditData.pricing_matrix.document_file_name ? 'text-primary underline cursor-pointer break-words' : ''"
						target="_blank"
						>{{ copyEditData.pricing_matrix.document_file_name || "-" }}</a
					>
				</div>

				<div>
					<label class="font-bold block">{{ $t("formLabels.evaluation_matrix") }}</label>
					<a
						:href="copyEditData.evaluation_matrix.document_path"
						:class="copyEditData.evaluation_matrix.document_file_name ? 'text-primary underline cursor-pointer break-words' : ''"
						target="_blank"
						>{{ copyEditData.evaluation_matrix.document_file_name || "-" }}</a
					>
				</div>
			</div>
			<div>
				<label class="font-bold block">{{ $t("formLabels.business_continuity_policy") }}</label>
				<p class="break-words">{{ editData.business_continuity_policy === 1 ? "Yes" : "No" || "-" }}</p>
			</div>
			<div>
				<label class="font-bold block">{{ $t("formLabels.anti_corruption_and_bribary_policy") }}</label>
				<p class="break-words">{{ editData.anti_corruption_and_bribary_policy === 1 ? "Yes" : "No" || "-" }}</p>
			</div>
			<div>
				<label class="font-bold block">{{ $t("formLabels.environmental_policy") }}</label>
				<p class="break-words">{{ editData.environmental_policy === 1 ? "Yes" : "No" || "-" }}</p>
			</div>
			<div>
				<label class="font-bold block">{{ $t("formLabels.financial_reports") }}</label>
				<p class="break-words">{{ editData.financial_reports === 1 ? "Yes" : "No" || "-" }}</p>
			</div>
			<div>
				<label class="font-bold block">{{ $t("formLabels.modern_slavery_policy") }}</label>
				<p class="break-words">{{ editData.modern_slavery_policy === 1 ? "Yes" : "No" || "-" }}</p>
			</div>
			<div>
				<label class="font-bold block">{{ $t("formLabels.social_values") }}</label>
				<p class="break-words">{{ editData.social_values === 1 ? "Yes" : "No" || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.Status") }}</label>
				<p class="break-words">
					{{
						editData.tender_status == 0
							? "Awaited"
							: editData.tender_status == 1
							? "Upcoming"
							: editData.tender_status == 2
							? "Rejected"
							: editData.tender_status == 3
							? "Open"
							: "Closed"
					}}
				</p>
			</div>

			<div v-if="editData.tender_status === 2">
				<label class="font-bold block">{{ $t("formLabels.reason") }}</label>
				<p class="break-words">{{ editData.reason_of_reject || "-" }}</p>
			</div>

			<custom-input-view v-if="editData?.custom_primary_details?.length" :custom-inputs="editData?.custom_primary_details" />
		</div>

		<div v-if="editData.question_allowed || supplierData.length" class="mt-4">
			<label class="font-bold text-xl mt-5 mb-4 block">{{ $t("formLabels.clarification_section") }}</label>
			<div class="border">
                <template v-if="editData.question_allowed || supplierData.length">
                    <div class="odd:bg-black/5 p-4" v-for="supplier in supplierData" :key="supplier.id">
                        <p>
                            <span class="font-bold">{{ supplier.supplier?.full_name }} :</span> {{ supplier.question }}
                        </p>
                        <p v-if="supplier.answer"><span class="font-bold">Answer :</span> {{ supplier.answer }}</p>

                        <template v-if="supplier.answer == ''">
                            <el-form-item :rules="[{ required: true }]" :label="$t('formLabels.add_reply')" class="md:col-span-6 lg:col-span-6 mb-0 mt-2">
                                <template #label>
                                    <BaseLabel :label="$t('formLabels.add_reply')" :tooltip-content="$t('info.add_reply')" :isShowLabel="false" />
                                </template>
                                <div class="flex w-full">
                                    <el-input
                                        v-model="supplier.Adminanswer"
                                        name="Adminanswer"
                                        type="text"
                                        maxLength="255"
                                        :disabled="!editData.question_allowed"
                                        @change="supplierChange(supplier)"
                                        :class="{
                                            error: supplier.isRequired,
                                        }"
                                    />

                                    <novok-button v-if="editData.question_allowed" type="info" class="w-[40px] h-[40px] ml-2" @click="onSubmit(supplier)">
                                        <i class="fa-solid fa-send"></i>
                                    </novok-button>
                                </div>
                                <span v-if="supplier.isRequired" class="text-xs text-red-500 mt-2">{{ $t("formValidations.answer") }}</span>
                            </el-form-item>
                            <div class="relative mt-4">
                                <div class="flex items-center text-base">
                                    <el-radio-group v-model="supplier.assigned_suppliers" :disabled="!editData.question_allowed">
                                        <el-radio :label="1" size="large">{{ $t("formLabels.all_suppliers") }}</el-radio>
                                        <el-radio :label="0" size="large">{{ $t("formLabels.assigned_suppliers") }}</el-radio>

                                        <BaseMultiSelectDropdown
                                            v-if="supplier.assigned_suppliers === 0"
                                            :disabled="supplier.assigned_suppliers === null || supplier.assigned_suppliers === 1"
                                            size="small"
                                            :dropdown-option="assignedSuppliers"
                                            :get-selected-client="getSelectedAssignedSuppliers"
                                            :collapse-tag="true"
                                            @selected-value="dropdownSelectedAssignedSuppliers"
                                        />
                                    </el-radio-group>
                                </div>
                            </div>
                        </template>
                    </div>
                </template>
                
                <div v-if="editData.question_allowed && supplierData.length" class="text-center my-4">
                    <novok-button v-if="Math.ceil(total / pageSize) != currentPage" type="info" :loading="loadMoreLoading" class="" @click="LoadMore()">
                        <span class="hidden sm:inline-block">{{ $t("buttons.load_more") }}</span>
                        <i class="fa-solid fa-xmark sm:hidden"></i>
                    </novok-button>
                </div>
			</div>
		</div>

		<div v-if="editData.question_allowed && !supplierData.length" class="mt-3 text-center">{{ "No Question Found." }}</div>

		<div  class="flex items-center justify-between my-4">
            <p class="font-bold" v-if="editData.question_allowed && supplierData.length">Total : {{ total }}</p>
            <p v-else></p>
             <novok-button class="btn-dark my-1" @click="CancelRedirect('/quotations-tender/q-t')">
                <span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
                <i class="fa-solid fa-xmark sm:hidden"></i>
            </novok-button>
		</div>

	</div>
</template>
<style lang="scss">
	.custom-header {
		.el-checkbox {
			display: flex;
			height: unset;
		}
	}
</style>
