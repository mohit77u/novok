<script setup lang="ts">
	import moment from "moment";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";

	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});

	useHead({
		title: "View User",
	});

	const formData = reactive<any>({
		employee_id: "",
		first_name: "",
		last_name: "",
		job_title: "",
		department: "",
		address: "",
		email: "",
		country_code: "+44",
		mobile_number: "",
		city: "",
		country: "",
		state: "",
		post_code: "",
		preferred_langauge: "",
		account_status: 1,
		account_activation_date: "",
		access_role_id: null,
		is_working_remotly: null,
	});
	const copyFormData = ref<any>({});
	const route = useRoute();
	const fullscreenLoading = ref(false);
	const formHeight = ref<any>(null);
	const localePath = useLocalePath();
	const accessRoles = ref<any>([]);

	onMounted(async () => {
		formHeight.value = GetOffset("super-admin-form", 0);
		getEditTableData();
		getAccessRoles();

		formData.account_activation_date = moment().format("YYYY-MM-DD");
		formData.client_admin_id = route?.params?.id;
	});

	const getEditTableData = async () => {
		try {
			fullscreenLoading.value = true;

			const res: any = await useApiFetch(`/client-users/${route.params?.id}`, {
				method: "GET",
			});

			Object.keys(formData).forEach((field) => {
				formData[field] = res?.data?.[field];
				formData["email"] = res?.data?.user?.email;
			});

			copyFormData.value = JSON.parse(JSON.stringify(formData));
		} catch {
		} finally {
			setTimeout(() => {
				fullscreenLoading.value = false;
			}, 1000);
		}
	};

	const getAccessRoles = async () => {
		try {
			const res: any = await useApiFetch("/access-roles", {
				method: "GET",
			});
			accessRoles.value = res.data?.data?.map((role: any) => {
				return {
					label: role.name,
					value: role.id,
				};
			});
		} catch {}
	};

	const getSelectedAccessRole = computed(() => {
		return accessRoles.value.find((role: any) => role.value === formData.access_role_id);
	});

	const cancelClick = () => {
		const pageDetails = JSON.parse(sessionStorage.getItem("pageDetails") || "{}");
		const clientAdminId = sessionStorage.getItem("client_admin_id");

		const queryURL = `/client-users?client_admin_id=${clientAdminId}`;
		navigateTo(
			localePath({
				path: queryURL,
				query: pageDetails,
			})
		);
	};
</script>

<template>
	<div id="super-admin-form" class="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" v-loading="fullscreenLoading">
		<div>
			<label class="font-bold">{{ $t("formLabels.employee_id") }}</label>
			<p class="break-words">{{ formData?.employee_id || "-" }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.first_name") }}</label>
			<p class="break-words">{{ formData?.first_name }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.last_name") }}</label>
			<p class="break-words">{{ formData?.last_name }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.job_title") }}</label>
			<p class="break-words">{{ formData?.job_title ?? "-" }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.department") }}</label>
			<p class="break-words">{{ formData?.department }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.user_work_email") }}</label>
			<p class="break-words">{{ formData?.email }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.contract_number") }}</label>
			<p class="break-words">{{ formData.mobile_number ? "(" + formData.country_code + ")" + " " + formData.mobile_number : "-" }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.is_working_remotly") }}</label>
			<p class="break-words">{{ formData.is_working_remotly == 1 ? "YES" : "NO" }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.address") }}</label>
			<p class="break-words">{{ formData.address || "-" }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.city") }}</label>
			<p class="break-words">{{ formData.city || "-" }}</p>
		</div>

		<div>
			<label class="font-bold">{{ $t("formLabels.state") }}</label>
			<p class="break-words">{{ formData.state || "-" }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.post_code") }}</label>
			<p class="break-words">{{ formData.post_code || "-" }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.country") }}</label>
			<p class="break-words">{{ formData.country || "-" }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.access_role") }}</label>
			<p class="break-words">{{ getSelectedAccessRole?.label || "-" }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.preferred_language") }}</label>
			<p class="break-words">{{ formData?.preferred_langauge || "-" }}</p>
		</div>

		<div>
			<label class="font-bold">{{ $t("formLabels.date") }}</label>
			<p class="break-words">{{ moment(formData.account_activation_date).format("DD/MM/YYYY") }}</p>
		</div>

		<div class="md:col-span-12 lg:col-span-4">
			<div class="flex items-center mb-2">
				<span class="text-dark font-bold block">{{ $t("formLabels.status") }}</span>
			</div>
			<el-radio-group v-model="formData.account_status" size="large" :disabled="true">
				<el-radio-button :label="1">{{ $t("formLabels.active") }}</el-radio-button>
				<el-radio-button :label="0">{{ $t("formLabels.inactive") }}</el-radio-button>
			</el-radio-group>
		</div>
	</div>
	<div class="p-6 text-right">
		<novok-button class="btn-dark my-1" @click.prevent="cancelClick">
			<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
			<i class="fa-solid fa-xmark sm:hidden"></i>
		</novok-button>
	</div>
</template>

