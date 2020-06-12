// (C) 2019-2020 GoodData Corporation

//
// Usage example
//

import { IAnalyticalBackend, IWorkspaceCatalogWithAvailableItems } from "@gooddata/sdk-backend-spi";
import { AvailablePlace, IDesignerBucket, InsightDesignerModel, ItemPlacement } from "../api/designerModel";
import { CatalogItem, IInsightDefinition, IMeasure } from "@gooddata/sdk-model";
import { newInsightDesignerSession } from "../api/designer";

function myBackend(): IAnalyticalBackend {
    // @ts-ignore
    return null;
}

function currentWorkspace(): string {
    // @ts-ignore
    return null;
}

/*
 * This example demonstrates how to use insigh designer in sync-blocking mode. All commands are dispatched and
 * awaited until completion. The update model can then be introspected by the view code to render the updates.
 */
export async function syncExampleWithNewInsight() {
    const backend = myBackend();
    const workspace = currentWorkspace();

    /*
     * AD starts or AD workspace switched:
     *
     * This will do initial loading of all the necessary catalog state etc.
     */
    const designerSession = await newInsightDesignerSession(backend, workspace);

    /**
     * Starting a new insight design. This is async purely for consistency sake; loading of existing
     * insight has to be async because of the catalog availability.
     */
    const newDesign = await designerSession.createNew("local:bar");

    let currentModel: InsightDesignerModel = newDesign.model();

    /**
     * Get catalog. allItems & allAvailable items can be used to render the catalog.
     */
    const catalog: IWorkspaceCatalogWithAvailableItems = currentModel.catalog;

    /*
     * Get available buckets, can be used to render the catalog.
     */

    const buckets: IDesignerBucket[] = currentModel.buckets;

    /*
     * Get insight built-so-far; can be used to render the visualization.
     */
    const insight: IInsightDefinition = currentModel.insightDefinition;

    /*
     * Now user starts 'drag' interaction for an item from catalog. Catalog items contain everything
     * that the 'client' code needs to create IMeasure or IAttribute.
     */
    // @ts-ignore
    const dragItem: CatalogItem = null;

    /*
     * Client code finds out D&D targets... note that items such as attributes can be dragged into either
     * measure bucket (to get count of elements) or into an attribute bucket to actually do the slicing.
     *
     * The placement type can be 'available' or 'unavailable'.
     */
    const placements: ItemPlacement[] = currentModel.findPlacement(dragItem);

    /*
     * Now user drops the item onto some bucket. It is clear what needs to be placed where.
     */
    // @ts-ignore
    const effectivePlacement: AvailablePlace = null;

    try {
        await newDesign.insightCommand().placeItem(effectivePlacement);
    } catch (err) {
        // user error or fail
    }

    /*
     * Once the action completes, the insight designer model changes.
     */
    currentModel = newDesign.model();

    /*
     * Get and render new state of buckets. Let's say the user added a new measure. That measure is now
     * in one of the buckets.
     */
    const newBuckets = currentModel.buckets;

    /*
     * User wants to modify the measure.. change title or format.. whatever. Clicks around and then
     * a callback flies with these two parameters:
     *
     * - localId of the measure being modified
     * - the new measure definition (perhaps obtained by interacting with the model)
     */
    // @ts-ignore
    const [localId, measure] = [] as [string, IMeasure];

    try {
        await newDesign.insightCommand().modifyMeasure(localId, measure);
    } catch (err) {
        // user error or fail
    }
}
