/// <reference path='./node-base-model.d.ts'/>
import { Property, Complex, Collection, ChildProperty, ComplexFactory, CollectionFactory } from '@syncfusion/ej2-base';
import { ShapeStyle, StrokeStyle } from '../core/appearance';
import { StrokeStyleModel, ShapeStyleModel } from '../core/appearance-model';
import { Point } from '../primitives/point';
import { TextElement } from '../core/elements/text-element';
import { PointModel } from '../primitives/point-model';
import { Segments, DecoratorShapes, Transform, ConnectorConstraints, Direction, LayoutOrientation, Status } from '../enum/enum';
import { DecoratorModel, ConnectorShapeModel, BpmnFlowModel, VectorModel } from './connector-model';
import { Rect } from '../primitives/rect';
import { Size } from '../primitives/size';
import { findAngle, findConnectorPoints, Bridge, getOuterBounds } from '../utility/connector';
import { getAnnotationPosition, alignLabelOnSegments, updateConnector, setUMLActivityDefaults } from '../utility/diagram-util';
import { findDistance, findPath, updatePathElement, setConnectorDefaults } from '../utility/diagram-util';
import { randomId, getFunction } from './../utility/base-util';
import { flipConnector } from './../utility/diagram-util';
import { PathElement } from '../core/elements/path-element';
import { PathAnnotation } from './annotation';
import { Canvas } from '../core/containers/canvas';
import { getDecoratorShape } from './dictionary/common';
import { IElement } from './interface/IElement';
import { Container } from '../core/containers/container';
import { DiagramElement } from '../core/elements/diagram-element';
import { HorizontalAlignment, VerticalAlignment, AssociationFlow, ClassifierShape, Multiplicity } from '../enum/enum';
import { ConnectionShapes, UmlActivityFlows, BpmnFlows, BpmnMessageFlows, BpmnSequenceFlows, BpmnAssociationFlows } from '../enum/enum';
import { SegmentInfo, Alignment } from '../rendering/canvas-interface';
import { PathAnnotationModel } from './annotation-model';
import { NodeBase } from './node-base';
import { DiagramTooltipModel } from './tooltip-model';
import { DiagramTooltip } from './tooltip';
import { Matrix, identityMatrix, rotateMatrix, scaleMatrix, transformPointsByMatrix, transformPointByMatrix } from '../primitives/matrix';
import { OrthogonalSegmentModel, StraightSegmentModel, BezierSegmentModel, ConnectorModel } from './connector-model';
import { RelationShipModel, ClassifierMultiplicityModel, MultiplicityLabelModel } from './connector-model';
import { DiagramHtmlElement } from '../core/elements/html-element';
let getConnectorType: Function = (obj: ConnectorShape): Object => {
    switch (obj.type) {
        case 'Bpmn':
            return BpmnFlow;
        case 'UmlActivity':
            return ActivityFlow;
        case 'UmlClassifier':
            return RelationShip;
        default:
            return ConnectorShape;
    }
};

let getSegmentType: Function = (obj: Connector): Object => {
    switch (obj.type) {
        case 'Straight':
            return StraightSegment;
        case 'Bezier':
            return BezierSegment;
        case 'Orthogonal':
            return OrthogonalSegment;
        default:
            return StraightSegment;
    }
};


/**
 * Decorators are used to decorate the end points of the connector with some predefined path geometry
 */
export class Decorator extends ChildProperty<Decorator> {
    /**
     * Sets the width of the decorator
     * @default 10
     */
    @Property(10)
    public width: number;

    /**
     * Sets the height of the decorator
     * @default 10
     */
    @Property(10)
    public height: number;

    /**
     * Sets the shape of the decorator
     * * None - Sets the decorator shape as None
     * * Arrow - Sets the decorator shape as Arrow
     * * Diamond - Sets the decorator shape as Diamond
     * * Path - Sets the decorator shape as Path
     * * OpenArrow - Sets the decorator shape as OpenArrow
     * * Circle - Sets the decorator shape as Circle
     * * Square - Sets the decorator shape as Square
     * * Fletch - Sets the decorator shape as Fletch
     * * OpenFetch - Sets the decorator shape as OpenFetch
     * * IndentedArrow - Sets the decorator shape as Indented Arrow
     * * OutdentedArrow - Sets the decorator shape as Outdented Arrow
     * * DoubleArrow - Sets the decorator shape as DoubleArrow
     * @default 'Arrow'
     */
    /**
     * ```html
     * <div id='diagram'></div>
     * ```
     * ```typescript
     * let connectors: ConnectorModel[] = [{
     *   id: 'connector', type: 'Straight', sourcePoint: { x: 500, y: 100 }, targetPoint: { x: 600, y: 200 },
     *   sourceDecorator: {
     *    style: { fill: 'black' },
     *    shape: 'Arrow',
     *    pivot: { x: 0, y: 0.5 }},
     *   targetDecorator: {
     *    shape: 'Diamond',
     *    style: { fill: 'blue' },
     *    pivot: { x: 0, y: 0.5 }}
     *  },];
     * let diagram: Diagram = new Diagram({
     * ...
     * connectors: connectors
     * ...
     * });
     * diagram.appendTo('#diagram');
     * ```
     */
    @Property('Arrow')
    public shape: DecoratorShapes;

    /**
     * Defines the appearance of the decorator
     * @default new ShapeStyle()
     */
    @Complex<ShapeStyleModel>({ fill: 'black', strokeColor: 'black', strokeWidth: 1 }, ShapeStyle)
    public style: ShapeStyleModel;

    /**
     * Defines the position of the decorator with respect to the source/target point of the connector
     */
    @Complex<PointModel>({ x: 0, y: 0.5 }, Point)
    public pivot: PointModel;

    /**
     * Defines the geometry of the decorator shape
     * @default ''
     */
    @Property('')
    public pathData: string;

}
/**
 * Describes the length and angle between the control point and the start point of bezier segment
 */
export class Vector extends ChildProperty<Vector> {
    /**
     * Defines the angle between the connector end point and control point of the bezier segment
     * @default 0
     */
    @Property(0)
    public angle: number;

    /**
     * Defines the distance between the connector end point and control point of the bezier segment
     * @default 0
     */
    @Property(0)
    public distance: number;

}

/**
 * Sets the type of the connector
 */
export class ConnectorShape extends ChildProperty<ConnectorShape> {

    /**
     * Defines the application specific type of connector
     * * Bpmn - Sets the type of the connection shape as Bpmn
     * @default 'None'
     */
    @Property('None')
    public type: ConnectionShapes;
}

/**
 * Sets the type of the flow in a BPMN Process
 */
export class ActivityFlow extends ConnectorShape {
    /**
     * Defines the type of the UMLActivity flows
     * Object - Sets the type of the UMLActivity Flow as Object
     * Control - Sets the type of the UMLActivity Flow as Control
     * Exception - Sets the type of the UMLActivity Flow as Exception
     * @default 'Object'
     * @IgnoreSingular
     */
    @Property('Object')
    public flow: UmlActivityFlows;

    /**
     * Defines the height of the exception flow.
     * @default '50'
     */
    @Property(30)
    public exceptionFlowHeight: number;
}

/**
 * Sets the type of the flow in a BPMN Process
 */
