// (C) 2019-2020 GoodData Corporation

import {
    DateAttributeGranularity,
    CatalogItem,
    IAttribute,
    IAttributeDisplayFormMetadataObject,
    IAttributeOrMeasure,
    IBucket,
    ICatalogAttribute,
    ICatalogDateDataset,
    ICatalogFact,
    ICatalogMeasure,
    IFilter,
    IInsightDefinition,
    IMeasure,
    ObjRef,
} from "@gooddata/sdk-model";
import { IBucketDescriptor } from "./descriptors";
import { IWorkspaceCatalogWithAvailableItems } from "@gooddata/sdk-backend-spi";

type BucketItemType = "dateAttribute" | "attribute" | "measure";

/**
 * Base type for designer's bucket items. This connects the actual definition with available information from
 * catalog and adds few value-added functions to work with the data.
 */
export interface IDesignerBucketItem<
    TCatalog extends CatalogItem = CatalogItem,
    TItem extends IAttributeOrMeasure = IAttributeOrMeasure,
    T extends BucketItemType = BucketItemType
> {
    type: T;

    /**
     * The actual item as used in the insight.
     */
    item: TItem;

    /**
     * The item from catalog which contains extra metadata about the item
     */
    catalogItem: TCatalog;

    /**
     * Returns local identifier of the item.
     */
    localId: () => string;

    /**
     * Creates a new definition with modified title. Note that this will not actually change the insight yet, 'commit'
     * this new definition to the insight designer through the modifyItem() command.
     *
     * @param newName - title
     */
    withDifferentTitle: (newTitle: string) => TItem;

    /**
     * Returns bucket to which this item belongs.
     */
    bucket: () => IDesignerBucket;
}

/**
 * A measure created and managed by the insight designer.
 */
export interface IDesignerMeasure
    extends IDesignerBucketItem<ICatalogMeasure | ICatalogFact | ICatalogAttribute, IMeasure, "measure"> {
    /**
     * Run a query to determine which attributes or date data sets can be used to filter this measure.
     */
    queryAvailableFilters: () => Promise<ICatalogAttribute | ICatalogDateDataset[]>;

    /**
     * Convenience method to create a new measure definition with modified format. Note that this will not actually
     * change the insight yet, 'commit' this new definition to the insight designer through the modifyItem() or modifyMeasure()
     * methods.
     *
     * @param newFormat
     */
    withDifferentFormat: (newFormat: string) => IMeasure;
}

/**
 * An attribute created and managed by the insight designer. Attributes are used for slicing and dicing the
 * results by values of the attribute.
 */
export interface IDesignerAttribute extends IDesignerBucketItem<ICatalogAttribute, IAttribute, "attribute"> {
    /**
     * Label that is currently used
     */
    currentDisplayForm: IAttributeDisplayFormMetadataObject;

    /**
     * Tests whether the currently selected display form is a geo location.
     */
    isGeoLocation: () => boolean;

    /**
     * Convenience method to create a new attribute definition that uses different display form. Note that this will
     * not actually change the insight yet, 'commit' this new definition to the insight designer through the modifyItem()
     * or modifyAttribute() method.
     *
     * @param ref
     */
    withDifferentDisplayForm: (ref: ObjRef) => IAttribute;
}

/**
 * A date attribute can be used for slicing and dicing the results.
 */
export interface IDesignerDateAttribute
    extends IDesignerBucketItem<ICatalogDateDataset, IAttribute, "dateAttribute"> {
    /**
     * Currently selected date dimension granularity.
     */
    currentGranularity: DateAttributeGranularity;

    /**
     * Currently selected date dimension display form.
     */
    currentDisplayForm: IAttributeDisplayFormMetadataObject;

    /**
     * All granularities available for selection.
     */
    availableGranularities: () => DateAttributeGranularity[];

    /**
     *
     * @param granularity
     */
    withDifferentGranularity: (granularity: DateAttributeGranularity) => IAttribute;
}

export interface IDesignerBucket {
    /**
     * Descriptor of the bucket provided various parameters of the bucket itself. These parameters are used when
     * rendering the bucket.
     */
    descriptor: IBucketDescriptor;

    /**
     * The actual content of the bucket; this is what is used for the insight definition itself.
     */
    content: IBucket;

    /**
     * Returns bucket name.
     */
    name: () => string;

    /**
     * Returns items in the bucket enriched with all available metadata and convenience functions.
     */
    asDesignerItems: () => IDesignerBucketItem[];

    /**
     * Given a catalog item, this will return an attribute or measure that MAY be added into the bucket. If
     * it is not possible to add item, either return string with explanation or undefined.
     *
     * Note: this will not actually add the item, only create attribute or measure that can later be added
     * into the buckets using the available commands.
     *
     * @param item - catalog item
     */
    addCatalogItem: (item: CatalogItem) => IAttributeOrMeasure | string | undefined;
}

export interface IDesignerFilter {
    idx: number;

    item: IFilter;
}

export type ItemPlacement = AvailablePlace | UnavailablePlace;

export type AvailablePlace = {
    type: "availablePlace";

    bucket: IDesignerBucket;
    item: IAttributeOrMeasure;
};

export type UnavailablePlace = {
    type: "availablePlace";
    bucket: IDesignerBucket;
    reason: string;
};

/**
 * Insight designer model provides a rich view onto the contents of the insight. The different insight components
 * are augmented with information from metadata and value added functionality.
 */
export type InsightDesignerModel = {
    /**
     * Catalog of all items + information which items are available in the current context.
     */
    catalog: IWorkspaceCatalogWithAvailableItems;

    /**
     * All buckets for the insight.
     */
    buckets: IDesignerBucket[];

    /**
     * All filters for the insight.
     */
    filters: IDesignerFilter[];

    /**
     * Definition of insight built so far.
     */
    insightDefinition: IInsightDefinition;

    /**
     * Given catalog item, calculate and return possible or impossible placement of attribute or measure created
     * from the catalog item.
     *
     * @param item - catalog item
     */
    findPlacement: (item: CatalogItem) => ItemPlacement[];

    /**
     * Find measure by local identifier. This will return the measure with all the necessary metadata and methods attached
     * to it.
     *
     * @param localId - measure local identifier
     */
    findMeasure: (localId: string) => IDesignerMeasure;

    /**
     * Find attribute by local identifier. This will return the attribute (either normal or date attribute) with
     * all necessary metadata and methods attached to it.
     *
     * @param localId - attribute local id
     */
    findAttribute: (localId: string) => IDesignerAttribute | IDesignerDateAttribute;

    /**
     * Find a global filter by its index (essentially identifier). This will return the filter with all
     * necessary metadata and methods attached to it.
     *
     * @param filterIdx - filter's index in the global filter array
     */
    findFilter: (filterIdx: number) => IDesignerFilter;
};
