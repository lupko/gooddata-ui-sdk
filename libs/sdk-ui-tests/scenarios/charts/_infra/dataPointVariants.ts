// (C) 2007-2019 GoodData Corporation

import { IChartConfig, IBucketChartProps } from "@gooddata/sdk-ui-charts";
import { CustomizedScenario, UnboundVisProps } from "../../../src";

const ConfigVariants: Array<[string, IChartConfig]> = [
    ["default for pre-feature charts", {}],
    ["auto visibility", {}],
    ["forced visible", {}],
    ["forced hidden", {}],
];

export function dataPointCustomizer<T extends IBucketChartProps>(
    baseName: string,
    baseProps: UnboundVisProps<T>,
): Array<CustomizedScenario<T>> {
    return ConfigVariants.map(([variantName, dataPointOverlay]) => {
        return [
            `${baseName} - ${variantName}`,
            { ...baseProps, config: { ...baseProps.config, ...dataPointOverlay } },
        ];
    });
}
