<template>
    <span class="header-label flex items-center">
        {{ props.column.label }} 
        <BaseLabel
            :tooltip-content="props.column.label"
        />
    </span>
</template>

<script setup lang="ts">

	const props = defineProps({
		column: {
			type: Object,
			default: {},
		},
    })
</script>
