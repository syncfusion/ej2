/**
 * Diagram spec document
 */
import { createElement } from '@syncfusion/ej2-base';
import { Diagram } from '../../../src/diagram/diagram';
import {
    ConnectorModel, Node,
    DataBinding, PointModel, GraphLayoutManager, Layout, IConnector,
    HierarchicalTree, NodeModel, Rect, BasicShapeModel, SymmetricLayout
} from '../../../src/diagram/index';
import  {profile , inMB, getMemoryProfile} from '../../../spec/common.spec';
Diagram.Inject(SymmetricLayout);

let nodes: NodeModel[] = [];
let connectors: ConnectorModel[] = [];
/**
 * Connection between nodes
 */
export function ConnectNodes(parentNode: NodeModel, childNode: NodeModel): ConnectorModel {
    let connector: ConnectorModel = {
        id: parentNode.id + childNode.id,
        sourceID: parentNode.id,
        targetID: childNode.id,
        targetDecorator: { shape: 'None' }
    }
    return connector;
}

export function GetRectangle(name: string): NodeModel {
    let shape: BasicShapeModel = { type: 'Basic', shape: 'Ellipse' };
    let node: NodeModel = { id: name, height: 25, width: 25, borderColor: '#5e5e5e', borderWidth: 1, style: { fill: '#ff6329' }, shape: shape };
    return node;
}

export function populateNodes() {
    let parentRect: NodeModel = GetRectangle("p");
    nodes.push(parentRect);
    for (let i: number = 0; i < 2; i++) {
        let childRect_i: NodeModel = GetRectangle("c" + i);
        nodes.push(childRect_i);
        for (let j: number = 0; j < 2; j++) {
            let childRect_j: NodeModel = GetRectangle("c" + i + j);
            nodes.push(childRect_j);
            for (let k: number = 0; k < 6; k++) {
                let childRect_k: NodeModel = GetRectangle("c" + i + j + k);
                nodes.push(childRect_k);
                connectors.push(ConnectNodes(childRect_j, childRect_k));
            }
            connectors.push(ConnectNodes(childRect_i, childRect_j));
        }
        connectors.push(ConnectNodes(parentRect, childRect_i));
    }
    return nodes;
}