export class BpmnFlow extends ConnectorShape {
    /**
     * Sets the type of the Bpmn flows
     * * Sequence - Sets the type of the Bpmn Flow as Sequence
     * * Association - Sets the type of the Bpmn Flow as Association
     * * Message - Sets the type of the Bpmn Flow as Message
     * @default 'Sequence'
     */
    @Property('Sequence')
    public flow: BpmnFlows;
    /**
     * Sets the type of the Bpmn Sequence flows
     * * Default - Sets the type of the sequence flow as Default
     * * Normal - Sets the type of the sequence flow as Normal
     * * Conditional - Sets the type of the sequence flow as Conditional
     * @default 'Normal'
     */
    @Property('Normal')
    public sequence: BpmnSequenceFlows;

    /**
     * Sets the type of the Bpmn message flows
     * * Default - Sets the type of the Message flow as Default
     * * InitiatingMessage - Sets the type of the Message flow as InitiatingMessage
     * * NonInitiatingMessage - Sets the type of the Message flow as NonInitiatingMessage
     * @default ''
     */
    /**
     * ```html
     * <div id='diagram'></div>
     * ```
     * ```typescript
     * let nodes: NodeModel[] = [
     * {
     *   id: 'node1', width: 60, height: 60, offsetX: 75, offsetY: 90,
     *   shape: { type: 'Bpmn', shape: 'Event', event: { event: 'Start', trigger: 'Message' } },
     *     },
     * {
     *   id: 'node2', width: 75, height: 70, offsetX: 210, offsetY: 90,
     *   shape: { type: 'Bpmn', shape: 'Gateway', gateway: { type: 'None' } },
     *  }];
     * let connectors: ConnectorModel[] = [{
     *   id: 'connector', type: 'Straight', sourceID: 'node1', targetID: 'node2',
     *   shape: { type: 'Bpmn', flow: 'Message', message: 'InitiatingMessage' } as BpmnFlowModel
     *  },];
     * let diagram: Diagram = new Diagram({
     * ...
     * nodes: nodes, connectors: connectors
     * ...
     * });
     * diagram.appendTo('#diagram');
     * ```
     */
    @Property('Default')
    public message: BpmnMessageFlows;

    /**
     * Sets the type of the Bpmn association flows
     * * Default - Sets the type of Association flow as Default
     * * Directional - Sets the type of Association flow as Directional
     * * BiDirectional - Sets the type of Association flow as BiDirectional
     * * @default 'Default'
     */
    @Property('Default')
    public association: BpmnAssociationFlows;
}

/**
 * Defines the behavior of connector segments
 */
export class ConnectorSegment extends ChildProperty<ConnectorSegment> {

    /**
     * Defines the type of the segment
     * * Straight - Sets the segment type as Straight
     * * Orthogonal - Sets the segment type as Orthogonal
     * * Bezier - Sets the segment type as Bezier
     * @default 'Straight'
     */
    @Property('Straight')
    public type: Segments;

    /**
     * Defines the segment to be drag or not
     * @default true
     */
    @Property(true)
    public allowDrag: boolean;

    /**
     * @private
     */
    public points: PointModel[];

    /**
     * @private
     */
    public isTerminal: boolean;

    // tslint:disable-next-line:no-any
    constructor(parent: any, propName: string, defaultValue: Object, isArray?: boolean) {
        super(parent, propName, defaultValue, isArray);
        this.points = [];
    }
}

/**
 * Defines the behavior of straight segments
 */
export class StraightSegment extends ConnectorSegment {

    /**
     * Sets the end point of the connector segment
     * @default new Point(0,0)
     */
    @Complex<PointModel>({ x: 0, y: 0 }, Point)
    public point: PointModel;

    /**
     * @private
     * Returns the name of class StraightSegment
     */
    public getClassName(): string {
        return 'StraightSegment';
    }
}

/**
 * Defines the behavior of bezier segments
 */
export class BezierSegment extends StraightSegment {

    /**
     * @private
     * Sets the first control point of the bezier connector
     */
    public bezierPoint1: PointModel;

    /**
     * @private
     *  Sets the second control point of the bezier connector
     */
    public bezierPoint2: PointModel;

    /**
     * Sets the first control point of the connector
     * @default {}
     */
    @Complex<PointModel>({ x: 0, y: 0 }, Point)
    public point1: PointModel;

    /**
     * Sets the second control point of the connector
     * @default {}
     */
    @Complex<PointModel>({ x: 0, y: 0 }, Point)
    public point2: PointModel;

    /**
     * Defines the length and angle between the source point and the first control point of the diagram
     * @default {}
     */
    @Complex<VectorModel>({ angle: 0, distance: 0 }, Vector)
    public vector1: VectorModel;

    /**
     * Defines the length and angle between the target point and the second control point of the diagram
     * @default {}
     */
    @Complex<VectorModel>({ angle: 0, distance: 0 }, Vector)
    public vector2: VectorModel;

    /**
     * @private
     * Returns the name of class BezierSegment
     */
    public getClassName(): string {
        return 'BezierSegment';
    }

}

/**
 * Defines the behavior of orthogonal segments
 */
export class OrthogonalSegment extends ConnectorSegment {

    /**
     * Defines the length of orthogonal segment
     * ```html
     * <div id='diagram'></div>
     * ```
     * ```typescript
     * let connectors: ConnectorModel[] = [{
     *       id: 'link2', sourcePoint: { x: 0, y: 0 }, targetPoint: { x: 40, y: 40 }, type: 'Orthogonal',
     *       shape: {
     *           type: 'Bpmn',
     *           flow: 'Message',
     *           association: 'directional'
     *       }, style: {
     *           strokeDashArray: '2,2'
     *       },
     *       segments: [{ type: 'Orthogonal', length: 30, direction: 'Bottom' },
     *       { type: 'Orthogonal', length: 80, direction: 'Right' }]
     *   }];
     * let diagram: Diagram = new Diagram({
     * ...
     * connectors: connectors
     * ...
     * });
     * diagram.appendTo('#diagram');
     * ```
     * @default 0
     */
    @Property(null)
    public length: number;

    /**
     * Sets the direction of orthogonal segment
     * * Left - Sets the direction type as Left
     * * Right - Sets the direction type as Right
     * * Top - Sets the direction type as Top
     * * Bottom - Sets the direction type as Bottom
     * @default null
     */
    @Property(null)
    public direction: Direction;

    /**
     * @private
     * Returns the module of class OrthogonalSegment
     */
    public getClassName(): string {
        return 'OrthogonalSegment';
    }

}

/**
 * Get the direction of the control points while the bezier is connected to the node
 */
export function getDirection(bounds: Rect, points: PointModel, excludeBounds: boolean): string {
    let center: PointModel = bounds.center;
    let direction: string;
    let part: number = excludeBounds ? 45 : (180 / (2 + 2 / (bounds.height / bounds.width)));
    let fourty5: number = part;
    let one35: number = (180 - part);
    let two25: number = one35 + (2 * part);
    let three15: number = 360 - part;
    let angle: number = findAngle(points, center);
    if (angle > fourty5 && angle < one35) {
        return direction = 'top';
    } else if (angle > one35 && angle < two25) {
        return direction = 'right';
    } else if (angle > two25 && angle < three15) {
        return direction = 'bottom';
    } else {
        return direction = 'left';
    }
}

export function isEmptyVector(element: VectorModel): boolean {
    if (!element.distance && !element.angle) {
        return true;
    }
    return false;
}
/**
 * Get the bezier points if control points are not given.
 */

