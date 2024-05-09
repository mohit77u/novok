<script lang="ts" setup>
	import { useVuelidate } from "@vuelidate/core";
	import { required, email, helpers } from "@vuelidate/validators";
	import useToast from "~/composables/useToast";
	import { defaultResourcesFilterObject } from "~/helper/data";
	import { useAuthStore } from "~/store/auth";
	import { contactButtonStore } from "~/store/contactButton";
	import { useProfileStore } from "~/store/profile";
	import { sidebarItemStore } from "~/store/sidebarItem";

	definePageMeta({
		layout: "auth",
		middleware: ["guest"],
	});

	useHead({
		title: "Sign In",
	});

	const localePath = useLocalePath();
	const authStore = useAuthStore();
	const storeButton = contactButtonStore();
	const profileStore = useProfileStore();
	const sideBarStore = sidebarItemStore();
	const { mounted, submit } = useSelectAccount();
	const formData = reactive<any>({
		email: "",
		password: "",
		remember_me: true,
	});
	const passwordState = ref("password");
	const loading = ref(false);
	const dialogVisible = ref(false);
	const messageContent = ref("");
	const router = useRouter();
	const switchLocalePath = useSwitchLocalePath();

	const rules = computed(() => {
		return {
			email: {
				required: helpers.withMessage("Please enter username.", required),
				email: helpers.withMessage("Please enter valid username.", email),
			},
			password: {
				required: helpers.withMessage("Please enter password", required),
			},
		};
	});

	onMounted(() => {
		storeButton.setcontactButton(false);
		const authToken = useCookie("auth_token");
		const isMFA = useCookie("is_mfa");
		// && isMFA.value
		if (authToken.value !== undefined) {
			navigateTo(localePath("/dashboard"));
			sideBarStore.setSidebarItem("1"); // 1 = Dashboard
			sideBarStore.setActiveSidebarItem("1"); // 1 = Dashboard
		} else {
			navigateTo(localePath("/sign-in"));
		}
	});

	const v$ = useVuelidate(rules, formData);

	const onPasswordClick = () => {
		passwordState.value = passwordState.value === "password" ? "text" : "password";
	};

	const dialogOkClick = (value: any) => {
		dialogVisible.value = value;
	};

	const onSubmit = async () => {
		sessionStorage.setItem("email", formData.email);
		v$.value.$validate();
		if (!v$.value.$error) {
			loading.value = true;

			try {
				let copyFormData = {
					...formData,
					remember_me: formData.remember_me === true ? 1 : 0,
				};

				const res: any = await useApiFetch("/login", {
					method: "POST",
					body: copyFormData,
				});

				const authSession = useCookie("auth_session");
				authSession.value = res.data?.session;
				authStore.setNextScreen(res.data?.next_screen);
				const isMFA = useCookie("is_mfa");
				isMFA.value = res.data?.is_mfa;
				const tenant_supplier_id = useCookie("tenant_supplier_id");
				tenant_supplier_id.value = res.data?.tenant_supplier_id;
				const is_profile_setup = useCookie("is_profile_setup");
				is_profile_setup.value = res.data?.user?.user_detail?.is_profile_setup;
				const language = {
					label: "English",
					code: "en",
				};
				sessionStorage.setItem("displayView", "table");

				authStore.setLanguage(language);
				navigateTo(switchLocalePath("en"));

				sessionStorage.setItem("resourcePageDetails", JSON.stringify(defaultResourcesFilterObject));

				if (res.data?.next_screen === "mfa") {
					router.push(
						localePath({
							path: "/verify-device",
							query: {
								remember_me: formData.remember_me ? 1 : 0,
							},
						})
					);
				} else if (res.data?.next_screen === "change_default_password") {
					sideBarStore.setSidebarItem("13");
					sideBarStore.setActiveSidebarItem("13"); // 13->default change password
					router.push(localePath("/default-password-change"));
				} else {
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

					authStore.setRoleId(res.data?.user?.user_detail?.role_id);
					profileStore.setMFAvalue(res.data?.user?.is_mfa === 1);
					profileStore.setProfile(res.data?.user);

					const roleId = useCookie("role_id");
					roleId.value = authStore.getRoleId;

					if (res.data?.next_screen === "select_account") {
						authStore.setAccountsList(res.data?.user_accounts);
						const accountId = await mounted();

						if (accountId) {
							await submit(accountId, "login");
							// navigateTo("/dashboard");
						} else {
							router.push(localePath("/select-account"));
						}
						// } else if (!res.data?.user?.is_mfa) {
						//     router.push("/mfa-enable");
					} else if (!res.data?.user?.user_detail?.is_profile_setup && res.data?.tenant_supplier_id !== null) {
						navigateTo(localePath(`/supplier-admins/edit-supplier-admin/${tenant_supplier_id.value}`));
					} else {
						router.push("/dashboard");
						useToast("success", res?.message);
					}
					// } else {
					//     router.push(localePath("/dashboard"));
					//     useToast("success", res?.message);
					// }
				}

				loading.value = false;
			} catch (error: any) {
				loading.value = false;
			}
		}
	};
