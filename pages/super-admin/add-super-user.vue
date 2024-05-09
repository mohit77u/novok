<script setup lang="ts">
definePageMeta({
    middleware: ["auth", "is-super-admin"],
});
useHead({
  title: "Add BS Client Database",
});
</script>

<template>
  <superUserAddEditForm />
</template>