describe('Diagram Control', () => {
    describe('Tree Layout', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        beforeAll(() => {
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            populateNodes();
            diagram = new Diagram({
                width: '1200px', height: '580px',
                layout: { type: 'SymmetricalLayout', springLength: 80, springFactor: 0.8, maxIteration: 500, margin: { left: 20, top: 20 } },
                nodes: nodes, connectors: connectors,
            });
            diagram.appendTo('#diagram');
        });
        afterAll(() => {
            diagram.destroy();
            ele.remove();
        });
        it('Checking SymmetricalLayout springLength', (done: Function) => {
            let smtLayout: SymmetricLayout = new SymmetricLayout();
            smtLayout.springLength = 100;
            diagram.layout.springLength = smtLayout.springLength;
            diagram.dataBind();
            expect(diagram.layout.springLength === 100).toBe(true);
            expect(diagram.nodes[0].offsetX == 571.3053454248899 && diagram.nodes[0].offsetY == 367.3182758134246).toBe(true);
            done();
        });
        it('Checking SymmetricalLayout springFactor', (done: Function) => {
            let smtLayout: SymmetricLayout = new SymmetricLayout();
            smtLayout.springFactor = 1;
            diagram.layout.springFactor = smtLayout.springFactor;
            diagram.dataBind();
            expect(diagram.layout.springFactor === 1).toBe(true);
            expect(diagram.nodes[0].offsetX == 630.4421464511472 && diagram.nodes[0].offsetY == 310.87140251007924).toBe(true);
            done();
        });
        it('Checking SymmetricalLayout maxIteration', (done: Function) => {
            let smtLayout: SymmetricLayout = new SymmetricLayout();
            smtLayout.maxIteration = 700;
            diagram.layout.maxIteration = smtLayout.maxIteration;
            diagram.dataBind();
            expect(diagram.layout.maxIteration === 700).toBe(true);
            expect(diagram.nodes[0].offsetX == 647.4827144644246 && diagram.nodes[0].offsetY == 283.32750048873606).toBe(true);
            done();
        });
        it('memory leak', () => { 
            profile.sample();
            let average: any = inMB(profile.averageChange)
            //Check average change in memory samples to not be over 10MB
            expect(average).toBeLessThan(10);
            let memory: any = inMB(getMemoryProfile())
            //Check the final memory usage against the first usage, there should be little change if everything was properly deallocated
            expect(memory).toBeLessThan(profile.samples[0] + 0.25);
        })
    });

    describe('Layout for group node', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        beforeAll(() => {
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            populateNodes();
            function createNode(id:string, width:number, height:number, offsetX:number, offsetY:number, content:string) {
                var node:NodeModel = {};
                node.id = id;
                node.width = width;
                node.height = height;
                node.offsetX = offsetX;
                node.offsetY = offsetY;
                node.annotations = [{ content: content }];
                return node;
            }
            diagram = new Diagram({
                width: '1200px', height: '580px',
                nodes: [
                    createNode("firstRectangle", 400, 200, 500, 300, ""),
                    createNode("Image", 100, 100, 400, 300, "Image"),
                    createNode("MyNode", 200, 60, 600, 300, "MyNode"),
                    createNode("A", 20, 20, 310, 210, "A"),
                    createNode("B", 20, 20, 310, 410, "B"),
                    createNode("C", 20, 20, 500, 410, "C"),
                    createNode("D", 20, 20, 690, 410, "D"),
                    {
                        id: 'group',
                        style: {
                            fill: 'transparent',
                            strokeWidth: 0
                        },
                        children: ['firstRectangle', 'Image', 'MyNode', 'A', 'B', 'C', 'D']
                    },
                    createNode("secondRectangle", 400, 200, 1000, 300, ""),
                    createNode("Image1", 100, 100, 900, 300, "Image"),
                    createNode("MyNode1", 200, 60, 1100, 300, "MyNode"),
                    createNode("AA", 20, 20, 810, 210, "A"),
                    createNode("BB", 20, 20, 810, 410, "B"),
                    createNode("CC", 20, 20, 1000, 410, "C"),
                    createNode("DD", 20, 20, 1190, 410, "D"),
                    {
                        id: 'secondGroup',
                        style: {
                            fill: 'transparent',
                            strokeWidth: 0
                        },
                        children: ['secondRectangle', 'Image1', 'MyNode1', 'AA', 'BB', 'CC', 'DD']
                    },
                    createNode("firstRectanglqqe", 400, 200, 500, 300, ""),
                    createNode("Imageq", 100, 100, 400, 300, "Image"),
                    createNode("MyNodeq", 200, 60, 600, 300, "MyNode"),
                    createNode("AAA", 20, 20, 310, 210, "A"),
                    createNode("BBB", 20, 20, 310, 410, "B"),
                    createNode("CCC", 20, 20, 500, 410, "C"),
                    createNode("DDD", 20, 20, 690, 410, "D"),
                    {
                        id: 'groupqq1',
                        style: {
                            fill: 'transparent',
                            strokeWidth: 0
                        },
                        children: ['firstRectanglqqe', 'Imageq', 'MyNodeq', 'AAA', 'BBB', 'CCC', 'DDD']
                    },
                ],
                connectors: [
                    {
                        id: 'connector', sourceID: 'group', targetID: 'secondGroup'
                    },
                      {
                        id: 'connecto1r', sourceID: 'group', targetID: 'groupqq1'
                    }
                ],
                layout: { type: 'HierarchicalTree'},
            });
            diagram.appendTo('#diagram');
        });
        afterAll(() => {
            diagram.destroy();
            ele.remove();
        });

        it('Checking group node at layout', (done: Function) => {
            expect(diagram.nameTable['group'].offsetX == 600 && diagram.nameTable['group'].offsetY == 160).toBe(true);
            done();
        });
    });
});