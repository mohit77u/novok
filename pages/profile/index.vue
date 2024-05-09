<script setup lang="ts">
	import { required, email, minLength, helpers, maxLength } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import { Delete } from "@element-plus/icons-vue";
	import type { UploadProps, UploadInstance, UploadRawFile } from "element-plus";
	import { genFileId } from "element-plus";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import { useProfileStore } from "~/store/profile";
	import { languageData, CurrencyData } from "~/helper/data";
	import { removeEmptyValues } from "~/helper/common";

	definePageMeta({
		middleware: ["auth", "supplier"],
	});

	useHead({
		title: "My Profile",
	});

	const visible = ref(false);
	const router = useRouter();

	let profileDetails = ref<any>({
		first_name: "",
		last_name: "",
		job_title: "",
		department: "",
		line_manager: "",
		line_manager_email: "",
		email: "",
		mobile_number: "",
		country_code: "+44",
		address: "",
		city: "",
		country: "",
		state: "",
		post_code: "",
		preferred_langauge: "",
		gdpr_training_completed_date: "",
		profile_picture: "",
		timezone: "Europe/London",
	});
	const formData = reactive<any>({
		mfa_code: "",
	});
	const copyProfileDetails = ref<any>({});
	const loading = ref(false);
	const upload = ref<UploadInstance>();
	const file = ref<any>(null);
	const dialogImageUrl = ref("");
	const dialogVisible = ref(false);
	const imageUrl = ref("");
	const fileList = ref<any>([]);
	const fullscreenLoading = ref(false);
	const store = useProfileStore();
	const deleteImg = ref(false);
	const userId = ref("");
	const qrImage = ref<any>("");
	const qrCode = ref<any>("");
	const mfaType = ref(false);
	const { t } = useI18n();
	const localePath = useLocalePath();
	const clients = ref<any>([]);
	const address = ref("");
	const disableDeleteIcon = ref("false");
	const errMessage = ref("");
	const timeZonesList = ref([]);

	const { getSelectedCountry, getCountry } = useGetSelectedCountry();

	const rules = computed(() => {
		return {
			first_name: {
				required: helpers.withMessage(t("formValidations.first_name"), required),
				maxLength: helpers.withMessage(t("formValidations.first_name_max"), maxLength(50)),
				name_validation: {
					$validator: PasteCharSpecCharWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			last_name: {
				required: helpers.withMessage(t("formValidations.last_name"), required),
				maxLength: helpers.withMessage(t("formValidations.last_name_max"), maxLength(50)),
				name_validation: {
					$validator: PasteCharSpecCharWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			job_title: {
				required: helpers.withMessage(t("formValidations.job_title"), required),
				maxLength: helpers.withMessage(t("formValidations.job_title_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcAndNumWithSpace,
					$message: t("copyPasteValidations.charNum"),
				},
			},
			department: {
				required: helpers.withMessage(t("formValidations.department"), required),
				maxLength: helpers.withMessage(t("formValidations.department_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			email: {
				required: helpers.withMessage("Please enter Email address.", required),
				email: helpers.withMessage(t("formValidations.email_valid"), email),
				name_validation: {
					$validator: PasteEmail,
					$message: t("formValidations.email_valid"),
				},
			},
			line_manager_email: {
				email: helpers.withMessage(t("formValidations.email_valid"), email),
				// name_validation: {
				// 	$validator: PasteEmail,
				// 	$message: t("formValidations.email_valid"),
				// },
			},
			mobile_number: {
				required: helpers.withMessage(t("formValidations.contact_number"), required),
				minLength: helpers.withMessage(t("formValidations.contact_number_min"), minLength(10)),
				maxLength: helpers.withMessage(t("formValidations.contact_number_max"), maxLength(10)),
				name_validation: {
					$validator: PasteNumberOnly,
					$message: t("copyPasteValidations.number"),
				},
			},
			address: {
				required: helpers.withMessage(t("formValidations.super_user_address"), required),
				maxLength: helpers.withMessage(t("formValidations.super_user_address_max"), maxLength(100)),
			},
			city: {
				maxLength: helpers.withMessage(t("formValidations.city"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			country: {
				required: helpers.withMessage(t("formValidations.country"), required),
				maxLength: helpers.withMessage(t("formValidations.country_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			state: {
				maxLength: helpers.withMessage(t("formValidations.state_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcWithSpace,
					$message: t("copyPasteValidations.characters"),
				},
			},
			post_code: {
				required: helpers.withMessage(t("formValidations.post_code"), required),
				maxLength: helpers.withMessage(t("formValidations.post_code_max"), maxLength(80)),
				name_validation: {
					$validator: PasteCharcAndNumWithSpace,
					$message: t("copyPasteValidations.charNum"),
				},
			},
			preferred_langauge: {
				maxLength: helpers.withMessage(t("formValidations.preferred_langauge_max"), maxLength(50)),
				name_validation: {
					$validator: PasteCharcOnly,
					$message: t("copyPasteValidations.characters"),
				},
			},
			timezone: {
				required: helpers.withMessage(t("formValidations.time_zone"), required),
			},
		};
	});

	const rulesF = computed(() => {
		return {
			mfa_code: {
				required: helpers.withMessage(t("formValidations.code"), required),
				minLength: helpers.withMessage("Code required at least 6 digits", minLength(6)),
			},
		};
	});

	const v$ = useVuelidate(rules, copyProfileDetails);
	const v$F = useVuelidate(rulesF, formData);
	onMounted(async () => {
		await getProfile();
		await getTimeZone();
	});

	watch(
		() => profileDetails.value,
		(currData) => {
			if (imageUrl.value) {
				fileList.value = [
					{
						name: "img.jpeg",
						url: imageUrl,
					},
				];
			} else if (currData?.profile_picture) {
				fileList.value = [
					{
						name: "img.jpeg",
						url: `${currData?.profile_picture} `,
					},
				];
			} else {
				fileList.value = [];
			}
		},
		{ deep: true }
	);

	const getProfile = async () => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch("/profile", {
				method: "GET",
			});

			Object.keys(profileDetails.value).forEach((field) => {
				profileDetails.value[field] = res.data?.user?.user_detail?.[field];
				profileDetails.value["email"] = res.data?.user?.email;
			});

			if (!res.data?.user?.user_detail?.timezone) {
				profileDetails.value["timezone"] = "Europe/London";
			}

			if (res.data?.user?.country_code === "") {
				profileDetails.value.country_code = "+44";
			}
			copyProfileDetails.value = JSON.parse(JSON.stringify(profileDetails.value));
			address.value = res.data?.user?.user_detail?.address;
			userId.value = res.data?.user?.id;
			disableDeleteIcon.value = res.data?.user?.is_default_profile_picture;

			store.setProfile(res.data?.user);
			clients.value = res.data?.user?.clients || [];
		} catch {
		} finally {
			setTimeout(() => {
				fullscreenLoading.value = false;
			}, 1000);
		}
	};

	const getClients = computed(() => {
		const data = clients.value.map((item: any) => {
			return {
				label: item.full_name,
				value: item.id,
			};
		});

		return data;
	});

	const dropdownSelectedPrefLanguage = (value: any) => {
		copyProfileDetails.value.preferred_langauge = value;
	};

	const getSelectedLanguage = computed(() => {
		return languageData.map((item: any) => item.value === copyProfileDetails.value.preferred_langauge);
	});

	const dropdownSelectedValue = (dropdownValue: any) => {
		copyProfileDetails.value.country_code = dropdownValue;
	};

	const getMfaValue = computed(() => {
		return store.getMFAValue;
	});

	const handleExceed: UploadProps["onExceed"] = (files) => {
		upload.value!.clearFiles();
		const file = files[0] as UploadRawFile;
		file.uid = genFileId();
		upload.value!.handleStart(file);
	};

	const handleRemove = () => {
		fileList.value = [];
		imageUrl.value = "";
		copyProfileDetails.value.profile_picture = "";
		copyProfileDetails.value.delete_profile_picture = 1;
		deleteImg.value = true;
	};

	const onChange: UploadProps["onChange"] = (uploadFile: any) => {
		file.value = uploadFile.file;
		copyProfileDetails.value.profile_picture = file.value;
		deleteImg.value = false;
		disableDeleteIcon.value = "false";
	};

	const getAddress = (address: any, Address: any) => {
		copyProfileDetails.value.address = Address;
		copyProfileDetails.value.city = address?.city;
		copyProfileDetails.value.country = address?.country;
		copyProfileDetails.value.post_code = address?.postal_code;
		copyProfileDetails.value.state = address?.region;
	};

	const changeAddress = (address: any) => {
		copyProfileDetails.value.address = address;
	};

	const updateProfile = async () => {
		try {
			v$.value.$validate();
			profileDetails = removeEmptyValues(profileDetails);
			if (!v$.value.$error) {
				loading.value = true;

				if ((profileDetails.value.profile_picture || profileDetails.value.profile_picture === null) && deleteImg?.value === true) {
					copyProfileDetails.value.profile_picture = "";
				}

				if (profileDetails.value.profile_picture === copyProfileDetails.value.profile_picture) {
					copyProfileDetails.value.profile_picture = "";
				}

				copyProfileDetails.value._method = "PATCH";

				const fd = new FormData();
				Object.keys(copyProfileDetails.value).forEach((field) => {
					fd.append(field, copyProfileDetails.value[field] || "");
				});

				const res: any = await useApiFetch(`/profile/update/${userId.value}`, {
					method: "POST",
					body: fd,
				});

				useToast("success", res.message);
				getProfile();
			} else {
				setTimeout(() => {
					const firstErrorElement = document.querySelector(".error");
					if (firstErrorElement) {
						firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
					}
				}, 250);
			}
		} catch {
		} finally {
			loading.value = false;
		}
	};

	const verifyCode = async () => {
		try {
			// errMessage.value = "";
			v$F.value.$validate();
			if (!v$F.value.$error) {
				loading.value = true;

				const res: any = await useApiFetch(`/mfa/profile/verify-device`, {
					method: "POST",
					body: formData,
				});

				mfaType.value = res.data?.is_mfa === 1;
				store.setMFAvalue(mfaType.value);
				useToast("success", res.message);
				visible.value = false;
			}
		} catch {
			errMessage.value = "Please enter valid code";
		} finally {
			loading.value = false;
			formData.mfa_code = "";
			v$F.value.$reset();
		}
	};

	const dialogOkClick = (value: any) => {
		dialogVisible.value = value;
	};

	const disabledMFA = async () => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch(`/mfa/disable`, {
				method: "POST",
				body: "",
			});

			useToast("success", res.message);
			mfaType.value = res.data?.is_mfa === 1;
			store.setMFAvalue(mfaType.value);
			const isMFA = useCookie("is_mfa");
			isMFA.value = res.data?.is_mfa;
		} catch {
		} finally {
			fullscreenLoading.value = false;
			dialogVisible.value = false;
		}
	};

	const getQR = async () => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch("/mfa/qr-image", {
				method: "GET",
			});

			qrImage.value = res.data.qr_image;
			qrCode.value = res.data.qr_code;
			visible.value = true;
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const copyToClipboard = (text: any) => {
		const el = document.createElement("textarea");
		el.value = text;
		document.body.appendChild(el);
		el.select();
		document.execCommand("copy");
		document.body.removeChild(el);
		useToast("success", "Copied to clipboard");
	};

	const modalClick = () => {
		errMessage.value = "";
		if (store.getMFAValue === false) {
			getQR();
			// formData = ref({});
		} else {
			// disabledMFA();
			//disable modal open
			dialogVisible.value = true;
		}
	};

	const modalCloseClick = (close: any) => {
		close();
		mfaType.value = false;
		formData.mfa_code = "";
		errMessage.value = "";
		v$F.value.$reset();
	};

	const handleCroppedFile = (data: any) => {
		disableDeleteIcon.value = "false";
		// emit("upload-file", { file: data.file });
		fileList.value[0].name = data.file.name;
		fileList.value[0].url = data.url;

		file.value = data.file;
		copyProfileDetails.value.profile_picture = file.value;
		imageUrl.value = data.url;
		deleteImg.value = false;
	};

	const getTimeZone = () => {
		$fetch(`https://worldtimeapi.org/api/timezone/`, {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
		})
			.then((res: any) => {
				timeZonesList.value = res?.map((field: any) => {
					return {
						label: field,
						value: field,
					};
				});
			})
			.catch((err) => {
				return err;
			});
	};

	const getSelectedTimeZone = computed(() => {
		const selectedTimeZone = timeZonesList.value.find((timezone: any) => {
			return timezone.value === formData.timezone;
		});
		return selectedTimeZone;
	});

	const dropdownSelectedTimezone = (value: any) => {
		formData.timezone = value;
	};
</script>

<template>
	<div>
		<el-form v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="flex flex-col relative">
			<div class="p-6">
				<div class="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6 lg:space-x-8">
					<div class="border-dashed border rounded-md border-gray-400 p-4 relative">
						<BaseLabel :tooltip-content="$t('info.reg_company_logo')" class="absolute right-0 top-0" />
						<el-form-item type="file" class="uploadImg mb-0 upload-crop" prop="imgUrl">
							<BaseCompanyLogo
								:limit="1"
								:disabled="false"
								:form-data="copyProfileDetails"
								@upload-file="onChange"
								@handle-remove="handleRemove"
							/>
						</el-form-item>
					</div>

					<div class="grid md:grid-cols-2 lg:grid-cols-6 gap-5 lg:gap-6 flex-grow w-full">
						<el-form-item :rules="[{ required: true }]" :label="$t('labels.first_name')" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.first_name')" :tooltip-content="$t('info.first_name')" :isShowLabel="false" />
							</template>
							<div class="relative w-full">
								<el-input
									v-model="copyProfileDetails.first_name"
									name="first_name"
									type="text"
									:class="{
										error: v$.first_name.$error,
									}"
									maxLength="50"
									@change="v$.first_name.$touch"
									@keypress="CharSpecCharWithWhitespace"
								/>
							</div>
							<span v-if="v$.first_name.$error" class="text-xs text-red-500 mt-2">{{ v$.first_name.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :rules="[{ required: true }]" :label="$t('labels.last_name')" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.last_name')" :tooltip-content="$t('info.last_name')" :isShowLabel="false" />
							</template>
							<div class="relative w-full">
								<el-input
									v-model="copyProfileDetails.last_name"
									name="last_name"
									type="text"
									:class="{
										error: v$.last_name.$error,
									}"
									maxLength="50"
									@change="v$.last_name.$touch"
									@keypress="CharSpecCharWithWhitespace"
								/>
							</div>
							<span v-if="v$.last_name.$error" class="text-xs text-red-500 mt-2">{{ v$.last_name.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.job_title')" :rules="[{ required: true }]" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.job_title')" :tooltip-content="$t('info.job_title')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="copyProfileDetails.job_title"
								name="job_title"
								type="text"
								:class="{
									error: v$.job_title.$error,
								}"
								maxLength="80"
								@change="v$.job_title.$touch"
								@keypress="CharcAndNumber"
							/>
							<span v-if="v$.job_title.$error" class="text-xs text-red-500 mt-2">{{ v$.job_title.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.department')" :rules="[{ required: true }]" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.department')" :tooltip-content="$t('info.department')" :isShowLabel="false" />
							</template>
							<el-input
								v-model="copyProfileDetails.department"
								name="department"
								type="text"
								:class="{
									error: v$.department.$error,
								}"
								maxLength="80"
								@change="v$.department.$touch"
								@keypress="CharcterWithWhitespace"
							/>
							<span v-if="v$.department.$error" class="text-xs text-red-500 mt-2">{{ v$.department.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item class="lg:col-span-3 mb-0" :rules="[{ required: true }]" :label="$t('labels.work_email')">
							<template #label>
								<BaseLabel :label="$t('formLabels.work_email')" :tooltip-content="$t('info.company_email')" />
							</template>
							<el-input
								v-model.trim="copyProfileDetails.email"
								name="email"
								type="text"
								:class="{
									error: v$.email.$error,
								}"
								:disabled="true"
								@change="v$.email.$touch"
							/>
							<span v-if="v$.email.$error" class="text-xs text-red-500 mt-2">{{ v$.email.$errors[0].$message }}</span>
						</el-form-item>

						<el-form-item :label="$t('formLabels.line_manager_name')" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.line_manager_name')" :tooltip-content="$t('info.line_manager_name')" />
							</template>
							<el-input v-model="copyProfileDetails.line_manager" type="text" maxLength="80" />
						</el-form-item>

						<el-form-item :label="$t('formLabels.line_manager_email_address')" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel
									:label="$t('formLabels.line_manager_email_address')"
									:tooltip-content="$t('info.line_manager_email_address')"
								/>
							</template>
							<el-input
								v-model="copyProfileDetails.line_manager_email"
								type="text"
								:class="{
									error: v$.line_manager_email.$error,
								}"
								name="line_manager_email"
								@change="v$.line_manager_email.$touch"
							/>
							<span v-if="v$.line_manager_email.$error" class="text-xs text-red-500 mt-2">{{
								v$.line_manager_email.$errors[0].$message
							}}</span>
						</el-form-item>

						<div class="flex items-start lg:col-span-3 mb-0 label-upper-dropdown">
							<div class="w-24 flex-initial mt-6">
								<BaseCountryDropdown
									v-model="copyProfileDetails.country_code"
									:dropdown-option="getCountry"
									:get-selected-country="getSelectedCountry"
									@selected-value="dropdownSelectedValue"
								/>
							</div>
							<el-form-item :rules="[{ required: true }]" class="ml-4 mb-0 w-full mt-6" :label="$t('formLabels.contact_number')">
								<template #label>
									<BaseLabel :label="$t('formLabels.contact_number')" :tooltip-content="$t('info.contact_number')" />
								</template>
								<el-input
									v-model.trim="copyProfileDetails.mobile_number"
									class="input-with-select"
									type="text"
									name="mobile_number"
									:class="{
										error: v$.mobile_number.$error,
									}"
									maxLength="10"
									@change="v$.mobile_number.$touch"
									@keypress="NumbersOnly(e)"
								>
								</el-input>

								<span v-if="v$.mobile_number.$error" class="text-xs text-red-500 mt-2">{{
									v$.mobile_number.$errors[0].$message
								}}</span>
							</el-form-item>
						</div>

						<el-form-item :rules="[{ required: true }]" :label="$t('formLabels.timezone')" class="lg:col-span-3 mb-0">
							<template #label>
								<BaseLabel :label="$t('formLabels.timezone')" :tooltip-content="$t('info.timezone')" :isShowLabel="false" />
							</template>
							<BaseSelectDropdown
								v-model="copyProfileDetails.timezone"
								:dropdown-option="timeZonesList"
								:number-only="false"
								:disabled="disabled"
								name="timezone"
								:class="{
									error: v$.timezone.$error,
								}"
								@change="v$.timezone.$touch"
							/>
							<span v-if="v$.timezone.$error" class="text-xs text-red-500 mt-2">{{ v$.timezone.$errors[0].$message }}</span>
						</el-form-item>

						<div class="lg:col-span-3">
							<div class="inline-flex items-center mr-5">
								<span class="text-dark font-bold block">{{ $t("formLabels.address") }}</span>
								<span class="text-red-400">*</span>
								<BaseLabel :tooltip-content="$t('info.address')" :isShowLabel="false" />
							</div>
							<BaseAddress
								id="address"
								v-model="copyProfileDetails.address"
								name="address"
								:address="address"
								:class="{
									error: v$.address.$error,
								}"
								maxLength="100"
								@changed_address="changeAddress"
								@get-address="getAddress"
								@change="v$.address.$touch"
							/>

							<span v-if="v$.address.$error" class="text-xs text-red-500 mt-2">{{ v$.address.$errors[0].$message }}</span>
						</div>
					</div>
				</div>

				<div class="grid md:grid-cols-2 lg:grid-cols-6 gap-5 lg:gap-6 flex-grow w-full mt-6 lg:mt-8">
					<el-form-item :label="$t('formLabels.city')" class="lg:col-span-3 mb-0">
						<template #label>
							<BaseLabel :label="$t('formLabels.city')" :tooltip-content="$t('info.city')" :isShowLabel="false" />
						</template>
						<el-input
							v-model="copyProfileDetails.city"
							type="text"
							name="city"
							:class="{
								error: v$.city.$error,
							}"
							maxLength="80"
							@change="v$.city.$touch"
							@keypress="CharcterWithWhitespace"
						/>
						<span v-if="v$.city.$error" class="text-xs text-red-500 mt-2">{{ v$.city.$errors[0].$message }}</span>
					</el-form-item>

					<el-form-item :label="$t('formLabels.state')" class="lg:col-span-3 mb-0">
						<template #label>
							<BaseLabel :label="$t('formLabels.state')" :tooltip-content="$t('info.state')" :isShowLabel="false" />
						</template>
						<el-input
							v-model="copyProfileDetails.state"
							type="text"
							name="state"
							:class="{
								error: v$.state.$error,
							}"
							maxLength="80"
							@change="v$.state.$touch"
							@keypress="CharcterWithWhitespace"
						/>
						<span v-if="v$.state.$error" class="text-xs text-red-500 mt-2">{{ v$.state.$errors[0].$message }}</span>
					</el-form-item>

					<el-form-item :label="$t('formLabels.post_code')" :rules="[{ required: true }]" class="lg:col-span-3 mb-0">
						<template #label>
							<BaseLabel :label="$t('formLabels.post_code')" :tooltip-content="$t('info.post_code')" :isShowLabel="false" />
						</template>
						<el-input
							v-model="copyProfileDetails.post_code"
							type="text"
							name="post_code"
							:class="{
								error: v$.post_code.$error,
							}"
							maxLength="10"
							@change="v$.post_code.$touch"
							@keypress="CharcAndNumber"
						/>
						<span v-if="v$.post_code.$error" class="text-xs text-red-500 mt-2">{{ v$.post_code.$errors[0].$message }}</span>
					</el-form-item>

					<el-form-item :label="$t('formLabels.country')" :rules="[{ required: true }]" class="lg:col-span-3 mb-0">
						<template #label>
							<BaseLabel :label="$t('formLabels.country')" :tooltip-content="$t('info.country')" :isShowLabel="false" />
						</template>
						<el-input
							v-model="copyProfileDetails.country"
							type="text"
							name="country"
							:class="{
								error: v$.country.$error,
							}"
							maxLength="80"
							@change="v$.country.$touch"
							@keypress="CharcterWithWhitespace"
						/>
						<span v-if="v$.country.$error" class="text-xs text-red-500 mt-2">{{ v$.country.$errors[0].$message }}</span>
					</el-form-item>

					<!-- <el-form-item
              class="lg:col-span-3 mb-0"
              :label="$t('formLabels.assigned_clients')"
            >
              <BaseMultiSelectDropdown
                class="w-full"
                placeholder=""
                :disabled="true"
                size="small"
                :dropdown-option="getClients"
                :get-selected-client="getClients"
                :collapse-tag="true"
              />
            </el-form-item> -->

					<!-- <el-form-item
              class="lg:col-span-3 mb-0"
              :label="$t('formLabels.assigned_suppliers')"
            >
              <el-input placeholder="NA" type="text" :disabled="true" />
            </el-form-item> -->

					<!-- <el-form-item
              :label="$t('formLabels.GDPR_training_completed')"
              class="lg:col-span-3 mb-0"
            >
              <el-date-picker
                v-model="copyProfileDetails.gdpr_training_completed_date"
                type="date"
                placeholder="DD/MM/YYYY"
                format="DD/MM/YYYY"
                value-format="YYYY-MM-DD"
              />
            </el-form-item> -->

					<el-form-item class="lg:col-span-3 mb-0">
						<template #label>
							<BaseLabel :label="$t('formLabels.preferred_language')" :tooltip-content="$t('info.preferred_language')" />
						</template>
						<BaseSelectDropdown
							v-model="copyProfileDetails.preferred_langauge"
							:dropdown-option="languageData"
							:get-selected-country="getSelectedLanguage"
							:number-only="false"
							:disabled="disabled"
							name="preferred_langauge"
							:class="{
								error: v$.preferred_langauge.$error,
							}"
							@selected-value="dropdownSelectedPrefLanguage"
							@change="v$.preferred_langauge.$touch"
						/>

						<span v-if="v$.preferred_langauge.$error" class="text-xs text-red-500 mt-2">{{
							v$.preferred_langauge.$errors[0].$message
						}}</span>
					</el-form-item>

					<div class="flex items-center lg:col-span-3">
						<span class="pr-0 el-form-item__label leading-relaxed">{{ $t("profile.multi_factor_authentication") }}</span>
						<BaseLabel class="mr-5" :tooltip-content="$t('info.multi_factor_authentication')" />
						<el-switch v-model="getMfaValue" @click="modalClick" />
					</div>
				</div>

				<div class="text-right mt-6">
					<novok-button type="cyan" @click.prevent="router.go(-1)">
						<i class="fa-regular fa-arrow-left mr-2"></i> {{ $t("buttons.back") }}
					</novok-button>

					<novok-button type="info" :loading="loading" :disabled="loading" @click.prevent="updateProfile">{{
						$t("buttons.save_changes")
					}}</novok-button>
				</div>
			</div>
		</el-form>

		<el-dialog
			v-model="visible"
			:destroy-on-close="true"
			:close-on-click-modal="false"
			class="rounded-2xl w-[95%] max-w-[800px] 2xl:max-w-[960px]"
			align-center
		>
			<template #header="{ close, titleId }">
				<div @click="modalCloseClick(close)" class="bg-primary flex justify-between">
					<h4 :id="titleId" class="text-white text-lg">
						{{ $t("profile.set_up_google_authenticator") }}
					</h4>
				</div>
			</template>
			<div class="md:flex">
				<div class="text-center">
					<NuxtImg
						format="webp"
						class="h-[250px] md:h-[300px] lg:h-[400px] 2xl:h-auto inline-block"
						src="/images/Moble.webp"
						alt="mobilePic"
					/>
				</div>
				<div class="flex-1 md:w-1/2">
					<div class="bg-primary/10 p-4 rounded-lg">
						<p class="text-primary font-bold md:text-lg 2xl:text-xl mb-3 mb:md-4 lg:mb-5 2xl:mb-6">
							1. {{ $t("profile.modal_label_1") }}
						</p>
						<div class="flex">
							<a href="https://apps.apple.com/in/app/google-authenticator/id388497605" target="_blank"
								><NuxtImg format="webp" class="mr-3" src="/images/apple.webp" alt="applePicture"
							/></a>
							<a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en&gl=US" target="_blank"
								><NuxtImg format="webp" src="/images/google.webp" alt="googleLogo"
							/></a>
						</div>
					</div>
					<div class="bg-primary/10 p-4 rounded-lg my-4">
						<p class="text-primary font-bold md:text-lg 2xl:text-xl mb-3 mb:md-4 lg:mb-5 2xl:mb-6">
							2. {{ $t("profile.modal_label_2") }}
						</p>
						<div class="flex flex-wrap items-center">
							<NuxtImg :src="qrImage" alt="" class="h-[100px] md:h-[120px] lg:h-[140px] 2xl:h-[150px]" />
							<p class="text-dark/50 md:text-lg lg:text-xl pl-4 flex-1">
								{{ $t("profile.modal_description") }}
							</p>
						</div>
						<p class="text-dark/50 md:text-lg lg:text-xl">
							{{ $t("profile.qr_code_description") }} <br />
							<span class="text-primary cursor-copy break-words" @click="copyToClipboard(qrCode)">{{ qrCode }}</span>
						</p>
					</div>
					<div class="bg-primary/10 p-4 rounded-lg">
						<p class="text-primary font-bold md:text-lg 2xl:text-xl mb-3 mb:md-4 lg:mb-5 2xl:mb-6">
							3. {{ $t("profile.modal_label_3") }}
						</p>
						<div class="flex">
							<el-input
								v-model.trim="formData.mfa_code"
								class="grow"
								name="mfa_code"
								type="password"
								:class="{
									error: v$F.mfa_code.$error || errMessage,
								}"
								maxLength="6"
								@change="v$F.mfa_code.$touch"
								@keypress="NumbersOnly(e, true)"
								@blur="errMessage = ''"
							/>
							<novok-button
								class="bg-gray-500 text-white hover:bg-gray-500 hover:text-white ml-4"
								:loading="loading"
								:disabled="loading"
								@click="verifyCode"
							>
								{{ $t("profile.button_label") }}</novok-button
							>
						</div>
						<span v-if="v$F.mfa_code.$error" class="text-xs text-red-500 mt-2">{{ v$F.mfa_code.$errors[0].$message }}</span>
						<span v-if="errMessage" class="text-xs text-red-500 mt-2">{{ errMessage }}</span>
					</div>
				</div>
			</div>
		</el-dialog>
	</div>
	<profile-disable-mfa-modal
		v-if="dialogVisible === true"
		:dialog-visible="dialogVisible"
		:delete-api="disabledMFA"
		@dialog-ok-click="dialogOkClick"
	/>
</template>
<style>
	/* @import "~/assets/css/main.css"; */
</style>
