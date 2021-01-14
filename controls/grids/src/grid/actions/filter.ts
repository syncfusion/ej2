import { EventHandler, L10n, isNullOrUndefined, extend, closest, getValue, KeyboardEventArgs } from '@syncfusion/ej2-base';
import { getActualPropFromColl, isActionPrevent, getColumnByForeignKeyValue } from '../base/util';
import { remove, matches, isBlazor } from '@syncfusion/ej2-base';
import { DataUtil, Predicate, Query, DataManager } from '@syncfusion/ej2-data';
import { FilterSettings, Grid } from '../base/grid';
import { IGrid, IAction, NotifyArgs, IFilterOperator, IValueFormatter, FilterUI, EJ2Intance } from '../base/interface';
import * as events from '../base/constant';
import { CellType } from '../base/enum';
import { PredicateModel } from '../base/grid-model';
import { RowRenderer } from '../renderer/row-renderer';
import { ServiceLocator } from '../services/service-locator';
import { CellRendererFactory } from '../services/cell-render-factory';
import { Column } from '../models/column';
import { Cell } from '../models/cell';
import { Row } from '../models/row';
import { FilterCellRenderer } from '../renderer/filter-cell-renderer';
import { parentsUntil } from '../base/util';
import { FilterMenuRenderer } from '../renderer/filter-menu-renderer';
import { CheckBoxFilter } from '../actions/checkbox-filter';
import { ExcelFilter } from '../actions/excel-filter';

/**
 *
 * The `Filter` module is used to handle filtering action.
 */
export class Filter implements IAction {
    //Internal variables   
    private filterSettings: FilterSettings;
    private element: Element;
    private value: string | number | Date | boolean;
    private predicate: string = 'and';
    private operator: string;
    private column: Column;
    private fieldName: string;
    private matchCase: boolean;
    private ignoreAccent: boolean;
    private timer: number;
    private filterStatusMsg: string;
    private currentFilterObject: PredicateModel;
    private isRemove: boolean;
    private contentRefresh: boolean = true;
    private initialLoad: boolean;
    private filterByMethod: boolean = true;
    private refresh: boolean = true;
    private values: Object = {};
    public operators: Object = {};
    private cellText: Object = {};
    private nextFlMenuOpen: string = '';
    private type: Object = { 'Menu': FilterMenuRenderer, 'CheckBox': CheckBoxFilter, 'Excel': ExcelFilter };
    private filterModule: { openDialog: Function, closeDialog: Function, destroy: Function,
    isresetFocus: boolean, getFilterUIInfo: Function };
    /** @hidden */
    public filterOperators: IFilterOperator = {
        contains: 'contains', endsWith: 'endswith', equal: 'equal', greaterThan: 'greaterthan', greaterThanOrEqual: 'greaterthanorequal',
        lessThan: 'lessthan', lessThanOrEqual: 'lessthanorequal', notEqual: 'notequal', startsWith: 'startswith'
    };
    private fltrDlgDetails: { field?: string, isOpen?: boolean } = { field: '', isOpen: false };

    public customOperators: Object;
    /** @hidden */
    public skipNumberInput: string[] = ['=', ' ', '!'];
    public skipStringInput: string[] = ['>', '<', '='];
    //Module declarations
    private parent: IGrid;
    private serviceLocator: ServiceLocator;
    private l10n: L10n;
    private valueFormatter: IValueFormatter;
    private actualPredicate: { [key: string]: PredicateModel[] } = {};
    public prevFilterObject: PredicateModel;
    public filterObjIndex: number;

    /**
     * Constructor for Grid filtering module
     * @hidden
     */
    constructor(parent?: IGrid, filterSettings?: FilterSettings, serviceLocator?: ServiceLocator) {
        this.parent = parent;
        this.filterSettings = filterSettings;
        this.serviceLocator = serviceLocator;
        this.addEventListener();
    }

    /** 
     * To render filter bar when filtering enabled. 
     * @return {void}  
     * @hidden
     */
    public render(e?: NotifyArgs): void {
        if (DataUtil.getObject('args.isFrozen', e) || (this.parent.getFrozenMode() === 'Left-Right' &&
            DataUtil.getObject('args.renderFrozenRightContent', e))) {
            return;
        }
        let gObj: IGrid = this.parent;
        this.l10n = this.serviceLocator.getService<L10n>('localization');
        this.getLocalizedCustomOperators();
        if (this.parent.filterSettings.type === 'FilterBar') {
            if (gObj.columns.length) {
                let fltrElem: Element = this.parent.element.querySelector('.e-filterbar');
                if (fltrElem) {
                    remove(fltrElem);
                }
                let rowRenderer: RowRenderer<Column> = new RowRenderer<Column>(this.serviceLocator, CellType.Filter, gObj);
                let row: Row<Column>;
                let cellrender: CellRendererFactory = this.serviceLocator.getService<CellRendererFactory>('cellRendererFactory');
                cellrender.addCellRenderer(CellType.Filter, new FilterCellRenderer(this.parent, this.serviceLocator));
                this.valueFormatter = this.serviceLocator.getService<IValueFormatter>('valueFormatter');
                rowRenderer.element = this.parent.createElement('tr', { className: 'e-filterbar' });
                row = this.generateRow();
                row.data = this.values;
                if (gObj.getFrozenMode() === 'Right') {
                    let thead: Element = gObj.getFrozenRightHeader().querySelector('thead');
                    thead.appendChild(rowRenderer.element);
                } else {
                    this.parent.getHeaderContent().querySelector('thead').appendChild(rowRenderer.element);
                }
                let rowdrag: Element = this.parent.element.querySelector('.e-rowdragheader');
                this.element = rowRenderer.render(row, <Column[]>gObj.getColumns(), null, null, rowRenderer.element);
                let detail: Element = this.element.querySelector('.e-detailheadercell');
                if (detail) {
                    detail.className = 'e-filterbarcell e-mastercell';
                }
                if (rowdrag) {
                    rowdrag.className = 'e-dragheadercell e-mastercell';
                }
                let gCells: Element[] = [].slice.call(this.element.querySelectorAll('.e-grouptopleftcell'));
                if (gCells.length) {
                    gCells[gCells.length - 1].classList.add('e-lastgrouptopleftcell');
                }
                this.wireEvents();
                this.parent.notify(events.freezeRender, { case: 'filter' });
            }
        }
    }

