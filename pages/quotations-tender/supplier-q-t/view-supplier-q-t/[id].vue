<script setup lang="ts">
	import { useProfileStore } from "~/store/profile";

	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});

	useHead({
		title: "View Supplier Quotations & Tender",
	});

	const localePath = useLocalePath();
	const fullscreenLoading = ref(false);
	const editData = ref<Object>([]);
	const route = useRoute();
	const profileStore = useProfileStore();
	const timezone = ref<String>("");
	const editFileData = ref<any>({});

	onMounted(() => {
		const checkTimeZone = setInterval(async () => {
			if (getTimeZone.value) {
				await getEditData();
				clearInterval(checkTimeZone);
			} else {
				await getEditData();
				clearInterval(checkTimeZone);
			}
		}, 1000);
	});

	const getTimeZone = computed(() => {
		return profileStore.profileData.user_detail?.timezone;
	});

	const getEditData = async () => {
		fullscreenLoading.value = true;
		const timezone = getTimeZone.value ? getTimeZone.value : "Europe/London";

		try {
			const res: any = await useApiFetch(`/tender-quotations/${route.params?.id}?timezone=${timezone}`, {
				method: "GET",
			});
			editData.value = res.data?.tender;
			editFileData.value = res.data;
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};
</script>

<template>
	<quotations-tender-supplier-view :edit-data="editData" :edit-file-data="editFileData" />
</template>
