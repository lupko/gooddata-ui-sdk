// (C) 2007-2020 GoodData Corporation
import { HighchartSeriesStatefulMod, HighchartSeriesStatefulModFactory } from "../seriesBuilder";
import Highcharts, { ChartDataOptions } from "../../../lib";
import { ReferenceLdm, ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedDataView } from "@gooddata/sdk-backend-mockingbird";
import {
    DataPoint,
    DataViewFacade,
    getDrillIntersection,
    HeaderPredicates,
    IDataSeries,
    IHeaderPredicate,
    IMappingHeader,
    isSomeHeaderPredicateMatched,
} from "@gooddata/sdk-ui";
import { parseValue } from "../../_util/common";
import last from "lodash/last";
import zip from "lodash/zip";
import reverse from "lodash/reverse";
import flatten from "lodash/flatten";
import {
    IAttributeDescriptor,
    IDataView,
    IResultAttributeHeader,
    IResultTotalHeader,
} from "@gooddata/sdk-backend-spi";
import { InvariantError } from "ts-invariant";
import { BarSeriesBuilder } from "../typedSeriesBuilders";

function datapointFormat<T extends ChartDataOptions>(
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

function noMarkerForNullData<T extends ChartDataOptions>(
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

/**
 * Reshuffles attribute headers and descriptors so that they can be placed into drilling intersection. The drilling
 * intersection expects headers and descriptors in a list as follows:
 *
 * -  child header
 * -  child attribute
 * -  parent header
 * -  parent attribute
 * -  grandparent header
 * -  grandparent attribute
 * ...
 *
 * Whereas data point separately returns headers and descriptors, both in order of appearance in the dimension definition
 * (e.g. from parents to children).
 *
 *
 * @param headers
 * @param descriptors
 */
function toDrillingIntersection(
    headers: Array<IResultAttributeHeader | IResultTotalHeader> | undefined,
    descriptors: IAttributeDescriptor[] | undefined,
): Array<IResultAttributeHeader | IResultTotalHeader | IAttributeDescriptor> {
    if (headers === undefined) {
        return [];
    }

    if (descriptors === undefined) {
        throw new InvariantError(
            "Invalid state while setting up drilling. Attribute headers are available however descriptors are not.",
        );
    }

    return flatten(zip(reverse(headers), reverse(descriptors)));
}

class DrillingComplexModification<
    TSeries extends Highcharts.SeriesOptionsType,
    TData extends ChartDataOptions
> implements HighchartSeriesStatefulMod<TSeries, TData> {
    private drillEnabled = false;

    constructor(private predicates: IHeaderPredicate[], private dv: DataViewFacade) {}

    public dataPointProcessing = (
        seriesIdx: number,
        _idx: number,
        dataPoint: DataPoint,
        data: TData,
    ): TData | undefined => {
        const intersection: IMappingHeader[] = [
            dataPoint.seriesDesc.measureDescriptor,
            ...toDrillingIntersection(
                dataPoint.seriesDesc.attributeHeaders,
                dataPoint.seriesDesc.attributeDescriptors,
            ),
            ...toDrillingIntersection(dataPoint.sliceDesc.headers, dataPoint.sliceDesc.descriptors),
        ];

        const drilldown: boolean = intersection.some((intersectionItem) =>
            isSomeHeaderPredicateMatched(this.predicates, intersectionItem, this.dv),
        );

        if (!drilldown) {
            return data;
        }

        this.drillEnabled = true;

        /*
         * note: old code passed 'true' in drilldown; which goes against the highchart typings. since we set and
         * handle drilling ourselves, it seems any use of highcharts drilldown props is without effect anyway.
         */
        return {
            ...data,
            drilldown: `${seriesIdx}`,
            drillIntersection: getDrillIntersection(intersection),
        };
    };

    public afterDataPointProcessing = (series: TSeries): TSeries | undefined => {
        if (this.drillEnabled) {
            return {
                ...series,
                isSeriesDrillable: true,
            };
        }

        return series;
    };
}

function drillModification<TSeries extends Highcharts.SeriesOptionsType, TData extends ChartDataOptions>(
    predicates: IHeaderPredicate[],
    dataView: IDataView,
): HighchartSeriesStatefulModFactory<TSeries, TData> {
    if (predicates.length === 0) {
        return () => ({});
    }

    const dv = DataViewFacade.for(dataView);

    return () => new DrillingComplexModification(predicates, dv);
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
    it("creates series without drilling", () => {
        const dataView = recordedDataView(ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewBy);

        const barSeries = BarSeriesBuilder(dataView)
            .withDataPointModifications(
                datapointFormat,
                datapointWithYValue,
                noMarkerForNullData,
                datapointNameFromSlice,
            )
            .populateFromDataSeries(defaultHighchartSeriesFromDataSeries)
            .build();

        expect(barSeries).toMatchSnapshot();
    });

    it("creates series with no drilling when no drill predicates", () => {
        const dataView = recordedDataView(ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewBy);

        const barSeries = BarSeriesBuilder(dataView)
            .withDataPointModifications(
                datapointFormat,
                datapointWithYValue,
                noMarkerForNullData,
                datapointNameFromSlice,
            )
            .withStatefulModifications(drillModification([], dataView))
            .populateFromDataSeries(defaultHighchartSeriesFromDataSeries)
            .build();

        expect(barSeries).toMatchSnapshot();
    });

    it("creates series with drilling", () => {
        const dataView = recordedDataView(ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewBy);

        const barSeries = BarSeriesBuilder(dataView)
            .withDataPointModifications(
                datapointFormat,
                datapointWithYValue,
                noMarkerForNullData,
                datapointNameFromSlice,
            )
            .withStatefulModifications(
                drillModification([HeaderPredicates.localIdentifierMatch(ReferenceLdm.Amount)], dataView),
            )
            .populateFromDataSeries(defaultHighchartSeriesFromDataSeries)
            .build();

        expect(barSeries).toMatchSnapshot();
    });
});