    /** 
     * To destroy the filter bar. 
     * @return {void} 
     * @hidden
     */
    public destroy(): void {
        let gridElement: Element = this.parent.element;
        if (!gridElement || (!gridElement.querySelector('.e-gridheader') && !gridElement.querySelector('.e-gridcontent'))) { return; }
        if (this.filterModule) {
            this.filterModule.destroy();
        }
        // tslint:disable-next-line:no-any
        if (!(<any>this.parent).refreshing) {
            this.filterSettings.columns = [];
        }
        this.updateFilterMsg();
        this.removeEventListener();
        this.unWireEvents();
        if (this.filterSettings.type === 'FilterBar' && this.filterSettings.showFilterBarOperator) {
            let dropdownlist: NodeListOf<Element> = this.element.querySelectorAll('.e-filterbaroperator');
            for (let i: number = 0; i < dropdownlist.length; i++) {
                (<EJ2Intance>dropdownlist[i]).ej2_instances[0].destroy();
            }
        }
        if (this.element) {
            remove(this.element);
            let filterBarElement: Element = this.parent.getHeaderContent().querySelector('.e-filterbar');
            if (this.parent.isFrozenGrid() && filterBarElement) {
                remove(filterBarElement);
            }
        }
    }

    private generateRow(index?: number): Row<Column> {
        let options: { [o: string]: Object } = {};
        let row: Row<Column> = new Row<Column>(options);
        row.cells = this.generateCells();
        return row;
    }

    private generateCells(): Cell<Column>[] {
        //TODO: generate dummy column for group, detail, stacked row here for filtering;
        let cells: Cell<Column>[] = [];
        if (this.parent.allowGrouping) {
            for (let c: number = 0, len: number = this.parent.groupSettings.columns.length; c < len; c++) {
                cells.push(this.generateCell({} as Column, CellType.HeaderIndent));
            }
        }
        if (this.parent.detailTemplate || this.parent.childGrid) {
            cells.push(this.generateCell({} as Column, CellType.DetailHeader));
        }
        if (this.parent.isRowDragable() && this.parent.getFrozenMode() !== 'Right') {
            cells.push(this.generateCell({} as Column, CellType.RowDragHIcon));
        }
        for (let dummy of this.parent.getColumns() as Column[]) {
            cells.push(this.generateCell(dummy));
        }
        if (this.parent.getFrozenMode() === 'Right') {
            cells.push(this.generateCell({} as Column, CellType.RowDragHIcon));
        }
        return cells;
    }


    private generateCell(column: Column, cellType?: CellType): Cell<Column> {
        let opt: { [o: string]: Object } = {
            'visible': column.visible,
            'isDataCell': false,
            'rowId': '',
            'column': column,
            'cellType': cellType ? cellType : CellType.Filter,
            'attributes': { title: this.l10n.getConstant('FilterbarTitle') }
        };
        return new Cell<Column>(opt);
    }

    /** 
     * To update filterSettings when applying filter. 
     * @return {void}
     * @hidden
     */
    public updateModel(): void {
        let col: Column = this.parent.getColumnByField(this.fieldName);
        this.filterObjIndex =  this.getFilteredColsIndexByField(col);
        this.prevFilterObject = this.filterSettings.columns[this.filterObjIndex];
        let arrayVal: (string | number | Date | boolean)[] = Array.isArray(this.value) ? this.value : [this.value];
        for (let i: number = 0, len: number = arrayVal.length; i < len; i++) {
            let field: string = col.isForeignColumn() ? col.foreignKeyValue : this.fieldName;
            this.currentFilterObject = {
                field: field, uid: col.uid, isForeignKey: col.isForeignColumn(), operator: this.operator,
                value: arrayVal[i], predicate: this.predicate,
                matchCase: this.matchCase, ignoreAccent: this.ignoreAccent, actualFilterValue: {}, actualOperator: {}
            };
            let index: number = this.getFilteredColsIndexByField(col);
            if (index > -1 && !Array.isArray(this.value)) {
                this.filterSettings.columns[index] = this.currentFilterObject;
            } else {
                this.filterSettings.columns.push(this.currentFilterObject);
            }
        }
        this.filterSettings.columns = this.filterSettings.columns;
        this.parent.dataBind();
    }

    private getFilteredColsIndexByField(col: Column): number {
        let cols: PredicateModel[] = this.filterSettings.columns;
        for (let i: number = 0, len: number = cols.length; i < len; i++) {
            if (cols[i].uid === col.uid || (col.isForeignColumn() && this.parent.getColumnByUid(col.uid).field === col.foreignKeyValue)) {
                return i;
            }
        }
        return -1;
    }

    /** 
     * To trigger action complete event. 
     * @return {void} 
     * @hidden
     */
    public onActionComplete(e: NotifyArgs): void {
        if (isBlazor() && !this.parent.isJsComponent) {
            e.rows = null;
        }
        let args: Object = !this.isRemove ? {
            currentFilterObject: this.currentFilterObject,
            /* tslint:disable:no-string-literal */
            currentFilteringColumn: !isNullOrUndefined(this.column) ? this.column.field : undefined,
            /* tslint:enable:no-string-literal */
            columns: this.filterSettings.columns, requestType: 'filtering', type: events.actionComplete
        } : {
                requestType: 'filtering', type: events.actionComplete
            };
        this.parent.trigger(events.actionComplete, extend(e, args));
        this.isRemove = false;
    }

    private wireEvents(): void {
        EventHandler.add(this.parent.getHeaderContent(), 'keyup', this.keyUpHandlerImmediate, this);
    }

    private unWireEvents(): void {
        EventHandler.remove(this.parent.getHeaderContent(), 'keyup', this.keyUpHandlerImmediate);
    }


    private enableAfterRender(e: NotifyArgs): void {
        if (e.module === this.getModuleName() && e.enable) {
            this.parent.getHeaderTable().classList.add('e-sortfilter');
            this.render();
        }
    }

