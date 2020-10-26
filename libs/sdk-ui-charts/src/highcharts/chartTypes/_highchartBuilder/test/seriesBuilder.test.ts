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

describe("seriesBuilder", () => {
    it("creates series without drilling", () => {
        const dataView = recordedDataView(ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewBy);

        const barSeries = BarSeriesBuilder(dataView)
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

        const barSeries = BarSeriesBuilder(dataView)
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
        const dataView = recordedDataView(ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewBy);

        const barSeries = BarSeriesBuilder(dataView)
            .withDataPointModifications(
                datapointFormat,
                datapointWithYValue,
                datapointNoMarkerForNullData,
                datapointNameFromSlice,
            )
            .withStatefulModifications(drillModification([], dataView))
            .populateFromDataSeries(seriesNameFromMeasure)
            .build();

        expect(barSeries).toMatchSnapshot();
    });

    it("creates series with drilling", () => {
        const dataView = recordedDataView(ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewBy);

        const barSeries = BarSeriesBuilder(dataView)
            .withDataPointModifications(
                datapointFormat,
                datapointWithYValue,
                datapointNoMarkerForNullData,
                datapointNameFromSlice,
            )
            .withStatefulModifications(
                drillModification([HeaderPredicates.localIdentifierMatch(ReferenceLdm.Amount)], dataView),
            )
            .populateFromDataSeries(seriesNameFromMeasure)
            .build();

        expect(barSeries).toMatchSnapshot();
    });
});
