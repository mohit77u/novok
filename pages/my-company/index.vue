<script setup lang="ts">
	import { required, maxLength, helpers, url } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";

	import { Delete } from "@element-plus/icons-vue";
	import type { UploadProps, UploadInstance, UploadRawFile } from "element-plus";
	import { genFileId } from "element-plus";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import { useProfileStore } from "~/store/profile";

	definePageMeta({
		// layout: "auth",
		middleware: ["auth", "supplier"],
	});

	useHead({
		title: "My Company",
	});

	const formData = reactive<any>({
		company_logo: "",
		company_name: "",
		company_number: "",
		company_address: "",
		company_country: "",
		company_state: "",
		company_city: "",
		company_post_code: "",
		company_hq_address: "",
		company_hq_country: "",
		company_hq_state: "",
		company_hq_city: "",
		company_hq_post_code: "",
		company_website: "",
		additional_information: "",
		id: "",
	});
	const copyFormData = ref<any>({});
	const loading = ref(false);
	const fullscreenLoading = ref(false);
	const dialogVisible = ref(false);
	const formHeight = ref<any>(null);
	const localePath = useLocalePath();
	const { t } = useI18n();
	const upload = ref<UploadInstance>();
	const file = ref<any>(null);
	const dialogImageUrl = ref("");
	const imageUrl = ref("");
	const fileList = ref<any>([]);
	const deleteImg = ref(false);
	const companyAddress = ref("");
	const companyHqAddress = ref("");
	const disabledDeleteIcon = ref("false");
	const store = useProfileStore();
	const config = useRuntimeConfig();
	const router = useRouter();

	const rules = computed(() => {
		return {
			company_name: {
				required: helpers.withMessage(t("formValidations.reg_company_name"), required),
				maxLength: helpers.withMessage(t("formValidations.reg_company_name_max"), maxLength(100)),
				// name_validation: {
				//   $validator: PasteCharcAndNumWithSpace,
				//   $message: t("copyPasteValidations.charNum"),
				// },
			},
			company_number: {
				required: helpers.withMessage(t("formValidations.reg_company_number"), required),
				name_validation: {
					$validator: PasteCharcAndNum,
					$message: t("copyPasteValidations.charNum"),
				},
			},
			company_address: {
				required: helpers.withMessage(t("formValidations.reg_company_address"), required),
				maxLength: helpers.withMessage(t("formValidations.reg_company_address_max"), maxLength(100)),
			},
			company_country: {
				required: helpers.withMessage(t("formValidations.country"), required),
				maxLength: helpers.withMessage(t("formValidations.country_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			company_state: {
				maxLength: helpers.withMessage(t("formValidations.state_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			company_city: {
				maxLength: helpers.withMessage(t("formValidations.city"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			company_post_code: {
				required: helpers.withMessage(t("formValidations.post_code"), required),
				maxLength: helpers.withMessage(t("formValidations.post_code_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcAndNumWithSpace,
					$message: t("copyPasteValidations.charNum"),
				},
			},
			company_hq_address: {
				required: helpers.withMessage(t("formValidations.company_hq_address"), required),
				maxLength: helpers.withMessage(t("formValidations.company_hq_address_max"), maxLength(100)),
			},
			company_hq_country: {
				required: helpers.withMessage(t("formValidations.country"), required),
				maxLength: helpers.withMessage(t("formValidations.country_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			company_hq_state: {
				maxLength: helpers.withMessage(t("formValidations.state_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			company_hq_city: {
				maxLength: helpers.withMessage(t("formValidations.city"), maxLength(50)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			company_hq_post_code: {
				required: helpers.withMessage(t("formValidations.post_code"), required),
				maxLength: helpers.withMessage(t("formValidations.post_code_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcAndNumWithSpace,
					$message: t("copyPasteValidations.charNum"),
				},
			},
			company_website: {
				// url: helpers.withMessage(t("formValidations.company_website"), url),
			},
			additional_information: {
				maxLength: helpers.withMessage(t("formValidations.company_additional_information_max"), maxLength(50)),
			},
		};
	});

	const v$ = useVuelidate(rules, copyFormData);

	watch(
		() => formData,
		(currData) => {
			if (imageUrl.value) {
				fileList.value = [
					{
						name: "img.jpeg",
						url: imageUrl,
					},
				];
			} else if (currData?.company_logo) {
				fileList.value = [
					{
						name: "img.jpeg",
						url: `${formData?.company_logo} `,
					},
				];
			} else {
				fileList.value = [
					{
						name: "img.jpeg",
						url: config.public.default_user_link,
					},
				];
			}
		},
		{ deep: true, immediate: true }
	);

	onMounted(async () => {
		formHeight.value = GetOffset("super-admin-form", 0);
		// formData.id = route?.params?.id;
		copyFormData.value = JSON.parse(JSON.stringify(formData));
		const companyId = JSON.parse(sessionStorage.getItem("company_id") || "");
		if (companyId) {
			await getEditCompanyData(companyId);
		}
	});

	const getEditCompanyData = async (id: any) => {
		try {
			fullscreenLoading.value = true;

			const res: any = await useApiFetch(`/company-profile/${id}`, {
				method: "GET",
			});

			Object.keys(formData).forEach((field) => {
				formData[field] = res?.data?.[field];
			});

			companyAddress.value = res.data?.company_address;
			companyHqAddress.value = res.data?.company_hq_address;
			disabledDeleteIcon.value = res.data?.is_default_company_logo;
			copyFormData.value = JSON.parse(JSON.stringify(formData));
		} catch {
		} finally {
			setTimeout(() => {
				fullscreenLoading.value = false;
			}, 1000);
		}
	};

	const onSubmit = () => {
		v$.value.$validate();
		if (!v$.value.$error) {
			// formData.company_address = formData.company_address.trim();
			// formData.company_name = formData.company_name.trim();
			updateCompanyData();
		} else {
			setTimeout(() => {
				const firstErrorElement = document.querySelector(".error");
				if (firstErrorElement) {
					firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
				}
			}, 250);
		}
	};

	const updateCompanyData = async () => {
		try {
			fullscreenLoading.value = true;

			if ((copyFormData.value.company_logo || copyFormData.value.company_logo === null) && deleteImg?.value === true) {
				copyFormData.value.company_logo = "";
			}

			if (formData.company_logo === copyFormData.value.company_logo) {
				copyFormData.value.company_logo = "";
			}

			// copyFormData.value._method = "PATCH";

			const fd = new FormData();
			Object.keys(copyFormData.value).forEach((field) => {
				fd.append(field, copyFormData.value?.[field]);
			});

			const res: any = await useApiFetch(`/company-profile/${formData.id}`, {
				method: "POST",
				body: fd,
			});

			let userDetails = store.getProfileData;
			userDetails.user_detail.company = res.data;

			store.setProfile(userDetails);
			useToast("success", res.message);
			getEditCompanyData(res.data?.id);
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const handleExceed: UploadProps["onExceed"] = (files) => {
		upload.value!.clearFiles();
		const file = files[0] as UploadRawFile;
		file.uid = genFileId();
		upload.value!.handleStart(file);
	};

	const handleRemove = () => {
		fileList.value = [];
		imageUrl.value = "";
		copyFormData.value.company_logo = "";

		copyFormData.value.delete_company_logo = 1;
		deleteImg.value = true;
	};

	const onChange: UploadProps["onChange"] = (uploadFile: any) => {
		file.value = uploadFile.file;
		copyFormData.value.company_logo = file.value;
		deleteImg.value = false;
		disabledDeleteIcon.value = "false";
	};

	const getAddress = (address: any, companyAddress: any, id: any) => {
		if (id === "companyaddress") {
			copyFormData.value.company_address = companyAddress;
			copyFormData.value.company_city = address?.city;
			copyFormData.value.company_country = address?.country;
			copyFormData.value.company_post_code = address?.postal_code;
			copyFormData.value.company_state = address?.region;
		} else {
			copyFormData.value.company_hq_address = companyAddress;
			copyFormData.value.company_hq_city = address?.city;
			copyFormData.value.company_hq_country = address?.country;
			copyFormData.value.company_hq_post_code = address?.postal_code;
			copyFormData.value.company_hq_state = address?.region;
		}
	};

	const changeAddress = (address: any, id: any) => {
		if (id === "companyaddress") {
			copyFormData.value.company_address = address;
		} else {
			copyFormData.value.company_hq_address = address;
		}
	};

	const handleCroppedFile = (data: any) => {
		disabledDeleteIcon.value = "false";
		// emit("upload-file", { file: data.file });
		fileList.value[0].name = data.file.name;
		fileList.value[0].url = data.url;

		file.value = data.file;
		copyFormData.value.company_logo = file.value;
		imageUrl.value = data.url;
		deleteImg.value = false;
	};
</script>

<template>
	<el-form v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="flex flex-col relative">
		<div id="super-admin-form">
			<div class="p-6">
				<div class="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6 lg:space-x-8">
					<div class="border-dashed border rounded-md border-gray-400 p-4 relative">
						<BaseLabel :tooltip-content="$t('info.reg_company_logo')" class="absolute right-0 top-0" />
						<el-form-item type="file" class="uploadImg mb-0 upload-crop rectangleImage" prop="imgUrl">
							<BaseCompanyLogo
								:limit="1"
								:disabled="false"
								:form-data="copyFormData"
								@upload-file="onChange"
								@handle-remove="handleRemove"
								:aspect-ratio="16 / 9"
							/>
						</el-form-item>
					</div>

					<div class="grid md:grid-cols-2 lg:grid-cols-6 gap-5 lg:gap-6 flex-grow w-full">
						<el-form-item :label="$t('formLabels.reg_company_name')" :rules="[{ required: true }]" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel
									:label="$t('formLabels.reg_company_name')"
									:tooltip-content="$t('info.reg_company_name')"
									:isShowLabel="false"
								/>
							</template>
							<el-input
								v-model="copyFormData.company_name"
								name="company_name"
								type="text"
								:class="{
									error: v$.company_name.$error,
								}"
								maxLength="100"
								@change="v$.company_name.$touch"
							/>
							<span v-if="v$.company_name.$error" class="text-xs text-red-500 mt-2">{{ v$.company_name.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.reg_company_number')" :rules="[{ required: true }]" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel
									:label="$t('formLabels.reg_company_number')"
									:tooltip-content="$t('info.reg_company_number')"
									:isShowLabel="false"
								/>
							</template>
							<el-input
								v-model.trim="copyFormData.company_number"
								name="company_number"
								type="text"
								:class="{ error: v$.company_number.$error }"
								@change="v$.company_number.$touch"
								@keypress="CharcAndNumber"
							/>
							<span v-if="v$.company_number.$error" class="text-xs text-red-500 mt-2">{{ v$.company_number.$errors[0].$message }}</span>
						</el-form-item>

						<div class="lg:col-span-3">
							<div class="inline-flex items-center mr-5">
								<span class="text-dark font-bold block">{{ $t("formLabels.reg_company_address") }}</span>
								<span class="text-red-400">*</span>
								<BaseLabel :tooltip-content="$t('info.address')" :isShowLabel="false" />
							</div>
							<BaseAddress
								id="companyaddress"
								v-model="formData.company_address"
								:address="companyAddress"
								name="company_address"
								:class="{
									error: v$.company_address.$error,
								}"
								maxLength="100"
								@changed_address="changeAddress"
								@get-address="getAddress"
								@change="v$.company_address.$touch"
							/>
							<span v-if="v$.company_address.$error" class="text-xs text-red-500 mt-2">{{
								v$.company_address.$errors[0].$message
							}}</span>
						</div>

						<el-form-item :label="$t('formLabels.city')" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.city')" :tooltip-content="$t('info.city')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="copyFormData.company_city"
								type="text"
								name="company_city"
								:class="{
									error: v$.company_city.$error,
								}"
								maxLength="80"
								@change="v$.company_city.$touch"
								@keypress="CharcterWithWhitespace"
							/>
							<span v-if="v$.company_city.$error" class="text-xs text-red-500 mt-2">{{ v$.company_city.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.state')" class="lg:col-span-2 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.state')" :tooltip-content="$t('info.state')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="copyFormData.company_state"
								type="text"
								name="company_state"
								:class="{
									error: v$.company_state.$error,
								}"
								maxLength="80"
								@change="v$.company_state.$touch"
								@keypress="CharcterWithWhitespace"
							/>
							<span v-if="v$.company_state.$error" class="text-xs text-red-500 mt-2">{{ v$.company_state.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.post_code')" :rules="[{ required: true }]" class="lg:col-span-2 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.post_code')" :tooltip-content="$t('info.post_code')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="copyFormData.company_post_code"
								type="text"
								name="company_post_code"
								:class="{
									error: v$.company_post_code.$error,
								}"
								maxLength="10"
								@change="v$.company_post_code.$touch"
								@keypress="CharcAndNumber"
							/>
							<span v-if="v$.company_post_code.$error" class="text-xs text-red-500 mt-2">{{
								v$.company_post_code.$errors[0].$message
							}}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.country')" :rules="[{ required: true }]" class="lg:col-span-2 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.country')" :tooltip-content="$t('info.country')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="copyFormData.company_country"
								type="text"
								name="company_country"
								:class="{
									error: v$.company_country.$error,
								}"
								maxLength="80"
								@change="v$.company_country.$touch"
								@keypress="CharcterWithWhitespace"
							/>
							<span v-if="v$.company_country.$error" class="text-xs text-red-500 mt-2">{{
								v$.company_country.$errors[0].$message
							}}</span>
						</el-form-item>
					</div>
				</div>

				<div class="pb-3 flex items-center">
					<h3 class="text-2xl font-bold my-6">{{ $t("formLabels.company_headquarter_details") }}</h3>
					<BaseLabel :tooltip-content="$t('info.company_headquarter_details')" />
				</div>
				<div class="grid md:grid-cols-2 lg:grid-cols-6 gap-5 lg:gap-6">
					<div class="lg:col-span-3">
						<div class="inline-flex items-center mr-5">
							<span class="text-dark font-bold block">{{ $t("formLabels.company_hq_address") }}</span>
							<span class="text-red-400">*</span>
							<BaseLabel :tooltip-content="$t('info.address')" :isShowLabel="false" />
						</div>
						<BaseAddress
							id="companyhqaddress"
							v-model="copyFormData.company_hq_address"
							:address="companyHqAddress"
							name="company_hq_address"
							:class="{
								error: v$.company_hq_address.$error,
							}"
							maxLength="100"
							@changed_address="changeAddress"
							@get-address="getAddress"
							@change="v$.company_hq_address.$touch"
						/>
						<span v-if="v$.company_hq_address.$error" class="text-xs text-red-500 mt-2">{{
							v$.company_hq_address.$errors[0].$message
						}}</span>
					</div>

					<el-form-item :label="$t('formLabels.city')" class="lg:col-span-3 mb-0">
						<template #label>
							<BaseLabel :label="$t('formLabels.city')" :tooltip-content="$t('info.city')" :isShowLabel="false" />
						</template>
						<el-input
							v-model="copyFormData.company_hq_city"
							type="text"
							name="company_hq_city"
							:class="{
								error: v$.company_hq_city.$error,
							}"
							maxLength="50"
							@change="v$.company_hq_city.$touch"
							@keypress="CharcterWithWhitespace"
						/>
						<span v-if="v$.company_hq_city.$error" class="text-xs text-red-500 mt-2">{{ v$.company_hq_city.$errors[0].$message }}</span>
					</el-form-item>

					<el-form-item :label="$t('formLabels.state')" class="lg:col-span-2 mb-0">
						<template #label>
							<BaseLabel :label="$t('formLabels.state')" :tooltip-content="$t('info.state')" :isShowLabel="false" />
						</template>
						<el-input
							v-model="copyFormData.company_hq_state"
							type="text"
							name="company_hq_state"
							:class="{
								error: v$.company_hq_state.$error,
							}"
							maxLength="80"
							@change="v$.company_hq_state.$touch"
							@keypress="CharcterWithWhitespace"
						/>
						<span v-if="v$.company_hq_state.$error" class="text-xs text-red-500 mt-2">{{ v$.company_hq_state.$errors[0].$message }}</span>
					</el-form-item>

					<el-form-item :label="$t('formLabels.post_code')" :rules="[{ required: true }]" class="lg:col-span-2 mb-0">
						<template #label>
							<BaseLabel :label="$t('formLabels.post_code')" :tooltip-content="$t('info.post_code')" :isShowLabel="false" />
						</template>
						<el-input
							v-model="copyFormData.company_hq_post_code"
							type="text"
							name="company_hq_post_code"
							:class="{
								error: v$.company_hq_post_code.$error,
							}"
							maxLength="10"
							@change="v$.company_hq_post_code.$touch"
							@keypress="CharcAndNumber"
						/>
						<span v-if="v$.company_hq_post_code.$error" class="text-xs text-red-500 mt-2">{{
							v$.company_hq_post_code.$errors[0].$message
						}}</span>
					</el-form-item>

					<el-form-item :label="$t('formLabels.country')" :rules="[{ required: true }]" class="lg:col-span-2 mb-0">
						<template #label>
							<BaseLabel :label="$t('formLabels.country')" :tooltip-content="$t('info.country')" :isShowLabel="false" />
						</template>
						<el-input
							v-model="copyFormData.company_hq_country"
							type="text"
							name="company_country"
							:class="{
								error: v$.company_hq_country.$error,
							}"
							maxLength="80"
							@change="v$.company_hq_country.$touch"
							@keypress="CharcterWithWhitespace"
						/>
						<span v-if="v$.company_hq_country.$error" class="text-xs text-red-500 mt-2">{{
							v$.company_hq_country.$errors[0].$message
						}}</span>
					</el-form-item>

					<el-form-item :label="$t('formLabels.company_website')" class="lg:col-span-3 mb-0">
						<template #label>
							<BaseLabel :label="$t('formLabels.company_website')" :tooltip-content="$t('info.company_website')" :isShowLabel="false" />
						</template>
						<el-input
							v-model="copyFormData.company_website"
							type="text"
							name="company_website"
							:class="{
								error: v$.company_website.$error,
							}"
							@change="v$.company_website.$touch"
						/>
						<span v-if="v$.company_website.$error" class="text-xs text-red-500 mt-2">{{ v$.company_website.$errors[0].$message }}</span>
					</el-form-item>

					<el-form-item :label="$t('formLabels.company_addtional_info')" class="lg:col-span-3 mb-0">
						<template #label>
							<BaseLabel
								:label="$t('formLabels.company_addtional_info')"
								:tooltip-content="$t('info.company_addtional_info')"
								:isShowLabel="false"
							/>
						</template>
						<el-input
							v-model="copyFormData.additional_information"
							type="text"
							name="additional_information"
							:class="{
								error: v$.additional_information.$error,
							}"
							maxLength="50"
							@change="v$.additional_information.$touch"
						/>
						<span v-if="v$.additional_information.$error" class="text-xs text-red-500 mt-2">{{
							v$.additional_information.$errors[0].$message
						}}</span>
					</el-form-item>
				</div>
				<div class="pt-6 flex justify-end">
					<novok-button type="cyan" @click.prevent="router.go(-1)">
						<i class="fa-regular fa-arrow-left mr-2"></i> {{ $t("buttons.back") }}
					</novok-button>
					<novok-button type="info" :loading="loading" :disabled="loading" @click.prevent="onSubmit"
						>{{ $t("buttons.save_changes") }}
					</novok-button>
				</div>
			</div>
		</div>
	</el-form>
</template>
<style>
	/* @import "~/assets/css/main.css"; */
</style>
