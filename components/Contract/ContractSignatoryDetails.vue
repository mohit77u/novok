<!-- eslint-disable vue/require-valid-default-prop -->
<script setup lang="ts">
	import { required, helpers, email } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import { contractStore } from "~/store/contract";
	// import { CurrencyData } from "~/helper/data";

	const localePath = useLocalePath();
	const { t } = useI18n();
	const loading = ref(false);
	const loadingSave = ref(false);
	const emit = defineEmits(["active-tab-name", "disable", "disabled"]);

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
	const store = contractStore();
	const route = useRoute();
	const formData = reactive<any>({
		supplier_lead_name: "",
		supplier_lead_email: "",
		date_of_supplier_authorised_signatory_signature: "",
		supplier_authorised_signatory_signature: "",
		operational_lead_name: "",
		operational_lead_email: "",
		date_of_authorised_signatory_signature: "",
		authorised_signatory_signature: "",
		delete_document_ids: [],
		tab_name: "signatory-details",
	});
	const supplierLead = ref("");
	const clientLead = ref("");
	const copyFormData = ref<any>({});
	const deleteIds = ref<any>([]);
	const deleteImg = ref(false);
	const copyEditData = ref<any>({
		supplier_lead_name: "",
		supplier_lead_email: "",
		date_of_supplier_authorised_signatory_signature: "",
		supplier_authorised_signatory_signature: "",
		operational_lead_name: "",
		operational_lead_email: "",
		date_of_authorised_signatory_signature: "",
		authorised_signatory_signature: "",
		delete_document_ids: [],
		tab_name: "signatory-details",
	});
	const supplierLeadSignatureRef = ref<any>(null);
	const operationalLeadSignatureRef = ref<any>(null);
	const router = useRouter();
	const customFields = reactive([]);
	const customFieldRef = ref<any>(null);

	watch(
		() => props.editData,
		(currData) => {
			if (currData.tab === "signatory-details" || currData.tab === "all") {
				if (Object.keys(currData || {}).length) {
					Object.keys(formData).forEach((field: any) => {
						if (currData?.[field] !== undefined && currData?.[field] !== null && currData?.[field] !== "") {
							formData[field] = currData?.[field];
						}
					});
					supplierLead.value = currData.supplier_authorised_signatory?.full_name;
					clientLead.value = currData.authorised_signatory?.full_name;
					formData.supplier_lead_name = currData.supplier_authorised_signatory?.full_name;
					formData.supplier_lead_email = currData.supplier_authorised_signatory?.email;
					formData.operational_lead_name = currData.authorised_signatory?.full_name;
					formData.operational_lead_email = currData.authorised_signatory?.email;

					currData.documents.forEach((document: any) => {
						if (document.document_type === "supplier-authorised-signatory-signature") {
							formData.supplier_authorised_signatory_signature = document.document_path;
							copyEditData.value.supplier_authorised_signatory_signature = document;
						} else if (document.document_type === "authorised-signatory-signature") {
							formData.authorised_signatory_signature = document.document_path;
							copyEditData.value.authorised_signatory_signature = document;
						}
					});

					copyFormData.value = JSON.parse(JSON.stringify(formData));
				}

				Object.assign(customFields, currData?.custom_signatory_details);

				supplierLeadSignatureRef.value.resetValidation();
				operationalLeadSignatureRef.value.resetValidation();
			}
		}
	);

	const getEditData = async () => {
		try {
			const res: any = useApiFetch(`/contracts/${route?.params?.id}/edit?tab_name=${store.getActiveTab}`, {
				method: "GET",
			});

			res.data.documents.forEach((document: any) => {
				if (document.document_type === "supplier-authorised-signatory-signature") {
					copyEditData.value.supplier_authorised_signatory_signature = document;
				} else if (document.document_type === "authorised-signatory-signature") {
					copyEditData.value.authorised_signatory_signature = document;
				}
			});
		} catch {
		} finally {
			deleteIds.value = [];
		}
	};

	const onSubmit = (value: any) => {
		const isValidCustomFields = customFieldRef.value.isValidate();

		if (isValidCustomFields) {
			submitAddData(value);
		}
	};

	const submitAddData = async (value: any) => {
		try {
			if (value !== "save") {
				loading.value = true;
			} else {
				loadingSave.value = true;
			}

			if (formData.date_of_supplier_authorised_signatory_signature == null) {
				formData.date_of_supplier_authorised_signatory_signature = "";
			}
			if (formData.date_of_authorised_signatory_signature == null) {
				formData.date_of_authorised_signatory_signature = "";
			}
			const fieldArray = {
				supplier_authorised_signatory_signature: "",
				authorised_signatory_signature: "",
			};

			const updatedReqBody = { ...formData };

			Object.keys(fieldArray).forEach((field: any) => {
				if (formData[field] === copyFormData.value[field]) {
					updatedReqBody[field] = "";
				}
			});

			if (
				(copyFormData.value.supplier_authorised_signatory_signature || copyFormData.value.supplier_authorised_signatory_signature === null) &&
				deleteImg?.value === true
			) {
				formData.supplier_authorised_signatory_signature = "";
			}

			const fd = new FormData();
			Object.keys(updatedReqBody).forEach((field) => {
				if (field === "delete_document_ids") {
					deleteIds?.value?.forEach((value: any) => {
						fd.append("delete_document_ids" + "[]", value);
					});
				} else {
					fd.append(field, updatedReqBody[field]);
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

			emit("disabled", true);

			const res: any = await useApiFetch(`/contracts/${route.params?.id}/signatory-details`, {
				method: "POST",
				body: fd,
			});

			if (value !== "save") {
				store.setActiveTab("additional-information");
				emit("active-tab-name", "additional-information");

				if (route.query.page === "view") {
					navigateTo(
						localePath({
							path: "/contracts/view-contract/" + route?.params?.id,
							query: { tab: "additional-information", page: "view" },
						}),
						{ replace: true }
					);
				} else {
					navigateTo(
						localePath({
							path: route.fullPath,
							query: { tab: "additional-information" },
						}),
						{ replace: true }
					);
				}
			} else {
				useToast("success", res?.message);
				sessionStorage.setItem("ContractCreateClick", "0");
				if (route.query.page === "view") {
					navigateTo(
						localePath({
							path: "/contracts/view-contract/" + route?.params?.id,
							query: { tab: "signatory-details", page: "view" },
						}),
						{ replace: true }
					);
				}
			}
			getEditData();
		} catch {
		} finally {
			loading.value = false;
			loadingSave.value = false;
		}
	};

	const imgOnChange = (value: any) => {
		formData[value.id] = value.file;
		deleteImg.value = false;
	};

	const handleRemove = (value: any) => {
		if (value.name !== "") {
			formData[value.id] = "";
			deleteIds.value.push(value.name);
			deleteImg.value = true;
		}
	};

	const BackClick = () => {
		ContractBackButton("upload-contract");
		emit("active-tab-name", "upload-contract");
	};
</script>
<template>
	<el-form>
		<div class="p-6">
			<el-alert :title="$t('formLabels.single_img_description')" type="warning" :closable="false" class="mb-5" :show-icon="true" />
			<div class="flex items-center mb-3">
				<h3 class="text-2xl font-bold">
                    <!-- {{ supplierLead ? " - " + supplierLead : "" }} -->
					{{ $t("formLabels.supplier_authorised_signatory") }} 
				</h3>
				<BaseLabel :tooltip-content="$t('info.supplier_lead')" :isShowLabel="false" />
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7 md:gap-8 xl:gap-10">
				<el-form-item class="mb-0 flex-1" :label="$t('formLabels.supplier_authorised_signatory_name')">
					<template #label>
						<BaseLabel
							:label="$t('formLabels.supplier_authorised_signatory_name')"
							:tooltip-content="$t('info.supplier_lead_name')"
							:isShowLabel="false"
						/>
					</template>
					<el-input v-model="formData.supplier_lead_name" type="text" name="supplier_lead_name" disabled />
				</el-form-item>

				<el-form-item class="mb-0 flex-1" :label="$t('formLabels.email')">
					<template #label>
						<BaseLabel :label="$t('formLabels.email')" :tooltip-content="$t('info.email')" />
					</template>
					<el-input v-model.trim="formData.supplier_lead_email" type="text" name="supplier_lead_email" disabled />
				</el-form-item>

				<el-form-item class="mb-0" :label="$t('formLabels.date_of_signature')">
					<template #label>
						<BaseLabel :label="$t('formLabels.date_of_signature')" :tooltip-content="$t('info.date_of_signature')" :isShowLabel="false" />
					</template>
					<el-date-picker
						v-model.trim="formData.date_of_supplier_authorised_signatory_signature"
						type="date"
						placeholder="DD/MM/YYYY"
						format="DD/MM/YYYY"
						value-format="YYYY-MM-DD"
						name="date_of_supplier_authorised_signatory_signature"
						:disabled="disabled"
					/>
				</el-form-item>

				<div>
					<div class="inline-flex items-center mr-5">
						<label class="el-form-item__label pr-0">{{ $t("formLabels.signature") }}</label>
						<BaseLabel :tooltip-content="$t('info.signature')" :isShowLabel="false" />
					</div>
					<BaseImage
						:id="'supplier_authorised_signatory_signature'"
						ref="supplierLeadSignatureRef"
						:limit="1"
						:form-data="copyEditData.supplier_authorised_signatory_signature"
						:disabled="disabled"
						name="supplier_authorised_signatory_signature"
						@upload-file="imgOnChange"
						@handle-remove="handleRemove"
						:isShowDescription="false"
					/>
				</div>
			</div>
			<div class="flex items-center mb-3 mt-2">
				<!-- {{ clientLead ? " - " + clientLead : "" }} -->
				<h3 class="text-2xl font-bold">{{ $t("formLabels.authorised_signatory") }}</h3>
				<BaseLabel :tooltip-content="$t('info.authorised_signatory')" :isShowLabel="false" />
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7 md:gap-8 xl:gap-10">
				<el-form-item class="mb-0 flex-1" :label="$t('formLabels.authorised_signatory_name')">
					<template #label>
						<BaseLabel
							:label="$t('formLabels.authorised_signatory_name')"
							:tooltip-content="$t('info.authorised_signatory_name')"
							:isShowLabel="false"
						/>
					</template>
					<el-input v-model="formData.operational_lead_name" type="text" name="operational_lead_name" disabled />
				</el-form-item>

				<el-form-item class="mb-0 flex-1" :label="$t('formLabels.email')">
					<template #label>
						<BaseLabel :label="$t('formLabels.email')" :tooltip-content="$t('info.email')" />
					</template>
					<el-input v-model.trim="formData.operational_lead_email" type="text" name="operational_lead_name" disabled />
				</el-form-item>

				<el-form-item class="mb-0" :label="$t('formLabels.date_of_signature')">
					<template #label>
						<BaseLabel :label="$t('formLabels.date_of_signature')" :tooltip-content="$t('info.date_of_signature')" :isShowLabel="false" />
					</template>
					<el-date-picker
						v-model.trim="formData.date_of_authorised_signatory_signature"
						type="date"
						placeholder="DD/MM/YYYY"
						format="DD/MM/YYYY"
						value-format="YYYY-MM-DD"
						name="date_of_authorised_signatory_signature"
						:disabled="disabled"
					/>
				</el-form-item>

				<div>
					<div class="inline-flex items-center mr-5">
						<label class="el-form-item__label pr-0">{{ $t("formLabels.signature") }}</label>
						<BaseLabel :tooltip-content="$t('info.signature')" :isShowLabel="false" />
					</div>
					<BaseImage
						:id="'authorised_signatory_signature'"
						ref="operationalLeadSignatureRef"
						:limit="1"
						:form-data="copyEditData.authorised_signatory_signature"
						:disabled="disabled"
						name="authorised_signatory_signature"
						@upload-file="imgOnChange"
						@handle-remove="handleRemove"
						:isShowDescription="false"
					/>
				</div>

				<custom-input-add-edit
					ref="customFieldRef"
					:custom-data="customFields"
					module-name="contract"
					:disabled="disabled"
					custom-class="mb-0"
					@update-data="(value) => Object.assign(customFields, value)"
				/>
			</div>
			<div class="pt-6 text-right">
				<novok-button type="cyan" @click.prevent="BackClick">
					<i class="fa-regular fa-arrow-left mr-2"></i> {{ $t("buttons.back") }}
				</novok-button>

				<novok-button class="btn-dark my-1" @click.prevent="router.push('/contracts')"
					><span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span
					><i class="fa-solid fa-xmark sm:hidden"></i
				></novok-button>

				<novok-button v-if="!disabled" class="my-1" type="info" :loading="loading" :disabled="loading" @click.prevent="onSubmit('save&next')"
					>{{ $t("buttons.save&next") }}
				</novok-button>

				<novok-button
					v-if="!disabled"
					class="my-1"
					type="info"
					:loading="loadingSave"
					:disabled="loadingSave"
					@click.prevent="onSubmit('save')"
					>{{ $t("buttons.save") }}
				</novok-button>
			</div>
		</div>
	</el-form>
</template>
