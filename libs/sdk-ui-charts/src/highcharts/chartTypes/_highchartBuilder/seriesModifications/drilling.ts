// (C) 2020 GoodData Corporation

import Highcharts, { ChartDataOptions } from "../../../lib";
import {
    DataPoint,
    DataViewFacade,
    getDrillIntersection,
    IHeaderPredicate,
    IMappingHeader,
    isSomeHeaderPredicateMatched,
} from "@gooddata/sdk-ui";
import { IAttributeDescriptor, IResultAttributeHeader, IResultTotalHeader } from "@gooddata/sdk-backend-spi";
import { HighchartSeriesStatefulMod, HighchartSeriesStatefulModFactory } from "../seriesBuilder";
import { InvariantError } from "ts-invariant";
import flatten from "lodash/flatten";
import zip from "lodash/zip";
import reverse from "lodash/reverse";

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

/**
 * Setting up drills requires stateful modification to achieve the following:
 *
 * 1.  For each data point in series, evaluate the header predicates. These indicate whether the point
 *     should be drillable. If drillable, store `drillIntersection` in the data point
 * 2.  If at least one data point is drillable, set `isSeriesDrillable`
 *
 * The `isSeriesDrillable` will be used in later stages of th highchart options construction to turn on our custom
 * drilling.
 *
 */
class DrillingComplexModification<
    TSeries extends Highcharts.SeriesOptionsType,
    TData extends ChartDataOptions
> implements HighchartSeriesStatefulMod<TSeries, TData> {
    private drillEnabled = false;
    private hasPredicates = false;

    constructor(private predicates: IHeaderPredicate[], private dv: DataViewFacade) {
        this.hasPredicates = this.predicates.length > 0;
    }

    public dataPointProcessing = (
        _seriesIdx: number,
        _idx: number,
        dataPoint: DataPoint,
        data: TData,
    ): TData | undefined => {
        if (!this.hasPredicates) {
            // TODO: this is here to preserve legacy behavior; likely unneeded; remove after new approach adopted
            return {
                ...data,
                drilldown: false,
            };
        }

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

        return {
            ...data,
            // TODO: this is here to preserve legacy behavior; does not make sense as highcharts wants drilldown
            //  prop to be ID of the series. we are probably mis-using a prop? evaluate and possibly change once
            //  the new approach is fully adopted.
            drilldown: true,
            drillIntersection: getDrillIntersection(intersection),
        };
    };

    public afterDataPointProcessing = (series: TSeries): TSeries | undefined => {
        return {
            ...series,
            isDrillable: this.drillEnabled,
        };
    };
}

/**
 * Given header predicates and the data view, this function will return a factory that can create instances of
 * stateful modifications which will enrich highchart data points and series with drilldown setup.
 *
 * @param predicates - header predicates which will determine whether particular data point is drillable
 * @param dv - data being charted, this will be used to pass additional context to drill predicates
 */
export function drillModification<
    TSeries extends Highcharts.SeriesOptionsType,
    TData extends ChartDataOptions
>(predicates: IHeaderPredicate[], dv: DataViewFacade): HighchartSeriesStatefulModFactory<TSeries, TData> {
    // TODO: as is, code does drill modifications even if there are no drill predicates - this is to preserve
    //  legacy behavior where old code was setting drilldown to false, isDrillable to false. it is likely that
    //  this is not really needed and the code here could return empty modifications if there are no drill
    //  predicates (= no drill processing whatsoever). evaluate and possibly change once the new approach is fully adopted.

    return () => new DrillingComplexModification(predicates, dv);
}
