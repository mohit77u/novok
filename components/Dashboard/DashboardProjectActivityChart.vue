<template>
	<v-chart class="chart" :option="options" style="height: 250px; width: 100%;" @click="handleChartClick" autoresize />
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
        }
	});

	const options = computed(() => {
		return {
			tooltip: {
				trigger: "item",
				formatter: function (params: any) {
					return `${params.marker}<b>${params.name}</b><br/>${params.value}`;
				},
				position: "inside",
			},

			legend: {
				top: 20,
				orient: "horizontal",
				left: "center",
                align: 'auto',
                textStyle: {
                    fontSize: 10,
                    fontWeight: 'bolder',
                },
                icon: 'circle',
                itemWidth: 8, 
                itemHeight: 8,
			},
			series: [
				{
					type: "pie",
                    radius: ["40%", "70%"],
					center: ["50%", "60%"],
					avoidLabelOverlap: false,
					itemStyle: {
						borderRadius: 10,
						borderColor: "#fff",
						borderWidth: 2,
					},
					emphasis: {
						label: {
							show: false,
							fontSize: 16,
							fontWeight: "bold",
						},
					},
					data: props.data,
					label: {
                        show: props.showLabel,
                        position: 'inside',
                        formatter: function (params: any) {
                            return params.value;
                        },
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: 11,
					},
				},
			],
			color: ["#2ca2d4", "#b74590", "#ffa70a", "#9dd01e"],
		};
	});

	const handleChartClick = (params: any) => {
		let status = 1;

		if (params.dataIndex == 0) {
			status = 2;
		} else if (params.dataIndex == 1) {
			status = 3;
		} else if (params.dataIndex == 2) {
			status = 4;
		} else {
			status = 5;
		}

		navigateTo(
			localePath({
				path: "/project-pipeline/projects",
				query: { status: status },
			}),
			{ replace: true }
		);
	};
</script>


