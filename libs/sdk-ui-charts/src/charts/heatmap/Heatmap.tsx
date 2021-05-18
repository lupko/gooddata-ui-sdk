// (C) 2007-2018 GoodData Corporation
import {
    bucketAttribute,
    bucketsFind,
    IAttribute,
    IAttributeOrMeasure,
    IBucket,
    INullableFilter,
    ISortItem,
    newAttributeSort,
    newBucket,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { heatmapDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../../interfaces";
import { CoreHeatmap } from "./CoreHeatmap";
import { IChartDefinition } from "../_commons/chartDefinition";
import { withChart } from "../_base/withChart";

//
// Internals
//

const heatmapDefinition: IChartDefinition<IHeatmapBucketProps, IHeatmapProps> = {
    chartName: "Heatmap",
    bucketPropsKeys: ["measure", "rows", "columns", "filters", "sortBy"],
    bucketsFactory: (props) => {
        return [
            newBucket(BucketNames.MEASURES, props.measure),
            newBucket(BucketNames.VIEW, props.rows),
            newBucket(BucketNames.STACK, props.columns),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;
        const sortBy = getDefaultHeatmapSort(buckets);

        return backend
            .withTelemetry("Heatmap", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters)
            .withSorting(...(sortBy ?? []))
            .withDimensions(heatmapDimensions);
    },
};

//
// Public interface
//

/**
 * @public
 */
export interface IHeatmapBucketProps {
    /**
     * Specify measure whose values will be charted on the heatmap.
     */
    measure: IAttributeOrMeasure;

    /**
     * Optionally specify attribute, whose values will be used to create rows in the heatmap.
     */
    rows?: IAttribute;

    /**
     * Optionally specify attribute, whose values will be used to create columns in the heatmap.
     */
    columns?: IAttribute;

    /**
     * Optionally specify filters to apply on the data to chart.
     */
    filters?: INullableFilter[];

    /**
     * Optionally specify how to sort the data to chart.
     */
    sortBy?: ISortItem[];
}

/**
 * @public
 */
export interface IHeatmapProps extends IBucketChartProps, IHeatmapBucketProps {}

/**
 * [Heatmap](https://sdk.gooddata.com/gooddata-ui/docs/heatmap_component.html)
 *
 * Heatmap represents data as a matrix where individual values are represented as colors.
 * Heatmaps can help you discover trends and understand complex datasets.
 *
 * @public
 */
export const Heatmap = withChart(heatmapDefinition)(CoreHeatmap);

function getDefaultHeatmapSort(buckets: IBucket[]): ISortItem[] {
    const viewBucket = bucketsFind(buckets, BucketNames.VIEW);
    const viewAttribute = viewBucket ? bucketAttribute(viewBucket) : undefined;
    if (viewAttribute) {
        return [newAttributeSort(viewAttribute, "desc")];
    }

    return [];
}
