import { Diagram } from '../diagram';
import { ConnectorModel, OrthogonalSegmentModel } from '../objects/connector-model';
import { Connector } from '../objects/connector';
import { PointModel } from '../primitives/point-model';
import { NodeModel } from '../objects/node-model';
import { Rect } from '../primitives/rect';
import { getPortDirection } from '../utility/connector';
import { Direction } from '../enum/enum';
import { DiagramElement } from '../core/elements/diagram-element';
import { canEnableRouting } from '../utility/constraints-util';


/**
 * Line Routing
 */

export class LineRouting {
    private size: number = 20;
    private startGrid: VirtualBoundaries;
    private noOfRows: number;
    private noOfCols: number;
    private width: number;
    private height: number;
    private diagramStartX: number;
    private diagramStartY: number;
    private intermediatePoints: PointModel[] = [];
    private gridCollection: VirtualBoundaries[][] = [];
    private startNode: NodeModel;
    private targetNode: NodeModel;
    private targetGrid: VirtualBoundaries;
    private startArray: VirtualBoundaries[] = [];
    private targetGridCollection: VirtualBoundaries[] = [];
    private sourceGridCollection: VirtualBoundaries[] = [];

    /** @private */
    public lineRouting(diagram: Diagram): void {
        let length: number = diagram.connectors.length;
        this.renderVirtualRegion(diagram);
        if (length > 0) {
            for (let k: number = 0; k < length; k++) {
                let connector: ConnectorModel = diagram.connectors[k];
                if (connector.type === 'Orthogonal') {
                    this.refreshConnectorSegments(diagram, connector as Connector, true);
                }
            }
        }
    }

    /** @private */
    public renderVirtualRegion(diagram: Diagram, isUpdate?: boolean): void {
        /* tslint:disable */
        let right: number = diagram.spatialSearch['pageRight'] + this.size;
        let bottom: number = diagram.spatialSearch['pageBottom'] + this.size;
        let left: number = diagram.spatialSearch['pageLeft'];
        let top: number = diagram.spatialSearch['pageTop'];
        left = left < 0 ? left - 20 : 0;
        top = top < 0 ? top - 20 : 0;
        /* tslint:enable */
        if ((isUpdate && (this.width !== (right - left) || this.height !== (bottom - top) ||
            this.diagramStartX !== left || this.diagramStartY !== top)) || isUpdate === undefined) {
            this.width = right - left; this.height = bottom - top;
            this.diagramStartX = left; this.diagramStartY = top;
            this.gridCollection = [];
            this.noOfRows = this.width / this.size;
            this.noOfCols = this.height / this.size;
            let size: number = this.size;
            let x: number = this.diagramStartX < 0 ? this.diagramStartX : 0;
            let y: number = this.diagramStartY < 0 ? this.diagramStartY : 0;
            for (let i: number = 0; i < this.noOfCols; i++) {
                for (let j: number = 0; j < this.noOfRows; j++) {
                    if (i === 0) {
                        // tslint:disable-next-line:no-any
                        this.gridCollection.push([0] as any);
                    }
                    let grid: VirtualBoundaries = {
                        x: x, y: y, width: size, height: size, gridX: j,
                        gridY: i, walkable: true, tested: undefined, nodeId: []
                    };
                    this.gridCollection[j][i] = grid;
                    x += size;
                }
                x = this.diagramStartX < 0 ? this.diagramStartX : 0;
                y += size;
            }
        }
        this.updateNodesInVirtualRegion(diagram.nodes);
    }

    private updateNodesInVirtualRegion(diagramNodes: NodeModel[]): void {
        let size: number = this.size;
        let x: number = this.diagramStartX < 0 ? this.diagramStartX : 0;
        let y: number = this.diagramStartY < 0 ? this.diagramStartY : 0;
        for (let i: number = 0; i < this.noOfCols; i++) {
            for (let j: number = 0; j < this.noOfRows; j++) {
                let grid: VirtualBoundaries = this.gridCollection[j][i];
                let rectangle: Rect = new Rect(x, y, this.size, this.size);
                let isContains: boolean; let k: number;
                grid.walkable = true;
                grid.tested = undefined;
                grid.nodeId = [];
                for (k = 0; k < diagramNodes.length; k++) {
                    isContains = this.intersectRect(rectangle, diagramNodes[k].wrapper.outerBounds);
                    if (isContains) {
                        grid.nodeId.push(diagramNodes[k].id);
                        grid.walkable = false;
                    }
                }
                x += size;
            }
            x = this.diagramStartX < 0 ? this.diagramStartX : 0;
            y += size;
        }
    }

