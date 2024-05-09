<script setup lang="ts">
	import { supplierStore } from "~/store/supplier";
	import moment from "moment";

	const editData = ref<any>({
		sub_entity_name: "",
		contact_person_name: "",
		country_code: "+44",
		contact_number: "",
		email: "",
		address: "",
		country: "",
		state: "",
		city: "",
		post_code: "",
		website: "",
		preferred_language: "",
	});

	const SupplierStore = supplierStore();
	const localePath = useLocalePath();
	const route = useRoute();
	const fullscreenLoading = ref(false);

	const emit = defineEmits(["active-tab-name"]);

	onMounted(() => {
		getSigningEntityData();
	});

	const getSigningEntityData = async () => {
		fullscreenLoading.value = true;
		try {
			const res: any = await useApiFetch(`/signing-entities/${route.params?.id}`, {
				method: "GET",
			});
			Object.assign(editData.value, res.data);
			// address.value = res.data?.address;
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};
</script>

<template>
	<div class="p-4" v-loading="fullscreenLoading">
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
			<div>
				<label class="font-bold block">{{ $t("formLabels.sub_entity_name") }}</label>
				<p class="break-words">{{ editData.sub_entity_name }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.contact_person_name") }}</label>
				<p class="break-words">{{ editData.contact_person_name || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.contact_number") }}</label>
				<p class="break-words">{{ editData.country_code + " " + editData.contact_number || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.email") }}</label>
				<p class="break-words">{{ editData.email || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.address") }}</label>
				<p class="break-words">{{ editData.address || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.city") }}</label>
				<p class="break-words">{{ editData.city || "-" }}</p>
			</div>
			<div>
				<label class="font-bold block">{{ $t("formLabels.state") }}</label>
				<p class="break-words">{{ editData.state || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.post_code") }}</label>
				<p class="break-words">{{ editData.post_code || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.country") }}</label>
				<p class="break-words">{{ editData.country || "-" }}</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.website") }}</label>
				<p class="break-words">
					<a :href="editData.website" class="text-primary underline" target="_blank">{{ editData.website || "-" }}</a>
				</p>
			</div>

			<div>
				<label class="font-bold block">{{ $t("formLabels.preferred_language") }}</label>
				<p class="break-words">
					{{ editData.preferred_language || "-" }}
				</p>
			</div>
		</div>
		<div class="text-right">
			<novok-button class="btn-dark my-1" @click="CancelRedirect('/signing-entity')">
				<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
				<i class="fa-solid fa-xmark sm:hidden"></i>
			</novok-button>
		</div>
	</div>
</template>
