<template>
	<div class="h-full p-4" v-loading="fullscreenLoading">
		<div class="text-left pb-2">
			<div class="text-primary hover:underline cursor-pointer" @click="dataLoaded = !dataLoaded">
				{{ $t("labels.import_spend_analysis_data") }}
			</div>
		</div>

		<!-- show upload button if date is not available -->
		<template v-if="!dataLoaded">
			<div class="text-left pb-2">
				<div class="text-primary flex hover:underline cursor-pointer" @click="downloadTemplete">
					{{ $t("labels.download_example_xlsx_file") }}
					<base-md-loder v-if="isDownloadTemplete" class="ml-4" />
				</div>
			</div>

			<div class="upload">
				<base-upload-spend-analysis
					:id="'upload_file'"
					:limit="1"
					v-model="formParams.upload_file"
					:form-data="formParams.upload_file"
					name="upload_file"
					:customClass="{
						error: v$.upload_file.$error,
					}"
					@upload-file="uploadFile"
					@handle-remove="handleRemove"
					@blur="v$.upload_file.$touch"
				/>
				<span v-if="v$.upload_file.$error" class="text-xs text-red-500 mt-2">{{ v$.upload_file.$errors[0].$message }}</span>
			</div>

			<!-- buttons -->
			<div class="pt-6 pb-6 text-right">
				<novok-button :disabled="formLoading || loadingSave" class="btn-dark my-1" @click.prevent="dataLoaded = true"
					><span class="hidden sm:inline-block">{{ $t("buttons.cancel") }}</span
					><i class="fa-solid fa-xmark sm:hidden"></i
				></novok-button>

				<novok-button class="my-1" type="info" :loading="loadingSave" :disabled="loadingSave || formLoading" @click.prevent="onSubmit()"
					>{{ $t("buttons.save") }}
				</novok-button>
			</div>
		</template>

		<!-- show charts if date is available -->
		<template v-else>
			<div class="mt-6 chart-option xl:w-6/12 md:w-6/12 w-full mb-6">
				<label class="font-bold mb-3" for="charts">{{ $t("formLabels.select_charts") }}</label>
				<div class="flex">
					<BaseMultiSelectDropdown
						id="charts"
						name="charts"
						size="small"
						:collapse-tag="false"
						:dropdown-option="spendTrackerOptions"
						:get-selected-client="getSelectedChartData"
						@selected-value="dropdownSelectedChart"
					/>

					<!-- Button for fetch Charts -->
					<novok-button class="ml-6" type="info" @click.prevent="fetchCharts()">{{ $t("buttons.fetch_charts") }} </novok-button>
				</div>
			</div>

			<!-- If not any option selected from dropdown select it tag like select any option form dropdown -->
			<div v-if="!selectedChartValue.length" class="text-center text-gray-500">{{ $t("labels.select_any_option_from_dropdown") }}</div>

			<!-- yearly spend chart -->
			<template v-if="chartsData?.yearly_spend">
				<h3 class="mb-2 text-xl font-bold">{{ $t("header.yearly_spend") }}</h3>
				<div v-if="chartsData?.yearly_spend?.length" class="w-full grid grid-cols-12 gap-5 lg:gap-6">
					<div class="rounded-lg p-3 border shadow col-span-12 lg:col-span-6 xl:col-span-6 mb-0">
						<spend-tracker-bar-chart :data="chartsData?.yearly_spend" />
					</div>
				</div>
				<div v-else>
					<div class="text-center text-gray-500">{{ $t("labels.no_data_available") }}</div>
				</div>
			</template>

			<!-- monthly spend chart -->
			<template v-if="chartsData?.monthly_spend">
				<h3 class="mb-2 mt-8 text-xl font-bold">{{ $t("header.monthly_spend") }}</h3>
				<div v-if="Object.keys(chartsData?.monthly_spend).length" class="w-full grid grid-cols-12 gap-5 lg:gap-6">
					<div
						v-for="(data, index) in chartsData?.monthly_spend"
						:key="`monthly_${index}`"
						class="rounded-lg border shadow col-span-12 lg:col-span-6 xl:col-span-6 mb-0"
					>
						<div class="p-3 border-b">
							<h3 class="text-lg text-center font-bold">{{ index }}</h3>
						</div>
						<div class="p-3">
							<spend-tracker-bar-monthly-chart :data="data" />
						</div>
					</div>
				</div>
				<div v-else>
					<div class="text-center text-gray-500">{{ $t("labels.no_data_available") }}</div>
				</div>
			</template>

			<!-- top 10 suppliers chart -->
			<template v-if="chartsData?.top_10_suppliers">
				<h3 class="mb-2 mt-8 text-xl font-bold">{{ $t("header.top_10_suppliers") }}</h3>
				<div v-if="Object.keys(chartsData?.top_10_suppliers).length" class="w-full grid grid-cols-12 gap-5 lg:gap-6 pb-4">
					<div
						v-for="(data, index) in chartsData?.top_10_suppliers"
						:key="`monthly_${index}`"
						class="rounded-lg border shadow col-span-12 lg:col-span-6 xl:col-span-6 mb-0"
					>
						<div class="p-3 border-b">
							<h3 class="text-lg text-center font-bold">{{ index }}</h3>
						</div>
						<div class="p-3">
							<spend-tracker-bar-chart-top-sup :data="data" />
						</div>
					</div>
				</div>
				<div v-else>
					<div class="text-center text-gray-500">{{ $t("labels.no_data_available") }}</div>
				</div>
			</template>
		</template>
	</div>