    private initialEnd(): void {
        this.parent.off(events.contentReady, this.initialEnd);
        if (this.parent.getColumns().length && this.filterSettings.columns.length) {
            let gObj: IGrid = this.parent;
            this.contentRefresh = false;
            this.initialLoad = true;
            for (let col of gObj.filterSettings.columns) {
                this.filterByColumn(
                    col.field, col.operator, col.value as string, col.predicate, col.matchCase,
                    col.ignoreAccent, col.actualFilterValue, col.actualOperator
                );
            }
            this.initialLoad = false;
            this.updateFilterMsg();
            this.contentRefresh = true;
        }
    }
    /**
     * @hidden
     */
    public addEventListener(): void {
        if (this.parent.isDestroyed) { return; }
        this.parent.on(events.uiUpdate, this.enableAfterRender, this);
        this.parent.on(events.filterComplete, this.onActionComplete, this);
        this.parent.on(events.inBoundModelChanged, this.onPropertyChanged, this);
        this.parent.on(events.keyPressed, this.keyUpHandler, this);
        this.parent.on(events.columnPositionChanged, this.columnPositionChanged, this);
        this.parent.on(events.headerRefreshed, this.render, this);
        this.parent.on(events.contentReady, this.initialEnd, this);
        this.parent.on(events.filterMenuClose, this.filterMenuClose, this);
        EventHandler.add(document, 'click', this.clickHandler, this);
        this.parent.on(events.filterOpen, this.columnMenuFilter, this);
        this.parent.on(events.click, this.filterIconClickHandler, this);
        this.parent.on('persist-data-changed', this.initialEnd, this);
        this.parent.on(events.closeFilterDialog, this.clickHandler, this);
    }
    /**
     * @hidden
     */
    public removeEventListener(): void {
        EventHandler.remove(document, 'click', this.clickHandler);
        if (this.parent.isDestroyed) { return; }
        this.parent.off(events.uiUpdate, this.enableAfterRender);
        this.parent.off(events.filterComplete, this.onActionComplete);
        this.parent.off(events.inBoundModelChanged, this.onPropertyChanged);
        this.parent.off(events.keyPressed, this.keyUpHandler);
        this.parent.off(events.columnPositionChanged, this.columnPositionChanged);
        this.parent.off(events.headerRefreshed, this.render);
        this.parent.off(events.filterOpen, this.columnMenuFilter);
        this.parent.off(events.filterMenuClose, this.filterMenuClose);
        this.parent.off(events.click, this.filterIconClickHandler);
        this.parent.off(events.closeFilterDialog, this.clickHandler);
    }

    private filterMenuClose(args: { field: string }): void {
        this.fltrDlgDetails.isOpen = false;
    }

    /**
     * Filters the Grid row by fieldName, filterOperator, and filterValue.
     * @param  {string} fieldName - Defines the field name of the filter column.
     * @param  {string} filterOperator - Defines the operator to filter records.
     * @param  {string | number | Date | boolean} filterValue - Defines the value which is used to filter records.
     * @param  {string} predicate - Defines the relationship of one filter query with another by using AND or OR predicate.
     * @param  {boolean} matchCase - If match case is set to true, then the filter records
     * the exact match or <br> filters records that are case insensitive (uppercase and lowercase letters treated the same).
     * @param {boolean} ignoreAccent - If ignoreAccent set to true, then filter ignores the diacritic characters or accents while filtering.
     * @param  {string} actualFilterValue - Defines the actual filter value for the filter column.
     * @param  {string} actualOperator - Defines the actual filter operator for the filter column.
     * @return {void}
     */
    public filterByColumn(
        fieldName: string, filterOperator: string, filterValue: string | number | Date | boolean| number[]| string[]| Date[]| boolean[],
        predicate?: string, matchCase?: boolean,
        ignoreAccent?: boolean, actualFilterValue?: Object, actualOperator?: Object): void {
        let gObj: IGrid = this.parent;
        let filterCell: HTMLInputElement;
        this.column = gObj.grabColumnByFieldFromAllCols(fieldName);
        if (this.filterSettings.type === 'FilterBar' && this.filterSettings.showFilterBarOperator) {
            filterOperator = this.getOperatorName(fieldName);
        }
        if (!this.column) {
            return;
        }
        if (this.filterSettings.type === 'FilterBar') {
            filterCell = gObj.getHeaderContent().querySelector('[id=\'' + this.column.field + '_filterBarcell\']') as HTMLInputElement;
        }
        if (!isNullOrUndefined(this.column.allowFiltering) && !this.column.allowFiltering) {
            this.parent.log('action_disabled_column', {moduleName: this.getModuleName(), columnName: this.column.headerText});
            return;
        }
        if (isActionPrevent(gObj)) {
            gObj.notify(events.preventBatch, {
                instance: this, handler: this.filterByColumn, arg1: fieldName, arg2: filterOperator, arg3: filterValue, arg4: predicate,
                arg5: matchCase, arg6: ignoreAccent, arg7: actualFilterValue, arg8: actualOperator
            });
            return;
        }
        this.predicate = predicate ? predicate : Array.isArray(filterValue) ? 'or' : 'and';
        this.value = filterValue as string | number | Date | boolean;
        this.matchCase = matchCase || false;
        this.ignoreAccent = this.ignoreAccent = !isNullOrUndefined(ignoreAccent) ? ignoreAccent : this.parent.filterSettings.ignoreAccent;
        this.fieldName = fieldName;
        this.operator = filterOperator;
        filterValue = !isNullOrUndefined(filterValue) && filterValue.toString();
        if (this.column.type === 'number' || this.column.type === 'date') {
            this.matchCase = true;
        }
        gObj.getColumnHeaderByField(fieldName).setAttribute('aria-filtered', 'true');
        if (filterCell && this.filterSettings.type === 'FilterBar') {
            if (filterValue.length < 1 || (!this.filterByMethod &&
                this.checkForSkipInput(this.column, filterValue))) {
                this.filterStatusMsg = filterValue.length < 1 ? '' : this.l10n.getConstant('InvalidFilterMessage');
                this.updateFilterMsg();
                return;
            }
            if (filterCell.value !== filterValue) {
                filterCell.value = filterValue;
            }
        }
        if (!isNullOrUndefined(this.column.format)) {
            this.applyColumnFormat(filterValue);
            if (this.initialLoad && this.filterSettings.type === 'FilterBar') {
                filterCell.value = this.values[this.column.field];
            }
        } else {
            this.values[this.column.field] = filterValue; //this line should be above updateModel
        }
        let predObj: PredicateModel = {
            field: this.fieldName,
            predicate: predicate,
            matchCase: matchCase,
            ignoreAccent: ignoreAccent,
            operator: this.operator,
            value: this.value,
            type: this.column.type
        };
        let filterColumn: PredicateModel[] = this.parent.filterSettings.columns.filter((fColumn: PredicateModel) => {
            return (fColumn.field === this.fieldName);
        });
        if (filterColumn.length > 1 && !isNullOrUndefined(this.actualPredicate[this.fieldName])) {
            this.actualPredicate[this.fieldName].push(predObj);
        } else {
            this.actualPredicate[this.fieldName] = [predObj];
        }
        if (this.checkAlreadyColFiltered(this.column.field)) {
            return;
        }
        this.updateModel();
    }

