<script setup lang="ts">
definePageMeta({
  // layout: "auth",
  middleware: ["auth", "is-super-user"],
});

useHead({
  title: "Edit Client Account Manager",
});
</script>

<template>
  <clientManagerAddEditForm />
</template>
