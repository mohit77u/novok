<template>
	<div class="grid md:grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6" v-loading="fullscreenLoading">
		<div class="bg-primary min-h-[100vh] lg:pl-[25%] md:pl-6 pt-16 pr-6">
			<div class="flex items-center">
				<i v-if="!route?.query?.is_renewal" class="fa-solid text-white fa-arrow-left mr-3 cursor-pointer -ml-6" @click="back"></i>
				<NuxtImg src="/images/logo-white.svg" class="h-[30px] md:h-[35px] lg:h-[40px] 2xl:h-[45px] 3xl:h-[60px]" alt="logo" />
			</div>
			<div class="text-slate-200 mt-10 font-bold" v-if="userRequestData?.plan_name == 'Annual'">
				<p class="text-xl">Subscribe To Annual</p>
				<div class="flex items-center text-white">
					<span class="text-[44px]"
						>£{{
							percentageValue(
								userRequestData?.planDetails?.priceDetails?.tiers[0]?.flat_amount,
								userRequestData?.planDetails?.priceDetails?.tax_rate
							)
						}}</span
					>
					&nbsp;<span class="text-[16px] text-slate-200 leading-4">Yearly Cost</span>
				</div>

				<div class="mt-5 text-slate-200 text-xl">
					<p class="pb-2 font-bold">Important points:</p>
					<p class="pb-2">
						<span class="leading-4 text-[16px] font-medium"
							>* £{{ getAmount(userRequestData?.planDetails?.priceDetails?.tiers[0]?.flat_amount) / 12 }} + VAT per month up to 50
							users</span
						>
					</p>
					<p class="pb-2">
						<span class="leading-4 text-[16px] font-medium"
							>* Paid 12 months in advance £{{ userRequestData?.planDetails?.plan_price }} + VAT</span
						>
					</p>
					<p class="pb-2"><span class="leading-4 text-[16px] font-medium">* Minimum 12 month Contract</span></p>
					<p class="pb-2"><span class="leading-4 text-[16px] font-medium">* Subject to terms and conditions</span></p>
					<p class="pb-2">
						<span class="leading-4 text-[16px] font-medium">* Additional User Cost = £7.95 + 20% (VAT) per month per user</span>
					</p>
					<p class="max-w-[480px]">
						<span class="leading-4 text-[16px] font-medium"
							>* Value Added Tax (VAT) = {{ userRequestData?.planDetails?.priceDetails?.tax_rate }}% extra on the subscription fee
							included in yearly cost</span
						>
					</p>
				</div>
			</div>

			<div class="text-slate-200 mt-10 font-bold" v-else>
				<p class="text-xl">Subscribe To Monthly</p>
				<div class="flex items-center text-white">
					<span class="text-[44px]"
						>£{{
							percentageValue(
								userRequestData?.planDetails?.priceDetails?.tiers[0].flat_amount,
								userRequestData?.planDetails?.priceDetails?.tax_rate
							)
						}}</span
					>
					&nbsp;<span class="text-[16px] text-slate-200 leading-4">Monthly Cost</span>
				</div>

				<div class="mt-5 text-slate-200 text-xl">
					<p class="pb-2 font-bold">Important points:</p>
					<p class="pb-2">
						<span class="leading-4 text-[16px] font-medium"
							>* £{{ getAmount(userRequestData?.planDetails?.priceDetails?.tiers[0].flat_amount) }} + VAT per month up to 50 users</span
						>
					</p>
					<p class="pb-2"><span class="leading-4 text-[16px] font-medium">* 12 equal monthly payments</span></p>
					<p class="pb-2"><span class="leading-4 text-[16px] font-medium">* Auto renewed every month</span></p>
					<p class="pb-2"><span class="leading-4 text-[16px] font-medium">* Subject to terms and conditions</span></p>
					<p class="pb-2">
						<span class="leading-4 text-[16px] font-medium">* Additional User Cost = £7.95 + 20% (VAT) per month per user</span>
					</p>
					<p class="max-w-[480px]">
						<span class="leading-4 text-[16px] font-medium"
							>* Value Added Tax (VAT) = {{ userRequestData?.planDetails?.priceDetails?.tax_rate }}% extra on the subscription fee
							included in monthly cost</span
						>
					</p>
				</div>
			</div>
		</div>

		<div class="flex items-center" id="checkout">
			<!-- Checkout will insert the payment form here -->
		</div>
	</div>
</template>

<script setup>
	import { loadScript } from "~/utils/scripts";
	const route = useRoute();
	const sessionUrl = ref("");
	const config = useRuntimeConfig();
	const fullscreenLoading = ref(false);
	const userRequestData = ref({});

	let checkout;

	definePageMeta({
		layout: "empty",
	});

	useHead({
		title: "Check Out",
	});

	onMounted(async () => {
		await getUserSignupRequest(route?.query?.id);
	});

	const getUserSignupRequest = async (checkout_session_id) => {
		try {
			fullscreenLoading.value = true;

			let apiEndpoint = `/check-out/${checkout_session_id}`;

			if (route?.query?.is_renewal) {
				apiEndpoint = `/renewal-check-out/${checkout_session_id}`;
			}

			const res = await useApiFetch(apiEndpoint, {
				method: "GET",
			});

			if (res?.status) {
				userRequestData.value = res.data;

				const existingScript = document.querySelector(`script[src="https://js.stripe.com/v3/"]`);

				if (existingScript) {
					// Remove existing script if found
					existingScript.parentNode.removeChild(existingScript);
				}

				loadScript("https://js.stripe.com/v3/", () => initialize());
			}
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const initialize = async () => {
		const stripe = Stripe(config.public.stripe_publish_key);

		const clientSecret = route?.query?.client_secret;
		checkout = await stripe.initEmbeddedCheckout({
			clientSecret,
		});

		// Mount Checkout
		checkout.mount("#checkout");
	};

	onBeforeUnmount(() => {
		if (checkout) {
			checkout.destroy();
			checkout = null;
		}
	});

	const back = () => {
		navigateTo({
			path: "/pricing-plans",
			query: {
				id: route?.query?.id,
				client_secret: route?.query?.client_secret,
			},
		});
	};

	const getAmount = (value) => {
		return value / 100;
	};

	const percentageValue = (value, taxRate) => {
		let intValue = parseInt(value);
		intValue = getAmount(intValue);
		let result = intValue + (intValue * taxRate) / 100;
		return result.toFixed(2);
	};
</script>

