import { Gantt } from './gantt';
import { TreeGrid, ColumnModel } from '@syncfusion/ej2-treegrid';
import { createElement, isNullOrUndefined, getValue, extend, EventHandler, deleteObject, setValue, isBlazor } from '@syncfusion/ej2-base';
import { FilterEventArgs, SortEventArgs, FailureEventArgs, IEditCell, EJ2Intance, IFilterMUI } from '@syncfusion/ej2-grids';
import { DataManager, Deferred } from '@syncfusion/ej2-data';
import { TaskFieldsModel } from '../models/models';
import { ColumnModel as GanttColumnModel, Column as GanttColumn } from '../models/column';
import { ITaskData, IGanttData } from './interface';
import { QueryCellInfoEventArgs, HeaderCellInfoEventArgs, RowDataBoundEventArgs, Filter } from '@syncfusion/ej2-grids';
import { ColumnMenuOpenEventArgs, ColumnMenuClickEventArgs } from '@syncfusion/ej2-grids';
import { NumericTextBoxModel, TextBox } from '@syncfusion/ej2-inputs';
import { MultiSelect, CheckBoxSelection } from '@syncfusion/ej2-dropdowns';
import { DatePicker, DateTimePicker } from '@syncfusion/ej2-calendars';

/**
 * TreeGrid related code goes here
 */
export class GanttTreeGrid {
    private parent: Gantt;
    private treeGridElement: HTMLElement;
    public treeGridColumns: ColumnModel[];
    private currentEditRow: {};
    private previousScroll: { top: number, left: number } = { top: 0, left: 0 };

    constructor(parent: Gantt) {
        this.parent = parent;
        this.parent.treeGrid = new TreeGrid();
        this.parent.treeGrid.allowSelection = false;
        this.treeGridColumns = [];
        this.validateGanttColumns();
        this.addEventListener();
    }
    private addEventListener(): void {
        this.parent.on('renderPanels', this.createContainer, this);
        this.parent.on('chartScroll', this.updateScrollTop, this);
        this.parent.on('destroy', this.destroy, this);
    }
    private createContainer(): void {
        //let height: number = this.parent.ganttHeight - this.parent.toolbarModule.element.offsetHeight - 46;
        this.treeGridElement = createElement('div', {
            id: 'treeGrid' + this.parent.element.id, className: 'e-gantt-tree-grid',
            //  styles: 'height:' + height + 'px;'
        });
        let tempHeader: HTMLElement = createElement('div', { className: 'e-gantt-temp-header' });
        this.parent.treeGridPane.appendChild(this.treeGridElement);
        this.treeGridElement.appendChild(tempHeader);
        this.parent.treeGridPane.classList.add('e-temp-content');
    }
    /**
     * Method to initiate TreeGrid
     */
    public renderTreeGrid(): void {
        this.composeProperties();
        this.bindEvents();
        this.parent.treeGrid.appendTo(this.treeGridElement);
        this.wireEvents();
    }

    private composeProperties(): void {
        this.parent.treeGrid.showColumnMenu = this.parent.showColumnMenu;
        this.parent.treeGrid.columnMenuItems = this.parent.columnMenuItems;
        this.parent.treeGrid.childMapping = this.parent.taskFields.child;
        this.parent.treeGrid.treeColumnIndex = this.parent.treeColumnIndex;
        this.parent.treeGrid.columns = this.treeGridColumns;
        this.parent.treeGrid.dataSource = this.parent.flatData;
        this.parent.treeGrid.rowHeight = this.parent.rowHeight;
        this.parent.treeGrid.gridLines = this.parent.gridLines;
        this.parent.treeGrid.searchSettings = this.parent.searchSettings;
        let toolbarHeight: number = 0;
        if (!isNullOrUndefined(this.parent.toolbarModule) && !isNullOrUndefined(this.parent.toolbarModule.element)) {
            toolbarHeight = this.parent.toolbarModule.element.offsetHeight;
        }
        this.parent.treeGrid.height = this.parent.ganttHeight - toolbarHeight - 46;
    }
    private getContentDiv(): HTMLElement {
        return this.treeGridElement.querySelector('.e-content');
    }

