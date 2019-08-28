import { PointModel } from '../primitives/point-model';
import { Rect } from '../primitives/rect';
import { Size } from '../primitives/size';
import { TextStyleModel } from './../core/appearance-model';
import { PathElement } from '../core/elements/path-element';
import { TextElement } from '../core/elements/text-element';
import { whiteSpaceToString, wordBreakToString, textAlignToString, bBoxText } from './base-util';
import { Matrix, identityMatrix, transformPointByMatrix, rotateMatrix } from '../primitives/matrix';
import { createElement, Browser } from '@syncfusion/ej2-base';
import { BaseAttributes, TextAttributes, SubTextElement, TextBounds } from '../rendering/canvas-interface';

/**
 * Defines the functionalities that need to access DOM
 */

export function getChildNode(node: SVGElement): SVGElement[] | HTMLCollection {
    let child: SVGElement;
    let collection: SVGElement[] | HTMLCollection = [];
    if (Browser.info.name === 'msie' || Browser.info.name === 'edge') {
        for (let i: number = 0; i < node.childNodes.length; i++) {
            child = node.childNodes[i] as SVGElement;
            if (child.nodeType === 1) {
                collection.push(child);
            }
        }
    } else {
        collection = node.children;
    }
    return collection;
}

export function translatePoints(element: PathElement, points: PointModel[]): PointModel[] {
    let translatedPts: PointModel[] = [];
    for (let point of points) {
        let pt1: PointModel = {
            x: element.offsetX - element.actualSize.width * element.pivot.x + point.x,
            y: element.offsetY - element.actualSize.height * element.pivot.y + point.y
        };
        let matrix: Matrix;
        let angle: number = element.rotateAngle + element.parentTransform;
        if (angle) {
            matrix = identityMatrix();
            rotateMatrix(matrix, angle, element.offsetX, element.offsetY);
        }
        if (matrix) {
            pt1 = transformPointByMatrix(matrix, pt1);
        }
        translatedPts.push(pt1);
    }
    return translatedPts;

}

/** @private */
export function measurePath(data: string): Rect {
    let path: string = 'pathTable';
    if (!window[path]) {
        window[path] = {};
    }
    if (data) {
        let measureElement: string = 'measureElement';
        window[measureElement].style.visibility = 'visible';
        let svg: SVGSVGElement = window[measureElement].children[2];
        let element: SVGPathElement = getChildNode(svg)[0] as SVGPathElement;
        element.setAttribute('d', data);
        //let bounds: SVGRect = element.getBBox();
        let bounds: SVGRect;
        if (window[path][data]) {
            bounds = window[path][data];
        } else {
            window[path][data] = bounds = element.getBBox();
        }
        let svgBounds: Rect = new Rect(bounds.x, bounds.y, bounds.width, bounds.height);
        window[measureElement].style.visibility = 'hidden';
        return svgBounds;
    }
    return new Rect(0, 0, 0, 0);
}

function getTextOptions(element: TextElement, maxWidth?: number): BaseAttributes {
    let options: BaseAttributes = {
        fill: element.style.fill, stroke: element.style.strokeColor, angle: element.rotateAngle + element.parentTransform,
        pivotX: element.pivot.x, pivotY: element.pivot.y, strokeWidth: element.style.strokeWidth,
        dashArray: element.style.strokeDashArray, opacity: element.style.opacity,
        visible: element.visible, id: element.id,
        width: maxWidth || element.actualSize.width, height: element.actualSize.height,
        x: element.offsetX - element.actualSize.width * element.pivot.x + 0.5,
        y: element.offsetY - element.actualSize.height * element.pivot.y + 0.5
    };
    (options as TextAttributes).fontSize = element.style.fontSize;
    (options as TextAttributes).fontFamily = element.style.fontFamily;
    (options as TextAttributes).textOverflow = element.style.textOverflow;
    (options as TextAttributes).textDecoration = element.style.textDecoration;
    (options as TextAttributes).doWrap = element.doWrap;
    (options as TextAttributes).whiteSpace = whiteSpaceToString(element.style.whiteSpace, element.style.textWrapping);
    (options as TextAttributes).content = element.content;
    (options as TextAttributes).textWrapping = element.style.textWrapping;
    (options as TextAttributes).breakWord = wordBreakToString(element.style.textWrapping);
    (options as TextAttributes).textAlign = textAlignToString(element.style.textAlign);
    (options as TextAttributes).color = element.style.color;
    (options as TextAttributes).italic = element.style.italic;
    (options as TextAttributes).bold = element.style.bold;
    options.dashArray = ''; options.strokeWidth = 0; options.fill = '';
    return options;
}


