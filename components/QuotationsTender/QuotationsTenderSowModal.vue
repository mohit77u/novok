<template>
	<el-dialog
		v-model="centerDialogVisible"
		class="max-w-[730px] w-[90%] rounded-2xl text-left"
		:center="true"
		top="0"
		@close="dialogClose"
		:close-on-click-modal="false"
		destroy-on-close
		:title="$t('header.generate_sow_sor_data')"
	>
		<el-form class="flex flex-col">
			<div id="super-admin-form">
				<div class="bg-[#fff]">
					<!-- step 1 form -->
					<div class="" v-if="step === 1">
						<!-- alert -->
						<div class="alert mb-4 border border-blue-200 bg-blue-50 rounded text-blue-500 text-sm w-full px-2 py-2">
							<b>{{ $t("placeholders.note") }}: </b>{{ $t("messages.ai_modal") }}
						</div>
						<div class="grid md:grid-cols-12 gap-5 lg:gap-6">
							<div class="md:col-span-6 lg:col-span-6 mb-0">
								<div class="flex items-center w-full">
									<span class="text-dark text-[16px] font-bold flex items-center">
										<span>
											{{ $t("formLabels.is_goods_or_service") }}
											<span class="text-red-500">*</span>
										</span>
									</span>
									<BaseLabel :tooltip-content="$t('info.is_goods_or_service')" />
								</div>
								<el-radio-group class="flex-col items-start" v-model="formData.is_goods_or_service">
									<el-radio class="!mr-0 mt-2 mb-1" :label="1" size="large">{{ $t("formLabels.product") }}</el-radio>
									<el-radio :label="0" size="large">{{ $t("formLabels.service") }}</el-radio>
								</el-radio-group>
							</div>

							<el-form-item
								v-if="formData.is_goods_or_service == 1"
								class="md:col-span-12 lg:col-span-12 mb-0"
								:rules="[{ required: formData.is_goods_or_service == 1 ? true : false }]"
								:label="$t('formLabels.product_description')"
							>
								<template #label>
									<BaseLabel :label="$t('formLabels.product_description')" :tooltip-content="$t('info.product_description')" />
								</template>
								<el-input
									v-model="formData.product_description"
									type="textarea"
									name="product_description"
									:autosize="{
										minRows: 5,
										maxRows: 5,
									}"
									:class="{
										error: v$.product_description.$error,
									}"
								/>
								<span v-if="v$.product_description.$error" class="text-xs text-red-500 mt-2">{{
									v$.product_description.$errors[0].$message
								}}</span>
							</el-form-item>

							<el-form-item
								v-if="formData.is_goods_or_service == 0"
								class="md:col-span-12 lg:col-span-12 mb-0"
								:rules="[{ required: formData.is_goods_or_service == 0 ? true : false }]"
								:label="$t('formLabels.service_description')"
							>
								<template #label>
									<BaseLabel :label="$t('formLabels.service_description')" :tooltip-content="$t('info.service_description')" />
								</template>
								<el-input
									v-model="formData.service_description"
									type="textarea"
									name="service_description"
									:autosize="{
										minRows: 5,
										maxRows: 5,
									}"
									:class="{
										error: v$.service_description.$error,
									}"
								/>
								<span v-if="v$.service_description.$error" class="text-xs text-red-500 mt-2">{{
									v$.service_description.$errors[0].$message
								}}</span>
							</el-form-item>

							<!-- <el-form-item
								class="md:col-span-6 lg:col-span-6 mb-0"
								:rules="[{ required: true }]"
								:label="$t('formLabels.project_objective')"
							>
								<template #label>
									<BaseLabel :label="$t('formLabels.project_objective')" :tooltip-content="$t('info.project_objective')" />
								</template>
								<el-input
									v-model="formData.project_objective"
									type="text"
									name="project_objective"
									:class="{
										error: v$.project_objective.$error,
									}"
								/>
								<span v-if="v$.project_objective.$error" class="text-xs text-red-500 mt-2">{{
									v$.project_objective.$errors[0].$message
								}}</span>
							</el-form-item>

                            <el-form-item
								class="md:col-span-6 lg:col-span-6 mb-0"
								:rules="[{ required: true }]"
								:label="$t('formLabels.deliverables')"
							>
								<template #label>
									<BaseLabel :label="$t('formLabels.deliverables')" :tooltip-content="$t('info.deliverables')" />
								</template>
								<el-input
									v-model="formData.deliverables"
									type="text"
									name="deliverables"
									:class="{
										error: v$.deliverables.$error,
									}"
								/>
								<span v-if="v$.deliverables.$error" class="text-xs text-red-500 mt-2">{{
									v$.deliverables.$errors[0].$message
								}}</span>
							</el-form-item>

                            <el-form-item
								class="md:col-span-6 lg:col-span-6 mb-0"
								:rules="[{ required: true }]"
								:label="$t('formLabels.timeline')"
							>
								<template #label>
									<BaseLabel :label="$t('formLabels.timeline')" :tooltip-content="$t('info.timeline')" />
								</template>
								<el-input
									v-model="formData.timeline"
									type="text"
									name="timeline"
									:class="{
										error: v$.timeline.$error,
									}"
								/>
								<span v-if="v$.timeline.$error" class="text-xs text-red-500 mt-2">{{
									v$.timeline.$errors[0].$message
								}}</span>
							</el-form-item>

                            <el-form-item
								class="md:col-span-6 lg:col-span-6 mb-0"
								:rules="[{ required: false }]"
								:label="$t('formLabels.any_special_condition')"
							>
								<template #label>
									<BaseLabel :label="$t('formLabels.any_special_condition')" :tooltip-content="$t('info.any_special_condition')" />
								</template>
								<el-input
									v-model="formData.any_special_conditions"
									type="text"
									name="any_special_condition"
								/>
							</el-form-item>

                            <el-form-item
								class="md:col-span-6 lg:col-span-6 mb-0"
								:rules="[{ required: false }]"
								:label="$t('formLabels.sla')"
							>
								<template #label>
									<BaseLabel :label="$t('formLabels.sla')" :tooltip-content="$t('info.SLAs')" />
								</template>
								<el-input
									v-model="formData.slas"
									type="text"
									name="slas"
								/>
							</el-form-item> -->
						</div>

						<div class="pt-4 text-right">
							<novok-button class="btn-dark my-1" @click.prevent="dialogClose">
								<span class="hidden sm:inline-block"> {{ $t("buttons.cancel") }}</span
								><i class="fa-solid fa-xmark sm:hidden"></i>
							</novok-button>

							<novok-button class="my-1" type="info" :loading="loadingSave" :disabled="loadingSave" @click="handleGenerateData()">
								{{ $t("buttons.save") }}
							</novok-button>
						</div>
					</div>

					<!-- step 2 prompt editor -->
					<div class="" v-else>
						<div class="grid grid-cols-1 gap-3">
							<div>
								<BaseLabel
									class="font-bold text-[16px] inline-block mb-2"
									:label="$t('formLabels.prompt')"
									:tooltip-content="$t('info.prompt')"
								/>

								<CkEditor v-model="finalPrompt" :config="editorConfig" />

								<span v-if="finalPrompt.trim().length == 0" class="text-xs text-red-500 mt-2">
									{{ $t("formValidations.prompt_empty") }}
								</span>
							</div>
						</div>

						<div class="pt-4 text-right">
							<novok-button class="btn-dark my-1" @click="step = 1">
								<span class="hidden sm:inline-block"> {{ $t("buttons.back") }}</span
								><i class="fa-solid fa-xmark sm:hidden"></i>
							</novok-button>

							<novok-button class="my-1" type="info" :loading="loadingSave" :disabled="loadingSave" @click="handleCreateDocument()">
								{{ $t("buttons.save") }}
							</novok-button>
						</div>
					</div>
				</div>
			</div>
		</el-form>
	</el-dialog>