    private getHeaderDiv(): HTMLElement {
        return this.treeGridElement.querySelector('.e-headercontent');
    }

    private getScrollbarWidth(): number {
        const outer: HTMLElement = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        outer.style.msOverflowStyle = 'scrollbar';
        const inner: HTMLElement = document.createElement('div');
        outer.appendChild(inner);
        this.parent.element.appendChild(outer);
        const scrollbarWidth: number = (outer.offsetWidth - inner.offsetWidth);
        outer.parentNode.removeChild(outer);
        return scrollbarWidth;
    }

    private ensureScrollBar(): void {
        let content: HTMLElement = this.getContentDiv();
        let headerDiv: HTMLElement = this.getHeaderDiv();
        let scrollWidth: number = this.getScrollbarWidth();
        let isMobile: boolean = /Android|Mac|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (scrollWidth !== 0) {
            content.style.cssText += 'width: calc(100% + ' + scrollWidth + 'px);';
        } else {
            content.classList.add('e-gantt-scroll-padding');
        }
        if (scrollWidth === 0 && isMobile) {
            headerDiv.style.cssText += 'width: calc(100% + 17px);';
        }
    }
    private bindEvents(): void {
        this.parent.treeGrid.dataBound = this.dataBound.bind(this);
        this.parent.treeGrid.collapsing = this.collapsing.bind(this);
        this.parent.treeGrid.collapsed = this.collapsed.bind(this);
        this.parent.treeGrid.expanding = this.expanding.bind(this);
        this.parent.treeGrid.expanded = this.expanded.bind(this);
        this.parent.treeGrid.actionBegin = this.actionBegin.bind(this);
        this.parent.treeGrid.actionComplete = this.treeActionComplete.bind(this);
        this.parent.treeGrid.created = this.created.bind(this);
        this.parent.treeGrid.actionFailure = this.actionFailure.bind(this);
        this.parent.treeGrid.queryCellInfo = this.queryCellInfo.bind(this);
        this.parent.treeGrid.headerCellInfo = this.headerCellInfo.bind(this);
        this.parent.treeGrid.rowDataBound = this.rowDataBound.bind(this);
        this.parent.treeGrid.columnMenuOpen = this.columnMenuOpen.bind(this);
        this.parent.treeGrid.columnMenuClick = this.columnMenuClick.bind(this);
    }

