<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/require-valid-default-prop -->
<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import { contractStore } from "~/store/contract";
	import { useAuthStore } from "~/store/auth";
	import { documents } from "~/helper/data";
	import { helpers, requiredIf } from "@vuelidate/validators";
	import useVuelidate from "@vuelidate/core";

	const localePath = useLocalePath();
	// const { t } = useI18n();
	const loading = ref(false);
	const route = useRoute();
	const store = contractStore();
	const authStore = useAuthStore();
	const emit = defineEmits(["active-tab-name"]);
	const customFields = reactive([]);
	const customFieldRef = ref<any>(null);
	const { t } = useI18n();
	const showError = ref([]);
	const documentsRefs = ref([]);

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

	const formData = reactive<any>({
		tab_name: "supporting-documents",
		documents: [
			{
				id: "",
				index_id: 1,
				document_type: "modern-slavery-statement",
				document_path: "",
				file_name: "",
				expiry_date: "",
			},
			{
				id: "",
				index_id: 2,
				document_type: "anti-money-laundering-statement",
				document_path: "",
				file_name: "",
				expiry_date: "",
			},
			{
				id: "",
				index_id: 3,
				document_type: "data-protection-policy",
				document_path: "",
				file_name: "",
				expiry_date: "",
			},
			{
				id: "",
				index_id: 4,
				document_type: "kpi-s-sla-s",
				document_path: "",
				file_name: "",
				expiry_date: "",
			},
			{
				id: "",
				index_id: 5,
				document_type: "modern-slavery-policy",
				document_path: "",
				file_name: "",
				expiry_date: "",
			},
			{
				id: "",
				index_id: 6,
				document_type: "anti-corruption-and-bribery-policy",
				document_path: "",
				file_name: "",
				expiry_date: "",
			},
			{
				id: "",
				index_id: 7,
				document_type: "environmental-social-and-governance-esg",
				document_path: "",
				file_name: "",
				expiry_date: "",
			},
			{
				id: "",
				index_id: 8,
				document_type: "insurance-schedule",
				document_path: "",
				file_name: "",
				expiry_date: "",
			},
			{
				id: "",
				index_id: 9,
				document_type: "other-certificate", // default type
				document_path: "",
				file_name: "",
				expiry_date: "",
			},
		],
		delete_document_ids: [],
	});

	// Define computed property for validation rules
	const rules = computed(() => {
		const documentRules = formData.documents.map((document: any, index: number) => {
			return {
				[`documents[${index}].document_path`]: {
					requiredIf: helpers.withMessage(
						t("formValidations.file_upload_required"),
						requiredIf(() => (document?.file_name || document.expiry_date) && !document?.document_path)
					),
				},
				[`documents[${index}].file_name`]: {
					requiredIf: helpers.withMessage(
						t("formValidations.file_name_required"),
						requiredIf(() => (document?.document_path || document.expiry_date) && !document?.file_name)
					),
					name_validation: {
						$validator: (value: any) => true, // Replace this with your validator
						$message: "File name must be valid", // Provide your validation message here
					},
				},
				[`documents[${index}].expiry_date`]: {
					requiredIf: helpers.withMessage(
						t("formValidations.expiry_date_required"),
						requiredIf(() => (document?.document_path || document.file_name) && !document?.expiry_date)
					),
				},
			};
		});

		return Object.assign({}, ...documentRules);
	});

	// Create the validation object
	const v$ = useVuelidate(rules, formData);

	watch(
		() => props.editData,
		(currData) => {
			if (currData.tab === "supporting-documents") {
				Object.assign(formData, JSON.parse(JSON.stringify(currData)));
				Object.assign(customFields, currData?.custom_supporting_documents);
				// map index_id to documents
				formData.documents = formData.documents.map((document: any, index: number) => {
					document.index_id = index + 1;
					return document;
				});

				const documentType = [
					"modern-slavery-statement",
					"anti-money-laundering-statement",
					"data-protection-policy",
					"kpi-s-sla-s",
					"modern-slavery-policy",
					"anti-corruption-and-bribery-policy",
					"environmental-social-and-governance-esg",
					"insurance-schedule",
					"other-certificate",
				];

				documentType.forEach((document_type) => {
					if (formData.documents.filter((document: any) => document.document_type === document_type).length === 0) {
						addMoreDocuments(document_type);
					}
				});

				documentsRefs.value.forEach((documentRef: any) => {
					documentRef?.resetValidation();
				});
			}
		}
	);

	const addMoreDocuments = (document_type: string = "other-certificate") => {
		// get the last index_id of the documents array
		let lastIndexId = 0;
		if (formData.documents.length) {
			lastIndexId = formData.documents[formData.documents.length - 1].index_id;
		}

		formData.documents.push({
			id: "",
			index_id: lastIndexId + 1,
			document_type: document_type,
			document_path: "",
			file_name: "",
			expiry_date: "",
		});
	};

	const getAllDocumentByType = (documentType: string) => {
		// find it actual index_position and map with return array
		return formData.documents
			.map((document: any, index: number) => {
				document.actual_index = index;
				return document;
			})
			.filter((document: any) => document.document_type === documentType);
	};

	const removeDocument = (index: number) => {
		if (formData.documents[index]?.id) {
			formData.delete_document_ids.push(formData.documents[index].id);
		}

		formData.documents = formData.documents.filter((document: any, i: number) => i !== index);
	};

	const updateDocument = (index: number, value: any) => {
		formData.documents[index] = value;
	};

	const onSubmit = (value: any) => {
		v$.value.$touch();
		const anyFileError = showError.value.some((error) => error);
		const isValidCustomFields = customFieldRef.value.isValidate();
		if (isValidCustomFields && !v$.value.$error && !anyFileError) {
			submitAddData();
		}
	};

	const submitAddData = async () => {
		try {
			loading.value = true;

			formData.documents.forEach((document: any, index: number) => {
				if (!document.document_path && !document.file_name && !document.expiry_date) {
					if (document?.id > 0) {
						formData.delete_document_ids.push(document.id);
					}
				}
			});

			const fd = new FormData();
			fd.append("tab_name", formData.tab_name);
			formData.delete_document_ids.forEach((id: any) => {
				fd.append("delete_document_ids[]", id);
			});

			formData.documents.forEach((document: any, index: number) => {
				if (document.document_path || document.file_name || document.expiry_date) {
					fd.append(`documents[${index}][id]`, document.id);
					fd.append(`documents[${index}][document_type]`, document.document_type);
					fd.append(`documents[${index}][document_path]`, document.document_path);
					fd.append(`documents[${index}][file_name]`, document.file_name);
					fd.append(`documents[${index}][expiry_date]`, document.expiry_date);
				}
			});

			customFields.forEach((data: any, key: any) => {
				fd.append(`custom_fields[${key}][id]`, data.id);
				fd.append(`custom_fields[${key}][module_name]`, data.module_name);
				fd.append(`custom_fields[${key}][tab_name]`, data.tab_name);
				fd.append(`custom_fields[${key}][input_label]`, data.input_label);
				fd.append(`custom_fields[${key}][input_type]`, data.input_type);
				fd.append(`custom_fields[${key}][min_length]`, data.min_length);
				fd.append(`custom_fields[${key}][max_length]`, data.max_length);
				fd.append(`custom_fields[${key}][is_required]`, data.is_required);
				fd.append(`custom_fields[${key}][metadata]`, JSON.stringify(data.metadata));
				fd.append(`custom_fields[${key}][input_value]`, data.input_value);
			});

			const res: any = await useApiFetch(`/supplier-admins/${route?.params?.id}/supporting-documents`, {
				method: "POST",
				body: fd,
			});

			useToast("success", res.message);
			store.setActiveTab("primary-details");
			emit("active-tab-name", "primary-details");

			const isProfileSetup = useCookie("is_profile_setup");
			if (route.query.page === "view") {
				navigateTo(
					localePath({
						path: "/supplier-admins/view-supplier-admin/" + route.params?.id,
						query: { tab: "supporting-documents", page: "view" },
					})
				);
			} else if (!isProfileSetup.value) {
				navigateTo(localePath("/dashboard"));
			} else if (authStore.role_id === "supplier_admin") {
				navigateTo(localePath("/dashboard"));
			} else {
				navigateTo(localePath("/supplier-admins"));
			}
		} catch {
		} finally {
			loading.value = false;
		}
	};

	const disabledStartDate = (date: any) => {
		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);
		return date < currentDate;
	};

	const BackClick = () => {
		SupplierBackButton("reference");
		emit("active-tab-name", "reference");
	};