    private intersectRect(r1: Rect, r2: Rect): boolean {
        return !(r2.left >= r1.right || r2.right <= r1.left ||
            r2.top >= r1.bottom || r2.bottom <= r1.top);
    }

    private findEndPoint(connector: Connector, isSource: boolean): PointModel {
        let endPoint: PointModel; let portDirection: Direction;
        if ((isSource && connector.sourcePortID !== '') || (!isSource && connector.targetPortID !== '')) {
            endPoint = (isSource) ? { x: connector.sourcePortWrapper.offsetX, y: connector.sourcePortWrapper.offsetY } :
                { x: connector.targetPortWrapper.offsetX, y: connector.targetPortWrapper.offsetY };
            portDirection = getPortDirection(
                endPoint, undefined, (isSource) ? connector.sourceWrapper.bounds : connector.targetWrapper.bounds, false);
            let bounds: Rect = (isSource) ? connector.sourcePortWrapper.bounds : connector.targetPortWrapper.bounds;
            if (portDirection === 'Top') {
                endPoint = { x: bounds.topCenter.x, y: bounds.topCenter.y };
            } else if (portDirection === 'Left') {
                endPoint = { x: bounds.middleLeft.x, y: bounds.middleLeft.y };
            } else if (portDirection === 'Right') {
                endPoint = { x: bounds.middleRight.x, y: bounds.middleRight.y };
            } else {
                endPoint = { x: bounds.bottomCenter.x, y: bounds.bottomCenter.y };
            }
        } else {
            if ((isSource && this.startNode) || (!isSource && this.targetNode)) {
                endPoint = (isSource) ? { x: this.startNode.offsetX, y: this.startNode.offsetY } :
                    { x: this.targetNode.offsetX, y: this.targetNode.offsetY };
            } else {
                endPoint = (isSource) ? { x: connector.sourcePoint.x, y: connector.sourcePoint.y } :
                    { x: connector.targetPoint.x, y: connector.targetPoint.y };
            }
        }
        return endPoint;
    }

