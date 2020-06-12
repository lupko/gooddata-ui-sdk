// (C) 2019-2020 GoodData Corporation

import { IAnalyticalBackend, IWorkspaceCatalog } from "@gooddata/sdk-backend-spi";
import {
    IAttribute,
    IAttributeOrMeasure,
    IFilter,
    IInsight,
    IInsightDefinition,
    IMeasure,
    ObjRef,
} from "@gooddata/sdk-model";
import { IPluggableVisualization } from "./pluggableVisualization";
import { ILocale } from "@gooddata/sdk-ui";
import { AvailablePlace, InsightDesignerModel } from "./designerModel";
import { IDesignerEventHandler } from "./designerEvents";
import { IBucketDescriptor } from "./descriptors";

export type SubmittedCommand = {
    ticketId: string;
    result: Promise<CommandResult>;
};

export type CommandResult = {
    type: "ok" | "warning";
    ticketId: string;
    reason: string;
};

export type InsightCommands = {
    /**
     * Convenience command to place an item into a bucket.
     *
     * @param placement - placement to perform
     */
    placeItem: (placement: AvailablePlace) => SubmittedCommand;

    /**
     * Adds a new measure into a bucket.
     *
     * @param measure - new measure to add
     * @param toBucket - bucket name
     */
    addMeasure: (measure: IMeasure, toBucket: string) => SubmittedCommand;

    /**
     * Adds a new attribute into a bucket.
     *
     * @param attribute - new attribute to add
     * @param toBucket - bucket name
     */
    addAttribute: (attribute: IAttribute, toBucket: string) => SubmittedCommand;

    /**
     * Adds a new global filter for the insight.
     *
     * @param filter - filter to add
     */
    addFilter: (filter: IFilter) => SubmittedCommand;

    /**
     * Modifies definition of an existing item. This function will locate existing attribute or measure with
     * the provided localId and replace its definition with the incoming `item` definition.
     *
     * @param localId - localId of existing measure or attribute
     * @param item - new definition
     */
    modifyItem: (localId: string, item: IAttributeOrMeasure) => SubmittedCommand;

    /**
     * Modifies definition of an existing measure. This function will locate existing measure with the
     * provided localId and replace its definition with the incoming `measure` definition.
     *
     * @param localId - localId of the existing measure
     * @param measure - new measure definition
     */
    modifyMeasure: (localId: string, measure: IMeasure) => SubmittedCommand;

    /**
     * Modifies definition of an existing attribute. This function will locate existing attribute with
     * the provided localId and replace its definition with the incoming `attribute` definition.
     *
     * @param localId - localId of an existing attribute
     * @param attribute - new attribute definition
     */
    modifyAttribute: (localId: string, attribute: IAttribute) => SubmittedCommand;

    /**
     * Modifies global filter. This function will locate existing filter by its index in the global
     * filter array and then replace the definition with the incoming `filter` definition.
     *
     * @param filterIdx - index of the global filter
     * @param filter - new filter definition
     */
    modifyFilter: (filterIdx: number, filter: IFilter) => SubmittedCommand;

    /**
     * Removes attribute or measure with the provided localId from the insight.
     *
     * @param localId - localId of item
     */
    removeItem: (localId: string) => SubmittedCommand;

    /**
     * Removes a global filter at the `filterIdx` position.
     *
     * @param filterIdx - filter's index in the global filter array
     */
    removeFilter: (filterIdx: number) => SubmittedCommand;
};

export type DesignerCommands = {
    /**
     * Switches the insight to be rendered by a different visualization
     *
     * @param toVis
     */
    switchVisualization: (toVis: IPluggableVisualization) => SubmittedCommand;

    /**
     * Goes backward in the edit history.
     */
    undo: () => SubmittedCommand;

    /**
     * Goes forward in the edit history.
     */
    redo: () => SubmittedCommand;

    /**
     * Persists currently edited insight.
     */
    save: () => SubmittedCommand;

    /**
     * Persists currently edited insight as a new entity.
     */
    saveAs: () => SubmittedCommand;
};