export function getBezierPoints(sourcePoint: PointModel, targetPoint: PointModel, direction?: string): PointModel {
    let distance: number = 60;
    let value: PointModel = { x: 0, y: 0 };
    if (!direction) {
        if (Math.abs(targetPoint.x - sourcePoint.x) > Math.abs(targetPoint.y - sourcePoint.y)) {
            direction = sourcePoint.x < targetPoint.x ? 'right' : 'left';
        } else {
            direction = sourcePoint.y < targetPoint.y ? 'bottom' : 'top';
        }
    }
    switch (direction) {
        case 'bottom':
        case 'top':
            distance = Math.min(Math.abs(sourcePoint.y - targetPoint.y) * 0.45, distance);
            value = { x: sourcePoint.x, y: sourcePoint.y + (direction === 'bottom' ? distance : -distance) };
            break;
        case 'right':
        case 'left':
            distance = Math.min(Math.abs(sourcePoint.x - targetPoint.x) * 0.45, distance);
            value = { x: sourcePoint.x + (direction === 'right' ? distance : - distance), y: sourcePoint.y };
            break;
    }
    return value;

}


/**
 * Get the bezier curve bounds.
 */
export function getBezierBounds(
    startPoint: PointModel, controlPoint1: PointModel, controlPoint2: PointModel, endPoint: PointModel, connector: Connector): Rect {
    let minx: number = 0;
    let miny: number = 0;
    let maxx: number = 0;
    let maxy: number = 0;
    let tolerancevalue: number = 3;
    let max: number = Number(((connector as Connector).distance(controlPoint1, startPoint) +
        (connector as Connector).distance(controlPoint2, controlPoint1) +
        (connector as Connector).distance(endPoint, controlPoint2)) / tolerancevalue);
    if (max !== 0) {
        for (let i: number = 0; i <= max; i++) {
            let t: number = i / max;
            let x: number = (1 - t) * (1 - t) * (1 - t) * startPoint.x +
                3 * t * (1 - t) * (1 - t) * controlPoint1.x +
                3 * t * t * (1 - t) * controlPoint2.x +
                t * t * t * endPoint.x;
            let y: number = (1 - t) * (1 - t) * (1 - t) * startPoint.y +
                3 * t * (1 - t) * (1 - t) * controlPoint1.y +
                3 * t * t * (1 - t) * controlPoint2.y +
                t * t * t * endPoint.y;
            if (i === 0) {
                minx = maxx = x;
                miny = maxy = y;
            } else {
                minx = Math.min(x, minx);
                miny = Math.min(y, miny);
                maxx = Math.max(x, maxx);
                maxy = Math.max(y, maxy);
            }
        }
    }
    return {
        x: minx, y: miny, width: maxx - minx, height: maxy - miny,
        left: minx, top: miny, right: (minx + (maxx - minx)), bottom: (miny + (maxy - miny)),
        center: { x: (minx + (maxx - minx)) / 2, y: (miny + (maxy - miny)) / 2 },
    } as Rect;
}

/**
 * Get the intermediate bezier curve for point over connector
 */
export function bezierPoints(
    connector: ConnectorModel, startPoint: PointModel, point1: PointModel, point2: PointModel,
    endPoint: PointModel, i: number, max: number):
    PointModel {
    let pt: PointModel = { x: 0, y: 0 };
    let t: number = i / max;
    let x: number = (1 - t) * (1 - t) * (1 - t) * startPoint.x +
        3 * t * (1 - t) * (1 - t) * point1.x +
        3 * t * t * (1 - t) * point2.x +
        t * t * t * endPoint.x;
    pt.x = x;
    let y: number = (1 - t) * (1 - t) * (1 - t) * startPoint.y +
        3 * t * (1 - t) * (1 - t) * point1.y +
        3 * t * t * (1 - t) * point2.y +
        t * t * t * endPoint.y;
    pt.y = y;
    return pt;
}

/**
 * Defines the behavior of the UMLActivity Classifier multiplicity connection defaults
 */
export class MultiplicityLabel extends ChildProperty<MultiplicityLabel>  {
    /**
     * Defines the type of the Classifier Multiplicity
     * @default true
     * @IgnoreSingular
     */
    @Property(true)
    public optional: boolean;
    /**
     * Defines the type of the Classifier Multiplicity
     * @default ''
     * @IgnoreSingular
     */
    @Property(undefined)
    public lowerBounds: string;
    /**
     * Defines the type of the Classifier Multiplicity
     * @default ''
     * @IgnoreSingular
     */
    @Property(undefined)
    public upperBounds: string;
}
/**
 * Defines the behavior of the UMLActivity Classifier multiplicity connection defaults
 */
export class ClassifierMultiplicity extends ChildProperty<ClassifierMultiplicity>  {
    /**
     * Defines the type of the Classifier Multiplicity
     * @default 'OneToOne'
     * @IgnoreSingular
     */
    @Property('OneToOne')
    public type: Multiplicity;
    /**
     * Defines the type of the Classifier Multiplicity
     * @default ''
     * @IgnoreSingular
     */
    @Complex<MultiplicityLabelModel>({}, MultiplicityLabel)
    public target: MultiplicityLabelModel;
    /**
     * Defines the type of the Classifier Multiplicity
     * @default ''
     * @IgnoreSingular
     */
    @Complex<MultiplicityLabelModel>({}, MultiplicityLabel)
    public source: MultiplicityLabelModel;
}
/**
 * Defines the behavior of the UMLActivity shape
 */
export class RelationShip extends ConnectorShape {
    /**
     * Defines the type of the  UMLConnector
     * @default 'None'
     * @IgnoreSingular
     */
    @Property('UmlClassifier')
    public type: ConnectionShapes;
    /**
     * Defines the association direction
     * @default 'Aggregation'
     * @IgnoreSingular
     */
    @Property('Aggregation')
    public relationship: ClassifierShape;
    /**
     * Defines the association direction
     * @default 'Directional'
     * @IgnoreSingular
     */
    @Property('Directional')
    public associationType: AssociationFlow;
    /**
     * Defines the type of the Classifier Multiplicity
     * @default ''
     * @IgnoreSingular
     */
    @Complex<ClassifierMultiplicityModel>({}, ClassifierMultiplicity)
    public multiplicity: ClassifierMultiplicityModel;
}

/**
 * Connectors are used to create links between nodes
 */
export class Connector extends NodeBase implements IElement {

    /**
     * Defines the shape of the connector
     * @default 'Bpmn'
     * @aspType object
     */
    @ComplexFactory(getConnectorType)
    public shape: ConnectorShapeModel | BpmnFlowModel | RelationShipModel;

    /**
     * Defines the constraints of connector
     * * None - Interaction of the connectors cannot be done.
     * * Select - Selects the connector.
     * * Delete - Delete the connector.
     * * Drag - Drag the connector.
     * * DragSourceEnd - Drag the source end of the connector.
     * * DragTargetEnd - Drag the target end of the connector.
     * * DragSegmentThump - Drag the segment thumb of the connector.
     * * AllowDrop - Allow to drop a node.
     * * Bridging - Creates bridge  on intersection of two connectors.
     * * InheritBridging - Creates bridge  on intersection of two connectors.
     * * PointerEvents - Sets the pointer events.
     * * Tooltip - Displays a tooltip for the connectors.
     * * InheritToolTip - Displays a tooltip for the connectors.
     * * Interaction - Features of the connector used for interaction.
     * * ReadOnly - Enables ReadOnly
     * @default 'None'
     * @aspNumberEnum
     * @blazorNumberEnum
     */
    @Property(ConnectorConstraints.Default)
    public constraints: ConnectorConstraints;
    /**
     * Defines the bridgeSpace of connector
     * @default 10
     */
    @Property(10)
    public bridgeSpace: number;