</template>


<script setup lang="ts">
	import moment from "moment";
	import { useVuelidate } from "@vuelidate/core";
	import { required, email, minLength, maxLength, helpers, requiredIf } from "@vuelidate/validators";

	const props = defineProps({
		dialogVisible: Boolean,
	});

	const emit = defineEmits(["dialog-ok-click", "update-sow"]);
	const centerDialogVisible = ref<any>(false);
	const fullscreenLoading = ref<any>(false);
	const loadingSave = ref<any>(false);
	const disabled = ref<any>(false);
	const step = ref<any>(1);
	const { t } = useI18n();

	const formData = reactive<any>({
		is_goods_or_service: 1,
		product_description: "",
		service_description: "",
		// project_objective: "",
		// deliverables: "",
		// timeline: "",
		// any_special_conditions: "",
		// slas: "",
	});

	const editorConfig = ref<any>({
		toolbar: {
			items: [
				"undo",
				"redo",
				"|",
				"bold",
				"italic",
				"|",
				"heading",
				"|",
				"blockQuote",
				"bulletedList",
				"numberedList",
				"|",
				// 'link',
				"outdent",
				"indent",
			],
		},
	});

	const finalPrompt = ref<any>("");

	const rules = computed(() => {
		return {
			product_description: {
				requiredIf: helpers.withMessage(
					t("formValidations.product_description"),
					requiredIf(() => {
						return formData.is_goods_or_service === 1;
					})
				),
			},
			service_description: {
				requiredIf: helpers.withMessage(
					t("formValidations.service_description"),
					requiredIf(() => {
						return formData.is_goods_or_service === 0;
					})
				),
			},
			// project_objective: {
			// 	required: helpers.withMessage(t("formValidations.project_objective"), required),
			// },
			// deliverables: {
			// 	required: helpers.withMessage(t("formValidations.deliverables"), required),
			// },
			// timeline: {
			// 	required: helpers.withMessage(t("formValidations.timeline"), required),
			// },
		};
	});

	const v$ = useVuelidate(rules, formData);

	watch(
		() => props.dialogVisible,
		(currData) => {
			centerDialogVisible.value = currData;
		},
		{ deep: true, immediate: true }
	);

	onMounted(async () => {});

	const dialogClose = () => {
		centerDialogVisible.value = false;
		emit("dialog-ok-click", false);
	};

	const handleGenerateData = async () => {
		v$.value.$validate();

		if (!v$.value.$error) {
			disabled.value = true;
			loadingSave.value = true;

			let prompt = preparePrompt();

			try {
				const res: any = await useApiFetch(`/get-prompt-data`, {
					method: "POST",
					body: { prompt: prompt },
				});

                if(res.status) {
                    finalPrompt.value = res.data;
                    finalPrompt.value = finalPrompt.value.replace(/\n/g, "<br>");
                    step.value = 2;
                } else {
                    useToast("error", res.message);
                }

			} catch {
				disabled.value = false;
				loadingSave.value = false;
			} finally {
				disabled.value = false;
				loadingSave.value = false;
			}
		}
	};

	const updateSow = (data: any) => {
		centerDialogVisible.value = false;
		emit("update-sow", data);
		emit("dialog-ok-click", false);
	};

	// prepare prompt
	const preparePrompt = () => {
		let prompt = "";

		if (formData.is_goods_or_service == 1) {
			prompt += `Act as an expert in building professional specification documents. This document will be downloaded directly and will be shared. Create a Goods specifcation document. The details are - [product_description]. 
            
            The following information should be considered in the Statement of Requirements for Goods:

            Design and performance criteria
            Compatibility and Standardisation
            Acceptance testing
            Trade-ins
            `;
		} else {
			prompt += `Act as an expert in building professional specification documents. This document will be downloaded directly and will be shared. Create a Service specifcation document. The details are - [service_description]. 
            
            The following information should be considered in the Statement of Requirements for services:		

            Outputs to be delivered		
            Performance measures		
            Targets		
            Contract supplier management		
            Transfer of assets and personnel		
            The hand-over process		
            Transition between service providers	
            `;
		}

		// prompt += `It will help in [project_objective].
		//     The deliverables are [deliverables].
		//     The timeline for this project is [timeline].`;

		// if(formData.any_special_conditions) {
		//     prompt += `The special condition to be included in the specification document is [any_special_conditions]. `;
		// }

		// if(formData.slas) {
		//     prompt += `The important SLAs to be included are [slas]. `;
		// }

		prompt += `
                    The specification will be between a supplier and a client.Supplier is a company who is going to provide services.Customer is the company who is going to take the services from supplier. The specification document should have following points 1. Introduction 2. Specifications 3. Support Services 4. Delivery requirements 5. Timeline 6. Terms and conditions 7. Payment terms 8.Conclusion. Also add signatory details in the end. Format the document in a professional way. The Data should be in this format  'Introduction:introduction of document,'Specifications','specification of document','Technical_Requirements':'technical requirements','Display':'display of product','Connectivity':'connectivity of product','Security':'security of product','Durability_Portability':'Durability and Portability of product','Additional_Features':'Additional Features','Warranty_Support:':'Warranty and Support:','Budget_Procurement_Process:'Budget and Procurement Process','Implementation_Deployment':'Implementation andDeployment','Conclusion':'Conclusion'
            `;

		let replacedPrompt = replacePlaceholders(prompt, formData);
		return replacedPrompt;
	};

	// replace placeholders
	const replacePlaceholders = (text: String, values: any) => {
		for (const key in values) {
			if (values.hasOwnProperty(key)) {
				const regex = new RegExp(`\\[${key}\\]`, "g");
				text = text.replace(regex, values[key]);
			}
		}
		return text;
	};

	// handleCreateDocument
	const handleCreateDocument = async () => {
		try {
			disabled.value = true;
			loadingSave.value = true;

			// replace goblly <br> with <br/> in prompt
			const data = finalPrompt.value.replace(/<br>/g, "<br/>");

			const res: any = await useApiFetch(`/generate-docx`, {
				method: "POST",
				body: { prompt: data },
			});

			const documentPath = res?.data?.document_path;

			if (documentPath) {
				window.open(documentPath, "_blank");
			}

			updateSow(res?.data);
		} catch {
			disabled.value = false;
			loadingSave.value = false;
		} finally {
			disabled.value = false;
			loadingSave.value = false;
		}
	};
</script>