    private applyColumnFormat(filterValue: string | number | Date | boolean): void {
        let getFlvalue: Date | number | string = (this.column.type === 'date' || this.column.type === 'datetime') ?
            new Date(filterValue as string) : parseFloat(filterValue as string);
        this.values[this.column.field] = this.setFormatForFlColumn(getFlvalue, this.column);
    }

    // To skip the second time request to server while applying initial filtering - EJ2-44361
    private skipUid(col: object[]): boolean {
        let flag: boolean = true;
        let colLen: number = Object.keys((col)).length;
        for (let i: number = 0; i < colLen ; i++) {
            let key: Object[] = Object.keys(col[i]);
            if (key.length === 1 && key[0] === 'uid') {
                flag = false; } }
        return flag;
    }

    private onPropertyChanged(e: NotifyArgs): void {
        if (e.module !== this.getModuleName()) {
            return;
        }
        for (let prop of Object.keys(e.properties)) {
            switch (prop) {
                case 'columns':
                    let col: string = 'columns';
                    let args: Object = {
                        currentFilterObject: this.currentFilterObject, currentFilteringColumn: this.column ?
                        this.column.field : undefined, action: 'filter', columns: this.filterSettings.columns,
                        requestType: 'filtering', type: events.actionBegin, cancel: false
                    };
                    if (this.contentRefresh && this.skipUid(e.properties[col])) {
                        this.parent.notify(events.modelChanged, args);
                        if ((<{ cancel?: boolean }>args).cancel) {
                            if (isNullOrUndefined(this.prevFilterObject)) {
                                this.filterSettings.columns.splice(this.filterSettings.columns.length - 1, 1);
                            } else {
                                this.filterSettings.columns[this.filterObjIndex] = this.prevFilterObject;
                            }
                            return;
                        }
                        this.addFilteredClass(args.currentFilteringColumn);
                        this.refreshFilterSettings();
                        this.updateFilterMsg();
                        this.updateFilter();
                    }
                    break;
                case 'showFilterBarStatus':
                    if (e.properties[prop]) {
                        this.updateFilterMsg();
                    } else if (this.parent.allowPaging) {
                        this.parent.updateExternalMessage('');
                    }
                    break;
                case 'showFilterBarOperator':
                case 'type':
                    this.parent.refreshHeader();
                    this.refreshFilterSettings();
                    break;

            }
        }
    }

    private refreshFilterSettings(): void {
        if (this.filterSettings.type === 'FilterBar') {
            for (let i: number = 0; i < this.filterSettings.columns.length; i++) {
                this.column = this.parent.grabColumnByUidFromAllCols(this.filterSettings.columns[i].uid);
                let filterValue: string | number | Date | boolean = this.filterSettings.columns[i].value;
                filterValue = !isNullOrUndefined(filterValue) && filterValue.toString();
                if (!isNullOrUndefined(this.column.format)) {
                    this.applyColumnFormat(filterValue);
                } else {
                    let key: string = this.filterSettings.columns[i].field;
                    this.values[key] = this.filterSettings.columns[i].value;
                }
                let filterElement: HTMLInputElement = this.getFilterBarElement(this.column.field);
                if (filterElement) {
                    if (this.cellText[this.filterSettings.columns[i].field] !== ''
                        && !isNullOrUndefined(this.cellText[this.filterSettings.columns[i].field])) {
                        filterElement.value = this.cellText[this.column.field];
                    } else {
                        filterElement.value = this.filterSettings.columns[i].value as string;
                    }
                }
            }
            if (this.filterSettings.columns.length === 0) {
                let col: Column[] = this.parent.getColumns();
                for (let i: number = 0; i < col.length; i++) {
                    let filterElement: HTMLInputElement = this.getFilterBarElement(col[i].field);
                    if (filterElement && filterElement.value !== '') {
                        filterElement.value = '';
                        delete this.values[col[i].field];
                    }
                }
            }
        }
    }

    private getFilterBarElement(col: string): HTMLInputElement {
        let selector: string = '[id=\'' + col + '_filterBarcell\']';
        let filterElement: HTMLInputElement;
        if (selector && !isNullOrUndefined(this.element)) {
            filterElement = (this.element.querySelector(selector) as HTMLInputElement);
        }
        return filterElement;
    }

    /**
     * @private
     */
    public refreshFilter(): void {
        this.refreshFilterSettings();
        this.updateFilterMsg();
    }

    /**
     * Clears all the filtered rows of the Grid.
     * @return {void}
     */
    public clearFiltering(fields?: string[]): void {
        let cols: PredicateModel[] = getActualPropFromColl(this.filterSettings.columns);
        if (!isNullOrUndefined(fields)) {
            this.refresh = false;
            fields.forEach((field: string) => { this.removeFilteredColsByField(field, false); });
            this.parent.setProperties({ filterSettings: { columns: this.filterSettings.columns } }, true);
            this.parent.renderModule.refresh();
            this.refresh = true;
            return;
        }
        if (isActionPrevent(this.parent)) {
            this.parent.notify(events.preventBatch, { instance: this, handler: this.clearFiltering });
            return;
        }
        for (let i: number = 0; i < cols.length; i++) {
            cols[i].uid = cols[i].uid || this.parent.getColumnByField(cols[i].field).uid;
        }
        let colUid: string[] = cols.map((f: Column) => f.uid);
        let filteredcols: string[] = colUid.filter((item: string, pos: number) => colUid.indexOf(item) === pos);
        this.refresh = false;
        for (let i: number = 0, len: number = filteredcols.length; i < len; i++) {
            this.removeFilteredColsByField(this.parent.getColumnByUid(filteredcols[i]).field, false);
        }
        if (isBlazor() && !this.parent.isJsComponent) {
            this.parent.setProperties({ filterSettings: { columns: this.filterSettings.columns } }, true);
        }
        this.refresh = true;
        if (filteredcols.length) {
            this.parent.renderModule.refresh();
        }
        if (this.parent.filterSettings.columns.length === 0 && this.parent.element.querySelector('.e-filtered')) {
            let fltrElement: Element[] = [].slice.call(this.parent.element.querySelectorAll('.e-filtered'));
            for (let i: number = 0, len: number = fltrElement.length; i < len; i++) {
                fltrElement[0].removeAttribute('aria-filtered');
                fltrElement[0].classList.remove('e-filtered');
            }
        }
        this.isRemove = true;
        this.filterStatusMsg = '';
        this.updateFilterMsg();
    }

