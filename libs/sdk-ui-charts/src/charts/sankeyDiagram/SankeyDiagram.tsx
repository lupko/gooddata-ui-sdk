// (C) 2007-2018 GoodData Corporation
import { IAttribute, IMeasure, INullableFilter, ISortItem, newBucket } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { roundChartDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../../interfaces";
import { CoreSankeyDiagram } from "./CoreSankeyDiagram";
import { IChartDefinition } from "../_commons/chartDefinition";
import { withChart } from "../_base/withChart";

//
// Internals
//

const sankeyDiagramDefinition: IChartDefinition<ISankeyDiagramBucketProps, ISankeyDiagramProps> = {
    chartName: "PieChart",
    bucketPropsKeys: ["measure", "viewBy", "filters", "sortBy"],
    bucketsFactory: (props) => {
        return [newBucket(BucketNames.MEASURES, props.measure), newBucket(BucketNames.VIEW, ...props.viewBy)];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("SankeyDiagram", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters)
            .withSorting(...(props.sortBy ?? []))
            .withDimensions(roundChartDimensions);
    },
};

//
// Public interface
//

/**
 * @beta
 */
export interface ISankeyDiagramBucketProps {
    /**
     */
    measure: IMeasure;

    /**
     */
    viewBy: IAttribute[];

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
 * @beta
 */
export interface ISankeyDiagramProps extends IBucketChartProps, ISankeyDiagramBucketProps {}

/**
 * @beta
 */
export const SankeyDiagram = withChart(sankeyDiagramDefinition)(CoreSankeyDiagram);
