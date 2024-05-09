<script lang="ts" setup>
    import { ref } from "vue";

    import type { TabsPaneContext } from "element-plus";
    import { contractStore } from "~/store/contract";

    definePageMeta({
        middleware: ["auth", "is-client-admin"],
    });

    useHead({
        title: "Add Contract",
    });

    const activeTab = ref("primary-details");
    const disable = ref(true);
    const store = contractStore();

    const handleClick = (tab: TabsPaneContext) => {
        store.setActiveTab(tab.paneName);
    };

    const activeTabName = (value: any) => {
        activeTab.value = value;
    };

    const disableValue = (value: any) => {
        disable.value = value;
    };
</script>

<template>
    <div class="p-4">
        <div class="bg-[#fff]">
            <el-tabs v-model="activeTab" class="demo-tabs" @tab-click="handleClick">
                <el-tab-pane name="primary-details">
                    <template #label>
                        <div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
                            <BaseLabel :label="$t('formLabels.primary_details')"
                                :tooltip-content="$t('info.primary_details')" />
                        </div>
                    </template>
                    <ContractPrimaryDetails @active-tab-name="activeTabName" @disable="disableValue" />
                </el-tab-pane>
                <el-tab-pane name="upload-contract" :disabled="disable">
                    <template #label>
                        <div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
                            <BaseLabel :label="$t('formLabels.upload_contract')"
                                :tooltip-content="$t('info.upload_contract')" />
                        </div>
                    </template>
                    <ContractUploadContract />
                </el-tab-pane>
                <el-tab-pane name="secondary-details" :disabled="disable">
                    <template #label>
                        <div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
                            <BaseLabel :label="$t('formLabels.secondary_details')"
                                :tooltip-content="$t('info.secondary_details')" />
                        </div>
                    </template>
                    <ContractSecondaryDetails />
                </el-tab-pane>

                <el-tab-pane name="categorization" :disabled="disable">
                    <template #label>
                        <div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
                            <BaseLabel :label="$t('formLabels.categorisation')"
                                :tooltip-content="$t('info.categorisation')" />
                        </div>
                    </template>
                    <ContractCategories />
                </el-tab-pane>

                <el-tab-pane name="signatory-details" :disabled="disable">
                    <template #label>
                        <div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
                            <BaseLabel :label="$t('formLabels.signatory_details')"
                                :tooltip-content="$t('info.signatory_details')" />
                        </div>
                    </template>
                    <ContractSignatoryDetails />
                </el-tab-pane>

                <el-tab-pane name="additional-information" :disabled="disable">
                    <template #label>
                        <div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
                            <BaseLabel :label="$t('formLabels.supporting_information')"
                                :tooltip-content="$t('info.supporting_information')" />
                        </div>
                    </template>
                    <ContractAdditionalInformation />
                </el-tab-pane>

                <el-tab-pane name="supporting-documents" :disabled="disable">
                    <template #label>
                        <div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
                            <BaseLabel :label="$t('formLabels.supporting_documents')"
                                :tooltip-content="$t('info.supporting_documents')" />
                        </div>
                    </template>
                    <ContractSupportingDocuments />
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>
<style>
/* @import "~/assets/css/main.css"; */
</style>
