<script lang="ts" setup>
	import { useVuelidate } from "@vuelidate/core";
	import { required, minLength, helpers } from "@vuelidate/validators";
	import { storeToRefs } from "pinia";
	import { useAuthStore } from "~/store/auth";
	import { contactButtonStore } from "~/store/contactButton";
	import { useProfileStore } from "~/store/profile";
	import { sidebarItemStore } from "~/store/sidebarItem";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	const { mounted, submit } = useSelectAccount();
	// import type { Action } from "element-plus";

	definePageMeta({
		layout: "auth",
		middleware: ["guest"],
	});

	useHead({
		title: "Verify Device",
	});

	const localePath = useLocalePath();
	const authStore: any = useAuthStore();
	const storeButton: any = contactButtonStore();
	const profileStore: any = useProfileStore();
	const sideBarStore: any = sidebarItemStore();
	const formData = reactive<any>({
		mfa_code: "",
		remember_me: false,
		challenge_name: "SOFTWARE_TOKEN_MFA",
		session: "",
	});
	const loading = ref(false);
	const route = useRoute();

	const rules = computed(() => {
		return {
			mfa_code: {
				required: helpers.withMessage("Please enter code.", required),
				minLength: helpers.withMessage("Code required at least 6 digits", minLength(6)),
			},
		};
	});

	onMounted(() => {
		storeButton.setcontactButton(false);
	});

	const v$ = useVuelidate(rules, formData);

	const onSubmit = async () => {
		v$.value.$validate();
		if (!v$.value.$error) {
			loading.value = true;
			try {
				const authSession = useCookie("auth_session");
				formData.remember_me = route.query?.remember_me;
				formData.session = authSession.value;

				const res: any = await useApiFetch(`/mfa/login/verify-device`, {
					method: "POST",
					body: formData,
				});

				const authToken = useCookie("auth_token");
				authToken.value = res.data?.access_token;
				const authenticateTime = useCookie("authenticate_time");
				authenticateTime.value = String(new Date().getTime());
				const refreshToken = useCookie("refresh_token");
				refreshToken.value = res.data?.refresh_token;
				const sub = useCookie("sub");
				sub.value = res.data?.user?.cognito_id;
				const rememberMe = useCookie("remember_me");
				rememberMe.value = formData.remember_me;

				authStore.setNextScreen(res.data?.next_screen);
				authStore.setRoleId(res.data?.user?.user_detail?.role_id);
				profileStore.setMFAvalue(res.data?.user?.is_mfa === 1);
				profileStore.setProfile(res.data?.user);

				if (res.data?.next_screen === "select_account") {
					authStore.setAccountsList(res.data?.user_accounts);
					const accountId = await mounted();
					if (accountId) {
						await submit(accountId, "verify_device");
					} else {
						navigateTo(localePath("/select-account"));
					}
				} else if (res.data?.next_screen === "change_default_password") {
					sideBarStore.setSidebarItem("13");
					sideBarStore.setActiveSidebarItem("13"); // 13->default change password
					navigateTo(localePath("/default-password-change"));
				} else {
					const tenant_supplier_id = useCookie("tenant_supplier_id");
					tenant_supplier_id.value = res.data?.tenant_supplier_id;
					const is_profile_setup = useCookie("is_profile_setup");
					is_profile_setup.value = res.data?.user?.user_detail?.is_profile_setup;

					if (!res.data?.user?.user_detail?.is_profile_setup && res.data?.tenant_supplier_id !== null) {
						navigateTo(localePath(`/supplier-admins/edit-supplier-admin/${res.data?.tenant_supplier_id}`));
					} else {
						navigateTo(localePath("/dashboard"));
						useToast("success", res?.message);
					}
				}
			} catch (error) {
				loading.value = false;
			}
		}
	};
</script>

<template>
	<div class="flex items-center justify-center flex-1 px-3 lg:pt-20">
		<div
			class="sm:w-8/12 md:w-7/12 lg:w-10/12 xl:w-9/12 2xl:w-7/12 3xl:w-7/12 p-5 lg:p-6 2xl:p-8 3xl:p-10 md:p-6 rounded-md border-t-[6px] border-primary shadow-md my-5 bg-[#fff]"
		>
			<h6 class="2xl:text-3xl lg:text-2xl font-bold text-dark">Verify Device</h6>
			<p class="text-gray mt-2 2xl:mt-4 2xl:mb-10 mb-6">Please verify your device with google authentication code</p>

			<el-form :model="form" @keyup.enter="onSubmit">
				<el-form-item :rules="[{ required: true }]" label="Verification code">
					<template #label>
						<BaseLabel label="Verification code" :isShowLabel="false" />
					</template>
					<el-input
						v-model.trim="formData.mfa_code"
						name="mfa_code"
						placeholder="Enter Code"
						type="password"
						:class="{
							error: v$.mfa_code.$error,
						}"
						maxLength="6"
						@change="v$.mfa_code.$touch"
						@keypress="NumbersOnly(e, true)"
					/>
					<span v-if="v$.mfa_code.$error" class="text-xs text-red-500 mt-2">{{ v$.mfa_code.$errors[0].$message }}</span>
				</el-form-item>

				<div class="text-center">
					<novok-button
						type="info"
						class="font-semibold mt-4 md:mt-6 lg:mt-8 xl:mt-10 xxl:mt-12"
						:loading="loading"
						:class="loading ? 'inline-flex justify-center' : ''"
						:disabled="loading"
						@click.prevent="onSubmit"
						>Submit</novok-button
					>
				</div>
			</el-form>
		</div>
	</div>
</template>

<style>
	/* @import "~/assets/css/main.css"; */
</style>
