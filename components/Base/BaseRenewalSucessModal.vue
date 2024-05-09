<template>
	<el-dialog
		v-model="isShow"
		class="max-w-[540px] w-[90%] rounded-2xl noHeader"
		:center="true"
		:close-on-press-escape="false"
		:close-on-click-modal="false"
		:show-close="false"
		:align-center="true"
	>
		<h1 class="text-3xl font-bold mb-5 mt-4 text-dark/100 text-center">Subscription Renewal Processed!</h1>
		<div class="text-gray text-base">
			<p class="pb-3">
				Your subscription renewal has been successfully processed. We're pleased to inform you that your card details have been securely
				saved, and payment will be automatically deducted once your account is activated.
			</p>
			<p class="pb-3">Your account is now being renewed!</p>

			<p>
				We're currently updating your account, and you'll receive an email soon. Please check your inbox (and spam folder, just in case) for
				further instructions.
			</p>
		</div>
		<template #footer>
			<div class="dialog-footer text-center">
				<novok-button type="info" @click="backToDashboard"> Close </novok-button>
			</div>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
	const props = defineProps({
		dialogVisible: {
			type: Boolean,
			default: false,
		},
	});

	const isShow = ref(false);
	const localePath = useLocalePath();

	watch(
		() => props.dialogVisible,
		(value) => {
			isShow.value = value;
		}
	);

	const backToDashboard = () => {
		isShow.value = false;
		navigateTo(localePath("/sign-in"));
	};
</script>

<style>
</style>
