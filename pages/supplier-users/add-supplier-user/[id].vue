<script lang="ts" setup>
import type { TabsPaneContext } from "element-plus";
import { supplierStore } from "~/store/supplier";

definePageMeta({
    middleware: ["auth", "supplier", "is-supplier-admin", "is-client-admin"],
});

useHead({
  title: "Add Supplier User",
});

const activeTab = ref("supplier-user");
const store = supplierStore();
const fullscreenLoading = ref(false);
const disable = ref(true);

onMounted(() => {
  store.setActiveTab("supplier-user");
});

const activeTabName = (value: any) => {
  activeTab.value = value;
};

const disableValue = (value: any) => {
  disable.value = value;
};
</script>

<template>
    <div v-loading="fullscreenLoading" :class="{'overflow-hidden': fullscreenLoading}" class="p-4 min-h-full relative">
        <div class="bg-[#fff]">
            <SupplierUserPrimary
                @active-tab-name="activeTabName"
                @disable="disableValue"
            />
        </div>
    </div>
</template>
