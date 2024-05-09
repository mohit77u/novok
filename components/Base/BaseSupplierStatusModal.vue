<script setup lang="ts">
	const props = defineProps({
		dialogVisible: Boolean,
	});

	const emit = defineEmits(["dialogOkClick"]);

	const centerDialogVisible = ref(false);
	const loading = ref(false);

	watch(
		() => props.dialogVisible,
		(currData) => {
			centerDialogVisible.value = currData;
		},
		{ deep: true, immediate: true }
	);

	const okClick = () => {
		loading.value = true;
	};

	const cancel = () => {
		centerDialogVisible.value = false;
		emit("dialogOkClick", false);
	};
</script>

<template>
	<el-dialog
		v-model="centerDialogVisible"
		class="max-w-[730px] w-[90%] rounded-2xl text-left"
		destroy-on-close
		align-center
		@close="cancel"
		title="Suppliers Status Information"
	>
		<div class="grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-3 p-6 -m-6 bg-dark/5 text-sm md:text-base">
			<div class="bg-white">
				<h1 class="bg-danger w-full text-white p-1 md:p-2 2xl:p-4 text-sm md:text-md lg:text-lg xl2:text-xl font-bold">
					{{ $t("dropdown_labels.unapproved_contracted") }}
				</h1>
				<div class="p-4">
					<ul class="list-disc ml-3">
						<li>{{ $t("supplierStatus.legacy_contract_in_place") }}</li>
						<li>{{ $t("supplierStatus.previously_used_poor_experience") }}</li>
						<li>{{ $t("supplierStatus.due_diligence_completed") }}</li>
						<li>{{ $t("supplierStatus.stackholders_not_engaged") }}</li>
						<li>{{ $t("supplierStatus.not_aligned_ethics_values") }}</li>
						<li>{{ $t("supplierStatus.delivery_late") }}</li>
						<li>{{ $t("supplierStatus.quality_not_fit") }}</li>
					</ul>
				</div>
			</div>

			<div class="bg-white">
				<h1 class="bg-[green] w-full text-white p-1 md:p-2 2xl:p-4 text-sm md:text-md lg:text-lg xl2:text-xl font-bold">
					{{ $t("dropdown_labels.approved_contracted") }}
				</h1>
				<div class="p-4">
					<ul class="list-disc ml-3">
						<li>{{ $t("supplierStatus.contract_in_place") }}</li>
						<li>{{ $t("supplierStatus.due_diligence_completed") }}</li>
						<li>{{ $t("supplierStatus.stackholder_engaged_good_feedback") }}</li>
						<li>{{ $t("supplierStatus.aligned_ethics_values") }}</li>
						<li>{{ $t("supplierStatus.delivery_on_time") }}</li>
						<li>{{ $t("supplierStatus.high_quality") }}</li>
					</ul>
				</div>
			</div>

			<div class="bg-white">
				<h1 class="bg-danger w-full text-white p-1 md:p-2 2xl:p-4 text-base md:text-md lg:text-lg 2xl:text-xl font-bold">
					{{ $t("dropdown_labels.uncontracted_unapproved") }}
				</h1>
				<div class="p-4">
					<ul class="list-disc ml-4">
						<li>{{ $t("supplierStatus.no_contract") }}</li>
						<li>{{ $t("supplierStatus.contract_out_of_date") }}</li>
						<li>{{ $t("supplierStatus.previously_used_poor_experience") }}</li>
						<li>{{ $t("supplierStatus.due_diligence_highighted_gaps") }}</li>
						<li>{{ $t("supplierStatus.stackholders_not_engaged") }}</li>
						<li>{{ $t("supplierStatus.no_agreed_po_terms") }}</li>
						<li>{{ $t("supplierStatus.not_aligned_ethics_values") }}</li>
						<li>{{ $t("supplierStatus.delivery_late") }}</li>
						<li>{{ $t("supplierStatus.quality_not_fit") }}</li>
					</ul>
				</div>
			</div>

			<div class="bg-white">
				<h1 class="bg-amber w-full text-white p-1 md:p-2 2xl:p-4 text-sm md:text-md lg:text-lg xl2:text-xl font-bold">
					{{ $t("dropdown_labels.approved_uncontracted") }}
				</h1>
				<div class="p-4">
					<ul class="list-disc ml-3">
						<li>{{ $t("supplierStatus.low_risk") }}</li>
						<li>{{ $t("supplierStatus.low_value") }}</li>
						<li>{{ $t("supplierStatus.due_diligence_completed") }}</li>
						<li>{{ $t("supplierStatus.stackholder_engaged_good_feedback") }}</li>
						<li>{{ $t("supplierStatus.acceptable_po_terms") }}</li>
						<li>{{ $t("supplierStatus.aligned_ethics_values") }}</li>
						<li>{{ $t("supplierStatus.delivery_on_time") }}</li>
						<li>{{ $t("supplierStatus.high_quality") }}</li>
					</ul>
				</div>
			</div>
		</div>
	</el-dialog>
</template>