    /**
     * Defines the collection of textual annotations of connectors
     * @aspDefaultValueIgnore
     * @blazorDefaultValueIgnore
     * @default undefined
     */

    /**
     * ```html
     * <div id='diagram'></div>
     * ```
     * ```typescript
     * let connectors: ConnectorModel[] = [{
     *   id: 'connector', type: 'Straight', sourcePoint: { x: 500, y: 100 }, targetPoint: { x: 600, y: 200 },
     * annotations: [{ content: 'No', offset: 0, alignment: 'After' }]
     * ];
     * let diagram: Diagram = new Diagram({
     * ...
     * connectors: connectors
     * ...
     * });
     * diagram.appendTo('#diagram');
     * ```
     */
    @Collection<PathAnnotationModel>([], PathAnnotation)
    public annotations: PathAnnotationModel[];

    /**
     * Sets the beginning point of the connector
     * @default new Point(0,0)
     */
    @Complex<PointModel>({}, Point)
    public sourcePoint: PointModel;

    /**
     * Sets the end point of the connector
     * @default new Point(0,0)
     */
    @Complex<PointModel>({}, Point)
    public targetPoint: PointModel;

    /**
     * Defines the segments
     * @default []
     * @aspType object
     * @blazorType object
     */
    @CollectionFactory(getSegmentType)
    public segments: (OrthogonalSegmentModel | StraightSegmentModel | BezierSegmentModel)[];

    /**
     * Sets the source node/connector object of the connector
     * @default null
     */
    @Property('')
    public sourceID: string;

    /**
     * Sets the target node/connector object of the connector
     * @default null
     */
    @Property('')
    public targetID: string;

    /**
     * Sets the connector padding value
     * @default 10
     */
    @Property(10)
    public hitPadding: number;


    /**
     * Defines the type of the connector
     * * Straight - Sets the segment type as Straight
     * * Orthogonal - Sets the segment type as Orthogonal
     * * Bezier - Sets the segment type as Bezier
     * @default 'Straight'
     * @aspType Syncfusion.EJ2.Diagrams.Segments
     * @blazorDefaultValueIgnore
     * @blazorDefaultValue  Syncfusion.EJ2.Blazor.Diagrams.Segments.Straight
     */
    @Property('Straight')
    public type: Segments;

    /**
     * Sets the corner radius of the connector
     * @default 0
     */
    @Property(0)
    public cornerRadius: number;

    /**
     * Defines the source decorator of the connector
     * @default new Decorator()
     */
    @Complex<DecoratorModel>({ shape: 'None' }, Decorator)
    public sourceDecorator: DecoratorModel;

    /**
     * Defines the target decorator of the connector
     * @default new Decorator()
     */
    @Complex<DecoratorModel>({ shape: 'Arrow' }, Decorator)
    public targetDecorator: DecoratorModel;

    /** 
     * defines the tooltip for the connector
     * @default new DiagramToolTip();
     */
    @Complex<DiagramTooltipModel>({}, DiagramTooltip)
    public tooltip: DiagramTooltipModel;

    /**
     * Sets the unique id of the source port of the connector
     * @default ''
     */
    @Property('')
    public sourcePortID: string;

    /**
     * Sets the unique id of the target port of the connector
     * @default ''
     */
    @Property('')
    public targetPortID: string;

    /**
     * Sets the source padding of the connector
     * @default 0
     * @isBlazorNullableType true
     */
    @Property(0)
    public sourcePadding: number;

    /**
     * Sets the target padding of the connector
     * @default 0
     * @isBlazorNullableType true
     */
    @Property(0)
    public targetPadding: number;

    /**
     * Defines the appearance of the connection path
     * @default ''
     */
    @Complex<StrokeStyleModel>({ strokeWidth: 1, strokeColor: 'black' }, StrokeStyle)
    public style: StrokeStyleModel;

    /** @private */
    public parentId: string = '';

    /**
     * Defines the UI of the connector
     * @default null
     */
    @Property(null)
    public wrapper: Container;
    /** @private */
    public bridges: Bridge[] = [];
    /** @private */
    public sourceWrapper: DiagramElement;
    /** @private */
    public targetWrapper: DiagramElement;
    /** @private */
    public sourcePortWrapper: DiagramElement;
    /** @private */
    public targetPortWrapper: DiagramElement;

    /** @private */
    public intermediatePoints: PointModel[];
    /** @private */
    public status: Status = 'None';

    // tslint:disable-next-line:no-any
    constructor(parent: any, propName: string, defaultValue: Object, isArray?: boolean) {
        super(parent, propName, defaultValue, isArray);
        if (this.shape && this.shape.type === 'UmlActivity') {
            setUMLActivityDefaults(defaultValue, this);
        }
        if (defaultValue && (defaultValue as Connector).shape && (defaultValue as Connector).shape.type !== 'None') {
            setConnectorDefaults(defaultValue, this);
        }
    }
    /** @private */
    // tslint:disable-next-line:no-any
    public init(diagram: any): Canvas {
        if (!this.id) {
            this.id = randomId();
        }
        let bpmnElement: PathElement;
        let container: Canvas = new Canvas();
        let segment: PathElement = new PathElement();
        segment.id = this.id + '_path';
        let srcDecorator: PathElement = new PathElement();
        let targetDecorator: PathElement = new PathElement();
        segment = this.getSegmentElement(this, segment);
        let bounds: Rect;
        let points: PointModel[] = [];
        points = this.getConnectorPoints(this.type);
        points = this.clipDecorators(this, points);
        bounds = Rect.toBounds(points);
        container.width = bounds.width;
        container.height = bounds.height;
        container.offsetX = bounds.x + container.pivot.x * bounds.width;
        container.offsetY = bounds.y + container.pivot.y * bounds.height;

        switch (this.shape.type) {
            case 'Bpmn':
                switch ((this.shape as BpmnFlow).flow) {
                    case 'Sequence':
                        bpmnElement = this.getBpmnSequenceFlow();
                        break;
                    case 'Association':
                        bpmnElement = new PathElement();
                        bpmnElement.visible = false;
                        this.getBpmnAssociationFlow();
                        break;
                    case 'Message':
                        bpmnElement = this.getBpmnMessageFlow();
                        segment = this.getSegmentElement(this, segment);
                        this.updateShapePosition(this, bpmnElement);
                        break;
                }
                break;
            case 'UmlActivity':
                switch ((this.shape as ActivityFlow).flow) {
                    case 'Object':
                        this.getUMLObjectFlow();
                        break;
                    case 'Exception':
                        this.getUMLExceptionFlow(segment);
                        break;
                }
                break;
            case 'UmlClassifier':
                this.getConnectorRelation();
                break;
        }
        let anglePoints: PointModel[] = this.intermediatePoints as PointModel[];
        if (this.type === 'Bezier') {
            let firstSegment: BezierSegment = this.segments[0] as BezierSegment;
            let lastSegment: BezierSegment = this.segments[this.segments.length - 1] as BezierSegment;
            anglePoints = [!Point.isEmptyPoint(lastSegment.point2) ? lastSegment.point2 : lastSegment.bezierPoint2,
            !Point.isEmptyPoint(firstSegment.point1) ? firstSegment.point1 : firstSegment.bezierPoint1];
        }
        let accessContent: string = 'getDescription';
        let getDescription: Function = diagram[accessContent];
        let strokeWidth: number = this.sourceWrapper ? this.sourceWrapper.style.strokeWidth / 2 / 2 : 0;

        srcDecorator = this.getDecoratorElement(
            points[0], anglePoints[1], this.sourceDecorator, true, getDescription);
        targetDecorator = this.getDecoratorElement(
            points[points.length - 1], anglePoints[anglePoints.length - 2], this.targetDecorator, false, getDescription);

        srcDecorator.id = this.id + '_srcDec';
        targetDecorator.id = this.id + '_tarDec';
        segment.style = this.style as ShapeStyle;
        /* tslint:disable:no-string-literal */
        segment.style['fill'] = 'transparent';
        if (getDescription !== undefined) {
            // tslint:disable-next-line:no-any
            let wrapperContent: any = getDescription(this, diagram);
            segment.description = wrapperContent ? wrapperContent : this.id;
        }
        container.style.strokeColor = 'transparent';
        container.style.fill = 'transparent';
        container.style.strokeWidth = 0;
        container.children = [segment, srcDecorator, targetDecorator];
        container.id = this.id;
        if (bpmnElement !== undefined) {
            container.children.push(bpmnElement);
        }
        container.offsetX = segment.offsetX;
        container.offsetY = segment.offsetY;
        container.width = segment.width;
        container.height = segment.height;
        for (let i: number = 0; this.annotations !== undefined, i < this.annotations.length; i++) {
            container.children.push(
                this.getAnnotationElement(
                    this.annotations[i] as PathAnnotation, this.intermediatePoints, bounds, getDescription, diagram.element.id));
        }
        this.wrapper = container;
        return container;
    }