function wrapSvgText(text: TextAttributes, textValue?: string): SubTextElement[] {
    let childNodes: SubTextElement[] = []; let k: number = 0;
    let txtValue: string; let bounds1: number;
    let content: string = textValue || text.content;
    if (text.whiteSpace !== 'nowrap' && text.whiteSpace !== 'pre') {
        if (text.breakWord === 'breakall') {
            txtValue = '';
            txtValue += content[0];
            for (k = 0; k < content.length; k++) {
                bounds1 = bBoxText(txtValue, text);
                if (bounds1 >= text.width && txtValue.length > 0) {
                    childNodes[childNodes.length] = { text: txtValue, x: 0, dy: 0, width: bounds1 };
                    txtValue = '';
                } else {
                    txtValue = txtValue + (content[k + 1] || '');
                    if (txtValue.indexOf('\n') > -1) {
                        txtValue = txtValue.replace('\n', '');
                    }
                    let width: number = bBoxText(txtValue, text);
                    if (Math.ceil(width) + 2 >= text.width && txtValue.length > 0) {
                        childNodes[childNodes.length] = { text: txtValue, x: 0, dy: 0, width: width };
                        txtValue = '';
                    }
                    if (k === content.length - 1 && txtValue.length > 0) {
                        childNodes[childNodes.length] = { text: txtValue, x: 0, dy: 0, width: width };
                        txtValue = '';
                    }
                }
            }
        } else {
            childNodes = wordWrapping(text, textValue);
        }
    } else {
        childNodes[childNodes.length] = { text: content, x: 0, dy: 0, width: bBoxText(content, text) };
    }
    return childNodes;
}

function wordWrapping(text: TextAttributes, textValue?: string): SubTextElement[] {
    let childNodes: SubTextElement[] = []; let txtValue: string = ''; let j: number = 0;
    let i: number = 0; let wrap: boolean = text.whiteSpace !== 'nowrap' ? true : false;
    let content: string = textValue || text.content;
    let eachLine: string[] = content.split('\n'); let txt: string;
    let words: Object[]; let newText: string;

    let existingWidth: number;
    let existingText: string;
    for (j = 0; j < eachLine.length; j++) {
        txt = '';
        words = text.textWrapping !== 'NoWrap' ? eachLine[j].split(' ') : eachLine;
        for (i = 0; i < words.length; i++) {
            txtValue += (((i !== 0 || words.length === 1) && wrap && txtValue.length > 0) ? ' ' : '') + words[i];
            newText = txtValue + (words[i + 1] || '');
            let width: number = bBoxText(newText, text);
            if (Math.floor(width) > text.width - 2 && txtValue.length > 0) {
                childNodes[childNodes.length] = {
                    text: txtValue, x: 0, dy: 0,
                    width: newText === txtValue ? width : (txtValue === existingText) ? existingWidth : bBoxText(txtValue, text)
                };
                txtValue = '';
            } else {
                if (i === words.length - 1) {
                    childNodes[childNodes.length] = { text: txtValue, x: 0, dy: 0, width: width };
                    txtValue = '';
                }
            }
            existingText = newText;
            existingWidth = width;
        }
    }
    return childNodes;
}

function wrapSvgTextAlign(text: TextAttributes, childNodes: SubTextElement[]): TextBounds {
    let wrapBounds: TextBounds = { x: 0, width: 0 };
    let k: number = 0; let txtWidth: number;
    let width: number;
    for (k = 0; k < childNodes.length; k++) {
        txtWidth = childNodes[k].width;
        width = txtWidth;
        if (text.textAlign === 'left') {
            txtWidth = 0;
        } else if (text.textAlign === 'center') {
            if (txtWidth > text.width && (text.textOverflow === 'Ellipsis' || text.textOverflow === 'Clip')) {
                txtWidth = 0;
            } else {
                txtWidth = -txtWidth / 2;
            }
        } else if (text.textAlign === 'right') {
            txtWidth = -txtWidth;
        } else {
            txtWidth = childNodes.length > 1 ? 0 : -txtWidth / 2;
        }
        childNodes[k].dy = text.fontSize * 1.2;
        childNodes[k].x = txtWidth;
        if (!wrapBounds) {
            wrapBounds = {
                x: txtWidth,
                width: width
            };
        } else {
            wrapBounds.x = Math.min(wrapBounds.x, txtWidth);
            wrapBounds.width = Math.max(wrapBounds.width, width);
        }
    }
    return wrapBounds;
}

