<template>
	<v-chart class="chart mb-[-65px] mt-[-22px]" :option="options" style="height: 400px; width: 100%;" @click="handleChartClick" autoresize />
</template>

<script lang="ts" setup>
	import { use } from "echarts/core";
	import { CanvasRenderer } from "echarts/renderers";
	import { PieChart } from "echarts/charts";
	import { TooltipComponent, LegendComponent } from "echarts/components";
	import VChart, { THEME_KEY } from "vue-echarts";

    const localePath = useLocalePath();

	use([
        CanvasRenderer, 
        PieChart, 
        TooltipComponent,
        LegendComponent
    ]);

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

	// provide(THEME_KEY, "dark");
	const options = computed(() => {
		return {
			tooltip: {
				trigger: "item",
				formatter: function (params: any) {
					return `${params.marker}<b>${params.name}</b><br/>${params.value}`;
				},
                position: 'inside',
			},
			legend: {
				top: 40,
				orient: "horizontal",
				left: "auto",
				right: "auto",
                align: 'auto',
                textStyle: {
                    fontSize: 10,
                    fontWeight: 'bolder',
                },
                icon: 'circle',
                itemWidth: 8, 
                itemHeight: 8,
                itemGap: 12,
                // padding: [ 0, 20, 0, 20]
			},
            series: [
                {
                    type: 'pie',
                    radius: [0, 90],
                    center: ['50%', '60%'],
                    roseType: 'radius',
                    itemStyle: {
                        borderRadius: 5
                    },
                    emphasis: {
						label: {
							show: false,
							fontSize: 16,
							fontWeight: "bold",
						},
					},
                    label: {
                        show: props.showLabel,
                        position: 'inside',
                        formatter: function (params: any) {
                            let sum = 0;
                            for (let i = 0; i < props.data.length; i++) {
                                sum += props.data[i].value;
                            }
                            
                            if(sum == 0) {
                                return 0;
                            } else if(sum != 0 && params.value == 0) {
                                return '';
                            } else {
                                return params.value;
                            }
                        },
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: 11,
                    },
                    data: props.data,
                }
            ],
            color: ["#159780", "#ff8e28", "#546ef3", "#db3b51"],
		};
	});

    const handleChartClick = ((params: any) => {

        let status = 0;

		if (params.dataIndex == 0) {
			status = 3;
		} else if (params.dataIndex == 1) {
			status = 4;
		} else if (params.dataIndex == 2) {
			status = 2;
		} else {
			status = 1;
		}

		navigateTo(
			localePath({
				path: "/supplier-admins",
				query: { status: status },
			}),
			{ replace: true }
		);
    })
</script>
