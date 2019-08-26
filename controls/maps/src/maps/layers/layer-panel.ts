import { isNullOrUndefined, extend, createElement, Ajax } from '@syncfusion/ej2-base';
import { Maps } from '../../maps/maps';
import { getShapeColor } from '../model/theme';
import { GeoLocation, isCustomPath, convertGeoToPoint, Point, PathOption, Size, PolylineOption, getElementByID } from '../utils/helper';
import { MapLocation, RectOption, getTranslate, convertTileLatLongToPoint, checkShapeDataFields, CircleOption } from '../utils/helper';
import { getZoomTranslate } from '../utils/helper';
import { LayerSettings, ShapeSettings, Tile, BubbleSettings } from '../model/base';
import { LayerSettingsModel } from '../model/base-model';
import { BingMap } from './bing-map';
import { ColorMapping } from './color-mapping';
import { layerRendering, ILayerRenderingEventArgs, shapeRendering, IShapeRenderingEventArgs, BubbleSettingsModel, Rect } from '../index';
/**
 * To calculate and render the shape layer
 */

export class LayerPanel {
    private mapObject: Maps;
    private currentFactor: number;
    private groupElements: Element[];
    private layerObject: Element;
    private currentLayer: LayerSettings;
    private rectBounds: Object;
    public tiles: Tile[];
    private clipRectElement: Element;
    private layerGroup: Element;
    private tileTranslatePoint: MapLocation = new MapLocation(0, 0);
    private urlTemplate: string;
    private isMapCoordinates: boolean = true;
    private exactBounds: Object;
    private tileSvgObject: Element;
    private ajaxModule: Ajax;
    private ajaxProcessCount: number = 0;
    private ajaxResponse: LayerSettings[];
    private bing: BingMap;
    constructor(map: Maps) {
        this.mapObject = map;
        this.ajaxModule = new Ajax();
        this.ajaxResponse = [];
    }

    /* tslint:disable:no-string-literal */
    public measureLayerPanel(): void {
        let imageSize: number = 30;
        let layerCollection: LayerSettings[] = <LayerSettings[]>this.mapObject.layersCollection;
        let areaRect: Rect = this.mapObject.mapAreaRect;
        let padding: number = 10;
        let secondaryEle: HTMLElement = <HTMLElement>getElementByID(this.mapObject.element.id + '_Secondary_Element');
        if (this.mapObject.isTileMap && secondaryEle) {
            this.tileSvgObject = this.mapObject.renderer.createSvg({
                id: this.mapObject.element.id + '_Tile_SVG', width: areaRect.width,
                height: areaRect.height
            });
            secondaryEle.appendChild(this.tileSvgObject);
        }
        this.layerGroup = (this.mapObject.renderer.createGroup({
            id: this.mapObject.element.id + '_Layer_Collections',
            'clip-path': 'url(#' + this.mapObject.element.id + '_MapArea_ClipRect)'
        }));
        this.clipRectElement = this.mapObject.renderer.drawClipPath(new RectOption(
            this.mapObject.element.id + '_MapArea_ClipRect',
            'transparent', { width: 1, color: 'Gray' }, 1,
            {
                x: this.mapObject.isTileMap ? 0 : areaRect.x, y: this.mapObject.isTileMap ? 0 : areaRect.y,
                width: areaRect.width, height: areaRect.height
            }));
        this.layerGroup.appendChild(this.clipRectElement);
        this.mapObject.baseMapBounds = null;
        this.mapObject.baseMapRectBounds = null;
        this.mapObject.baseSize = null;
        let layerCount: number = layerCollection.length - 1;
        layerCollection.forEach((layer: LayerSettings, index: number) => {
            this.currentLayer = <LayerSettings>layer;
            this.processLayers(layer, index);
        });
    }

    protected renderTileLayer(panel: LayerPanel, layer: LayerSettings, layerIndex: number, bing?: BingMap): void {
        let center: Point = new Point(panel.mapObject.centerPosition.longitude, panel.mapObject.centerPosition.latitude);
        panel.currentFactor = panel.calculateFactor(layer);
        if (isNullOrUndefined(panel.mapObject.tileZoomLevel) || panel.mapObject.tileZoomLevel >= 1) {
            panel.mapObject.tileZoomLevel = panel.mapObject.zoomSettings.zoomFactor;
            if (!isNullOrUndefined(panel.mapObject.tileTranslatePoint)) {
                panel.mapObject.tileTranslatePoint.x = 0;
                panel.mapObject.tileTranslatePoint.y = 0;
            }
        }
        panel.mapObject.tileTranslatePoint = panel.panTileMap(
            panel.mapObject.availableSize.width, panel.mapObject.availableSize.height, center
        );
        panel.generateTiles(panel.mapObject.tileZoomLevel, panel.mapObject.tileTranslatePoint, bing);
        if (panel.mapObject.navigationLineModule) {
            panel.layerObject.appendChild(
                panel.mapObject.navigationLineModule.renderNavigation(panel.currentLayer, panel.mapObject.tileZoomLevel, layerIndex)
            );
        }
        if (panel.mapObject.markerModule) {
            panel.mapObject.markerModule.markerRender(panel.layerObject, layerIndex, panel.mapObject.tileZoomLevel, null);
        }
        panel.translateLayerElements(panel.layerObject, layerIndex);
        panel.layerGroup.appendChild(panel.layerObject);
    }


