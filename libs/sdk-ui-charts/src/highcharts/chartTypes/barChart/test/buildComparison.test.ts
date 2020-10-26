// (C) 2007-2020 GoodData Corporation

import { recordedDataView, ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { IDataView } from "@gooddata/sdk-backend-spi";
import { getChartOptions } from "../../_chartOptions/chartOptionsBuilder";
import { IChartConfig } from "../../../../interfaces";
import { barChartOptionsFactory } from "../barOptionsFactory";
import { DataViewFacade, DefaultColorPalette } from "@gooddata/sdk-ui";

const AllBarChartScenarios: ScenarioRecording[] = Object.values(ReferenceRecordings.Scenarios.BarChart);
const AllBarChartData: Array<[string, IDataView]> = AllBarChartScenarios.map((s) => [
    s.execution.scenarios[s.scenarioIndex].scenario,
    recordedDataView(s),
]);

const TestChartConfig: IChartConfig = {
    type: "bar",
    colorPalette: DefaultColorPalette,
    colorMapping: [],
};

describe("barChart factory", () => {
    it.each(AllBarChartData)("builds same series for %s", (_desc, dataView) => {
        const dv = DataViewFacade.for(dataView);
        const original = getChartOptions(dataView, TestChartConfig, []).data.series;
        const refactored = barChartOptionsFactory(TestChartConfig, [], dv).series;

        delete (refactored as any).type;

        expect(refactored).toEqual(original);
    });
});
