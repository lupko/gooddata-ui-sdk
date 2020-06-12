// (C) 2019-2020 GoodData Corporation

/**
 * Types of events emitted during insight designer interactions.
 *
 * The events are intentionally kept on rough granularity for consumption by the view.
 *
 * For instance:
 *
 * - have single bucketUpdated event; whatever happens with the bucket or its content, this will be fired
 *   and will contain the new state of the entire bucket
 * - versus having events such as "bucketMeasureAdded", "bucketMeasureUpdated" that will be fired upon respective
 *   commands.
 */
export type DesignerEventType =
    | "catalogLoadingStarted"
    | "catalogLoadingFinished"
    | "bucketsUpdated"
    | "bucketUpdated"
    | "insightDefinitionUpdated"
    | "insightSaved"
    | "newInsightSaved"
    | "filtersUpdated";

/**
 * Base interface for designer events. Further event interfaces not fleshed out now. Business as usual.
 */
export interface IDesignerEvent<TEvent extends DesignerEventType = DesignerEventType> {
    eventType: TEvent;
    ticketId: string;
}

export interface IDesignerEventHandler {
    handle: (event: IDesignerEvent) => void;
}
