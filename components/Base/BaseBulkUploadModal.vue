<script setup lang="ts">
	import { ContractData } from "~/helper/data";

	const props = defineProps({
		dialogVisible: Boolean,
		messageContent: {
			type: String,
			default: "",
		},
		dialogApi: {
			type: Function,
			default: null,
		},
		header: {
			type: String,
			default: "",
		},
	});
	const emit = defineEmits(["dialogOkClick", "dropdown-data"]);
	const centerDialogVisible = ref(false);
	const loading = ref(false);
	const supplierLeads = ref<any>([]);
	const clientManagers = ref<any>([]);
	const searchValue = ref("");
	const formData = reactive<any>({
		tenant_supplier_id: "",
		contract_owner_id: "",
		contract_type: 1,
	});

	onMounted(async () => {
		await getSupplierLeads(searchValue.value);
		await getClientManagers(searchValue.value);
	});

	watch(
		() => props.dialogVisible,
		(currData) => {
			centerDialogVisible.value = currData;
		},
		{ deep: true, immediate: true }
	);

	const okClick = () => {
		emit("dropdown-data", formData);
		loading.value = true;
		props.dialogApi();
		setTimeout(() => {
			loading.value = false;
		}, 2000);
	};

	const cancel = () => {
		centerDialogVisible.value = false;
		emit("dialogOkClick", false);
	};

	const getSupplierLeads = async (value: any) => {
		searchValue.value = value;
		// fullscreenLoading.value = true;
		try {
			const res: any = await useApiFetch(`/suppliers?searchValue=${value}`, {
				method: "GET",
			});
			supplierLeads.value = res.data?.map((data: any) => {
				return {
					label: data.full_name + " (" + data.company_name + ")",
					value: data.id,
				};
			});
		} catch {}
	};

	// const dropdownSelectedSupplierLead = (value: any) => {
	// 	formData.tenant_supplier_id = value;
	// 	emit("dropdown-data", formData);
	// };

	// const getSelectedSupplierLead = computed(() => {
	// 	return supplierLeads.value.find((data: any) => data.value === formData.tenant_supplier_id);
	// });

	const getClientManagers = async (value: any) => {
		searchValue.value = value;

		// fullscreenLoading.value = true;
		const res: any = await useApiFetch(`/contract-owners?perPage=${15}&searchValue=${value}`, {
			method: "GET",
		});
		clientManagers.value = res.data?.map((data: any) => {
			return {
				label: data.full_name + " (" + data.email + ")",
				value: data.id,
			};
		});
	};

	// const dropdownSelectedManagerValue = (value: any) => {
	// 	formData.contract_owner_id = value;
	// 	emit("dropdown-data", formData);
	// };

	// const getSelectedMangers = computed(() => {
	// 	return clientManagers.value.find((data: any) => data.value === formData.contract_owner_id);
	// });

	// const dropdownSelectedContractType = (value: any) => {
	// 	formData.contract_type = value;
	// 	emit("dropdown-data", formData);
	// };

	// const getSelectedContractType = computed(() => {
	// 	return ContractData.find((data: any) => data.value === formData.contract_type);
	// });
</script>

<template>
	<el-dialog
		v-model="centerDialogVisible"
		class="max-w-[540px] w-[90%] rounded-2xl"
		:title="header"
		:close-on-click-modal="false"
		center
		@close="cancel"
	>
		<p class="text-center font-bold">{{ messageContent }}</p>
		<el-form-item>
			<span class="text-dark font-bold">{{ "Contract Type" }}</span>
			<BaseSelectDropdown v-model="formData.contract_type" :dropdown-option="ContractData" :number-only="false" />
		</el-form-item>
		<el-form-item>
			<span class="text-dark font-bold">{{ "Add Supplier Name" }}</span>
			<BaseSelectDropdown
				v-model="formData.tenant_supplier_id"
				:dropdown-option="supplierLeads"
				:number-only="false"
				:isRemoteFilter="true"
				@remote-search="getSupplierLeads"
			/>
		</el-form-item>

		<el-form-item class="mt-2">
			<span class="text-dark font-bold">{{ "Add Contract Owner" }}</span>
			<BaseSelectDropdown
				v-model="formData.contract_owner_id"
				:dropdown-option="clientManagers"
				:number-only="false"
				:isRemoteFilter="true"
				@remote-search="getClientManagers"
			/>
		</el-form-item>
		<template #footer>
			<span class="dialog-footer">
				<novok-button @click="cancel" class="mr-3 btn-dark"> {{ $t("buttons.cancel") }} </novok-button>
				<novok-button type="info" @click="okClick" :loading="loading">
					{{ $t("buttons.add") }}
				</novok-button>
			</span>
		</template>
	</el-dialog>
</template>
