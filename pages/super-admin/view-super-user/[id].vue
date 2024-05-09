<script setup lang="ts">
	import moment from "moment";

	const fullscreenLoading = ref(false);
	const route = useRoute();

	definePageMeta({
		middleware: ["auth", "is-super-admin"],
	});

	useHead({
		title: "View BS Client Database",
	});
	const formData = reactive<any>({
		company_logo: "",
		company_name: "",
		company_number: "",
		company_address: "",
		company_country: "",
		company_state: "",
		company_city: "",
		company_post_code: "",
		company_hq_address: "",
		company_hq_country: "",
		company_hq_state: "",
		company_hq_city: "",
		company_hq_post_code: "",
		company_website: "",
		additional_information: "",
		first_name: "",
		last_name: "",
		job_title: "",
		department: "",
		email: "",
		address: "",
		country_code: "+44",
		mobile_number: "",
		city: "",
		state: "",
		country: "",
		post_code: "",
		preferred_langauge: "",
		currency: "",
		account_status: 1,
		account_activation_date: "",
	});
	const localePath = useLocalePath();
	const config = useRuntimeConfig();

	onMounted(() => {
		getEditTableData();
	});
	const getEditTableData = async () => {
		try {
			fullscreenLoading.value = true;

			const res: any = await useApiFetch(`/super-users/${route.params?.id}`, {
				method: "GET",
			});

			Object.keys(formData).forEach((field) => {
				formData[field] = res?.data?.[field];
				formData["email"] = res.data?.user?.email;
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
				path: "/super-admin",
				query: data,
			})
		);
	};
</script>

<template>
	<div v-loading="fullscreenLoading" id="client-admin" class="p-6">
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
					<p class="break-words">{{ formData.company_address || "-" }}</p>
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
			{{ $t("formLabels.company_headquarter_details") }}
		</h3>

		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
			<div>
				<label class="font-bold">{{ $t("formLabels.company_hq_address") }}</label>
				<p class="break-words">{{ formData.company_hq_address || "-" }}</p>
			</div>

			<div>
				<label class="font-bold">{{ $t("formLabels.city") }}</label>
				<p class="break-words">{{ formData.company_hq_city || "-" }}</p>
			</div>

			<div>
				<label class="font-bold">{{ $t("formLabels.state") }}</label>
				<p class="break-words">{{ formData.company_hq_state || "-" }}</p>
			</div>

			<div>
				<label class="font-bold">{{ $t("formLabels.post_code") }}</label>
				<p class="break-words">{{ formData.company_hq_post_code || "-" }}</p>
			</div>

			<div>
				<label class="font-bold">{{ $t("formLabels.country") }}</label>
				<p class="break-words">{{ formData.company_hq_country || "-" }}</p>
			</div>

			<div>
				<label class="font-bold">{{ $t("formLabels.company_website") }}</label>
				<p class="break-words">{{ formData.company_website || "-" }}</p>
			</div>

			<div>
				<label class="font-bold">{{ $t("formLabels.company_addtional_info") }}</label>
				<p class="break-words">{{ formData.company_additional_information_max || "-" }}</p>
			</div>
		</div>

		<h3 class="pb-3 text-xl font-bold mt-10 border-b mb-3">
			{{ $t("formLabels.super_user_details") }}
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
				<p class="break-words">{{ formData.country_code + " " + formData.mobile_number }}</p>
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
				<label class="font-bold">{{ $t("formLabels.preferred_language") }}</label>
				<p class="break-words">{{ formData.preferred_langauge || "-" }}</p>
			</div>

			<div>
				<label class="font-bold">{{ $t("formLabels.currency") }}</label>
				<p class="break-words">{{ formData.currency }}</p>
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

