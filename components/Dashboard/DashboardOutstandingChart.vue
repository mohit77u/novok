<template>
	<div>
		<v-chart ref="chart" class="chart" :option="option" style="height: 210px; width: 100%;" @click="handleChartClick" autoresize />
	</div>
</template>

<script lang="ts" setup>
	import * as echarts from "echarts";
	import { use } from "echarts/core";
	import { CanvasRenderer } from "echarts/renderers";
	import { LineChart } from "echarts/charts";
	import { UniversalTransition } from "echarts/features";
	import { GridComponent, TooltipComponent } from "echarts/components";
	import VChart, { THEME_KEY } from "vue-echarts";
	import moment from "moment";
	const localePath = useLocalePath();

	use([CanvasRenderer, LineChart, TooltipComponent, GridComponent, UniversalTransition]);

	const props = defineProps({
		data: {
			type: Object,
			defualt: {},
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
				// trigger: "item",
				formatter: function (params: any) {
					if (params.value == 0.3) {
						return `<b>${params.name}</b><br/>0`;
					} else {
						return `<b>${params.name}</b><br/>${params.value}`;
					}
				},
				position: "inside",
			},
			legend: {
				top: 20,
				orient: "horizontal",
				left: "center",
				align: "auto",
				textStyle: {
					fontSize: 13,
					fontWeight: "bolder",
					color: "#545152cc",
				},
				icon: "circle",
				itemWidth: 8,
				itemHeight: 8,
			},
			series: [
				{
					type: "pie",
					radius: ["50%", "75%"],
					center: ["50%", "68%"],
					startAngle: 180,
					endAngle: 360,
                    minShowLabelAngle: 1,
					width: 300,
					height: "80%",
					left: "center",
                    top: "center",
					label: {
						formatter: function (params: any) {
							let sum = 0;
							for (let i = 0; i < props?.data?.valueData.length; i++) {
								sum += props?.data?.valueData[i].value;
							}

							if (sum == 0.6) {
								return 0;
							} else if (sum != 0 && params.value == 0) {
								return "0";
							} else {
								return params.value;
							}
						},
						color: "#545152cc",
						fontWeight: "bold",
						fontSize: 13,
						position: "outer",
						alignTo: "labelLine",
						bleedMargin: "5%",
					},
					labelLine: {
						length: 5,
						// length2: 10,
					},
					labelLayout(params: any) {
						return {
							verticalAlign: "center",
							// align: "center",
						};
					},
					emphasis: {
						label: {
							show: false,
							fontSize: 16,
							fontWeight: "bold",
						},
					},
					data: props?.data?.valueData,
				},
			],
			colorBy: "column",
			color: ["#ee6666", "#008000"],
		};
	});

	const handleChartClick = (params: any) => {
		let status = 2;

		if (params.dataIndex == 0) {
			status = 2;
		} else {
			status = 3;
		}

		navigateTo(
			localePath({
				path: "/supplier-admins",
				query: { status: status },
			}),
			{ replace: true }
		);
	};
</script>
