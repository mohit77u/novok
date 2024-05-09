<script setup lang="ts">
definePageMeta({
    middleware: ["auth"],
});
</script>
<template>
    <div class="p-6 grid grid-flow-col grid-cols-4">
        <el-input placeholder="Please input" />
        <el-input :rows="2" type="textarea" placeholder="Please input" />
        <el-select placeholder="Select" style="width: 240px">
            <el-option label="item.label" value="item.value" />
        </el-select>
        <el-date-picker type="date" placeholder="Pick a day" />
    </div>
</template>
