// (C) 2019-2020 GoodData Corporation
import { ObjectType } from "@gooddata/sdk-model";

/**
 * Describes a bucket which can be populated during the edit session.
 */
export interface IBucketDescriptor {
    enabled?: boolean;

    /*
     * Various data to display for a bucket
     */

    name: string;
    description: string;
    warningMessage?: string;
    title?: string;
    subtitle?: string;
    icon?: string;

    /*
     * Indicates what interactions are possible for the bucket / items in the bucket.
     */

    allowsDuplicateItems?: boolean;
    allowsReordering?: boolean;
    allowsSwapping?: boolean;

    isShowInPercentEnabled?: boolean;
    isShowInPercentVisible?: boolean;
    isShowOnSecondaryAxisVisible?: boolean;
    allowShowOnSecondaryAxis?: boolean;
    allowSelectChartType?: boolean;
    allowOptionalStacking?: boolean;

    itemsLimit?: number;
    accepts?: ObjectType[];
    canAddItems?: boolean;
}
