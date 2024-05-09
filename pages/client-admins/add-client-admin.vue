<script setup>
definePageMeta({
  // layout: "auth",
  middleware: ["auth", "is-super-user"],
});

useHead({
  title: "Add Client Admin",
});
</script>

<template>
  <clientAdminAddEditForm />
</template>
