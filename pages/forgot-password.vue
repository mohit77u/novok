<script lang="ts" setup>
	import { ElButton } from "element-plus";
	import { required, maxLength, helpers, sameAs, email } from "@vuelidate/validators";
	import { useVuelidate } from "@vuelidate/core";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";

	definePageMeta({
		layout: "auth",
        middleware: ["guest"],
	});

	useHead({
		title: "Forgot Password",
	});

	const formData = reactive<any>({
		email: "",
	});
	const loading = ref(false);
	const localePath = useLocalePath();

	const rules = computed(() => {
		return {
            email: {
				required: helpers.withMessage("Please Enter Email address.", required),
				email: helpers.withMessage("Please enter valid Email address.", email),
			},
		};
	});

	const v$ = useVuelidate(rules, formData);

	const onSubmit = async () => {
		try {
			sessionStorage.setItem("email", formData.email);
			v$.value.$validate();
			if (!v$.value.$error) {
				loading.value = true;
				const res: any = await useApiFetch("/password/email", {
					method: "POST",
					body: formData,
				});

				if (res.data?.next_screen === "change_default_password") {
					navigateTo(localePath("/default-password-change"));
				} else if (res.data.status === "FORCE_CHANGE_PASSWORD") {
					navigateTo(localePath("/sign-in"));
				} else {
					navigateTo(localePath("/reset-password"));
				}
				useToast("success", res?.message);
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
			<h6 class="2xl:text-3xl lg:text-2xl font-bold text-dark">Forgot Password</h6>
			<p class="text-gray mt-2 2xl:mt-4 2xl:mb-10 mb-6">Enter your registered email and we'll send you instructions to reset your password</p>
			<el-form @keyup.enter="onSubmit">	
                			
				<el-form-item :rules="[{ required: true }]" class="mb-6 2xl:mb-10">
                    <template #label>
                        <BaseLabel label="Email ID" />
                    </template>
					<div class="relative w-full withIcon">
						<el-input 
                            v-model.trim="formData.email"
                            placeholder="Enter Email ID"
                            type="email"
                            name="email"
                            :class="{
                                error: v$.email.$error,
                            }"
                            maxLength="150"
                            @change="v$.email.$touch"
                        />
                        <span v-if="v$.email.$error" class="text-xs text-red-500 mt-2">{{ v$.email.$errors[0].$message }}</span>
					</div>
				</el-form-item>

				<el-form-item :rules="[{ required: true }]" class="hidden" label="Password">
					<div class="relative w-full withIcon">
						<el-input
							v-model.trim="formData.password"
							placeholder="Enter Password"
							name="password"
						/>
					</div>
				</el-form-item>

				<el-form-item :rules="[{ required: true }]" class="hidden" label="Confirm Password">
					<div class="relative w-full withIcon">
						<el-input
							v-model.trim="formData.password_confirmation"
							placeholder="Enter Confirm Password"
							name="password_confirmation"
						/>
					</div>
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