    protected processLayers(layer: LayerSettings, layerIndex: number): void {
        this.layerObject = (this.mapObject.renderer.createGroup({
            id: this.mapObject.element.id + '_LayerIndex_' + layerIndex
        }));
        let eventArgs: ILayerRenderingEventArgs = {
            cancel: false, name: layerRendering, index: layerIndex,
            layer: layer, maps: this.mapObject
        };
        this.mapObject.trigger('layerRendering', eventArgs, (observedArgs: ILayerRenderingEventArgs) => {
            if (!eventArgs.cancel) {
                if (layer.layerType !== 'Geometry') {
                    if (layer.layerType !== 'Bing' || this.bing) {
                        this.renderTileLayer(this, layer, layerIndex);
                    } else if (layer.key && layer.key.length > 1) {
                        let proxy: LayerPanel = this;
                        let bing: BingMap = new BingMap(this.mapObject);
                        let url: string = 'https://dev.virtualearth.net/REST/V1/Imagery/Metadata/' + layer.bingMapType;
                        let ajax: Ajax = new Ajax({
                            url: url + '?output=json&include=ImageryProviders&key=' + layer.key
                        });
                        ajax.onSuccess = (json: string) => {
                            let jsonObject: object = JSON.parse(json);
                            let resource: object = jsonObject['resourceSets'][0]['resources'][0];
                            let imageUrl: string = <string>resource['imageUrl'];
                            let subDomains: string[] = <string[]>resource['imageUrlSubdomains'];
                            let maxZoom: string = <string>resource['zoomMax'];
                            if (imageUrl !== null && imageUrl !== undefined && imageUrl !== bing.imageUrl) {
                                bing.imageUrl = imageUrl;
                            }
                            if (subDomains !== null && subDomains !== undefined && subDomains !== bing.subDomains) {
                                bing.subDomains = subDomains;
                            }
                            if (maxZoom !== null && maxZoom !== undefined && maxZoom !== bing.maxZoom) {
                                bing.maxZoom = maxZoom;
                            }
                            proxy.mapObject['bingMap'] = bing;
                            proxy.renderTileLayer(proxy, layer, layerIndex, bing);
                        };
                        ajax.send();
                    }
                } else {
                    if (!isNullOrUndefined(layer.shapeData) && (!isNullOrUndefined(layer.shapeData['geometries']) ||
                        !isNullOrUndefined(layer.shapeData['features']))) {
                        let featureData: Object[] = (!isNullOrUndefined(layer.shapeData['geometries']) &&
                            (<Object[]>layer.shapeData['geometries']).length > 0 ? layer.shapeData['geometries'] :
                            layer.shapeData['features']);
                        layer.layerData = [];
                        let bbox: Object = layer.shapeData['bbox'];
                        if (!isNullOrUndefined(bbox) && layer.isBaseLayer) {
                            this.mapObject.baseMapBounds = new GeoLocation(
                                { min: bbox[0][1], max: bbox[1][1] },
                                { min: bbox[0][0], max: bbox[1][0] }
                            );
                        } else if (isNullOrUndefined(this.mapObject.baseMapBounds) && !isCustomPath(featureData)) {
                            this.calculateRectBounds(featureData);
                            // if (isNullOrUndefined(this.mapObject.baseSize)) {
                            //     let minSize: Point = convertGeoToPoint(
                            //         this.mapObject.baseMapBounds.latitude.min,
                            //         this.mapObject.baseMapBounds.longitude.min, this.calculateFactor(layer), layer, this.mapObject
                            //     );
                            //     let maxSize: Point = convertGeoToPoint(
                            //         this.mapObject.baseMapBounds.latitude.max,
                            //         this.mapObject.baseMapBounds.longitude.max, this.calculateFactor(layer), layer, this.mapObject
                            //     );
                            //     this.mapObject.baseSize = new Size(Math.abs(minSize.x - maxSize.x), Math.abs(minSize.y - maxSize.y));
                            // }
                        }
                        this.calculatePathCollection(layerIndex, featureData);
                    }
                }
            }
        });
        if (!this.mapObject.isTileMap) {
            this.mapObject.svgObject.appendChild(this.layerGroup);
        } else if (this.tileSvgObject) {
            this.tileSvgObject.appendChild(this.layerGroup);
        }
    }

