<template>
	<div>
		<v-chart ref="chart" class="chart" :option="option" style="height: 300px; width: 100%" />
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
	const localePath = useLocalePath();

	use([CanvasRenderer, BarChart, TooltipComponent, DatasetComponent, GridComponent, UniversalTransition]);

	const props = defineProps({
		data: {
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
					if (params.value == "0.1") {
						return `${params.marker}<b>${params.name}</b><br/>0`;
					} else {
						return `${params.marker}<b>${params.name}</b><br/>${params.value}`;
					}
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
					data: chartLabels.value,
					axisTick: {
						alignWithLabel: true,
					},
					axisLine: {
						show: true,
					},
					axisLabel: {
						fontSize: 12,
						rotate: 20,
						margin: 20,
						align: "center",
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
						fontSize: 12,
						formatter: function (value: any) {
							return abbreviateNumber(value);
						},
					},
					splitLine: {
						show: false,
					},
				},
			],
			series: [
				{
					name: "Direct",
					type: "bar",
					barWidth: "60%",
					data: chartValues.value, // props.data,
					barMinHeight: 30,
					barMaxWidth: 50,
					borderRadius: 5,
					itemStyle: {
						borderRadius: [50, 50, 0, 0],
					},
					label: {
						show: true,
						position: "inside",
						align: "center",
						rotate: 90,
						verticalAlign: "middle",
						fontSize: 12,
						color: "#fff",
						fontWeight: "bold",
						formatter: function (params: any) {
							return abbreviateNumber(params.value);
						},
					},
				},
			],
			// colorBy: 'column',
			color: ["#1294a8"],
		};
	});

	const chartLabels = computed(() => {
		return props?.data?.map((item: any) => item.label);
	});

	const chartValues = computed(() => {
		return props?.data?.map((item: any) => item.value);
	});
</script>