    /** @private */
    public refreshConnectorSegments(
        diagram: Diagram, connector: Connector, isUpdate: boolean): void {
        let sourceId: string = connector.sourceID; let targetId: string = connector.targetID;
        let sourcePortID: string = connector.sourcePortID; let targetPortID: string = connector.targetPortID;
        let startPoint: PointModel; let targetPoint: PointModel; let sourcePortDirection: string; let targetPortDirection: string;
        let grid: VirtualBoundaries; let sourceTop: VirtualBoundaries; let sourceBottom: VirtualBoundaries; let isBreak: boolean;
        let sourceLeft: VirtualBoundaries; let sourceRight: VirtualBoundaries; let targetRight: VirtualBoundaries;
        let targetTop: VirtualBoundaries; let targetBottom: VirtualBoundaries; let targetLeft: VirtualBoundaries;
        if (canEnableRouting(connector, diagram)) {
            this.startNode = diagram.nameTable[sourceId]; this.targetNode = diagram.nameTable[targetId];
            this.intermediatePoints = []; this.startArray = []; this.targetGridCollection = []; this.sourceGridCollection = [];
            this.startGrid = undefined; this.targetGrid = undefined;
            for (let i: number = 0; i < this.noOfCols; i++) {
                for (let j: number = 0; j < this.noOfRows; j++) {
                    this.gridCollection[j][i].tested = this.gridCollection[j][i].parent = undefined;
                    this.gridCollection[j][i].previousDistance = this.gridCollection[j][i].afterDistance = undefined;
                    this.gridCollection[j][i].totalDistance = undefined;
                }
            }
            // Set the source point and target point
            startPoint = this.findEndPoint(connector, true); targetPoint = this.findEndPoint(connector, false);
            // Find the start grid and target grid
            for (let i: number = 0; i < this.noOfRows; i++) {
                for (let j: number = 0; j < this.noOfCols; j++) {
                    grid = this.gridCollection[i][j];
                    let rectangle: Rect = new Rect(grid.x, grid.y, grid.width, grid.height);
                    if (rectangle.containsPoint(startPoint) && !this.startGrid) {
                        this.startGrid = (sourcePortID && this.startGrid &&
                            (sourcePortDirection === 'Left' || sourcePortDirection === 'Top')) ? this.startGrid : grid;
                    }
                    if (rectangle.containsPoint(targetPoint) && !this.targetGrid) {
                        this.targetGrid = (targetPortID && this.targetGrid &&
                            (targetPortDirection === 'Left' || targetPortDirection === 'Top')) ? this.targetGrid : grid;
                    }
                    if (!sourcePortID && this.startNode) {
                        let bounds: Rect = this.startNode.wrapper.outerBounds;
                        if (rectangle.containsPoint(bounds.topCenter) && !sourceTop) { sourceTop = grid; }
                        if (rectangle.containsPoint(bounds.middleLeft) && !sourceLeft) { sourceLeft = grid; }
                        if (rectangle.containsPoint(bounds.middleRight) && !sourceRight) { sourceRight = grid; }
                        if (rectangle.containsPoint(bounds.bottomCenter) && !sourceBottom) {
                            sourceBottom = grid;
                        }
                    }
                    if (!targetPortID && this.targetNode) {
                        let bounds: Rect = this.targetNode.wrapper.outerBounds;
                        if (rectangle.containsPoint(bounds.topCenter) && !targetTop) { targetTop = grid; }
                        if (rectangle.containsPoint(bounds.middleLeft) && !targetLeft) { targetLeft = grid; }
                        if (rectangle.containsPoint(bounds.middleRight) && !targetRight) { targetRight = grid; }
                        if (rectangle.containsPoint({ x: bounds.bottomCenter.x, y: bounds.bottomCenter.y }) && !targetBottom) {
                            targetBottom = grid;
                        }
                    }
                }
            }
            if (!sourcePortID && this.startNode) {
                for (let i: number = sourceLeft.gridX; i <= sourceRight.gridX; i++) {
                    grid = this.gridCollection[i][sourceLeft.gridY];
                    if (grid.nodeId.length === 1) { this.sourceGridCollection.push(grid); }
                }
                for (let i: number = sourceTop.gridY; i <= sourceBottom.gridY; i++) {
                    grid = this.gridCollection[sourceTop.gridX][i];
                    if (grid.nodeId.length === 1 && this.sourceGridCollection.indexOf(grid) === -1) {
                        this.sourceGridCollection.push(grid);
                    }
                }
            } else { this.sourceGridCollection.push(this.startGrid); }
            if (!targetPortID && this.targetNode) {
                for (let i: number = targetLeft.gridX; i <= targetRight.gridX; i++) {
                    grid = this.gridCollection[i][targetLeft.gridY];
                    if (grid.nodeId.length === 1) { this.targetGridCollection.push(grid); }
                }
                for (let i: number = targetTop.gridY; i <= targetBottom.gridY; i++) {
                    grid = this.gridCollection[targetTop.gridX][i];
                    if (grid.nodeId.length === 1 && this.targetGridCollection.indexOf(grid) === -1) {
                        this.targetGridCollection.push(grid);
                    }
                }
                if (this.targetGridCollection.indexOf(this.targetGrid) === -1) {
                    if (this.targetGrid.nodeId.length > 1 && this.targetGridCollection.length === 1) {
                        this.targetGrid = this.targetGridCollection[0];
                    }
                }
            } else { this.targetGridCollection.push(this.targetGrid); }
            this.startGrid.totalDistance = 0; this.startGrid.previousDistance = 0;
            this.intermediatePoints.push({ x: this.startGrid.gridX, y: this.startGrid.gridY }); this.startArray.push(this.startGrid);
            renderPathElement: while (this.startArray.length > 0) {
                let startGridNode: VirtualBoundaries = this.startArray.pop();
                for (let i: number = 0; i < this.targetGridCollection.length; i++) {
                    let target: VirtualBoundaries = this.targetGridCollection[i];
                    if (startGridNode.gridX === target.gridX && startGridNode.gridY === target.gridY) {
                        this.getIntermediatePoints(startGridNode);
                        isBreak = this.updateConnectorSegments(diagram, this.intermediatePoints, this.gridCollection, connector, isUpdate);
                        if (!isBreak) {
                            this.targetGridCollection.splice(this.targetGridCollection.indexOf(target), 1);
                            startGridNode = this.startArray.pop();
                        } else { break renderPathElement; }
                    }
                }
                this.findPath(startGridNode);
            }
        }
    }