    //tslint:disable:max-func-body-length
    private bubbleCalculation(bubbleSettings: BubbleSettingsModel, range: { min: number, max: number }): void {
        if (bubbleSettings.dataSource != null && bubbleSettings != null) {
            for (let i: number = 0; i < bubbleSettings.dataSource.length; i++) {
                let bubbledata: number = parseFloat(bubbleSettings.dataSource[i][bubbleSettings.valuePath]);
                if (i !== 0) {
                    if (bubbledata > range.max) {
                        range.max = bubbledata;
                    } else if (bubbledata < range.min) {
                        range.min = bubbledata;
                    }
                } else {
                    range.max = range.min = bubbledata;
                }
            }
        }
    }
    // tslint:disable-next-line:max-func-body-length
    public calculatePathCollection(layerIndex: number, renderData: Object[]): void {
        this.groupElements = [];
        if ((!isCustomPath(renderData))) {
            this.currentFactor = this.calculateFactor(this.currentLayer);
        }
        this.rectBounds = null;
        let shapeSettings: ShapeSettings = <ShapeSettings>this.currentLayer.shapeSettings;
        let bubbleSettings: BubbleSettings[] = <BubbleSettings[]>this.currentLayer.bubbleSettings;

        renderData.forEach((geometryData: Object, index: number) => {
            if (!isNullOrUndefined(geometryData['geometry']) || !isNullOrUndefined(geometryData['coordinates'])) {
                let type: string = !isNullOrUndefined(geometryData['geometry']) ? geometryData['geometry']['type'] : geometryData['type'];
                let coords: Object[] = !isNullOrUndefined(geometryData['geometry']) ? geometryData['geometry']['coordinates'] :
                    geometryData['coordinates'];
                let data: Object = geometryData['geometry'];
                let properties: Object = geometryData['properties'];
                this.generatePoints(type, coords, data, properties);
            }
        });
        this.currentLayer.rectBounds = this.rectBounds;
        if (isNullOrUndefined(this.mapObject.baseMapRectBounds) && this.currentLayer.isBaseLayer) {
            this.mapObject.baseMapRectBounds = this.rectBounds;
        }
        let colors: string[] = shapeSettings.palette.length > 1 ? shapeSettings.palette : getShapeColor(this.mapObject.theme);
        let labelTemplateEle: HTMLElement = createElement('div', {
            id: this.mapObject.element.id + '_LayerIndex_' + layerIndex + '_Label_Template_Group',
            className: 'template',
            styles: 'pointer-events: none; overflow: hidden; position: absolute;' +
                'top:' + this.mapObject.mapAreaRect.y + 'px;' +
                'left:' + this.mapObject.mapAreaRect.x + 'px;' +
                'height:' + this.mapObject.mapAreaRect.height + 'px;' +
                'width:' + this.mapObject.mapAreaRect.width + 'px;'
        });
        for (let i: number = 0; i < this.currentLayer.layerData.length; i++) {
            let k: number;
            let currentShapeData: Object[] = <Object[]>this.currentLayer.layerData[i];
            let pathOptions: PathOption; let polyLineOptions: PolylineOption;
            let circleOptions: CircleOption; let groupElement: Element; let drawObject: Element;
            let path: string = ''; let points: string = ''; let getShapeColor: Object;
            let fill: string = (shapeSettings.autofill) ? colors[i % colors.length] : shapeSettings.fill;
            let opacity: number;
            if (shapeSettings.colorValuePath !== null && !isNullOrUndefined(currentShapeData['property'])) {
                k = checkShapeDataFields(
                    <Object[]>this.currentLayer.dataSource, currentShapeData['property'],
                    this.currentLayer.shapeDataPath, this.currentLayer.shapePropertyPath
                );
                if (k !== null && shapeSettings.colorMapping.length === 0) {
                    fill = this.currentLayer.dataSource[k][shapeSettings.colorValuePath];
                } else if (currentShapeData['property'][shapeSettings.colorValuePath] &&
                    (<Object[]>this.currentLayer.dataSource).length === 0 && shapeSettings.colorMapping.length === 0) {
                    fill = currentShapeData['property'][shapeSettings.colorValuePath];
                }
            }
            let shapeID: string = this.mapObject.element.id + '_LayerIndex_' + layerIndex + '_shapeIndex_' + i + '_dataIndex_' + k;
            getShapeColor = this.getShapeColorMapping(this.currentLayer, currentShapeData['property'], fill);
            fill = Object.prototype.toString.call(getShapeColor) === '[object Object]' && !isNullOrUndefined(getShapeColor['fill'])
                ? getShapeColor['fill'] : fill;
            opacity = (Object.prototype.toString.call(getShapeColor) === '[object Object]'
                && !isNullOrUndefined(getShapeColor['opacity'])) ? getShapeColor['opacity'] : shapeSettings.opacity;
            let eventArgs: IShapeRenderingEventArgs = {
                cancel: false, name: shapeRendering, index: i,
                data: this.currentLayer.dataSource ? this.currentLayer.dataSource[k] : null, maps: this.mapObject,
                shape: shapeSettings, fill: fill, border: { width: shapeSettings.border.width, color: shapeSettings.border.color }
            };
             // tslint:disable-next-line:max-func-body-length
            this.mapObject.trigger('shapeRendering', eventArgs, (shapeArgs: IShapeRenderingEventArgs) => {
                let drawingType: string = !isNullOrUndefined(currentShapeData['_isMultiPolygon'])
                ? 'MultiPolygon' : isNullOrUndefined(currentShapeData['type']) ? currentShapeData[0]['type'] : currentShapeData['type'];

                drawingType = (drawingType === 'Polygon' || drawingType === 'MultiPolygon') ? 'Polygon' : drawingType;
                if (this.groupElements.length < 1) {
                    groupElement = this.mapObject.renderer.createGroup({
                        id: this.mapObject.element.id + '_LayerIndex_' + layerIndex + '_' + drawingType + '_Group', transform: ''
                    });
                    this.groupElements.push(groupElement);
                } else {
                    for (let i: number = 0; i < this.groupElements.length; i++) {
                        let ele: Element = this.groupElements[i];
                        if (ele.id.indexOf(drawingType) > -1) {
                            groupElement = ele;
                            break;
                        } else if (i >= this.groupElements.length - 1) {
                            groupElement = this.mapObject.renderer.createGroup({
                                id: this.mapObject.element.id + '_LayerIndex_' + layerIndex + '_' + drawingType + '_Group'
                            });
                            this.groupElements.push(groupElement);
                            break;
                        }
                    }
                }
                let pathEle: Element;
                switch (drawingType) {
                    case 'Polygon':
                        if (!currentShapeData['_isMultiPolygon']) {
                            path += 'M' + (currentShapeData[0]['point']['x']) + ' ' + (currentShapeData[0]['point']['y']);
                            currentShapeData.map((shapeData: Object) => {
                                path += ' L ' + (shapeData['point']['x']) + ' ' + (shapeData['point']['y']);
                            });
                        } else {
                            path = this.generateMultiPolygonPath(<Object[]>currentShapeData);
                        }
                        path += ' z ';
                        if (path.length > 3) {
                            pathOptions = new PathOption(
                                shapeID, eventArgs.fill, eventArgs.border.width, eventArgs.border.color,
                                opacity, shapeSettings.dashArray, path);
                            pathEle = this.mapObject.renderer.drawPath(pathOptions) as SVGPathElement;
                        }
                        break;
                    case 'LineString':
                        currentShapeData.map((lineData: Object) => {
                            points += lineData['point']['x'] + ' , ' + lineData['point']['y'] + ' ';
                        });
                        polyLineOptions = new PolylineOption(
                            shapeID, points, eventArgs.fill, eventArgs.border.width, eventArgs.border.color,
                            opacity, shapeSettings.dashArray);
                        pathEle = this.mapObject.renderer.drawPolyline(polyLineOptions) as SVGPolylineElement;
                        break;
                    case 'Point':
                        let pointData: Object = <Object>currentShapeData['point'];
                        circleOptions = new CircleOption(shapeID, eventArgs.fill, eventArgs.border, opacity,
                                                         pointData['x'], pointData['y'], shapeSettings.circleRadius, null);
                        pathEle = this.mapObject.renderer.drawCircle(circleOptions) as SVGCircleElement;
                        break;
                    case 'Path':
                        path = <string>currentShapeData['point'];
                        pathOptions = new PathOption(
                            shapeID, eventArgs.fill, eventArgs.border.width, eventArgs.border.color, opacity,
                            shapeSettings.dashArray, path);
                        pathEle = this.mapObject.renderer.drawPath(pathOptions) as SVGPathElement;
                        break;
                    }
                if (!isNullOrUndefined(pathEle)) {
                    let property: string[] = (Object.prototype.toString.call(this.currentLayer.shapePropertyPath) === '[object Array]' ?
                        this.currentLayer.shapePropertyPath : [this.currentLayer.shapePropertyPath]) as string[];
                    // tslint:disable-next-line:align
                    let properties: string;
                    for (let j: number = 0; j < property.length; j++) {
                        if (!isNullOrUndefined(currentShapeData['property'])) {
                            properties = property[j];
                            break;
                        }
                    }
                    pathEle.setAttribute('aria-label', ((!isNullOrUndefined(currentShapeData['property'])) ?
                        (currentShapeData['property'][properties]) : ''));
                    pathEle.setAttribute('tabindex', (this.mapObject.tabIndex + i + 2).toString());
                    groupElement.appendChild(pathEle);
                }
            });
        }
        let bubbleG: Element;
        if (this.currentLayer.bubbleSettings.length && this.mapObject.bubbleModule) {
            let length: number = this.currentLayer.bubbleSettings.length;
            let bubble: BubbleSettingsModel;
            for (let j: number = 0; j < length; j++) {
                bubble = this.currentLayer.bubbleSettings[j];
                bubbleG = this.mapObject.renderer.createGroup({
                    id: this.mapObject.element.id + '_LayerIndex_' + layerIndex + '_bubble_Group_' + j
                });
                let range: { min: number, max: number } = { min: 0, max: 0 };
                this.bubbleCalculation(bubble, range);
                bubble.dataSource.map((bubbleData: object, i: number) => {
                    this.renderBubble(this.currentLayer, bubbleData, colors[i % colors.length], range, j, i, bubbleG, layerIndex, bubble);
                });
                this.groupElements.push(bubbleG);
            }
        }
        let group: Element = (this.mapObject.renderer.createGroup({
            id: this.mapObject.element.id + '_LayerIndex_' + layerIndex + '_dataLableIndex_Group', style: 'pointer-events: none;'
        }));
        if (this.mapObject.dataLabelModule && this.currentLayer.dataLabelSettings.visible) {
            let intersect: object[] = [];
            renderData.map((currentShapeData: object[], i: number) => {
                this.renderLabel(this.currentLayer, layerIndex, currentShapeData, group, i, labelTemplateEle, intersect);
            });
            this.groupElements.push(group);
        }
        if (this.mapObject.navigationLineModule) {
            this.groupElements.push(this.mapObject.navigationLineModule.renderNavigation(
                this.currentLayer, this.currentFactor, layerIndex
            ));
        }
        this.groupElements.map((element: Element) => {
            this.layerObject.appendChild(element);
        });
        if (this.mapObject.markerModule) {
            this.mapObject.markerModule.markerRender(this.layerObject, layerIndex, this.currentFactor, null);
        }
        this.translateLayerElements(this.layerObject, layerIndex);
        this.layerGroup.appendChild(this.layerObject);
    }