    private checkAlreadyColFiltered(field: string): boolean {
        let columns: PredicateModel[] = this.filterSettings.columns;
        for (let col of columns) {
            if (col.field === field && col.value === this.value &&
                col.operator === this.operator && col.predicate === this.predicate) {
                return true;
            }
        }
        return false;
    }

    private columnMenuFilter(args: { col: Column, target: Element, isClose: boolean, id: string }): void {
        this.column = args.col;
        let ele: Element = closest(args.target, '#' + args.id);
        if (args.isClose && !ele) {
            this.filterModule.closeDialog();
        } else if (ele) {
            this.filterDialogOpen(this.column, args.target);
        }
    }

    private filterDialogOpen(col: Column, target: Element, left?: number, top?: number): void {
        let gObj: IGrid = this.parent;
        if (this.filterModule) {
            this.filterModule.closeDialog();
        }
        this.filterModule = new this.type[col.filter.type || this.parent.filterSettings.type]
            (this.parent, gObj.filterSettings, this.serviceLocator, this.customOperators, this);
        let dataSource: Object = col.filter.dataSource || gObj.dataSource && 'result' in gObj.dataSource ? gObj.dataSource :
            gObj.getDataModule().dataManager;
        this.filterModule.openDialog({
            type: col.type, field: col.field, displayName: col.headerText,
            dataSource: dataSource, format: col.format, height: 800, columns: gObj.getColumns(),
            filteredColumns: gObj.filterSettings.columns, target: target, dataManager: gObj.getDataModule().dataManager,
            formatFn: col.getFormatter(), ignoreAccent: gObj.filterSettings.ignoreAccent,
            parserFn: col.getParser(), query: gObj.query, template: col.getFilterItemTemplate(),
            hideSearchbox: isNullOrUndefined(col.filter.hideSearchbox) ? false : col.filter.hideSearchbox,
            handler: this.filterHandler.bind(this), localizedStrings: gObj.getLocaleConstants(),
            position: { X: left, Y: top }, column: col, foreignKeyValue: col.foreignKeyValue,
            actualPredicate: this.actualPredicate, localeObj: gObj.localeObj,
            isRemote: gObj.getDataModule().isRemote(), allowCaseSensitive: this.filterSettings.enableCaseSensitivity
        });
    }


    /**
     * Removes filtered column by field name.
     * @param  {string} field - Defines column field name to remove filter.
     * @param  {boolean} isClearFilterBar -  Specifies whether the filter bar value needs to be cleared.
     * @return {void}
     * @hidden
     */
    public removeFilteredColsByField(field: string, isClearFilterBar?: boolean): void {
        let fCell: HTMLInputElement;
        let cols: PredicateModel[] = this.filterSettings.columns;
        if (isActionPrevent(this.parent)) {
            let args: Object = { instance: this, handler: this.removeFilteredColsByField, arg1: field, arg2: isClearFilterBar };
            this.parent.notify(events.preventBatch, args);
            return;
        }
        let colUid: string[] = cols.map((f: Column) => f.uid);
        let filteredColsUid: string[] = colUid.filter((item: string, pos: number) => colUid.indexOf(item) === pos);
        for (let i: number = 0, len: number = filteredColsUid.length; i < len; i++) {
            cols[i].uid = cols[i].uid || this.parent.getColumnByField(cols[i].field).uid;
            let len: number = cols.length;
            let column: Column = this.parent.grabColumnByUidFromAllCols(filteredColsUid[i]);
            if (column.field === field || (column.field === column.foreignKeyValue && column.isForeignColumn())) {
                let currentPred: PredicateModel = this.filterSettings.columns.filter((e: PredicateModel) => {
                    return e.uid === column.uid; })[0];
                if (this.filterSettings.type === 'FilterBar' && !isClearFilterBar) {
                    let selector: string = '[id=\'' + column.field + '_filterBarcell\']';
                    fCell = this.parent.getHeaderContent().querySelector(selector) as HTMLInputElement;
                    if (fCell) {
                        fCell.value = '';
                        delete this.values[field];
                    }
                }
                while (len--) {
                    if (cols[len].uid === column.uid) {
                         cols.splice(len, 1);
                    }
                }
                let fltrElement: Element = this.parent.getColumnHeaderByField(column.field);
                fltrElement.removeAttribute('aria-filtered');
                if (this.filterSettings.type !== 'FilterBar') {
                    let iconClass: string = this.parent.showColumnMenu ? '.e-columnmenu' : '.e-icon-filter';
                    fltrElement.querySelector(iconClass).classList.remove('e-filtered');
                }
                this.isRemove = true;
                if (this.actualPredicate[field]) {
                    delete this.actualPredicate[field];
                }
                if (this.values[field]) {
                    delete this.values[field];
                }
                if (this.refresh) {
                    if (isBlazor() && !this.parent.isJsComponent) {
                        this.parent.setProperties({ filterSettings: { columns: this.filterSettings.columns } }, true);
                        this.parent.notify(events.modelChanged, {
                            requestType: 'filtering', type: events.actionBegin, currentFilterObject: {
                                field: column.field, operator: this.operator, value: this.value, predicate: this.predicate,
                                matchCase: this.matchCase, ignoreAccent: this.ignoreAccent, actualFilterValue: {}, actualOperator: {}
                            }, currentFilterColumn: column
                        });
                    } else {
                        this.parent.notify(events.modelChanged, {
                            requestType: 'filtering', type: events.actionBegin, currentFilterObject: currentPred,
                            currentFilterColumn: column, action: 'clearFilter'
                        });
                    }
                }
                break;
            }
        }
        this.updateFilterMsg();
    }

    /**
     * For internal use only - Get the module name.
     * @private
     */
    protected getModuleName(): string {
        return 'filter';
    }

    private keyUpHandlerImmediate(e: KeyboardEventArgs): void {
        if (e.keyCode !== 13) {
            this.keyUpHandler(e);
        }
    }

