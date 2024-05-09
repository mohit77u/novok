<script setup lang="ts">
	import { useAuthStore } from "~/store/auth";
	import { sidebarItemClear } from "~/helper/sidebarItemClear";
	import moment from "moment";

	const store = useAuthStore();
	const route = useRoute();
	const contactData = ref<any>({});
	const fullscreenLoading = ref(false);
	const localePath = useLocalePath();

	definePageMeta({
		middleware: ["auth", "is-super-admin"],
	});

	useHead({
		title: "View Contact Us Inquiries",
	});

	onMounted(async () => {
		await getViewData();
	});

	const getViewData = async () => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch(`/contact-us/${route.params?.id}`, {
				method: "GET",
			});

			contactData.value = res?.data;
			contactData.value.mobile_number = `(${res.data?.country_code})` + " " + res.data.mobile_number;
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const backClick = () => {
		const pageDetails = JSON.parse(sessionStorage.getItem("pageDetails") || "{}");
		const data = {
			page: pageDetails?.page,
			perPage: pageDetails?.perPage,
			searchValue: pageDetails?.searchValue,
			sortOrder: pageDetails?.sortOrder,
			sortColumn: pageDetails?.sortColumn,
			fromDate: pageDetails?.fromDate,
			toDate: pageDetails?.toDate,
			isArchived: pageDetails?.isArchived,
		};
		navigateTo(
			localePath({
				path: "/contact-us-responses",
				query: data,
			})
		);
	};
</script>

<template>
	<div class="p-4">
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
			<div>
				<label class="font-bold block">{{ $t("formLabels.company_name") }}</label>
				<p class="break-words">{{ contactData.company_name || "" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.full_name") }}</label>
				<p class="break-words">{{ contactData.full_name || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.email") }}</label>
				<p class="break-words">{{ contactData.email }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.contact_number") }}</label>
				<p class="break-words">{{ contactData.mobile_number || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.subject") }}</label>
				<p class="break-words">
					{{ contactData.subject || "-" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.message") }}</label>
				<p class="break-words">
					{{ contactData.message || "-" }}
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.created_date") }}</label>

				<p class="break-words">{{ contactData.created_at ? moment(`${contactData.created_at}`).format("DD/MM/YYYY") : "-" }}</p>
			</div>

			<div class="flex items-start lg:col-span-3">
				<div class="flex flex-wrap items-center w-full">
					<span class="text-dark font-bold">
						{{ $t("formLabels.are_you_an_existing_user") }}
					</span>
					<BaseLabel class="mr-4" :tooltip-content="$t('info.are_you_an_existing_user')" :isShowLabel="false" />
					<el-radio-group v-model="contactData.is_existing_user" size="large" :disabled="true">
						<el-radio-button :label="1">{{ $t("formLabels.yes") }}</el-radio-button>
						<el-radio-button :label="0">{{ $t("formLabels.no") }}</el-radio-button>
					</el-radio-group>
				</div>
			</div>
		</div>
		<div class="text-right">
			<novok-button class="btn-dark my-1" @click="navigateTo(localePath('/contact-us-responses'))">
				<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
				<i class="fa-solid fa-xmark sm:hidden"></i>
			</novok-button>
		</div>
	</div>
</template>
<style>
	/* @import "~/assets/css/main.css"; */
</style>
