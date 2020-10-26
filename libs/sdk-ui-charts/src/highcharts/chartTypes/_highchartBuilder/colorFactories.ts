// (C) 2007-2020 GoodData Corporation
import { IChartConfig } from "../../../interfaces";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { AttributeColorStrategy, ColorStrategy, IColorStrategy } from "@gooddata/sdk-ui-vis-commons";
import { IAttributeDescriptor, IResultAttributeHeader } from "@gooddata/sdk-backend-spi";
import { IUnwrappedAttributeHeadersWithItems } from "../../typings/mess";
import last from "lodash/last";
import { MeasureColorStrategy } from "../_chartColoring/measure";

/*
 * These factories exist so that code building highchart series and options does not have to concern itself
 * with awkward strategy construction which also requires the use of the `IUnwrappedAttributeHeadersWithItems` for
 * passing viewBy/stackBy.
 *
 * Instead, these factories are named according to the intent (color by this, color by that) and all the tech mess
 * is hidden.
 */

function lastSliceDescriptorWithItems(dv: DataViewFacade): IUnwrappedAttributeHeadersWithItems {
    const slices = dv.data().slices();
    const lastSlicingAttribute = last(slices.descriptors) as IAttributeDescriptor;
    const lastSliceHeaders = last(slices.headers) as IResultAttributeHeader[];

    return {
        ...lastSlicingAttribute.attributeHeader,
        items: lastSliceHeaders,
    };
}

/**
 * Creates color strategy which assigns different color per slicing attribute element.
 *
 * @param chartConfig - chart config to get palette and possible color mappings from
 * @param dv - the entire data view so that strategy has full context for evaluation
 */
export function sliceColoringStrategy(chartConfig: IChartConfig, dv: DataViewFacade): IColorStrategy {
    return new AttributeColorStrategy(
        chartConfig.colorPalette,
        chartConfig.colorMapping,
        null,
        lastSliceDescriptorWithItems(dv),
        dv,
    );
}

/**
 * Creates color strategy which assigns different color measure.
 *
 * @param chartConfig - chart config to get palette and possible color mappings from
 * @param dv - the entire data view so that strategy has full context for evaluation
 */
export function measureColoringStrategy(chartConfig: IChartConfig, dv: DataViewFacade): ColorStrategy {
    return new MeasureColorStrategy(chartConfig.colorPalette, chartConfig.colorMapping, null, null, dv);
}
