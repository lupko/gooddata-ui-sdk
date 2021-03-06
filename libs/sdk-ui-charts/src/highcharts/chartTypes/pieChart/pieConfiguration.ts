// (C) 2007-2021 GoodData Corporation
import { IChartConfig } from "../../../interfaces";
import { HighchartsOptions, SeriesPieOptions } from "../../lib";
import { alignChart } from "../_chartCreators/helpers";
import { getPieResponsiveConfig } from "../_chartCreators/responsive";

export function getPieConfiguration(config: IChartConfig): HighchartsOptions {
    const pieConfiguration = {
        chart: {
            type: "pie",
            events: {
                load() {
                    const distance = -((this.series[0].points?.[0]?.shapeArgs?.r ?? 30) / 3);
                    const options: SeriesPieOptions = {
                        type: "pie",
                        dataLabels: {
                            distance,
                        },
                    };
                    this.series[0].update(options);
                    alignChart(this, config.chart?.verticalAlign);
                },
            },
        },
        plotOptions: {
            pie: {
                size: "100%",
                allowPointSelect: false,
                dataLabels: {
                    enabled: false,
                },
                showInLegend: true,
            },
        },
        legend: {
            enabled: false,
        },
    };

    if (config?.enableCompactSize) {
        return {
            ...pieConfiguration,
            responsive: getPieResponsiveConfig(),
        };
    }

    return pieConfiguration;
}