    private dataBound(args: object): void {
        this.ensureScrollBar();
        this.parent.treeDataBound(args);
    }
    private collapsing(args: object): void | Deferred {
        // Collapsing event
        let callBackPromise: Deferred = new Deferred();
        if (!this.parent.ganttChartModule.isExpandCollapseFromChart) {
            let collapsingArgs: object = this.createExpandCollapseArgs(args);
            if (isBlazor()) {
                this.parent.trigger('collapsing', collapsingArgs, (args: object) => {
                    callBackPromise.resolve(args);
                    if (!getValue('cancel', args)) {
                        this.parent.ganttChartModule.collapseGanttRow(collapsingArgs, true);
                    }
                });
                return callBackPromise;
            } else {
                this.parent.ganttChartModule.collapseGanttRow(collapsingArgs);
            }
            setValue('cancel', getValue('cancel', collapsingArgs), args);
        }
    }
    private expanding(args: object): void {
        // Expanding event
        if (!this.parent.ganttChartModule.isExpandCollapseFromChart) {
            let expandingArgs: object = this.createExpandCollapseArgs(args);
            this.parent.ganttChartModule.expandGanttRow(expandingArgs);
            setValue('cancel', getValue('cancel', expandingArgs), args);
        }
    }
    private collapsed(args: object): void {
        if (!this.parent.ganttChartModule.isExpandCollapseFromChart) {
            this.updateExpandStatus(args);
            let collapsedArgs: object = this.createExpandCollapseArgs(args);
            this.parent.ganttChartModule.collapsedGanttRow(collapsedArgs);
        }
    }
    private expanded(args: object): void {
        if (!this.parent.ganttChartModule.isExpandCollapseFromChart) {
            this.updateExpandStatus(args);
            let expandedArgs: object = this.createExpandCollapseArgs(args);
            this.parent.ganttChartModule.expandedGanttRow(expandedArgs);
        }
    }
    private updateExpandStatus(args: object): void {
        if (getValue('data', args) && isBlazor()) {
            let record: IGanttData = this.parent.getTaskByUniqueID(getValue('data', args).uniqueID);
            record.expanded = getValue('data', args).expanded;
         }
    }
    private actionBegin(args: FilterEventArgs | SortEventArgs): void {
        this.parent.notify('actionBegin', args);
        this.parent.trigger('actionBegin', args);
    }
    private created(args: object): void {
        this.updateKeyConfigSettings();
    }
    private actionFailure(args: FailureEventArgs): void {
        this.parent.trigger('actionFailure', args);
    }
    private queryCellInfo = (args: QueryCellInfoEventArgs) => {
        this.parent.trigger('queryCellInfo', args);
    }
    private headerCellInfo = (args: HeaderCellInfoEventArgs) => {
        this.parent.trigger('headerCellInfo', args);
    }
    private rowDataBound = (args: RowDataBoundEventArgs) => {
        this.parent.trigger('rowDataBound', args);
    }
    private columnMenuOpen = (args: ColumnMenuOpenEventArgs) => {
        this.parent.notify('columnMenuOpen', args);
        this.parent.trigger('columnMenuOpen', args);
    }
    private columnMenuClick = (args: ColumnMenuClickEventArgs) => {
        this.parent.trigger('columnMenuClick', args);
    }
    private createExpandCollapseArgs(args: object): object {
        let record: IGanttData = getValue('data', args);
        let gridRow: Node = getValue('row', args);
        let chartRow: Node;
        if (isBlazor()) {
            /* tslint:disable-next-line */
            chartRow = this.parent.ganttChartModule.getChartRows()[this.parent.currentViewData.indexOf(this.parent.getTaskByUniqueID(record.uniqueID))];
        } else {
            chartRow = this.parent.ganttChartModule.getChartRows()[this.parent.currentViewData.indexOf(record)];
        }
        let eventArgs: object = { data: record, gridRow: gridRow, chartRow: chartRow, cancel: false };
        return eventArgs;
    }

    private treeActionComplete(args: object): void {
        let updatedArgs: object = extend({}, args, true);
        if (getValue('requestType', args) === 'sorting') {
            this.parent.notify('updateModel', {});
            deleteObject(updatedArgs, 'isFrozen');
        } else if (getValue('requestType', args) === 'filtering') {
            this.parent.notify('updateModel', {});
            let focussedElement: HTMLElement = <HTMLElement>this.parent.element.querySelector('.e-treegrid');
            focussedElement.focus();
        } else if (getValue('type', args) === 'save') {
            if (this.parent.editModule && this.parent.editModule.cellEditModule) {
                this.parent.editModule.cellEditModule.initiateCellEdit(args, this.currentEditRow);
                this.currentEditRow = {};
            }
        }
        if (getValue('requestType', args) === 'filterafteropen') {
            this.parent.notify('actionComplete', args);
        }
        if (getValue('requestType', args) === 'searching') {
            this.parent.notify('actionComplete', args);
        }
        if (!isNullOrUndefined(getValue('batchChanges', args)) && !isNullOrUndefined(this.parent.toolbarModule)) {
            this.parent.toolbarModule.refreshToolbarItems();
        }
        this.parent.trigger('actionComplete', updatedArgs);
    }

