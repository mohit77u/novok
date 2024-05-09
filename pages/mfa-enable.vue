<script setup lang="ts">
	import { useProfileStore } from "~/store/profile";
	import { required, email, minLength, helpers, maxLength } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";

	definePageMeta({
		layout: "mfa",
		middleware: ["guest"],
	});

	useHead({
		title: "MFA Enable",
	});
	const formData = reactive<any>({
		mfa_code: "",
	});
	const { t } = useI18n();
	const localePath = useLocalePath();
	const fullscreenLoading = ref(false);
	const profileStore = useProfileStore();
	const qrImage = ref<any>("");
	const qrCode = ref<any>("");
	const visible = ref(false);
	const mfaType = ref(false);
	const errMessage = ref("");
	const loading = ref(false);
	const router = useRouter();

	const rules = computed(() => {
		return {
			mfa_code: {
				required: helpers.withMessage(t("formValidations.code"), required),
				minLength: helpers.withMessage("Code required at least 6 digits", minLength(6)),
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

	const getMfaValue = computed(() => {
		return profileStore.getMFAValue;
	});

	onMounted(async () => {
		await getQR();
	});

	const getQR = async () => {
		fullscreenLoading.value = true;
		try {
			const res: any = await useApiFetch("/mfa/qr-image", {
				method: "GET",
			});
			qrImage.value = res.data.qr_image;
			qrCode.value = res.data.qr_code;
			visible.value = true;
			fullscreenLoading.value = false;
		} catch {
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

	const verifyCode = async () => {
		errMessage.value = "";
		v$.value.$validate();
		if (!v$.value.$error) {
			loading.value = true;
			try {
				const res: any = await useApiFetch("/mfa/profile/verify-device", {
					method: "POST",
					body: formData,
				});
				mfaType.value = res.data?.is_mfa === 1;
				profileStore.setMFAvalue(mfaType.value);
				visible.value = false;
				loading.value = false;
				formData.mfa_code = "";
				v$.value.$reset();
				const isMFA = useCookie("is_mfa");
				isMFA.value = res.data?.is_mfa;
				useToast("success", res?.message);
				const tenant_supplier_id = useCookie("tenant_supplier_id");
				const is_profile_setup = useCookie("is_profile_setup");
				if (!is_profile_setup.value && tenant_supplier_id.value !== null) {
					navigateTo(localePath(`/supplier-admins/edit-supplier-admin/${tenant_supplier_id.value}`));
				} else {
					router.push("/dashboard");
				}
			} catch (error: any) {
				errMessage.value = error?.data?.message;
				loading.value = false;
				formData.mfa_code = "";
				v$.value.$reset();
			}
		}
	};
</script>
<template>
	<div
		class="flex items-center justify-center flex-1 px-3 pt-14 2xl:pt-20 relative"
		v-loading="fullscreenLoading"
		:class="{ 'overflow-hidden': fullscreenLoading }"
	>
		<div
			class="sm:w-8/12 md:w-7/12 lg:w-10/12 xl:w-9/12 2xl:w-7/12 3xl:w-7/12 p-5 md:p-6 lg:p-8 xl:p-10 rounded-md border-t-[6px] border-primary shadow-md my-5 bg-[#fff]"
		>
			<div class="md:flex">
				<div class="text-center">
					<NuxtImg format="webp" class="h-44 md:h-80 xl:h-96 inline-block" src="/images/Moble.webp" alt="mobilePic" />
				</div>
				<div class="flex-1">
					<h6 class="text-2xl font-bold text-dark mb-0">MFA Enable</h6>
					<p class="text-gray mb-4">Please enable multifactor authentication</p>
					<div class="bg-primary/10 p-4 rounded-lg">
						<p class="text-primary font-bold md:text-lg 2xl:text-xl mb-3 mb:md-4 2xl:mb-5">1. {{ $t("profile.modal_label_1") }}</p>
						<div class="flex">
							<a href="https://apps.apple.com/in/app/google-authenticator/id388497605" target="_blank"
								><NuxtImg format="webp" class="mr-3 h-8" src="/images/apple.webp" alt="applePicture"
							/></a>
							<a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en&gl=US" target="_blank"
								><NuxtImg format="webp" class="h-8" src="/images/google.webp" alt="googleLogo"
							/></a>
						</div>
					</div>
					<div class="bg-primary/10 p-4 rounded-lg my-4">
						<p class="text-primary font-bold md:text-lg 2xl:text-xl mb-3 mb:md-4 2xl:mb-5">2. {{ $t("profile.modal_label_2") }}</p>
						<div class="flex flex-wrap items-center">
							<NuxtImg class="w-24" :src="qrImage" alt="" />
							<p class="text-dark/50 md:text-lg 2xl:text-xl pl-4 flex-1">
								{{ $t("profile.modal_description") }}
							</p>
						</div>
						<div class="flex flex-wrap items-center pt-4">
							<p class="text-dark/50 md:text-lg lg:text-xl pl-4 flex-1">
								{{ $t("profile.qr_code_description") }} <br />
								<span class="text-primary cursor-copy" @click="copyToClipboard(qrCode)">{{ qrCode }}</span>
							</p>
						</div>
					</div>
					<div class="bg-primary/10 p-4 rounded-lg">
						<p class="text-primary font-bold md:text-lg 2xl:text-xl mb-3 mb:md-4 2xl:mb-5">3. {{ $t("profile.modal_label_3") }}</p>
						<div class="flex">
							<el-input
								v-model.trim="formData.mfa_code"
								class="grow"
								name="mfa_code"
								type="password"
								:class="{
									error: v$.mfa_code.$error || errMessage,
								}"
								maxLength="6"
								@change="v$.mfa_code.$touch"
								@keypress="NumbersOnly(e, true)"
								@blur="errMessage = ''"
							/>
							<novok-button type="info" class="ml-4" :loading="loading" :disabled="loading" @click="verifyCode">
								{{ $t("profile.button_label") }}</novok-button
							>
						</div>
						<span v-if="v$.mfa_code.$error" class="text-xs text-red-500 mt-2">{{ v$.mfa_code.$errors[0].$message }}</span>
						<span v-if="errMessage" class="text-xs text-red-500 mt-2">{{ errMessage }}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
