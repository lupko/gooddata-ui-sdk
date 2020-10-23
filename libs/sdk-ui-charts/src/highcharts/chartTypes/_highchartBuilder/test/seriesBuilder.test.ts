// (C) 2007-2020 GoodData Corporation
import { BarSeriesBuilder } from "../seriesBuilder";
import Highcharts, { ChartDataOptions } from "../../../lib";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedDataView } from "@gooddata/sdk-backend-mockingbird";
import { DataPoint, IDataSeries } from "@gooddata/sdk-ui";
import { parseValue } from "../../_util/common";
import last from "lodash/last";

function defaultDatapoint<T extends ChartDataOptions>(
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

function datapointWithYValue<T extends ChartDataOptions>(
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

function datapointNameFromSlice<T extends ChartDataOptions>(
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

function defaultHighchartSeriesFromDataSeries<T extends Highcharts.SeriesOptions>(
    idx: number,
    data: IDataSeries,
    series: T,
): T {
    return {
        ...series,
        legendIndex: idx,
        name: data.measureTitle(),
    };
}

describe("seriesBuilder", () => {
    it("does something", () => {
        const dataView = recordedDataView(ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewBy);

        const barSeries = BarSeriesBuilder(dataView)
            .withDataPointModifications(defaultDatapoint, datapointWithYValue, datapointNameFromSlice)
            .populateFromDataSeries(defaultHighchartSeriesFromDataSeries)
            .build();

        expect(barSeries).toMatchSnapshot();
    });
});
