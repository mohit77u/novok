<template>
	<div>
		<v-chart ref="chart" class="chart" :option="option" style="height: 275px; width: 100%;" @click="handleChartClick" autoresize />
	</div>
</template>

<script lang="ts" setup>
	import { use } from "echarts/core";
	import { CanvasRenderer } from "echarts/renderers";
	import { UniversalTransition } from "echarts/features";
	import { BarChart } from "echarts/charts";
	import { TooltipComponent, DatasetComponent, GridComponent } from "echarts/components";
	import VChart, { THEME_KEY } from "vue-echarts";
	import moment from "moment";
	import { months } from "~/helper/data";
	const localePath = useLocalePath();

	use([CanvasRenderer, BarChart, TooltipComponent, DatasetComponent, GridComponent, UniversalTransition]);

	const props = defineProps({
		data: {
			type: Array,
			defualt: [],
		},
		dataKeys: {
			type: Array,
			defualt: [],
		},
		showLabel: {
			type: Boolean,
			defualt: false,
		},
	});

	const chart = ref<any>(null);
	const { t } = useI18n();

	// provide(THEME_KEY, "dark");

	const option = computed(() => {
		return {
			tooltip: {
				trigger: "item",
				formatter: function (params: any) {
					return `${params.marker}<b>${params.name}</b><br/>${params.value}`;
				},
				position: "inside",
			},
			grid: {
				left: "3%",
				right: "4%",
				bottom: "3%",
				containLabel: true,
				show: false,
			},
			xAxis: [
				{
					type: "category",
					data: props?.dataKeys,
					axisTick: {
						alignWithLabel: true,
					},
					axisLine: {
						show: true,
					},
					axisLabel: {
						fontSize: 13,
						color: "#545152cc",
					},
					splitLine: {
						show: false,
					},
				},
			],
			yAxis: [
				{
					type: "value",
					axisLabel: {
						fontSize: 13,
					},
					splitLine: {
						show: false,
					},
				},
			],

			series: [
				{
					type: "bar",
					barWidth: "60%",
					data: props.data,
					// barMinHeight: 15,
					barMaxWidth: 25,
					borderRadius: 5,
					itemStyle: {
						borderRadius: [50, 50, 0, 0],
					},
					label: {
						show: props.showLabel,
						position: "top",
						fontSize: 12,
						color: "#545152cc",
						fontWeight: "bold",
					},
				},
			],
			colorBy: "column",
			color: ["#ee6666", "#ee6666c2", "#ff8e28", "#ff8e28cc", "#008000d1", "#008000"],
			// gradientColor: ["#ee6666" ,"#008000"],
		};
	});

	const handleChartClick = (params: any) => {
		const pageDetails = JSON.parse(sessionStorage.getItem("pageDetails") || " {}");

		const [month, year] = params.name.split(" ");
		const monthValue = Object.keys(months).find((key) => months[key] == month);

		pageDetails.noticeDueIntervals = year + "-" + monthValue;
		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));

		navigateTo(
			localePath({
				path: "/contracts",
			}),
			{ replace: true }
		);
	};
</script>

