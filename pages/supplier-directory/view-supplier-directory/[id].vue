<script lang="ts" setup>
	import type { TabsPaneContext } from "element-plus";
	const { t } = useI18n();

	definePageMeta({
		middleware: ["auth", "is-super-admin"],
	});

	useHead({
		title: "View Supplier Directory",
	});

	const fullscreenLoading = ref(false);
	const formData = ref<any>({});
	const route = useRoute();
	const localePath = useLocalePath();
	const disabled = ref(true);
	const buttonName = ref<any>(t("buttons.edit"));
	const btn = ref<any>("");
	const copyFormData = ref<any>([]);
	const { getSelectedCountry, getCountry } = useGetSelectedCountry();
	const timeZones = ref([]);
	const config = useRuntimeConfig();

	onMounted(() => {
		getFormData();
		getTimeZone();
	});

	const getFormData = async () => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch(`/supplier-marketplace/${route?.params?.id}`, {
				method: "GET",
			});
			formData.value = { ...res?.data };
			copyFormData.value = JSON.parse(JSON.stringify(res?.data));
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const getTimeZone = () => {
		$fetch(`https://worldtimeapi.org/api/timezone/`, {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
		})
			.then((res: any) => {
				timeZones.value = res?.map((field: any) => {
					return {
						label: field,
						value: field,
					};
				});
			})
			.catch((err) => {
				return err;
			});
	};

	const dropdownCompanyTelCountryCode = (value: any) => {
		formData.value.company_telephone_country_code = value;
	};

	const getSelectedTimeZone = computed(() => {
		const selectedTimeZone = timeZones.value.find((timezone: any) => {
			return timezone.value === formData.value.company_time_zone;
		});
		return selectedTimeZone;
	});

	const dropdownSelectedTimezone = (value: any) => {
		formData.value.company_time_zone = value;
	};

	const dropdownSelectedTelCountryCodeValue = (value: any) => {
		formData.value.telephone_country_code = value;
	};

	const dropdownSelectedMobileCountryCodeValue = (value: any) => {
		formData.value.mobile_country_code = value;
	};

	const iconClick = () => {
		disabled.value = !disabled.value;
		buttonName.value = disabled.value ? t("buttons.edit") : "";
	};

	const disabledData = (value: any) => {
		disabled.value = value;
		buttonName.value = disabled.value ? t("buttons.edit") : "";
	};

	const getData = computed(() => {
		return buttonName.value;
	});
</script>

<template>
	<div v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="p-4 min-h-full relative">
		<div id="client-admin">
			<h6 class="pb-2 text-xl font-bold border-b mb-2">
				{{ $t("formLabels.company_details") }}
			</h6>

			<div class="lg:flex items-start">
				<div class="border-dashed border w-[220px] rounded-md border-gray-400 p-4 inline-block">
					<NuxtImg
						class="w-[150px] h-[150px] rounded-md object-fit border"
						v-if="copyFormData.company_logo"
						:src="copyFormData?.company_logo"
					/>
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
						<label class="font-bold">{{ $t("formLabels.company_telephone") }}</label>
						<p class="break-words">{{ formData.company_telephone_country_code + " " + formData.company_telephone }}</p>
					</div>

					<div class="">
						<label class="font-bold">{{ $t("formLabels.company_email") }}</label>
						<p class="break-words">{{ formData.company_email }}</p>
					</div>

					<div class="">
						<label class="font-bold">{{ $t("formLabels.company_website") }}</label>
						<p class="break-words">{{ formData.company_website || "-" }}</p>
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

					<div class="">
						<label class="font-bold">{{ $t("formLabels.company_vat_number") }}</label>
						<p class="break-words">{{ formData.company_vat_number || "-" }}</p>
					</div>

					<div class="">
						<label class="font-bold">{{ $t("formLabels.timezone") }}</label>
						<p class="break-words">{{ formData.company_time_zone || "-" }}</p>
					</div>

					<div class="">
						<label class="font-bold">{{ $t("formLabels.diverse_company") }}</label>
						<p class="break-words">{{ formData.is_diverse_company || "-" }}</p>
					</div>
				</div>
			</div>

			<h3 class="pb-3 text-xl font-bold mt-10 border-b mb-3">
				{{ $t("formLabels.supplier_directory_details") }}
			</h3>

			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
				<div>
					<label class="font-bold">{{ $t("formLabels.supplier_code") }}</label>
					<p class="break-words">{{ formData.sup_ref_number || "-" }}</p>
				</div>

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
					<label class="font-bold">{{ $t("formLabels.address") }}</label>
					<p class="break-words">{{ formData.cor_address || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.city") }}</label>
					<p class="break-words">{{ formData.cor_city || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.state") }}</label>
					<p class="break-words">{{ formData.cor_state || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.post_code") }}</label>
					<p class="break-words">{{ formData.cor_post_code || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.country") }}</label>
					<p class="break-words">{{ formData.cor_country || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.email") }}</label>
					<p class="break-words">{{ formData.email || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.currency") }}</label>
					<p class="break-words">{{ formData.currency || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.category_level_1") }}</label>
					<p class="break-words">{{ formData.category || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.telephone_no") }}</label>
					<p class="break-words">{{ formData.telephone ? formData.telephone_country_code + " " + formData.telephone : "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.contact_number") }}</label>
					<p class="break-words">{{ formData.mobile ? formData.mobile_country_code + " " + formData.mobile : "-" }}</p>
				</div>
			</div>
		</div>

		<div class="p-4 text-right">
			<novok-button class="btn-dark my-1" @click="CancelRedirect('/supplier-directory')">
				<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
				<i class="fa-solid fa-xmark sm:hidden"></i>
			</novok-button>
		</div>
	</div>
</template>
    <style lang="scss">
	/* @import "~/assets/css/main.css"; */
	.el-tabs__nav-wrap {
		padding-right: 80px;
		&.is-scrollable {
			@apply pr-28;
		}
		.el-tabs__nav-scroll {
			@apply flex justify-between items-center;
			.el-tabs__nav-next {
				@apply right-20;
			}
		}
	}
</style>
