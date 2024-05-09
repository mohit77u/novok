<script setup lang="ts">
	import { required, minLength, maxLength, helpers, sameAs } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import { useAuthStore } from "~/store/auth";
	import { sidebarItemStore } from "~/store/sidebarItem";
	import { useProfileStore } from "~/store/profile";

	useHead({
		title: "Change Password",
	});

	definePageMeta({
		middleware: ["auth", "supplier"],
	});
	const sideBarStore = sidebarItemStore();
	const store = useAuthStore();
	const formData = reactive<any>({
		password: "",
		new_password: "",
		new_password_confirmation: "",
	});
	const loading = ref<any>(false);
	const fullscreenLoading = ref<any>(false);
	const isOldNewPasswordSame = ref<any>(false);
	const passwordState = ref<any>("password");
	const passwordConfirmState = ref<any>("password");
	const passwordNewState = ref<any>("password");
	const profileStore = useProfileStore();
	const localePath = useLocalePath();
	const { t } = useI18n();
	const router = useRouter();

	const rules = computed(() => {
		return {
			password: {
				required: helpers.withMessage(t("formValidations.current_password"), required),
				minLength: helpers.withMessage(t("formValidations.current_password_min"), minLength(8)),
				maxLength: helpers.withMessage(t("formValidations.current_password_max"), maxLength(50)),
			},
			new_password: {
				required: helpers.withMessage(t("formValidations.new_password"), required),
				containsPasswordRequirement: helpers.withMessage(
					() => t("formValidations.new_password_valid"),
					(value: any) => /^(?=.*\d)(?=.*[!@#$%^&*?])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(value)
				),
				maxLength: helpers.withMessage(t("formValidations.new_password_max"), maxLength(50)),
			},
			new_password_confirmation: {
				required: helpers.withMessage(t("formValidations.confirm_new_password"), required),
				sameAs: helpers.withMessage(t("formValidations.confirm_new_password_valid"), sameAs(formData.new_password)),
				maxLength: helpers.withMessage(t("formValidations.confirm_new_password_max"), maxLength(50)),
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

	const onPasswordClick = () => {
		passwordState.value = passwordState.value === "password" ? "text" : "password";
	};

	const onPasswordNewClick = () => {
		passwordNewState.value = passwordNewState.value === "password" ? "text" : "password";
	};

	const onPasswordConfirmClick = () => {
		passwordConfirmState.value = passwordConfirmState.value === "password" ? "text" : "password";
	};

	const handleNewPasswordChange = () => {
		if (formData?.new_password.trim() != "" && formData?.password.trim() != "") {
			isOldNewPasswordSame.value = formData?.new_password.trim() == formData?.password.trim();
		}
	};

	const onSubmit = async () => {
		try {
			v$.value.$validate();
			if (!v$.value.$error && !isOldNewPasswordSame.value) {
				loading.value = true;
				formData._method = "PATCH";
				// const user = JSON.parse(sessionStorage.getItem("userInfo") || "");
				const res: any = await useApiFetch(`/password/change/${profileStore?.profileData?.user_detail?.id}`, {
					method: "POST",
					body: formData,
				});

				useToast("success", res.message);
				sideBarStore.setActiveSidebarItem("1");
				sideBarStore.setSidebarItem("1");
				navigateTo(localePath("/dashboard"));
			}
		} catch {
		} finally {
			loading.value = false;
		}
	};
</script>

<template>
	<div
		v-loading="fullscreenLoading"
		:class="{ 'overflow-hidden': fullscreenLoading }"
		class="bg-[url('/images/loginBottom.webp')] bg-no-repeat bg-right h-full p-4 relative flex items-center justify-center"
	>
		<div class="border border-t-8 border-t-primary rounded-xl px-6 py-8 w-full max-w-80 md:max-w-[400px]">
			<el-form @keyup.enter="onSubmit" ref="form" class="md:max-w-lg grid grid-flow-row gap-3">
				<el-form-item :rules="[{ required: true }]" :label="$t('change_password.current_password')">
					<template #label>
						<BaseLabel :label="$t('change_password.current_password')" :tooltip-content="$t('info.current_password')" />
					</template>
					<div class="relative w-full">
						<el-input
							v-model.trim="formData.password"
							name="password"
							:type="passwordState"
							:class="{
								error: v$.password.$error,
							}"
							@change="v$.password.$touch"
						/>
						<div class="absolute right-2 top-[2px] 2xl:top-[5px] text-gray-500">
							<i v-if="passwordState === 'text'" class="fa-solid fa-eye cursor-pointer" @click="onPasswordClick"></i>
							<i v-else class="fa-solid fa-eye-slash cursor-pointer" @click="onPasswordClick"></i>
						</div>
					</div>
					<span v-if="v$.password.$error" class="text-xs text-red-500 mt-2">{{ v$.password.$errors[0].$message }}</span>
				</el-form-item>

				<el-form-item :rules="[{ required: true }]" :label="$t('change_password.new_password')">
					<template #label>
						<BaseLabel :label="$t('change_password.new_password')" :tooltip-content="$t('info.password_hint')" />
					</template>
					<div class="relative w-full">
						<el-input
							v-model.trim="formData.new_password"
							name="new_password"
							:type="passwordNewState"
							:class="{
								error: v$.new_password.$error,
							}"
							@change="
								v$.new_password.$touch;
								handleNewPasswordChange();
							"
						/>
						<div class="absolute right-2 top-[2px] 2xl:top-[5px] text-gray-500">
							<i v-if="passwordNewState === 'text'" class="fa-solid fa-eye cursor-pointer" @click="onPasswordNewClick"></i>
							<i v-else class="fa-solid fa-eye-slash cursor-pointer" @click="onPasswordNewClick"></i>
						</div>
					</div>
					<span v-if="v$.new_password.$error" class="text-xs text-red-500 mt-2">{{ v$.new_password.$errors[0].$message }}</span>
					<span v-if="isOldNewPasswordSame" class="text-xs text-red-500 mt-2">{{ $t("formValidations.new_old_password_same") }}</span>
				</el-form-item>

				<el-form-item :rules="[{ required: true }]" :label="$t('change_password.confirm_new_password')">
					<template #label>
						<BaseLabel :label="$t('change_password.confirm_new_password')" :tooltip-content="$t('info.confirm_new_password')" />
					</template>
					<el-input
						v-model.trim="formData.new_password_confirmation"
						name="new_password_confirmation"
						:type="passwordConfirmState"
						:class="{
							error: v$.new_password_confirmation.$error,
						}"
						@change="v$.new_password_confirmation.$touch"
					/>
					<div class="absolute right-2 top-[2px] 2xl:top-[5px] text-gray-500">
						<i v-if="passwordConfirmState === 'text'" class="fa-solid fa-eye cursor-pointer" @click="onPasswordConfirmClick"></i>
						<i v-else class="fa-solid fa-eye-slash cursor-pointer" @click="onPasswordConfirmClick"></i>
					</div>
					<span v-if="v$.new_password_confirmation.$error" class="text-xs text-red-500 mt-2">{{
						v$.new_password_confirmation.$errors[0].$message
					}}</span>
				</el-form-item>

				<div class="text-center">
					<novok-button type="cyan" @click="router.go(-1)">
						<i class="fa-regular fa-arrow-left mr-2"></i> {{ $t("buttons.back") }}
					</novok-button>
					<novok-button
						type="info"
						:loading="loading"
						:disabled="loading"
						:class="loading ? 'inline-flex justify-center' : ''"
						@click.prevent="onSubmit"
						>{{ $t("buttons.submit") }}</novok-button
					>
				</div>
			</el-form>
		</div>
	</div>
</template>
<style>
	/* @import "~/assets/css/main.css"; */
</style>