    /**
     *  render datalabel
     */
    private renderLabel(
        layer: LayerSettings, layerIndex: number,
        shape: object[], group: Element, shapeIndex: number, labelTemplateEle: HTMLElement, intersect: object[]
    ): void {
        this.mapObject.dataLabelModule.renderLabel(
            layer, layerIndex, shape, layer.layerData, group, labelTemplateEle, shapeIndex, intersect
        );
    }
    /**
     * To render path for multipolygon
     */
    private generateMultiPolygonPath(currentShapeData: Object[]): string {
        let path: string = '';
        let shape: Object[];
        for (let j: number = 0; j < currentShapeData.length; j++) {
            path += 'M' + (currentShapeData[j][0]['point']['x']) + ' ' + (currentShapeData[j][0]['point']['y']);
            shape = <Object[]>currentShapeData[j];
            shape.map((shapeData: Object) => {
                path += ' L ' + (shapeData['point']['x']) + ' ' + (shapeData['point']['y']);
            });
        }
        return path;
    }
    /**
     * To render bubble
     */
    private renderBubble(
        layer: LayerSettings, bubbleData: object, color: string, range: { min: number, max: number },
        bubbleIndex: number, dataIndex: number, group: Element, layerIndex: number, bubbleSettings: BubbleSettingsModel
    ): void {
        if (isNullOrUndefined(this.mapObject.bubbleModule) || !bubbleSettings.visible) {
            return null;
        }
        color = bubbleSettings.fill ? bubbleSettings.fill : color;
        this.mapObject.bubbleModule.id = this.mapObject.element.id + '_LayerIndex_' + layerIndex + '_BubbleIndex_' +
            bubbleIndex + '_dataIndex_' + dataIndex;
        this.mapObject.bubbleModule.renderBubble(
            bubbleSettings, bubbleData, color, range, bubbleIndex, dataIndex, layerIndex, layer, group);
    }
    /**
     * To get the shape color from color mapping module
     */
    private getShapeColorMapping(layer: LayerSettingsModel, shape: object, color: string): Object {
        color = color ? color : layer.shapeSettings.fill;
        if (layer.shapeSettings.colorMapping.length === 0 && isNullOrUndefined(layer.dataSource)) {
            return color;
        }
        let index: number = checkShapeDataFields(<Object[]>layer.dataSource, shape, layer.shapeDataPath, layer.shapePropertyPath);
        let colorMapping: ColorMapping = new ColorMapping(this.mapObject);
        if (isNullOrUndefined(layer.dataSource[index])) {
            return color;
        }
        return colorMapping.getShapeColorMapping(layer.shapeSettings, layer.dataSource[index], color);
    }
    public generatePoints(type: string, coordinates: Object[], data: Object, properties: Object): void {
        let latitude: number; let longitude: number;
        let newData: Object[] = [];
        switch (type.toLowerCase()) {
            case 'polygon':
                newData = <Object[]>this.calculatePolygonBox(<Object[]>coordinates[0], data, properties);
                if (newData.length > 0) {
                    newData['property'] = properties;
                    newData['type'] = type;
                    newData['_isMultiPolygon'] = false;
                    this.currentLayer.layerData.push(newData);
                }
                break;
            case 'multipolygon':
                let multiPolygonDatas: Object[] = [];
                for (let i: number = 0; i < coordinates.length; i++) {
                    newData = <Object[]>this.calculatePolygonBox(<Object[]>coordinates[i][0], data, properties);
                    if (newData.length > 0) {
                        multiPolygonDatas.push(newData);
                    }
                }
                multiPolygonDatas['property'] = properties;
                multiPolygonDatas['type'] = type;
                multiPolygonDatas['_isMultiPolygon'] = true;
                this.currentLayer.layerData.push(multiPolygonDatas);
                break;
            case 'linestring':
                coordinates.map((points: Object, index: number) => {
                    latitude = <number>points[1];
                    longitude = <number>points[0];
                    let point: Point = convertGeoToPoint(
                        latitude, longitude, this.currentFactor, this.currentLayer, this.mapObject);
                    newData.push({
                        point: point, lat: latitude, lng: longitude
                    });
                });
                newData['property'] = properties;
                newData['type'] = type;
                this.currentLayer.layerData.push(newData);
                break;
            case 'point':
                let arrayCollections: boolean = false;
                coordinates.map((points: Object, index: number) => {
                    if (Object.prototype.toString.call(points) === '[object Array]') {
                        latitude = points[1];
                        longitude = points[0];
                        arrayCollections = true;
                        let point: Point = convertGeoToPoint(latitude, longitude, this.currentFactor, this.currentLayer, this.mapObject);
                        this.currentLayer.layerData.push({
                            point: point, type: type, lat: latitude, lng: longitude, property: properties
                        });
                    }
                });
                if (!arrayCollections) {
                    latitude = <number>coordinates[1];
                    longitude = <number>coordinates[0];
                    let point: Point = convertGeoToPoint(latitude, longitude, this.currentFactor, this.currentLayer, this.mapObject);
                    this.currentLayer.layerData.push({
                        point: point, type: type, lat: latitude, lng: longitude, property: properties
                    });
                }
                break;
            case 'path':
                this.currentLayer.layerData.push({
                    point: data['d'], type: type, property: properties
                });
                break;
        }
    }

