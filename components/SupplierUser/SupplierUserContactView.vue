<script setup lang="ts">
	import { supplierStore } from "~/store/supplier";

	const formData = reactive<any>({
		tab_name: "alternative-contact",
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
		const supplier_admin_id = useCookie("supplier_admin_id");

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

	const backClick = () => {
		SupplierStore.setActiveTab("supplier-user");
		emit("active-tab-name", "supplier-user");
		navigateTo(
			localePath({
				path: route.fullPath,
				query: { tab: "supplier-user" },
			}),
			{ replace: true }
		);
	};
</script>
<template>
	<div class="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
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
	<div class="p-6 text-right">
		<novok-button class="btn-dark my-1" @click="backClick">
			<span class="hidden sm:inline-block">{{ $t("buttons.back") }}</span>
			<i class="fa-solid fa-xmark sm:hidden"></i>
		</novok-button>

		<novok-button class="btn-dark my-1" @click.prevent="cancelClick">
			<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
			<i class="fa-solid fa-xmark sm:hidden"></i>
		</novok-button>
	</div>
</template>
