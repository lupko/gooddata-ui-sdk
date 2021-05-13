// (C) 2019-2021 GoodData Corporation
import { IChartConfig } from "../../../interfaces";
import { BucketNames, DataViewFacade, IHeaderPredicate } from "@gooddata/sdk-ui";
import Highcharts, { HighchartsOptions } from "../../lib";
import { HighchartsOptionsBuilder } from "../_highchartBuilder/optionsBuilder";
import { getBaseTemplate } from "../_chartCreators/commonConfiguration";
import { getBarConfiguration } from "./barConfiguration";
import { BarSeriesBuilder } from "../_highchartBuilder/typedSeriesBuilders";
import {
    datapointFormat,
    datapointNameFromMeasure,
    datapointNameFromSlice,
    datapointNoMarkerForNullData,
    datapointWithYValue,
    seriesColoringUsingStrategy,
    seriesLegendIndex,
    seriesNameFromLastSliceTitle,
    seriesNameFromMeasure,
} from "../_highchartBuilder/seriesModifications/basic";
import { drillModification } from "../_highchartBuilder/seriesModifications/drilling";
import { measureColoringStrategy, sliceColoringStrategy } from "../_highchartBuilder/colorFactories";

function stackedBarChartSeries(
    chartConfig: IChartConfig,
    drillableItems: IHeaderPredicate[],
    dv: DataViewFacade,
): Highcharts.SeriesBarOptions[] {
    const coloringStrategy = sliceColoringStrategy(chartConfig, dv);

    return BarSeriesBuilder(dv)
        .withDataPointModifications(
            datapointFormat,
            datapointWithYValue,
            datapointNoMarkerForNullData,
            datapointNameFromSlice,
        )
        .withStatefulModifications(drillModification(drillableItems, dv))
        .populateFromDataSlices(
            seriesNameFromLastSliceTitle,
            seriesLegendIndex,
            seriesColoringUsingStrategy(coloringStrategy),
        )
        .build();
}

function barChartSeries(
    chartConfig: IChartConfig,
    drillableItems: IHeaderPredicate[],
    dv: DataViewFacade,
): Highcharts.SeriesBarOptions[] {
    const coloringStrategy = measureColoringStrategy(chartConfig, dv);

    return BarSeriesBuilder(dv)
        .withDataPointModifications(
            datapointFormat,
            datapointWithYValue,
            datapointNoMarkerForNullData,
            datapointNameFromMeasure,
        )
        .withStatefulModifications(drillModification(drillableItems, dv))
        .populateFromDataSeries(
            seriesNameFromMeasure,
            seriesLegendIndex,
            seriesColoringUsingStrategy(coloringStrategy),
        )
        .build();
}

export function barChartOptionsFactory(
    chartConfig: IChartConfig,
    drillableItems: IHeaderPredicate[],
    dv: DataViewFacade,
): HighchartsOptions {
    const series = dv.def().isBucketEmpty(BucketNames.STACK)
        ? barChartSeries(chartConfig, drillableItems, dv)
        : stackedBarChartSeries(chartConfig, drillableItems, dv);

    return HighchartsOptionsBuilder.from(getBaseTemplate(), getBarConfiguration(chartConfig))
        .setSeries(series)
        .build();
}
