<script setup lang="ts">
	import { supplierStore } from "~/store/supplier";

	const formData = reactive<any>({
		tab_name: "supplier-user",
		first_name: "",
		last_name: "",
		department: "",
		job_title: "",
		pronouns: "he",
		preffered_name: "",
		cor_address: "",
		cor_city: "",
		cor_country: "",
		cor_state: "",
		cor_post_code: "",
		email: "",
		telephone: "",
		mobile: "",
		telephone_country_code: "+44",
		mobile_country_code: "+44",
        alt_first_name: "",
		alt_last_name: "",
		alt_department: "",
		alt_job_title: "",
		alt_email: "",
		alt_telephone: "",
		alt_mobile: "",
		alt_telephone_country_code: "+44",
		alt_mobile_country_code: "+44",
	});
	const localePath = useLocalePath();
	const { t } = useI18n();
	const SupplierStore = supplierStore();
	const route = useRoute();

	const emit = defineEmits(["active-tab-name"]);

	const props = defineProps({
		editData: {
			type: Object,
			// eslint-disable-next-line vue/require-valid-default-prop
			default: {},
		},
	});

	watch(
		() => props.editData,
		(currData) => {
			if (currData.tab === "supplier-user" || currData.tab === "all") {
				if (Object.keys(currData || {}).length) {
					Object.keys(formData).forEach((field: any) => {
						if (currData?.[field] !== undefined && currData?.[field] !== null && currData?.[field] !== "") {
							formData[field] = currData?.[field];
						}
					});
				}
			}
		}
	);

	const cancelClick = () => {
		const supplier_admin_id = useCookie('supplier_admin_id');
		const pageDetails = JSON.parse(sessionStorage.getItem("pageDetails") || "{}");
		const queryUrl = {
			page: pageDetails?.page,
			perPage: pageDetails?.perPage,
			searchValue: pageDetails?.searchValue,
			sortOrder: pageDetails?.sortOrder,
			sortColumn: pageDetails?.sortColumn,
			supplier_admin_id : supplier_admin_id.value,
		};

		navigateTo(
			localePath({
				name: "supplier-users",
				query: queryUrl,
			})
		);
	};

</script>
<template>
	<div class="p-6">
        <h3 class="mb-3 text-2xl font-bold">
            {{ $t("formLabels.primary_details") }}
            <BaseLabel :tooltip-content="$t('info.primary_details')" />
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
                <label class="font-bold">{{ $t("formLabels.first_name") }}</label>
                <p class="truncate">{{ formData?.first_name }}</p>
            </div>
            <div>
                <label class="font-bold">{{ $t("formLabels.last_name") }}</label>
                <p class="truncate">{{ formData?.last_name }}</p>
            </div>
            <div>
                <label class="font-bold">{{ $t("formLabels.department") }}</label>
                <p class="truncate">{{ formData?.department }}</p>
            </div>
            <div>
                <label class="font-bold">{{ $t("formLabels.job_title") }}</label>
                <p class="truncate">{{ formData?.job_title ?? "-" }}</p>
            </div>

            <div>
                <label class="font-bold">{{ $t("formLabels.address") }}</label>
                <p class="truncate">{{ formData.cor_address }}</p>
            </div>
            <div>
                <label class="font-bold">{{ $t("formLabels.city") }}</label>
                <p class="truncate">{{ formData.cor_city || "-" }}</p>
            </div>

            <div>
                <label class="font-bold">{{ $t("formLabels.state") }}</label>
                <p class="truncate">{{ formData.cor_state || "-" }}</p>
            </div>
            <div>
                <label class="font-bold">{{ $t("formLabels.post_code") }}</label>
                <p class="truncate">{{ formData.cor_post_code || "-" }}</p>
            </div>
            <div>
                <label class="font-bold">{{ $t("formLabels.country") }}</label>
                <p class="truncate">{{ formData.cor_country || "-" }}</p>
            </div>

            <div>
                <label class="font-bold">{{ $t("formLabels.email") }}</label>
                <p class="truncate">{{ formData?.email }}</p>
            </div>
            <div>
                <label class="font-bold">{{ $t("formLabels.telephone_no") }}</label>
                <p class="truncate">{{ formData.telephone_country_code + " " + formData.telephone }}</p>
            </div>

            <div>
                <label class="font-bold">{{ $t("formLabels.contact_number") }}</label>
                <p class="truncate">{{ formData.mobile_country_code + " " + formData.mobile }}</p>
            </div>
        </div>

        <h3 class="mb-3 mt-6 text-2xl font-bold">
            {{ $t("formLabels.alternate_contact_details") }}
			<BaseLabel :tooltip-content="$t('info.alternate_contact_details')" />
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
                <label class="font-bold">{{ $t("formLabels.first_name") }}</label>
                <p class="truncate">{{ formData?.alt_first_name || "-" }}</p>
            </div>
            <div>
                <label class="font-bold">{{ $t("formLabels.last_name") }}</label>
                <p class="truncate">{{ formData?.alt_last_name || "-" }}</p>
            </div>
            <div>
                <label class="font-bold">{{ $t("formLabels.department") }}</label>
                <p class="truncate">{{ formData?.alt_department || "-" }}</p>
            </div>
            <div>
                <label class="font-bold">{{ $t("formLabels.job_title") }}</label>
                <p class="truncate">{{ formData?.alt_job_title || "-" }}</p>
            </div>

            <div>
                <label class="font-bold">{{ $t("formLabels.email") }}</label>
                <p class="truncate">{{ formData?.alt_email || "-" }}</p>
            </div>
            <div>
                <label class="font-bold">{{ $t("formLabels.telephone_no") }}</label>
                <p class="truncate">{{ formData.alt_telephone ? formData.alt_telephone_country_code + " " + formData.alt_telephone : "-" }}</p>
            </div>

            <div>
                <label class="font-bold">{{ $t("formLabels.contact_number") }}</label>
                <p class="truncate">{{ formData.alt_mobile ? formData.alt_mobile_country_code + " " + formData.alt_mobile : "-" }}</p>
            </div>
        </div>
	</div>
	<div class="px-6 text-right">
		<novok-button class="btn-dark my-1" @click.prevent="cancelClick">
			<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
			<i class="fa-solid fa-xmark sm:hidden"></i>
		</novok-button>
	</div>
</template>