    private updateKeyConfigSettings(): void {
        delete this.parent.treeGrid.grid.keyboardModule.keyConfigs.delete;
        delete this.parent.treeGrid.grid.keyboardModule.keyConfigs.insert;
        delete this.parent.treeGrid.grid.keyboardModule.keyConfigs.upArrow;
        delete this.parent.treeGrid.grid.keyboardModule.keyConfigs.downArrow;
        delete this.parent.treeGrid.grid.keyboardModule.keyConfigs.ctrlHome;
        delete this.parent.treeGrid.grid.keyboardModule.keyConfigs.ctrlEnd;
        delete this.parent.treeGrid.grid.keyboardModule.keyConfigs.enter;
        delete this.parent.treeGrid.keyboardModule.keyConfigs.enter;
        delete this.parent.treeGrid.keyboardModule.keyConfigs.upArrow;
        delete this.parent.treeGrid.keyboardModule.keyConfigs.downArrow;
        delete this.parent.treeGrid.keyboardModule.keyConfigs.ctrlShiftUpArrow;
        delete this.parent.treeGrid.keyboardModule.keyConfigs.ctrlShiftDownArrow;
        delete this.parent.treeGrid.keyboardModule.keyConfigs.ctrlUpArrow;
        delete this.parent.treeGrid.keyboardModule.keyConfigs.ctrlDownArrow;
    }

    /**
     * Method to bind internal events on TreeGrid element
     */
    private wireEvents(): void {
        let content: HTMLElement = this.parent.treeGrid.element.querySelector('.e-content');
        if (content) {
            EventHandler.add(content, 'scroll', this.scrollHandler, this);
        }
        if (this.parent.isAdaptive) {
            EventHandler.add(this.parent.treeGridPane, 'click', this.treeGridClickHandler, this);
        }
    }
    private unWireEvents(): void {
        let content: HTMLElement = this.parent.treeGrid.element &&
            this.parent.treeGrid.element.querySelector('.e-content');
        if (content) {
            EventHandler.remove(content, 'scroll', this.scrollHandler);
        }
        if (this.parent.isAdaptive) {
            EventHandler.remove(this.parent.treeGridPane, 'click', this.treeGridClickHandler);
        }
    }
    private scrollHandler(e: WheelEvent): void {
        let content: HTMLElement = this.parent.treeGrid.element.querySelector('.e-content');
        if (content.scrollTop !== this.previousScroll.top) {
            this.parent.notify('grid-scroll', { top: content.scrollTop });
        }
        this.previousScroll.top = content.scrollTop;
    }
    /**
     * @private
     */
    public validateGanttColumns(): void {
        let ganttObj: Gantt = this.parent;
        let length: number = ganttObj.columns.length;
        let tasks: TaskFieldsModel = this.parent.taskFields;
        this.parent.columnMapping = {};
        this.parent.columnByField = {};
        this.parent.customColumns = [];
        let tasksMapping: string[] = ['id', 'name', 'startDate', 'endDate', 'duration', 'dependency',
            'progress', 'baselineStartDate', 'baselineEndDate', 'resourceInfo', 'notes'];
        for (let i: number = 0; i < length; i++) {
            let column: GanttColumnModel = {};
            if (typeof ganttObj.columns[i] === 'string') {
                column.field = ganttObj.columns[i] as string;
            } else {
                column = <GanttColumnModel>ganttObj.columns[i];
            }
            let columnName: string[] = [];
            if (tasksMapping.length > 0) {
                columnName = tasksMapping.filter((name: string) => {
                    return column.field === tasks[name];
                });
            }
            if (columnName.length === 0) {
                this.parent.customColumns.push(column.field);
                column.headerText = column.headerText ? column.headerText : column.field;
                column.width = column.width ? column.width : 150;
                column.editType = column.editType ? column.editType : 'stringedit';
                column.type = column.type ? column.type : 'string';
                this.bindTreeGridColumnProperties(column, true);
                continue;
            } else {
                let index: number = tasksMapping.indexOf(columnName[0]);
                tasksMapping.splice(index, 1);
                this.createTreeGridColumn(column, true);
                this.parent.columnMapping[columnName[0]] = column.field;
            }
        }

        /** Create default columns with task settings property */
        for (let j: number = 0; j < tasksMapping.length; j++) {
            let column: GanttColumnModel = {};
            if (!isNullOrUndefined(tasks[tasksMapping[j]])) {
                column.field = tasks[tasksMapping[j]];
                this.createTreeGridColumn(column, length === 0);
                this.parent.columnMapping[tasksMapping[j]] = column.field;
            }
        }
    }