    public calculateFactor(layer: LayerSettings): number {
        let horFactor: number; let verFactor: number = 1;
        let divide: number = 10;
        let exp: string = 'e+1';
        let bounds: GeoLocation = this.mapObject.baseMapBounds;
        let mapSize: Size = new Size(this.mapObject.mapAreaRect.width, this.mapObject.mapAreaRect.height - 5);
        let mapHeight: number; let mapWidth: number;
        if (bounds) {
            let start: Point = convertGeoToPoint(
                bounds.latitude.min, bounds.longitude.min, null, layer, this.mapObject);
            let end: Point = convertGeoToPoint(
                bounds.latitude.max, bounds.longitude.max, null, layer, this.mapObject);
            mapHeight = end.y - start.y;
            mapWidth = end.x - start.x;
        } else {
            mapHeight = mapWidth = 500;
        }
        if (mapHeight < mapSize.height) {
            horFactor = parseFloat(Math.abs(Number(mapSize.height / Number(mapHeight.toString() + exp)) * 100).toString().split('.')[0])
                / divide;
        } else {
            horFactor = mapSize.height / mapHeight;
        }
        if (mapWidth < mapSize.width) {
            verFactor = parseFloat(Math.abs(Number(mapSize.width / Number(mapWidth.toString() + exp)) * 100).toString().split('.')[0])
                / divide;
        } else {
            verFactor = mapSize.width / mapWidth;
        }
        return (Math.min(verFactor, horFactor));
    }

