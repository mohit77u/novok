<script setup lang="ts">
const localePath = useLocalePath();
const { t } = useI18n();

const props = defineProps({
    id: {
        type: Number,
        default: null,
    },
});
</script>

<template>
    <el-popover
        popper-class="!p-0 !rounded-lg overflow-hidden !border-0"
        placement="left-start"
        :width="320"
        trigger="click"
        content="this is content, this is content, this is content"
    >
        <template #reference>
            <span
                class="ml-2 cursor-pointer"
                :class="
                    id == 3
                        ? 'text-success'
                        : id == 4
                        ? 'text-[#ff8e28]'
                        : id == 2
                        ? 'text-danger'
                        : 'text-danger'
                "
            >
                <i class="fa-regular fa-circle-info"></i>
            </span>
        </template>
        <div class="text-sm 2xl:text-base">
            <div v-if="id == 3">
                <h1 class="md:px-2 2xl:px-4 py-1 2xl:py-2 bg-success text-white text-lg 2xl:text-xl font-bold">
                    {{ $t("dropdown_labels.approved_contracted") }}
                </h1>
                <div class="2xl:p-4 p-2">
                    <ul class="list-disc ml-4">
                        <li>{{ $t('supplierStatus.contract_in_place') }}</li>
                        <li>{{ $t('supplierStatus.due_diligence_completed') }}</li>
                        <li>{{ $t('supplierStatus.stackholder_engaged_good_feedback') }}</li>
                        <li>{{ $t('supplierStatus.aligned_ethics_values') }}</li>
                        <li>{{ $t('supplierStatus.delivery_on_time') }}</li>
                        <li>{{ $t('supplierStatus.high_quality') }}</li>
                    </ul>
                </div>
            </div>

            <div v-if="id == 4">
                <h1 class="md:px-2 2xl:px-4 py-1 2xl:py-2 bg-[#ff8e28] text-white text-lg 2xl:text-xl font-bold">
                    {{ $t("dropdown_labels.approved_uncontracted") }}
                </h1>
                <div class="2xl:p-4 p-2">
                    <ul class="list-disc ml-4">
                        <li>{{ $t('supplierStatus.low_risk') }}</li>
                        <li>{{ $t('supplierStatus.low_value') }}</li>
                        <li>{{ $t('supplierStatus.due_diligence_completed') }}</li>
                        <li>{{ $t('supplierStatus.stackholder_engaged_good_feedback') }}</li>
                        <li>{{ $t('supplierStatus.acceptable_po_terms') }}</li>
                        <li>{{ $t('supplierStatus.aligned_ethics_values') }}</li>
                        <li>{{ $t('supplierStatus.delivery_on_time') }}</li>
                        <li>{{ $t('supplierStatus.high_quality') }}</li>
                    </ul>
                </div>
            </div>

            <div v-if="id == 2">
                <h1 class="md:px-2 2xl:px-4 py-1 2xl:py-2 bg-danger text-white text-lg 2xl:text-xl font-bold">{{ $t("dropdown_labels.unapproved_contracted") }}</h1>
                <div class="2xl:p-4 p-2">
                    <ul class="list-disc ml-4">
                        <li>{{ $t('supplierStatus.legacy_contract_in_place') }}</li>
                        <li>{{ $t('supplierStatus.previously_used_poor_experience') }}</li>
                        <li>{{ $t('supplierStatus.due_diligence_completed') }}</li>
                        <li>{{ $t('supplierStatus.stackholders_not_engaged') }}</li>
                        <li>{{ $t('supplierStatus.not_aligned_ethics_values') }}</li>
                        <li>{{ $t('supplierStatus.delivery_late') }}</li>
                        <li>{{ $t('supplierStatus.quality_not_fit') }}</li>
                    </ul>
                </div>
            </div>

            <div v-if="id == 1">
                <h1 class="md:px-2 2xl:px-4 py-1 2xl:py-2 bg-danger text-white text-lg 2xl:text-xl font-bold">{{ $t("dropdown_labels.uncontracted_unapproved") }}</h1>
                <div class="2xl:p-4 p-2">
                    <ul class="list-disc ml-4">
                        <li>{{ $t('supplierStatus.no_contract') }}</li>
                        <li>{{ $t('supplierStatus.contract_out_of_date') }}</li>
                        <li>{{ $t('supplierStatus.previously_used_poor_experience') }}</li>
                        <li>{{ $t('supplierStatus.due_diligence_highighted_gaps') }}</li>
                        <li>{{ $t('supplierStatus.stackholders_not_engaged') }}</li>
                        <li>{{ $t('supplierStatus.no_agreed_po_terms') }}</li>
                        <li>{{ $t('supplierStatus.not_aligned_ethics_values') }}</li>
                        <li>{{ $t('supplierStatus.delivery_late') }}</li>
                        <li>{{ $t('supplierStatus.quality_not_fit') }}</li>
                    </ul>
                </div>
            </div>
        </div>
    </el-popover>
</template>

function $t(arg0: string): any { throw new Error("Function not implemented."); }
function $t(arg0: string): any { throw new Error("Function not implemented."); }