    // Get all the intermediated points from target grid
    private getIntermediatePoints(target: VirtualBoundaries): void {
        let distance: number; this.intermediatePoints = [];
        while (target) {
            this.intermediatePoints.push({ x: target.gridX, y: target.gridY });
            target = target.parent;
        }
        this.intermediatePoints.reverse();
        if (this.intermediatePoints[0].x === this.intermediatePoints[1].x) {
            if (this.intermediatePoints[0].y < this.intermediatePoints[1].y) {
                distance = this.neigbour(this.startGrid, 'bottom', undefined);
                this.intermediatePoints[0].y += distance - 1;
            } else {
                distance = this.neigbour(this.startGrid, 'top', undefined);
                this.intermediatePoints[0].y -= distance - 1;
            }
        } else {
            if (this.intermediatePoints[0].x < this.intermediatePoints[1].x) {
                distance = this.neigbour(this.startGrid, 'right', undefined);
                this.intermediatePoints[0].x += distance - 1;
            } else {
                distance = this.neigbour(this.startGrid, 'left', undefined);
                this.intermediatePoints[0].x -= distance - 1;
            }
        }
    }

    // Connector rendering

    private updateConnectorSegments(
        diagram: Diagram, intermediatePoints: PointModel[], gridCollection: VirtualBoundaries[][],
        connector: Connector, isUpdate: boolean): boolean {

        let segments: OrthogonalSegmentModel[] = []; let seg: OrthogonalSegmentModel; let targetPoint: PointModel;
        let pointX: number; let pointY: number; let node: VirtualBoundaries; let points: PointModel[] = [];
        let direction: Direction; let length: number; let currentdirection: Direction; let prevDirection: Direction;
        let targetWrapper: DiagramElement = connector.targetWrapper; let sourceWrapper: DiagramElement = connector.sourceWrapper;
        let sourcePoint: PointModel = this.findEndPoint(connector, true);

        if (connector.targetPortID !== '' || !connector.targetWrapper) {
            targetPoint = this.findEndPoint(connector, false);
        }
        for (let i: number = 0; i < intermediatePoints.length; i++) {
            node = gridCollection[intermediatePoints[i].x][intermediatePoints[i].y];
            pointX = node.x + node.width / 2; pointY = node.y + node.height / 2;
            points.push({ x: pointX, y: pointY });
            if (i >= 1) {
                if (points[points.length - 2].x !== points[points.length - 1].x) {
                    currentdirection = (points[points.length - 2].x > points[points.length - 1].x) ? 'Left' : 'Right';
                } else {
                    currentdirection = (points[points.length - 2].y > points[points.length - 1].y) ? 'Top' : 'Bottom';
                }
            }
            if (i >= 2 && prevDirection === currentdirection) { points.splice(points.length - 2, 1); }
            prevDirection = currentdirection;
        }
        for (let j: number = 0; j < points.length - 1; j++) {
            if (points[j].x !== points[j + 1].x) {
                if (j === 0 && sourceWrapper) {
                    sourcePoint = (points[j].x > points[j + 1].x) ? sourceWrapper.bounds.middleLeft : sourceWrapper.bounds.middleRight;
                }
                if (j === points.length - 2 && connector.targetPortID === '' && targetWrapper) {
                    targetPoint = (points[j].x > points[j + 1].x) ? targetWrapper.bounds.middleRight : targetWrapper.bounds.middleLeft;
                }
                if (j === 0 && sourcePoint) {
                    points[j].x = sourcePoint.x;
                    points[j].y = points[j + 1].y = sourcePoint.y;
                }
                if (j === points.length - 2 && targetPoint) {
                    points[j + 1].x = targetPoint.x;
                    points[j].y = points[j + 1].y = targetPoint.y;
                }
            } else {
                if (j === 0 && sourceWrapper) {
                    sourcePoint = (points[j].y > points[j + 1].y) ? sourceWrapper.bounds.topCenter : sourceWrapper.bounds.bottomCenter;
                }
                if (j === points.length - 2 && connector.targetPortID === '' && targetWrapper) {
                    targetPoint = (points[j].y > points[j + 1].y) ? targetWrapper.bounds.bottomCenter : targetWrapper.bounds.topCenter;
                }
                if (j === 0 && sourcePoint) {
                    points[j].y = sourcePoint.y;
                    points[j].x = points[j + 1].x = sourcePoint.x;
                }
                if (j === points.length - 2 && targetPoint) {
                    points[j + 1].y = targetPoint.y;
                    points[j].x = points[j + 1].x = targetPoint.x;
                }
            }
        }
        for (let j: number = 0; j < points.length - 1; j++) {
            if (points[j].x !== points[j + 1].x) {
                if (points[j].x > points[j + 1].x) {
                    direction = 'Left'; length = points[j].x - points[j + 1].x;
                } else {
                    direction = 'Right'; length = points[j + 1].x - points[j].x;
                }
            } else {
                if (points[j].y > points[j + 1].y) {
                    direction = 'Top'; length = points[j].y - points[j + 1].y;
                } else {
                    direction = 'Bottom'; length = points[j + 1].y - points[j].y;
                }
            }
            seg = { type: 'Orthogonal', length: length, direction: direction };
            segments.push(seg);
        }
        let lastSeg: OrthogonalSegmentModel = segments[segments.length - 1];
        if (segments.length === 1) { lastSeg.length -= 20; }
        if (lastSeg.length < 10 && segments.length === 2) {
            segments.pop(); segments[0].length -= 20; lastSeg = segments[0];
        }
        if (((lastSeg.direction === 'Top' || lastSeg.direction === 'Bottom') && lastSeg.length > connector.targetDecorator.height + 1) ||
            ((lastSeg.direction === 'Right' || lastSeg.direction === 'Left') && lastSeg.length > connector.targetDecorator.width + 1)) {
            connector.segments = segments;
            if (isUpdate) {
                diagram.connectorPropertyChange(
                    connector as Connector, {} as Connector, { type: 'Orthogonal', segments: segments } as Connector);
            }
            return true;
        }
        return false;
    }

