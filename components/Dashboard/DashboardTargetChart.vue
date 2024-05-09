<template>
	<v-chart class="chart" :option="options" style="height: 210px; width: 100%;" autoresize />
</template>

<script lang="ts" setup>
	import { use } from "echarts/core";
	import { CanvasRenderer } from "echarts/renderers";
	import { PieChart } from "echarts/charts";
	import { TooltipComponent, LegendComponent } from "echarts/components";
	import VChart, { THEME_KEY } from "vue-echarts";

	const localePath = useLocalePath();

	use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent]);

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

	const options = computed(() => {
		return {
			tooltip: {
				trigger: "item",
				formatter: function (params: any) {
					if (params.dataIndex == 0) {
						return `${params.marker}<b>${params.name}</b><br/>${(props.data as any)?.actual_value.replace(".00", "")}`;
					} else if (params.dataIndex == 1) {
						return `${params.marker}<b>${params.name}</b><br/>${(props.data as any)?.estimated_value.replace(".00", "")}`;
					} else {
						return `${params.marker}<b>${params.name}</b><br/>${(props.data as any)?.gap_value.replace(".00", "")}`;
					}
				},
				position: "inside",
			},

			legend: {
				top: 15,
				buttom: 15,
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
				color: "#545152cc",
			},

			series: [
				{
					type: "pie",
					radius: ["50%", "70%"],
					center: ["50%", "67%"],
					emphasis: {
						label: {
							show: false,
							fontSize: 16,
							fontWeight: "bold",
						},
					},
					clockwise: false,
                    minShowLabelAngle: 1,
					startAngle: 0,
                    height: "80%",
					width: 300,
					left: "center",
                    top: "center",
					data: (props?.data as any)?.valueData,
					label: {
						formatter: function (params: any) {
							let sum = 0;
							for (let i = 0; i < (props.data as any)?.valueData?.length; i++) {
								sum += (props?.data as any)?.valueData[i].value;
							}

							if (sum == 0) {
								return "0";
							} else if (params.value == 0) {
								return "";
							} else if (params.dataIndex == 0) {
								return `${(props.data as any)?.actual_value.replace(".00", "")}`;
							} else if (params.dataIndex == 1) {
								return `${(props.data as any)?.estimated_value.replace(".00", "")}`;
							} else {
								return `${(props.data as any)?.gap_value.replace(".00", "")}`;
							}
						},
						color: "#545152cc",
						fontWeight: "bold",
						fontSize: 13,
						position: "outer",
						alignTo: "labelLine",
						bleedMargin: 5,
					},
					labelLayout(params: any) {
						return {
							verticalAlign: "center",
							// align: "right",
						};
					},
				},
			],
			colorBy: "series",
			color: ["#008000", "#ff8e28", "#ee6666"],
		};
	});
</script>