    private keyUpHandler(e: KeyboardEventArgs): void {
        let gObj: IGrid = this.parent;
        let target: HTMLInputElement = e.target as HTMLInputElement;

        if (target && matches(target, '.e-filterbar input')) {
            let closeHeaderEle: Element = closest(target, 'th.e-filterbarcell');
            this.column = gObj.getColumnByUid(closeHeaderEle.getAttribute('e-mappinguid'));
            if (!this.column) {
                return;
            }
            if (e.action === 'altDownArrow' && this.parent.filterSettings.showFilterBarOperator) {
                let dropDownListInput: Element = closest(target, 'span').querySelector('.e-filterbaroperator');
                (<EJ2Intance>dropDownListInput).ej2_instances[0].showPopup();
                (dropDownListInput as HTMLElement).focus();
            }
            if ((this.filterSettings.mode === 'Immediate' || (e.keyCode === 13 &&
                !(e.target as HTMLElement).classList.contains('e-filterbaroperator')))
                && e.keyCode !== 9 ) {
                this.value = target.value.trim();
                this.processFilter(e);
            }
        }
        if (e.action === 'altDownArrow' && this.filterSettings.type !== 'FilterBar') {
            let element: HTMLElement = gObj.focusModule.currentInfo.element;
            if (element && element.classList.contains('e-headercell')) {
                let column: Column = gObj.getColumnByUid(element.firstElementChild.getAttribute('e-mappinguid'));
                this.openMenuByField(column.field);
                this.parent.focusModule.clearIndicator();
            }
        }

        if (e.action === 'escape' && this.filterSettings.type === 'Menu' && this.filterModule) {
            this.filterModule.closeDialog();
            gObj.notify(events.restoreFocus, {});
        }
    }

    private updateCrossIcon(element: HTMLInputElement): void {
        if (element.value.length) {
            element.nextElementSibling.classList.remove('e-hide');
        }
    }

    private updateFilterMsg(): void {
        if (this.filterSettings.type === 'FilterBar') {
            let gObj: IGrid = this.parent;
            let getFormatFlValue: string;
            let columns: PredicateModel[] = this.filterSettings.columns;
            let formater: IValueFormatter = this.serviceLocator.getService<IValueFormatter>('valueFormatter');
            let column: Column;
            let value: Date | string | number | boolean;

            if (!this.filterSettings.showFilterBarStatus) {
                return;
            }
            if (columns.length > 0 && this.filterStatusMsg !== this.l10n.getConstant('InvalidFilterMessage')) {
                this.filterStatusMsg = '';
                for (let index: number = 0; index < columns.length; index++) {
                    column = gObj.grabColumnByUidFromAllCols(columns[index].uid) || gObj.grabColumnByFieldFromAllCols(columns[index].field);
                    if (index) {
                        this.filterStatusMsg += ' && ';
                    }
                    if (!isNullOrUndefined(column.format)) {
                        let flValue: Date | number = (column.type === 'date' || column.type === 'datetime') ?
                            this.valueFormatter.fromView(this.values[column.field], column.getParser(), column.type) :
                            this.values[column.field];
                        if (!(column.type === 'date' || column.type === 'datetime')) {
                            let formater: IValueFormatter = this.serviceLocator.getService<IValueFormatter>('valueFormatter');
                            getFormatFlValue = formater.toView(flValue, column.getParser()).toString();
                        } else {
                            getFormatFlValue = this.setFormatForFlColumn(flValue, column);
                        }
                        this.filterStatusMsg += column.headerText + ': ' + getFormatFlValue;
                    } else {
                        this.filterStatusMsg += column.headerText + ': ' + this.values[column.field];
                    }
                }
            }
            if (gObj.allowPaging) {
                gObj.updateExternalMessage(this.filterStatusMsg);
            }

            //TODO: virtual paging       
            this.filterStatusMsg = '';
        }
    }

    private setFormatForFlColumn(value: Date | number, column: Column): string {
        let formater: IValueFormatter = this.serviceLocator.getService<IValueFormatter>('valueFormatter');
        return formater.toView(value, column.getFormatter()).toString();
    }

    private checkForSkipInput(column: Column, value: string): boolean {
        let isSkip: boolean;
        if (column.type === 'number') {
            if (DataUtil.operatorSymbols[value] || this.skipNumberInput.indexOf(value) > -1) {
                isSkip = true;
            }
        } else if (column.type === 'string') {
            for (let val of value) {
                if (this.skipStringInput.indexOf(val) > -1) {
                    isSkip = true;
                }
            }
        }
        return isSkip;
    }

    private processFilter(e: KeyboardEvent): void {
        this.stopTimer();
        this.startTimer(e);
    }

    private startTimer(e: KeyboardEvent): void {
        this.timer = window.setInterval(
            () => { this.onTimerTick(); },
            e.keyCode === 13 ? 0 : this.filterSettings.immediateModeDelay);
    }

    private stopTimer(): void {
        window.clearInterval(this.timer);
    }

    private onTimerTick(): void {
        let selector: string = '[id=\'' + this.column.field + '_filterBarcell\']';
        let filterElement: HTMLInputElement = (this.element.querySelector(selector) as HTMLInputElement);
        if (!filterElement && this.parent.isFrozenGrid()) {
            filterElement = (this.parent.getHeaderContent().querySelector(selector) as HTMLInputElement);
        }
        let filterValue: string;
        this.cellText[this.column.field] = filterElement.value;
        this.stopTimer();
        if (!isNullOrUndefined(this.column.filterBarTemplate)) {
            let templateRead: Function = this.column.filterBarTemplate.read as Function;
            if (typeof templateRead === 'string') {
                templateRead = getValue(templateRead, window);
            }
            if (!isNullOrUndefined(templateRead)) {
                this.value = templateRead.call(this, filterElement);
            }
        } else {
            filterValue = JSON.parse(JSON.stringify(filterElement.value));
        }
        if (isNullOrUndefined(this.value) || this.value === '') {
            this.removeFilteredColsByField(this.column.field);
            return;
        }
        this.validateFilterValue(this.value as string);
        this.filterByMethod = false;
        this.filterByColumn(
            this.column.field, this.operator, this.value as string, this.predicate,
            this.filterSettings.enableCaseSensitivity, this.ignoreAccent);
        this.filterByMethod = true;
        filterElement.value = filterValue;
        this.updateFilterMsg();
    }