    private getConnectorRelation(): void {
        let shape: RelationShip = (this.shape as RelationShip);
        if (shape.relationship === 'Association') {
            this.segments[0].type = 'Straight';
            this.sourceDecorator.shape = 'None';
            this.targetDecorator.shape = 'Arrow';

        } else if (shape.relationship === 'Inheritance') {
            this.segments[0].type = 'Orthogonal';
            this.sourceDecorator.shape = 'None';
            this.targetDecorator.shape = 'Arrow';
        } else if (shape.relationship === 'Composition') {
            this.segments[0].type = 'Orthogonal';
            this.sourceDecorator.shape = 'Diamond';
            this.targetDecorator.shape = 'None';
        } else if (shape.relationship === 'Aggregation') {
            this.segments[0].type = 'Orthogonal';
            this.sourceDecorator.shape = 'Diamond';
            this.targetDecorator.shape = 'None';
        } else if (shape.relationship === 'Dependency') {
            this.segments[0].type = 'Orthogonal';
            this.sourceDecorator.shape = 'None';
            this.targetDecorator.shape = 'OpenArrow';
        } else if (shape.relationship === 'Realization') {
            this.segments[0].type = 'Orthogonal';
            this.sourceDecorator.shape = 'None';
            this.targetDecorator.shape = 'Arrow';
        }
        if (shape.associationType === 'BiDirectional') {
            this.sourceDecorator.shape = 'None';
            this.targetDecorator.shape = 'None';
        }
        let text1: string = '';
        let lower: MultiplicityLabelModel;
        let upper: MultiplicityLabelModel;
        let sourceText: string = '';
        let targetText: string = '';
        let text: string = '';
        if (shape.multiplicity.source) {
            shape.multiplicity.source.lowerBounds = shape.multiplicity.source.lowerBounds;
            shape.multiplicity.source.upperBounds = shape.multiplicity.source.upperBounds;
        }
        if (shape.multiplicity.target) {
            shape.multiplicity.target.lowerBounds = shape.multiplicity.target.lowerBounds;
            shape.multiplicity.target.upperBounds = shape.multiplicity.target.upperBounds;
        }
        lower = shape.multiplicity.source;
        upper = shape.multiplicity.target;
        text = lower.upperBounds ? lower.lowerBounds + '...' + lower.upperBounds : lower.lowerBounds;
        text1 = upper.upperBounds ? upper.lowerBounds + '...' + upper.upperBounds : upper.lowerBounds;
        if (shape.multiplicity.type === 'ManyToOne') {
            shape.multiplicity.target.optional = false;
            sourceText = text ? text : '*'; targetText = '1';
        }
        if (shape.multiplicity.type === 'OneToMany') {
            shape.multiplicity.source.optional = false;
            targetText = text1 ? text1 : '*'; sourceText = '1';
        }
        if (shape.multiplicity.type === 'ManyToOne') {
            sourceText = text ? text : '*'; targetText = text1 ? text1 : '*';
        }
        if (shape.multiplicity.type === 'OneToOne') {
            shape.multiplicity.target.optional = false;
            shape.multiplicity.source.optional = false;
            sourceText = '1'; targetText = '1';
        }
        this.annotations = [
            {
                id: this.id + 'sourcelabel', content: sourceText, offset: 0, alignment: 'Before',
                margin: { right: 5, bottom: 5 }
            },
            {
                id: this.id + 'targetlabel', content: targetText, offset: 1, alignment: 'Before',
                margin: { right: 5, bottom: 5 }
            }];
    }

    private getBpmnSequenceFlow(): PathElement {
        let segment: PathElement = new PathElement(); let pathseq: PathElement = new PathElement(); let pathseqData: Object;
        if (((this.shape as BpmnFlow).sequence) === 'Normal' && this.type !== 'Bezier') {
            this.targetDecorator.shape = 'Arrow';
        }
        if (((this.shape as BpmnFlow).sequence) === 'Default') {
            segment = this.getSegmentElement(this, segment);
            let anglePoints: PointModel[] = this.intermediatePoints as PointModel[];
            pathseq = updatePathElement(anglePoints, this);
            this.targetDecorator.shape = 'Arrow';
        }
        if (((this.shape as BpmnFlow).sequence) === 'Conditional') {
            this.targetDecorator.shape = 'Arrow'; this.sourceDecorator.shape = 'Diamond';
            (pathseq as DiagramElement).id = this.id + this.shape.type;
        }
        return pathseq;
    }
    /** @private */
    public getUMLObjectFlow(): void {
        if (this.annotations) {
            for (let i: number = 0; i < this.annotations.length; i++) {
                this.annotations[i].content = '[' + this.annotations[i].content + ']';
            }
        }
    }

    /** @private */
    public getUMLExceptionFlow(segment: PathElement): void {
        this.type = 'Straight';
        let height: number = ((this.shape as ActivityFlow).exceptionFlowHeight) / 2;
        let midPt: PointModel = { x: (this.targetPoint.x + this.sourcePoint.x) / 2, y: (this.targetPoint.y + this.sourcePoint.y) / 2 };
        let xDist: number = midPt.x - this.sourcePoint.x;
        let yDist: number = midPt.y - this.sourcePoint.y;
        let dist: number = Math.sqrt(xDist * xDist + yDist * yDist);
        let fractionOfTotal: number = (height) / dist;
        let midPt2: PointModel = { x: midPt.x - xDist * fractionOfTotal, y: midPt.y - yDist * fractionOfTotal };
        let midPt1: PointModel = { x: midPt.x + xDist * fractionOfTotal, y: midPt.y + yDist * fractionOfTotal };
        let matrix: Matrix = identityMatrix();
        rotateMatrix(matrix, 315, midPt.x, midPt.y);
        this.segments = [];
        let segments: StraightSegmentModel = new StraightSegment(
            this, 'segments', { type: 'Straight', point: transformPointByMatrix(matrix, midPt1) }, true);
        (this.segments).push(segments);

        segments = new StraightSegment(
            this, 'segments', { type: 'Straight', point: transformPointByMatrix(matrix, midPt2) }, true);
        (this.segments).push(segments);
        segment = this.getSegmentElement(this, segment);
    }

