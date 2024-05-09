<script setup lang="ts">
definePageMeta({
  // layout: "auth",
  middleware: ["auth", "is-super-user"],
});

useHead({
  title: "Add Client Account Manager",
});
</script>

<template>
  <clientManagerAddEditForm />
</template>