    private validateFilterValue(value: string): void {
        let gObj: IGrid = this.parent;
        let skipInput: string[];
        let index: number;
        this.matchCase = this.filterSettings.enableCaseSensitivity;
        switch (this.column.type) {
            case 'number':
                if (this.column.filter.operator) {
                    this.operator = this.column.filter.operator as string;
                } else {
                    this.operator = this.filterOperators.equal;
                }
                skipInput = ['>', '<', '=', '!'];
                for (let i: number = 0; i < value.length; i++) {
                    if (skipInput.indexOf(value[i]) > -1) {
                        index = i;
                        break;
                    }
                }
                this.getOperator(value.substring(index));
                if (index !== 0) {
                    this.value = value.substring(0, index);
                }
                if (this.value !== '' && value.length >= 1) {
                    this.value = this.valueFormatter.fromView(
                        this.value as string, this.column.getParser(), this.column.type);
                }
                if (isNaN(this.value as number)) {
                    this.filterStatusMsg = this.l10n.getConstant('InvalidFilterMessage');
                }
                break;
            case 'date':
            case 'datetime':
                this.operator = this.filterOperators.equal;
                if (this.value !== '' && !(this.value instanceof Date)) {
                    this.getOperator(value);
                    this.value = this.valueFormatter.fromView(
                        this.value as string, this.column.getParser(), this.column.type);
                    if (isNullOrUndefined(this.value)) {
                        this.filterStatusMsg = this.l10n.getConstant('InvalidFilterMessage');
                    }
                }
                break;
            case 'string':
            this.matchCase = false;
                if (value.charAt(0) === '*') {
                    this.value = (this.value as string).slice(1);
                    this.operator = this.filterOperators.startsWith;
                } else if (value.charAt(value.length - 1) === '%') {
                    this.value = (this.value as string).slice(0, -1);
                    this.operator = this.filterOperators.startsWith;
                } else if (value.charAt(0) === '%') {
                    this.value = (this.value as string).slice(1);
                    this.operator = this.filterOperators.endsWith;
                } else {
                    if (this.column.filter.operator) {
                        this.operator = this.column.filter.operator as string;
                    } else {
                        this.operator = this.filterOperators.startsWith;
                    }
                }
                break;
            case 'boolean':
                if (value.toLowerCase() === 'true' || value === '1') {
                    this.value = true;
                } else if (value.toLowerCase() === 'false' || value === '0') {
                    this.value = false;
                } else if (value.length) {
                    this.filterStatusMsg = this.l10n.getConstant('InvalidFilterMessage');
                }
                this.operator = this.filterOperators.equal;
                break;
            default:
                if (this.column.filter.operator) {
                    this.operator = this.column.filter.operator as string;
                } else {
                    this.operator = this.filterOperators.equal;
                }
            }
    }

    private getOperator(value: string): void {
        let singleOp: string = value.charAt(0);
        let multipleOp: string = value.slice(0, 2);
        let operators: Object = extend(
            { '=': this.filterOperators.equal, '!': this.filterOperators.notEqual }, DataUtil.operatorSymbols);
        if (operators.hasOwnProperty(singleOp) || operators.hasOwnProperty(multipleOp)) {
            this.operator = operators[singleOp];
            this.value = value.substring(1);
            if (!this.operator) {
                this.operator = operators[multipleOp];
                this.value = value.substring(2);
            }
        }
        if (this.operator === this.filterOperators.lessThan || this.operator === this.filterOperators.greaterThan) {
            if ((this.value as string).charAt(0) === '=') {
                this.operator = this.operator + 'orequal';
                this.value = (this.value as string).substring(1);
            }
        }
    }

    private columnPositionChanged(e: { fromIndex: number, toIndex: number }): void {
        if (this.parent.filterSettings.type !== 'FilterBar') {
            return;
        }
    }

    private getLocalizedCustomOperators(): void {
        let numOptr: Object[] = [
            { value: 'equal', text: this.l10n.getConstant('Equal') },
            { value: 'greaterthan', text: this.l10n.getConstant('GreaterThan') },
            { value: 'greaterthanorequal', text: this.l10n.getConstant('GreaterThanOrEqual') },
            { value: 'lessthan', text: this.l10n.getConstant('LessThan') },
            { value: 'lessthanorequal', text: this.l10n.getConstant('LessThanOrEqual') },
            { value: 'notequal', text: this.l10n.getConstant('NotEqual') }
        ];
        this.customOperators = {
            stringOperator: [
                { value: 'startswith', text: this.l10n.getConstant('StartsWith') },
                { value: 'endswith', text: this.l10n.getConstant('EndsWith') },
                { value: 'contains', text: this.l10n.getConstant('Contains') },
                { value: 'equal', text: this.l10n.getConstant('Equal') },
                { value: 'notequal', text: this.l10n.getConstant('NotEqual') }],

            numberOperator: numOptr,

            dateOperator: numOptr,

            datetimeOperator: numOptr,

            booleanOperator: [
                { value: 'equal', text: this.l10n.getConstant('Equal') },
                { value: 'notequal', text: this.l10n.getConstant('NotEqual') }
            ]
        };

    };

    /** @hidden */
    public openMenuByField(field: string): void {
        let gObj: IGrid = this.parent;
        let column: Column = gObj.getColumnByField(field);
        let header: Element = gObj.getColumnHeaderByField(field);
        let target: Element = header.querySelector('.e-filtermenudiv');

        if (!target) {
            return;
        }

        let gClient: ClientRect = gObj.element.getBoundingClientRect();
        let fClient: ClientRect = target.getBoundingClientRect();
        this.filterDialogOpen(column, target, fClient.right - gClient.left, fClient.bottom - gClient.top);
    }

    private filterIconClickHandler(e: MouseEvent): void {
        let target: Element = e.target as Element;
        if (target.classList.contains('e-filtermenudiv') && (this.parent.filterSettings.type === 'Menu' ||
            this.parent.filterSettings.type === 'CheckBox' || this.parent.filterSettings.type === 'Excel')) {
            let gObj: IGrid = this.parent;
            let col: Column = gObj.getColumnByUid(
                parentsUntil(target, 'e-headercell').firstElementChild.getAttribute('e-mappinguid'));
            this.column = col;
            if (this.fltrDlgDetails.field === col.field && this.fltrDlgDetails.isOpen) {
                return;
            }
            if (this.filterModule) {
                this.filterModule.closeDialog();
            }
            this.fltrDlgDetails = { field: col.field, isOpen: true };
            this.openMenuByField(col.field);
        }
    }


