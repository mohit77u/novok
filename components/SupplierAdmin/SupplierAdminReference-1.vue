<script setup lang="ts">
	import { required, email, maxLength, helpers, minLength } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import { supplierStore } from "~/store/supplier";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import { getErrors } from "~/helper/getErrors";

	const props = defineProps({
		editData: {
			type: Object,
			// eslint-disable-next-line vue/require-valid-default-prop
			default: {},
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	});

	const formData = reactive<any>({
		tab_name: "reference",
		ref_1_first_name: "",
		ref_1_last_name: "",
		ref_1_company_name: "",
		ref_1_role: "",
		ref_1_email: "",
		ref_1_contact_number: "",
		ref_1_country_code: "+44",
		ref_1_service_provided_description: "",
		ref_1_service_provided_date: "",
		ref_1_comment: "",
		ref_one_evidence_document: "",
		ref_2_first_name: "",
		ref_2_last_name: "",
		ref_2_company_name: "",
		ref_2_role: "",
		ref_2_email: "",
		ref_2_contact_number: "",
		ref_2_country_code: "+44",
		ref_2_service_provided_description: "",
		ref_2_service_provided_date: "",
		ref_2_comment: "",
		ref_two_evidence_document: "",
		is_ref_2: 0,
	});
	const copyFormData = ref<any>({});
	const loadingSave = ref(false);
	const loading = ref(false);
	const copyEditData = ref<any>({
		ref_one_evidence_document: "",
		ref_two_evidence_document: "",
	});

	const localePath = useLocalePath();
	const { t } = useI18n();
	const route = useRoute();
	const store = supplierStore();
	const emit = defineEmits(["active-tab-name", "disabled"]);

	const evidencedocumentRef = ref<any>(null);
	const evidenceTwodocumentRef = ref<any>(null);
	const customFields = reactive([]);
	const customFieldRef = ref<any>(null);

	const { getSelectedCountry, getCountry } = useGetSelectedCountry();

	const rules = computed(() => {
		return {
			//     ref_1_first_name: {
			//       required: helpers.withMessage(t("formValidations.first_name"), required),
			//       maxLength: helpers.withMessage(
			//         t("formValidations.first_name_max"),
			//         maxLength(50)
			//       ),
			//       name_validation: {
			//         $validator: PasteCharcOnly,
			//         $message: t("copyPasteValidations.characters"),
			//       },
			//     },
			//     ref_1_last_name: {
			//       required: helpers.withMessage(t("formValidations.last_name"), required),
			//       maxLength: helpers.withMessage(
			//         t("formValidations.last_name_max"),
			//         maxLength(50)
			//       ),
			//       name_validation: {
			//         $validator: PasteCharcOnly,
			//         $message: t("copyPasteValidations.characters"),
			//       },
			//     },
			//     ref_1_company_name: {
			//       required: helpers.withMessage(
			//         t("formValidations.reg_company_name"),
			//         required
			//       ),
			//       maxLength: helpers.withMessage(
			//         t("formValidations.reg_company_name_max"),
			//         maxLength(100)
			//       ),
			//     },
			//     ref_1_role: {
			//       required: helpers.withMessage(t("formValidations.role"), required),
			//       maxLength: helpers.withMessage(
			//         t("formValidations.role_max"),
			//         maxLength(80)
			//       ),
			//       name_validation: {
			//         $validator: PasteCharcAndNumWithSpace,
			//         $message: t("copyPasteValidations.charNum"),
			//       },
			//     },
			ref_1_email: {
				email: helpers.withMessage(t("formValidations.email_valid"), email),
				name_validation: {
					$validator: PasteEmail,
					$message: t("formValidations.email_valid"),
				},
			},
			ref_2_email: {
				email: helpers.withMessage(t("formValidations.email_valid"), email),
				name_validation: {
					$validator: PasteEmail,
					$message: t("formValidations.email_valid"),
				},
			},
			ref_1_contact_number: {
				maxLength: helpers.withMessage(t("formValidations.contact_number_max"), minLength(10)),
				name_validation: {
					$validator: PasteNumberOnly,
					$message: t("copyPasteValidations.number"),
				},
			},
			ref_2_contact_number: {
				maxLength: helpers.withMessage(t("formValidations.contact_number_max"), minLength(10)),
				name_validation: {
					$validator: PasteNumberOnly,
					$message: t("copyPasteValidations.number"),
				},
			},
			//     ref_1_contact_number: {
			//       required: helpers.withMessage(
			//         t("formValidations.contact_number"),
			//         required
			//       ),
			//       name_validation: {
			//         $validator: PasteNumberOnly,
			//         $message: t("copyPasteValidations.number"),
			//       },
			//     },
			//     ref_1_service_provided_description: {
			//       required: helpers.withMessage(
			//         t("formValidations.relationship_to_you"),
			//         required
			//       ),
			//       maxLength: helpers.withMessage(
			//         t("formValidations.relationship_to_you_max"),
			//         maxLength(50)
			//       ),
			//       name_validation: {
			//         $validator: PasteCharcWithSpace,
			//         $message: t("copyPasteValidations.characters"),
			//       },
			//     },
		};
	});

	const v$ = useVuelidate(rules, formData);

	watch(
		() => props.editData,
		(currData) => {
			if (currData.tab === "reference" || currData.tab === "all") {
				v$.value.$reset();

				if (Object.keys(currData || {}).length) {
					Object.keys(formData).forEach((field: any) => {
						if (currData?.[field] !== undefined && currData?.[field] !== null) {
							formData[field] = currData?.[field];
						}
					});
					copyFormData.value = JSON.parse(JSON.stringify(formData));
					if (currData.ref_one_evidence_document?.length && currData.ref_one_evidence_document !== null) {
						copyEditData.value.ref_one_evidence_document = {
							document_path: currData?.ref_one_evidence_document,
							id: "",
							file_name: currData?.file_name_ref_one,
						};
					}

					if (currData.ref_two_evidence_document?.length && currData.ref_two_evidence_document !== null) {
						copyEditData.value.ref_two_evidence_document = {
							document_path: currData?.ref_two_evidence_document,
							id: "",
							file_name: currData?.file_name_ref_two,
						};
					}

					if (currData.is_ref_2 == 1 && evidenceTwodocumentRef.value) {
						evidenceTwodocumentRef.value.resetValidation();
					}
				}

				Object.assign(customFields, currData?.custom_references1);

				evidencedocumentRef.value.resetValidation();
			}
		}
	);

	const dropdownSelectedCountryCodeValue = (value: any) => {
		formData.ref_1_country_code = value;
	};

	const dropdownSelectedCountryCodeValueRef2 = (value: any) => {
		formData.ref_2_country_code = value;
	};

	const onSubmit = (value: any) => {
		v$.value.$validate();
		const isValidCustomFields = customFieldRef.value.isValidate();

		if (!v$.value.$error && isValidCustomFields) {
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

			const fd = new FormData();
			Object.keys(formData).forEach((field) => {
				fd.append(field, formData[field]);
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

			const res: any = await useApiFetch(`/supplier-admins/${route.params?.id}/reference`, {
				method: "POST",
				body: fd,
			});

			emit("disabled", true);
			if (value !== "save") {
				store.setActiveTab("supporting-documents");
				emit("active-tab-name", "supporting-documents");

				if (route.query.page === "view") {
					navigateTo(
						localePath({
							path: "/supplier-admins/view-supplier-admin/" + route.params?.id,
							query: { tab: "supporting-documents", page: "view" },
						})
					);
				} else {
					navigateTo(
						localePath({
							path: route.fullPath,
							query: { tab: "supporting-documents" },
						}),
						{ replace: true }
					);
				}
			} else {
				if (route.query.page === "view") {
					navigateTo(
						localePath({
							path: "/supplier-admins/view-supplier-admin/" + route.params?.id,
							query: { tab: "reference", page: "view" },
						})
					);
				}
				useToast("success", res.message);
			}
		} catch {
		} finally {
			loading.value = false;
			loadingSave.value = false;
		}
	};
	const BackClick = () => {
		SupplierBackButton("compliance-due-diligence");
		emit("active-tab-name", "compliance-due-diligence");
	};

	const imgOnChange = (value: any) => {
		formData[value.id] = value.file;
	};
	const handleRemove = (value: any) => {
		formData[value.id] = "";
		if (value.id == "ref_one_evidence_document") {
			formData.delete_file_ref_1 = 1;
		} else {
			formData.delete_file_ref_2 = 1;
		}
	};
</script>

<template>
	<div class="p-6">
		<h3 class="pb-3 text-2xl font-bold">
			{{ $t("header.reference_1") }}
			<BaseLabel :tooltip-content="$t('info.reference')" />
		</h3>

		<el-form class="grid grid-cols-12 gap-5 lg:gap-6">
			<el-form-item class="mb-0 col-span-12 sm:col-span-9 md:col-span-6" :label="$t('formLabels.first_name')">
				<template #label>
					<BaseLabel :label="$t('formLabels.first_name')" :tooltip-content="$t('info.first_name')" :isShowLabel="false" />
				</template>
				<el-input
					v-model="formData.ref_1_first_name"
					type="text"
					:disabled="disabled"
					name="ref_1_first_name"
					@keypress="CharSpecCharWithWhitespace"
				/>
			</el-form-item>

			<el-form-item class="mb-0 col-span-12 sm:col-md-6 md:col-span-6" :label="$t('formLabels.last_name')">
				<template #label>
					<BaseLabel :label="$t('formLabels.last_name')" :tooltip-content="$t('info.last_name')" :isShowLabel="false" />
				</template>
				<el-input
					v-model="formData.ref_1_last_name"
					type="text"
					:disabled="disabled"
					name="ref_1_last_name"
					@keypress="CharSpecCharWithWhitespace"
				/>
			</el-form-item>

			<el-form-item class="mb-0 col-span-12 md:col-span-6" :label="$t('formLabels.reg_company_name')">
				<template #label>
					<BaseLabel :label="$t('formLabels.reg_company_name')" :tooltip-content="$t('info.reg_company_name')" :isShowLabel="false" />
				</template>
				<el-input v-model="formData.ref_1_company_name" type="text" :disabled="disabled" name="ref_1_company_name" />
			</el-form-item>

			<el-form-item class="mb-0 col-span-12 md:col-span-6" :label="$t('formLabels.role')">
				<template #label>
					<BaseLabel :label="$t('formLabels.role')" :tooltip-content="$t('info.role')" :isShowLabel="false" />
				</template>
				<el-input v-model="formData.ref_1_role" type="text" :disabled="disabled" name="ref_1_role" @keypress="CharcAndNumber" />
			</el-form-item>

			<el-form-item class="mb-0 col-span-12 md:col-span-6" :label="$t('formLabels.email')">
				<template #label>
					<BaseLabel :label="$t('formLabels.email')" :tooltip-content="$t('info.email')" />
				</template>
				<el-input
					v-model.trim="formData.ref_1_email"
					type="text"
					:disabled="disabled"
					name="ref_1_email"
					:class="{
						error: v$.ref_1_email.$error,
					}"
					@change="v$.ref_1_email.$touch"
				/>
				<span v-if="v$.ref_1_email.$error" class="text-xs text-red-500 mt-2">{{ v$.ref_1_email.$errors[0].$message }}</span>
			</el-form-item>

			<div class="flex items-start col-span-12 md:col-span-6 label-upper-dropdown">
				<div class="w-32 flex-initial mt-6">
					<BaseCountryDropdown
						v-model.trim="formData.ref_1_country_code"
						:disabled="disabled"
						:dropdown-option="getCountry"
						:get-selected-country="getSelectedCountry"
						@selected-value="dropdownSelectedCountryCodeValue"
					/>
				</div>

				<el-form-item class="ml-4 flex-1 mb-0 mt-6" :label="$t('formLabels.contact_number')">
					<template #label>
						<BaseLabel :label="$t('formLabels.contact_number')" :tooltip-content="$t('info.contact_number')" />
					</template>
					<el-input
						v-model.trim="formData.ref_1_contact_number"
						type="text"
						:disabled="disabled"
						name="ref_1_contact_number"
						maxLength="10"
						:class="{
							error: v$.ref_1_contact_number.$error,
						}"
						@change="v$.ref_1_contact_number.$touch"
						@keypress="NumbersOnly"
					/>
					<span v-if="v$.ref_1_contact_number.$error" class="text-xs text-red-500 mt-2">{{
						v$.ref_1_contact_number.$errors[0].$message
					}}</span>
				</el-form-item>
			</div>

			<el-form-item class="mb-0 col-span-12 md:col-span-6">
				<template #label>
					<BaseLabel
						:label="$t('formLabels.service_provided_description')"
						:tooltip-content="$t('info.service_provided_description')"
						:isShowLabel="false"
					/>
				</template>
				<el-input
					v-model="formData.ref_1_service_provided_description"
					type="text"
					:disabled="disabled"
					name="ref_1_service_provided_description"
					@keypress="CharcterWithWhitespace"
				/>
			</el-form-item>

			<el-form-item class="mb-0 col-span-12 md:col-span-6">
				<template #label>
					<BaseLabel
						:label="$t('formLabels.service_provided_date')"
						:tooltip-content="$t('info.service_provided_date')"
						:isShowLabel="false"
					/>
				</template>
				<el-date-picker
					v-model.trim="formData.ref_1_service_provided_date"
					type="date"
					placeholder="DD/MM/YYYY"
					format="DD/MM/YYYY"
					value-format="YYYY-MM-DD"
					:disabled="disabled"
					name="ref_1_service_provided_date"
				/>
			</el-form-item>

			<el-form-item class="mb-0 col-span-12 md:col-span-6" :label="$t('formLabels.add_comments')">
				<template #label>
					<BaseLabel :label="$t('formLabels.add_comments')" :tooltip-content="$t('info.add_comments')" :isShowLabel="false" />
				</template>
				<el-input v-model="formData.ref_1_comment" type="text" :disabled="disabled" name="ref_1_comment" @keypress="CharcterWithWhitespace" />
			</el-form-item>

			<div class="mb-0 col-span-12 md:col-span-6">
				<div class="inline-flex items-center mr-5">
					<span class="text-dark font-bold block">{{ $t("formLabels.upload_evidence_document") }}</span>
					<BaseLabel :tooltip-content="$t('info.upload_evidence_document')" :isShowLabel="false" />
				</div>
				<BaseImage
					:id="'ref_one_evidence_document'"
					ref="evidencedocumentRef"
					:limit="1"
					:form-data="copyEditData.ref_one_evidence_document"
					:disabled="disabled"
					@upload-file="imgOnChange"
					@handle-remove="handleRemove"
				/>
			</div>

			<template v-if="formData.is_ref_2 == 1">
				<h3 class="pb-3 text-2xl font-bold col-span-12">
					{{ $t("header.reference_2") }}
					<BaseLabel :tooltip-content="$t('info.reference')" />
				</h3>

				<el-form-item class="mb-0 col-span-12 sm:col-span-9 md:col-span-6" :label="$t('formLabels.first_name')">
					<template #label>
						<BaseLabel :label="$t('formLabels.first_name')" :tooltip-content="$t('info.first_name')" :isShowLabel="false" />
					</template>
					<el-input
						v-model="formData.ref_2_first_name"
						type="text"
						:disabled="disabled"
						name="ref_2_first_name"
						@keypress="CharSpecCharWithWhitespace"
					/>
				</el-form-item>

				<el-form-item class="mb-0 col-span-12 sm:col-md-6 md:col-span-6" :label="$t('formLabels.last_name')">
					<template #label>
						<BaseLabel :label="$t('formLabels.last_name')" :tooltip-content="$t('info.last_name')" :isShowLabel="false" />
					</template>
					<el-input
						v-model="formData.ref_2_last_name"
						type="text"
						:disabled="disabled"
						name="ref_2_last_name"
						@keypress="CharSpecCharWithWhitespace"
					/>
				</el-form-item>

				<el-form-item class="mb-0 col-span-12 md:col-span-6" :label="$t('formLabels.reg_company_name')">
					<template #label>
						<BaseLabel :label="$t('formLabels.reg_company_name')" :tooltip-content="$t('info.reg_company_name')" :isShowLabel="false" />
					</template>
					<el-input v-model="formData.ref_2_company_name" type="text" :disabled="disabled" name="ref_2_company_name" />
				</el-form-item>

				<el-form-item class="mb-0 col-span-12 md:col-span-6" :label="$t('formLabels.role')">
					<template #label>
						<BaseLabel :label="$t('formLabels.role')" :tooltip-content="$t('info.role')" :isShowLabel="false" />
					</template>
					<el-input v-model="formData.ref_2_role" type="text" :disabled="disabled" name="ref_2_role" @keypress="CharcAndNumber" />
				</el-form-item>

				<el-form-item class="mb-0 col-span-12 md:col-span-6" :label="$t('formLabels.email')">
					<template #label>
						<BaseLabel :label="$t('formLabels.email')" :tooltip-content="$t('info.email')" />
					</template>
					<el-input
						v-model.trim="formData.ref_2_email"
						type="text"
						:disabled="disabled"
						name="ref_2_email"
						:class="{
							error: v$.ref_2_email.$error,
						}"
						@change="v$.ref_2_email.$touch"
					/>
					<span v-if="v$.ref_2_email.$error" class="text-xs text-red-500 mt-2">{{ v$.ref_2_email.$errors[0].$message }}</span>
				</el-form-item>

				<div class="flex items-start col-span-12 md:col-span-6 label-upper-dropdown">
					<div class="w-32 flex-initial mt-6">
						<BaseCountryDropdown
							v-model.trim="formData.ref_2_country_code"
							:disabled="disabled"
							:dropdown-option="getCountry"
							:get-selected-country="getSelectedCountry"
							@selected-value="dropdownSelectedCountryCodeValueRef2"
						/>
					</div>

					<el-form-item class="ml-4 flex-1 mb-0 mt-6" :label="$t('formLabels.contact_number')">
						<template #label>
							<BaseLabel :label="$t('formLabels.contact_number')" :tooltip-content="$t('info.contact_number')" />
						</template>
						<el-input
							v-model.trim="formData.ref_2_contact_number"
							type="text"
							:disabled="disabled"
							name="ref_2_contact_number"
							maxLength="10"
							:class="{
								error: v$.ref_2_contact_number.$error,
							}"
							@change="v$.ref_2_contact_number.$touch"
							@keypress="NumbersOnly"
						/>
						<span v-if="v$.ref_2_contact_number.$error" class="text-xs text-red-500 mt-2">{{
							v$.ref_2_contact_number.$errors[0].$message
						}}</span>
					</el-form-item>
				</div>

				<el-form-item class="mb-0 col-span-12 md:col-span-6">
					<template #label>
						<BaseLabel
							:label="$t('formLabels.service_provided_description')"
							:tooltip-content="$t('info.service_provided_description')"
							:isShowLabel="false"
						/>
					</template>
					<el-input
						v-model="formData.ref_2_service_provided_description"
						type="text"
						:disabled="disabled"
						name="ref_2_service_provided_description"
						@keypress="CharcterWithWhitespace"
					/>
				</el-form-item>

				<el-form-item class="mb-0 col-span-12 md:col-span-6">
					<template #label>
						<BaseLabel
							:label="$t('formLabels.service_provided_date')"
							:tooltip-content="$t('info.service_provided_date')"
							:isShowLabel="false"
						/>
					</template>
					<el-date-picker
						v-model.trim="formData.ref_2_service_provided_date"
						type="date"
						placeholder="DD/MM/YYYY"
						format="DD/MM/YYYY"
						value-format="YYYY-MM-DD"
						:disabled="disabled"
						name="ref_2_service_provided_date"
					/>
				</el-form-item>

				<el-form-item class="mb-0 col-span-12 md:col-span-6" :label="$t('formLabels.add_comments')">
					<template #label>
						<BaseLabel :label="$t('formLabels.add_comments')" :tooltip-content="$t('info.add_comments')" :isShowLabel="false" />
					</template>
					<el-input
						v-model="formData.ref_2_comment"
						type="text"
						:disabled="disabled"
						name="ref_2_comment"
						@keypress="CharcterWithWhitespace"
					/>
				</el-form-item>

				<div class="mb-0 col-span-12 md:col-span-6">
					<div class="inline-flex items-center mr-5">
						<span class="text-dark font-bold block">{{ $t("formLabels.upload_evidence_document") }}</span>
						<BaseLabel :tooltip-content="$t('info.upload_evidence_document')" :isShowLabel="false" />
					</div>
					<BaseImage
						:id="'ref_two_evidence_document'"
						ref="evidenceTwodocumentRef"
						:limit="1"
						:form-data="copyEditData.ref_two_evidence_document"
						:disabled="disabled"
						@upload-file="imgOnChange"
						@handle-remove="handleRemove"
					/>
				</div>

				<custom-input-add-edit
					custom-class="mb-0 col-span-12 md:col-span-6"
					ref="customFieldRef"
					:custom-data="customFields"
					:disabled="disabled"
					module-name="supplier-admin"
					@update-data="(value) => Object.assign(customFields, value)"
				/>
			</template>

			<custom-input-add-edit
				custom-class="mb-0 col-span-12 md:col-span-6"
				ref="customFieldRef"
				:custom-data="customFields"
				:disabled="disabled"
				module-name="supplier-admin"
				@update-data="(value) => Object.assign(customFields, value)"
			/>
		</el-form>

		<novok-button :class="disabled ? 'btn-dark' : 'el-button--info'" @click="formData.is_ref_2 = formData.is_ref_2 == 0 ? 1 : 0">
			<i class="fa-solid fa-plus mr-2"></i> {{ formData.is_ref_2 == 0 ? $t("buttons.add_ref") : $t("buttons.remove_ref") }}
		</novok-button>

		<!-- buttons -->
		<div class="pt-4 text-right">
			<novok-button type="cyan" @click.prevent="BackClick">
				<i class="fa-regular fa-arrow-left mr-2"></i> {{ $t("buttons.back") }}
			</novok-button>

			<novok-button class="btn-dark my-1" @click.prevent="CancelRedirect('/supplier-admins')"
				><span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span
				><i class="fa-solid fa-xmark sm:hidden"></i
			></novok-button>

			<novok-button v-if="!disabled" class="my-1" type="info" :loading="loading" :disabled="loading" @click.prevent="onSubmit('save&next')"
				>{{ $t("buttons.save&next") }}
			</novok-button>

			<novok-button v-if="!disabled" class="my-1" type="info" :loading="loadingSave" :disabled="loadingSave" @click.prevent="onSubmit('save')"
				>{{ $t("buttons.save") }}
			</novok-button>
		</div>
	</div>
</template>