    /**
     * 
     * @param column 
     * @param isDefined 
     */
    private createTreeGridColumn(column: GanttColumnModel, isDefined?: boolean): void {
        let taskSettings: TaskFieldsModel = this.parent.taskFields;
        if (taskSettings.id !== column.field) {
            column.clipMode = column.clipMode ? column.clipMode : 'EllipsisWithTooltip';
        }
        if (taskSettings.id === column.field) {
            /** Id column */
            this.composeIDColumn(column);
        } else if (taskSettings.name === column.field) {
            /** Name column */
            column.headerText = column.headerText ? column.headerText : this.parent.localeObj.getConstant('name');
            column.width = column.width ? column.width : 150;
            column.editType = column.editType ? column.editType : 'stringedit';
            column.type = column.type ? column.type : 'string';
        } else if (taskSettings.startDate === column.field) {
            /** Name column */
            column.headerText = column.headerText ? column.headerText : this.parent.localeObj.getConstant('startDate');
            column.format = column.format ? column.format : { type: 'date', format: this.parent.dateFormat };
            column.editType = column.editType ? column.editType :
                this.parent.dateFormat.toLowerCase().indexOf('hh') !== -1 ? 'datetimepickeredit' : 'datepickeredit';
            column.width = column.width ? column.width : 150;
            this.initiateFiltering(column);
        } else if (taskSettings.endDate === column.field) {
            column.headerText = column.headerText ? column.headerText : this.parent.localeObj.getConstant('endDate');
            column.format = column.format ? column.format : { type: 'date', format: this.parent.dateFormat };
            column.editType = column.editType ? column.editType :
                this.parent.dateFormat.toLowerCase().indexOf('hh') !== -1 ? 'datetimepickeredit' : 'datepickeredit';
            this.initiateFiltering(column);
            column.width = column.width ? column.width : 150;
        } else if (taskSettings.duration === column.field) {
            column.width = column.width ? column.width : 150;
            column.headerText = column.headerText ? column.headerText : this.parent.localeObj.getConstant('duration');
            column.valueAccessor = column.valueAccessor ? column.valueAccessor : this.durationValueAccessor.bind(this);
            column.editType = column.editType ? column.editType : 'stringedit';
            column.type = 'string';
            this.initiateFiltering(column);
        } else if (taskSettings.progress === column.field) {
            this.composeProgressColumn(column);
        } else if (taskSettings.dependency === column.field) {
            column.headerText = column.headerText ? column.headerText : this.parent.localeObj.getConstant('dependency');
            column.width = column.width ? column.width : 150;
            column.editType = column.editType ? column.editType : 'stringedit';
            column.type = 'string';
            column.allowFiltering = column.allowFiltering === false ? false : true;
        } else if (taskSettings.resourceInfo === column.field) {
            this.composeResourceColumn(column);
        } else if (taskSettings.notes === column.field) {
            column.headerText = column.headerText ? column.headerText : this.parent.localeObj.getConstant('notes');
            column.width = column.width ? column.width : 150;
            column.editType = column.editType ? column.editType : 'stringedit';
            if (!this.parent.showInlineNotes) {
                if (!column.template) {
                    column.template = '<div class="e-ganttnotes-info">' +
                        '<span class="e-icons e-notes-info"></span></div>';
                }
            } else {
                column.disableHtmlEncode = true;
            }
        } else if (taskSettings.baselineStartDate === column.field) {
            column.width = column.width ? column.width : 150;
            column.headerText = column.headerText ? column.headerText : this.parent.localeObj.getConstant('baselineStartDate');
            column.format = column.format ? column.format : { type: 'date', format: this.parent.dateFormat };
            column.editType = column.editType ? column.editType :
                this.parent.dateFormat.toLowerCase().indexOf('hh') !== -1 ? 'datetimepickeredit' : 'datepickeredit';
            this.initiateFiltering(column);
        } else if (taskSettings.baselineEndDate === column.field) {
            column.headerText = column.headerText ? column.headerText : this.parent.localeObj.getConstant('baselineEndDate');
            column.width = column.width ? column.width : 150;
            column.format = column.format ? column.format : { type: 'date', format: this.parent.dateFormat };
            column.editType = column.editType ? column.editType :
                this.parent.dateFormat.toLowerCase().indexOf('hh') !== -1 ? 'datetimepickeredit' : 'datepickeredit';
            this.initiateFiltering(column);
        }
        this.bindTreeGridColumnProperties(column, isDefined);
    }
    /**
     * Compose Resource columns
     * @param column 
     */
    private composeResourceColumn(column: GanttColumnModel): void {
        column.headerText = column.headerText ? column.headerText : this.parent.localeObj.getConstant('resourceName');
        column.width = column.width ? column.width : 150;
        column.type = 'string';
        column.valueAccessor = column.valueAccessor ? column.valueAccessor : this.resourceValueAccessor.bind(this);
        if (this.parent.editSettings.allowEditing && isNullOrUndefined(column.edit) && this.parent.editSettings.mode === 'Auto') {
            column.editType = 'dropdownedit';
            column.edit = this.getResourceEditor();
        }
        column.allowFiltering = column.allowFiltering === false ? false : true;
    }
    private getResourceIds(data: IGanttData): object {
        return getValue(this.parent.taskFields.resourceInfo, data.taskData);
    }
    private getResourceEditor(): IEditCell {
        let editObject: IEditCell = {};
        let editor: MultiSelect;
        MultiSelect.Inject(CheckBoxSelection);
        editObject.write = (args: { rowData: Object, element: Element, column: GanttColumn, row: HTMLElement, requestType: string }) => {
            this.currentEditRow = {};
            editor = new MultiSelect({
                dataSource: new DataManager(this.parent.resources),
                fields: { text: this.parent.resourceNameMapping, value: this.parent.resourceIDMapping },
                mode: 'CheckBox',
                showDropDownIcon: true,
                popupHeight: '350px',
                delimiterChar: ',',
                value: this.getResourceIds(args.rowData as IGanttData) as number[]
            });
            editor.appendTo(args.element as HTMLElement);
        };
        editObject.read = (element: HTMLElement): string => {
            let value: Object[] = (<EJ2Intance>element).ej2_instances[0].value;
            let resourcesName: string[] = [];
            if (isNullOrUndefined(value)) {
                value = [];
            }
            for (let i: number = 0; i < value.length; i++) {
                for (let j: number = 0; j < this.parent.resources.length; j++) {
                    if (this.parent.resources[j][this.parent.resourceIDMapping] === value[i]) {
                        resourcesName.push(this.parent.resources[j][this.parent.resourceNameMapping]);
                        break;
                    }
                }
            }
            this.currentEditRow[this.parent.taskFields.resourceInfo] = value;
            return resourcesName.join(',');
        };
        editObject.destroy = () => {
            if (editor) {
                editor.destroy();
            }
        };
        return editObject;
    }
    /**
     * Create Id column
     * @param column 
     */
    private composeIDColumn(column: GanttColumnModel): void {
        column.isPrimaryKey = isNullOrUndefined(column.isPrimaryKey) ? true : column.isPrimaryKey;
        column.headerText = column.headerText ? column.headerText : this.parent.localeObj.getConstant('id');
        column.width = column.width ? column.width : 100;
        column.allowEditing = false;
        column.editType = column.editType ? column.editType : 'numericedit';
        let editParam: NumericTextBoxModel = {
            min: 0,
            decimals: 0,
            validateDecimalOnType: true,
            format: 'n0',
            showSpinButton: false
        };
        if (isNullOrUndefined(column.edit)) {
            column.edit = {};
            column.edit.params = {};
        } else if (isNullOrUndefined(column.edit.params)) {
            column.edit.params = {};
        }
        extend(column.edit.params, editParam);
    }

