<script lang="ts" setup>
	import { ref } from "vue";
	import { useAuthStore } from "~/store/auth";
	import { sidebarItemStore } from "~/store/sidebarItem";

	const store = sidebarItemStore();
	const authStore = useAuthStore();

	const getSidebar = computed(() => {
		return store.getSidebarOpen;
	});

	const isMobile = computed(() => {
		if (window.innerWidth < 1200) {
			return true;
		} else {
			return false;
		}
	});

	const formHeight = ref<any>(null);

	const bgColor = ref("");

	const changeColor = (value: string) => {
		isSettingToggle.value = false;
		applyTheme(value);
	};

	const isSettingToggle = ref(false);
	const settingToggle = () => {
		isSettingToggle.value = !isSettingToggle.value;
	};

	onMounted(async () => {

		if(window.screen.width >= 992) {
            formHeight.value = GetOffset("under", 16);
        }
		else{
			formHeight.value = GetOffset("under", 0);
		}

		const themeColor = useCookie("theme");
		applyTheme(themeColor.value ?? "147 83 162");
	});

	const applyTheme = (color_code: any) => {
		const themeColor = useCookie("theme");
		themeColor.value = color_code;
		bgColor.value = themeColor.value ?? color_code;
		document.documentElement.style.setProperty("--theme", themeColor.value ?? color_code);
	};
</script>

<template>
	<div class="flex flex-col flex-1">
		<div
			class="fixed right-0 z-[9999] top-1/3 -translate-y-1/2 shadow-lg rounded-bl-md transition-all"
			:class="[isSettingToggle ? 'translate-x-0' : 'translate-x-full']"
		>
			<div class="bg-white text-primary px-3 py-2 absolute -ml-[40px] rounded-l-md shadow-md cursor-pointer" @click="settingToggle()">
				<i class="fa-solid fa-gear animate-spin"></i>
			</div>

			<div class="p-4 grid grid-flow-row grid-cols-3 gap-4 z-10 relative bg-white rounded-bl-md">
				<span @click="changeColor('147, 83, 162')" :class="[bgColor === '147, 83, 162' ? 'rounded-full outline outline-offset-2 outline-primary':'rounded-md']" class="w-6 h-6 inline-block hover:rounded-full transition-all cursor-pointer" style="background-color: rgb(147, 83, 162)"></span>
                <span @click="changeColor('219, 0, 7')" :class="[bgColor === '219, 0, 7' ? 'rounded-full outline outline-offset-2 outline-primary':'rounded-md']" class="w-6 h-6 inline-block hover:rounded-full transition-all cursor-pointer" style="background-color: rgb(219, 0, 7)"></span>
				<!-- <span @click="changeColor('120, 63, 4')" :class="[bgColor === '120, 63, 4' ? 'rounded-full outline outline-offset-2 outline-primary':'rounded-md']" class="w-6 h-6 inline-block hover:rounded-full transition-all cursor-pointer" style="background-color: rgb(120, 63, 4)"></span> -->
				<span @click="changeColor('127, 96, 0')" :class="[bgColor === '127, 96, 0' ? 'rounded-full outline outline-offset-2 outline-primary':'rounded-md']" class="w-6 h-6 inline-block hover:rounded-full transition-all cursor-pointer" style="background-color: rgb(127, 96, 0)"></span>
				<span @click="changeColor('39, 78, 19')" :class="[bgColor === '39, 78, 19' ? 'rounded-full outline outline-offset-2 outline-primary':'rounded-md']" class="w-6 h-6 inline-block hover:rounded-full transition-all cursor-pointer" style="background-color: rgb(39, 78, 19)"></span>
				<span @click="changeColor('12, 52, 61')" :class="[bgColor === '12, 52, 61' ? 'rounded-full outline outline-offset-2 outline-primary':'rounded-md']" class="w-6 h-6 inline-block hover:rounded-full transition-all cursor-pointer" style="background-color: rgb(12, 52, 61)"></span>
				<span @click="changeColor('28, 69, 135')" :class="[bgColor === '28, 69, 135' ? 'rounded-full outline outline-offset-2 outline-primary':'rounded-md']" class="w-6 h-6 inline-block hover:rounded-full transition-all cursor-pointer" style="background-color: rgb(28, 69, 135)"></span>
				<span @click="changeColor('7, 55, 99')" :class="[bgColor === '7, 55, 99' ? 'rounded-full outline outline-offset-2 outline-primary':'rounded-md']" class="w-6 h-6 inline-block hover:rounded-full transition-all cursor-pointer" style="background-color: rgb(7, 55, 99)"></span>
				<span @click="changeColor('32, 18, 77')" :class="[bgColor === '32, 18, 77' ? 'rounded-full outline outline-offset-2 outline-primary':'rounded-md']" class="w-6 h-6 inline-block hover:rounded-full transition-all cursor-pointer" style="background-color: rgb(32, 18, 77)"></span>
				<span @click="changeColor('76, 17, 48')" :class="[bgColor === '76, 17, 48' ? 'rounded-full outline outline-offset-2 outline-primary':'rounded-md']" class="w-6 h-6 inline-block hover:rounded-full transition-all cursor-pointer" style="background-color: rgb(76, 17, 48)"></span>
			</div>
		</div>

	<div class="flex flex-col flex-1 bg-primary lg:py-4 lg:pr-4 mainsection" :class="getSidebar ? 'openMenu' : ''" @click="isSettingToggle = false">
		<LayoutHeader />
		<div
			id="under"
			class="app-wrapper flex flex-col flex-auto bg-white overflow-auto lg:rounded-b-3xl h-full bg-primary-light"
			:style="{ maxHeight: formHeight + 'px' }"
		>
			<LayoutSidebar />
			<slot />
		</div>
	</div>
</div>
</template>

<style>
	/* @import "~/assets/css/main.css"; */
</style>
