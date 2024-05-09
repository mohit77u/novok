<template>
    <div>
        <v-chart ref="chart" class="chart" :option="option" style="height: 275px; width: 100%;" @click="handleChartClick" autoresize />
    </div>
</template>

<script lang="ts" setup>
    import { use } from "echarts/core";
    import { CanvasRenderer } from "echarts/renderers";
    import { UniversalTransition } from 'echarts/features';
    import { BarChart } from "echarts/charts";
    import { TooltipComponent, DatasetComponent, GridComponent } from "echarts/components";
    import VChart, { THEME_KEY } from "vue-echarts";
    import moment from "moment";
    const localePath = useLocalePath();

    use([
        CanvasRenderer,
        BarChart,
        TooltipComponent,
        DatasetComponent,
        GridComponent,
        UniversalTransition,
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
    })

    const chart = ref<any>(null);
    const  { t } = useI18n();

    // provide(THEME_KEY, "dark");

    const option = computed(() => {
        return {
            tooltip: {
                trigger: "item",
                formatter: function (params: any) {
                    return `${params.marker}<b>${params.name}</b><br/>${params.value}`;
                },
                position: 'inside'
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true,
                show: false,
            },
            xAxis: [
                {
                    type: 'category',
                    data: [t('chartLabels.30days'), t('chartLabels.60days'), t('chartLabels.90days')],
                    axisTick: {
                        alignWithLabel: true
                    },
                    axisLine: {
                        show: true
                    },
                    axisLabel: {
                        fontSize: 13,
                    },
                    splitLine: {
                        show: false
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    axisLabel: {
                        fontSize: 13,
                    },
                    splitLine: {
                        show: false
                    }
                }
            ],
            series: [
                {
                    type: 'bar',
                    barWidth: '60%',
                    data: props.data,
                    // barMinHeight: 15,
                    barMaxWidth: 25,
                    borderRadius: 5,
                    itemStyle: {
                        borderRadius: [50, 50, 0, 0],
                    },
                    label: {
                        show: props.showLabel,
                        position: 'top',
                        fontSize: 12,
                        color: '#545152cc',
                        fontWeight: 'bold',
                    },
                }
            ],
            colorBy: 'column',
            color: ['#ee6666', '#ff8e28', '#008000'],
        }
    });

    const handleChartClick = ((params: any) => {

        const pageDetails = JSON.parse(sessionStorage.getItem("pageDetails") || " {}");

		if (params.dataIndex == 0) {
			pageDetails.expiringDays = 30;
		} else if (params.dataIndex == 1) {
			pageDetails.expiringDays = 60;
		} else {
			pageDetails.expiringDays = 90;
		}

		sessionStorage.setItem("pageDetails", JSON.stringify(pageDetails));

		navigateTo(
			localePath({
				path: "/contracts",
			}),
			{ replace: true }
		);
    })

</script>
