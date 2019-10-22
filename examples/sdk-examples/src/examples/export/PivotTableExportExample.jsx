// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { PivotTable } from "@gooddata/sdk-ui";
import { newMeasure, newAttribute, newAttributeSort, newAbsoluteDateFilter } from "@gooddata/sdk-model";

import ExampleWithExport from "./ExampleWithExport";

import {
    dateDataSetUri,
    projectId,
    quarterDateIdentifier,
    monthDateIdentifier,
    locationStateDisplayFormIdentifier,
    locationNameDisplayFormIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
    menuCategoryAttributeDFIdentifier,
} from "../../constants/fixtures";

export class PivotTableExportExample extends Component {
    render() {
        const measures = [
            newMeasure(franchiseFeesIdentifier, m => m.format("#,##0")),
            newMeasure(franchiseFeesAdRoyaltyIdentifier, m => m.format("#,##0")),
            newMeasure(franchiseFeesInitialFranchiseFeeIdentifier, m => m.format("#,##0")),
            newMeasure(franchiseFeesIdentifierOngoingRoyalty, m => m.format("#,##0")),
        ];

        const attributes = [
            newAttribute(locationStateDisplayFormIdentifier),
            newAttribute(locationNameDisplayFormIdentifier),
            newAttribute(menuCategoryAttributeDFIdentifier, a => a.localId("menu")),
        ];

        const columns = [newAttribute(quarterDateIdentifier), newAttribute(monthDateIdentifier)];

        const sortBy = [newAttributeSort("menu", "asc")];

        const filters = [newAbsoluteDateFilter(dateDataSetUri, "2017-01-01", "2017-12-31")];

        return (
            <ExampleWithExport>
                {onExportReady => (
                    <div style={{ height: 300 }} className="s-pivot-table-sorting">
                        <PivotTable
                            projectId={projectId}
                            measures={measures}
                            rows={attributes}
                            columns={columns}
                            pageSize={20}
                            sortBy={sortBy}
                            filters={filters}
                            onExportReady={onExportReady}
                        />
                    </div>
                )}
            </ExampleWithExport>
        );
    }
}

export default PivotTableExportExample;