    private getBpmnAssociationFlow(): void {
        if (((this.shape as BpmnFlow).association) === 'Default') {
            this.targetDecorator.shape = 'Arrow';
        }
        if (((this.shape as BpmnFlow).association) === 'Directional') {
            this.targetDecorator.shape = 'Arrow';
        }
        if (((this.shape as BpmnFlow).association) === 'BiDirectional') {
            this.targetDecorator.shape = 'Arrow';
            this.sourceDecorator.shape = 'Arrow';
        }
    }

    private getBpmnMessageFlow(): PathElement {
        let segmentMessage: PathElement = new PathElement();
        this.targetDecorator.shape = 'Arrow';
        this.targetDecorator.width = 5;
        this.targetDecorator.height = 10;
        this.sourceDecorator.shape = 'Circle';
        if ((((this.shape as BpmnFlow).message) === 'InitiatingMessage') ||
            (((this.shape as BpmnFlow).message) === 'NonInitiatingMessage')) {
            segmentMessage.id = this.id + '_' + ((this.shape as BpmnFlow).message);
            segmentMessage.width = 25; segmentMessage.height = 15;
            segmentMessage.data = 'M0,0 L19.8,12.8 L40,0 L0, 0 L0, 25.5 L40, 25.5 L 40, 0';
            segmentMessage.horizontalAlignment = 'Center';
            segmentMessage.verticalAlignment = 'Center'; segmentMessage.transform = Transform.Self;
            segmentMessage.style.fill = ((this.shape as BpmnFlow).message) === 'NonInitiatingMessage' ? 'lightgrey' : 'white';
        }
        return segmentMessage;
    }

    /** @private */
    public distance(pt1: PointModel, pt2: PointModel): number {
        return findDistance(pt1, pt2);
    }
    /**   @private  */
    public findPath(sourcePt: PointModel, targetPt: PointModel): Object {
        return findPath(sourcePt, targetPt);
    }
    /** @private */
    public getAnnotationElement(
        annotation: PathAnnotation, points: PointModel[], bounds: Rect, getDescription: Function | string, diagramId: string)
        :
        TextElement | DiagramHtmlElement {
        annotation.id = annotation.id || randomId();
        let textele: TextElement | DiagramHtmlElement;
        if (diagramId && annotation.template) {
            textele = new DiagramHtmlElement(this.id, diagramId, annotation.id);
            textele.content = annotation.template;
        } else {
            textele = new TextElement();
            textele.content = annotation.content;
            textele.style.textOverflow = 'Wrap';
        }
        textele.constraints = annotation.constraints;
        textele.visible = annotation.visibility;
        textele.rotateAngle = annotation.rotateAngle;
        textele.horizontalAlignment = annotation.horizontalAlignment;
        textele.verticalAlignment = annotation.verticalAlignment;
        textele.width = annotation.width;
        textele.height = annotation.height;
        if (bounds.width !== undefined && !annotation.template) {
            textele.width = (annotation.width || bounds.width) - annotation.margin.left - annotation.margin.right;
        }
        textele.margin = annotation.margin;
        textele.id = this.id + '_' + annotation.id;
        if (bounds.width === 0) { bounds.width = this.style.strokeWidth; }
        if (bounds.height === 0) { bounds.height = this.style.strokeWidth; }
        textele.style = annotation.style;
        // tslint:disable-next-line:no-any
        let wrapperContent: any;
        let description: Function = getFunction(getDescription);
        if (description) {
            wrapperContent = description(annotation, this);
        }
        textele.description = wrapperContent ? wrapperContent : textele.id;
        this.updateAnnotation(annotation, points, bounds, textele);
        return textele;
    }
    /** @private */
    public updateAnnotation(
        annotation: PathAnnotation, points: PointModel[], bounds: Rect, textElement: TextElement | DiagramHtmlElement, canRefresh?: number
    ): void {
        let getPointloop: SegmentInfo;
        let newPoint: PointModel; let align: Alignment; let hAlign: string;
        let vAlign: string; let offsetPoint: PointModel; let pivotPoint: PointModel = { x: 0, y: 0 };
        if (!(textElement instanceof DiagramHtmlElement) && (!canRefresh)) {
            (textElement as TextElement).refreshTextElement();
        }
        textElement.width = (annotation.width || bounds.width);
        getPointloop = getAnnotationPosition(points, annotation, bounds);
        newPoint = getPointloop.point;
        if (annotation.segmentAngle) {
            textElement.rotateAngle = annotation.rotateAngle + getPointloop.angle;
            textElement.rotateAngle = (textElement.rotateAngle + 360) % 360;
        }
        if (bounds.width === 0) { bounds.width = this.style.strokeWidth; }
        if (bounds.height === 0) { bounds.height = this.style.strokeWidth; }
        offsetPoint = { x: ((newPoint.x - bounds.x) / bounds.width), y: ((newPoint.y - bounds.y) / bounds.height) };
        pivotPoint.x = bounds.width * offsetPoint.x;
        pivotPoint.y = bounds.height * offsetPoint.y;
        align = alignLabelOnSegments(annotation, getPointloop.angle, points);
        hAlign = align.hAlign; vAlign = align.vAlign;
        let horizor: HorizontalAlignment; let verzor: VerticalAlignment;
        if (hAlign === 'left') {
            horizor = 'Left';
            pivotPoint.x += annotation.displacement.x;
        } else if (hAlign === 'right') {
            horizor = 'Right';
            pivotPoint.x -= annotation.displacement.x;
        } else if (hAlign === 'center') {
            horizor = 'Center';
        }
        if (vAlign === 'top') {
            verzor = 'Top';
            pivotPoint.y += annotation.displacement.y;
        } else if (vAlign === 'bottom') {
            verzor = 'Bottom';
            pivotPoint.y -= annotation.displacement.y;
        } else if (vAlign === 'center') {
            verzor = 'Center';
        }
        textElement.horizontalAlignment = horizor;
        textElement.verticalAlignment = verzor;
        textElement.setOffsetWithRespectToBounds(pivotPoint.x, pivotPoint.y, 'Absolute');
        textElement.relativeMode = 'Point';
    }
    /** @private */
    public getConnectorPoints(type: Segments, points?: PointModel[], layoutOrientation?: LayoutOrientation): PointModel[] {
        let width: number = Math.abs(this.sourcePoint.x - this.targetPoint.x);
        let height: number = Math.abs(this.sourcePoint.y - this.targetPoint.y);
        points = findConnectorPoints(this, layoutOrientation);
        let newPoints: PointModel[] = points.slice(0);
        if (newPoints && newPoints.length > 0) {
            this.sourcePoint = newPoints[0];
            this.targetPoint = newPoints[newPoints.length - 1];
        }
        return newPoints;
    }