    // Shortest path
    private findPath(startGrid: VirtualBoundaries): void {
        let intermediatePoint: PointModel; let collection: PointModel[] = [];
        let neigbours: VirtualBoundaries[] = this.findNearestNeigbours(startGrid, this.gridCollection);
        for (let i: number = 0; i < neigbours.length; i++) {
            intermediatePoint = this.findIntermediatePoints(
                neigbours[i].gridX, neigbours[i].gridY, startGrid.gridX, startGrid.gridY, this.targetGrid.gridX, this.targetGrid.gridY);
            if (intermediatePoint !== null) {
                let grid: VirtualBoundaries = this.gridCollection[intermediatePoint.x][intermediatePoint.y];
                let h: number = this.octile(
                    Math.abs(intermediatePoint.x - startGrid.gridX), Math.abs(intermediatePoint.y - startGrid.gridY));
                let l: number = startGrid.previousDistance + h;
                if ((!grid.previousDistance || grid.previousDistance > l) &&
                    (!(intermediatePoint.x === startGrid.gridX && intermediatePoint.y === startGrid.gridY))) {
                    collection.push(intermediatePoint);
                    grid.previousDistance = l;
                    grid.afterDistance = grid.afterDistance || this.manhattan(
                        Math.abs(intermediatePoint.x - this.targetGrid.gridX), Math.abs(intermediatePoint.y - this.targetGrid.gridY));
                    grid.totalDistance = grid.previousDistance + grid.afterDistance;
                    grid.parent = startGrid;
                }
            }

        }
        if (collection.length > 0) {
            for (let i: number = 0; i < collection.length; i++) {
                let grid: VirtualBoundaries = this.gridCollection[collection[i].x][collection[i].y];
                if (this.startArray.indexOf(grid) === -1) {
                    this.startArray.push(grid);
                }
            }
        }
        this.sorting(this.startArray);
    }

