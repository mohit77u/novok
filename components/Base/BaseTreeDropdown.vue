<!-- eslint-disable vue/require-valid-default-prop -->
<script setup lang="ts">
const selectedValue = ref<any>("");
const props = defineProps({
  dropdownOption: {
    type: Array,
    default: [],
  },
  getSelectedData: {
    type: Array,
    default: [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
const dropdownSelectedValue = ref<any>([]);
const emit = defineEmits(["value-change"]);

watch(
  () => props.getSelectedData,
  (currData) => {
    selectedValue.value = currData.map((data: any) => data.label);
    dropdownSelectedValue.value = currData.map((data: any) => data.value);
  },
  { deep: true, immediate: true },
);

const handleCheck = (value: any) => {
  emit("value-change", value);
};
</script>

<template>
  <el-tree-select
    v-model="selectedValue"
    class="w-full"
    :data="dropdownOption"
    multiple
    :render-after-expand="false"
    show-checkbox
    default-expand-all
    filterable
    collapse-tags
    :disabled="disabled"
    :default-checked-keys="[1]"
    @check-change="handleCheckChange"
    @check="handleCheck"
  />
</template>