</script>

<template>
	<div class="p-6">
		<el-alert :title="$t('formLabels.single_img_description')" type="warning" :closable="false" class="mb-5" :show-icon="true" />

		<el-form class="flex flex-wrap mt-6 sm:mt-7 md:mt-8 xl:mt-10">
			<div
				v-for="document in getAllDocumentByType('modern-slavery-statement')"
				:key="`document_info_${document.index_id}`"
				class="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 w-full"
			>
				<el-form-item>
					<template #label>
						<BaseLabel
							:for="`other_certificate${document.actual_index}`"
							:label="$t('formLabels.modern_slavery_statement')"
							:tooltip-content="$t('info.modern_slavery_statement')"
						/>
					</template>
					<base-document
						:id="`other_certificate${document.actual_index}`"
						:name="`other_certificate${document.actual_index}`"
						:limit="1"
						ref="documentsRefs"
						:formData="formData.documents[document.actual_index].document_path"
						:isShowDescription="false"
						:disabled="disabled"
						:class="{
							error: v$[`documents[${document.actual_index}].document_path`]?.$error,
						}"
						@show-error="(value) => (showError[document.actual_index] = value)"
						@upload-file="
							(uploadFile) => {
								formData.documents[document.actual_index].document_path = uploadFile.file;
							}
						"
						@handle-remove="
							(uploadFile) => {
								formData.documents[document.actual_index].document_path = '';
							}
						"
						@blur="v$[`documents[${document.actual_index}].document_path`].$touch"
					/>
					<span v-if="v$[`documents[${document.actual_index}].document_path`].$error" class="text-xs w-full text-red-500 mt-2">{{
						v$[`documents[${document.actual_index}].document_path`].$errors[0].$message
					}}</span>
				</el-form-item>

				<el-form-item>
					<template #label>
						<BaseLabel :for="`file_name_${document.actual_index}`" :label="$t('formLabels.file_name')" />
					</template>

					<el-input
						:id="`file_name_${document.actual_index}`"
						v-model="formData.documents[document.actual_index].file_name"
						type="text"
						:name="`file_name_${document.actual_index}`"
						maxLength="50"
						:disabled="disabled"
						:class="{
							error: v$[`documents[${document.actual_index}].file_name`].$error,
						}"
						@change="v$[`documents[${document.actual_index}].file_name`].$touch"
						@keypress="CharcAndNumber"
					/>

					<span v-if="v$[`documents[${document.actual_index}].file_name`].$error" class="text-xs text-red-500 mt-2">{{
						v$[`documents[${document.actual_index}].file_name`].$errors[0].$message
					}}</span>
				</el-form-item>

				<el-form-item>
					<template #label>
						<BaseLabel
							:for="`expiry_date_${document.actual_index}`"
							:label="$t('formLabels.expiry_date')"
							:tooltip-content="$t('info.expiry_date')"
						/>
					</template>
					<el-date-picker
						:id="`expiry_date_${document.actual_index}`"
						v-model.trim="formData.documents[document.actual_index].expiry_date"
						type="date"
						placeholder="DD/MM/YYYY"
						format="DD/MM/YYYY"
						value-format="YYYY-MM-DD"
						:name="`expiry_date_${document.actual_index}`"
						:disabled="disabled"
						:disabled-date="disabledStartDate"
						class="relative"
						:class="{
							error: v$[`documents[${document.actual_index}].expiry_date`].$error,
						}"
						@change="v$[`documents[${document.actual_index}].expiry_date`].$touch"
					/>

					<span v-if="v$[`documents[${document.actual_index}].expiry_date`].$error" class="text-xs text-red-500 mt-2 w-full">{{
						v$[`documents[${document.actual_index}].expiry_date`].$errors[0].$message
					}}</span>
				</el-form-item>
			</div>

			<div
				v-for="document in getAllDocumentByType('anti-money-laundering-statement')"
				:key="`document_info_${document.index_id}`"
				class="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 w-full"
			>
				<el-form-item>
					<template #label>
						<BaseLabel :for="`other_certificate_${document.actual_index}`" :label="$t('formLabels.anti_money_laundering_statement')" />
					</template>
					<base-document
						:id="`other_certificate_${document.actual_index}`"
						:name="`other_certificate_${document.actual_index}`"
						:limit="1"
						ref="documentsRefs"
						:formData="formData.documents[document.actual_index].document_path"
						:isShowDescription="false"
						:disabled="disabled"
						:class="{
							error: v$[`documents[${document.actual_index}].document_path`]?.$error,
						}"
						@show-error="(value) => (showError[document.actual_index] = value)"
						@upload-file="
							(uploadFile) => {
								formData.documents[document.actual_index].document_path = uploadFile.file;
							}
						"
						@handle-remove="
							(uploadFile) => {
								formData.documents[document.actual_index].document_path = '';
							}
						"
						@blur="v$[`documents[${document.actual_index}].document_path`].$touch"
					/>
					<span v-if="v$[`documents[${document.actual_index}].document_path`].$error" class="text-xs w-full text-red-500 mt-2">{{
						v$[`documents[${document.actual_index}].document_path`].$errors[0].$message
					}}</span>
				</el-form-item>

				<el-form-item>
					<template #label>
						<BaseLabel :for="`file_name_${document.actual_index}`" :label="$t('formLabels.file_name')" />
					</template>

					<el-input
						:id="`file_name_${document.actual_index}`"
						v-model="formData.documents[document.actual_index].file_name"
						type="text"
						:name="`file_name_${document.actual_index}`"
						maxLength="50"
						:disabled="disabled"
						:class="{
							error: v$[`documents[${document.actual_index}].file_name`].$error,
						}"
						@change="v$[`documents[${document.actual_index}].file_name`].$touch"
						@keypress="CharcAndNumber"
					/>

					<span v-if="v$[`documents[${document.actual_index}].file_name`].$error" class="text-xs text-red-500 mt-2">{{
						v$[`documents[${document.actual_index}].file_name`].$errors[0].$message
					}}</span>
				</el-form-item>

				<el-form-item>
					<template #label>
						<BaseLabel
							:for="`expiry_date_${document.actual_index}`"
							:label="$t('formLabels.expiry_date')"
							:tooltip-content="$t('info.expiry_date')"
						/>
					</template>
					<el-date-picker
						:id="`expiry_date_${document.actual_index}`"
						v-model.trim="formData.documents[document.actual_index].expiry_date"
						type="date"
						placeholder="DD/MM/YYYY"
						format="DD/MM/YYYY"
						value-format="YYYY-MM-DD"
						:name="`expiry_date_${document.actual_index}`"
						:disabled="disabled"
						:disabled-date="disabledStartDate"
						class="relative"
						:class="{
							error: v$[`documents[${document.actual_index}].expiry_date`].$error,
						}"
						@change="v$[`documents[${document.actual_index}].expiry_date`].$touch"
					/>

					<span v-if="v$[`documents[${document.actual_index}].expiry_date`].$error" class="text-xs text-red-500 mt-2 w-full">{{
						v$[`documents[${document.actual_index}].expiry_date`].$errors[0].$message
					}}</span>
				</el-form-item>
			</div>

			<div
				v-for="document in getAllDocumentByType('data-protection-policy')"
				:key="`document_info_${document.index_id}`"
				class="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 w-full"
			>
				<el-form-item>
					<template #label>
						<BaseLabel
							:for="`other_certificate_${document.actual_index}`"
							:label="$t('formLabels.data_protection_policy')"
							:tooltip-content="$t('info.data_protection_policy')"
						/>
					</template>
					<base-document
						:id="`other_certificate_${document.actual_index}`"
						:name="`other_certificate_${document.actual_index}`"
						:limit="1"
						ref="documentsRefs"
						:formData="formData.documents[document.actual_index].document_path"
						:isShowDescription="false"
						:disabled="disabled"
						:class="{
							error: v$[`documents[${document.actual_index}].document_path`]?.$error,
						}"
						@show-error="(value) => (showError[document.actual_index] = value)"
						@upload-file="
							(uploadFile) => {
								formData.documents[document.actual_index].document_path = uploadFile.file;
							}
						"
						@handle-remove="
							(uploadFile) => {
								formData.documents[document.actual_index].document_path = '';
							}
						"
						@blur="v$[`documents[${document.actual_index}].document_path`].$touch"
					/>
					<span v-if="v$[`documents[${document.actual_index}].document_path`].$error" class="text-xs w-full text-red-500 mt-2">{{
						v$[`documents[${document.actual_index}].document_path`].$errors[0].$message
					}}</span>
				</el-form-item>

				<el-form-item>
					<template #label>
						<BaseLabel :for="`file_name_${document.actual_index}`" :label="$t('formLabels.file_name')" />
					</template>

					<el-input
						:id="`file_name_${document.actual_index}`"
						v-model="formData.documents[document.actual_index].file_name"
						type="text"
						:name="`file_name_${document.actual_index}`"
						maxLength="50"
						:disabled="disabled"
						:class="{
							error: v$[`documents[${document.actual_index}].file_name`].$error,
						}"
						@change="v$[`documents[${document.actual_index}].file_name`].$touch"
						@keypress="CharcAndNumber"
					/>

					<span v-if="v$[`documents[${document.actual_index}].file_name`].$error" class="text-xs text-red-500 mt-2">{{
						v$[`documents[${document.actual_index}].file_name`].$errors[0].$message
					}}</span>
				</el-form-item>

				<el-form-item>
					<template #label>
						<BaseLabel
							:for="`expiry_date_${document.actual_index}`"
							:label="$t('formLabels.expiry_date')"
							:tooltip-content="$t('info.expiry_date')"
						/>
					</template>
					<el-date-picker
						:id="`expiry_date_${document.actual_index}`"
						v-model.trim="formData.documents[document.actual_index].expiry_date"
						type="date"
						placeholder="DD/MM/YYYY"
						format="DD/MM/YYYY"
						value-format="YYYY-MM-DD"
						:name="`expiry_date_${document.actual_index}`"
						:disabled="disabled"
						:disabled-date="disabledStartDate"
						class="relative"
						:class="{
							error: v$[`documents[${document.actual_index}].expiry_date`].$error,
						}"
						@change="v$[`documents[${document.actual_index}].expiry_date`].$touch"
					/>

					<span v-if="v$[`documents[${document.actual_index}].expiry_date`].$error" class="text-xs text-red-500 mt-2 w-full">{{
						v$[`documents[${document.actual_index}].expiry_date`].$errors[0].$message
					}}</span>
				</el-form-item>
			</div>

			<div
				v-for="document in getAllDocumentByType('kpi-s-sla-s')"
				:key="`document_info_${document.index_id}`"
				class="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 w-full"
			>
				<el-form-item>
					<template #label>
						<BaseLabel
							:for="`other_certificate_${document.actual_index}`"
							:label="$t('formLabels.kpi_s_sla_s')"
							:tooltip-content="$t('info.kpi_s_sla_s')"
						/>
					</template>
					<base-document
						:id="`other_certificate_${document.actual_index}`"
						:name="`other_certificate_${document.actual_index}`"
						:limit="1"
						ref="documentsRefs"
						:formData="formData.documents[document.actual_index].document_path"
						:isShowDescription="false"
						:disabled="disabled"
						:class="{
							error: v$[`documents[${document.actual_index}].document_path`]?.$error,
						}"
						@show-error="(value) => (showError[document.actual_index] = value)"
						@upload-file="
							(uploadFile) => {
								formData.documents[document.actual_index].document_path = uploadFile.file;
							}
						"
						@handle-remove="
							(uploadFile) => {
								formData.documents[document.actual_index].document_path = '';
							}
						"
						@blur="v$[`documents[${document.actual_index}].document_path`].$touch"
					/>
					<span v-if="v$[`documents[${document.actual_index}].document_path`].$error" class="text-xs w-full text-red-500 mt-2">{{
						v$[`documents[${document.actual_index}].document_path`].$errors[0].$message
					}}</span>
				</el-form-item>

				<el-form-item>
					<template #label>
						<BaseLabel :for="`file_name_${document.actual_index}`" :label="$t('formLabels.file_name')" />
					</template>

					<el-input
						:id="`file_name_${document.actual_index}`"
						v-model="formData.documents[document.actual_index].file_name"
						type="text"
						:name="`file_name_${document.actual_index}`"
						maxLength="50"
						:disabled="disabled"
						:class="{
							error: v$[`documents[${document.actual_index}].file_name`].$error,
						}"
						@change="v$[`documents[${document.actual_index}].file_name`].$touch"
						@keypress="CharcAndNumber"
					/>

					<span v-if="v$[`documents[${document.actual_index}].file_name`].$error" class="text-xs text-red-500 mt-2">{{
						v$[`documents[${document.actual_index}].file_name`].$errors[0].$message
					}}</span>
				</el-form-item>

				<el-form-item>
					<template #label>
						<BaseLabel
							:for="`expiry_date_${document.actual_index}`"
							:label="$t('formLabels.expiry_date')"
							:tooltip-content="$t('info.expiry_date')"
						/>
					</template>
					<el-date-picker
						:id="`expiry_date_${document.actual_index}`"
						v-model.trim="formData.documents[document.actual_index].expiry_date"
						type="date"
						placeholder="DD/MM/YYYY"
						format="DD/MM/YYYY"
						value-format="YYYY-MM-DD"
						:name="`expiry_date_${document.actual_index}`"
						:disabled="disabled"
						:disabled-date="disabledStartDate"
						class="relative"
						:class="{
							error: v$[`documents[${document.actual_index}].expiry_date`].$error,
						}"
						@change="v$[`documents[${document.actual_index}].expiry_date`].$touch"
					/>

					<span v-if="v$[`documents[${document.actual_index}].expiry_date`].$error" class="text-xs text-red-500 mt-2 w-full">{{
						v$[`documents[${document.actual_index}].expiry_date`].$errors[0].$message
					}}</span>
				</el-form-item>
			</div>

			<div
				v-for="document in getAllDocumentByType('modern-slavery-policy')"
				:key="`document_info_${document.index_id}`"
				class="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 w-full"
			>
				<el-form-item>
					<template #label>
						<BaseLabel
							:for="`other_certificate_${document.actual_index}`"
							:label="$t('formLabels.modern_slavery_policy')"
							:tooltip-content="$t('info.modern_slavery_policy')"
						/>
					</template>
					<base-document
						:id="`other_certificate_${document.actual_index}`"
						:name="`other_certificate_${document.actual_index}`"
						:limit="1"
						ref="documentsRefs"
						:formData="formData.documents[document.actual_index].document_path"
						:isShowDescription="false"
						:disabled="disabled"
						:class="{
							error: v$[`documents[${document.actual_index}].document_path`]?.$error,
						}"
						@show-error="(value) => (showError[document.actual_index] = value)"
						@upload-file="
							(uploadFile) => {
								formData.documents[document.actual_index].document_path = uploadFile.file;
							}
						"
						@handle-remove="
							(uploadFile) => {
								formData.documents[document.actual_index].document_path = '';
							}
						"
						@blur="v$[`documents[${document.actual_index}].document_path`].$touch"
					/>
					<span v-if="v$[`documents[${document.actual_index}].document_path`].$error" class="text-xs w-full text-red-500 mt-2">{{
						v$[`documents[${document.actual_index}].document_path`].$errors[0].$message
					}}</span>
				</el-form-item>

				<el-form-item>
					<template #label>
						<BaseLabel :for="`file_name_${document.actual_index}`" :label="$t('formLabels.file_name')" />
					</template>

					<el-input
						:id="`file_name_${document.actual_index}`"
						v-model="formData.documents[document.actual_index].file_name"
						type="text"
						:name="`file_name_${document.actual_index}`"
						maxLength="50"
						:disabled="disabled"
						:class="{
							error: v$[`documents[${document.actual_index}].file_name`].$error,
						}"
						@change="v$[`documents[${document.actual_index}].file_name`].$touch"
						@keypress="CharcAndNumber"
					/>

					<span v-if="v$[`documents[${document.actual_index}].file_name`].$error" class="text-xs text-red-500 mt-2">{{
						v$[`documents[${document.actual_index}].file_name`].$errors[0].$message
					}}</span>
				</el-form-item>

				<el-form-item>
					<template #label>
						<BaseLabel
							:for="`expiry_date_${document.actual_index}`"
							:label="$t('formLabels.expiry_date')"
							:tooltip-content="$t('info.expiry_date')"
						/>
					</template>
					<el-date-picker
						:id="`expiry_date_${document.actual_index}`"
						v-model.trim="formData.documents[document.actual_index].expiry_date"
						type="date"
						placeholder="DD/MM/YYYY"
						format="DD/MM/YYYY"
						value-format="YYYY-MM-DD"
						:name="`expiry_date_${document.actual_index}`"
						:disabled="disabled"
						:disabled-date="disabledStartDate"
						class="relative"
						:class="{
							error: v$[`documents[${document.actual_index}].expiry_date`].$error,
						}"
						@change="v$[`documents[${document.actual_index}].expiry_date`].$touch"
					/>

					<span v-if="v$[`documents[${document.actual_index}].expiry_date`].$error" class="text-xs text-red-500 mt-2 w-full">{{
						v$[`documents[${document.actual_index}].expiry_date`].$errors[0].$message
					}}</span>
				</el-form-item>
			</div>

			<div
				v-for="document in getAllDocumentByType('anti-corruption-and-bribery-policy')"
				:key="`document_info_${document.index_id}`"
				class="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 w-full"
			>
				<el-form-item>
					<template #label>
						<BaseLabel :for="`other_certificate_${document.actual_index}`" :label="$t('formLabels.anti_corruption_and_bribery_policy')" />
					</template>
					<base-document
						:id="`other_certificate_${document.actual_index}`"
						:name="`other_certificate_${document.actual_index}`"
						:limit="1"
						ref="documentsRefs"
						:formData="formData.documents[document.actual_index].document_path"
						:isShowDescription="false"
						:disabled="disabled"
						:class="{
							error: v$[`documents[${document.actual_index}].document_path`]?.$error,
						}"
						@show-error="(value) => (showError[document.actual_index] = value)"
						@upload-file="
							(uploadFile) => {
								formData.documents[document.actual_index].document_path = uploadFile.file;
							}
						"
						@handle-remove="
							(uploadFile) => {
								formData.documents[document.actual_index].document_path = '';
							}
						"
						@blur="v$[`documents[${document.actual_index}].document_path`].$touch"
					/>
					<span v-if="v$[`documents[${document.actual_index}].document_path`].$error" class="text-xs w-full text-red-500 mt-2">{{
						v$[`documents[${document.actual_index}].document_path`].$errors[0].$message
					}}</span>
				</el-form-item>

				<el-form-item>
					<template #label>
						<BaseLabel :for="`file_name_${document.actual_index}`" :label="$t('formLabels.file_name')" />
					</template>

					<el-input
						:id="`file_name_${document.actual_index}`"
						v-model="formData.documents[document.actual_index].file_name"
						type="text"
						:name="`file_name_${document.actual_index}`"
						maxLength="50"
						:disabled="disabled"
						:class="{
							error: v$[`documents[${document.actual_index}].file_name`].$error,
						}"
						@change="v$[`documents[${document.actual_index}].file_name`].$touch"
						@keypress="CharcAndNumber"
					/>

					<span v-if="v$[`documents[${document.actual_index}].file_name`].$error" class="text-xs text-red-500 mt-2">{{
						v$[`documents[${document.actual_index}].file_name`].$errors[0].$message
					}}</span>
				</el-form-item>

				<el-form-item>
					<template #label>
						<BaseLabel
							:for="`expiry_date_${document.actual_index}`"
							:label="$t('formLabels.expiry_date')"
							:tooltip-content="$t('info.expiry_date')"
						/>
					</template>
					<el-date-picker
						:id="`expiry_date_${document.actual_index}`"
						v-model.trim="formData.documents[document.actual_index].expiry_date"
						type="date"
						placeholder="DD/MM/YYYY"
						format="DD/MM/YYYY"
						value-format="YYYY-MM-DD"
						:name="`expiry_date_${document.actual_index}`"
						:disabled="disabled"
						:disabled-date="disabledStartDate"
						class="relative"
						:class="{
							error: v$[`documents[${document.actual_index}].expiry_date`].$error,
						}"
						@change="v$[`documents[${document.actual_index}].expiry_date`].$touch"
					/>

					<span v-if="v$[`documents[${document.actual_index}].expiry_date`].$error" class="text-xs text-red-500 mt-2 w-full">{{
						v$[`documents[${document.actual_index}].expiry_date`].$errors[0].$message
					}}</span>
				</el-form-item>
			</div>

			<div
				v-for="document in getAllDocumentByType('environmental-social-and-governance-esg')"
				:key="`document_info_${document.index_id}`"
				class="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 w-full"
			>
				<el-form-item>
					<template #label>
						<BaseLabel
							:for="`other_certificate_${document.actual_index}`"
							:label="$t('formLabels.environmental_social_and_governance_esg')"
							:tooltip-content="$t('info.environmental_social_and_governance_esg')"
						/>
					</template>
					<base-document
						:id="`other_certificate_${document.actual_index}`"
						:name="`other_certificate_${document.actual_index}`"
						:limit="1"
						ref="documentsRefs"
						:formData="formData.documents[document.actual_index].document_path"
						:isShowDescription="false"
						:disabled="disabled"
						:class="{
							error: v$[`documents[${document.actual_index}].document_path`]?.$error,
						}"
						@show-error="(value) => (showError[document.actual_index] = value)"
						@upload-file="
							(uploadFile) => {
								formData.documents[document.actual_index].document_path = uploadFile.file;
							}
						"
						@handle-remove="
							(uploadFile) => {
								formData.documents[document.actual_index].document_path = '';
							}
						"
						@blur="v$[`documents[${document.actual_index}].document_path`].$touch"
					/>
					<span v-if="v$[`documents[${document.actual_index}].document_path`].$error" class="text-xs w-full text-red-500 mt-2">{{
						v$[`documents[${document.actual_index}].document_path`].$errors[0].$message
					}}</span>
				</el-form-item>

				<el-form-item>
					<template #label>
						<BaseLabel :for="`file_name_${document.actual_index}`" :label="$t('formLabels.file_name')" />
					</template>

					<el-input
						:id="`file_name_${document.actual_index}`"
						v-model="formData.documents[document.actual_index].file_name"
						type="text"
						:name="`file_name_${document.actual_index}`"
						maxLength="50"
						:disabled="disabled"
						:class="{
							error: v$[`documents[${document.actual_index}].file_name`].$error,
						}"
						@change="v$[`documents[${document.actual_index}].file_name`].$touch"
						@keypress="CharcAndNumber"
					/>

					<span v-if="v$[`documents[${document.actual_index}].file_name`].$error" class="text-xs text-red-500 mt-2">{{
						v$[`documents[${document.actual_index}].file_name`].$errors[0].$message
					}}</span>
				</el-form-item>

				<div class="flex">
					<el-form-item class="w-full">
						<template #label>
							<BaseLabel
								:for="`expiry_date_${document.actual_index}`"
								:label="$t('formLabels.expiry_date')"
								:tooltip-content="$t('info.expiry_date')"
							/>
						</template>
						<el-date-picker
							:id="`expiry_date_${document.actual_index}`"
							v-model.trim="formData.documents[document.actual_index].expiry_date"
							type="date"
							placeholder="DD/MM/YYYY"
							format="DD/MM/YYYY"
							value-format="YYYY-MM-DD"
							:name="`expiry_date_${document.actual_index}`"
							:disabled="disabled"
							:disabled-date="disabledStartDate"
							class="relative"
							:class="{
								error: v$[`documents[${document.actual_index}].expiry_date`].$error,
							}"
							@change="v$[`documents[${document.actual_index}].expiry_date`].$touch"
						/>

						<span v-if="v$[`documents[${document.actual_index}].expiry_date`].$error" class="text-xs text-red-500 mt-2 w-full">{{
							v$[`documents[${document.actual_index}].expiry_date`].$errors[0].$message
						}}</span>
					</el-form-item>
					<novok-button
						type="danger"
						v-show="!disable && getAllDocumentByType('environmental-social-and-governance-esg').length > 1"
						class="ml-4 flex-none w-[40px] h-[40px] mt-6"
						@click="removeDocument(document.actual_index)"
					>
						<i class="fa-solid fa-xmark"></i>
					</novok-button>
				</div>
			</div>

			<div class="w-full mb-6">
				<novok-button v-if="!disabled" type="cyan" @click="addMoreDocuments('environmental-social-and-governance-esg')"
					>{{ $t("buttons.add") }}
				</novok-button>
			</div>

			<div
				v-for="document in getAllDocumentByType('insurance-schedule')"
				:key="`document_info_${document.index_id}`"
				class="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 w-full"
			>
				<el-form-item>
					<template #label>
						<BaseLabel
							:for="`other_certificate_${document.actual_index}`"
							:label="$t('formLabels.insurance_schedule')"
							:tooltip-content="$t('info.insurance_schedule')"
						/>
					</template>
					<base-document
						:id="`other_certificate_${document.actual_index}`"
						:name="`other_certificate_${document.actual_index}`"
						:limit="1"
						ref="documentsRefs"
						:formData="formData.documents[document.actual_index].document_path"
						:isShowDescription="false"
						:disabled="disabled"
						:class="{
							error: v$[`documents[${document.actual_index}].document_path`]?.$error,
						}"
						@show-error="(value) => (showError[document.actual_index] = value)"
						@upload-file="
							(uploadFile) => {
								formData.documents[document.actual_index].document_path = uploadFile.file;
							}
						"
						@handle-remove="
							(uploadFile) => {
								formData.documents[document.actual_index].document_path = '';
							}
						"
						@blur="v$[`documents[${document.actual_index}].document_path`].$touch"
					/>
					<span v-if="v$[`documents[${document.actual_index}].document_path`].$error" class="text-xs w-full text-red-500 mt-2">{{
						v$[`documents[${document.actual_index}].document_path`].$errors[0].$message
					}}</span>
				</el-form-item>

				<el-form-item>
					<template #label>
						<BaseLabel :for="`file_name_${document.actual_index}`" :label="$t('formLabels.file_name')" />
					</template>

					<el-input
						:id="`file_name_${document.actual_index}`"
						v-model="formData.documents[document.actual_index].file_name"
						type="text"
						:name="`file_name_${document.actual_index}`"
						maxLength="50"
						:disabled="disabled"
						:class="{
							error: v$[`documents[${document.actual_index}].file_name`].$error,
						}"
						@change="v$[`documents[${document.actual_index}].file_name`].$touch"
						@keypress="CharcAndNumber"
					/>

					<span v-if="v$[`documents[${document.actual_index}].file_name`].$error" class="text-xs text-red-500 mt-2">{{
						v$[`documents[${document.actual_index}].file_name`].$errors[0].$message
					}}</span>
				</el-form-item>

				<div class="flex">
					<el-form-item class="w-full">
						<template #label>
							<BaseLabel
								:for="`expiry_date_${document.actual_index}`"
								:label="$t('formLabels.expiry_date')"
								:tooltip-content="$t('info.expiry_date')"
							/>
						</template>
						<el-date-picker
							:id="`expiry_date_${document.actual_index}`"
							v-model.trim="formData.documents[document.actual_index].expiry_date"
							type="date"
							placeholder="DD/MM/YYYY"
							format="DD/MM/YYYY"
							value-format="YYYY-MM-DD"
							:name="`expiry_date_${document.actual_index}`"
							:disabled="disabled"
							:disabled-date="disabledStartDate"
							class="relative"
							:class="{
								error: v$[`documents[${document.actual_index}].expiry_date`].$error,
							}"
							@change="v$[`documents[${document.actual_index}].expiry_date`].$touch"
						/>
						<span v-if="v$[`documents[${document.actual_index}].expiry_date`].$error" class="text-xs text-red-500 mt-2 w-full">{{
							v$[`documents[${document.actual_index}].expiry_date`].$errors[0].$message
						}}</span>
					</el-form-item>
					<novok-button
						type="danger"
						v-show="!disable && getAllDocumentByType('insurance-schedule').length > 1"
						class="ml-4 flex-none w-[40px] h-[40px] mt-6"
						@click="removeDocument(document.actual_index)"
					>
						<i class="fa-solid fa-xmark"></i>
					</novok-button>
				</div>
			</div>

			<div class="w-full mb-6">
				<novok-button v-if="!disabled" type="cyan" @click="addMoreDocuments('insurance-schedule')">{{ $t("buttons.add") }} </novok-button>
			</div>

			<div
				v-for="document in getAllDocumentByType('other-certificate')"
				:key="`document_info_${document.index_id}`"
				class="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 w-full"
			>
				<el-form-item>
					<template #label>
						<BaseLabel
							:for="`other_certificate_${document.actual_index}`"
							:label="$t('formLabels.other_certificate')"
							:tooltip-content="$t('info.other_certificate')"
						/>
					</template>
					<base-document
						:id="`other_certificate_${document.actual_index}`"
						:name="`other_certificate_${document.actual_index}`"
						:limit="1"
						ref="documentsRefs"
						:formData="formData.documents[document.actual_index].document_path"
						:isShowDescription="false"
						:disabled="disabled"
						:class="{
							error: v$[`documents[${document.actual_index}].document_path`]?.$error,
						}"
						@show-error="(value) => (showError[document.actual_index] = value)"
						@upload-file="
							(uploadFile) => {
								formData.documents[document.actual_index].document_path = uploadFile.file;
							}
						"
						@handle-remove="
							(uploadFile) => {
								formData.documents[document.actual_index].document_path = '';
							}
						"
						@blur="v$[`documents[${document.actual_index}].document_path`].$touch"
					/>
					<span v-if="v$[`documents[${document.actual_index}].document_path`].$error" class="text-xs w-full text-red-500 mt-2">{{
						v$[`documents[${document.actual_index}].document_path`].$errors[0].$message
					}}</span>
				</el-form-item>

				<el-form-item>
					<template #label>
						<BaseLabel :for="`file_name_${document.actual_index}`" :label="$t('formLabels.file_name')" />
					</template>

					<el-input
						:id="`file_name_${document.actual_index}`"
						v-model="formData.documents[document.actual_index].file_name"
						type="text"
						:name="`file_name_${document.actual_index}`"
						maxLength="50"
						:disabled="disabled"
						:class="{
							error: v$[`documents[${document.actual_index}].file_name`].$error,
						}"
						@change="v$[`documents[${document.actual_index}].file_name`].$touch"
						@keypress="CharcAndNumber"
					/>

					<span v-if="v$[`documents[${document.actual_index}].file_name`].$error" class="text-xs text-red-500 mt-2">{{
						v$[`documents[${document.actual_index}].file_name`].$errors[0].$message
					}}</span>
				</el-form-item>

				<div class="flex">
					<el-form-item class="w-full">
						<template #label>
							<BaseLabel
								:for="`expiry_date_${document.actual_index}`"
								:label="$t('formLabels.expiry_date')"
								:tooltip-content="$t('info.expiry_date')"
							/>
						</template>
						<el-date-picker
							:id="`expiry_date_${document.actual_index}`"
							v-model.trim="formData.documents[document.actual_index].expiry_date"
							type="date"
							placeholder="DD/MM/YYYY"
							format="DD/MM/YYYY"
							value-format="YYYY-MM-DD"
							:name="`expiry_date_${document.actual_index}`"
							:disabled="disabled"
							:disabled-date="disabledStartDate"
							class="relative"
							:class="{
								error: v$[`documents[${document.actual_index}].expiry_date`].$error,
							}"
							@change="v$[`documents[${document.actual_index}].expiry_date`].$touch"
						/>
						<span v-if="v$[`documents[${document.actual_index}].expiry_date`].$error" class="text-xs text-red-500 mt-2 w-full">{{
							v$[`documents[${document.actual_index}].expiry_date`].$errors[0].$message
						}}</span>
					</el-form-item>
					<novok-button
						type="danger"
						v-show="!disable && getAllDocumentByType('other-certificate').length > 1"
						class="ml-4 flex-none w-[40px] h-[40px] mt-6"
						@click="removeDocument(document.actual_index)"
					>
						<i class="fa-solid fa-xmark"></i>
					</novok-button>
				</div>
			</div>

			<div class="w-full mb-6">
				<novok-button v-if="!disabled" type="cyan" @click="addMoreDocuments('other-certificate')">{{ $t("buttons.add") }} </novok-button>
			</div>

			<custom-input-add-edit
				custom-class="w-full md:w-1/2 px-3 mt-6 sm:mt-7 md:mt-8 xl:mt-10"
				ref="customFieldRef"
				:custom-data="customFields"
				:disabled="disabled"
				module-name="supplier-admin"
				@update-data="(value) => Object.assign(customFields, value)"
			/>
		</el-form>

		<!-- buttons -->
		<div class="pt-4 text-right">
			<novok-button type="cyan" class="my-1" @click.prevent="BackClick">
				<i class="fa-regular fa-arrow-left mr-2"></i> {{ $t("buttons.back") }}
			</novok-button>

			<novok-button class="btn-dark my-1" v-if="isFilledPrimaryDetails != 0" @click="CancelRedirect('/supplier-admins')">
				<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
				<i class="fa-solid fa-xmark sm:hidden"></i>
			</novok-button>

			<novok-button v-if="!disabled" class="my-1" type="info" :loading="loading" :disabled="loading" @click.prevent="onSubmit()"
				>{{ $t("buttons.add_supplier") }}
			</novok-button>
		</div>
	</div>
</template>