    // sorting the array based on total distance between source and target node
    private sorting(array: VirtualBoundaries[]): VirtualBoundaries[] {
        let done: boolean = false;
        while (!done) {
            done = true;
            for (let i: number = 1; i < array.length; i += 1) {
                if (array[i - 1].totalDistance < array[i].totalDistance) {
                    done = false;
                    let tmp: VirtualBoundaries = array[i - 1];
                    array[i - 1] = array[i];
                    array[i] = tmp;
                }
            }
        }
        return array;
    }

    private octile(t: number, e: number): number {
        let r: number = Math.SQRT2 - 1;
        return e > t ? r * t + e : r * e + t;
    }
    private manhattan(t: number, e: number): number {
        return t + e;
    }

    // Find the nearest neigbour from the current boundaries, the neigbour is use to find next intermdiate point.
    private findNearestNeigbours(startGrid: VirtualBoundaries, gridCollection: VirtualBoundaries[][]): VirtualBoundaries[] {
        let neigbours: VirtualBoundaries[] = []; let parent: VirtualBoundaries = startGrid.parent;
        if (parent) {
            let dx: number = (startGrid.gridX - parent.gridX) / Math.max(Math.abs(startGrid.gridX - parent.gridX), 1);
            let dy: number = (startGrid.gridY - parent.gridY) / Math.max(Math.abs(startGrid.gridY - parent.gridY), 1);
            if (dx !== 0) {
                if (this.isWalkable(startGrid.gridX, startGrid.gridY - 1, true) &&
                    this.sourceGridCollection.indexOf(gridCollection[startGrid.gridX][startGrid.gridY - 1]) === -1) {
                    neigbours.push(gridCollection[startGrid.gridX][startGrid.gridY - 1]);
                }
                if (this.isWalkable(startGrid.gridX, startGrid.gridY + 1, true) &&
                    this.sourceGridCollection.indexOf(gridCollection[startGrid.gridX][startGrid.gridY + 1])) {
                    neigbours.push(gridCollection[startGrid.gridX][startGrid.gridY + 1]);
                }
                if (this.isWalkable(startGrid.gridX + dx, startGrid.gridY, true) &&
                    this.sourceGridCollection.indexOf(gridCollection[startGrid.gridX + dx][startGrid.gridY]) === -1) {
                    neigbours.push(gridCollection[startGrid.gridX + dx][startGrid.gridY]);
                }
            } else if (dy !== 0) {
                if (this.isWalkable(startGrid.gridX - 1, startGrid.gridY, true) &&
                    this.sourceGridCollection.indexOf(gridCollection[startGrid.gridX - 1][startGrid.gridY]) === -1) {
                    neigbours.push(gridCollection[startGrid.gridX - 1][startGrid.gridY]);
                }
                if (this.isWalkable(startGrid.gridX + 1, startGrid.gridY, true) &&
                    this.sourceGridCollection.indexOf(gridCollection[startGrid.gridX + 1][startGrid.gridY]) === -1) {
                    neigbours.push(gridCollection[startGrid.gridX + 1][startGrid.gridY]);
                }
                if (this.isWalkable(startGrid.gridX, startGrid.gridY + dy, true) &&
                    this.sourceGridCollection.indexOf(gridCollection[startGrid.gridX][startGrid.gridY + dy]) === -1) {
                    neigbours.push(gridCollection[startGrid.gridX][startGrid.gridY + dy]);
                }
            }
        } else {
            this.neigbour(startGrid, 'top', neigbours);
            this.neigbour(startGrid, 'right', neigbours);
            this.neigbour(startGrid, 'bottom', neigbours);
            this.neigbour(startGrid, 'left', neigbours);
        }
        return neigbours;
    }
    private neigbour(startGrid: VirtualBoundaries, direction: string, neigbours: VirtualBoundaries[]): number {
        let i: number = 1; let nearGrid: VirtualBoundaries;
        while (i > 0) {
            let x: number = (direction === 'top' || direction === 'bottom') ?
                (startGrid.gridX) : ((direction === 'left') ? startGrid.gridX - i : startGrid.gridX + i);
            let y: number = (direction === 'right' || direction === 'left') ?
                (startGrid.gridY) : ((direction === 'top') ? startGrid.gridY - i : startGrid.gridY + i);
            nearGrid = this.gridCollection[x][y];
            if (nearGrid && this.sourceGridCollection.indexOf(nearGrid) === -1) {
                if (neigbours && this.isWalkable(x, y)) {
                    neigbours.push(nearGrid);
                }
                return i;
            }
            if (x > 0 && y > 0) {
                i++;
            } else {
                break;
            }
        }
        return null;
    }
    private isWalkable(x: number, y: number, isparent?: boolean): boolean {
        if (x >= 0 && x < this.noOfRows && y >= 0 && y < this.noOfCols) {
            let grid: VirtualBoundaries = this.gridCollection[x][y];
            if (grid && (grid.walkable || (grid.nodeId.length === 1 &&
                (this.sourceGridCollection.indexOf(grid) !== -1 || this.targetGridCollection.indexOf(grid) !== -1)))) {
                if ((isparent && !grid.parent) || !isparent) {
                    return true;
                }
            }
        }
        return false;
    }

