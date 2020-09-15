// (C) 2007-2019 GoodData Corporation
import { ComboChart, IComboChartProps } from "@gooddata/sdk-ui-charts";
import { CustomizedScenario, scenariosFor, UnboundVisProps } from "../../../src";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants";
import { legendCustomizer } from "../_infra/legendVariants";
import { ComboChartWithManyDataPoints, ComboChartWithTwoMeasuresAndViewBy } from "./base";
import { ScenarioGroupNames } from "../_infra/groupNames";
import { dataPointCustomizer } from "../_infra/dataPointVariants";

const legendScenarios = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", ComboChartWithTwoMeasuresAndViewBy, legendCustomizer);

const dataLabelScenarios = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", ComboChartWithTwoMeasuresAndViewBy, dataLabelCustomizer);

function dataPointCustomizerForComboCharts<T extends IComboChartProps>(
    baseName: string,
    baseProps: UnboundVisProps<T>,
): Array<CustomizedScenario<T>> {
    return dataPointCustomizer(baseName, baseProps).map((c) => [
        c[0],
        {
            ...c[1],
            config: {
                ...c[1].config,
                primaryChartType: "line",
                secondaryChartType: "area",
            },
        },
    ]);
}

const dataPointScenarios = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "data points" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data points", ComboChartWithManyDataPoints, dataPointCustomizerForComboCharts);

export default [legendScenarios, dataLabelScenarios, dataPointScenarios];
