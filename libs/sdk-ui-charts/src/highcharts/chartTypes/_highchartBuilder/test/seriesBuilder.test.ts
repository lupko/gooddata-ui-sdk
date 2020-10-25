// (C) 2007-2020 GoodData Corporation
import { ReferenceLdm, ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedDataView } from "@gooddata/sdk-backend-mockingbird";
import { HeaderPredicates } from "@gooddata/sdk-ui";
import { BarSeriesBuilder } from "../typedSeriesBuilders";
import {
    datapointFormat,
    datapointNameFromSlice,
    datapointWithYValue,
    seriesNameFromMeasure,
    noMarkerForNullData,
} from "../seriesModifications/basic";
import { drillModification } from "../seriesModifications/drilling";

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
            .populateFromDataSeries(seriesNameFromMeasure)
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
                noMarkerForNullData,
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