</script>

<template>
	<div class="flex items-center justify-center flex-1 px-3 pt-0 2xl:pt-20">
		<div
			class="sm:w-8/12 md:w-7/12 lg:w-10/12 xl:w-9/12 2xl:w-7/12 3xl:w-7/12 p-5 lg:p-6 2xl:p-8 3xl:p-10 my-5 rounded-md border-t-[6px] border-primary shadow-md bg-[#fff]"
		>
			<h6 class="2xl:text-3xl lg:text-2xl font-bold text-dark">Sign In</h6>
			<p class="text-gray mt-2 2xl:mt-4 2xl:mb-10 mb-6">Please Login to your account and start the adventure</p>

			<el-form @keyup.enter="onSubmit">
				<el-form-item :rules="[{ required: true }]" label="Username" class="mb-6 2xl:mb-10 withIcon">
					<template #label>
						<BaseLabel label="Username" :isShowLabel="false" />
					</template>
					<el-input
						v-model.trim="formData.email"
						name="email"
						placeholder="Enter Username"
						type="text"
						:class="{
							error: v$.email.$error,
						}"
						maxLength="150"
						@change="v$.email.$touch"
					/>
					<div class="absolute right-2 top-[8px] text-gray-500 inputIcon">
						<i class="fa-solid fa-user cursor-pointer"></i>
					</div>
					<span v-if="v$.email.$error" class="text-xs text-red-500 mt-2">{{ v$.email.$errors[0].$message }}</span>
				</el-form-item>

				<el-form-item :rules="[{ required: true }]" label="Password" class="withIcon">
					<template #label>
						<BaseLabel label="Password" :isShowLabel="false" />
					</template>
					<el-input
						v-model.trim="formData.password"
						name="password"
						placeholder="Enter Password"
						:type="passwordState"
						:class="{
							error: v$.password.$error,
						}"
						@change="v$.password.$touch"
					/>
					<div class="absolute right-2 top-[8px] text-gray-500 inputIcon">
						<i v-if="passwordState === 'text'" class="fa-solid fa-eye cursor-pointer" @click="onPasswordClick"></i>
						<i v-else class="fa-solid fa-eye-slash cursor-pointer" @click="onPasswordClick"></i>
					</div>
					<span v-if="v$.password.$error" class="text-xs text-red-500 mt-2">{{ v$.password.$errors[0].$message }}</span>
				</el-form-item>

				<div class="flex justify-between items-center">
					<el-checkbox v-model="formData.remember_me" label="Remember me" />
					<a class="text-cyan font-semibold cursor-pointer" @click="navigateTo(localePath('/forgot-password'))">Forgot Password ?</a>
				</div>
				<div class="text-center">
					<novok-button
						type="info"
						class="font-semibold mt-4 md:mt-6 lg:mt-8 2xl:mt-10"
						:loading="loading"
						:disabled="loading"
						:class="loading ? 'inline-flex justify-center' : ''"
						@click.prevent="onSubmit"
						>Login</novok-button
					>
				</div>
			</el-form>

			<div class="text-center font-normal mt-4 md:mt-6 lg:mt-8 2xl:mt-10">
				You don't have an account yet? <router-link class="text-primary font-bold" to="/sign-up">Create account</router-link>
			</div>
		</div>
		<BaseLoginModal
			v-if="dialogVisible === true"
			:dialog-visible="dialogVisible"
			:message-content="messageContent"
			@dialog-oklick="dialogOkClick"
		/>
	</div>
</template>

<style>
	/* @import "~/assets/css/main.css"; */
</style>
