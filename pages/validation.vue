<script setup lang="ts">
import { useForm } from "laravel-precognition-vue";
const formData = useForm(
    "post",
    "https://novok-backend.topsdemo.org/api/ex-precognition",
    {
        first_name: "",
        last_name: "",
        email: "",
    },
);

const submit = () => formData.submit();
</script>
<template>
    <div>
        <div class="min-h-screen flex flex-col">
            <!-- <LoginHeader /> -->
            <div class="flex flex-1">
                <div
                    class="basis-full lg:basis-6/12 xxl:basis-5/12 flex flex-col"
                >
                    <div
                        class="flex items-center justify-center flex-1 px-3 lg:pt-20"
                    >
                        <div
                            class="sm:w-8/12 md:w-7/12 lg:w-10/12 xl:w-9/12 2xl:w-7/12 3xl:w-7/12 p-5 md:p-6 lg:p-8 xl:p-10 rounded-md border-t-[6px] border-primary shadow-md my-5 bg-[#fff]"
                        >
                            <h6 class="text-3xl font-bold text-dark">Form</h6>

                            <el-form :model="form" @keyup.enter="submit">
                                <el-form-item
                                    :rules="[{ required: true }]"
                                    label="Firstname"
                                    class="mb-10"
                                >
                                    <el-input
                                        id="first_name"
                                        v-model.trim="formData.first_name"
                                        placeholder="Enter Firstname"
                                        type="text"
                                        @change="
                                            formData.validate('first_name')
                                        "
                                    />
                                    <div
                                        v-if="formData.invalid('first_name')"
                                        class="text-red-500"
                                    >
                                        {{ formData.errors.first_name }}
                                    </div>
                                </el-form-item>

                                <el-form-item
                                    :rules="[{ required: true }]"
                                    label="Lastname"
                                >
                                    <el-input
                                        v-model.trim="formData.last_name"
                                        placeholder="Enter Lastname"
                                        type="text"
                                        @change="formData.validate('last_name')"
                                    />
                                    <div
                                        v-if="formData.invalid('last_name')"
                                        class="text-red-500"
                                    >
                                        {{ formData.errors.last_name }}
                                    </div>
                                </el-form-item>

                                <el-form-item
                                    :rules="[{ required: true }]"
                                    label="Email"
                                >
                                    <el-input
                                        v-model.trim="formData.email"
                                        placeholder="Enter Email"
                                        type="email"
                                        @change="formData.validate('email')"
                                    />
                                    <div
                                        v-if="formData.invalid('email')"
                                        class="text-red-500"
                                    >
                                        {{ formData.errors.email }}
                                    </div>
                                </el-form-item>
                                <div class="text-center">
                                    <novok-button
                                        type="info"
                                        class="font-semibold mt-4 md:mt-6 lg:mt-8 xl:mt-10 xxl:mt-12"
                                        :loading="loading"
                                        :disabled="loading"
                                        :class="
                                            loading
                                                ? 'inline-flex justify-center'
                                                : ''
                                        "
                                        @click.prevent="submit"
                                        >Submit</novok-button
                                    >
                                </div>
                            </el-form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
