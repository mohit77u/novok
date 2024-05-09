<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/attribute-hyphenation -->
<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
	import { supplierStore } from "~/store/supplier";
	import { Pronouns, CompanyTypes, CurrencyData, supplierStatusObject } from "~/helper/data";

	const props = defineProps({
		editData: {
			type: Object,
			// eslint-disable-next-line vue/require-valid-default-prop
			default: {},
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		activeTab: {
			type: String,
			default: "",
		},
	});

	const fullscreenLoading = ref(false);

	const localePath = useLocalePath();
	const { t } = useI18n();
	const config = useRuntimeConfig();
	const SupplierStore = supplierStore();
	const emit = defineEmits(["active-tab-name", "disable", "disabled"]);
	const route = useRoute();

	const categories = ref<any>([]);
	const subCategories = ref<any>([]);
	const searchValue = ref("");
	const customFields = reactive([]);

	const getCategories = async () => {
		try {
			const res: any = await useApiFetch(`/categories?perPage=15&sortColumn=&sortOrder=&searchValue=${searchValue.value}&parent_id=0`, {
				method: "GET",
			});
			categories.value = res.data?.data?.map((data: any) => {
				return {
					label: data.category_name,
					value: data.id,
				};
			});
		} catch {}
	};

	const getSubCategories = async () => {
		try {
			const res: any = await useApiFetch(`/categories?parent_id=${props.editData.category}&perPage=15&searchValue=${searchValue.value}`, {
				method: "GET",
			});

			subCategories.value = res.data?.data.map((category: any) => {
				return {
					label: category.category_name,
					value: category.id,
				};
			});
		} catch {}
	};

	watch(
		() => props.editData,
		async (val: any) => {
			if (props.activeTab === "primary-details") {
				val.is_consent_to_share_with_marketplace = val.is_consent_to_share_with_marketplace == 1 ? true : false;
				Object.assign(customFields, val?.custom_primary_details);

				await getCategories();
				await getSubCategories();
			}
		}
	);

	const getSelectedCategory = computed(() => {
		return categories.value.find((data: any) => data.value === props.editData.category);
	});

	const getSelectedSubCategory = computed(() => {
		return subCategories.value.find((data: any) => data.value === props.editData.sub_category);
	});

	const getCompanyTypeLabel = (value: any) => {
		const compType = CompanyTypes.find((data: any) => data.value === value);
		return compType?.label;
	};

	const nextClick = () => {
		SupplierStore.setActiveTab("compliance-due-diligence");
		emit("active-tab-name", "compliance-due-diligence");
		navigateTo(
			localePath({
				path: route.fullPath,
				query: { tab: "compliance-due-diligence" },
			}),
			{ replace: true }
		);
	};
</script>

<template>
	<div v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="flex flex-col">
		<div class="p-6">
			<h6 class="pb-2 text-xl font-bold border-b mb-2">
				{{ $t("formLabels.company_details") }}
			</h6>

			<div class="lg:flex items-start">
				<div class="border-dashed border w-[220px] rounded-md border-gray-400 p-4 inline-block">
					<NuxtImg class="w-[150px] h-[150px] rounded-md object-fit border" v-if="editData.company_logo" :src="editData?.company_logo" />
					<NuxtImg class="w-[150px] h-[150px] rounded-md object-fit border" v-else :src="config.public.default_user_link" />
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 w-full pl-10">
					<div class="">
						<label class="font-bold">{{ $t("formLabels.reg_company_name") }}</label>
						<p class="break-words">{{ editData?.company_name }}</p>
					</div>

					<div class="">
						<label class="font-bold">{{ $t("formLabels.reg_company_number") }}</label>
						<p class="break-words">{{ editData.company_number }}</p>
					</div>

					<div class="">
						<label class="font-bold">{{ $t("formLabels.company_telephone") }}</label>
						<p class="break-words">
							{{ editData?.company_telephone ? editData?.company_telephone_country_code + " " + editData?.company_telephone : "-" }}
						</p>
					</div>

					<div class="">
						<label class="font-bold">{{ $t("formLabels.company_email") }}</label>
						<p class="break-words">{{ editData.company_email || "-" }}</p>
					</div>

					<div class="">
						<label class="font-bold">{{ $t("formLabels.company_website") }}</label>
						<p class="break-words">{{ editData.company_website || "-" }}</p>
					</div>

					<div class="">
						<label class="font-bold">{{ $t("formLabels.reg_company_address") }}</label>
						<p class="break-words">{{ editData.company_address || "-" }}</p>
					</div>

					<div class="">
						<label class="font-bold">{{ $t("formLabels.city") }}</label>
						<p class="break-words">{{ editData.company_city || "-" }}</p>
					</div>

					<div class="">
						<label class="font-bold">{{ $t("formLabels.state") }}</label>
						<p class="break-words">{{ editData.company_state || "-" }}</p>
					</div>

					<div class="">
						<label class="font-bold">{{ $t("formLabels.post_code") }}</label>
						<p class="break-words">{{ editData.company_post_code || "-" }}</p>
					</div>

					<div class="">
						<label class="font-bold">{{ $t("formLabels.country") }}</label>
						<p class="break-words">{{ editData.company_country || "-" }}</p>
					</div>

					<div class="">
						<label class="font-bold">{{ $t("formLabels.company_vat_number") }}</label>
						<p class="break-words">{{ editData.company_vat_number || "-" }}</p>
					</div>

					<!-- <div class="">
						<label class="font-bold">{{ $t("formLabels.timezone") }}</label>
						<p class="break-words">{{ editData.company_time_zone || "-" }}</p>
					</div> -->

					<div class="">
						<label class="font-bold">{{ $t("formLabels.diverse_company") }}</label>
						<p class="break-words">{{ editData.is_diverse_company || "-" }}</p>
					</div>

					<div v-if="editData.is_diverse_company === 'YES'">
						<label class="font-bold">{{ $t("formLabels.company_type") }}</label>
						<p class="break-words">{{ getCompanyTypeLabel(editData.company_type) || "-" }}</p>
					</div>

					<div v-if="editData.is_diverse_company === 'YES' && editData.other_company_type.length">
						<label class="font-bold">{{ $t("formLabels.company_type") }}</label>
						<p class="break-words">{{ editData.other_company_type || "-" }}</p>
					</div>

					<div>
						<label class="font-bold">{{ $t("formLabels.category_level_1") }}</label>
						<p class="break-words">{{ getSelectedCategory?.label || "-" }}</p>
					</div>

					<div>
						<label class="font-bold">{{ $t("formLabels.category_level_2") }}</label>
						<p class="break-words">{{ getSelectedSubCategory?.label || "-" }}</p>
					</div>
				</div>
			</div>

			<h3 class="pb-3 text-xl font-bold mt-10 border-b mb-3">
				{{ $t("formLabels.supplier-admin-details") }}
			</h3>

			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
				<div>
					<label class="font-bold">{{ $t("formLabels.supplier_code") }}</label>
					<p class="break-words">{{ editData.sup_ref_number || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.first_name") }}</label>
					<p class="break-words">{{ editData.first_name || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.last_name") }}</label>
					<p class="break-words">{{ editData.last_name || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.department") }}</label>
					<p class="break-words">{{ editData.department || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.job_title") }}</label>
					<p class="break-words">{{ editData.job_title || "-" }}</p>
				</div>

				<!-- <div>
					<label class="font-bold">{{ $t("formLabels.Pronouns") }}</label>
					<p class="break-words">{{ editData.Pronouns || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.preffered_name") }}</label>
					<p class="break-words">{{ editData.preffered_name || "-" }}</p>
				</div> -->

				<div>
					<label class="font-bold">{{ $t("formLabels.address") }}</label>
					<p class="break-words">{{ editData.cor_address || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.city") }}</label>
					<p class="break-words">{{ editData.cor_city || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.state") }}</label>
					<p class="break-words">{{ editData.cor_state || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.post_code") }}</label>
					<p class="break-words">{{ editData.cor_post_code || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.country") }}</label>
					<p class="break-words">{{ editData.cor_country || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.email") }}</label>
					<p class="break-words">{{ editData.email || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.contact_number") }}</label>
					<p class="break-words">{{ editData.mobile ? editData.mobile_country_code + " " + editData.mobile : "-" }}</p>
				</div>

				<div>
					<label class="font-bold block">{{ $t("formLabels.Status") }}</label>
					<el-tag
						:class="
							editData.status == 3
								? 'border border-success  bg-success/10  text-success '
								: editData.status == 4
								? 'border border-[#ff8e28]  bg-[#ff8e28]/10  text-[#ff8e28] '
								: editData.status == 2
								? 'border border-danger  bg-danger/10  text-danger'
								: 'border border-danger  text-danger bg-danger/10 '
						"
					>
						{{
							editData.status === 1
								? $t("dropdown_labels.uncontracted_unapproved")
								: editData.status === 2
								? $t("dropdown_labels.unapproved_contracted")
								: editData.status === 3
								? $t("dropdown_labels.approved_contracted")
								: editData.status === 4
								? $t("dropdown_labels.approved_uncontracted")
								: ""
						}}
					</el-tag>
				</div>

				<div v-if="editData.status == 2">
					<label class="font-bold">{{ $t("formLabels.reason") }}</label>
					<p class="break-words">{{ editData.reason || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.is_key_supplier") }}</label>
					<p class="break-words">{{ editData.key_supplier === 0 ? "No" : "Yes" }}</p>
				</div>

				<div v-if="editData.key_supplier === 1">
					<label class="font-bold">{{ $t("formLabels.key_supplier_comment") }}</label>
					<p class="break-words">{{ editData.key_supplier_comment || "-" }}</p>
				</div>

				<custom-input-view v-if="editData?.custom_primary_details?.length" :custom-inputs="editData?.custom_primary_details" />
			</div>

			<h3 class="pb-3 text-xl font-bold mt-10 border-b mb-3">
				{{ $t("formLabels.alternate_contact_details") }}
			</h3>

			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
				<div>
					<label class="font-bold">{{ $t("formLabels.first_name") }}</label>
					<p class="break-words">{{ editData.alt_first_name || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.last_name") }}</label>
					<p class="break-words">{{ editData.alt_last_name || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.department") }}</label>
					<p class="break-words">{{ editData.alt_department || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.job_title") }}</label>
					<p class="break-words">{{ editData.alt_job_title || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.email") }}</label>
					<p class="break-words">{{ editData.alt_email || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.contact_number") }}</label>
					<p class="break-words">{{ editData.alt_mobile ? editData.alt_mobile_country_code + " " + editData.alt_mobile : "-" }}</p>
				</div>
			</div>
		</div>

		<div class="p-4 text-right">
			<novok-button class="btn-dark my-1" @click="CancelRedirect('/supplier-admins')">
				<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
				<i class="fa-solid fa-xmark sm:hidden"></i>
			</novok-button>

			<novok-button class="my-1" type="info" :loading="loading" :disabled="loading" @click.prevent="nextClick"
				>{{ $t("buttons.next") }}
			</novok-button>
		</div>
	</div>
</template>
