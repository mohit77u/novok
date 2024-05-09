<template>
	<v-chart class="chart" :option="option" style="height: 240px; width: 100%;" @click="handleChartClick" autoresize />
</template>

<script lang="ts" setup>
	import { use } from "echarts/core";
	import { CanvasRenderer } from "echarts/renderers";
	import { PieChart } from "echarts/charts";
	import { TitleComponent, TooltipComponent, LegendComponent } from "echarts/components";
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
	// provide(THEME_KEY, "dark");

	const option = computed(() => {
		return {
			tooltip: {
				trigger: "item",
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
					radius: ["50%", "70%"],
					center: ["50%", "63%"],
					avoidLabelOverlap: false,
					minShowLabelAngle: 1,
					height: "80%",
					width: 300,
					left: "center",
					top: "center",
					startAngle: 45,
					label: {
						// show: props.showLabel,
						// position: 'inside',
						formatter: function (params: any) {
							let sum = 0;
							for (let i = 0; i < (props.data ?? []).length; i++) {
								sum += (props.data as Array<any>)[i].value;
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
						bleedMargin: 5,
					},
					labelLayout(params: any) {
						return {
							verticalAlign: "center",
							// align: "right",
						};
					},
					emphasis: {
						label: {
							show: false,
							fontSize: 16,
							fontWeight: "bold",
						},
					},
					data: props.data,
				},
			],
			color: ["#ff8e28", "#008000"],
		};
	});

	const handleChartClick = (params: any) => {
		const pageDetails = JSON.parse(sessionStorage.getItem("pageDetails") || " {}");

		if (params.dataIndex == 0) {
			pageDetails.contractValidation = 1;
		} else {
			pageDetails.contractValidation = 0;
		}

		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));

		navigateTo(
			localePath({
				path: "/contracts",
			}),
			{ replace: true }
		);
	};
</script>