    public translateLayerElements(layerElement: Element, index: number): void {
        let childNode: HTMLElement;
        if (!isNullOrUndefined(this.mapObject.baseMapRectBounds)) {
            let duration: number = this.currentLayer.animationDuration;
            let animate: boolean = duration !== 0 || isNullOrUndefined(this.mapObject.zoomModule);
            this.mapObject.baseTranslatePoint = this.mapObject.zoomTranslatePoint;
            let translate: Object;
            if (this.mapObject.zoomSettings.zoomFactor > 1 && !isNullOrUndefined(this.mapObject.zoomModule)) {
                translate = getZoomTranslate(this.mapObject, this.currentLayer, animate);
            } else {
                translate = getTranslate(this.mapObject, this.currentLayer, animate);
            }
            let scale: number = this.mapObject.previousScale = translate['scale'];
            let location: Point = this.mapObject.previousPoint = translate['location'] as Point;
            this.mapObject.baseTranslatePoint = this.mapObject.translatePoint = location;
            this.mapObject.baseScale = this.mapObject.scale = scale;
            for (let i: number = 0; i < layerElement.childElementCount; i++) {
                childNode = layerElement.childNodes[i] as HTMLElement;
                if (!(childNode.id.indexOf('_Markers_Group') > -1) &&
                    (!(childNode.id.indexOf('_bubble_Group') > -1)) &&
                    (!(childNode.id.indexOf('_dataLableIndex_Group') > -1))
                ) {
                    let transform: string = 'scale( ' + scale + ' ) '
                        + 'translate( ' + location.x + ' ' + location.y + ' ) ';
                    childNode.setAttribute('transform', transform);
                    if (duration > 0 && !isNullOrUndefined(this.mapObject.zoomModule)) {
                        if (this.mapObject.zoomSettings.zoomFactor > 1) {
                            translate = getZoomTranslate(this.mapObject, this.currentLayer);
                        } else {
                            translate = getTranslate(this.mapObject, this.currentLayer);
                        }
                        this.mapObject.scale = translate['scale'];
                        this.mapObject.zoomTranslatePoint = this.mapObject.translatePoint = translate['location'] as Point;
                    }
                }
            }
        } else if (this.mapObject.isTileMap && !isNullOrUndefined(this.mapObject.scale)) {
            for (let j: number = 0; j < layerElement.childElementCount; j++) {
                childNode = layerElement.childNodes[j] as HTMLElement;
                if (!(childNode.id.indexOf('_Markers_Group') > -1) &&
                    (!(childNode.id.indexOf('_bubble_Group') > -1)) &&
                    (!(childNode.id.indexOf('_dataLableIndex_Group') > -1)) &&
                    (!(childNode.id.indexOf('_line_Group') > -1))) {
                    let transform: string = 'scale( ' + this.mapObject.scale + ' ) ' + 'translate( ' + this.mapObject.translatePoint.x
                        + ' ' + this.mapObject.translatePoint.y + ' ) ';
                    childNode.setAttribute('transform', transform);
                }
            }
        }
    }

