<script lang="ts" setup>
	import { ElButton } from "element-plus";
	import { required, maxLength, helpers, sameAs } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";

	definePageMeta({
		layout: "auth",
        middleware: ["guest"],
	});

	useHead({
		title: "Reset Password",
	});

	const formData = reactive<any>({
		password: "",
		password_confirmation: "",
		token: "",
		email: "",
	});
	const loading = ref(false);
	const passwordState = ref("password");
	const passwordConfirmState = ref("password");
	const localePath = useLocalePath();

	onMounted(() => {
		const email = sessionStorage.getItem("email");
		formData.email = email;
	});

	const rules = computed(() => {
		return {
			password: {
				required: helpers.withMessage("Please enter the new password.", required),
				containsPasswordRequirement: helpers.withMessage(
					() => `Password must include atleast 8 characters, an uppercase, lowercase, number and special character.`,
					(value: any) => /^(?=.*\d)(?=.*[!@#$%^&*?])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(value)
				),
				maxLength: helpers.withMessage("Password must have 50 characters.", maxLength(50)),
			},
			password_confirmation: {
				required: helpers.withMessage("Please re-enter the new password.", required),
				sameAs: helpers.withMessage("Password and confirm password does not match.", sameAs(formData.password)),
				maxLength: helpers.withMessage("Confirm password must have 50 characters.", maxLength(50)),
			},
		};
	});

	const onPasswordClick = () => {
		passwordState.value = passwordState.value === "password" ? "text" : "password";
	};

	const onPasswordConfirmClick = () => {
		passwordConfirmState.value = passwordConfirmState.value === "password" ? "text" : "password";
	};

	const v$ = useVuelidate(rules, formData);

	const onSubmit = async () => {
		try {
			v$.value.$validate();
			if (!v$.value.$error) {
				loading.value = true;
				const res: any = await useApiFetch("/password/reset", {
					method: "POST",
					body: formData,
				});

				useToast("success", res?.message);
				navigateTo(localePath("/sign-in"));
			}
		} catch {
		} finally {
			loading.value = false;
		}
	};
</script>

<template>
	<div class="flex items-center justify-center flex-1 px-3 lg:pt-20">
		<div
			class="sm:w-8/12 md:w-7/12 lg:w-10/12 xl:w-9/12 2xl:w-7/12 3xl:w-7/12 p-5 lg:p-6 2xl:p-8 3xl:p-10 md:p-6 rounded-md border-t-[6px] border-primary shadow-md my-5 bg-[#fff]"
		>
			<h6 class="2xl:text-3xl lg:text-2xl font-bold text-dark">Reset Password</h6>
			<p class="text-gray mt-2 2xl:mt-4 2xl:mb-10 mb-6">Enter your registered email and we'll send you instructions to reset your password</p>
			<el-form @keyup.enter="onSubmit">
				<el-form-item :rules="[{ required: true }]" class="mb-6 2xl:mb-10">
                    <template #label>
                        <BaseLabel
                            label="Token"
                            :tooltip-content="$t('info.token_hint')"
                        />
                    </template>
					<div class="relative w-full withIcon">
						<el-input v-model.trim="formData.token" type="text" maxLength="6" @keypress="NumbersOnly" />
					</div>
				</el-form-item>

				<el-form-item :rules="[{ required: true }]" class="mb-6 2xl:mb-10">
                    <template #label>
                        <BaseLabel
                            label="Password"
                            :tooltip-content="$t('info.password_hint')"
                        />
                    </template>
					<div class="relative w-full withIcon">
						<el-input
							v-model.trim="formData.password"
							placeholder="Enter Password"
							:type="passwordState"
							name="password"
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

				<el-form-item :rules="[{ required: true }]" class="mb-6 2xl:mb-10" label="Confirm Password">
                    <template #label>
                        <BaseLabel
                            label="Confirm Password"
                            :tooltip-content="$t('info.password_hint')"
                        />
                    </template>
					<div class="relative w-full withIcon">
						<el-input
							v-model.trim="formData.password_confirmation"
							placeholder="Enter Confirm Password"
							:type="passwordConfirmState"
							name="password_confirmation"
							:class="{
								error: v$.password_confirmation.$error,
							}"
							@change="v$.password_confirmation.$touch"
						/>
						<div class="absolute right-2 top-[2px] 2xl:top-[5px] text-gray-500">
							<i v-if="passwordConfirmState === 'text'" class="fa-solid fa-eye cursor-pointer" @click="onPasswordConfirmClick"></i>
							<i v-else class="fa-solid fa-eye-slash cursor-pointer" @click="onPasswordConfirmClick"></i>
						</div>
					</div>
					<span v-if="v$.password_confirmation.$error" class="text-xs text-red-500 mt-2">{{
						v$.password_confirmation.$errors[0].$message
					}}</span>
				</el-form-item>
				<div class="text-center">
					<novok-button
						type="info"
						class="font-semibold mb-4 md:mb-6 lg:mb-8 xl:mb-10"
						:loading="loading"
						:disabled="loading"
						:class="loading ? 'inline-flex justify-center' : ''"
						@click.prevent="onSubmit"
						>Submit</novok-button
					>
				</div>
				<p class="mb-0 text-center">
					<a class="text-cyan font-semibold cursor-pointer" @click.prevent="navigateTo(localePath('/sign-in'))">
						<i class="fa-solid fa-chevron-left mr-3"></i> Back to login
					</a>
				</p>
			</el-form>
		</div>
	</div>
</template>

<style>
	/* @import "~/assets/css/main.css"; */
</style>
