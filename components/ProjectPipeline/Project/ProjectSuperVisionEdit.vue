<script setup lang="ts">
	import { required, email, minLength, maxLength, helpers, requiredIf } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import { commaThreeDigitFormat } from "~/helper/common";
	import { CurrencyData, CurrencySymbole } from "~/helper/data";

	const emit = defineEmits(["disabledStatus"]);

	const props = defineProps({
		editData: {
			type: Object,
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

	const editData = ref<any>({});
	const clientAdminUserData = ref<any>([]);
	const searchValue = ref("");
	const localePath = useLocalePath();
	const { t } = useI18n();
	const route = useRoute();
	const loading = ref(false);
	const loadingSave = ref(false);

	const formData = reactive<any>({
		project_title: "",
		requirement: "",
		total_contract_term: "",
		value_of_contract_currency: "",
		value_of_contract: "",
		contract_review_date: "",
		actual_savings: "",
		actual_savings_currency: "",
		supplier_handbook: "",
		contract_management_toolkit: "",
		documents: [],
		delete_document_ids: [],
	});

	const contractsData = ref<any>({
		date_of_supplier_authorised_signatory_signature: "",
		contract_start_date: "",
		contract_end_date: "",
		notice_period_days: "",
	});

	const contractNumbers = ref<any>([]);
	const contractData = ref<any>([]);
	const deleteIds = ref<any>([]);
	const documents = ref<any>([]);
	const documentRef = ref<any>(null);
	const contractManagementToolkitRef = ref<any>(null);
	const supplierHandbookRef = ref<any>(null);

	const copyEditData = ref<any>({
		supplier_handbook: "",
		contract_management_toolkit: "",
		delete_document_ids: [],
		documents: [],
	});

	const contractDetails = ref<any>({
		contract_number: "",
		contract_start_date: "",
		contract_end_date: "",
		date_of_supplier_lead_signature: "",
		notice_period_days: "",
	});

	const rules = computed(() => {
		return {
			requirement: {
				required: helpers.withMessage(t("formValidations.requirement"), required),
				name_validation: {
					$validator: PasteCharcAndNumWithSpace,
					$message: t("copyPasteValidations.charNum"),
				},
			},
			project_title: {
				required: helpers.withMessage(t("formValidations.project_title"), required),
				name_validation: {
					$validator: PasteCharcAndNumWithSpace,
					$message: t("copyPasteValidations.charNum"),
				},
			},

			actual_savings: {
				required: helpers.withMessage(t("formValidations.actual_savings"), required),
			},

			total_contract_term: {
				required: helpers.withMessage(t("formValidations.total_contract_term"), required),
			},
			value_of_contract: {
				required: helpers.withMessage(t("formValidations.value_of_contract"), required),
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

	watch(
		() => props.editData,
		async (currData) => {
			if (currData) {
				if (props.activeTab === "supervision") {
					Object.assign(editData.value, currData);

					Object.keys(formData).forEach((field: any) => {
						if (field !== "undefined" || field !== null) {
							formData[field] = currData[field] || "";
						}
					});

					Object.assign(contractDetails.value, currData.contractDetails);

					formData.value_of_contract = formData.value_of_contract
						?.toString()
						?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
						?.replace(/\.00$/, "");
					formData.actual_savings = formData.actual_savings
						?.toString()
						?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
						?.replace(/\.00$/, "");

					if (currData.supplierHandbook?.length) {
						currData.supplierHandbook.forEach((data: any) => {
							copyEditData.value.supplier_handbook = {
								file_name: data.document_file_name,
								document_path: data.document_path,
								id: data.id,
								mime_type: data.document_extension,
							};
						});
					}

					if (currData.contractManagementToolkit?.length) {
						currData.contractManagementToolkit.forEach((data: any) => {
							copyEditData.value.contract_management_toolkit = {
								file_name: data.document_file_name,
								document_path: data.document_path,
								id: data.id,
								mime_type: data.document_extension,
							};
						});
					}

					const tempArr: any = [];
					if (currData.documents?.length) {
						currData.documents?.forEach((field: any) => {
							tempArr.push({
								file_name: field.document_file_name,
								id: field.id,
								document_path: field.document_path,
								mime_type: field.document_extension,
							});
						});
					}
					copyEditData.value.documents = tempArr;

					// copyFormData.value = JSON.parse(JSON.stringify(formData));
					await getClientAdminUserList(searchValue.value);
					// await getContractNumbers(searchValue.value);
				}
			}
		}
	);

	onMounted(async () => {
		// if (props.activeTab === "selection") {
		// 	await getClientAdminUserList(searchValue.value);
		// }
	});

	const getClientAdminUserList = async (value: any) => {
		searchValue.value = value;
		try {
			const res: any = await useApiFetch(`/project-ms/users?searchValue=${value}`, {
				method: "GET",
			});

			clientAdminUserData.value = res.data?.map((data: any) => {
				return {
					label: data.full_name + " " + "(" + data.email + ")",
					value: data.id,
				};
			});
		} catch {}
	};

	// const getContractNumbers = async (value: any) => {
	// 	searchValue.value = value;
	// 	try {
	// 		const res: any = await useApiFetch(`/getContract?searchValue=${value}`, {
	// 			method: "GET",
	// 		});

	// 		contractData.value = res.data;
	// 		contractNumbers.value = res.data?.map((data: any) => {
	// 			return {
	// 				label: data.contract_number,
	// 				value: data.id,
	// 			};
	// 		});
	// 		getContractById();
	// 	} catch {}
	// };

	// const getContractById = () => {
	// 	const data = contractData.value.find((data: any) => data.id == editData.value.contract_id);
	// 	contractsData.value.date_of_supplier_authorised_signatory_signature = data?.date_of_supplier_authorised_signatory_signature;
	// 	contractsData.value.contract_start_date = data?.contract_start_date;
	// 	contractsData.value.contract_end_date = data?.contract_end_date;
	// 	contractsData.value.notice_period_days = data?.notice_period_days;
	// };

	const disabledStartDate = (date: any) => {
		var d = new Date();
		d.setDate(d.getDate() - 1);
		if (d > date) {
			return true;
		}
	};

	const getSelectedRequestOwnerData = computed(() => {
		return clientAdminUserData.value.find((data: any) => data.value === editData.value.request_owner_id);
	});

	const getSelectedProjectOwner = computed(() => {
		return clientAdminUserData.value.find((data: any) => data.value === editData.value.project_owner_id);
	});

	const getSelectedContractNumber = computed(() => {
		return contractNumbers.value.find((data: any) => data.value == editData.value.contract_id);
	});

	const actualSavingsChnage = () => {
		let value = formData.actual_savings.replace(/\D/g, "");
		value = value.slice(0, 10);
		if (value > 0) {
			v$.value.actual_savings.$touch();
			formData.actual_savings = commaThreeDigitFormat(value);
		}
	};

	const valueOfContractChange = () => {
		let value = formData.value_of_contract.replace(/\D/g, "");
		value = value.slice(0, 10);
		if (value > 0) {
			v$.value.value_of_contract.$touch();
			formData.value_of_contract = commaThreeDigitFormat(value);
		}
	};

	const imgOnChange = (value: any) => {
		formData[value.id] = value.file;
		// deleteImg.value = false;
	};

	const handleRemove = (value: any) => {
		if (value.name !== "") {
			formData[value.id] = "";
			documents.value[value.id] = "";
			deleteIds.value.push(value.name);
			// deleteImg.value = true;
		}
		documents.value = documents.value?.filter((data: any) => data.uid !== value.file.uid);
	};

	// const handleRemove = (value: any) => {
	// 	documents.value[value.id] = "";
	// 	deleteIds.value.push(value.name);
	// };

	const MultiImgOnChange = (value: any) => {
		// copyFormData?.value.other_certificate.push(value.file);
		documents?.value.push(value.file);
	};

	const onSubmit = async (value: any) => {
		documentRef.value.resetValidation();
		contractManagementToolkitRef.value.resetValidation();
		supplierHandbookRef.value.resetValidation();
		// if (value !== "save_as_draft") {
		v$.value.$validate();

		if (!v$.value.$error) {
			submitEditData(value);
		} else {
			setTimeout(() => {
				const firstErrorElement = document?.querySelector(".error");
				if (firstErrorElement) {
					firstErrorElement.scrollIntoView({
						behavior: "smooth",
						block: "center",
					});
				}
			}, 250);
		}
		// } else {
		// 	submitEditData(value);
		// }
	};

	const submitEditData = async (value: any) => {
		formData.action = value;
		formData.actual_savings = formData.actual_savings?.split(",")?.join("") || "";
		formData.value_of_contract = formData.value_of_contract?.split(",")?.join("") || "";

		const fd = new FormData();
		Object.keys(formData).forEach((field) => {
			if (field === "documents") {
				documents?.value?.forEach((value: any) => {
					fd.append("documents" + "[]", value);
				});
			} else if (field === "delete_document_ids") {
				deleteIds.value.forEach((value: any) => {
					fd.append("delete_document_ids" + "[]", value);
				});
			} else {
				fd.append(field, formData[field]);
			}
		});

		try {
			if (value === "save_as_draft") {
				loadingSave.value = true;
			} else {
				loading.value = true;
			}
			const res: any = await useApiFetch(`/projects/${route.params?.id}/supervision`, {
				method: "POST",
				body: fd,
			});
			useToast("success", res.message);
			// navigateTo(localePath("/project-pipeline/projects"));
			if (value === "save_as_draft") {
				navigateTo(
					localePath({
						path: route.fullPath,
						query: { tab: "supervision" },
					}),
					{ replace: true }
				);
				emit("disabledStatus", "supervision");
			} else {
				navigateTo(localePath("/project-pipeline/projects"));
				emit("disabledStatus", "supervision");
			}
		} catch {
		} finally {
			loading.value = false;
			loadingSave.value = false;
			documents.value = [];
			deleteIds.value = [];
		}
	};
</script>

<template>
	<el-form v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="flex flex-col relative">
		<div id="super-admin-form">
			<div class="bg-[#fff]">
				<div class="p-6">
					<div class="grid grid-cols-12 gap-5 lg:gap-6">
						<el-form-item
							:rules="[{ required: true }]"
							:label="$t('formLabels.project_number')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.project_number')"
									:tooltip-content="$t('info.project_number')"
									:isShowLabel="false"
								/>
							</template>
							<el-input v-model.trim="editData.project_number" name="project_number" type="text" disabled />
						</el-form-item>

						<el-form-item
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							:rules="[{ required: true }]"
							:label="$t('formLabels.project_owner')"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.project_owner')" :tooltip-content="$t('info.project_owner')" :isShowLabel="false" />
							</template>
							<BaseSelectDropdown
								:dropdown-option="clientAdminUserData"
								:get-selected-country="getSelectedProjectOwner"
								:number-only="false"
								disabled
							/>
						</el-form-item>

						<el-form-item
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							:rules="[{ required: true }]"
							:label="$t('formLabels.request_owner')"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.request_owner')" :tooltip-content="$t('info.request_owner')" :isShowLabel="false" />
							</template>
							<BaseSelectDropdown
								:dropdown-option="clientAdminUserData"
								:get-selected-country="getSelectedRequestOwnerData"
								:number-only="false"
								disabled
								name="request_owner_id"
							/>
						</el-form-item>

						<el-form-item
							:rules="[{ required: true }]"
							:label="$t('formLabels.project_title')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.project_title')" :tooltip-content="$t('info.request_title')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="formData.project_title"
								name="project_title"
								type="textarea"
								:class="{
									error: v$.project_title.$error,
								}"
								maxLength="255"
								:disabled="disabled"
								@change="v$.project_title.$touch"
								@keypress="CharcAndNumber"
							/>
							<span v-if="v$.project_title.$error" class="text-xs text-red-500 mt-2">{{ v$.project_title.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item
							:rules="[{ required: true }]"
							:label="$t('formLabels.requirement/needs')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.requirement/needs')"
									:tooltip-content="$t('info.requirement/needs')"
									:isShowLabel="false"
								/>
							</template>
							<el-input
								v-model="formData.requirement"
								name="requirement"
								type="text"
								:class="{
									error: v$.requirement.$error,
								}"
								maxLength="255"
								:disabled="disabled"
								@change="v$.requirement.$touch"
								@keypress="CharcAndNumber"
							/>
							<span v-if="v$.requirement.$error" class="text-xs text-red-500 mt-2">{{ v$.requirement.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item
							:label="$t('formLabels.total_contract_term ')"
							:rules="[{ required: true }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.total_contract_term')"
									:tooltip-content="$t('info.total_contract_term')"
									:isShowLabel="false"
								/>
							</template>
							<el-input
								v-model="formData.total_contract_term"
								name="total_contract_term"
								type="textarea"
								maxLength="255"
								:disabled="disabled"
								:class="{
									error: v$.total_contract_term.$error,
								}"
								@change="v$.total_contract_term.$touch"
								@keypress="CharcAndNumber"
							/>
							<span v-if="v$.total_contract_term.$error" class="text-xs text-red-500 mt-2">{{
								v$.total_contract_term.$errors[0].$message
							}}</span>
						</el-form-item>

						<div class="flex items-start col-span-12 md:col-span-6 2xl:col-span-4 label-upper-dropdown">
							<div class="w-24 flex-initial mt-6">
								<el-input
									v-model="CurrencySymbole[formData.value_of_contract_currency]"
									name="value_of_contract"
									type="text"
									disabled
								/>
							</div>
							<el-form-item :label="$t('formLabels.value_of_contract')" :rules="[{ required: true }]" class="ml-4 mb-0 w-full mt-6">
								<template #label>
									<BaseLabel
										:label="$t('formLabels.value_of_contract')"
										:tooltip-content="$t('info.value_of_contract')"
										:isShowLabel="false"
									/>
								</template>
								<el-input
									v-model="formData.value_of_contract"
									name="value_of_contract"
									type="text"
									:disabled="disabled"
									:class="{
										error: v$.value_of_contract.$error,
									}"
									@change="valueOfContractChange"
								/>
								<span v-if="v$.value_of_contract.$error" class="text-xs text-red-500 mt-2">{{
									v$.value_of_contract.$errors[0].$message
								}}</span>
							</el-form-item>
						</div>

						<el-form-item
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
							:rules="[{ required: true }]"
							:label="$t('formLabels.contract_number')"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.contract_number')"
									:tooltip-content="$t('info.contract_number')"
									:isShowLabel="false"
								/>
							</template>
							<el-input v-model="contractDetails.contract_number" name="contract_number" type="text" disabled />
						</el-form-item>

						<div class="flex items-start col-span-12 md:col-span-6 2xl:col-span-4 label-upper-dropdown">
							<div class="w-24 flex-initial mt-6">
								<el-input v-model="CurrencySymbole[formData.actual_savings_currency]" name="actual_savings" type="text" disabled />
							</div>
							<el-form-item :label="$t('formLabels.actual_savings')" :rules="[{ required: true }]" class="ml-4 mb-0 w-full mt-6">
								<template #label>
									<BaseLabel
										:label="$t('formLabels.actual_savings')"
										:tooltip-content="$t('info.actual_savings')"
										:isShowLabel="false"
									/>
								</template>
								<el-input
									v-model="formData.actual_savings"
									name="actual_savings"
									type="textarea"
									maxLength="255"
									:disabled="disabled"
									:class="{ error: v$.actual_savings.$error }"
									@change="actualSavingsChnage"
									@keypress="CharcAndNumber"
								/>
								<span v-if="v$.actual_savings.$error" class="text-xs text-red-500 mt-2">{{
									v$.actual_savings.$errors[0].$message
								}}</span>
							</el-form-item>
						</div>

						<el-form-item
							:rules="[{ required: false }]"
							:label="$t('formLabels.date_of_contract_signature')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.date_of_contract_signature')"
									:tooltip-content="$t('info.date_of_contract_signature')"
									:isShowLabel="false"
								/>
							</template>
							<el-date-picker
								v-model.trim="contractDetails.date_of_supplier_lead_signature"
								type="date"
								placeholder="DD/MM/YYYY"
								format="DD/MM/YYYY"
								name="start_date"
								disabled
							/>
						</el-form-item>

						<el-form-item
							:rules="[{ required: false }]"
							:label="$t('formLabels.start_date_of_contract')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.start_date_of_contract')"
									:tooltip-content="$t('info.start_date_of_contract')"
									:isShowLabel="false"
								/>
							</template>
							<el-date-picker
								v-model.trim="contractDetails.contract_start_date"
								type="date"
								placeholder="DD/MM/YYYY"
								format="DD/MM/YYYY"
								name="start_date"
								disabled
							/>
						</el-form-item>

						<el-form-item
							:rules="[{ required: false }]"
							:label="$t('formLabels.end_date_of_contract')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.end_date_of_contract')"
									:tooltip-content="$t('info.end_date_of_contract')"
									:isShowLabel="false"
								/>
							</template>
							<el-date-picker
								v-model.trim="contractDetails.contract_end_date"
								type="date"
								placeholder="DD/MM/YYYY"
								format="DD/MM/YYYY"
								name="target_completion_date"
								disabled
							/>
						</el-form-item>

						<el-form-item
							:label="$t('formLabels.notice_period')"
							:rules="[{ required: true }]"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel :label="$t('formLabels.notice_period')" :tooltip-content="$t('info.notice_period')" :isShowLabel="false" />
							</template>
							<el-input v-model="contractDetails.notice_period_days" name="notice_period" type="text" disabled />
						</el-form-item>

						<el-form-item
							:rules="[{ required: false }]"
							:label="$t('formLabels.contract_review_date')"
							class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0"
						>
							<template #label>
								<BaseLabel
									:label="$t('formLabels.contract_review_date')"
									:tooltip-content="$t('info.contract_review_date')"
									:isShowLabel="false"
								/>
							</template>
							<el-date-picker
								v-model.trim="formData.contract_review_date"
								type="date"
								placeholder="DD/MM/YYYY"
								format="DD/MM/YYYY"
								value-format="YYYY-MM-DD"
								name="start_date"
								:disabled="disabled"
							/>
						</el-form-item>

						<div class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
							<div class="inline-flex items-center mr-5">
								<label class="el-form-item__label pr-0">{{ $t("formLabels.supplier_handbook") }}</label>
								<BaseLabel :tooltip-content="$t('info.supplier_handbook')" />
							</div>
							<BaseImage
								:id="'supplier_handbook'"
								ref="supplierHandbookRef"
								:limit="1"
								:form-data="copyEditData.supplier_handbook"
								:disabled="disabled"
								name="supplier_handbook"
								@upload-file="imgOnChange"
								@handle-remove="handleRemove"
							/>
						</div>

						<div class="col-span-12 md:col-span-6 2xl:col-span-4 mb-0">
							<div class="inline-flex items-center mr-5">
								<label class="el-form-item__label pr-0">{{ $t("formLabels.contract_management_toolkit") }}</label>
								<BaseLabel :tooltip-content="$t('info.contract_management_toolkit')" />
							</div>
							<BaseImage
								:id="'contract_management_toolkit'"
								ref="contractManagementToolkitRef"
								:limit="1"
								:form-data="copyEditData.contract_management_toolkit"
								:disabled="disabled"
								name="contract_management_toolkit"
								@upload-file="imgOnChange"
								@handle-remove="handleRemove"
							/>
						</div>

						<div class="col-span-12">
							<div class="inline-flex items-center mr-5">
								<label id="upload_documents" class="el-form-item__label pr-0">{{ $t("formLabels.upload_documents") }}</label>
								<BaseLabel :tooltip-content="$t('info.supervision_upload_documents')" />
							</div>
							<BaseMultipleImage
								:id="'document'"
								ref="documentRef"
								:limit="5"
								:form-data="copyEditData.documents"
								:disabled="disabled"
								@upload-file="MultiImgOnChange"
								@handle-remove="handleRemove"
							/>
						</div>
					</div>
				</div>

				<div class="p-6 text-right">
					<novok-button class="btn-dark my-1" @click.prevent="navigateTo(localePath('/project-pipeline/projects'))"
						><span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span
						><i class="fa-solid fa-xmark sm:hidden"></i
					></novok-button>

					<novok-button
						v-if="!disabled"
						class="my-1"
						type="info"
						:loading="loadingSave"
						:disabled="loadingSave"
						@click.prevent="onSubmit('save_as_draft')"
						>{{ $t("buttons.save_draft") }}
					</novok-button>

					<novok-button
						v-if="editData.active_tab === 'supervision' && !disabled"
						class="my-1"
						type="info"
						:loading="loading"
						:class="'el-button--info'"
						:disabled="loading"
						@click.prevent="onSubmit('completed')"
						>{{ $t("buttons.submit") }}
					</novok-button>
				</div>
			</div>
		</div>
	</el-form>
</template>
