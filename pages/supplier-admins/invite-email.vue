<script setup lang="ts">
	const formData = reactive<any>({
		first_name: "",
		last_name: "",
		email: "",
	});
	const fields = ref<any>([
		{
			first_name: "",
			last_name: "",
			email: "",
			emailValid: false,
			firstNameRequired: false,
			lastNameRequired: false,
		},
	]);
	const localePath = useLocalePath();
	const { t } = useI18n();
	const fullscreenLoading = ref(false);
	const loading = ref(false);
	const showEmailError = ref(false);

	const addInput = () => {
		// if (formData.subcontractors.length > 0 && formData.subcontractors.length < 5) {

		fields.value.push({
			first_name: "",
			last_name: "",
			email: "",
			emailValid: false,
			firstNameRequired: false,
			lastNameRequired: false,
		});

		// }
	};
	const removeInput = (index: any) => {
		fields.value.splice(index, 1);
	};

	const changeFirstName = (index: any) => {
		if (fields.value[index].first_name === "") {
			fields.value[index].firstNameRequired = true;
		} else {
			fields.value[index].firstNameRequired = false;
		}
	};

	const changeLastName = (index: any) => {
		if (fields.value[index].last_name === "") {
			fields.value[index].lastNameRequired = true;
		} else {
			fields.value[index].lastNameRequired = false;
		}
	};

	const changeEmail = (index: any) => {
		const validNamePattern = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
		if (validNamePattern.test(fields.value[index].email)) {
			fields.value[index].emailValid = false;
		} else {
			fields.value[index].emailValid = true;
		}
	};

	const onSubmit = () => {
		fields.value.map((field: any) => {
			if (field.first_name === "") {
				field.firstNameRequired = true;
			}
			if (field.last_name === "") {
				field.lastNameRequired = true;
			}
			if (field.email === "") {
				field.emailValid = true;
			}
		});

		fields.value.map((field: any) => {
			if (!field.firstNameRequired || !field.lastNameRequired || !field.emailValid) {
				submitAddData();
			}
		});
	};

	const submitAddData = async () => {
		loading.value = true;
		const data: any = fields.value.map(({ emailValid, firstNameRequired, lastNameRequired, ...rest }) => rest);
		try {
			const res: any = await useApiFetch("/supplier-admins/invite-via-email", {
				method: "POST",
				body: { data: data },
			});
			loading.value = false;
			useToast("success", res.message);
			navigateTo(localePath("/supplier-admins"));
		} catch {
			loading.value = false;
		}
	};
</script>
<template>
	<div class="p-4 lg:p-6">
		<!-- <el-form-item   class="mb-0" :label="$t('formLabels.subcontractors')"> -->
		<div class="grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-4 mb-6" v-for="(input, index) in fields" :key="index">
			<el-form-item class="mb-0" :rules="[{ required: true }]">
				<template #label>
					<BaseLabel :label="$t('formLabels.first_name')" :tooltip-content="$t('info.first_name')" />
				</template>
				<el-input
					type="text"
					label="First Name"
					:name="'fields' + index"
					v-model="fields[index].first_name"
					:disabled="disabled"
					maxLength="200"
					@blur="changeFirstName(index)"
					@keypress="CharcAndNumber"
				/>
				<span v-if="fields[index].firstNameRequired || fields.firstNameRequired" class="text-danger">{{
					$t("formValidations.first_name")
				}}</span>
			</el-form-item>

			<el-form-item class="mb-0" :rules="[{ required: true }]">
				<template #label>
					<BaseLabel :label="$t('formLabels.last_name')" :tooltip-content="$t('info.last_name')" />
				</template>
				<el-input
					type="text"
					label="Last Name"
					:name="'fields' + index"
					v-model="fields[index].last_name"
					:disabled="disabled"
					maxLength="200"
					@blur="changeLastName(index)"
					@keypress="CharcAndNumber"
				/>
				<span v-if="fields[index].lastNameRequired" class="text-danger">{{ $t("formValidations.last_name") }}</span>
			</el-form-item>

			<el-form-item class="mb-0" :rules="[{ required: true }]">
				<template #label>
					<BaseLabel :label="$t('formLabels.email')" :tooltip-content="$t('info.email')" />
				</template>
				<el-input
					type="text"
					label="Email"
					name="email"
					v-model="fields[index].email"
					:disabled="disabled"
					maxLength="200"
					@blur="changeEmail(index)"
				/>
				<span v-if="fields[index].emailValid" class="text-danger">{{ $t("formValidations.email_valid") }}</span>
			</el-form-item>
			<novok-button type="danger" class="btn-icon sm:mt-8" @click="removeInput(index)" v-if="fields.length > 1">
				<i class="fa-solid fa-xmark"></i>
			</novok-button>
		</div>
		<!-- </el-form-item> -->
		<div class="text-right">
			<novok-button :class="disabled ? 'btn-dark' : 'el-button--info'" @click="addInput" :disabled="disabled"
				><i class="fa-solid fa-plus mr-2"></i> {{ $t("buttons.add") }}</novok-button
			>
			<novok-button type="info" @click="onSubmit" :loading="loading">{{ $t("buttons.submit") }}</novok-button>
			<novok-button class="btn-dark my-1" @click="navigateTo(localePath('/supplier-admins'))">
				<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
				<i class="fa-solid fa-xmark sm:hidden"></i>
			</novok-button>
		</div>
	</div>
</template>