    /**
     * Create progress column
     * @param column 
     */
    private composeProgressColumn(column: GanttColumnModel): void {
        column.headerText = column.headerText ? column.headerText : this.parent.localeObj.getConstant('progress');
        column.width = column.width ? column.width : 150;
        column.editType = column.editType ? column.editType : 'numericedit';
        let editParam: NumericTextBoxModel = {
            min: 0,
            max: 100,
            decimals: 0,
            validateDecimalOnType: true,
            format: 'n0'
        };
        if (isNullOrUndefined(column.edit)) {
            column.edit = {};
            column.edit.params = {};
        } else if (isNullOrUndefined(column.edit.params)) {
            column.edit.params = {};
        }
        extend(column.edit.params, editParam);
    }

    private initiateFiltering(column: GanttColumnModel): void {
        column.allowFiltering = column.allowFiltering === false ? false : true;
        if (column.allowFiltering && this.parent.filterSettings.type === 'Menu' && !column.filter) {
            column.filter = { ui: this.getCustomFilterUi(column) };
        }
    }

    /**
     * To get filter menu UI
     * @param column 
     */
    private getCustomFilterUi(column: GanttColumnModel): IFilterMUI {
        let settings: TaskFieldsModel = this.parent.taskFields;
        let filterUI: IFilterMUI = {};
        if (column.editType === 'datepickeredit' && (column.field === settings.startDate || column.field === settings.endDate
            || column.field === settings.baselineStartDate || column.field === settings.baselineEndDate)) {
            filterUI = this.getDatePickerFilter(column.field);
        } else if (column.editType === 'datetimepickeredit' && (column.field === settings.startDate || column.field === settings.endDate
            || column.field === settings.baselineStartDate || column.field === settings.baselineEndDate)) {
            filterUI = this.getDateTimePickerFilter();
        } else if (column.field === settings.duration && column.editType === 'stringedit') {
            filterUI = this.getDurationFilter();
        }
        return filterUI;
    }

