<template>
	<div class="min-h-screen flex flex-col">
		<LoginHeader />

		<div class="flex flex-1 flex-col">
			<div class="flex items-center justify-center flex-1 px-3 lg:pt-20">
				<div
					class="w-full lg:w-10/12 xl:w-7/12 xxl:w-6/12 p-5 md:p-6 lg:p-8 xl:p-10 rounded-md border-t-[6px] border-primary shadow-md my-5 bg-[#fff]"
					v-loading="loading"
				>
					<div class="flex justify-between items-start mb-5">
						<div>
							<h6 class="text-3xl font-bold text-dark">Pricing Plans</h6>
							<p class="text-gray mt-1">Select your plan below to create your account and get started.</p>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-5">
						<div class="plan bg-white rounded-md border border-gray-100 shadow-md p-4" v-for="(plan, index) in plansList" :key="index">
							<h3 class="text-2xl font-semibold mt-1 mb-3 text-left text-[#1294a8]">{{ plan.name }}</h3>

							<div v-if="plan.name == 'Annual'">
								<ul class="text-left list-disc pl-4">
									<li class="pb-2 text-sm">
										<span class="text-md"
											>£{{ getAmount(plan.priceDetails.tiers[0].flat_amount) / 12 }} + VAT per month up to 50 users</span
										>
									</li>
									<li class="pb-2 text-sm">
										<span class="text-md leading-4"
											>Paid 12 months in advance £{{ getAmount(plan.priceDetails.tiers[0].flat_amount) }} + VAT</span
										>
									</li>
									<li class="pb-2 text-sm"><span class="text-md leading-4">Minimum 12 month Contract</span></li>
									<li class="pb-2 text-sm"><span class="text-md leading-4">Subject to terms and conditions</span></li>
								</ul>
							</div>

							<div v-if="plan.name == 'Monthly'">
								<ul class="text-left list-disc pl-4">
									<li class="pb-2 text-sm">
										<span class="text-md"
											>£{{ getAmount(plan.priceDetails.tiers[0].flat_amount) }} + VAT per month up to 50 users</span
										>
									</li>
									<li class="pb-2 text-sm"><span class="text-md leading-4">12 equal monthly payments</span></li>
									<li class="pb-2 text-sm"><span class="text-md leading-4">Minimum 12 month Contract</span></li>
									<li class="pb-2 text-sm"><span class="text-md leading-4">Subject to terms and conditions</span></li>
								</ul>
							</div>

							<div class="text-center mt-4">
								<novok-button
									class=""
									:loading="selectLoading == plan.name ? true : false"
									type="info"
									:disabled="disabled"
									@click="selectPlan(plan)"
									>Select Plan</novok-button
								>
							</div>
						</div>
					</div>

					<div class="note bg-primary/10 border border-primary/50 text-sm p-2 rounded-md mt-7 text-primary">
						<ul>
							<li><b>Additional Users: </b>£{{ getAmount(plansList[0]?.priceDetails?.tiers[1]?.unit_amount) }} + VAT per month.</li>
							<li>Monthly plan will be auto renewed every month.</li>
							<li>
								Please contact
								<a href="mailto:buyingstation@novo-k.com " class="underline underline-offset-4 font-semibold text-blue-500"
									>buyingstation@novo-k.com</a
								>
								to discuss additional users.
							</li>
						</ul>
					</div>

					<div class="text-center font-normal mt-4 md:mt-6 lg:mt-8 2xl:mt-10">
						<span class="text-[#1294a8] font-bold cursor-pointer" to="#" @click="back()">&lt; Back to Sign Up</span>
					</div>
				</div>
			</div>
			<LoginFooter />
		</div>
	</div>
</template>

<script setup lang="ts">
	definePageMeta({
		layout: "empty",
	});

	useHead({
		title: "Select Plan",
	});

	const route = useRoute();
	const plansList = ref<any>([]);
	const selectLoading = ref<any>("");
	const signupUserId = ref<any>("");
	const disabled = ref<any>(false);
	const loading = ref<any>(false);

	onMounted(() => {
		signupUserId.value = route?.query?.signup_id;
		getPlanList();
	});

	const getPlanList = async () => {
		loading.value = true;
		try {
			const res: any = await useApiFetch("/plan-list", {
				method: "GET",
			});

			if (res.status) {
				plansList.value = res.data;
			}
		} catch {
		} finally {
			loading.value = false;
		}
	};

	const getAmount = (value: any) => {
		return value / 100;
	};

	const selectPlan = async (plan: any) => {
		selectLoading.value = plan.name;
		disabled.value = true;

		try {
			const res: any = await useApiFetch(`/update-plan/${signupUserId.value}`, {
				method: "POST",
				body: {
					plan_name: plan.name,
					price_id: plan.default_price,
				},
			});

			useToast("success", res?.message);
			navigateTo({
				path: "/check-out",
				query: {
					id: res?.data?.id,
					client_secret: res?.data?.client_secret,
				},
			});
		} catch {
		} finally {
			selectLoading.value = "";
			disabled.value = false;
		}
	};

	const back = () => {
		navigateTo({
			path: "/sign-up",
			query: {
				signup_id: route?.query?.signup_id,
			},
		});
	};
</script>

