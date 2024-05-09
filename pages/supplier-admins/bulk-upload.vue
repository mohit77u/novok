<script lang="ts" setup>
	import { required, helpers } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";

	definePageMeta({
		middleware: ["auth"],
	});

	useHead({
		title: "Bulk Upload Supplier Admin",
	});

	const formParams = reactive({
		csv_file: "",
		company_name: "",
		company_number: "",
		company_telephone_country_code: "",
		company_telephone: "",
		company_email: "",
		company_website: "",
		company_address: "",
		company_country: "",
		company_state: "",
		company_city: "",
		company_post_code: "",
		company_tax_number: "",
		is_diverse_company: "",
		company_type: "",
		other_company_type: "",
		category_level_1: "",
		category_level_2: "",
		first_name: "",
		last_name: "",
		department: "",
		title: "",
		address: "",
		country: "",
		state: "",
		city: "",
		post_code: "",
		email: "",
		contact_country_code: "",
		contact_number: "",
		key_supplier: "",
		key_supplier_comment: "",
		is_consent_to_share_with_marketplace: "",
		is_privacy_agreed: "",
		alternative_contact_first_name: "",
		alternative_contact_last_name: "",
		alternative_contact_department: "",
		alternative_contact_job_title: "",
		alternative_contact_email: "",
		alternative_contact_country_code: "",
		alternative_contact_number: "",
		dpo_email: "",
		dpo_first_name: "",
		dpo_last_name: "",
		dpo_country_code: "",
		dpo_mobile_number: "",
		dnb_number: "",
		credit_score: "",
		credit_score_source: "",
		report_date: "",
		credit_safe_ico_number: "",
		reference_1_first_name: "",
		reference_1_last_name: "",
		reference_1_company_name: "",
		reference_1_role: "",
		reference_1_email: "",
		reference_1_country_code: "",
		reference_1_contact_number: "",
		reference_1_date_of_the_service_provided: "",
		reference_1_description_of_the_service_provided: "",
		reference_1_add_comments: "",
		reference_2_first_name: "",
		reference_2_last_name: "",
		reference_2_company_name: "",
		reference_2_role: "",
		reference_2_email: "",
		reference_2_country_code: "",
		reference_2_contact_number: "",
		reference_2_date_of_the_service_provided: "",
		reference_2_description_of_the_service_provided: "",
		reference_2_add_comments: "",
	});
	const { t } = useI18n();
	const loadingSave = ref(false);
	const formLoading = ref(false);
	const disable = ref(false);
	const searchHeader = ref("");
	const csvFileHeaders = ref<Array<string>>([]);
	const localePath = useLocalePath();
	const isDownloadTemplete = ref(false);

	const rules = computed(() => {
		return {
			csv_file: {
				required: helpers.withMessage(t("formValidations.csv_file"), required),
			},
			company_name: {
				required: helpers.withMessage(t("formValidations.company_name"), required),
			},
			company_number: {
				required: helpers.withMessage(t("formValidations.company_number"), required),
			},
			company_website: {
				required: helpers.withMessage(t("formValidations.company_website"), required),
			},
			company_address: {
				required: helpers.withMessage(t("formValidations.company_address"), required),
			},
			company_city: {
				required: helpers.withMessage(t("formValidations.company_city"), required),
			},
			company_state: {
				required: helpers.withMessage(t("formValidations.company_state"), required),
			},
			company_post_code: {
				required: helpers.withMessage(t("formValidations.company_post_code"), required),
			},
			company_country: {
				required: helpers.withMessage(t("formValidations.company_country"), required),
			},
			company_tax_number: {
				required: helpers.withMessage(t("formValidations.company_tax_number"), required),
			},
			is_diverse_company: {
				required: helpers.withMessage(t("formValidations.is_diverse_company"), required),
			},
			first_name: {
				required: helpers.withMessage(t("formValidations.first_name"), required),
			},
			last_name: {
				required: helpers.withMessage(t("formValidations.last_name"), required),
			},
			department: {
				required: helpers.withMessage(t("formValidations.department"), required),
			},
			title: {
				required: helpers.withMessage(t("formValidations.title"), required),
			},
			address: {
				required: helpers.withMessage(t("formValidations.address"), required),
			},
			city: {
				required: helpers.withMessage(t("formValidations.city"), required),
			},
			state: {
				required: helpers.withMessage(t("formValidations.state"), required),
			},
			post_code: {
				required: helpers.withMessage(t("formValidations.post_code"), required),
			},
			country: {
				required: helpers.withMessage(t("formValidations.country"), required),
			},
			email: {
				required: helpers.withMessage(t("formValidations.email"), required),
			},
			contact_country_code: {
				required: helpers.withMessage(t("formValidations.contact_country_code"), required),
			},
			contact_number: {
				required: helpers.withMessage(t("formValidations.contact_number"), required),
			},
		};
	});

	const v$ = useVuelidate(rules, formParams);

	const listOfHeaders = computed(() => {
		return csvFileHeaders.value.filter((item) => item.toLowerCase().includes(searchHeader.value.toLowerCase()).toString());
	});

	const uploadFile = async (data: any) => {
		formParams.csv_file = data.file;

		if (data.file) {
			formLoading.value = true;

			await readCsvFile(data.file);

			setTimeout(() => {
				csvFileHeaders.value.forEach((element) => {
					const key = element.toLowerCase().trim().replace(/\s+/g, "_") as keyof typeof formParams;
					formParams[key] = element;

					switch (element) {
						case "Business Critical Supplier":
							formParams.key_supplier = element;
							break;
						case "Approval to share data with Marketplace":
							formParams.is_consent_to_share_with_marketplace = element;
							break;
						case "Privacy Policy Agreed":
							formParams.is_privacy_agreed = element;
							break;
						case "Are you a diverse company":
							formParams.is_diverse_company = element;
							break;
						case "Contact Number":
							formParams.dpo_mobile_number = element;
							break;
						case "Source of Credit Score":
							formParams.credit_score_source = element;
							break;
						case "ICO Number (UK Only)":
							formParams.credit_safe_ico_number = element;
							break;
						default:
							break;
					}
				});
				formLoading.value = false;
			}, 3000);
		}
	};

	const readCsvFile = async (file: any) => {
		const reader = new FileReader();

		reader.onload = (event) => {
			const csvData: any = event?.target?.result;
			// Process the CSV data (you may want to use a CSV parsing library)
			const data = csvData ? csvData.split("\n")[0].split(",") : [];
			data.forEach((element: any) => {
				csvFileHeaders.value.push(element.replace(/["']/g, ""));
			});
		};

		reader.readAsText(file);
	};

	const handleRemove = () => {
		formParams.csv_file = "";
	};

	const onSubmit = async () => {
		try {
			v$.value.$validate();
			if (!v$.value.$error) {
				loadingSave.value = true;

				const postFormData = new FormData();
				Object.entries(formParams).forEach(([key, value]) => {
					postFormData.append(key, value);
				});
				useToast("success", t("formLabels.importing_is_in_progress_please_wait"));
				const res = await useApiFetch("/supplier-admins/bulk-upload", {
					method: "POST",
					body: postFormData,
					headers: {
						ContentType: "multipart/form-data",
					},
				});

				if (res.data?.file_path) {
					const link: any = document.createElement("a");
					link.download = "file";
					link.href = res.data?.file_path;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					useToast("success", res?.message, 8000);
				} else {
					useToast("success", res?.message);
				}

				navigateTo(localePath("/supplier-admins"));
			}
		} catch (error) {
		} finally {
			loadingSave.value = false;
		}
	};

	const downloadTemplete = async () => {
		try {
			isDownloadTemplete.value = true;
			const response = await useApiFetch("/supplier-admins/bulk-upload/template", {
				method: "GET",
			});

			const link: any = document.createElement("a");
			link.download = "file";
			link.href = response.data.export_link;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			useToast("success", response?.message, 8000);
		} catch (error) {
		} finally {
			isDownloadTemplete.value = false;
		}
	};
</script>

<template>
	<div class="p-4 min-h-full" v-loading="loadingSave || formLoading">
		<el-form require-asterisk-position="right">
			<div>
				<div class="text-left pb-2">
					<div class="text-primary flex hover:underline cursor-pointer" @click="downloadTemplete">
						{{ $t("labels.download_example_csv_file") }}
						<base-md-loder v-if="isDownloadTemplete" class="ml-4" />
					</div>
				</div>

				<div>
					<base-upload-supplier
						:id="'csv_file'"
						:limit="1"
						:form-data="formParams.csv_file"
						name="csv_file"
						:customClass="{
							error: v$.csv_file.$error,
						}"
						@upload-file="uploadFile"
						@handle-remove="handleRemove"
						@blur="v$.csv_file.$touch"
					/>
					<span v-if="v$.csv_file.$error" class="text-xs text-red-500 mt-2">{{ v$.csv_file.$errors[0].$message }}</span>
				</div>
			</div>

			<div class="p-6" v-if="formParams.csv_file && !formLoading">
				<div class="pb-6">
					<h3 class="pb-3 text-2xl font-bold">
						{{ $t("formLabels.company_details") }}
					</h3>

					<div class="grid grid-cols-12 gap-5 lg:gap-6">
						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.company_name')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.company_name"
								:number-only="false"
								:clearable="true"
								name="company_name"
								:class="{
									error: v$.company_name.$error,
								}"
								@change="v$.company_name.$touch"
							/>
							<span v-if="v$.company_name.$error" class="text-xs text-red-500 mt-2">{{ v$.company_name.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.company_number')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.company_number"
								:number-only="false"
								:clearable="true"
								name="company_number"
								:class="{
									error: v$.company_number.$error,
								}"
								@change="v$.company_number.$touch"
							/>
							<span v-if="v$.company_number.$error" class="text-xs text-red-500 mt-2">{{ v$.company_number.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.company_telephone_country_code')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.company_telephone_country_code"
								:number-only="false"
								:clearable="true"
								name="company_telephone_country_code"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.company_telephone')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.company_telephone"
								:number-only="false"
								:clearable="true"
								name="company_telephone"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.company_email')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.company_email"
								:number-only="false"
								:clearable="true"
								name="company_email"
							/>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.company_website')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.company_website"
								:number-only="false"
								:clearable="true"
								name="company_website"
								:class="{
									error: v$.company_website.$error,
								}"
								@change="v$.company_website.$touch"
							/>
							<span v-if="v$.company_website.$error" class="text-xs text-red-500 mt-2">{{
								v$.company_website.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.company_address')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.company_address"
								:number-only="false"
								:clearable="true"
								name="company_address"
								:class="{
									error: v$.company_address.$error,
								}"
								@change="v$.company_address.$touch"
							/>
							<span v-if="v$.company_address.$error" class="text-xs text-red-500 mt-2">{{
								v$.company_address.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.company_city')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.company_city"
								:number-only="false"
								:clearable="true"
								name="company_city"
								:class="{
									error: v$.company_website.$error,
								}"
								@change="v$.company_website.$touch"
							/>
							<span v-if="v$.company_website.$error" class="text-xs text-red-500 mt-2">{{
								v$.company_website.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.company_state')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.company_state"
								:number-only="false"
								:clearable="true"
								name="company_state"
								:class="{
									error: v$.company_state.$error,
								}"
								@change="v$.company_state.$touch"
							/>
							<span v-if="v$.company_state.$error" class="text-xs text-red-500 mt-2">{{ v$.company_state.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item
							:rules="[{ required: true }]"
							:label="$t('formLabels.company_post_code')"
							class="col-span-12 sm:col-span-4 mb-0"
						>
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.company_post_code"
								:number-only="false"
								:clearable="true"
								name="company_post_code"
								:class="{
									error: v$.company_post_code.$error,
								}"
								@change="v$.company_post_code.$touch"
							/>
							<span v-if="v$.company_post_code.$error" class="text-xs text-red-500 mt-2">{{
								v$.company_post_code.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.company_country')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.company_country"
								:number-only="false"
								:clearable="true"
								name="company_country"
								:class="{
									error: v$.company_country.$error,
								}"
								@change="v$.company_country.$touch"
							/>
							<span v-if="v$.company_country.$error" class="text-xs text-red-500 mt-2">{{
								v$.company_country.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item
							:rules="[{ required: true }]"
							:label="$t('formLabels.company_vat_number')"
							class="col-span-12 sm:col-span-4 mb-0"
						>
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.company_tax_number"
								:number-only="false"
								:clearable="true"
								name="company_tax_number"
								:class="{
									error: v$.company_tax_number.$error,
								}"
								@change="v$.company_tax_number.$touch"
							/>
							<span v-if="v$.company_tax_number.$error" class="text-xs text-red-500 mt-2">{{
								v$.company_tax_number.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.diverse_company')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.is_diverse_company"
								:number-only="false"
								:clearable="true"
								name="is_diverse_company"
								:class="{
									error: v$.is_diverse_company.$error,
								}"
								@change="v$.is_diverse_company.$touch"
							/>
							<span v-if="v$.is_diverse_company.$error" class="text-xs text-red-500 mt-2">{{
								v$.is_diverse_company.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.company_type')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.company_type"
								:number-only="false"
								:clearable="true"
								name="company_type"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.other_company_type')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.other_company_type"
								:number-only="false"
								:clearable="true"
								name="other_company_type"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.category_level_1')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.category_level_1"
								:number-only="false"
								:clearable="true"
								name="category_level_1"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.category_level_2')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.category_level_2"
								:number-only="false"
								:clearable="true"
								name="category_level_2"
							/>
						</el-form-item>
					</div>
				</div>

				<div class="pb-6">
					<h3 class="pb-3 text-2xl font-bold">
						{{ $t("formLabels.supplier-admin-details") }}
					</h3>

					<div class="grid grid-cols-12 gap-5 lg:gap-6">
						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.first_name')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.first_name"
								:number-only="false"
								:clearable="true"
								name="first_name"
								:class="{
									error: v$.first_name.$error,
								}"
								@change="v$.first_name.$touch"
							/>
							<span v-if="v$.first_name.$error" class="text-xs text-red-500 mt-2">{{ v$.first_name.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.last_name')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.last_name"
								:number-only="false"
								:clearable="true"
								name="last_name"
								:class="{
									error: v$.last_name.$error,
								}"
								@change="v$.last_name.$touch"
							/>
							<span v-if="v$.last_name.$error" class="text-xs text-red-500 mt-2">{{ v$.last_name.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.department')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.department"
								:number-only="false"
								:clearable="true"
								name="department"
								:class="{
									error: v$.department.$error,
								}"
								@change="v$.department.$touch"
								@keypress="CharcterWithWhitespace"
							/>
							<span v-if="v$.department.$error" class="text-xs text-red-500 mt-2">{{ v$.department.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.job_title')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.title"
								:number-only="false"
								:clearable="true"
								name="title"
								:class="{
									error: v$.title.$error,
								}"
								@change="v$.title.$touch"
							/>
							<span v-if="v$.title.$error" class="text-xs text-red-500 mt-2">{{ v$.title.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.address')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.address"
								:number-only="false"
								:clearable="true"
								name="address"
								:class="{
									error: v$.address.$error,
								}"
								@change="v$.address.$touch"
							/>
							<span v-if="v$.address.$error" class="text-xs text-red-500 mt-2">{{ v$.address.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.city')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.city"
								:number-only="false"
								:clearable="true"
								name="city"
								:class="{
									error: v$.city.$error,
								}"
								@change="v$.city.$touch"
							/>
							<span v-if="v$.city.$error" class="text-xs text-red-500 mt-2">{{ v$.city.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.state')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.state"
								:number-only="false"
								:clearable="true"
								name="state"
								:class="{
									error: v$.state.$error,
								}"
								@change="v$.state.$touch"
							/>
							<span v-if="v$.state.$error" class="text-xs text-red-500 mt-2">{{ v$.state.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.post_code')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.post_code"
								:number-only="false"
								:clearable="true"
								name="post_code"
								:class="{
									error: v$.post_code.$error,
								}"
								@change="v$.post_code.$touch"
							/>
							<span v-if="v$.post_code.$error" class="text-xs text-red-500 mt-2">{{ v$.post_code.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.country')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.country"
								:number-only="false"
								:clearable="true"
								name="country"
								:class="{
									error: v$.country.$error,
								}"
								@change="v$.country.$touch"
							/>
							<span v-if="v$.country.$error" class="text-xs text-red-500 mt-2">{{ v$.country.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.email')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.email"
								:number-only="false"
								:clearable="true"
								name="email"
								:class="{
									error: v$.email.$error,
								}"
								@change="v$.email.$touch"
							/>
							<span v-if="v$.email.$error" class="text-xs text-red-500 mt-2">{{ v$.email.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item
							:rules="[{ required: true }]"
							:label="$t('formLabels.contact_country_code')"
							class="col-span-12 sm:col-span-4 mb-0"
						>
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.contact_country_code"
								:number-only="false"
								:clearable="true"
								name="contact_country_code"
								:class="{
									error: v$.contact_country_code.$error,
								}"
								@change="v$.contact_country_code.$touch"
							/>
							<span v-if="v$.contact_country_code.$error" class="text-xs text-red-500 mt-2">{{
								v$.contact_country_code.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.contact_number')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.contact_number"
								:number-only="false"
								:clearable="true"
								name="contact_number"
								:class="{
									error: v$.contact_number.$error,
								}"
								@change="v$.contact_number.$touch"
							/>
							<span v-if="v$.contact_number.$error" class="text-xs text-red-500 mt-2">{{ v$.contact_number.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.is_key_supplier')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.key_supplier"
								:number-only="false"
								:clearable="true"
								name="key_supplier"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.key_supplier_comment')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.key_supplier_comment"
								:number-only="false"
								:clearable="true"
								name="key_supplier_comment"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.approval_to_share_data_with_marketplace')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.is_consent_to_share_with_marketplace"
								:number-only="false"
								:clearable="true"
								name="is_consent_to_share_with_marketplace"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.is_privacy_agreed')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.is_privacy_agreed"
								:number-only="false"
								:clearable="true"
								name="is_privacy_agreed"
							/>
						</el-form-item>
					</div>
				</div>

				<div class="pb-6">
					<h3 class="pb-3 text-2xl font-bold">
						{{ $t("formLabels.alternative_contact") }}
					</h3>

					<div class="grid grid-cols-12 gap-5 lg:gap-6">
						<el-form-item :label="$t('formLabels.alternative_contact_first_name')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.alternative_contact_first_name"
								:number-only="false"
								:clearable="true"
								name="alternative_contact_first_name"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.alternative_contact_last_name')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.alternative_contact_last_name"
								:number-only="false"
								:clearable="true"
								name="alternative_contact_last_name"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.alternative_contact_department')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.alternative_contact_department"
								:number-only="false"
								:clearable="true"
								name="alternative_contact_department"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.alternative_contact_job_title')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.alternative_contact_job_title"
								:number-only="false"
								:clearable="true"
								name="alternative_contact_job_title"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.alternative_contact_email')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.alternative_contact_email"
								:number-only="false"
								:clearable="true"
								name="alternative_contact_email"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.alternative_contact_country_code')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.alternative_contact_country_code"
								:number-only="false"
								:clearable="true"
								name="alternative_contact_country_code"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.alternative_contact_number')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.alternative_contact_number"
								:number-only="false"
								:clearable="true"
								name="alternative_contact_number"
							/>
						</el-form-item>
					</div>
				</div>

				<div class="pb-6">
					<h3 class="pb-3 text-2xl font-bold">
						{{ $t("formLabels.compliance") }}
					</h3>

					<div class="grid grid-cols-12 gap-5 lg:gap-6">
						<el-form-item :label="$t('formLabels.dpo_first_name')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.dpo_first_name"
								:number-only="false"
								:clearable="true"
								name="dpo_first_name"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.dpo_last_name')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.dpo_last_name"
								:number-only="false"
								:clearable="true"
								name="dpo_last_name"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.email')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.dpo_email"
								:number-only="false"
								:clearable="true"
								name="dpo_email"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.dpo_country_code')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.dpo_country_code"
								:number-only="false"
								:clearable="true"
								name="dpo_country_code"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.contact_number')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.dpo_mobile_number"
								:number-only="false"
								:clearable="true"
								name="dpo_mobile_number"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.dnb_number')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.dnb_number"
								:number-only="false"
								:clearable="true"
								name="dnb_number"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.credit_safe_score')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.credit_score"
								:number-only="false"
								:clearable="true"
								name="credit_score"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.source_of_credit_score')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.credit_score_source"
								:number-only="false"
								:clearable="true"
								name="credit_score_source"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.report_date')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.report_date"
								:number-only="false"
								:clearable="true"
								name="report_date"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.ico_number')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.credit_safe_ico_number"
								:number-only="false"
								:clearable="true"
								name="credit_safe_ico_number"
							/>
						</el-form-item>
					</div>
				</div>

				<div class="pb-6">
					<h3 class="pb-3 text-2xl font-bold">
						{{ $t("formLabels.reference-1") }}
					</h3>

					<div class="grid grid-cols-12 gap-5 lg:gap-6">
						<el-form-item :label="$t('formLabels.reference_1_first_name')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.reference_1_first_name"
								:number-only="false"
								:clearable="true"
								name="reference_1_first_name"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.reference_1_last_name')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.reference_1_last_name"
								:number-only="false"
								:clearable="true"
								name="reference_1_last_name"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.reference_1_company_name')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.reference_1_company_name"
								:number-only="false"
								:clearable="true"
								name="reference_1_company_name"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.reference_1_role')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.reference_1_role"
								:number-only="false"
								:clearable="true"
								name="reference_1_role"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.reference_1_email')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.reference_1_email"
								:number-only="false"
								:clearable="true"
								name="reference_1_email"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.reference_1_country_code')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.reference_1_country_code"
								:number-only="false"
								:clearable="true"
								name="reference_1_country_code"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.reference_1_contact_number')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.reference_1_contact_number"
								:number-only="false"
								:clearable="true"
								name="reference_1_contact_number"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.service_provided_description')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.reference_1_description_of_the_service_provided"
								:number-only="false"
								:clearable="true"
								name="reference_1_description_of_the_service_provided"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.service_provided_date')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.reference_1_date_of_the_service_provided"
								:number-only="false"
								:clearable="true"
								name="reference_1_date_of_the_service_provided"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.add_comments')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.reference_1_add_comments"
								:number-only="false"
								:clearable="true"
								name="reference_1_add_comments"
							/>
						</el-form-item>
					</div>
				</div>

				<div class="pb-6">
					<h3 class="pb-3 text-2xl font-bold">
						{{ $t("formLabels.reference-2") }}
					</h3>

					<div class="grid grid-cols-12 gap-5 lg:gap-6">
						<el-form-item :label="$t('formLabels.reference_2_first_name')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.reference_2_first_name"
								:number-only="false"
								:clearable="true"
								name="reference_2_first_name"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.reference_2_last_name')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.reference_2_last_name"
								:number-only="false"
								:clearable="true"
								name="reference_2_last_name"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.reference_2_company_name')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.reference_2_company_name"
								:number-only="false"
								:clearable="true"
								name="reference_2_company_name"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.reference_2_role')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.reference_2_role"
								:number-only="false"
								:clearable="true"
								name="reference_2_role"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.reference_2_email')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.reference_2_email"
								:number-only="false"
								:clearable="true"
								name="reference_2_email"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.reference_2_country_code')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.reference_2_country_code"
								:number-only="false"
								:clearable="true"
								name="reference_2_country_code"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.reference_2_contact_number')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.reference_2_contact_number"
								:number-only="false"
								:clearable="true"
								name="reference_2_contact_number"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.service_provided_description')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.reference_2_description_of_the_service_provided"
								:number-only="false"
								:clearable="true"
								name="reference_2_description_of_the_service_provided"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.service_provided_date')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.reference_2_date_of_the_service_provided"
								:number-only="false"
								:clearable="true"
								name="reference_2_date_of_the_service_provided"
							/>
						</el-form-item>

						<el-form-item :label="$t('formLabels.add_comments')" class="col-span-12 sm:col-span-4 mb-0">
							<base-mapping-header-select
								:dropdown-option="listOfHeaders"
								v-model="formParams.reference_2_add_comments"
								:number-only="false"
								:clearable="true"
								name="reference_2_add_comments"
							/>
						</el-form-item>
					</div>
				</div>
			</div>
		</el-form>

		<div class="pt-6 pb-6 text-right">
			<novok-button :disabled="formLoading || loadingSave" class="btn-dark my-1" @click.prevent="CancelRedirect('/supplier-admins')"
				><span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span
				><i class="fa-solid fa-xmark sm:hidden"></i
			></novok-button>

			<novok-button class="my-1" type="info" :loading="loadingSave" :disabled="loadingSave || formLoading" @click.prevent="onSubmit()"
				>{{ $t("buttons.save") }}
			</novok-button>
		</div>
	</div>
</template>
<style>
	/* @import "~/assets/css/main.css"; */
</style>