/** @private */
export function measureText(
    text: TextElement, style: TextStyleModel, content: string,
    maxWidth?: number, textValue?: string): Size {
    let bounds: Size = new Size(0, 0);
    let childNodes: SubTextElement[];
    let wrapBounds: TextBounds;
    let options: TextAttributes = getTextOptions(text, maxWidth) as TextAttributes;
    text.childNodes = childNodes = wrapSvgText(options, textValue);
    text.wrapBounds = wrapBounds = wrapSvgTextAlign(options, childNodes);
    bounds.width = wrapBounds.width;
    if (text.wrapBounds.width >= maxWidth && options.textOverflow !== 'Wrap') {
        bounds.width = maxWidth;
    }
    bounds.height = childNodes.length * text.style.fontSize * 1.2;
    return bounds;
}

/** @private */
export function getDiagramElement(elementId: string, contentId?: string): HTMLElement {
    let diagramElement: HTMLElement; let element: HTMLElement;
    if (contentId) { element = document.getElementById(contentId); }
    diagramElement = (element) ? element.querySelector('#' + elementId) as HTMLElement : document.getElementById(elementId);
    return diagramElement;
}

/** @private */
export function createHtmlElement(elementType: string, attribute: Object): HTMLElement {
    let element: HTMLElement = createElement(elementType);
    setAttributeHtml(element, attribute);
    return element;
}

/** @private */
export function setAttributeHtml(element: HTMLElement, attributes: Object): void {
    let keys: string[] = Object.keys(attributes);
    for (let i: number = 0; i < keys.length; i++) {
        element.setAttribute(keys[i], attributes[keys[i]]);
    }
}

/**
 * @private
 */
export function getAdornerLayerSvg(diagramId: string, index?: number): SVGSVGElement {
    let adornerLayerSvg: SVGSVGElement = null;
    let diagramElement: HTMLElement = getDiagramElement(diagramId + index + '_diagramAdornerLayer');
    let elementcoll: NodeList;
    if (diagramElement) {
        elementcoll = diagramElement.getElementsByClassName('e-adorner-layer' + index);
        adornerLayerSvg = elementcoll[0] as SVGSVGElement;
    }
    return adornerLayerSvg;
}

/** @private */
export function getSelectorElement(diagramId: string, index?: number): SVGElement {
    let adornerLayer: SVGElement = null;
    let adornerSvg: SVGSVGElement = getAdornerLayerSvg(diagramId, index);
    if (adornerSvg) {
        adornerLayer = adornerSvg.getElementById(diagramId + '_SelectorElement') as SVGElement;
    }
    return adornerLayer;
}

/** @private */
export function createMeasureElements(): void {
    let measureElement: string = 'measureElement';
    if (!window[measureElement]) {
        let divElement: HTMLElement = createHtmlElement('div', {
            id: 'measureElement',
            style: 'visibility:hidden ; height: 0px ; width: 0px; overflow: hidden;'
        });
        let text: HTMLElement = createHtmlElement('span', { 'style': 'display:inline-block ; line-height: normal' });
        divElement.appendChild(text);
        let imageElement: HTMLImageElement;
        imageElement = createHtmlElement('img', {}) as HTMLImageElement;
        divElement.appendChild(imageElement);

        let svg: SVGSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
        divElement.appendChild(svg);

        let element: SVGPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        svg.appendChild(element);

        let data: Text = document.createTextNode('');
        let tSpan: SVGTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tSpan.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve');
        svg.appendChild(tSpan);
        window[measureElement] = divElement;
        window[measureElement].usageCount = 1;
        document.body.appendChild(divElement);
    } else {
        window[measureElement].usageCount += 1;
    }
}

/** @private */
export function measureImage(source: string, contentSize: Size): Size {
    let measureElement: string = 'measureElement';
    window[measureElement].style.visibility = 'visible';
    let imageElement: HTMLImageElement = window[measureElement].children[1];
    imageElement.setAttribute('src', source);
    let bounds: ClientRect = imageElement.getBoundingClientRect();
    let width: number = bounds.width;
    let height: number = bounds.height;
    contentSize = new Size(width, height);
    window[measureElement].style.visibility = 'hidden';
    return contentSize;
}