    private clickHandler(e: MouseEvent): void {
        if (this.filterSettings.type === 'FilterBar' && this.filterSettings.showFilterBarOperator) {
            if (parentsUntil(e.target as HTMLElement, 'e-filterbarcell') &&
                (e.target as HTMLElement).classList.contains('e-input-group-icon')) {
                (closest(e.target as HTMLElement, 'div').querySelector('.e-filterbaroperator') as HTMLElement).focus();
            }
            if ((e.target as HTMLElement).classList.contains('e-list-item')) {
                let inputId: string = document.querySelector('.e-popup-open').getAttribute('id').replace('_popup', '');
                if (inputId.indexOf('grid-column') !== -1) {
                    (closest(document.getElementById(inputId), 'div').querySelector('.e-filtertext') as HTMLElement).focus();
                }
            }
        }
        if (this.filterSettings.mode === 'Immediate' || this.parent.filterSettings.type === 'Menu' ||
            this.parent.filterSettings.type === 'CheckBox' || this.parent.filterSettings.type === 'Excel') {
            let gObj: IGrid = this.parent;
            let target: Element = e.target as Element;
            let datepickerEle: boolean = target.classList.contains('e-day'); // due to datepicker popup cause
            let dialog: Element = parentsUntil(this.parent.element, 'e-dialog');
            let hasDialog: boolean = false;
            let popupEle: Element = parentsUntil(target, 'e-popup');
            let hasDialogClosed: Element = this.parent.element.querySelector('.e-filter-popup');
            if (dialog && popupEle) {
                hasDialog = dialog.id === popupEle.id;
            }
            if ((hasDialogClosed && (parentsUntil(target, 'e-excel-ascending') ||
                parentsUntil(target, 'e-excel-descending')))) {
                this.filterModule.closeDialog(target);
            }
            if (parentsUntil(target, 'e-filter-popup') || target.classList.contains('e-filtermenudiv')) {
                return;
            } else if (this.filterModule && (!parentsUntil(target, 'e-popup-wrapper')
                && (!closest(target, '.e-filter-item.e-menu-item'))) && !datepickerEle) {
                if ((hasDialog && (!parentsUntil(target, 'e-filter-popup'))
                    && (!parentsUntil(target, 'e-popup-flmenu'))) || (!popupEle && hasDialogClosed)) {
                    this.filterModule.isresetFocus = parentsUntil(target, 'e-grid') &&
                    parentsUntil(target, 'e-grid').id === this.parent.element.id;
                    this.filterModule.closeDialog(target);
                }
            }
            if (this.filterSettings.mode === 'Immediate' && target.classList.contains('e-clear-icon')) {
                let targetText: HTMLInputElement = target.previousElementSibling as HTMLInputElement;
                this.removeFilteredColsByField(targetText.id.slice(0, - 14)); //Length of _filterBarcell = 14
            }
        }
    }


    private filterHandler(args: {
        action: string, filterCollection: PredicateModel[], field: string, ejpredicate: Predicate,
        column: Column, actualPredicate: PredicateModel[], requestType: string
    }): void {
        let filterIconElement: Element;
        this.actualPredicate[args.field] = args.actualPredicate;
        let dataManager: DataManager = new DataManager(this.filterSettings.columns as JSON[]);
        let query: Query = new Query().where('field', this.filterOperators.equal, args.field);
        let result: { field: string }[] = dataManager.executeLocal(query) as { field: string }[];
        for (let i: number = 0; i < result.length; i++) {
            let index: number = -1;
            for (let j: number = 0; j < this.filterSettings.columns.length; j++) {
                if (result[i].field === this.filterSettings.columns[j].field) {
                    index = j;
                    break;
                }
            }
            if (index !== -1) {
                this.filterSettings.columns.splice(index, 1);
            }
        }
        if (args.action === 'clear-filter' && isBlazor() && !this.parent.isJsComponent) {
            this.parent.setProperties({ filterSettings: { columns: this.filterSettings.columns } }, true);
        }
        if (this.values[args.field]) {
            delete this.values[args.field];
        }
        let iconClass: string = this.parent.showColumnMenu ? '.e-columnmenu' : '.e-icon-filter';
        filterIconElement = this.parent.getColumnHeaderByField(args.field).querySelector(iconClass);
        if (args.action === 'filtering') {
            this.filterSettings.columns = this.filterSettings.columns.concat(args.filterCollection);
            if (this.filterSettings.columns.length && filterIconElement) {
                filterIconElement.classList.add('e-filtered');
            }
        } else {
            if (filterIconElement) {
                filterIconElement.classList.remove('e-filtered');
            }
            args.requestType = 'filtering';
            this.parent.renderModule.refresh(args as object); //hot-fix onpropertychanged not working for object { array }           
        }
        this.parent.dataBind();
    }

    private updateFilter(): void {
        let cols: PredicateModel[] = this.filterSettings.columns;
        this.actualPredicate = {};
        for (let i: number = 0; i < cols.length; i++) {
            this.column = this.parent.getColumnByField(cols[i].field) ||
                getColumnByForeignKeyValue(cols[i].field, this.parent.getForeignKeyColumns());
            let fieldName: string = cols[i].field;
            if (!this.parent.getColumnByField(cols[i].field)) {
                fieldName = getColumnByForeignKeyValue(cols[i].field, this.parent.getForeignKeyColumns()).field;
            }
            /* tslint:disable-next-line:max-line-length */
            this.refreshFilterIcon(fieldName, cols[i].operator, cols[i].value, cols[i].type, cols[i].predicate, cols[i].matchCase, cols[i].ignoreAccent, cols[i].uid);
        }
    }

    /* tslint:disable-next-line:max-line-length */
    private refreshFilterIcon(fieldName: string, operator: string, value: string | number | Date | boolean, type?: string, predicate?: string, matchCase?: boolean, ignoreAccent?: boolean, uid?: string): void {
        let obj: Object;
        obj = {
            field: fieldName,
            predicate: predicate,
            matchCase: matchCase,
            ignoreAccent: ignoreAccent,
            operator: operator,
            value: value,
            type: type
            };
        this.actualPredicate[fieldName] ? this.actualPredicate[fieldName].push(obj) : this.actualPredicate[fieldName] = [obj];
        let field: string = uid ? this.parent.grabColumnByUidFromAllCols(uid).field : fieldName;
        this.addFilteredClass(field);
    }

    private addFilteredClass(fieldName: string): void {
        let filterIconElement: Element;
        if (this.parent.showColumnMenu) {
            filterIconElement = this.parent.getColumnHeaderByField(fieldName).querySelector('.e-columnmenu');
        } else if (this.parent.getColumnByField(fieldName)) {
            filterIconElement = this.parent.getColumnHeaderByField(fieldName).querySelector('.e-icon-filter');
        }
        if (filterIconElement) {
            filterIconElement.classList.add('e-filtered');
        }
    }

    /**
     * @hidden
     */
    public getFilterUIInfo(): FilterUI {
        return this.filterModule ? this.filterModule.getFilterUIInfo() : {};
    }

    /**
     * @hidden
     */
    private getOperatorName(field: string): string {
        return (<EJ2Intance>document.getElementById(this.parent.getColumnByField(field).uid)).ej2_instances[0].value;
    }
}