    private findIntermediatePoints(
        neigbourGridX: number, neigbourGridY: number, startGridX: number, startGridY: number,
        endGridX: number, endGridY: number): PointModel {
        let dx: number = neigbourGridX - startGridX;
        let dy: number = neigbourGridY - startGridY;
        let gridX: number = neigbourGridX; let gridY: number = neigbourGridY;

        for (let i: number = 0; i < this.targetGridCollection.length; i++) {
            if (neigbourGridX === this.targetGridCollection[i].gridX && neigbourGridY === this.targetGridCollection[i].gridY) {
                return { x: neigbourGridX, y: neigbourGridY };
            }
        }

        if (!this.isWalkable(neigbourGridX, neigbourGridY)) {
            return null;
        }

        let neigbourGrid: VirtualBoundaries = this.gridCollection[neigbourGridX][neigbourGridY];

        if (neigbourGrid.tested) {
            return { x: neigbourGridX, y: neigbourGridY };
        }
        neigbourGrid.tested = true;
        if (dx !== 0) {
            dx = (dx > 0) ? 1 : -1;
            if ((this.isWalkable(gridX, gridY - 1) && !this.isWalkable(gridX - dx, gridY - 1)) ||
                (this.isWalkable(gridX, gridY + 1) && !this.isWalkable(gridX - dx, gridY + 1))) {
                return { x: neigbourGridX, y: neigbourGridY };
            }
        }
        if (dy !== 0) {
            dy = (dy > 0) ? 1 : -1;
            if ((this.isWalkable(gridX - 1, gridY) && !this.isWalkable(gridX - 1, gridY - dy)) ||
                (this.isWalkable(gridX + 1, gridY) && !this.isWalkable(gridX + 1, gridY - dy))) {
                return { x: neigbourGridX, y: neigbourGridY };
            }
            if (this.findIntermediatePoints(gridX + 1, gridY, gridX, gridY, endGridX, endGridY) ||
                this.findIntermediatePoints(gridX - 1, gridY, gridX, gridY, endGridX, endGridY)) {
                return { x: neigbourGridX, y: neigbourGridY };
            }
        }
        return this.findIntermediatePoints(gridX + dx, gridY + dy, gridX, gridY, endGridX, endGridY);
    }

    /**
     * Constructor for the line routing module
     * @private
     */

    constructor() {
        //constructs the line routing module
    }

    /**
     * To destroy the line routing module
     * @return {void}
     * @private
     */

    public destroy(): void {
        /**
         * Destroys the line routing module
         */
    }

    /**
     * Get module name.
     */
    protected getModuleName(): string {
        /**
         * Returns the module name
         */
        return 'LineRouting';
    }

}

/** @private */
export interface VirtualBoundaries {
    x: number;
    y: number;
    width: number;
    height: number;
    gridX: number;
    gridY: number;
    walkable: boolean;
    tested: boolean;
    nodeId: string[];
    previousDistance?: number;
    afterDistance?: number;
    totalDistance?: number;
    parent?: VirtualBoundaries;
}