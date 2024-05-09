<!-- eslint-disable vue/require-valid-default-prop -->
<script setup lang="ts">
	import { ref } from "vue";

	// import { required, helpers } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import { contractStore } from "~/store/contract";
	import { documentTypeToInfo } from "~/helper/data";
	import { helpers, requiredIf } from "@vuelidate/validators";

	const localePath = useLocalePath();
	const { t } = useI18n();
	const loading = ref(false);
	const route = useRoute();
	const store = contractStore();
	const loadingSave = ref(false);
	const dialogVisible = ref(false);
	const router = useRouter();
	const emit = defineEmits(["active-tab-name", "disable", "disabled"]);
	const customFields = reactive([]);
	const customFieldRef = ref<any>(null);
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
		delete_document_ids: [],
		documents: [
			{
				id: "",
				index_id: 1,
				document_type: "other-certificate", // default type
				document_path: "",
				file_name: "",
				expiry_date: "",
			},
		],
		tab_name: "supporting-documents",
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

				if (formData.documents.length === 0) {
					formData.documents.push({
						id: "",
						index_id: 1,
						document_type: "other-certificate", // default type
						document_path: "",
						file_name: "",
						expiry_date: "",
					});
				}

				documentsRefs.value.forEach((documentRef: any) => {
					documentRef?.resetValidation();
				});
			}
		}
	);

	const getEditData = async () => {
		try {
			const res: any = await useApiFetch(`/contracts/${route?.params?.id}/edit?tab_name=${store.getActiveTab}`, {
				method: "GET",
			});

			Object.assign(formData, res?.data);
		} catch {
		} finally {
		}
	};

	const addMoreDocuments = () => {
		// get the last index_id of the documents array
		const lastIndexId = formData.documents[formData.documents.length - 1].index_id;

		formData.documents.push({
			id: "",
			index_id: lastIndexId + 1,
			document_type: "other-certificate", // default type
			document_path: "",
			file_name: "",
			expiry_date: "",
		});
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

			const res: any = await useApiFetch(`/contracts/${route?.params?.id}/supporting-documents`, {
				method: "POST",
				body: fd,
			});

			emit("disable", false);
			emit("disabled", true);
			store.setActiveTab("primary-details");
			// emit("active-tab-name", "upload-contract");
			useToast("success", res?.message);
			const contractModalVisible = sessionStorage.getItem("ContractCreateClick");
			if (route.query.page === "view") {
				navigateTo(
					localePath({
						path: "/contracts/view-contract/" + route?.params?.id,
						query: { tab: "supporting-documents", page: "view" },
					}),
					{ replace: true }
				);
			} else if (contractModalVisible === "1") {
				await getEditData();
				dialogVisible.value = true;
			} else {
				navigateTo(localePath("/contracts"));
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

	const dialogOkClick = (value: any) => {
		dialogVisible.value = value;
	};

	const BackClick = () => {
		ContractBackButton("additional-information");
		emit("active-tab-name", "additional-information");
	};
</script>

<template>
	<div class="p-6">
		<el-alert :title="$t('formLabels.single_img_description')" type="warning" :closable="false" class="mb-5" :show-icon="true" />

		<el-form class="flex flex-wrap mt-6 sm:mt-7 md:mt-8 xl:mt-10">
			<div
				v-for="(document, documentIndex) in formData.documents"
				:key="`document_info_${document.index_id}`"
				class="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 w-full"
			>
				<el-form-item>
					<template #label>
						<BaseLabel
							:for="`other_certificate_${documentIndex}`"
							:label="$t('formLabels.other_certificate')"
							:tooltip-content="$t('info.other_certificate')"
						/>
					</template>
					<base-document
						:id="`other_certificate_${documentIndex}`"
						:name="`other_certificate_${documentIndex}`"
						:limit="1"
						ref="documentsRefs"
						:formData="formData.documents[documentIndex].document_path"
						:isShowDescription="false"
						:disabled="disabled"
						:class="{
							error: v$[`documents[${documentIndex}].document_path`]?.$error,
						}"
						@show-error="(value) => (showError[documentIndex] = value)"
						@upload-file="
							(uploadFile) => {
								formData.documents[documentIndex].document_path = uploadFile.file;
							}
						"
						@handle-remove="
							(uploadFile) => {
								formData.documents[documentIndex].document_path = '';
							}
						"
						@blur="v$[`documents[${documentIndex}].document_path`].$touch"
					/>
					<span v-if="v$[`documents[${documentIndex}].document_path`].$error" class="text-xs w-full text-red-500">{{
						v$[`documents[${documentIndex}].document_path`].$errors[0].$message
					}}</span>
				</el-form-item>

				<el-form-item>
					<template #label>
						<BaseLabel :for="`file_name_${documentIndex}`" :label="$t('formLabels.file_name')" />
					</template>

					<el-input
						:id="`file_name_${documentIndex}`"
						v-model="formData.documents[documentIndex].file_name"
						type="text"
						:name="`file_name_${documentIndex}`"
						maxLength="50"
						:disabled="disabled"
						:class="{
							error: v$[`documents[${documentIndex}].file_name`].$error,
						}"
						@change="v$[`documents[${documentIndex}].file_name`].$touch"
						@keypress="CharcAndNumber"
					/>

					<span v-if="v$[`documents[${documentIndex}].file_name`].$error" class="text-xs text-red-500 mt-2">{{
						v$[`documents[${documentIndex}].file_name`].$errors[0].$message
					}}</span>
				</el-form-item>

				<div class="flex">
					<el-form-item class="w-full">
						<template #label>
							<BaseLabel
								:for="`expiry_date_${documentIndex}`"
								:label="$t('formLabels.expiry_date')"
								:tooltip-content="$t('info.expiry_date')"
							/>
						</template>
						<el-date-picker
							:id="`expiry_date_${documentIndex}`"
							v-model.trim="formData.documents[documentIndex].expiry_date"
							type="date"
							placeholder="DD/MM/YYYY"
							format="DD/MM/YYYY"
							value-format="YYYY-MM-DD"
							:name="`expiry_date_${documentIndex}`"
							:disabled="disabled"
							:disabled-date="disabledStartDate"
							class="relative"
							:class="{
								error: v$[`documents[${documentIndex}].expiry_date`].$error,
							}"
							@change="v$[`documents[${documentIndex}].expiry_date`].$touch"
						/>
						<span v-if="v$[`documents[${documentIndex}].expiry_date`].$error" class="text-xs text-red-500 mt-2 w-full">{{
							v$[`documents[${documentIndex}].expiry_date`].$errors[0].$message
						}}</span>
					</el-form-item>
					<novok-button
						type="danger"
						v-show="!disable && formData.documents.length > 1"
						class="ml-4 flex-none w-[40px] h-[40px] mt-6"
						@click="removeDocument(documentIndex)"
					>
						<i class="fa-solid fa-xmark"></i>
					</novok-button>
				</div>
			</div>

			<custom-input-add-edit
				ref="customFieldRef"
				:custom-data="customFields"
				module-name="contract"
				:disabled="disabled"
				custom-class="w-full md:w-1/2 px-3 mt-6 sm:mt-7 md:mt-8 xl:mt-10"
				@update-data="(value) => Object.assign(customFields, value)"
			/>
		</el-form>

		<!-- buttons -->
		<div class="pt-6 flex w-full">
			<novok-button v-if="!disabled" class="my-1 mr-auto" type="info" @click="addMoreDocuments()">{{ $t("buttons.add") }} </novok-button>

			<novok-button type="cyan" class="my-1" @click.prevent="BackClick">
				<i class="fa-regular fa-arrow-left mr-2"></i> {{ $t("buttons.back") }}
			</novok-button>

			<novok-button class="btn-dark my-1" @click.prevent="router.push('/contracts')"
				><span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span
				><i class="fa-solid fa-xmark sm:hidden"></i
			></novok-button>

			<novok-button v-if="!disabled" class="my-1" type="info" :loading="loading" :disabled="loading" @click.prevent="onSubmit('save')"
				>{{ $t("buttons.add_contract") }}
			</novok-button>
		</div>
		<BaseContractCreateModal
			v-if="dialogVisible === true"
			:dialog-visible="dialogVisible"
			:contract-number="store.getContractNumber"
			@dialog-ok-click="dialogOkClick"
		/>
	</div>
</template>

<style scoped>
	.upload-info {
		@apply text-left;
		margin-bottom: 1rem;
		transition: transform 0.5s ease-in-out;
	}

	.animate-info {
		animation: slideIn 1s forwards;
	}

	@keyframes slideIn {
		0% {
			transform: translateY(-50px);
			opacity: 0;
		}

		100% {
			transform: translateY(0);
			opacity: 1;
		}
	}
</style>