    public calculateRectBounds(layerData: Object[]): void {
        layerData.forEach((obj: Object, index: number) => {
            if (!isNullOrUndefined(obj['geometry']) || !isNullOrUndefined(obj['coordinates'])) {
                let type: string = !isNullOrUndefined(obj['geometry']) ? obj['geometry']['type'] : obj['type'];
                let coordinates: Object[] = !isNullOrUndefined(obj['geometry']) ? obj['geometry']['coordinates'] : obj['coordinates'];
                switch (type.toLowerCase()) {
                    case 'polygon':
                        this.calculateRectBox(<Object[]>coordinates[0]);
                        break;
                    case 'multipolygon':
                        coordinates.map((point: Object, index: number) => {
                            this.calculateRectBox(point[0]);
                        });
                        break;
                }
            }
        });
    }

    public calculatePolygonBox(coordinates: Object[], data: Object, properties: Object): Object {
        let newData: Object[] = [];
        let bounds: GeoLocation = this.mapObject.baseMapBounds;
        coordinates.map((currentPoint: Object, index: number) => {
            let latitude: number = currentPoint[1];
            let longitude: number = currentPoint[0];
            if ((longitude >= bounds.longitude.min && longitude <= bounds.longitude.max)
                && (latitude >= bounds.latitude.min && latitude <= bounds.latitude.max)) {
                let point: Point = convertGeoToPoint(
                    latitude, longitude, this.currentFactor, this.currentLayer, this.mapObject
                );
                if (isNullOrUndefined(this.rectBounds)) {
                    this.rectBounds = { min: { x: point.x, y: point.y }, max: { x: point.x, y: point.y } };
                } else {
                    this.rectBounds['min']['x'] = Math.min(this.rectBounds['min']['x'], point.x);
                    this.rectBounds['min']['y'] = Math.min(this.rectBounds['min']['y'], point.y);
                    this.rectBounds['max']['x'] = Math.max(this.rectBounds['max']['x'], point.x);
                    this.rectBounds['max']['y'] = Math.max(this.rectBounds['max']['y'], point.y);
                }
                newData.push({
                    point: point,
                    lat: latitude,
                    lng: longitude
                });
            }
        });
        return newData;
    }