</template>

<script setup lang="ts">
	import useVuelidate from "@vuelidate/core";
	import { helpers, required } from "@vuelidate/validators";

	definePageMeta({
		middleware: ["auth", "is-client-admin"],
	});

	useHead({
		title: "Spend Tracker",
	});
	const router = useRouter();
	const fullscreenLoading = ref<any>(false);
	const dataLoaded = ref<any>(true);
	const selectedChartValue = ref<any>([]);
	const formParams = reactive({
		upload_file: "",
	});
	const { t } = useI18n();
	const loadingSave = ref(false);
	const disable = ref(false);
	const formLoading = ref(false);
	const localePath = useLocalePath();
	const spendTrackerData = ref<any>([]);
	const spendTrackerOptions = ref<any>([]);
	const chartsData = ref<any>([]);
	const isDownloadTemplete = ref(false);

	onMounted(async () => {
		await getSpendTrackerOptions();
		await getcharts();
	});

	const rules = computed(() => {
		return {
			upload_file: {
				required: helpers.withMessage(t("formValidations.xlsx_file"), required),
			},
		};
	});

	const v$ = useVuelidate(rules, formParams);

	const getSpendTrackerOptions = async () => {
		try {
			fullscreenLoading.value = true;
			const response = await useApiFetch("/spend-analysis-graph/fetch/drop-down-list", {
				method: "GET",
			});

			spendTrackerData.value = response.data;
			spendTrackerOptions.value = response.data?.map((val: any) => {
				return {
					label: val.name,
					value: val.id,
				};
			});
		} catch (error) {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const dropdownSelectedChart = (value: any) => {
		selectedChartValue.value = value;
	};

	const getSelectedChartData = computed(() => {
		const selectDropdown = spendTrackerData.value.filter((val: any) => {
			return val.status === 1;
		});

		selectedChartValue.value = selectDropdown?.map((val: any) => {
			return val.id;
		});

		return selectDropdown?.map((val: any) => {
			return {
				label: val.name,
				value: val.id,
			};
		});
	});

	const fetchCharts = async (val: any) => {
		try {
			fullscreenLoading.value = true;
			await useApiFetch("/spend-analysis-graph/update/drop-down-list", {
				method: "POST",
				body: {
					id: selectedChartValue.value,
				},
			});

			await getcharts();
		} catch {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const downloadTemplete = async () => {
		try {
			isDownloadTemplete.value = true;
			const response = await useApiFetch("/spend-analysis/download-template", {
				method: "GET",
			});

			const link: any = document.createElement("a");
			link.download = "file";
			link.href = response.data.export_link;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			useToast("success", response?.message, 8000);
		} catch (error) {
		} finally {
			isDownloadTemplete.value = false;
		}
	};

	const uploadFile = async (data: any) => {
		formParams.upload_file = data.file;
	};

	const handleRemove = () => {
		formParams.upload_file = "";
	};

	const getcharts = async () => {
		try {
			fullscreenLoading.value = true;
			const response = await useApiFetch("/spend-analysis/charts", {
				method: "GET",
			});

			chartsData.value = response.data;
		} catch (error) {
		} finally {
			fullscreenLoading.value = false;
		}
	};

	const onSubmit = async () => {
		try {
			v$.value.$validate();
			if (!v$.value.$error) {
				loadingSave.value = true;

				const postFormData = new FormData();
				Object.entries(formParams).forEach(([key, value]) => {
					postFormData.append(key, value);
				});

				const res = await useApiFetch("/spend-analysis/upload", {
					method: "POST",
					body: postFormData,
					headers: {
						ContentType: "multipart/form-data",
					},
				});

				useToast("success", res?.message);

				formParams.upload_file = "";
				v$.value.$reset();
				dataLoaded.value = true;
				await getcharts();
			}
		} catch (error) {
		} finally {
			loadingSave.value = false;
		}
	};
</script>
