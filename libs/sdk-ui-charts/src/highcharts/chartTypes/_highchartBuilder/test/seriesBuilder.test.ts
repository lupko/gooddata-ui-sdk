// (C) 2007-2020 GoodData Corporation
import { ReferenceLdm, ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedDataView } from "@gooddata/sdk-backend-mockingbird";
import { DataViewFacade, DefaultColorPalette, HeaderPredicates } from "@gooddata/sdk-ui";
import { BarSeriesBuilder } from "../typedSeriesBuilders";
import {
    datapointFormat,
    datapointNameFromSlice,
    datapointWithYValue,
    seriesNameFromMeasure,
    datapointNoMarkerForNullData,
    seriesColoringUsingStrategy,
} from "../seriesModifications/basic";
import { drillModification } from "../seriesModifications/drilling";
import { measureColoringStrategy } from "../colorFactories";

const TestDataView = recordedDataView(ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewBy);

describe("seriesBuilder", () => {
    it("creates series without drilling", () => {
        const barSeries = BarSeriesBuilder(DataViewFacade.for(TestDataView))
            .withDataPointModifications(
                datapointFormat,
                datapointWithYValue,
                datapointNoMarkerForNullData,
                datapointNameFromSlice,
            )
            .populateFromDataSeries(seriesNameFromMeasure)
            .build();

        expect(barSeries).toMatchSnapshot();
    });

    it("creates series with coloring", () => {
        const dataView = recordedDataView(ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewBy);
        const colorStrategy = measureColoringStrategy(
            { colorPalette: DefaultColorPalette, colorMapping: [] },
            DataViewFacade.for(dataView),
        );

        const barSeries = BarSeriesBuilder(DataViewFacade.for(TestDataView))
            .withDataPointModifications(
                datapointFormat,
                datapointWithYValue,
                datapointNoMarkerForNullData,
                datapointNameFromSlice,
            )
            .populateFromDataSeries(seriesNameFromMeasure, seriesColoringUsingStrategy(colorStrategy))
            .build();

        expect(barSeries).toMatchSnapshot();
    });

    it("creates series with no drilling when no drill predicates", () => {
        const barSeries = BarSeriesBuilder(DataViewFacade.for(TestDataView))
            .withDataPointModifications(
                datapointFormat,
                datapointWithYValue,
                datapointNoMarkerForNullData,
                datapointNameFromSlice,
            )
            .withStatefulModifications(drillModification([], DataViewFacade.for(TestDataView)))
            .populateFromDataSeries(seriesNameFromMeasure)
            .build();

        expect(barSeries).toMatchSnapshot();
    });

    it("creates series with drilling", () => {
        const dv = DataViewFacade.for(TestDataView);

        const barSeries = BarSeriesBuilder(dv)
            .withDataPointModifications(
                datapointFormat,
                datapointWithYValue,
                datapointNoMarkerForNullData,
                datapointNameFromSlice,
            )
            .withStatefulModifications(
                drillModification([HeaderPredicates.localIdentifierMatch(ReferenceLdm.Amount)], dv),
            )
            .populateFromDataSeries(seriesNameFromMeasure)
            .build();

        expect(barSeries).toMatchSnapshot();
    });
});