    /** @private */
    private clipDecorator(connector: Connector, points: PointModel[], isSource: boolean): PointModel {
        let point: PointModel = { x: 0, y: 0 };
        let start: PointModel = { x: 0, y: 0 };
        let end: PointModel = { x: 0, y: 0 };
        let length: number = points.length;
        start = !isSource ? points[length - 1] : points[0];
        end = !isSource ? points[length - 2] : points[1];
        let len: number = Point.distancePoints(start, end);
        len = (len === 0) ? 1 : len;
        let strokeWidth: number = 1;
        let node: DiagramElement = isSource ? connector.sourceWrapper : connector.targetWrapper;
        if (node) {
            strokeWidth = node.style.strokeWidth;
        }
        let width: number = strokeWidth - 1;
        point.x = (Math.round(start.x + width * (end.x - start.x) / len));
        point.y = (Math.round(start.y + width * (end.y - start.y) / len));
        if ((isSource && connector.sourceDecorator.shape !== 'None') ||
            (!isSource && connector.targetDecorator.shape !== 'None')) {
            point = Point.adjustPoint(point, end, true, (strokeWidth / 2));
        }
        return point;
    }

    /** @private */
    public clipDecorators(connector: Connector, pts: PointModel[]): PointModel[] {
        if (connector.sourceDecorator.shape !== 'None') {
            pts[0] = this.clipDecorator(connector, pts, true);
        }
        if (connector.targetDecorator.shape !== 'None') {
            pts[pts.length - 1] = this.clipDecorator(connector, pts, false);
        }
        return pts;
    }

    /** @private */
    public updateSegmentElement(connector: Connector, points: PointModel[], element: PathElement): PathElement {
        let segmentPath: string; let bounds: Rect = new Rect();
        let point: PointModel[];
        segmentPath = this.getSegmentPath(connector, points);
        if (connector.type === 'Bezier') {
            if (this.segments.length > 0) {
                for (let i: number = 0; i < this.segments.length; i++) {
                    let segment: BezierSegment = this.segments[i] as BezierSegment;
                    let connectorSegment: BezierSegment = connector.segments[i] as BezierSegment;
                    let point1: PointModel = !Point.isEmptyPoint(segment.point1) ? connectorSegment.point1 : connectorSegment.bezierPoint1;
                    let point2: PointModel = !Point.isEmptyPoint(segment.point2) ? connectorSegment.point2 : connectorSegment.bezierPoint2;
                    bounds.uniteRect(getBezierBounds(segment.points[0], point1, point2, segment.points[1], connector));
                }
            }
        } else {
            bounds = Rect.toBounds(points);
        }
        element.width = bounds.width;
        element.height = bounds.height;
        element.offsetX = bounds.x + element.width / 2;
        element.offsetY = bounds.y + element.height / 2;
        element.data = segmentPath;
        if (connector.wrapper) {
            connector.wrapper.offsetX = element.offsetX;
            connector.wrapper.offsetY = element.offsetY;
            connector.wrapper.width = bounds.width;
            connector.wrapper.height = bounds.height;
        }
        return element;
    }
    /** @private */
    public getSegmentElement(connector: Connector, segmentElement: PathElement, layoutOrientation?: LayoutOrientation): PathElement {
        let bounds: Rect; let segmentPath: string;
        let points: PointModel[] = [];
        flipConnector(connector);
        points = this.getConnectorPoints(connector.type, undefined, layoutOrientation);
        this.intermediatePoints = points;
        segmentElement.staticSize = true;
        segmentElement = this.updateSegmentElement(connector, points, segmentElement);
        return segmentElement;
    }
    /** @private */
    public getDecoratorElement(
        offsetPoint: PointModel, adjacentPoint: PointModel, decorator: DecoratorModel,
        isSource: Boolean, getDescription?: Function)
        :
        PathElement {
        let decEle: PathElement = new PathElement();
        let getPath: string; let angle: number;
        decEle.transform = Transform.Self;
        this.updateDecoratorElement(decEle, offsetPoint, adjacentPoint, decorator);
        if (getDescription !== undefined) {
            // tslint:disable-next-line:no-any
            let wrapperContent: any = getDescription(decorator, this);
            decEle.description = wrapperContent ? wrapperContent :
                ('Specifies the ' + isSource ? 'source' : 'target' + 'port element of the connector');
        }
        return decEle;
    }

    private bridgePath(connector: Connector, path: string, pointIndex: number): string {
        let pathData: string = path;
        if (connector.bridges.length > 0) {
            if (connector.type === 'Straight' && connector.segments.length < 2) {
                for (let n: number = 0; n < connector.bridges.length; n++) {
                    let bridge: Bridge = connector.bridges[n];
                    if (!bridge.rendered) {
                        pathData += ' L' + bridge.startPoint.x + ' ' + bridge.startPoint.y;
                        pathData += bridge.path;
                        bridge.rendered = true;
                    }
                }
            } else if (connector.type === 'Orthogonal' || (connector.type === 'Straight' && connector.segments.length > 1)) {
                for (let n: number = 0; n < connector.bridges.length; n++) {
                    let bridge: Bridge = connector.bridges[n];
                    if (bridge.segmentPointIndex === pointIndex) {
                        if (!bridge.rendered) {
                            if (bridge.segmentPointIndex === pointIndex) {
                                pathData += ' L' + bridge.startPoint.x + ' ' + bridge.startPoint.y;
                                pathData += bridge.path;
                                bridge.rendered = true;
                            }
                        }
                    }
                }
            }

        }
        return pathData;
    }
    /** @private */
    public updateDecoratorElement(
        element: DiagramElement, pt: PointModel, adjacentPoint: PointModel, decorator: DecoratorModel): void {
        let getPath: string; let angle: number;
        element.offsetX = pt.x; element.offsetY = pt.y;
        angle = Point.findAngle(pt, adjacentPoint);
        getPath = getDecoratorShape(decorator.shape, decorator);
        let size: Size = new Size(decorator.width, decorator.height);
        element.pivot.x = decorator.pivot.x; element.pivot.y = decorator.pivot.y;
        element.style = decorator.style;
        element.rotateAngle = angle;
        (element as PathElement).data = getPath;
        (element as PathElement).canMeasurePath = true;
        element.width = size.width;
        element.height = size.height;
    }