    private getDatePickerFilter(columnName: string): IFilterMUI {
        let parent: Gantt = this.parent;
        let timeValue: number = (columnName === parent.taskFields.startDate) || (columnName === parent.taskFields.baselineStartDate)
            ? parent.defaultStartTime : parent.defaultEndTime;
        let dropDateInstance: DatePicker;
        let filterDateUI: IFilterMUI = {
            create: (args: { target: Element, column: Object }) => {
                let flValInput: HTMLElement = createElement('input', { className: 'flm-input' });
                args.target.appendChild(flValInput);
                dropDateInstance = new DatePicker({ placeholder: this.parent.localeObj.getConstant('enterValue') });
                dropDateInstance.appendTo(flValInput);
            },
            write: (args: {
                filteredValue: Date
            }) => {
                dropDateInstance.value = args.filteredValue;
            },
            read: (args: { target: Element, column: ColumnModel, operator: string, fltrObj: Filter }) => {
                if (dropDateInstance.value) {
                    dropDateInstance.value.setSeconds(timeValue);
                }
                args.fltrObj.filterByColumn(args.column.field, args.operator, dropDateInstance.value);
            }
        };
        return filterDateUI;
    }

    private getDateTimePickerFilter(): IFilterMUI {
        let dropInstance: DateTimePicker;
        let filterDateTimeUI: IFilterMUI = {
            create: (args: { target: Element, column: Object }) => {
                let flValInput: HTMLElement = createElement('input', { className: 'flm-input' });
                args.target.appendChild(flValInput);
                dropInstance = new DateTimePicker({ placeholder: this.parent.localeObj.getConstant('enterValue') });
                dropInstance.appendTo(flValInput);
            },
            write: (args: {
                filteredValue: Date
            }) => {
                dropInstance.value = args.filteredValue;
            },
            read: (args: { target: Element, column: ColumnModel, operator: string, fltrObj: Filter }) => {
                args.fltrObj.filterByColumn(args.column.field, args.operator, dropInstance.value);
            }
        };
        return filterDateTimeUI;
    }

