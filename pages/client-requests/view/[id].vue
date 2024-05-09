<template>
	<div v-loading="fullscreenLoading" :class="{ 'overflow-hidden': fullscreenLoading }" class="flex flex-col">
		<div class="p-6">
			<h6 class="pb-2 text-xl font-bold border-b mb-2">
				{{ $t("formLabels.company_details") }}
			</h6>

			<div class="lg:flex items-start">
				<div class="border-dashed border w-[220px] rounded-md border-gray-400 p-4 inline-block">
					<NuxtImg class="w-[150px] h-[150px] rounded-md object-fit border" v-if="formData?.company_logo" :src="formData?.company_logo" />
					<NuxtImg class="w-[150px] h-[150px] rounded-md object-fit border" v-else :src="config.public.default_user_link" />
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 w-full pl-10">
					<div class="">
						<label class="font-bold">{{ $t("formLabels.reg_company_name") }}</label>
						<p class="break-words">{{ formData?.company_name }}</p>
					</div>

					<div class="">
						<label class="font-bold">{{ $t("formLabels.reg_company_number") }}</label>
						<p class="break-words">{{ formData?.company_number }}</p>
					</div>

					<div class="">
						<label class="font-bold">{{ $t("formLabels.reg_company_address") }}</label>
						<p class="break-words">{{ formData?.company_address || "-" }}</p>
					</div>

					<div class="">
						<label class="font-bold">{{ $t("formLabels.city") }}</label>
						<p class="break-words">{{ formData?.company_city || "-" }}</p>
					</div>

					<div class="">
						<label class="font-bold">{{ $t("formLabels.state") }}</label>
						<p class="break-words">{{ formData?.company_state || "-" }}</p>
					</div>

					<div class="">
						<label class="font-bold">{{ $t("formLabels.post_code") }}</label>
						<p class="break-words">{{ formData?.company_post_code || "-" }}</p>
					</div>

					<div class="">
						<label class="font-bold">{{ $t("formLabels.country") }}</label>
						<p class="break-words">{{ formData?.company_country || "-" }}</p>
					</div>
				</div>
			</div>

			<h3 class="pb-3 text-xl font-bold mt-10 border-b mb-3">
				{{ $t("formLabels.client-admin-details") }}
			</h3>

			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
				<div>
					<label class="font-bold">{{ $t("formLabels.first_name") }}</label>
					<p class="break-words">{{ formData?.first_name || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.last_name") }}</label>
					<p class="break-words">{{ formData?.last_name || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.department") }}</label>
					<p class="break-words">{{ formData?.department || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.job_title") }}</label>
					<p class="break-words">{{ formData?.job_title || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.address") }}</label>
					<p class="break-words">{{ formData?.address || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.city") }}</label>
					<p class="break-words">{{ formData?.city || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.state") }}</label>
					<p class="break-words">{{ formData?.state || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.post_code") }}</label>
					<p class="break-words">{{ formData?.post_code || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.country") }}</label>
					<p class="break-words">{{ formData?.country || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.email") }}</label>
					<p class="break-words">{{ formData?.email || "-" }}</p>
				</div>

				<div>
					<label class="font-bold">{{ $t("formLabels.contact_number") }}</label>
					<p class="break-words">{{ formData?.mobile_number ? formData?.country_code + " " + formData?.mobile_number : "-" }}</p>
				</div>
			</div>
		</div>

		<div class="p-4 text-right">
			<novok-button class="btn-dark my-1" @click="CancelRedirect('/client-requests')">
				<span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span>
				<i class="fa-solid fa-xmark sm:hidden"></i>
			</novok-button>
		</div>
	</div>
</template>

<script lang="ts" setup>
	const fullscreenLoading = ref(false);
	const { t } = useI18n();
	const config = useRuntimeConfig();
	const formData = ref({});
	const route = useRoute();

	onMounted(async () => {
		try {
			fullscreenLoading.value = true;
			const res: any = await useApiFetch(`/client-requests/${route?.params?.id}`, {
				method: "GET",
			});

			Object.assign(formData.value, res?.data);
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	});
</script>

<style lang="scss" scoped>
</style>
