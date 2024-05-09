<script setup lang="ts">
const props = defineProps({
  dialogVisible: Boolean,
  messageContent: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["dialogOkClick"]);
const centerDialogVisible = ref(false);
watch(
  () => props.dialogVisible,
  (currData) => {
    centerDialogVisible.value = currData;
  },
  { deep: true, immediate: true },
);

const okClick = () => {
  centerDialogVisible.value = false;
  emit("dialogOkClick", false);
};
</script>

<template>
  <el-dialog
    v-model="centerDialogVisible"
    class="max-w-[540px] w-[90%] text-center rounded-2xl lg:px-10 xl:px-24"
    center
    @close="okClick"
  >
    <div class="flex justify-center w-full">
      <NuxtImg format="webp" src="/images/loginModal.webp" alt="loginModal" />
    </div>
    <h1 class="text-3xl font-bold mb-5 mt-4 text-dark/100">Account Disabled</h1>
    <p>{{ messageContent }}</p>
    <template #footer>
      <span class="dialog-footer">
        <novok-button type="info" @click="okClick"> Ok </novok-button>
      </span>
    </template>
  </el-dialog>
</template>
