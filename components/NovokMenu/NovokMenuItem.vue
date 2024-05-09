<script setup lang="ts">
const props = defineProps({
    label: {
        type: String,
        default: "",
    },
    icon: {
        type: String,
        default: "",
    },
    isShowComing: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["click"]);

	const handleClick = () => {
        emit("click");
    };

</script>

<template>
    <el-tooltip effect="dark" :content="label" placement="top" :show-after="1000" :hide-after="10">
        <el-menu-item
            dir="ltr"
            :router="true"
            :class="{ 'is-custom-active': isActive }"
            @click="handleClick"
        >
            <div class="topCorner"></div>
            <i :class="icon" class="fa-fw"></i>
            <template #title>
                <span class="ml-3 sidebarTitle">
                    {{ label }}
                </span>
                <icons-coming-soon
                    v-if="isShowComing"
                    class="h-10 sidebarTitle"
                    :class="[isActive ? 'text-primary' : 'text-white']"
                />
            </template>
            <div class="bottomCorner"></div>
        </el-menu-item>
    </el-tooltip>
</template>
