// (C) 2019-2020 GoodData Corporation
import { IChartConfig } from "../../interfaces";
import { IHeaderPredicate } from "@gooddata/sdk-ui";
import { IDataView } from "@gooddata/sdk-backend-spi";
import { HighchartOptions } from "../lib";
import { InvariantError } from "ts-invariant";

export type HighchartsOptionsFactory = (
    chartConfig: IChartConfig,
    drillableItems: IHeaderPredicate[],
    dataView: IDataView,
) => HighchartOptions;

/**
 * This will contain mapping of chart type => chart specific factory
 */
const perTypeFactories: Record<string, HighchartsOptionsFactory> = {};

/**
 * This implementation of highcharts options factory delegates the construction to chart-type-specific factory. It does
 * this based on the `type` in chartConfig.
 *
 * @param chartConfig - visual chart configuration (grids, axes, colors etc)
 * @param drillableItems - predicates which determine which data points should be drillable
 * @param dataView - data to chart
 * @internal
 */
export function typeAwareOptionsFactory(
    chartConfig: IChartConfig,
    drillableItems: IHeaderPredicate[],
    dataView: IDataView,
): HighchartOptions {
    const { type } = chartConfig;
    const typeFactory = perTypeFactories[type];

    if (!typeFactory) {
        throw new InvariantError(`Unknown chart type: ${type}`);
    }

    return typeFactory(chartConfig, drillableItems, dataView);
}