    /** @private */
    public getSegmentPath(connector: Connector, points: PointModel[]): string {
        let path: string = ''; let getPt: PointModel;
        let end: PointModel; let st: PointModel;
        let pts: PointModel[] = [];
        let j: number = 0;
        while (j < points.length) {
            pts.push({ x: points[j].x, y: points[j].y });
            j++;
        }
        for (let m: number = 0; m < connector.bridges.length; m++) {
            let bridge: Bridge = connector.bridges[m];
            bridge.rendered = false;
        }
        pts = this.clipDecorators(connector, pts);
        if (this.cornerRadius > 0 && this.type !== 'Bezier') {
            for (let j: number = 0; j < pts.length - 1; j++) {
                getPt = pts[j];
                if (j === 0) { path = 'M' + getPt.x + ' ' + getPt.y; }
                let segLength: number = Point.distancePoints(pts[j], pts[j + 1]);
                if (segLength > 0) {
                    if (j < pts.length - 2) {
                        if (segLength < this.cornerRadius * 2) {
                            end = Point.adjustPoint(pts[j], pts[j + 1], false, segLength / 2);
                        } else { end = Point.adjustPoint(pts[j], pts[j + 1], false, this.cornerRadius); }

                    } else { end = pts[j + 1]; }
                    if (j > 0) {
                        if (segLength < this.cornerRadius * 2) {
                            st = Point.adjustPoint(pts[j], pts[j + 1], true, segLength / 2);
                            if (j < pts.length - 2) { end = null; }
                        } else { st = Point.adjustPoint(pts[j], pts[j + 1], true, this.cornerRadius); }
                    }
                    if (st) { path += 'Q' + getPt.x + ' ' + getPt.y + ' ' + st.x + ' ' + st.y; }
                    if (end) {
                        if (connector.bridges.length > 0) {
                            path = this.bridgePath(connector, path, j);
                            if (connector.type === 'Orthogonal') { path = this.bridgePath(connector, path, j + 1); }
                        }
                        path += ' L' + end.x + ' ' + end.y;
                    }
                }
            }
        } else {
            if (this.type === 'Bezier') {
                let direction: string; let segments: BezierSegment[] = (this.segments as BezierSegment[]);
                for (let j: number = 0; j < segments.length; j++) {
                    if (pts.length > 2) { segments[j].bezierPoint1 = { x: 0, y: 0 }; segments[j].bezierPoint2 = { x: 0, y: 0 }; }
                    if (Point.isEmptyPoint(segments[j].point1) && !segments[j].vector1.angle && !segments[j].vector1.distance) {
                        if ((connector.sourceID || this.sourcePortID) && this.sourceWrapper) {
                            direction = getDirection(this.sourceWrapper.bounds, pts[j], true);
                        }
                        segments[j].bezierPoint1 = getBezierPoints(pts[j], pts[j + 1], direction);
                    } else if (segments[j].vector1.angle || segments[j].vector1.distance) {
                        segments[j].bezierPoint1 = Point.transform(pts[j], segments[j].vector1.angle, segments[j].vector1.distance);
                    } else {
                        segments[j].bezierPoint1 = {
                            x: segments[j].point1.x || segments[j].bezierPoint1.x,
                            y: segments[j].point1.y || segments[j].bezierPoint1.y
                        };
                    }
                    if (Point.isEmptyPoint(segments[j].point2) && !segments[j].vector2.angle && !segments[j].vector2.distance) {
                        if ((connector.targetID || this.targetPortID) && this.targetWrapper) {
                            direction = getDirection(this.targetWrapper.bounds, pts[j + 1], true);
                        }
                        segments[j].bezierPoint2 = getBezierPoints(pts[j + 1], pts[j], direction);
                    } else if (segments[j].vector2.angle || segments[j].vector2.distance) {
                        segments[j].bezierPoint2 = Point.transform(pts[j + 1], segments[j].vector2.angle, segments[j].vector2.distance);
                    } else {
                        segments[j].bezierPoint2 = {
                            x: segments[j].point2.x || segments[j].bezierPoint2.x,
                            y: segments[j].point2.y || segments[j].bezierPoint2.y
                        };
                    }
                }
                pts.splice(1, 0, { x: segments[0].bezierPoint1.x, y: segments[0].bezierPoint1.y });
                pts.splice(pts.length - 1, 0, {
                    x: segments[segments.length - 1].bezierPoint2.x, y: segments[segments.length - 1].bezierPoint2.y
                });
                pts = this.clipDecorators(connector, pts);
                for (let j: number = 0; j < segments.length; j++) {
                    if (j === 0) { path = 'M' + pts[0].x + ' ' + pts[0].y; }
                    let lastPoint: string = (j === segments.length - 1) ? pts[pts.length - 1].x + ' ' + pts[pts.length - 1].y :
                        segments[j].points[segments[j].points.length - 1].x + ' ' + segments[j].points[segments[j].points.length - 1].y;
                    path += 'C' +
                        segments[j].bezierPoint1.x + ' ' + segments[j].bezierPoint1.y + ' ' + segments[j].bezierPoint2.x + ' '
                        + segments[j].bezierPoint2.y + ' ' + lastPoint;
                }
            } else {
                for (let k: number = 0; k < pts.length; k++) {
                    getPt = pts[k];
                    if (k === 0) { path = 'M' + getPt.x + ' ' + getPt.y; }
                    if (k > 0) {
                        path = this.bridgePath(connector, path, k);
                        path += ' ' + 'L' + getPt.x + ' ' + getPt.y;
                    }
                }
            }
        }
        return path;
    }

    /** @private */
    public updateShapeElement(connector: Connector): void {
        let element: DiagramElement;
        switch (connector.shape.type) {
            case 'Bpmn':
                if (connector.wrapper.children[3] instanceof PathElement) {
                    element = connector.wrapper.children[3];
                }
                if ((connector.shape as BpmnFlow).flow === 'Message') {
                    this.updateShapePosition(connector, element);
                }
                break;
            case 'UmlActivity':
                if ((connector.shape as ActivityFlow).flow === 'Exception') {
                    this.getUMLExceptionFlow(connector.wrapper.children[0] as PathElement);
                }
                break;
        }
    }
    /** @private */
    public updateShapePosition(connector: Connector, element: DiagramElement): void {
        let segmentOffset: number = 0.5; let angle: number; let pt: PointModel; let length: number = 0;
        let anglePoints: PointModel[] = this.intermediatePoints as PointModel[];
        for (let i: number = 0; i < anglePoints.length - 1; i++) {
            length = length + this.distance(anglePoints[i], anglePoints[i + 1]);
            let offsetLength: number = length * segmentOffset;
            if (length >= offsetLength) {
                angle = findAngle(anglePoints[i], anglePoints[i + 1]);
                pt = Point.transform(anglePoints[i], angle, offsetLength);
            }
        }
        element.offsetX = pt.x;
        element.offsetY = pt.y;
    }

    /** @hidden */
    public scale(sw: number, sh: number, width: number, height: number, refObject?: DiagramElement): PointModel {
        let tx: number = 0;
        let ty: number = 0;

        if (this.wrapper && this.wrapper.outerBounds) {
            let outerBounds: Rect = getOuterBounds(this);
            let connWidth: number = (this.wrapper.bounds.width || this.style.strokeWidth || 1) - 2;
            let connHeight: number = (this.wrapper.bounds.height || this.style.strokeWidth || 1) - 2;
            tx = (outerBounds.width - connWidth);
            ty = (outerBounds.height - connHeight);
            sw = (width - (Math.max(tx, ty))) / connWidth;
            sh = (height - (Math.max(tx, ty))) / connHeight;
            tx = ty = Math.min(tx, ty);
        }

        sw = sh = Math.min(sw, sh);
        let matrix: Matrix = identityMatrix();
        refObject = refObject || this.wrapper;
        rotateMatrix(matrix, -refObject.rotateAngle, refObject.offsetX, refObject.offsetY);
        scaleMatrix(matrix, sw, sh, refObject.offsetX, refObject.offsetY);
        rotateMatrix(matrix, refObject.rotateAngle, refObject.offsetX, refObject.offsetY);
        let points: PointModel[] = transformPointsByMatrix(matrix, this.intermediatePoints);
        this.sourcePoint = points[0];
        this.targetPoint = points[points.length - 1];
        points = this.intermediatePoints = findConnectorPoints(this);
        updateConnector(this, points);
        return { x: tx, y: ty };
    }

    /**
     * @private
     * Returns the name of class Connector
     */
    public getClassName(): string {
        return 'Connector';
    }
}

