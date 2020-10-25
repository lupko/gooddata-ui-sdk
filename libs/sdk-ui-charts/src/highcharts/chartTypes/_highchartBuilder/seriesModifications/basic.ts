// (C) 2007-2020 GoodData Corporation
import Highcharts, { ChartDataOptions } from "../../../lib";
import { DataPoint, IDataSeries } from "@gooddata/sdk-ui";
import last from "lodash/last";
import { parseValue } from "../../_util/common";

/**
 * This modification will add custom `format` prop to the highchart's data point object. The value of `format` will
 * be the actual measure format.
 */
export function datapointFormat<T extends ChartDataOptions>(
    _seriesIdx: number,
    _idx: number,
    dataPoint: DataPoint,
    data: T,
): T {
    return {
        ...data,
        format: dataPoint.seriesDesc.measureFormat(),
    };
}

/**
 * This modification function will set data points value as the `y` prop of the highchart's data point object.
 */
export function datapointWithYValue<T extends ChartDataOptions>(
    _seriesIdx: number,
    _idx: number,
    dataPoint: DataPoint,
    data: T,
): T {
    return {
        ...data,
        y: parseValue(dataPoint.rawValue),
    };
}

/**
 * This modification ensures that highchart will not render marker if the data point has null value.
 */
export function noMarkerForNullData<T extends ChartDataOptions>(
    _seriesIdx: number,
    _idx: number,
    dataPoint: DataPoint,
    data: T,
): T {
    if (dataPoint.rawValue === null) {
        return {
            ...data,
            marker: {
                enabled: false,
            },
        };
    }

    return data;
}

/**
 * This modification sets name of highchart's data point to be title of the last slicing attribute of
 * the underlying data point.
 *
 */
export function datapointNameFromSlice<T extends ChartDataOptions>(
    _seriesIdx: number,
    _idx: number,
    dataPoint: DataPoint,
    data: T,
): T {
    const { sliceDesc } = dataPoint;

    return {
        ...data,
        name: last(sliceDesc.sliceTitles()),
    };
}

/**
 * This modification sets name of highchart series to be title of the measure used in the underlying data series.
 */
export function seriesNameFromMeasure<T extends Highcharts.SeriesOptions>(
    _idx: number,
    data: IDataSeries,
    series: T,
): T {
    return {
        ...series,
        name: data.measureTitle(),
    };
}
