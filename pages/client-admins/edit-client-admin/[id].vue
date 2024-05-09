<script setup>
definePageMeta({
  // layout: "auth",
  middleware: ["auth", "is-super-user"],
});

useHead({
  title: "Edit Client Admin",
});
</script>

<template>
  <clientAdminAddEditForm />
</template>
