<script setup lang="ts">
	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});

	useHead({
		title: "E-Auction",
	});
	const router = useRouter();
	const localePath = useLocalePath();
    const fullscreenLoading = ref(false);

	onMounted(() => {
		
	});
</script>

<template>
	<div class="bg-[#fff] flex items-center justify-center h-full w-full">
		<NuxtImg format="webp" class="h-2/6 text-gray-50" src="/images/coming-soon.webp" alt="Coming Soon" />
	</div>
    <!-- <div class="h-full overflow-hidden" v-loading="fullscreenLoading">
		<BaseDataTable
            id="quotations_tender"
			:table-data="[]"
			:table-column="[]"
			:total="0"
			:status="false"
			:stripe="false"
			:request-status="false"
			:name="$t('buttons.quotation_tender')"
            :is-action-column="false"
		/>
		<BaseDeleteModal v-if="dialogVisible === true" :dialog-visible="dialogVisible" :delete-api="deleteApi" @dialog-ok-click="dialogOkClick" />
	</div> -->
</template>
