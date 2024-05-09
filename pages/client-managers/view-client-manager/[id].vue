<script setup lang="ts">
	import moment from "moment";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";

	definePageMeta({
		middleware: ["auth", "is-super-user"],
	});

	useHead({
		title: "View Client Account Manager",
	});

	const formData = reactive<any>({
		employee_id: "",
		first_name: "",
		last_name: "",
		job_title: "",
		department: "",
		email: "",
		country_code: "+44",
		mobile_number: "",
		address: "",
		country: "",
		state: "",
		city: "",
		post_code: "",
		all_clients: null,
		client_ids: [],
		preferred_langauge: "",
		currency: "",
		account_status: 1,
		account_activation_date: "",
	});

	const route = useRoute();
	const fullscreenLoading = ref(false);
	const formHeight = ref<any>(null);
	const clientDropdownData = ref<any>([]);
	const localePath = useLocalePath();
	const selectedClientName = ref<any>([]);

	onMounted(async () => {
		formHeight.value = GetOffset("client-manager", 0);
		formData.account_activation_date = moment().format("YYYY-MM-DD");
		await getEditTableData();
		// getClientApiCall();
	});

	const getEditTableData = async () => {
		try {
			fullscreenLoading.value = true;

			const res: any = await useApiFetch(`/client-account-managers/${route.params?.id}`, {
				method: "GET",
			});

			Object.keys(formData).forEach((field) => {
				if (res?.data?.[field] !== undefined && res?.data?.[field] !== null) {
					formData[field] = res?.data?.[field];
					formData["email"] = res?.data?.user?.email;
				}
			});

			res.data?.clients?.map((item: any) => {
				return formData.client_ids.push(item.id);
			});

			selectedClientName.value = res.data?.clients.map((name: any) => {
				return name.full_name;
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
				path: "/client-managers",
				query: data,
			})
		);
	};
</script>

<template>
	<div id="client-manager" class="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" v-loading="fullscreenLoading">
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
			<label class="font-bold">{{ $t("formLabels.company_email_id") }}</label>
			<p class="break-words">{{ formData?.email }}</p>
		</div>
		<div>
			<label class="font-bold">{{ $t("formLabels.contract_number") }}</label>
			<p class="break-words">{{ formData.mobile_number ? "(" + formData.country_code + ")" + " " + formData.mobile_number : "-" }}</p>
		</div>

		<div>
			<label class="font-bold">{{ $t("formLabels.address") }}</label>
			<p class="break-words">{{ formData.address }}</p>
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
			<p class="break-words">{{ formData?.preferred_language || "-" }}</p>
		</div>

		<div>
			<label class="font-bold">{{ $t("formLabels.currency") }}</label>
			<p class="break-words">{{ formData?.currency || "-" }}</p>
		</div>

		<div>
			<label class="font-bold">{{ $t("formLabels.date") }}</label>
			<p class="break-words">{{ moment(formData.account_activation_date).format("DD/MM/YYYY") }}</p>
		</div>

		<div class="col-span-1 sm:col-span-2 md:col-span-3 xl:col-span-4">
			<label class="font-bold">{{ $t("formLabels.assign_clients") }}</label>
			<p class="break-words">{{ formData.all_clients === 1 ? "All" : "" }}</p>
			<template v-if="formData.all_clients === 0">
				<span class="inline-block bg-dark/20 p-2 rounded text-xs mr-1 mb-1" v-for="(client, index) in selectedClientName" :key="index">{{
					client
				}}</span>
			</template>
		</div>

		<div class="md:col-span-6 lg:col-span-3">
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
		<novok-button class="btn-dark my-1" @click.prevent="cancel">
			<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
			<i class="fa-solid fa-xmark sm:hidden"></i>
		</novok-button>
	</div>
</template>
 
