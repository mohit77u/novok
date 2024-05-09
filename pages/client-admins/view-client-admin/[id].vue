<script setup lang="ts">
	import moment from "moment";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";

	definePageMeta({
		middleware: ["auth", "is-super-user"],
	});

	useHead({
		title: "View Client Admin",
	});

	const formData = reactive<any>({
		company_name: "",
		company_number: "",
		company_address: "",
		company_city: "",
		company_state: "",
		company_post_code: "",
		company_country: "",
		first_name: "",
		last_name: "",
		email: "",
		country_code: "+44",
		mobile_number: "",
		job_title: "",
		department: "",
		address: "",
		city: "",
		state: "",
		country: "",
		post_code: "",
		preferred_langauge: "",
		currency: "",
		account_status: 1,
		account_activation_date: "",
		custom_primary_details: [],
	});
	const route = useRoute();
	const fullscreenLoading = ref(false);
	const formHeight = ref<any>(null);
	const localePath = useLocalePath();
	const config = useRuntimeConfig();

	onMounted(async () => {
		formHeight.value = GetOffset("client-admin", 0);
		formData.account_activation_date = moment().format("YYYY-MM-DD");

		await getEditTableData();
	});

	const getEditTableData = async () => {
		try {
			fullscreenLoading.value = true;

			const res: any = await useApiFetch(`/client-admins/${route.params?.id}`, {
				method: "GET",
			});

			Object.keys(formData).forEach((field) => {
				formData[field] = res?.data?.[field];
				formData["email"] = res?.data?.user?.email;
			});
			Object.keys(res?.data?.company).forEach((field) => {
				formData[field] = res?.data?.company?.[field] || "";
			});
		} catch {
		} finally {
			setTimeout(() => {
				fullscreenLoading.value = false;
			}, 1000);
		}
	};

	const cancel = () => {
		const pageDetails = JSON.parse(sessionStorage.getItem("pageDetails") || "{}");
		const data = {
			page: pageDetails?.page,
			perPage: pageDetails?.perPage,
			searchValue: pageDetails?.searchValue,
			sortOrder: pageDetails?.sortOrder,
			sortColumn: pageDetails?.sortColumn,
		};
		navigateTo(
			localePath({
				path: "/client-admins",
				query: data,
			})
		);
	};
</script>

<template>
	<div id="client-admin" class="p-6" v-loading="fullscreenLoading">
		<h6 class="pb-2 text-xl font-bold border-b mb-2">
			{{ $t("formLabels.company_details") }}
		</h6>

		<div class="lg:flex items-start">
			<div class="border-dashed border w-[220px] rounded-md border-gray-400 p-4 inline-block">
				<NuxtImg class="w-[150px] h-[150px] rounded-md object-fit border" v-if="formData.company_logo" :src="formData?.company_logo" />
				<NuxtImg class="w-[150px] h-[150px] rounded-md object-fit border" v-else :src="config.public.default_user_link" />
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 w-full pl-10">
				<div class="">
					<label class="font-bold">{{ $t("formLabels.reg_company_name") }}</label>
					<p class="break-words">{{ formData?.company_name }}</p>
				</div>

				<div class="">
					<label class="font-bold">{{ $t("formLabels.reg_company_number") }}</label>
					<p class="break-words">{{ formData.company_number }}</p>
				</div>

				<div class="">
					<label class="font-bold">{{ $t("formLabels.reg_company_address") }}</label>
					<p>{{ formData.company_address || "-" }}</p>
				</div>

				<div class="">
					<label class="font-bold">{{ $t("formLabels.city") }}</label>
					<p class="break-words">{{ formData.company_city || "-" }}</p>
				</div>

				<div class="">
					<label class="font-bold">{{ $t("formLabels.state") }}</label>
					<p class="break-words">{{ formData.company_state || "-" }}</p>
				</div>

				<div class="">
					<label class="font-bold">{{ $t("formLabels.post_code") }}</label>
					<p class="break-words">{{ formData.company_post_code || "-" }}</p>
				</div>

				<div class="">
					<label class="font-bold">{{ $t("formLabels.country") }}</label>
					<p class="break-words">{{ formData.company_country || "-" }}</p>
				</div>
			</div>
		</div>

		<h3 class="pb-3 text-xl font-bold mt-10 border-b mb-3">
			{{ $t("formLabels.client-admin-details") }}
		</h3>

		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
			<div>
				<label class="font-bold">{{ $t("formLabels.first_name") }}</label>
				<p class="break-words">{{ formData.first_name || "-" }}</p>
			</div>

			<div>
				<label class="font-bold">{{ $t("formLabels.last_name") }}</label>
				<p class="break-words">{{ formData.last_name || "-" }}</p>
			</div>

			<div>
				<label class="font-bold">{{ $t("formLabels.job_title") }}</label>
				<p class="break-words">{{ formData.job_title || "-" }}</p>
			</div>

			<div>
				<label class="font-bold">{{ $t("formLabels.department") }}</label>
				<p class="break-words">{{ formData.department || "-" }}</p>
			</div>

			<div>
				<label class="font-bold">{{ $t("formLabels.email") }}</label>
				<p class="break-words">{{ formData.email || "-" }}</p>
			</div>

			<div>
				<label class="font-bold">{{ $t("formLabels.contact_number") }}</label>
				<p class="break-words">{{ formData.mobile_number ? "(" + formData.country_code + ")" + " " + formData.mobile_number : "-" }}</p>
			</div>

			<div>
				<label class="font-bold">{{ $t("formLabels.address") }}</label>
				<p>{{ formData.address || "-" }}</p>
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
				<label class="font-bold">{{ $t("formLabels.preferred_language") }}</label>
				<p class="break-words">{{ formData.preferred_langauge || "-" }}</p>
			</div>

			<div>
				<label class="font-bold">{{ $t("formLabels.currency") }}</label>
				<p class="break-words">{{ formData.currency || "-" }}</p>
			</div>

			<div>
				<label class="font-bold">{{ $t("formLabels.date") }}</label>
				<p class="break-words">{{ moment(formData.account_activation_date).format("DD/MM/YYYY") }}</p>
			</div>

			<div class="lg:col-span-2">
				<div class="flex items-center mb-2">
					<span class="text-dark font-bold block">{{ $t("formLabels.status") }}</span>
				</div>
				<el-radio-group v-model="formData.account_status" size="large" :disabled="true">
					<el-radio-button :label="1">{{ $t("formLabels.active") }}</el-radio-button>
					<el-radio-button :label="0">{{ $t("formLabels.inactive") }}</el-radio-button>
				</el-radio-group>
			</div>

			<custom-input-view v-if="formData?.custom_primary_details?.length" :custom-inputs="formData?.custom_primary_details" />
		</div>
	</div>

	<div class="p-4 text-right">
		<novok-button class="btn-dark my-1" @click="cancel">
			<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
			<i class="fa-solid fa-xmark sm:hidden"></i>
		</novok-button>
	</div>
</template>
   
