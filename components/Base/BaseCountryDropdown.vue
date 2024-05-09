<!-- eslint-disable vue/require-valid-default-prop -->
<script lang="ts" setup>
const selectedValue = ref<any>({
  label: "",
  value: "",
});
const props = defineProps({
  dropdownOption: {
    type: Array,
    default: [],
  },
  getSelectedCountry: {
    type: Object,
    default: {},
  },

  disabled: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["selected-value"]);

const change = (val: any) => {
  emit("selected-value", val);
};

watch(
  () => props.getSelectedCountry,
  (currData) => {
    selectedValue.value = currData?.value || "";
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <el-select
    v-model="selectedValue"
    class="w-full"
    filterable
    :disabled="disabled"
    :default-first-option="false"
    @change="change"
    @keypress="NumbersOnly"
  >
    <el-option
      v-for="item in dropdownOption"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>