    public calculateRectBox(coordinates: Object[]): void {
        coordinates.forEach((currentCoords: Object) => {
            if (isNullOrUndefined(this.mapObject.baseMapBounds)) {
                this.mapObject.baseMapBounds = new GeoLocation(
                    { min: currentCoords[1], max: currentCoords[1] },
                    { min: currentCoords[0], max: currentCoords[0] });
            } else {
                this.mapObject.baseMapBounds.latitude.min = Math.min(this.mapObject.baseMapBounds.latitude.min, currentCoords[1]);
                this.mapObject.baseMapBounds.latitude.max = Math.max(this.mapObject.baseMapBounds.latitude.max, currentCoords[1]);
                this.mapObject.baseMapBounds.longitude.min = Math.min(this.mapObject.baseMapBounds.longitude.min, currentCoords[0]);
                this.mapObject.baseMapBounds.longitude.max = Math.max(this.mapObject.baseMapBounds.longitude.max, currentCoords[0]);
            }
        });
    }
    public generateTiles(zoomLevel: number, tileTranslatePoint: Point, bing?: BingMap): void {
        let userLang: string = this.mapObject.locale;
        let size: Size = this.mapObject.availableSize;
        this.tiles = [];
        let xcount: number;
        let ycount: number;
        xcount = ycount = Math.pow(2, zoomLevel);
        let width: number = size.width / 2;
        let height: number = size.height / 2;
        let baseLayer: LayerSettingsModel = this.mapObject.layers[this.mapObject.baseLayerIndex];
        this.urlTemplate = baseLayer.urlTemplate;
        let endY: number = Math.min(ycount, ((-tileTranslatePoint.y + size.height) / 256) + 1);
        let endX: number = Math.min(xcount, ((-tileTranslatePoint.x + size.width) / 256) + 1);
        let startX: number = (-(tileTranslatePoint.x + 256) / 256);
        let startY: number = (-(tileTranslatePoint.y + 256) / 256);
        bing = bing || this.bing || this.mapObject['bingMap'];
        for (let i: number = Math.round(startX); i < Math.round(endX); i++) {
            for (let j: number = Math.round(startY); j < Math.round(endY); j++) {
                let x: number = 256 * i + tileTranslatePoint.x;
                let y: number = 256 * j + tileTranslatePoint.y;
                if (x > -256 && x <= size.width && y > -256 && y < size.height) {
                    if (i >= 0 && j >= 0) {
                        let tile: Tile = new Tile(i, j);
                        tile.left = x;
                        tile.top = y;
                        if (baseLayer.layerType === 'Bing') {
                            let key: string = baseLayer.key;
                            tile.src = bing.getBingMap(tile, key, baseLayer.bingMapType, userLang, bing.imageUrl, bing.subDomains);
                        }  else if (baseLayer.layerType.toLowerCase() === 'tms') {
                            tile.src = this.urlTemplate.replace('level', zoomLevel.toString()).replace('tileX', tile.x.toString())
                                .replace('tileY', (Math.pow(2, zoomLevel) - tile.y - 1).toString());
                        } else {
                            tile.src = this.urlTemplate.replace('level', zoomLevel.toString()).replace('tileX', tile.x.toString())
                                .replace('tileY', tile.y.toString());
                        }
                        this.tiles.push(tile);
                    }
                }
            }
        }
        let proxTiles: Tile[] = extend([], this.tiles, [], true) as Tile[];
        for (let layer of this.mapObject.layers) {
            if (!(layer.type === 'SubLayer' && layer.visible)) {
                continue;
            }
            if (layer.layerType === 'OSM' || layer.layerType === 'Bing' || layer.layerType.toLowerCase() === 'tms') {
                for (let baseTile of proxTiles) {
                    let subtile: Tile = extend(baseTile, {}, {}, true) as Tile;
                    if (layer.layerType === 'Bing') {
                        subtile.src = bing.getBingMap(subtile, layer.key, layer.bingMapType, userLang, bing.imageUrl, bing.subDomains);
                    } else if (layer.layerType.toLowerCase() === 'tms') {
                        subtile.src = layer.urlTemplate.replace('level', zoomLevel.toString()).replace('tileX', baseTile.x.toString())
                        .replace('tileY', (Math.pow(2, zoomLevel) - baseTile.y - 1).toString());
                    } else {
                        subtile.src = layer.urlTemplate.replace('level', zoomLevel.toString()).replace('tileX', baseTile.x.toString())
                            .replace('tileY', baseTile.y.toString());
                    }
                    this.tiles.push(subtile);
                }
            }
        }
        this.arrangeTiles();
    }

    public arrangeTiles(): void {
        let htmlString: string = this.templateCompiler(this.tiles);
        if (getElementByID(this.mapObject.element.id + '_tile_parent')) {
            document.getElementById(this.mapObject.element.id + '_tile_parent').innerHTML = htmlString;
        }
    }
    private templateCompiler(tiles: Tile[]): string {
        let tileElment: string = '';
        let id: number = 0;
        for (let tile of tiles) {
            tileElment += '<div><div id="tile' + id + '" style="position:absolute;left: ' + tile.left + 'px;top: ' + tile.top +
                'px;height: ' + tile.height + 'px;width: ' + tile.width + 'px;"><img src="' + tile.src + '"></img></div></div>';
            id++;
        }
        return tileElment;
    }
    private panTileMap(factorX: number, factorY: number, centerPosition: MapLocation): Point {
        let level: number = this.mapObject.tileZoomLevel;
        let padding: number = 20; let x: number; let y: number;
        let totalSize: number = Math.pow(2, level) * 256;
        x = (factorX / 2) - (totalSize / 2);
        y = (factorY / 2) - (totalSize / 2);
        let position: MapLocation = convertTileLatLongToPoint(
            centerPosition, level, { x: x, y: y }, this.isMapCoordinates);
        x -= position.x - (factorX / 2);
        y = (y - (position.y - (factorY / 2))) + padding;
        this.mapObject.scale = Math.pow(2, level - 1);
        if (!isNullOrUndefined(this.mapObject.tileTranslatePoint)) {
            if (this.mapObject.tileTranslatePoint.x !== 0 && this.mapObject.tileTranslatePoint.x !== x) {
                x = this.mapObject.tileTranslatePoint.x;
            }
            if (this.mapObject.tileTranslatePoint.y !== 0 && this.mapObject.tileTranslatePoint.y !== y) {
                y = this.mapObject.tileTranslatePoint.y;
            }
        }
        this.mapObject.translatePoint = new Point(
            (x - (0.01 * this.mapObject.scale)) / this.mapObject.scale,
            (y - (0.01 * this.mapObject.scale)) / this.mapObject.scale
        );
        return new Point(x, y);
    }

}
