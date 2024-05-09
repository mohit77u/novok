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
		editFileData: {
			type: Object,
		},
	});

	const currentPage = ref(1);
	const pageSize = ref(5);
	const total = ref(0);

	const copyEditData = ref<any>({
		attach_document: "",
		general_terms_and_conditions: "",
		sow_or_sor: "",
		pricing_matrix: "",
		evaluation_matrix: "",
		business_continuity_policy: "",
		anti_corruption_and_bribary_policy: "",
		environmental_policy: "",
		financial_reports: "",
		modern_slavery_policy: "",
		social_values: "",
	});

	const SupplierStore = supplierStore();
	const localePath = useLocalePath();
	const route = useRoute();
	const { t } = useI18n();
	const loading = ref(false);

	const fullscreenLoading = ref(false);
	const reminderSendTo = ref<any>([]);
    const loadMoreLoading = ref(false);

	const emit = defineEmits(["active-tab-name"]);

	const formData = reactive({
		tender_id: "",
		supplier_id: "",
		question: "",
	});
	const answers = ref<any>([]);

	const rules = computed(() => {
		return {
			question: {
				required: helpers.withMessage(t("formValidations.question"), required),
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

	watch(
		() => props.editData,
		async (val: any) => {
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
			await getAnswerList();
		}
	);

	watch(
		() => props.editFileData,
		(val: any) => {
			val?.documents?.forEach((document: any) => {
				copyEditData.value[QTdocuments[document.document_type]] = document;
			});
			formData.tender_id = val?.tender_id;
			formData.supplier_id = val?.tenant_supplier_id;
		}
	);

	const cancelClick = () => {
		const redirect = sessionStorage.getItem("redirectFrom");
		const qtResponsesId = sessionStorage.getItem("qt-responses-id");
		if (redirect === "response-view") {
			CancelRedirect(`/quotations-tender/q-t/qt-responses/${qtResponsesId}`);
		} else {
			CancelRedirect("/quotations-tender/supplier-q-t");
		}
	};

	const onSubmit = async () => {
		v$.value.$validate();
		if (!v$.value.$error) {
			sendQuestion();
		}
	};

	const sendQuestion = async () => {
		try {
			loading.value = true;
			const res: any = await useApiFetch(`/tender-clarifications`, {
				method: "POST",
				body: formData,
			});
			useToast("success", res.message);
			navigateTo(localePath("/quotations-tender/supplier-q-t"));
		} catch {
		} finally {
			loading.value = false;
		}
	};

	const getAnswerList = async () => {
		fullscreenLoading.value = true;
		try {
			loading.value = true;
			const res: any = await useApiFetch(
				`/tender-clarifications/${props.editFileData?.tender_id}/supplier-admin/question-answer?perPage=${pageSize.value}&page=${currentPage.value}&sortColumn=&sortOrder=desc&searchValue=`,
				{
					method: "GET",
				}
			);

			answers.value = res.data?.data;
			total.value = res.data?.total;
		} catch {
		} finally {
			loading.value = false;
			fullscreenLoading.value = false;
		}
	};

	const handleCurrentChange = (val: number) => {
		currentPage.value = val;
		getAnswerList();
	};

	const handleSizeChange = (val: number) => {
		currentPage.value = 1;
		pageSize.value = val;
		getAnswerList();
	};

    const LoadMore = async() => {
        loadMoreLoading.value = true;
        let pageNumber  = total.value / pageSize.value;
            pageNumber  = Math.ceil(pageNumber);

        if(currentPage.value <= pageNumber) {
            currentPage.value = currentPage.value + 1
            
            const res: any = await useApiFetch(
				`/tender-clarifications/${props.editFileData?.tender_id}/supplier-admin/question-answer?perPage=${pageSize.value}&page=${currentPage.value}&sortColumn=&sortOrder=desc&searchValue=`,
				{
					method: "GET",
				}
			);

            res.data?.data.map((item: any) => {
                answers.value.push(item);
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
				<p class="break-words">{{ editData?.parent_entity || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.signing_entity") }}</label>
				<p class="break-words">{{ editData?.signing_entity?.sub_entity_name || "-" }}</p>
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

			<div v-if="!editData.is_hide_estimated_contract_value_from_supplier">
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
				<label class="font-bold block">{{ $t("formLabels.open_date/time") }}</label>
				{{ editData.open_date ? moment(`${editData.open_date + " " + editData.open_time}`).format("DD/MM/YYYY hh:mm A") : "NA" }}
			</div>

			<!-- <div>
				<label class="font-bold block">{{ $t("formLabels.open_time") }}</label>
				{{ editData.open_time || "-" }}
			</div> -->

			<div>
				<label class="font-bold block">{{ $t("formLabels.close_date/time") }}</label>
				{{ editData.close_date ? moment(`${editData.close_date + " " + editData.close_time}`).format("DD/MM/YYYY hh:mm A") : "NA" }}
			</div>

			<!-- <div>
				<label class="font-bold block">{{ $t("formLabels.close_time") }}</label>
				{{ editData.close_time || "-" }}
			</div> -->

			<div>
				<label class="font-bold block">{{ $t("formLabels.clarification_open_date/time") }}</label>
				{{
					editData.clarification_open_date
						? moment(`${editData.clarification_open_date + " " + editData.clarification_open_time}`).format("DD/MM/YYYY hh:mm A")
						: "NA"
				}}
			</div>

			<!-- <div>
				<label class="font-bold block">{{ $t("formLabels.clarification_open_time") }}</label>
				{{ editData.clarification_open_time || "-" }}
			</div> -->

			<div>
				<label class="font-bold block">{{ $t("formLabels.clarification_close_date/time") }}</label>

				{{
					editData.clarification_close_date
						? moment(`${editData.clarification_close_date + " " + editData.clarification_close_time}`).format("DD/MM/YYYY hh:ss A")
						: "NA"
				}}
			</div>

			<!-- <div>
				<label class="font-bold block">{{ $t("formLabels.clarification_close_time") }}</label>
				{{ editData.clarification_close_time || "-" }}
			</div> -->

			<div>
				<label class="font-bold block">{{ $t("formLabels.reminders_set") }}</label>
				<p class="break-words">{{ editData.is_reminder === 1 ? "Yes" : "No" || "-" }}</p>
			</div>

			<div v-if="editData.is_reminder">
				<label class="font-bold block">{{ $t("formLabels.reminder_send_to") }}</label>
				<p v-for="data in reminderSendTo" :key="data.id" class="break-words">
					{{ data }}
					<!-- {{ editData.reminder_send_to }} -->
				</p>
			</div>

			<div v-if="editData.is_reminder">
				<label class="font-bold block">{{ $t("formLabels.reminder_from_days") }}</label>
				<p class="break-words">{{ editData.reminder_from_days }}</p>
			</div>

			<!-- <div>
				<label class="font-bold block">{{ $t("formLabels.allow_one_document") }}</label>
				<p>{{ editData.is_allow_all_documents_in_single_document === 1 ? "Yes" : "No" || "-" }}</p>
			</div> -->
			<div class="col-span-1 sm:col-span-2 md:col-span-3 xl:col-span-4" v-if="editData.is_allow_all_documents_in_single_document">
				<label class="font-bold block">{{ $t("formLabels.attach_document") }}</label>
				<a
					:class="copyEditData?.attach_document.document_file_name ? 'text-primary underline cursor-pointer break-words' : ''"
					:href="copyEditData.attach_document.document_path"
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

			<div v-if="copyEditData?.business_continuity_policy">
				<label class="font-bold block">{{ $t("formLabels.business_continuity_policy") }}</label>
				<a
					:href="copyEditData.business_continuity_policy.document_path"
					:class="copyEditData.business_continuity_policy.document_file_name ? 'text-primary underline cursor-pointer break-words' : ''"
					target="_blank"
					>{{ copyEditData.business_continuity_policy.document_file_name || "-" }}</a
				>
			</div>

			<div v-if="copyEditData?.anti_corruption_and_bribary_policy">
				<label class="font-bold block">{{ $t("formLabels.anti_corruption_and_bribary_policy") }}</label>
				<a
					:href="copyEditData.anti_corruption_and_bribary_policy.document_path"
					:class="
						copyEditData.anti_corruption_and_bribary_policy.document_file_name ? 'text-primary underline cursor-pointer break-words' : ''
					"
					target="_blank"
					>{{ copyEditData.anti_corruption_and_bribary_policy.document_file_name || "-" }}</a
				>
			</div>

			<div v-if="copyEditData?.environmental_policy">
				<label class="font-bold block">{{ $t("formLabels.environmental_policy") }}</label>
				<a
					:href="copyEditData.environmental_policy.document_path"
					:class="copyEditData.environmental_policy.document_file_name ? 'text-primary underline cursor-pointer break-words' : ''"
					target="_blank"
					>{{ copyEditData.environmental_policy.document_file_name || "-" }}</a
				>
			</div>

			<div v-if="copyEditData?.financial_reports">
				<label class="font-bold block">{{ $t("formLabels.financial_reports") }}</label>
				<a
					:href="copyEditData.financial_reports.document_path"
					:class="copyEditData.financial_reports.document_file_name ? 'text-primary underline cursor-pointer break-words' : ''"
					target="_blank"
					>{{ copyEditData.financial_reports.document_file_name || "-" }}</a
				>
			</div>
			<div v-if="copyEditData?.modern_slavery_policy">
				<label class="font-bold block">{{ $t("formLabels.modern_slavery_policy") }}</label>
				<a
					:href="copyEditData.modern_slavery_policy.document_path"
					:class="copyEditData.modern_slavery_policy.document_file_name ? 'text-primary underline cursor-pointer break-words' : ''"
					target="_blank"
					>{{ copyEditData.modern_slavery_policy.document_file_name || "-" }}</a
				>
			</div>

			<div v-if="copyEditData?.social_values">
				<label class="font-bold block">{{ $t("formLabels.social_values") }}</label>
				<a
					:href="copyEditData.social_values.document_path"
					:class="copyEditData.social_values.document_file_name ? 'text-primary underline cursor-pointer break-words' : ''"
					target="_blank"
					>{{ copyEditData.social_values.document_file_name || "-" }}</a
				>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.Status") }}</label>
				<el-tag
					class="break-words"
					:class="
						editData.tender_status === 0
							? 'border border-primary  text-primary bg-primary/10 '
							: editData.tender_status === 1
							? 'border border-teal text-teal bg-teal/10 '
							: editData.tender_status === 2
							? 'border border-danger  text-danger bg-danger/10 '
							: editData.tender_status === 3
							? 'border border-success  text-success bg-success/10 '
							: editData.tender_status === 4
							? 'border border-danger  text-danger bg-danger/10 '
							: ''
					"
				>
					{{
						editData.tender_status == 0
							? "Awaited"
							: editData.tender_status == 1
							? "Upcoming"
							: editData.tender_status == 2
							? "Rejected"
							: editData.tender_status == 3
							? "Open"
							: editData.tender_status == 4
							? "Closed"
							: ""
					}}
				</el-tag>
			</div>

			<div v-if="editData.tender_status === 2">
				<label class="font-bold block">{{ $t("formLabels.reason") }}</label>
				<p class="break-words">{{ editData.reason_of_reject || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("columnLabels.submission_status") }}</label>
				<p class="break-words">
					{{
						editFileData.submission_status == 0
							? "New"
							: editFileData.submission_status == 1
							? "Draft"
							: editFileData.submission_status == 2
							? "Submitted"
							: ""
					}}
				</p>
			</div>

			<custom-input-view v-if="editFileData?.custom_primary_details?.length" :custom-inputs="editFileData?.custom_primary_details" />
		</div>

		<label v-if="editData.question_allowed || answers.length" class="font-bold block text-xl mt-5 mb-4">{{
			$t("formLabels.clarification_section")
		}}</label>

    
		<div class="border p-4" v-if="editData.question_allowed || answers.length">
            <div v-if="editData.question_allowed || answers.length">
                <el-form-item
                    v-if="editData.question_allowed && editFileData.submission_status !== 2"
                    :rules="[{ required: true }]"
                    :label="$t('formLabels.add_question')"
                    class="md:col-span-6 lg:col-span-6 mb-0"
                >
                    <template #label>
                        <BaseLabel :label="$t('formLabels.add_question')" :tooltip-content="$t('info.add_question')" :isShowLabel="false" />
                    </template>
                    <div class="flex w-full">
                        <el-input
                            v-model="formData.question"
                            name="question"
                            type="text"
                            :class="{
                                error: v$.question.$error,
                            }"
                            @change="v$.question.$touch"
                        />
                        <novok-button type="info" class="w-[40px] h-[40px] ml-2" @click="onSubmit">
                            <i class="fa-solid fa-send"></i>
                        </novok-button>
                    </div>
                    <span v-if="v$.question.$error" class="block text-xs text-red-500 mt-2 w-full">{{ v$.question.$errors[0].$message }}</span>
                </el-form-item>

                <template v-if="answers.length || editData.question_allowed">
                    <div class="rounded-md p-4 odd:bg-gray-50" v-for="ans in answers" :key="ans.id">
                        <p><label class="font-bold">Question : </label> {{ ans.question }}</p>
                        <p><label class="font-bold">Answer : </label> {{ ans.answer }}</p>
                    </div>
                </template>
                <div
                    v-if="(!answers.length && !editData.question_allowed) || (!answers.length && editFileData.submission_status == 2)"
                    class="text-center"
                >
                    {{ "No Question Found" }}
                </div>
            </div>

            <div v-if="editData.question_allowed && answers.length" class="pagination text-center my-1">
                 <novok-button v-if="Math.ceil(total / pageSize) != currentPage" type="info" :loading="loadMoreLoading" class="" @click="LoadMore()">
                    <span class="hidden sm:inline-block">{{ $t("buttons.load_more") }}</span>
                    <i class="fa-solid fa-xmark sm:hidden"></i>
                </novok-button>
            </div>
		</div>

        <div class="flex items-center justify-between my-4">
            <p class="font-bold" v-if="editData.question_allowed && answers.length">Total : {{ total }}</p>
            <p v-else></p>
            <novok-button class="btn-dark my-1" @click="cancelClick">
                <span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
                <i class="fa-solid fa-xmark sm:hidden"></i>
            </novok-button>
        </div>

	</div>
</template>

