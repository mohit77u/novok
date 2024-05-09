<script setup lang="ts">
import {
    required,
    minLength,
    maxLength,
    helpers,
    sameAs,
} from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
import { sidebarItemClear } from "~/helper/sidebarItemClear";
import { useAuthStore } from "~/store/auth";
import { sidebarItemStore } from "~/store/sidebarItem";

definePageMeta({
    layout: "auth",
    middleware: ["guest"],
});

useHead({
    title: "Default Change Password",
});
const sideBarStore = sidebarItemStore();
const authStore = useAuthStore();
const formData = reactive<any>({
    email: "",
    password: "",
    new_password: "",
    new_password_confirmation: "",
});
const loading = ref(false);
const passwordState = ref("password");
const passwordConfirmState = ref("password");
const passwordNewState = ref("password");
const localePath = useLocalePath();
const { t } = useI18n();

onMounted(() => {
    const email = sessionStorage.getItem("email");
    formData.email = email;
});

const rules = computed(() => {
    return {
        password: {
            required: helpers.withMessage(
                t("formValidations.current_password"),
                required,
            ),
            minLength: helpers.withMessage(
                t("formValidations.current_password_min"),
                minLength(8),
            ),
            maxLength: helpers.withMessage(
                t("formValidations.current_password_max"),
                maxLength(50),
            ),
        },
        new_password: {
            required: helpers.withMessage(
                t("formValidations.new_password"),
                required,
            ),
            containsPasswordRequirement: helpers.withMessage(
                () => t("formValidations.new_password_valid"),
                (value: any) =>
                    /^(?=.*\d)(?=.*[!@#$%^&*?])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(
                        value,
                    ),
            ),
            maxLength: helpers.withMessage(
                t("formValidations.new_password_max"),
                maxLength(50),
            ),
        },
        new_password_confirmation: {
            required: helpers.withMessage(
                t("formValidations.confirm_new_password"),
                required,
            ),
            sameAs: helpers.withMessage(
                t("formValidations.confirm_new_password_valid"),
                sameAs(formData.new_password),
            ),
            maxLength: helpers.withMessage(
                t("formValidations.confirm_new_password_max"),
                maxLength(50),
            ),
        },
    };
});

const v$ = useVuelidate(rules, formData);

const onPasswordClick = () => {
    passwordState.value =
        passwordState.value === "password" ? "text" : "password";
};

const onPasswordNewClick = () => {
    passwordNewState.value =
        passwordNewState.value === "password" ? "text" : "password";
};

const onPasswordConfirmClick = () => {
    passwordConfirmState.value =
        passwordConfirmState.value === "password" ? "text" : "password";
};

const onSubmit = async () => {
    v$.value.$validate();
    if (!v$.value.$error) {
        loading.value = true;

        try {
            const res: any = await useApiFetch("/default-password/change", {
                method: "POST",
                body: formData,
            });

            useToast("success", res.message);
            authLogout();
            loading.value = false;
        } catch (error) {
            loading.value = false;
        }
    }
};
</script>

<template>
    <div class="flex items-center justify-center flex-1 px-3 lg:pt-20">
        <div
            class="sm:w-8/12 md:w-7/12 lg:w-10/12 xl:w-9/12 2xl:w-7/12 3xl:w-7/12 p-5 md:p-6 lg:p-8 xl:p-10 rounded-md border-t-[6px] border-primary shadow-md my-5 bg-[#fff]"
        >
            <h6 class="text-3xl font-bold text-dark">Change Password</h6>
            <p class="text-gray mt-4 mb-10">
                Please change you account temporary password first for security
                reasons
            </p>

            <el-form
                @keyup.enter="onSubmit"
                ref="form"
                :model="form"
                class="md:basis-96 grid grid-flow-row gap-5"
            >
                <el-form-item
                    :rules="[{ required: true }]"
                    :label="$t('formLabels.email')"
                >
                    <template #label>
                        <BaseLabel
                            :label="$t('formLabels.email')"
                            :tooltip-content="$t('info.email')"
                        />
                    </template>
                    <div class="relative w-full">
                        <el-input
                            v-model.trim="formData.email"
                            name="email"
                            type="email"
                            disabled
                        />
                    </div>
                </el-form-item>

                <el-form-item
                    class="withIcon"
                    :rules="[{ required: true }]"
                    :label="$t('change_password.current_password')"
                >
                    <template #label>
                        <BaseLabel
                            :label="$t('change_password.current_password')"
                            :tooltip-content="$t('info.current_password')"
                        />
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
                        <div class="absolute right-2 top-[8px] text-gray-500">
                            <i
                                v-if="passwordState === 'text'"
                                class="fa-solid fa-eye cursor-pointer"
                                @click="onPasswordClick"
                            ></i>
                            <i
                                v-else
                                class="fa-solid fa-eye-slash cursor-pointer"
                                @click="onPasswordClick"
                            ></i>
                        </div>
                    </div>
                    <span
                        v-if="v$.password.$error"
                        class="text-xs text-red-500 mt-2"
                        >{{ v$.password.$errors[0].$message }}</span
                    >
                </el-form-item>

                <el-form-item
                    :rules="[{ required: true }]"
                    :label="$t('change_password.new_password')"
                >
                    <template #label>
                        <BaseLabel
                            :label="$t('change_password.new_password')"
                            :tooltip-content="$t('info.password_hint')"
                        />
                    </template>
                    <div class="relative w-full">
                        <el-input
                            v-model.trim="formData.new_password"
                            name="new_password"
                            :type="passwordNewState"
                            :class="{
                                error: v$.new_password.$error,
                            }"
                            @change="v$.new_password.$touch"
                        />
                        <div class="absolute right-2 top-[8px] text-gray-500">
                            <i
                                v-if="passwordNewState === 'text'"
                                class="fa-solid fa-eye cursor-pointer"
                                @click="onPasswordNewClick"
                            ></i>
                            <i
                                v-else
                                class="fa-solid fa-eye-slash cursor-pointer"
                                @click="onPasswordNewClick"
                            ></i>
                        </div>
                    </div>
                    <span
                        v-if="v$.new_password.$error"
                        class="text-xs text-red-500 mt-2"
                        >{{ v$.new_password.$errors[0].$message }}</span
                    >
                </el-form-item>

                <el-form-item
                    :rules="[{ required: true }]"
                    :label="$t('change_password.confirm_new_password')"
                >
                    <template #label>
                        <BaseLabel
                            :label="$t('change_password.confirm_new_password')"
                            :tooltip-content="$t('info.password_hint')"
                        />
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
                    <div class="absolute right-2 top-[8px] text-gray-500">
                        <i
                            v-if="passwordConfirmState === 'text'"
                            class="fa-solid fa-eye cursor-pointer"
                            @click="onPasswordConfirmClick"
                        ></i>
                        <i
                            v-else
                            class="fa-solid fa-eye-slash cursor-pointer"
                            @click="onPasswordConfirmClick"
                        ></i>
                    </div>
                    <span
                        v-if="v$.new_password_confirmation.$error"
                        class="text-xs text-red-500 mt-2"
                        >{{
                            v$.new_password_confirmation.$errors[0].$message
                        }}</span
                    >
                </el-form-item>
                <div class="text-center">
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