export interface IInsightDesigner {
    /**
     * Currently persisted version of the insight. Undefined if the insight is not yet persisted.
     */
    persistedInsight: IInsight | undefined;

    /**
     * Returns insight designer model which can be used to perform read-only inspection and interactions with
     * the insight definition..
     */
    model: () => InsightDesignerModel;

    /**
     * Insight modification commands are _the_ commands through which the insight is built or modified. The commands
     * are accessed through a 'factory' function which can be optionally customized with a user-provided `ticketId`.
     *
     * This `ticketId` will then be used in all events that will be emitted during the command processing. If provided,
     * the same `ticketId` will be used when firing commands. If you want to have unique, user-assigned `ticketId`
     * for each command, then always do `insightCommand(ticket).command()`.
     *
     * If no `ticketId` is provided, then unique command identifier is assigned for each fired command.
     */
    insightCommand: (ticketId?: string) => InsightCommands;

    /**
     * Designer commands can be used to modify the state of the designer itself.
     */
    designerCommand: (ticketId?: string) => DesignerCommands;
}

/**
 * This config can be used to fine-tune behavior of the insight designer.
 */
export type InsightDesignerConfig = {
    /**
     * Locale to use for all auto-generated titles and display names.
     *
     * Default: en-US.
     */
    locale?: ILocale;
};

export type InsightDesignerVisConfig = {
    /**
     * Visualization URL - serves as both the unique identifier and the location of visualization's assets.
     */
    visUrl: string;

    /**
     * Function to obtain descriptors of buckets that are available in this visualization.
     *
     * This function will be called after _every_ change to the insight definition:
     *
     * 1.  A new, empty insight definition is created
     * 2.  An item is added/modified/removed
     * 3.  An insight definition created for another visualization type is transformed for this visualization
     *
     * @param insight - current definition of the insight
     */
    bucketDescriptors: (insight: IInsightDefinition) => IBucketDescriptor[];

    /**
     * Function to transform insight definition created and valid for another visualization type to an
     * insight definition valid for this visualization.
     *
     * @param insight - definition of an insight created for another visualization type
     */
    transformInsight: (insight: IInsightDefinition) => IInsightDefinition;
};

export type InsightDesignerVisualizations = {
    [visUrl: string]: InsightDesignerVisConfig;
};

/**
 * Insight Designer Session is bound to a backend and a workspace and can be used to start creation of new, or
 * modification of existing insights.
 *
 * The workspace catalog with all workspace items will be loaded once at the start of the session; all insight
 * designer instances spawned from this session will use this same catalog.
 */
export interface IInsightDesignerSession {
    /**
     * An instance of analytical backend with which this designer session works.
     */
    backend: IAnalyticalBackend;

    /**
     * Identifier of a workspace with which this designer session works.
     */
    workspace: string;

    /**
     * Workspace catalog contains all items in workspace and provides functions to obtain available items within
     * a context of an insight.
     */
    workspaceCatalog: IWorkspaceCatalog;

    /**
     * Registers one or more event handlers for this designer session.
     *
     * @param handlers - event handler(s)
     */
    registerEventHandlers: (...handlers: IDesignerEventHandler[]) => void;

    /**
     * Starts creation of a new insight that will use the provider visualization to render.
     */
    createNew: (visUrl: string) => Promise<IInsightDesigner>;

    /**
     * Loads and existing insight; specified by reference.
     *
     * @param ref - reference of the insight object
     */
    loadExisting: (ref: ObjRef) => Promise<IInsightDesigner>;
}

/**
 * Creates a new insight designer session that will work on top of a particular workspace hosted by an analytical backend. The
 * session can then be used to start designing new or redesigning existing insights.
 *
 * @param backend - backend to connect to
 * @param workspace - workspace on top of which to operate
 * @param config - optionally specify insight designer configuration
 */
// @ts-ignore
export function newInsightDesignerSession(
    _backend: IAnalyticalBackend,
    _workspace: string,
    _config?: InsightDesignerConfig,
): Promise<IInsightDesignerSession> {
    // @ts-ignore
    return null;
}
