<script lang="ts" setup>
    import type { TabsPaneContext } from "element-plus";
    import { supplierStore } from "~/store/supplier";

    definePageMeta({
        middleware: ["auth", "is-client-admin"],
    });

    useHead({
        title: "Add Supplier Admin",
    });

    const activeTab = ref("primary-details");
    const store = supplierStore();
    const fullscreenLoading = ref(false);
    const disable = ref(true);

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
    <div
        v-loading="fullscreenLoading"
        :class="{ 'overflow-hidden': fullscreenLoading }"
        class="p-4 min-h-full relative"
    >
        <el-tabs v-model="activeTab" class="demo-tabs" @tab-click="handleClick">
            <el-tab-pane name="primary-details">
                <template #label>
                    <div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
                        <BaseLabel
                            :label="$t('formLabels.primary_details')"
                            :tooltip-content="$t('info.primary_details')"
                            :isShowLabel="false"
                        />
                    </div>
                </template>
                <SupplierAdminNew
                    @active-tab-name="activeTabName"
                    @disable="disableValue"
                />
            </el-tab-pane>

            <el-tab-pane name="compliance-due-diligence" :disabled="disable">
                <template #label>
                    <div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
                        <BaseLabel
                            :label="$t('formLabels.compliance')"
                            :tooltip-content="$t('info.compliance')"
                            :isShowLabel="false"
                        />
                    </div>
                </template>
                <SupplierAdminCompliance />
            </el-tab-pane>

            <el-tab-pane name="reference" :disabled="disable">
                <template #label>
                    <div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
                        <BaseLabel
                            :label="$t('formLabels.reference-1')"
                            :tooltip-content="$t('info.reference-1')"
                        />
                    </div>
                </template>
                <SupplierAdminReference-1 />
            </el-tab-pane>

            <el-tab-pane name="supporting-documents" :disabled="disable">
                <template #label>
                    <div class="flex items-center px-4 py-2 lg:px-6 lg:py-4 header-label">
                        <BaseLabel
                            :label="$t('formLabels.documents')"
                            :tooltip-content="$t('info.documents')"
                        />
                    </div>
                </template>
                <SupplierAdminDocuments />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