    private getDurationFilter(): IFilterMUI {
        let parent: Gantt = this.parent;
        let textBoxInstance: TextBox;
        let textValue: string = '';
        let filterDurationUI: IFilterMUI = {
            create: (args: { target: Element, column: Object }) => {
                let flValInput: HTMLElement = createElement('input', { className: 'e-input' });
                flValInput.setAttribute('placeholder', this.parent.localeObj.getConstant('enterValue'));
                args.target.appendChild(flValInput);
                textBoxInstance = new TextBox();
                textBoxInstance.appendTo(flValInput);
            },
            write: (args: {
                filteredValue: string
            }) => {
                textBoxInstance.value = args.filteredValue ? textValue : '';
            },
            read: (args: { element: HTMLInputElement, column: ColumnModel, operator: string, fltrObj: Filter }) => {
                let durationObj: object = this.parent.dataOperation.getDurationValue(textBoxInstance.value);
                let intVal: number = getValue('duration', durationObj);
                let unit: string = getValue('durationUnit', durationObj);
                if (intVal >= 0) {
                    let dayVal: number;
                    if (unit === 'minute') {
                        dayVal = (intVal * 60) / parent.secondsPerDay;
                    } else if (unit === 'hour') {
                        dayVal = (intVal * 60 * 60) / parent.secondsPerDay;
                    } else {
                        //Consider it as day unit
                        dayVal = intVal;
                        unit = 'day';
                    }
                    args.fltrObj.filterByColumn(args.column.field, args.operator, dayVal);
                    textValue = this.parent.dataOperation.getDurationString(intVal, unit);
                } else {
                    args.fltrObj.filterByColumn(args.column.field, args.operator, null);
                    textValue = null;
                }
            }
        };
        return filterDurationUI;
    }

    /**
     * 
     */
    private bindTreeGridColumnProperties(newGanttColumn: GanttColumnModel, isDefined?: boolean): void {
        let treeGridColumn: ColumnModel = {}; let ganttColumn: GanttColumnModel = {};
        for (let prop of Object.keys(newGanttColumn)) {
            treeGridColumn[prop] = ganttColumn[prop] = newGanttColumn[prop];
        }
        this.parent.columnByField[ganttColumn.field] = ganttColumn;
        this.parent.ganttColumns.push(new GanttColumn(ganttColumn));
        if (isDefined) {
            this.treeGridColumns.push(treeGridColumn);
        }
    }
    private durationValueAccessor(field: string, data: IGanttData, column: GanttColumnModel): string {
        let ganttProp: ITaskData = data.ganttProperties;
        if (!isNullOrUndefined(ganttProp)) {
            return this.parent.dataOperation.getDurationString(ganttProp.duration, ganttProp.durationUnit);
        }
        return '';
    }

    private resourceValueAccessor(field: string, data: IGanttData, column: GanttColumnModel): string {
        let ganttProp: ITaskData = data.ganttProperties;
        if (!isNullOrUndefined(ganttProp)) {
            return ganttProp.resourceNames;
        }
        return '';
    }

    private updateScrollTop(args: object): void {
        this.treeGridElement.querySelector('.e-content').scrollTop = getValue('top', args);
        this.previousScroll.top = this.treeGridElement.querySelector('.e-content').scrollTop;
    }
    private treeGridClickHandler(e: PointerEvent): void {
        this.parent.notify('treeGridClick', e);
    }
    private removeEventListener(): void {
        this.parent.off('renderPanels', this.createContainer);
        this.parent.off('chartScroll', this.updateScrollTop);
        this.parent.off('destroy', this.destroy);
    }
    private destroy(): void {
        this.removeEventListener();
        this.unWireEvents();
        if (this.parent.treeGrid.element) {
            this.parent.treeGrid.destroy();
        }
    }
}
