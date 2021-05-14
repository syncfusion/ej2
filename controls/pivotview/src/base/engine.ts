import { extend, Internationalization, NumberFormatOptions, DateFormatOptions } from '@syncfusion/ej2-base';
import { isNullOrUndefined, L10n, isBlazor } from '@syncfusion/ej2-base';
import { DataManager, Query } from '@syncfusion/ej2-data';
import { PivotUtil } from './util';
import { Sorting, SummaryTypes, FilterType, LabelOperators, ValueOperators, Operators, DateOperators, Condition } from './types';
import { DateGroup, GroupType, ProviderType, DataSourceType } from './types';
import { HeaderCollection, AggregateEventArgs } from '../common';

/**
 * PivotEngine is used to manipulate the relational or Multi-Dimensional data as pivoting values.
 */

/** @hidden */
export class PivotEngine {

    /** @hidden */
    public globalize: Internationalization;
    /** @hidden */
    public fieldList: IFieldListOptions;
    /** @hidden */
    public pivotValues: IPivotValues;
    /** @hidden */
    public aggregatedValueMatrix: IMatrix2D = [];
    /** @hidden */
    public headerContent: IGridValues;
    /** @hidden */
    public valueContent: IGridValues = [];
    /** @hidden */
    public fields: string[];
    /** @hidden */
    public rows: IFieldOptions[];
    /** @hidden */
    public columns: IFieldOptions[];
    /** @hidden */
    public values: IFieldOptions[];
    /** @hidden */
    public filters: IFieldOptions[];
    /** @hidden */
    public excludeFields: string[];
    /** @hidden */
    public groups: IGroupSettings[];
    /** @hidden */
    public isMutiMeasures: boolean;
    /** @hidden */
    public alwaysShowValueHeader: boolean;
    /** @hidden */
    public drilledMembers: IDrillOptions[];
    /** @hidden */
    public formats: IFormatSettings[];
    /** @hidden */
    public isExpandAll: boolean;
    /** @hidden */
    public enableSort: boolean;
    /** @hidden */
    public showSubTotals: boolean;
    /** @hidden */
    public showRowSubTotals: boolean;
    /** @hidden */
    public showColumnSubTotals: boolean;
    /** @hidden */
    public showGrandTotals: boolean;
    /** @hidden */
    public showRowGrandTotals: boolean;
    /** @hidden */
    public showHeaderWhenEmpty: boolean;
    /** @hidden */
    public showColumnGrandTotals: boolean;
    /** @hidden */
    public pageSettings: IPageSettings;
    /** @hidden */
    public filterMembers: number[];
    /** @hidden */
    public formatFields: { [key: string]: IFormatSettings } = {};
    /* eslint-disable  */
    /** @hidden */
    public dateFormatFunction: { [key: string]: { exactFormat: Function, fullFormat: Function } } = {};
    /** @hidden */
    public calculatedFieldSettings: ICalculatedFieldSettings[];
    /** @hidden */
    public calculatedFields: { [key: string]: ICalculatedFields } = {};
    /** @hidden */
    public calculatedFormulas: { [key: string]: Object } = {};
    /* eslint-enable  */
    /** @hidden */
    public valueSortSettings: IValueSortSettings;
    /** @hidden */
    public isEngineUpdated: boolean;
    /** @hidden */
    public savedFieldList: IFieldListOptions;
    /** @hidden */
    public valueAxis: number = 0;
    /** @hidden */
    public saveDataHeaders: { [key: string]: IAxisSet[] } = {};
    /** @hidden */
    public columnCount: number = 0;
    /** @hidden */
    public rowCount: number = 0;
    /** @hidden */
    public colFirstLvl: number = 0;
    /** @hidden */
    public rowFirstLvl: number = 0;
    /** @hidden */
    public rowStartPos: number = 0;
    /** @hidden */
    public colStartPos: number = 0;
    /** @hidden */
    public enableValueSorting: boolean = false;
    /** @hidden */
    public headerCollection: HeaderCollection = { rowHeaders: [], columnHeaders: [], rowHeadersCount: 0, columnHeadersCount: 0 };
    /** @hidden */
    public isValueFilterEnabled: boolean;
    /** @hidden */
    public isEmptyData: boolean;
    /** @hidden */
    public emptyCellTextContent: string;
    /** @hidden */
    public isHeaderAvail: boolean;
    /** @hidden */
    public isDrillThrough: boolean;
    /** @hidden */
    public rMembers: IAxisSet[] = [];
    /** @hidden */
    public cMembers: IAxisSet[] = [];
    /** @hidden */
    public groupingFields: { [key: string]: string } = {};
    private reportDataType: { [key: string]: string };
    private allowValueFilter: boolean;
    private isValueFiltered: boolean;
    private isValueFiltersAvail: boolean;
    private valueSortData: ValueSortData[];
    private valueFilteredData: IAxisSet[];
    private filterFramedHeaders: IAxisSet[];
    private valueMatrix: IMatrix2D = [];
    private indexMatrix: IMatrix2D = [];
    private memberCnt: number = -1;
    private pageInLimit: boolean = false;
    private endPos: number = 0;
    private removeCount: number = 0;
    private colHdrBufferCalculated: boolean = false;
    private colValuesLength: number = 1;
    private rowValuesLength: number = 1;
    private slicedHeaders: IAxisSet[] = [];
    private fieldFilterMem: IFilterObj = {};
    private filterPosObj: INumberIndex = {};
    private selectedHeaders: AggregateCollection = { selectedHeader: [], values: [] };
    private rowGrandTotal: IAxisSet = null;
    private columnGrandTotal: IAxisSet = null;
    private removeRowGrandTotal: boolean = false;
    private removeColumnGrandTotal: boolean = false;
    private isValueHasAdvancedAggregate: boolean = false;
    private rawIndexObject: INumberIndex = {};
    /* eslint-disable  */
    private isEditing: Boolean = false;
    /** @hidden */
    public data: IDataSet[] | string[][] = [];
    /** @hidden */
    public actualData: IDataSet[] | string[][] = [];
    /** @hidden */
    public groupRawIndex: { [key: number]: number[] } = {};
    /** @hidden */
    public fieldKeys: IDataSet = {};
    private allowDataCompression: boolean = false;
    private dataSourceSettings: IDataOptions = {};
    private frameHeaderObjectsCollection: boolean = false;
    private headerObjectsCollection: { [key: string]: IAxisSet[] } = {};
    private localeObj: L10n;
    private getValueCellInfo: Function;
    private fieldsType: IStringIndex;
    private columnKeys: { [key: string]: IFieldOptions } = {};
    private fieldDrillCollection: { [key: string]: string } = {};
    private fieldMapping: IFieldOptions[] = [];
    private customRegex: RegExp = /^(('[^']+'|''|[^*#@0,.])*)(\*.)?((([0#,]*[0,]*[0#]*)(\.[0#]*)?)|([#,]*@+#*))(E\+?0+)?(('[^']+'|''|[^*#@0,.E])*)$/;
    private formatRegex: RegExp = /(^[ncpae]{1})([0-1]?[0-9]|20)?$/i;
    private clonedReport: IDataOptions;
    public renderEngine(
        dataSource?: IDataOptions, customProperties?: ICustomProperties, fn?: Function): void {
        this.getValueCellInfo = fn;
        this.formatFields = {};
        this.dateFormatFunction = {};
        this.calculatedFields = {};
        this.calculatedFormulas = {};
        this.valueAxis = 0;
        this.saveDataHeaders = {};
        this.columnCount = 0;
        this.rowCount = 0;
        this.colFirstLvl = 0;
        this.rowFirstLvl = 0;
        this.rowStartPos = 0;
        this.colStartPos = 0;
        this.excludeFields = isNullOrUndefined(dataSource.excludeFields) ? [] : dataSource.excludeFields;
        this.enableValueSorting = false;
        this.headerCollection = { rowHeaders: [], columnHeaders: [], rowHeadersCount: 0, columnHeadersCount: 0 };
        this.valueMatrix = [];
        this.indexMatrix = [];
        this.aggregatedValueMatrix = [];
        this.rMembers = [];
        this.cMembers = [];
        this.memberCnt = -1;
        this.pageInLimit = false;
        this.endPos = 0;
        this.removeCount = 0;
        this.colHdrBufferCalculated = false;
        this.colValuesLength = 1;
        this.rowValuesLength = 1;
        this.slicedHeaders = [];
        this.fieldFilterMem = {};
        this.filterPosObj = {};
        this.selectedHeaders = { selectedHeader: [], values: [] };
        this.rowGrandTotal = null;
        this.columnGrandTotal = null;
        this.removeRowGrandTotal = false;
        this.removeColumnGrandTotal = false;
        this.isValueHasAdvancedAggregate = false;
        this.rawIndexObject = {};
        this.isEditing = false;
        let fields: IDataSet;
        this.globalize = new Internationalization();
        this.localeObj = customProperties ? customProperties.localeObj : undefined;
        this.fieldsType = customProperties ? customProperties.fieldsType : {};
        this.clonedReport = customProperties ? customProperties.clonedReport : {};
        this.enableSort = dataSource.enableSorting;
        this.alwaysShowValueHeader = dataSource.alwaysShowValueHeader;
        this.showHeaderWhenEmpty = isNullOrUndefined(dataSource.showHeaderWhenEmpty) ? true : dataSource.showHeaderWhenEmpty;
        this.showSubTotals = isNullOrUndefined(dataSource.showSubTotals) ? true : dataSource.showSubTotals;
        this.showRowSubTotals = isNullOrUndefined(dataSource.showRowSubTotals) ? true : dataSource.showRowSubTotals;
        this.showColumnSubTotals = isNullOrUndefined(dataSource.showColumnSubTotals) ? true : dataSource.showColumnSubTotals;
        this.showGrandTotals = isNullOrUndefined(dataSource.showGrandTotals) ? true : dataSource.showGrandTotals;
        this.showRowGrandTotals = isNullOrUndefined(dataSource.showRowGrandTotals) ? true : dataSource.showRowGrandTotals;
        this.showColumnGrandTotals = isNullOrUndefined(dataSource.showColumnGrandTotals) ? true : dataSource.showColumnGrandTotals;
        this.allowValueFilter = dataSource.allowValueFilter;
        this.isValueFilterEnabled = false;
        this.enableValueSorting = customProperties ? customProperties.enableValueSorting : false;
        this.isDrillThrough = customProperties ? (customProperties.isDrillThrough ? customProperties.isDrillThrough : false) : false;
        this.valueContent = [];
        this.dataSourceSettings = dataSource;
        if (!(dataSource.dataSource instanceof DataManager)) {
            this.data = (isBlazor() && !dataSource.dataSource && this.data && this.data.length > 0) ?
                this.data : dataSource.dataSource;
        }
        if (this.data && (this.data as IDataSet[])[0]) {
            if (!this.fieldList) {
                if (dataSource.type === 'CSV') {
                    this.fields = this.data.shift() as string[];
                } else {
                    this.fields = Object.keys((this.data as IDataSet[])[0]);
                }
                for (let i: number = 0; i < this.fields.length; i++) {
                    this.fieldKeys[this.fields[i]] = dataSource.type === 'CSV' ? i : this.fields[i];
                }
            }
            if (customProperties && customProperties.pageSettings && customProperties.pageSettings.allowDataCompression) {
                this.actualData = this.data;
                this.data = this.getGroupedRawData(dataSource);
            }
            this.rows = dataSource.rows ? dataSource.rows : [];
            this.columns = dataSource.columns ? dataSource.columns : [];
            this.filters = dataSource.filters ? dataSource.filters : [];
            this.values = dataSource.values ? dataSource.values : [];
            this.formats = dataSource.formatSettings ? dataSource.formatSettings : [];
            this.groups = dataSource.groupSettings ? dataSource.groupSettings : [];
            this.calculatedFieldSettings = dataSource.calculatedFieldSettings ? dataSource.calculatedFieldSettings : [];
            this.enableSort = dataSource.enableSorting === undefined ? true : dataSource.enableSorting;
            this.fieldMapping = dataSource.fieldMapping ? dataSource.fieldMapping : [];
            fields = this.getGroupData(this.data as IDataSet[]);
            for (let i: number = 0; i < this.fields.length; i++) {
                this.fieldKeys[this.fields[i]] = dataSource.type === 'CSV' ? i : this.fields[i];
            }
            this.validateFilters(dataSource);
            this.isExpandAll = (this.isValueFiltersAvail && dataSource.allowValueFilter) ? true : dataSource.expandAll;
            this.drilledMembers =
                dataSource.drilledMembers ? (this.isValueFiltersAvail && dataSource.allowValueFilter) ? [] : dataSource.drilledMembers : [];
            this.isMutiMeasures = this.values.length > 1 ? true : false;
            this.valueAxis = dataSource.valueAxis === 'row' ? 1 : 0;
            this.emptyCellTextContent = dataSource.emptyCellsTextContent ? dataSource.emptyCellsTextContent : '';
            this.rowValuesLength = this.valueAxis === 1 ? this.values.length : 1;
            this.colValuesLength = this.valueAxis === 0 ? this.values.length : 1;
            this.valueSortSettings = dataSource.valueSortSettings ||
                { sortOrder: 'None', headerDelimiter: '.', headerText: '', columnIndex: undefined } as IValueSortSettings;
            this.valueSortData = [];
            this.pageSettings = customProperties ? (customProperties.pageSettings ? customProperties.pageSettings : this.pageSettings)
                : undefined;
            this.allowDataCompression = this.pageSettings && this.pageSettings.allowDataCompression;
            this.savedFieldList = customProperties ? customProperties.savedFieldList : undefined;
            this.getFieldList(fields, this.enableSort, dataSource.allowValueFilter);
            this.removeIrrelevantFields(dataSource, Object.keys(this.fieldList));
            this.fillFieldMembers(this.data as IDataSet[], this.indexMatrix);
            this.updateSortSettings(dataSource.sortSettings, this.enableSort);
            this.valueMatrix = this.generateValueMatrix(this.data as IDataSet[]);
            this.filterMembers = [];
            let columnLength: number = this.columns.length - 1;
            this.columnKeys = {};
            while (columnLength > -1) {
                this.columnKeys[this.columns[columnLength].name] = this.columns[columnLength];
                columnLength--;
            }
            this.updateFilterMembers(dataSource);
            this.generateGridData(dataSource);
        }
    }

    private removeIrrelevantFields(dataSource: IDataOptions, fields: string[]): void {
        let report: { [key: number]: IFieldOptions[] } = {};
        report[0] = dataSource.rows;
        report[1] = dataSource.columns;
        report[2] = dataSource.values;
        report[3] = dataSource.filters;
        let pos: number = 0;
        while (pos < 4) {
            if (report[pos]) {
                for (let cnt: number = 0; cnt < report[pos].length; cnt++) {
                    if ((this.excludeFields.indexOf(report[pos][cnt].name) > -1) || (!isNullOrUndefined(fields) && fields.indexOf(report[pos][cnt].name) === -1)) {
                        report[pos].splice(cnt, 1);
                        cnt--;
                    }
                }
            }
            pos++;
        }
    }
    /* eslint-disable */
    private getGroupedRawData(dataSourceSettings: IDataOptions): IDataSet[] | string[][] {
        this.data = [];
        for (let data of this.actualData as IDataSet[]) {
            this.data[this.data.length] = this.frameHeaderWithKeys(data) as any;
        }
        let countFields: string[] = dataSourceSettings.values.filter((item: IFieldOptions) => {
            return item.type === 'Count' || item.type === 'DistinctCount';
        }).map((item: IFieldOptions) => { return item.name; });
        let hasCountField: boolean = countFields.length > 0;
        let realData: IDataSet[] | string[][] = this.data;
        let headerFields: string[] =
            dataSourceSettings.rows.concat(dataSourceSettings.columns.concat(dataSourceSettings.filters)).map((item: IFieldOptions) => {
                return item.name;
            });
        let groupRawData: { [key: string]: IDataSet } | string[] = {};
        let finalData: IDataSet[] = [];
        this.groupRawIndex = {};
        let groupKeys: { [key: string]: number } = {};
        let indexLength: number = 0;
        for (let i: number = 0; i < realData.length; i++) {
            let currData: IDataSet | string[] = realData[i];
            let members: string[] = [];
            if (hasCountField) {
                for (let vPos: number = 0; vPos < countFields.length; vPos++) {
                    (currData as any)[this.fieldKeys[countFields[vPos]] as any] = isNullOrUndefined((currData as any)[this.fieldKeys[countFields[vPos]] as any]) ? (currData as any)[this.fieldKeys[countFields[vPos]] as any] : 1;
                }
            }
            for (let hPos: number = 0; hPos < headerFields.length; hPos++) {
                members.push((currData as any)[this.fieldKeys[headerFields[hPos]] as any]);
            }
            let memberJoin: string = members.join('-');
            if (groupRawData[memberJoin]) {
                for (let vPos: number = 0; vPos < dataSourceSettings.values.length; vPos++) {
                    let currFieldName: string = dataSourceSettings.values[vPos].name;
                    let currValue: any = (currData as any)[this.fieldKeys[currFieldName] as any];
                    let savedData: IDataSet = groupRawData[memberJoin];
                    let summType: SummaryTypes = dataSourceSettings.values[vPos].type;
                    if (!isNullOrUndefined(currValue)) {
                        if (typeof currValue !== 'number' || summType === 'DistinctCount') {
                            summType = 'Count';
                        }
                        if (isNullOrUndefined(savedData[currFieldName])) {
                            savedData[currFieldName] = summType === 'Product' ? 1 : ((summType === 'Min' || summType === 'Max')
                                ? undefined : 0);
                        } else if (typeof savedData[currFieldName] !== 'number') {
                            savedData[currFieldName] = 1;
                        }
                        if (summType === 'Count') {
                            (savedData[currFieldName] as any) += 1;
                        } else if (summType === 'Min') {
                            if (!isNullOrUndefined(savedData[currFieldName])) {
                                savedData[currFieldName] = savedData[currFieldName] > currValue ?
                                    currValue : savedData[currFieldName];
                            }
                        } else if (summType === 'Max') {
                            if (!isNullOrUndefined(savedData[currFieldName])) {
                                savedData[currFieldName] = savedData[currFieldName] < currValue ?
                                    currValue : savedData[currFieldName];
                            }
                        } else if (summType === 'Product') {
                            (savedData[currFieldName] as number) *= currValue;
                        } else {
                            (savedData[currFieldName] as number) += currValue;
                        }
                    }
                }
                if (this.isDrillThrough) {
                    this.groupRawIndex[groupKeys[memberJoin]].push(i);
                }
            } else {
                (groupRawData as any)[memberJoin] = currData;
                finalData.push(currData as any);
                if (this.isDrillThrough) {
                    this.groupRawIndex[indexLength] = [i];
                    groupKeys[memberJoin] = indexLength;
                    indexLength++;
                }
            }
        }
        return finalData;
    }
    private getGroupData(data: IDataSet[]): IDataSet {
        let fieldkeySet: IDataSet = data[0];
        for (let group of this.groups) {
            let fieldName: string = group.name;
            let caption: string = group.caption;
            if (this.fields.indexOf(fieldName) > -1) {
                let groupFields: { [key: string]: string } = {};
                let customGroupFieldName: string;
                if (group.type === 'Date' && this.groupingFields[fieldName]) {
                    return fieldkeySet;
                } else if (group.type === 'Number') {
                    if (PivotUtil.getType(fieldkeySet[fieldName] as Date) === 'number' || !this.groupingFields[fieldName]) {
                        /* eslint-disable  */
                        if (group.rangeInterval) {
                            data.sort((a, b) => (Number(a[this.fieldKeys[fieldName] as any]) > Number(b[this.fieldKeys[fieldName] as any]))
                                ? 1 : ((Number(b[this.fieldKeys[fieldName] as any]) > Number(a[this.fieldKeys[fieldName] as any]))
                                    ? -1 : 0));
                        }
                    } else {
                        return fieldkeySet;
                    }
                } else if (group.type === 'Custom' && this.fields.indexOf(fieldName + '_custom_group') > -1) {
                    return fieldkeySet;
                }
                let len: number = data.length;
                while (len--) {
                    let item: IDataSet = data[len];
                    if (item[this.fieldKeys[fieldName] as any] && group.type === 'Date') {
                        let date: Date = new Date(item[this.fieldKeys[fieldName] as any].toString());
                        if (!isNullOrUndefined(date) && group.groupInterval.length > 0) {
                            for (let i: number = 0, len: number = group.groupInterval.length; i < len; i++) {
                                let interval: DateGroup = group.groupInterval[i];
                                let isInRangeAvail: boolean = this.getRange(group, date.getTime());
                                let newDate: Date = PivotUtil.resetTime(new Date());
                                switch (interval) {
                                    case 'Years':
                                        {
                                            let newFieldName: string = (i === group.groupInterval.length - 1) ? fieldName : fieldName + '_date_group_years';
                                            groupFields[newFieldName] = interval; this.fieldKeys[newFieldName] = this.dataSourceSettings.type === 'CSV' ? (this.fieldKeys[newFieldName] ? this.fieldKeys[newFieldName] : this.fields.length) : newFieldName;
                                            if (this.fields.indexOf(newFieldName) === -1) {
                                                this.fields.push(newFieldName);
                                            }
                                            item[this.fieldKeys[newFieldName] as any] = (isInRangeAvail ? undefined : new Date(newDate.setFullYear(date.getFullYear())).toString());
                                        }
                                        break;
                                    case 'Quarters':
                                        {
                                            let newFieldName: string = (i === group.groupInterval.length - 1) ? fieldName : fieldName + '_date_group_quarters'; groupFields[newFieldName] = interval;
                                            let month: number = Math.ceil((date.getMonth() + 1) / 3);
                                            this.fieldKeys[newFieldName] = this.dataSourceSettings.type === 'CSV' ? (this.fieldKeys[newFieldName] ? this.fieldKeys[newFieldName] : this.fields.length) : newFieldName;
                                            if (this.fields.indexOf(newFieldName) === -1) {
                                                this.fields.push(newFieldName);
                                            }
                                            item[this.fieldKeys[newFieldName] as any] = (isInRangeAvail ? undefined : ((this.localeObj ? this.localeObj.getConstant('qtr') : 'Qtr') + month.toString()));
                                        }
                                        break;
                                    case 'QuarterYear':
                                        {
                                            let newFieldName: string = (i === group.groupInterval.length - 1) ? fieldName : fieldName + '_date_group_quarterYear'; groupFields[newFieldName] = interval;
                                            let month: number = Math.ceil((date.getMonth() + 1) / 3); this.fieldKeys[newFieldName] = this.dataSourceSettings.type === 'CSV' ? (this.fieldKeys[newFieldName] ? this.fieldKeys[newFieldName] : this.fields.length) : newFieldName;
                                            if (this.fields.indexOf(newFieldName) === -1) {
                                                this.fields.push(newFieldName);
                                            }
                                            item[this.fieldKeys[newFieldName] as any] = (isInRangeAvail ? undefined :
                                                ((this.localeObj ? this.localeObj.getConstant('qtr') : 'Qtr') + month.toString() + ' '
                                                    + (this.localeObj ? this.localeObj.getConstant('of') : 'of') + ' '
                                                    + date.getFullYear().toString()));
                                        }
                                        break;
                                    case 'Months':
                                        {
                                            let newFieldName: string = (i === group.groupInterval.length - 1) ? fieldName : fieldName + '_date_group_months'; groupFields[newFieldName] = interval;
                                            this.fieldKeys[newFieldName] = this.dataSourceSettings.type === 'CSV' ? (this.fieldKeys[newFieldName] ? this.fieldKeys[newFieldName] : this.fields.length) : newFieldName;
                                            if (this.fields.indexOf(newFieldName) === -1) {
                                                this.fields.push(newFieldName);
                                            }
                                            item[this.fieldKeys[newFieldName] as any] = (isInRangeAvail ? undefined : new Date(newDate.setMonth(date.getMonth(), newDate.getDate())).toString());
                                        }
                                        break;
                                    case 'Days':
                                        {
                                            let newFieldName: string = (i === group.groupInterval.length - 1) ? fieldName : fieldName + '_date_group_days'; groupFields[newFieldName] = interval;
                                            this.fieldKeys[newFieldName] = this.dataSourceSettings.type === 'CSV' ? (this.fieldKeys[newFieldName] ? this.fieldKeys[newFieldName] : this.fields.length) : newFieldName;
                                            if (this.fields.indexOf(newFieldName) === -1) {
                                                this.fields.push(newFieldName);
                                            }
                                            item[this.fieldKeys[newFieldName] as any] = (isInRangeAvail ? undefined : new Date(newDate.setMonth(date.getMonth(), date.getDate())).toString());
                                        }
                                        break;
                                    case 'Hours':
                                        {
                                            let newFieldName: string = (i === group.groupInterval.length - 1) ? fieldName : fieldName + '_date_group_hours'; groupFields[newFieldName] = interval;
                                            this.fieldKeys[newFieldName] = this.dataSourceSettings.type === 'CSV' ? (this.fieldKeys[newFieldName] ? this.fieldKeys[newFieldName] : this.fields.length) : newFieldName;
                                            if (this.fields.indexOf(newFieldName) === -1) {
                                                this.fields.push(newFieldName);
                                            }
                                            item[this.fieldKeys[newFieldName] as any] = (isInRangeAvail ? undefined : new Date(newDate.setHours(date.getHours())).toString());
                                        }
                                        break;
                                    case 'Minutes':
                                        {
                                            let newFieldName: string = (i === group.groupInterval.length - 1) ? fieldName : fieldName + '_date_group_minutes'; groupFields[newFieldName] = interval;
                                            this.fieldKeys[newFieldName] = this.dataSourceSettings.type === 'CSV' ? (this.fieldKeys[newFieldName] ? this.fieldKeys[newFieldName] : this.fields.length) : newFieldName;
                                            if (this.fields.indexOf(newFieldName) === -1) {
                                                this.fields.push(newFieldName);
                                            }
                                            item[this.fieldKeys[newFieldName] as any] = (isInRangeAvail ? undefined : new Date(newDate.setMinutes(date.getMinutes())).toString());
                                        }
                                        break;
                                    case 'Seconds':
                                        {
                                            let newFieldName: string = (i === group.groupInterval.length - 1) ? fieldName : fieldName + '_date_group_seconds'; groupFields[newFieldName] = interval;
                                            this.fieldKeys[newFieldName] = this.dataSourceSettings.type === 'CSV' ? (this.fieldKeys[newFieldName] ? this.fieldKeys[newFieldName] : this.fields.length) : newFieldName;
                                            if (this.fields.indexOf(newFieldName) === -1) {
                                                this.fields.push(newFieldName);
                                            }
                                            item[this.fieldKeys[newFieldName] as any] = (isInRangeAvail ? undefined : new Date(newDate.setSeconds(date.getSeconds())).toString());
                                        }
                                        break;
                                }
                            }
                        }
                    } else if (item[this.fieldKeys[fieldName] as any] && group.type === 'Number') {
                        let isInRangeAvail: boolean = this.getRange(group, Number(item[this.fieldKeys[fieldName] as any]));
                        item[this.fieldKeys[fieldName] as any] = isInRangeAvail ? undefined : item[this.fieldKeys[fieldName] as any];
                    } else if (item[this.fieldKeys[fieldName] as any] && group.type === 'Custom' && group.customGroups && group.customGroups.length > 0) {
                        let newFieldName: string = fieldName + '_custom_group';
                        let customGroups: ICustomGroups[] = group.customGroups;
                        let groupValue: string;
                        for (let i: number = 0, len: number = customGroups.length; i < len; i++) {
                            {
                                let cGroup: ICustomGroups = customGroups[i];
                                if (cGroup.items && cGroup.items.length > 1) {
                                    customGroupFieldName = newFieldName;
                                    this.fieldKeys[newFieldName] = this.dataSourceSettings.type === 'CSV' ? (this.fieldKeys[newFieldName] ? this.fieldKeys[newFieldName] : this.fields.length) : newFieldName;
                                    if (this.fields.indexOf(newFieldName) === -1) {
                                        this.fields.push(newFieldName);
                                    }
                                    let isDataMatch: boolean = PivotUtil.inArray(item[this.fieldKeys[fieldName] as any].toString(), cGroup.items) === -1 ? false : true;
                                    item[this.fieldKeys[newFieldName] as any] = (isDataMatch ? (cGroup.groupName && cGroup.groupName !== '') ? cGroup.groupName :
                                        this.localeObj.getConstant('group') + ' ' + i : (groupValue && groupValue !== item[this.fieldKeys[fieldName] as any].toString()) ?
                                            groupValue : item[this.fieldKeys[fieldName] as any].toString());
                                    groupValue = item[this.fieldKeys[newFieldName] as any] as string;
                                }
                            }
                        }
                    }
                    let keys: string[] = Object.keys(item);
                    let isCompleteSet: boolean[] = [];
                    for (let key of keys) { isCompleteSet.push((item[key]) ? true : false); }
                    fieldkeySet = (((isCompleteSet.indexOf(false) === -1) && keys.length === Object.keys(data[0]).length) ? item : fieldkeySet);
                    //this.fields = Object.keys(fieldkeySet);
                }
                /* eslint-enable */
                if (group.type === 'Date') {
                    let isDataSource: boolean = false;
                    let axisFields: IFieldOptions[][] = [this.rows, this.columns, this.values, this.filters];
                    let groupKeys: string[] = Object.keys(groupFields);
                    let gCnt: number = Object.keys(groupKeys).length;
                    let groupField: string;
                    for (let axis of axisFields) {
                        if (!isDataSource && axis) {
                            let cnt: number = axis.length;
                            let i: number = 0;
                            while (i < cnt) {
                                if (axis[i].name === fieldName) {
                                    isDataSource = true;
                                    let actualField: IFieldOptions = axis[i];
                                    axis.splice(i, 1);
                                    let dataFields: IFieldOptions[] = this.rows;
                                    dataFields = dataFields.concat(this.columns, this.values, this.filters);
                                    while (gCnt--) {
                                        let caption: string = actualField.caption ? actualField.caption : actualField.name;
                                        if (this.clonedReport) {
                                            let clonedFields: IFieldOptions[] = this.clonedReport.rows;
                                            clonedFields =
                                                clonedFields.concat(this.clonedReport.columns, this.clonedReport.values, this.clonedReport.filters);    /* eslint-disable-line */
                                            let cloneField: IFieldOptions =
                                                PivotUtil.getFieldByName(groupKeys[gCnt], clonedFields) as IFieldOptions;
                                            if (cloneField) {
                                                caption = cloneField.caption ? cloneField.caption : cloneField.name;
                                            }
                                        }
                                        if (!PivotUtil.getFieldByName(groupKeys[gCnt], dataFields)) {
                                            groupField = groupFields[groupKeys[gCnt]];
                                            let newField: IFieldOptions = {
                                                name: groupKeys[gCnt],
                                                caption: (this.localeObj ? this.localeObj.getConstant(groupField) : groupField) + ' (' + caption + ')',
                                                type: 'Count' as SummaryTypes,
                                                showNoDataItems: actualField.showNoDataItems,
                                                baseField: actualField.baseField,
                                                baseItem: actualField.baseItem,
                                                showFilterIcon: actualField.showFilterIcon,
                                                showSortIcon: actualField.showSortIcon,
                                                showEditIcon: actualField.showEditIcon,
                                                showRemoveIcon: actualField.showRemoveIcon,
                                                showSubTotals: actualField.showValueTypeIcon,
                                                allowDragAndDrop: actualField.allowDragAndDrop
                                            };
                                            axis.splice(i, 0, newField);
                                        }
                                    }
                                    break;
                                }
                                i++;
                            }
                            if (isDataSource) {
                                break;
                            }
                        }
                    }
                    gCnt = Object.keys(groupKeys).length;
                    while (gCnt--) {
                        groupField = groupFields[groupKeys[gCnt]];
                        for (let i: number = 0, len: number = this.formats.length; i < len; i++) {
                            if (this.formats[i].name === groupKeys[gCnt]) {
                                this.formats.splice(i, 1);
                                break;
                            }
                        }
                        if (groupField !== 'Quarters' && groupField !== 'QuarterYear') {
                            let formatSettings: IFormatSettings = {
                                name: groupKeys[gCnt],
                                type: ['Years', 'Months', 'Days'].indexOf(groupField) > -1 ? 'date' : 'time',
                                format: ((groupField === 'Years') ? 'yyyy' : (groupField === 'Months') ? 'MMM' :
                                    (groupField === 'Days') ? 'd-MMM' : (groupField === 'Hours') ? 'hh a' :
                                        (groupField === 'Minutes') ? ':mm' : (groupField === 'Seconds') ? ':ss' : undefined)
                            };
                            this.formats.push(formatSettings);
                        }
                    }
                } else if (group.type === 'Number' && group.rangeInterval) {
                    /* eslint-disable */
                    let startValue: number;
                    let endValue: number;
                    let cStartValue: number;
                    let cEndValue: number;
                    let framedSet: number[] = [];
                    let unframedSet: number[] = [];
                    let dataLength: number = data.length;
                    let cnt: number = 0;
                    this.groupingFields[fieldName] = fieldName;
                    while (cnt < dataLength) {
                        unframedSet.push(Number(data[cnt][this.fieldKeys[fieldName] as any]));
                        if (data[cnt][this.fieldKeys[fieldName] as any] && framedSet.indexOf(Number(data[cnt][this.fieldKeys[fieldName] as any])) === -1) {
                            framedSet.push(Number(data[cnt][this.fieldKeys[fieldName] as any]));
                        }
                        cnt++;
                    }
                    let framedSetLength: number = Math.max.apply(Math, framedSet);
                    for (let i: number = framedSet[0], len: number = framedSetLength; i < len; i++) {
                        if (unframedSet.indexOf(i) < 0) {
                            let duplicateData: IDataSet = this.frameData(data[0]);
                            duplicateData[this.fieldKeys[fieldName] as any] = i;
                            let index: number = unframedSet.lastIndexOf(i - 1);
                            unframedSet.splice(index + 1, 0, i);
                            data.splice(index + 1, 0, duplicateData);
                        }
                    }
                    dataLength = data.length;
                    cnt = 0;
                    while (cnt < dataLength) {
                        if (data[cnt] && data[cnt][this.fieldKeys[fieldName] as any]) {
                            cStartValue = Number(data[cnt][this.fieldKeys[fieldName] as any]);
                            cEndValue = (cStartValue as number) + (group.rangeInterval - 1);
                            startValue = (!startValue) ? cStartValue : startValue;
                            endValue = ((!endValue) ? ((cEndValue > framedSetLength) ? framedSetLength : cEndValue) : ((endValue > framedSetLength) ? framedSetLength : endValue));
                            if (cStartValue >= startValue && cStartValue <= endValue) {
                                data[cnt][this.fieldKeys[fieldName] as any] = ((startValue === endValue) ? startValue.toString() : startValue.toString() + '-' + endValue.toString());
                            } else if (cStartValue > endValue && cStartValue === endValue + 1) {
                                startValue = endValue + 1;
                                endValue = ((startValue + (group.rangeInterval - 1) > framedSetLength) ? framedSetLength : startValue + (group.rangeInterval - 1));
                                data[cnt][this.fieldKeys[fieldName] as any] = ((startValue === endValue) ? startValue.toString() : startValue.toString() + '-' + endValue.toString());
                            }
                            let keys: string[] = Object.keys(data[cnt]);
                            let isCompleteSet: boolean[] = [];
                            for (let key of keys) { isCompleteSet.push((data[cnt][key]) ? true : false); }
                            fieldkeySet = (((isCompleteSet.indexOf(false) === -1) && keys.length === Object.keys(data[0]).length) ? data[cnt] : fieldkeySet);
                        }
                        cnt++;
                    }
                    let axisFields: IFieldOptions[][] = [this.rows, this.columns, this.values, this.filters];
                    for (let fields of axisFields) {
                        let field: IFieldOptions = PivotUtil.getFieldByName(fieldName, fields) as IFieldOptions;
                        if (field) {
                            field = (<{ [key: string]: Object }>field).properties ? (<{ [key: string]: Object }>field).properties : field;
                            field.type = 'Count';
                        }
                        /* eslint-enable */
                    }
                    for (let i: number = 0, len: number = this.formats.length; i < len; i++) {
                        if (this.formats[i].name === fieldName) {
                            this.formats.splice(i, 1);
                            break;
                        }
                    }
                } else if (group.type === 'Custom' && customGroupFieldName) {
                    let customFieldName: string = customGroupFieldName;
                    // this.groupingFields[customFieldName] = customFieldName;
                    let isDataSource: boolean = false;
                    let axisFields: IFieldOptions[][] = [this.rows, this.columns, this.values, this.filters];
                    let dataFields: IFieldOptions[] = this.rows;
                    dataFields = dataFields.concat(this.columns, this.values, this.filters);
                    let pattern: string[] = [];
                    if (!caption || caption === '') {
                        pattern = customFieldName.match(/_custom_group/g);
                    }
                    // let actualFieldName: string = fieldName.replace(/_custom_group/g, '');
                    let parentField: IFieldOptions = PivotUtil.getFieldByName(fieldName.replace(/_custom_group/g, ''), dataFields) as IFieldOptions;
                    let customGroupField: IFieldOptions = PivotUtil.getFieldByName(customFieldName, dataFields) as IFieldOptions;
                    for (let axis of axisFields) {
                        if (!isDataSource && axis) {
                            let cnt: number = axis.length;
                            let i: number = 0;
                            while (i < cnt) {
                                if (axis[i].name === group.name && !customGroupField) {
                                    isDataSource = true;
                                    let actualField: IFieldOptions = axis[i];
                                    let newField: IFieldOptions = {
                                        name: customFieldName,
                                        caption: (!caption || caption === '') ? (parentField.caption ? parentField.caption : parentField.name) + (pattern.length + 1) : caption,
                                        type: 'Count' as SummaryTypes,
                                        showNoDataItems: actualField.showNoDataItems,
                                        baseField: actualField.baseField,
                                        baseItem: actualField.baseItem,
                                        showSubTotals: actualField.showValueTypeIcon,
                                        allowDragAndDrop: actualField.allowDragAndDrop,
                                        showFilterIcon: actualField.showFilterIcon,
                                        showSortIcon: actualField.showSortIcon,
                                        showRemoveIcon: actualField.showRemoveIcon,
                                        showEditIcon: actualField.showEditIcon
                                    };
                                    axis.splice(i, 0, newField);
                                    break;
                                } else if (axis[i].name === customFieldName && customGroupField) {
                                    let newField: IFieldOptions = {
                                        name: customGroupField.name,
                                        caption: (!caption || caption === '') ? customGroupField.caption : caption,
                                        type: customGroupField.type,
                                        showNoDataItems: customGroupField.showNoDataItems,
                                        baseField: customGroupField.baseField,
                                        baseItem: customGroupField.baseItem,
                                        showRemoveIcon: customGroupField.showRemoveIcon,
                                        showSubTotals: customGroupField.showValueTypeIcon,
                                        allowDragAndDrop: customGroupField.allowDragAndDrop,
                                        showFilterIcon: customGroupField.showFilterIcon,
                                        showSortIcon: customGroupField.showSortIcon,
                                        showEditIcon: customGroupField.showEditIcon
                                    };
                                    axis.splice(i, 1, newField);
                                    break;
                                }
                                i++;
                            }
                            if (isDataSource) {
                                break;
                            }
                        }
                    }
                    let formatfield: IFormatSettings =
                        PivotUtil.getFieldByName(fieldName, PivotUtil.cloneFormatSettings(this.formats)) as IFormatSettings;
                    if (formatfield) {
                        formatfield.name = customFieldName;
                        this.formats.push(formatfield);
                    }
                }
                /* eslint-enable max-len */
                this.groupingFields = extend(this.groupingFields, groupFields) as { [key: string]: string };
            } else {
                return fieldkeySet;
            }
        }
        //this.fields = Object.keys(fieldkeySet);
        return fieldkeySet;
    }
    /* eslint-disable */
    private frameData(data: IDataSet): IDataSet {
        let fields: string[] = Object.keys(data);
        let keyPos: number = 0;
        let framedSet: any = {};
        while (keyPos < fields.length) {
            framedSet[fields[keyPos]] = undefined;
            keyPos++;
        }
        return framedSet;
    }
    /* eslint-enable */

    private getRange(group: IGroupSettings, cValue: number): boolean {
        let isRangeAvail: boolean;
        if (group.type === 'Date') {
            let cDate: Date = new Date(cValue);
            let startDate: Date = typeof (group.startingAt) === 'string' ? new Date(group.startingAt) : group.startingAt as Date;
            let endDate: Date = typeof (group.endingAt) === 'string' ? new Date(group.endingAt) : group.endingAt as Date;
            if (startDate && cDate.getTime() < startDate.getTime() ||
                endDate && cDate.getTime() > endDate.getTime()) {
                isRangeAvail = true;
            } else {
                isRangeAvail = false;
            }
        } else {
            let startValue: number = typeof (group.startingAt) === 'string' ? parseInt(group.startingAt, 10) : group.startingAt as number;
            let endValue: number = typeof (group.endingAt) === 'string' ? parseInt(group.endingAt, 10) : group.endingAt as number;
            if (startValue && cValue < startValue || endValue && cValue > endValue) {
                isRangeAvail = true;
            } else {
                isRangeAvail = false;
            }
        }
        return isRangeAvail;
    }

    private getPercentFormat(formatField: { [key: string]: IFormatSettings }, currentField: string): number {
        let isHavingFormat: any = (!isNullOrUndefined(formatField[currentField]) && !isNullOrUndefined(this.formatFields[currentField].format)) ? (this.formatFields[currentField].format).toLowerCase().match(/p[0-9]/) : undefined;   /* eslint-disable-line */
        return !isNullOrUndefined(isHavingFormat) ? (Number((this.formatFields[currentField].format).replace(/[^0-9]/g,''))) : 2;
    }

    private getFormattedFields(fields: IFieldOptions[]): void { /* eslint-disable-line */
        let cnt: number = this.formats.length;
        while (cnt--) {
            this.formatFields[this.formats[cnt].name] = this.formats[cnt];
            if (this.formats[cnt].type) {
                this.dateFormatFunction[this.formats[cnt].name] = {
                    exactFormat: this.globalize.getDateFormat(this.formats[cnt]),
                    fullFormat: this.globalize.getDateFormat({
                        format: 'yyyy/MM/dd/HH/mm/ss', type: this.formats[cnt].type
                    })
                };
            }
            // for (let len: number = 0, lnt: number = fields.length; len < lnt; len++) {
            // if (fields[len] && fields[len].name === this.formats[cnt].name) {
            //     this.formatFields[fields[len].name] = this.formats[cnt];
            // }
            // }
        }
    }
    /* eslint-disable  */
    private getFieldList(fields: { [index: string]: Object }, isSort: boolean, isValueFilteringEnabled: boolean): void {
        let type: string;
        let keys: string[] = this.fields;
        let dataFields: IFieldOptions[] = extend([], this.rows, null, true) as IFieldOptions[];
        dataFields = dataFields.concat(this.columns, this.values, this.filters);
        this.getFormattedFields(dataFields);
        this.getCalculatedField(keys);
        keys = this.fields;
        let lenE: number = this.excludeFields.length;
        lenE = lenE - 1;
        while (lenE > -1) {
            let index: number = this.fields.indexOf(this.excludeFields[lenE]);
            if (index > -1) {
                this.fields.splice(index, 1);
                if (this.fieldList) {
                    delete this.fieldList[this.excludeFields[lenE]];
                }    
            }
            lenE--;
        }
        let len: number = keys.length;
        let dataTypes: string[] = ['string', 'number', 'datetime', 'date', 'boolean'];
        if (this.savedFieldList) {
            this.fieldList = this.savedFieldList;
            while (len--) { /** while is used for better performance than for */
                let key: string = keys[len];
                let field: IFieldOptions = this.getMappingField(key);
                if (this.fieldList[key]) {
                    this.fieldList[key].isSelected = false;
                    this.fieldList[key].index = len;
                    this.fieldList[key].filter = [];
                    this.fieldList[key].sort = isSort ? 'Ascending' : 'None';
                    this.fieldList[key].isExcelFilter = false;
                    this.fieldList[key].filterType = '';
                    this.fieldList[key].showFilterIcon = (field && 'showFilterIcon' in field) ?
                        field.showFilterIcon : true;
                    this.fieldList[key].showRemoveIcon = (field && 'showRemoveIcon' in field) ?
                        field.showRemoveIcon : true;
                    this.fieldList[key].showSortIcon = (field && 'showSortIcon' in field) ?
                        field.showSortIcon : true;
                    this.fieldList[key].showEditIcon = (field && 'showEditIcon' in field) ?
                        field.showEditIcon : true;
                    this.fieldList[key].showValueTypeIcon = (field && 'showValueTypeIcon' in field) ?
                        field.showValueTypeIcon : true;
                    this.fieldList[key].allowDragAndDrop = (field && 'allowDragAndDrop' in field) ?
                        field.allowDragAndDrop : true;
                    this.fieldList[key].isCalculatedField = (field && 'isCalculatedField' in field) ?
                        field.isCalculatedField : false;
                    this.fieldList[key].showNoDataItems = (field && 'showNoDataItems' in field) ?
                        field.showNoDataItems : false;
                    this.fieldList[key].showSubTotals = (field && 'showSubTotals' in field) ?
                        field.showSubTotals : true;
                    if (this.isValueFiltersAvail && isValueFilteringEnabled) {
                        this.fieldList[key].dateMember = [];
                        this.fieldList[key].formattedMembers = {};
                        this.fieldList[key].members = {};
                    }
                } else {
                    type = (field && 'dataType' in field && field.dataType && dataTypes.indexOf(field.dataType.toLowerCase()) > -1) ?
                        field.dataType.toLowerCase() : type;
                    this.fieldList[key] = {
                        caption: (field && 'caption' in field && field.caption) ? field.caption : key,
                        id: key,
                        type: ((key.indexOf('_custom_group') !== -1) || (key.indexOf('_date_group') !== -1)) ?
                            'string' : (type === undefined || type === 'undefined') ? 'number' : type,
                        isSelected: false,
                        sort: isSort ? 'Ascending' : 'None',
                        filterType: '',
                        index: len,
                        filter: [],
                        isCustomField: ((key.indexOf('_custom_group') !== -1) || (key.indexOf('_date_group') !== -1)),
                        showRemoveIcon: (field && 'showRemoveIcon' in field) ?
                            field.showRemoveIcon : true,
                        showFilterIcon: (field && 'showFilterIcon' in field) ?
                            field.showFilterIcon : true,
                        showSortIcon: (field && 'showSortIcon' in field) ?
                            field.showSortIcon : true,
                        showNoDataItems: (field && 'showNoDataItems' in field) ?
                            field.showNoDataItems : false,
                        isCalculatedField: (field && 'isCalculatedField' in field) ?
                            field.isCalculatedField : false,
                        showEditIcon: (field && 'showEditIcon' in field) ?
                            field.showEditIcon : true,
                        showValueTypeIcon: (field && 'showValueTypeIcon' in field) ?
                            field.showValueTypeIcon : true,
                        allowDragAndDrop: (field && 'allowDragAndDrop' in field) ?
                            field.allowDragAndDrop : true,
                        showSubTotals: (field && 'showSubTotals' in field) ?
                            field.showSubTotals : true,
                        aggregateType: (field && 'type' in field) ? field.type :
                            (((key.indexOf('_custom_group') !== -1) || (key.indexOf('_date_group') !== -1)) ? 'string' :
                                (type === undefined || type === 'undefined') ? 'number' : type) === 'number' ? 'Sum' : 'Count',
                        baseField: (field && 'baseField' in field) ?
                            field.baseField : undefined,
                        baseItem: (field && 'baseItem' in field) ?
                            field.baseItem : undefined
                    };
                }
            }
        } else {
            this.fieldList = {};
            while (len--) { /** while is used for better performance than for */
                let key: string = keys[len];
                let field: IFieldOptions = this.getMappingField(key);
                type = (field && 'dataType' in field && field.dataType && dataTypes.indexOf(field.dataType.toLowerCase()) > -1) ?
                    field.dataType.toLowerCase() : PivotUtil.getType(fields[this.fieldKeys[key] as any] as Date);
                this.fieldList[key] = {
                    id: key,
                    caption: (field && 'caption' in field && field.caption) ? field.caption : key,
                    type: ((key.indexOf('_custom_group') !== -1) || (key.indexOf('_date_group') !== -1)) ?
                        'string' : (type === undefined || type === 'undefined') ? 'number' : type,
                    filterType: '',
                    index: len,
                    filter: [],
                    sort: isSort ? 'Ascending' : 'None',
                    isSelected: false,
                    isCustomField: ((key.indexOf('_custom_group') !== -1) || (key.indexOf('_date_group') !== -1)),
                    showFilterIcon: (field && 'showFilterIcon' in field) ?
                        field.showFilterIcon : true,
                    showRemoveIcon: (field && 'showRemoveIcon' in field) ?
                        field.showRemoveIcon : true,
                    showSortIcon: (field && 'showSortIcon' in field) ?
                        field.showSortIcon : true,
                    showEditIcon: (field && 'showEditIcon' in field) ?
                        field.showEditIcon : true,
                    showValueTypeIcon: (field && 'showValueTypeIcon' in field) ?
                        field.showValueTypeIcon : true,
                    allowDragAndDrop: (field && 'allowDragAndDrop' in field) ?
                        field.allowDragAndDrop : true,
                    showSubTotals: (field && 'showSubTotals' in field) ?
                        field.showSubTotals : true,
                    showNoDataItems: (field && 'showNoDataItems' in field) ?
                        field.showNoDataItems : false,
                    isCalculatedField: (field && 'isCalculatedField' in field) ?
                        field.isCalculatedField : false,
                    aggregateType: (field && 'type' in field) ? field.type :
                        (((key.indexOf('_custom_group') !== -1) || (key.indexOf('_date_group') !== -1)) ? 'string' :
                            (type === undefined || type === 'undefined') ? 'number' : type) === 'number' ? 'Sum' : 'Count',
                    baseField: (field && 'baseField' in field) ?
                        field.baseField : undefined,
                    baseItem: (field && 'baseItem' in field) ?
                        field.baseItem : undefined
                };
            }
        }
        this.updateTreeViewData(dataFields);
    }

    private getMappingField(key: string): IFieldOptions {
        let field: IFieldOptions = {};
        if (this.fieldMapping.length > 0) {
            for (let index: number = 0, cnt: number = this.fieldMapping.length; index < cnt; index++) {
                if (this.fieldMapping[index].name === key) {
                    field = this.fieldMapping[index];
                    break;
                }
            }
        }
        return field;
    }

    private updateFieldList(savedFieldList: IFieldListOptions): void {
        let keys: string[] = this.fields;
        let len: number = keys.length;
        while (len--) { /** while is used for better performance than for */
            this.fieldList[keys[len]].isExcelFilter = savedFieldList[keys[len]].isExcelFilter;
        }
    }
    private updateTreeViewData(fields: IFieldOptions[]): void {
        let cnt: number = fields.length;
        let lnt: number = this.calculatedFieldSettings.length;
        while (cnt--) {
            if (this.fieldList[fields[cnt].name]) {
                let field: IField = this.fieldList[fields[cnt].name];
                field.type = fields[cnt].dataType ? fields[cnt].dataType.toLowerCase() : field.type;
                field.caption = fields[cnt].caption ? fields[cnt].caption : fields[cnt].name;
                field.isSelected = true;
                field.showNoDataItems = fields[cnt].showNoDataItems;
                field.aggregateType = fields[cnt].type;
                field.baseField = fields[cnt].baseField;
                field.baseItem = fields[cnt].baseItem;
                field.allowDragAndDrop = fields[cnt].allowDragAndDrop;
                field.showFilterIcon = fields[cnt].showFilterIcon;
                field.showSortIcon = fields[cnt].showSortIcon;
                field.showRemoveIcon = fields[cnt].showRemoveIcon;
                field.showValueTypeIcon = fields[cnt].showValueTypeIcon;
                field.showEditIcon = fields[cnt].showEditIcon;
                field.showSubTotals = fields[cnt].showSubTotals;
            }
        }
        while (lnt--) {
            if (this.fieldList[this.calculatedFieldSettings[lnt].name]) {
                this.fieldList[this.calculatedFieldSettings[lnt].name].aggregateType = 'CalculatedField';
                this.fieldList[this.calculatedFieldSettings[lnt].name].isCalculatedField = true;
                this.fieldList[this.calculatedFieldSettings[lnt].name].formula = this.calculatedFieldSettings[lnt].formula;
            }
        }
    }

    private getCalculatedField(keys: string[]): void {
        for (let field of this.calculatedFieldSettings) {
            this.calculatedFields[field.name] = extend({}, field, null, true) as ICalculatedFields;
            this.calculatedFields[field.name].actualFormula = field.formula;
        }
        let fieldKeys: string[] = Object.keys(this.calculatedFields);
        for (let calc: number = 0, cnt: number = fieldKeys.length; calc < cnt; calc++) {
            let field: ICalculatedFields = this.calculatedFields[fieldKeys[calc]];
            let calcProperties: ICalculatedFields = (<{ [key: string]: Object }>field).properties as ICalculatedFields;
            let actualFormula: string =
                (calcProperties ? calcProperties.formula : field.formula).trim();
            let formula: string = actualFormula.replace(/"/g, '');
            field.formula = formula.indexOf('^') > -1 ? this.powerFunction(formula) : formula;
            if (field.formula.indexOf('Math.min(') === -1 && field.formula.indexOf('min(') > -1) {
                field.formula = field.formula.replace(/min\(/g, 'Math.min(');
            }
            if (field.formula.indexOf('Math.max(') === -1 && field.formula.indexOf('max(') > -1) {
                field.formula = field.formula.replace(/max\(/g, 'Math.max(');
            }
            if (field.formula.indexOf('Math.abs(') === -1 && field.formula.indexOf('abs(') > -1) {
                field.formula = field.formula.replace(/abs\(/g, 'Math.abs(');
            }
            /* eslint-disable  */
            field.name = calcProperties ? calcProperties.name : field.name;
            keys = keys.filter((key) => { return key !== field.name; });
            keys.push(field.name);
            let formulaType: string[] = actualFormula.split('\"');
            for (let len: number = 0, lmt: number = formulaType.length; len < lmt; len++) {
                let type: string = formulaType[len].trim();
                let aggregateValue: string[] = type.split(/[ .:;?!~,`"&|()<>{}\[\]\r\n/\\]+/);
                let matchStrings: string[] = type.match(/^([^()]+)\((.*)\)$/);
                let selectedString: string = (aggregateValue[0] === 'DistinctCount' ?
                    'DistinctCount' : aggregateValue[0] === 'PopulationStDev' ?
                        'PopulationStDev' : aggregateValue[0] === 'SampleStDev' ? 'SampleStDev' : aggregateValue[0] === 'PopulationVar' ?
                            'PopulationVar' : aggregateValue[0] === 'SampleVar' ? 'SampleVar' : aggregateValue[0]);
                if (['Sum', 'Count', 'Min', 'Max', 'Avg', 'Product', 'DistinctCount',
                    'PopulationStDev', 'SampleStDev', 'PopulationVar', 'SampleVar', 'Median'].indexOf(selectedString) !== -1) {
                    let index: number = (keys.indexOf(aggregateValue[1]) === -1 && matchStrings[2]) ? keys.indexOf(matchStrings[2]) : keys.indexOf(aggregateValue[1]);
                    if (!this.calculatedFormulas[field.name]) {
                        this.calculatedFormulas[field.name] = [{
                            index: index,
                            type: selectedString,
                            formula: type,
                        }];
                    } else {
                        (<Object[]>this.calculatedFormulas[field.name]).push({
                            index: index,
                            type: selectedString,
                            formula: type
                        });
                    }
                    /* eslint-enable */
                }
            }
        }
        this.fields = keys;
    }
    private validateFilters(data: IDataOptions): void {
        this.isValueFiltersAvail = false;
        let filterElements: IFilter[] = data.filterSettings ? data.filterSettings : [];
        let dataFields: IFieldOptions[] = extend([], this.rows, null, true) as IFieldOptions[];
        dataFields = dataFields.concat(this.columns);
        for (let filter of filterElements) {
            for (let field of dataFields) {
                if (filter.name === field.name && filter.type === 'Value') {
                    this.isValueFiltersAvail = true;
                    break;
                }
            }
            if (this.isValueFiltersAvail) {
                break;
            }
        }
    }
    private validateValueFields(): void {
        this.isValueHasAdvancedAggregate = false;
        for (let value of this.values) {
            if ((['DifferenceFrom', 'PercentageOfDifferenceFrom', 'PercentageOfParentRowTotal', 'PercentageOfParentColumnTotal', 'PercentageOfParentTotal', 'RunningTotals']).indexOf(value.type) !== -1) {
                this.isValueHasAdvancedAggregate = true;
                break;
            }
        }
    }
    private fillFieldMembers(data: IDataSet[], indMat: IMatrix2D): void {
        let keys: string[] = this.fields;
        let dlen: number = data.length as number;
        let fList: IFieldListOptions = this.fieldList;
        let kLn: number = keys.length;
        for (let kl: number = 0; kl < kLn; kl++) {
            let key: string = keys[kl];
            if (!fList[key].members || this.allowDataCompression) {
                fList[key].members = {};
            }
            if (!fList[key].formattedMembers || this.allowDataCompression) {
                fList[key].formattedMembers = {};
            }
            if (!fList[key].dateMember || this.allowDataCompression) {
                fList[key].dateMember = [];
            }
            let members: IMembers = fList[key].members;
            let isDataAvail: boolean = Object.keys(members).length > 0 ? true : false;
            let formattedMembers: IMembers = fList[key].formattedMembers;
            let dateMember: IAxisSet[] = fList[key].dateMember;
            let membersCnt: number = 0;
            let fmembersCnt: number = 0;
            //let sort: string[] = [];
            for (let dl: number = 0; dl < dlen; dl++) {
                let mkey: string = data[dl][this.fieldKeys[key] as string] as string;
                // if (!isNullOrUndefined(mkey)) {
                if (!isDataAvail) {
                    let fKey: string = mkey;
                    let formattedValue: IAxisSet = (this.pageSettings && !(this.formatFields[key] &&
                        (['date', 'dateTime', 'time'].indexOf(this.formatFields[key].type) > -1))) ? ({
                            formattedText: mkey === null ? (this.localeObj ? this.localeObj.getConstant('null') : String(mkey)) :
                                mkey === undefined ? (this.localeObj ? (key in this.groupingFields) ?
                                    this.localeObj.getConstant('groupOutOfRange') : this.localeObj.getConstant('undefined') :
                                    String(mkey)) : mkey.toString(), actualText: mkey === null ? (this.localeObj ?
                                        this.localeObj.getConstant('null') : String(mkey)) : mkey === undefined ? (this.localeObj ?
                                            (key in this.groupingFields) ? this.localeObj.getConstant('groupOutOfRange') :
                                                this.localeObj.getConstant('undefined') : String(mkey)) : mkey
                        }) : this.getFormattedValue(mkey, key);
                    if (formattedValue.formattedText) {
                        fKey = formattedValue.formattedText;
                    }
                    /* eslint-disable */
                    if (!members.hasOwnProperty(mkey)) {
                        membersCnt++;
                        members[mkey] = {
                            index: [dl], ordinal: membersCnt,
                            isDrilled: this.isExpandAll ? true : false
                        };
                        dateMember.push({ formattedText: formattedValue.formattedText, actualText: (formattedValue.dateText ? formattedValue.dateText : formattedValue.actualText) });
                        //sort.push(mkey);
                    } else {
                        members[mkey].index.push(dl);
                    }
                    if (!formattedMembers.hasOwnProperty(fKey)) {
                        /* eslint-enable */
                        fmembersCnt++;
                        formattedMembers[fKey] = {
                            index: [dl], ordinal: fmembersCnt,
                            isDrilled: this.isExpandAll ? true : false
                        };
                    } else {
                        formattedMembers[fKey].index.push(dl);
                    }
                }
                if (!(indMat[dl])) {
                    indMat[dl] = [];
                    indMat[dl][kl] = members[mkey].ordinal;
                } else {
                    indMat[dl][kl] = members[mkey].ordinal;
                }
                // }
            }
            /*sort = Object.keys(members).sort();
            let sortedMembers: Members = {};
            for (let sln: number = 0, slt: number = sort.length; sln < slt; sln++) {
                sortedMembers[sort[sln]] = members[sort[sln]];
            }
            fList[key].members = sortedMembers; */
        }
    }
    /* eslint-disable , @typescript-eslint/no-explicit-any */
    private generateValueMatrix(data: IDataSet[] | string[][]): IMatrix2D {
        let keys: string[] = this.fields;
        let len: number = data.length;
        let vMat: IMatrix2D = [];
        let keyLen: number = keys.length;
        let flList: IFieldListOptions = this.fieldList;
        while (len--) {
            let tkln: number = keyLen;
            //if (isNullOrUndefined(vMat[len])) {
            vMat[len] = [];
            //}
            while (tkln--) {
                let key: string = keys[tkln];
                vMat[len][tkln] = (flList[key].type === 'number' || isNullOrUndefined((data as any)[len][this.fieldKeys[key] as any])) ?
                    isNullOrUndefined((data as any)[len][this.fieldKeys[key] as any]) ?
                        (data as any)[len][this.fieldKeys[key] as any] :
                        !isNaN(Number((data as any)[len][this.fieldKeys[key] as any])) ?
                            Number((data as any)[len][this.fieldKeys[key] as any]) : undefined : 1;
            }
        }
        return vMat;
    }
    private updateSortSettings(sortSettings: ISort[], isSort: boolean): void {
        for (let sln: number = 0, slt: number = sortSettings ? sortSettings.length : 0; sln < slt && isSort; sln++) {
            if (this.fieldList[sortSettings[sln].name]) {
                this.fieldList[sortSettings[sln].name].sort = sortSettings[sln].order;
            }
        }
    }
    private updateFilterMembers(source: IDataOptions): void {
        let filterRw: number[] = this.filterMembers;
        let list: IIterator = {};
        //let eList: {[key: string] : number} = {};
        let isInclude: boolean = this.getFilters(source, list);
        //this.getFilterExcludeList(source.rows, flist);
        //this.getFilterExcludeList(source.columns, flist);
        //this.getFilterExcludeList(source.filters, flist);
        // let filters: Iterator = isInclude ? iList : eList;
        let dln: number = this.indexMatrix.length;
        if (isInclude) {
            let keys: number[] = list.include.index;
            for (let ln: number = 0; ln < keys.length; ln++) {
                if (list.exclude === undefined || list.exclude.indexObject[keys[ln]] === undefined) {
                    filterRw.push(keys[ln]);
                }
            }
        } else {
            for (let ln: number = 0; ln < dln; ln++) {
                if (list.exclude === undefined || list.exclude.indexObject[ln] === undefined) {
                    filterRw.push(ln);
                }
            }
        }
    }
    private getFilters(source: IDataOptions, ilist: IIterator): boolean {
        let filterElements: IFilter[] = source.filterSettings ? source.filterSettings : [];
        let isInclude: boolean = false;
        let filter: string[] = [];
        /* eslint-disable */
        for (let rln: number = 0, rlt: number = filterElements.length; rln < rlt; rln++) {
            let filterElement: IFilter = (<{ [key: string]: Object }>filterElements[rln]).properties ?
                (<{ [key: string]: Object }>filterElements[rln]).properties : filterElements[rln];
            /* eslint-enable */
            if (this.fieldList[filterElement.name] &&
                this.fieldList[filterElement.name].isSelected &&
                this.isValidFilterField(filterElement, source.allowMemberFilter, source.allowLabelFilter)) {
                this.applyLabelFilter(filterElement);
                if (filterElement) {
                    filter = filterElement.items;
                }
                if (filterElement.type && filterElement.type === 'Include') {
                    this.frameFilterList(filter, filterElement.name, ilist, 'include', filterElement.showLabelFilter, isInclude);
                    isInclude = true;
                } else {
                    this.frameFilterList(filter, filterElement.name, ilist, 'exclude', filterElement.showLabelFilter);
                }
                if (filterElement.showLabelFilter) {
                    filterElement.items = [];
                    filterElement.type = filterElement.showDateFilter ? 'Date' : filterElement.showNumberFilter ? 'Number' : 'Label';
                }
            }
        }
        /* for (let cln: number = 0, clt: number = cols.length; cln < clt; cln ++) {
             filter = cols[cln].filter ? cols[cln].filter.items : [];
             if (filter.length && cols[cln].filter.type && cols[cln].filter.type === 'include') {
                 //type = cols[cln].filter.type;
                 this.frameFilterList(filter, cols[cln].name, ilist, 'include', isInclude);
                 isInclude = true;
             } else {
                 this.frameFilterList(filter, cols[cln].name, ilist, 'exclude');
             }
         }
         for (let vln: number = 0, vlt: number = filters.length; vln < vlt; vln ++) {
             filter = filters[vln].filter ? filters[vln].filter.items : [];
             if (filter.length && filters[vln].filter.type && filters[vln].filter.type === 'include') {
                 this.frameFilterList(filter, filters[vln].name, ilist, 'include', isInclude);
                 isInclude = true;
             } else {
                 this.frameFilterList(filter, filters[vln].name, ilist, 'exclude');
             }
         } */
        return isInclude;
    }
    private isValidFilterField(filterElement: IFilter, allowMemberFiltering: boolean, allowLabelFiltering: boolean): boolean {
        let fieldName: string = filterElement.name;
        let isValidFilterElement: boolean = false;
        let filterTypes: FilterType[] = ['Include', 'Exclude'];
        let dataFields: IFieldOptions[] = extend([], this.rows, null, true) as IFieldOptions[];
        dataFields = dataFields.concat(this.columns);
        if (this.fieldList[fieldName].isSelected && allowMemberFiltering && filterTypes.indexOf(filterElement.type) >= 0) {
            isValidFilterElement = true;
            for (let field of this.values) {
                if (fieldName === field.name) {
                    isValidFilterElement = false;
                    break;
                }
            }
        } else if (allowLabelFiltering) {
            for (let field of dataFields) {
                if (fieldName === field.name &&
                    ((['Label', 'Date', 'Number'] as FilterType[]).indexOf(filterElement.type) >= 0)) {
                    isValidFilterElement = true;
                    break;
                }
            }
        }
        return isValidFilterElement;
    }
    private applyLabelFilter(filterElement: IFilter): void {
        if ((['Label', 'Date', 'Number'] as FilterType[]).indexOf(filterElement.type) >= 0) {
            let members: string[] = Object.keys(this.fieldList[filterElement.name].members);
            filterElement.showLabelFilter = true;
            if (filterElement.type === 'Label') {
                filterElement.items = this.getLabelFilterMembers(members, filterElement.condition as LabelOperators, filterElement.value1 as string, filterElement.value2 as string);   /* eslint-disable-line */
            } else if (filterElement.type === 'Date') {
                filterElement.showDateFilter = true;
                let date1: Date = typeof (filterElement.value1) === 'string' ? new Date(filterElement.value1) : filterElement.value1;
                let date2: Date = typeof (filterElement.value2) === 'string' ? new Date(filterElement.value2) : filterElement.value2;
                filterElement.items = this.getDateFilterMembers(members, filterElement.name, filterElement.condition as DateOperators, date1, date2);   /* eslint-disable-line */
            } else {
                filterElement.showNumberFilter = true;
                filterElement.items = [];
                for (let member of members) {
                    let operand1: number = this.getParsedValue(filterElement.name, filterElement.value1 as string);
                    let operand2: number = this.getParsedValue(filterElement.name, filterElement.value2 as string);
                    let cValue: number = this.getParsedValue(filterElement.name, member as string);
                    if (this.validateFilterValue(cValue, filterElement.condition as ValueOperators, operand1, operand2)) {
                        filterElement.items.push(member as string);
                    }
                }
            }
            /* eslint-enable max-len */
            let excludeOperators: LabelOperators[] =
                ['DoesNotBeginWith', 'DoesNotContains', 'DoesNotEndsWith', 'DoesNotEquals', 'NotBetween'];
            filterElement.type = (filterElement.condition ? (excludeOperators.indexOf(filterElement.condition as LabelOperators) > -1 &&
                !filterElement.showNumberFilter) ? 'Exclude' : 'Include' : 'Exclude');
        } else {
            filterElement.showLabelFilter = false;
        }
    }
    private getLabelFilterMembers(members: string[], operator: LabelOperators, value1: string, value2?: string): string[] {
        let items: string[] = [];
        for (let member of members) {
            let filterValue: string = member.toLowerCase();
            if (value1.toString()) {
                switch (operator) {
                    case 'Equals':
                    case 'DoesNotEquals':
                        if (filterValue === value1.toLowerCase()) {
                            items.push(member);
                        }
                        break;
                    case 'BeginWith':
                    case 'DoesNotBeginWith':
                        if (filterValue.indexOf(value1.toLowerCase()) === 0) {
                            items.push(member);
                        }
                        break;
                    case 'EndsWith':
                    case 'DoesNotEndsWith':
                        if (filterValue.match(value1.toLowerCase() + '$') !== null) {
                            items.push(member);
                        }
                        break;
                    case 'Contains':
                    case 'DoesNotContains':
                        if (filterValue.indexOf(value1.toLowerCase()) > -1) {
                            items.push(member);
                        }
                        break;
                    case 'GreaterThan':
                        if (filterValue > value1.toLowerCase()) {
                            items.push(member);
                        }
                        break;
                    case 'GreaterThanOrEqualTo':
                        if (filterValue >= value1.toLowerCase()) {
                            items.push(member);
                        }
                        break;
                    case 'LessThan':
                        if (filterValue < value1.toLowerCase()) {
                            items.push(member);
                        }
                        break;
                    case 'LessThanOrEqualTo':
                        if (filterValue <= value1.toLowerCase()) {
                            items.push(member);
                        }
                        break;
                    case 'Between':
                    case 'NotBetween':
                        if ((filterValue >= value1.toLowerCase()) && (filterValue <= value2.toLowerCase())) {
                            items.push(member);
                        }
                        break;
                    default:
                        if (filterValue === value1.toLowerCase()) {
                            items.push(member);
                        }
                        break;
                }
            }
        }
        return items;
    }
    private getDateFilterMembers(members: string[], name: string, operator: DateOperators, value1: Date, value2?: Date): string[] {
        let items: string[] = [];
        for (let member of members) {
            let filterValue: Date = new Date(member);
            if (value1) {
                switch (operator) {
                    case 'Equals':
                    case 'DoesNotEquals':
                        if (this.getFormattedValue(filterValue.toString(), name).formattedText === this.getFormattedValue(value1.toString(), name).formattedText) { /* eslint-disable-line */
                            items.push(this.getFormattedValue(member, name).formattedText);
                        }
                        break;
                    case 'After':
                        if (filterValue.getTime() > value1.getTime()) {
                            items.push(this.getFormattedValue(member, name).formattedText);
                        }
                        break;
                    case 'AfterOrEqualTo':
                        if (filterValue.getTime() >= value1.getTime()) {
                            items.push(this.getFormattedValue(member, name).formattedText);
                        }
                        break;
                    case 'Before':
                        if (filterValue.getTime() < value1.getTime()) {
                            items.push(this.getFormattedValue(member, name).formattedText);
                        }
                        break;
                    case 'BeforeOrEqualTo':
                        if (filterValue.getTime() <= value1.getTime()) {
                            items.push(this.getFormattedValue(member, name).formattedText);
                        }
                        break;
                    case 'Between':
                    case 'NotBetween':
                        if ((filterValue.getTime() >= value1.getTime()) &&
                            (filterValue.getTime() <= value2.getTime())) {
                            items.push(this.getFormattedValue(member, name).formattedText);
                        }
                        break;
                    default:
                        if (this.getFormattedValue(filterValue.toString(), name).formattedText === this.getFormattedValue(value1.toString(), name).formattedText) { /* eslint-disable-line */
                            items.push(this.getFormattedValue(member, name).formattedText);
                        }
                        break;
                }
            }
        }
        return items;
    }
    /* eslint-enable max-len */
    private validateFilterValue(val: number, operator: ValueOperators, value1: number, value2?: number): boolean {
        let isMemberInclude: boolean = false;
        if (typeof (value1) === 'number') {
            switch (operator) {
                case 'Equals':
                    if (val === value1) {
                        isMemberInclude = true;
                    }
                    break;
                case 'DoesNotEquals':
                    if (val !== value1) {
                        isMemberInclude = true;
                    }
                    break;
                case 'GreaterThan':
                    if (val > value1) {
                        isMemberInclude = true;
                    }
                    break;
                case 'GreaterThanOrEqualTo':
                    if (val >= value1) {
                        isMemberInclude = true;
                    }
                    break;
                case 'LessThan':
                    if (val < value1) {
                        isMemberInclude = true;
                    }
                    break;
                case 'LessThanOrEqualTo':
                    if (val <= value1) {
                        isMemberInclude = true;
                    }
                    break;
                case 'Between':
                    if ((val >= value1) && (val <= value2)) {
                        isMemberInclude = true;
                    }
                    break;
                case 'NotBetween':
                    if (!((val >= value1) && (val <= value2))) {
                        isMemberInclude = true;
                    }
                    break;
                default:
                    if (val !== value1) {
                        isMemberInclude = true;
                    }
                    break;
            }
        }
        return isMemberInclude;
    }
    private frameFilterList(filter: string[], name: string, list: IIterator, type: string, isLabelFilter: boolean, isInclude?: boolean): void { /* eslint-disable-line */
        if (!list[type]) {
            list[type] = { indexObject: {}, index: [] };
            this.updateFilter(filter, name, list, type, isLabelFilter, isInclude);
        } else {
            this.updateFilter(filter, name, list, type, isLabelFilter, isInclude);
        }
        // }
    }

    private updateFilter(filter: string[], name: string, list: IIterator, type: string, isLabelFilter: boolean, isInclude?: boolean): void {
        let fln: number = 0;
        let field: IField = this.fieldList[name];
        field.filter = filter;
        field.filterType = type;
        field.isExcelFilter = isLabelFilter;
        let members: IMembers = (this.formatFields[name] &&
            (['date', 'dateTime', 'time'].indexOf(this.formatFields[name].type) > -1)) ?
            field.formattedMembers : field.members;
        let allowFil: boolean = isInclude;
        let final: IIterator = {};
        let filterObj: IStringIndex = {};
        final[type] = { indexObject: {}, index: [] };
        this.fieldFilterMem[name] = { memberObj: {} };
        while (filter[fln]) {
            if (members[filter[fln]]) {
                let indx: number[] = members[filter[fln]].index;
                if (type === 'include') {
                    for (let iln: number = 0, ilt: number = indx.length; iln < ilt; iln++) {
                        if (!allowFil || list[type].indexObject[indx[iln]] !== undefined) {
                            final[type].indexObject[indx[iln]] = indx[iln];
                            final[type].index.push(indx[iln]);
                        }
                    }
                } else {
                    for (let iln: number = 0, ilt: number = indx.length; iln < ilt; iln++) {
                        if (list[type].indexObject[indx[iln]] === undefined) {
                            list[type].indexObject[indx[iln]] = indx[iln];
                            list[type].index.push(indx[iln]);
                        }
                    }
                    this.fieldFilterMem[name].memberObj[filter[fln]] = filter[fln];
                }
            }
            fln++;
        }
        if (type === 'include') {
            list[type] = final[type];
            for (let iln: number = 0; iln < filter.length; iln++) {
                if (members[filter[iln]]) {
                    filterObj[filter[iln]] = filter[iln];
                }
            }
            let items: string[] = Object.keys(members);
            for (let iln: number = 0, ilt: number = items.length; iln < ilt; iln++) {
                if (filterObj[items[iln]] === undefined) {
                    this.fieldFilterMem[name].memberObj[items[iln]] = items[iln];
                }
            }
        }
    }

    private applyValueFiltering(rowData: IFieldOptions, level: number, rows: IAxisSet[], columns: IAxisSet, valueFilter: IValueFilterSettings, rowFilterData: IAxisSet[], type: string): IAxisSet[] {   /* eslint-disable-line */
        this.isValueFiltered = false;
        let allMember: IAxisSet = extend({}, (type === 'row' && this.rowGrandTotal ? this.rowGrandTotal : type === 'column' && this.columnGrandTotal ? this.columnGrandTotal : rows[rows.length - 1]), null, true);
        this.getFilteredData(rows, columns, valueFilter, rowFilterData, level, rowData.name, allMember, type);
        if (this.isValueFiltered) {
            if ((type === 'row' && this.rowGrandTotal === null) || (type === 'column' && this.columnGrandTotal === null)) {
                rowFilterData.push(allMember);
            }
            rows = rowFilterData;
        }
        return rows;
    }
    private getFilteredData(rows: IAxisSet[], columns: IAxisSet, filterSettings: IValueFilterSettings, rowFilterData: IAxisSet[], level: number, fieldName: string, allMember: IAxisSet, type: string): void {  /* eslint-disable-line */
        let rLen: number = rows.length;
        for (let i: number = 0; i < rLen; i++) {
            if (filterSettings[fieldName]) {
                if (rows[i].level === level) {
                    this.isValueFiltered = true;
                    this.fieldList[fieldName].isExcelFilter = true;
                    let value: number = 0;
                    let measure: string = filterSettings[fieldName].measure;
                    let mPos: number = this.fieldList[measure].index;
                    let aggregate: string = this.fieldList[measure].aggregateType;
                    this.rawIndexObject = {};
                    value = (type === 'row' ? this.getAggregateValue(rows[i].index, columns.indexObject, mPos, aggregate) :
                        this.getAggregateValue(columns.index, rows[i].indexObject, mPos, aggregate));
                    let cellDetails: AggregateEventArgs = {
                        fieldName: measure,
                        row: rows[i],
                        column: columns,
                        value: value,
                        cellSets: this.getCellSet(this.rawIndexObject),
                        rowCellType: (rows[i].hasChild && rows[i].isDrilled ? 'subTotal' : rows[i].type === 'grand sum' ? 'grandTotal' : 'value'),
                        columnCellType: (columns.hasChild && columns.isDrilled ? 'subTotal' : columns.type === 'grand sum' ? 'grandTotal' : 'value'),
                        aggregateType: aggregate as SummaryTypes,
                        skipFormatting: false
                    };
                    if (this.getValueCellInfo) {
                        this.getValueCellInfo(cellDetails);
                    }
                    value = cellDetails.value;
                    this.rawIndexObject = {};
                    let operand1: number = this.getParsedValue(measure, filterSettings[fieldName].value1 as string);
                    let operand2: number = this.getParsedValue(measure, filterSettings[fieldName].value2 as string);
                    if (!this.validateFilterValue(value, filterSettings[fieldName].condition as ValueOperators, operand1, operand2) && rows[i].type !== 'grand sum') {
                        let data: IAxisSet = this.removefilteredData(rows[i], this.valueFilteredData);
                        let row: IAxisSet = data ? data : rows[i];
                        this.validateFilteredParentData(row, this.valueFilteredData, allMember, 0, level, type);
                    } else if (rows[i].type !== 'grand sum') {
                        rowFilterData.push(extend({}, rows[i], null, true));
                        rowFilterData[rowFilterData.length - 1].isLevelFiltered = true;
                    }
                } else if (rows[i].hasChild && rows[i].members.length > 0 && rows[i].type !== 'grand sum') {
                    rowFilterData.push(extend({}, rows[i], null, true));
                    rowFilterData[rowFilterData.length - 1].members = [];
                    rowFilterData[rowFilterData.length - 1].isLevelFiltered = true;
                    this.getFilteredData(rows[i].members, columns, filterSettings, rowFilterData[rowFilterData.length - 1].members, level, fieldName, allMember, type); /* eslint-disable-line */
                }
            }
        }
    }
    /* eslint-enable max-len */
    private getParsedValue(measure: string, value: string): number {
        let cValue: string = value ? value.toString() : '';
        if (this.formatFields[measure] && value) {
            let formatSetting: IFormatSettings = extend({}, this.formatFields[measure], null, true) as IFormatSettings;
            delete formatSetting.name;
            return this.globalize.parseNumber(cValue, formatSetting);
        } else {
            return this.globalize.parseNumber(cValue, { format: 'N' });
        }
    }
    private removefilteredData(row: IAxisSet, rowFilterData: IAxisSet[]): IAxisSet {
        let rows: IAxisSet[] = extend([], rowFilterData, null, true) as IAxisSet[];
        let filteredData: IAxisSet;
        for (let i: number = 0; i < rows.length; i++) {
            if (row.isLevelFiltered && row.axis === rows[i].axis &&
                row.valueSort.levelName === rows[i].valueSort.levelName &&
                row.actualText === rows[i].actualText && row.axis === rows[i].axis &&
                row.level === rows[i].level && row.ordinal === rows[i].ordinal) {
                filteredData = rows[i];
                rowFilterData.splice(i, 1);
                break;
            } else if (rowFilterData[i].hasChild && rowFilterData[i].members.length > 0) {
                this.removefilteredData(row, rowFilterData[i].members);
            }
        }
        return filteredData;
    }
    private validateFilteredParentData(row: IAxisSet, rows: IAxisSet[], allMemberData: IAxisSet, i: number, level: number, type: string): void {    /* eslint-disable-line */
        if (rows.length > 0) {
            for (let rowFilteredData of rows) {
                if (rowFilteredData.level === i) {
                    if (type === 'row') {
                        let index: number[] = row.index;
                        for (let key of index) {
                            if (allMemberData.index.indexOf(key) >= 0) {
                                allMemberData.index.splice(allMemberData.index.indexOf(key), 1);
                            }
                            if (((row.valueSort.levelName.toString()).indexOf(rowFilteredData.valueSort.levelName.toString()) >= 0) &&
                                rowFilteredData.level !== level && rowFilteredData.index.indexOf(key) >= 0) {
                                rowFilteredData.index.splice(rowFilteredData.index.indexOf(key), 1);
                            }
                        }
                    } else {
                        /* eslint-disable */
                        let index: INumberIndex = row.indexObject;
                        for (let key of Object.keys(index)) {
                            if (index.hasOwnProperty(key)) {
                                delete (<{ [key: string]: Object }>allMemberData.indexObject)[key];
                                if (((row.valueSort.levelName.toString()).indexOf(rowFilteredData.valueSort.levelName.toString()) >= 0) &&
                                    rowFilteredData.level !== level) {
                                    delete (<{ [key: string]: Object }>rowFilteredData.indexObject)[key];
                                }
                            }
                        }
                        /* eslint-enable */
                    }
                    if (rowFilteredData && rowFilteredData.members.length > 0 &&
                        rowFilteredData.members[0].level === i + 1 && rowFilteredData.members[0].level !== level) {
                        this.validateFilteredParentData(row, rowFilteredData.members, allMemberData, i + 1, level, type);
                    }
                }
            }
        } else {
            if (type === 'row') {
                let index: number[] = row.index;
                for (let key of index) {
                    if (allMemberData.index.indexOf(key) >= 0) {
                        allMemberData.index.splice(allMemberData.index.indexOf(key), 1);
                    }
                }
            } else {
                /* eslint-disable */
                let index: INumberIndex = row.indexObject;
                for (let key of Object.keys(index)) {
                    if (index.hasOwnProperty(key)) {
                        delete (<{ [key: string]: Object }>allMemberData.indexObject)[key];
                    }
                }
                /* eslint-enable */
            }
        }
    }
    private updateFramedHeaders(framedHeaders: IAxisSet[], dataHeaders: IAxisSet[], filteredHeaders: IAxisSet[], headers: IAxisSet[], type: string): IAxisSet[] {   /* eslint-disable-line */
        for (let dHeader of framedHeaders) {
            this.isHeaderAvail = false;
            if (this.validateFilteredHeaders(dHeader, filteredHeaders, type) || dHeader.type === 'grand sum') {
                if (type === 'row') {
                    this.rowCount += this.rowValuesLength;
                } else {
                    this.columnCount += this.colValuesLength;
                }
                headers.push(extend({}, dHeader, null, true));
                headers[headers.length - 1].members = [];
                if (dHeader.hasChild && dHeader.isDrilled && dHeader.members.length > 0) {
                    this.updateFramedHeaders(dHeader.members, dataHeaders, filteredHeaders, headers[headers.length - 1].members, type);
                }
            }
        }
        return this.filterFramedHeaders;
    }
    private validateFilteredHeaders(dHeader: IAxisSet, filteredHeaders: IAxisSet[], type: string): boolean {
        for (let vHeader of filteredHeaders) {
            if (!this.isHeaderAvail) {
                if (dHeader.actualText === vHeader.actualText &&
                    dHeader.level === vHeader.level &&
                    dHeader.valueSort.levelName === vHeader.valueSort.levelName) {
                    if (type === 'row') {
                        if (vHeader.index.length > 0) {
                            this.isHeaderAvail = true;
                            dHeader.index = vHeader.index;
                            return true;
                        } else {
                            this.isHeaderAvail = false;
                            dHeader.index = vHeader.index;
                            return false;
                        }
                    } else {
                        if (Object.keys(vHeader.indexObject).length > 0) {
                            this.isHeaderAvail = true;
                            dHeader.indexObject = vHeader.indexObject;
                            return true;
                        } else {
                            this.isHeaderAvail = false;
                            dHeader.indexObject = vHeader.indexObject;
                            return false;
                        }
                    }
                } else if (vHeader.hasChild && vHeader.members.length > 0 && vHeader.type !== 'grand sum') {
                    this.validateFilteredHeaders(dHeader, vHeader.members, type);
                }
            }
        }
        return this.isHeaderAvail;
    }
    private isEmptyDataAvail(rowHeaders: IAxisSet[], columnHeaders: IAxisSet[]): void {
        this.isEmptyData = false;
        if (rowHeaders.length > 0 && rowHeaders[rowHeaders.length - 1].type === 'grand sum' &&
            rowHeaders[rowHeaders.length - 1].index.length === 0) {
            this.isEmptyData = true;
        }
        if (columnHeaders.length > 0 && columnHeaders[columnHeaders.length - 1].type === 'grand sum' &&
            Object.keys(columnHeaders[columnHeaders.length - 1].indexObject).length === 0) {
            this.isEmptyData = true;
        }
        if (rowHeaders.length === 0 || columnHeaders.length === 0) {
            this.isEmptyData = true;
        }
    }
    /* eslint-disable-next-line */
    /** @hidden */
    public updateGridData(dataSource: IDataOptions): void {
        this.data = dataSource.dataSource as IDataSet[];
        if (this.pageSettings && this.pageSettings.allowDataCompression) {
            this.actualData = this.data;
            this.data = this.getGroupedRawData(dataSource);
        }
        this.indexMatrix = [];
        for (let field of this.fields) {
            this.fieldList[field].members = {};
            this.fieldList[field].formattedMembers = {};
            this.fieldList[field].dateMember = [];
        }
        this.fillFieldMembers(this.data as IDataSet[], this.indexMatrix);
        this.valueMatrix = this.generateValueMatrix(this.data as IDataSet[]);
        this.filterMembers = [];
        this.cMembers = [];
        this.rMembers = [];
        this.updateFilterMembers(dataSource);
        this.isEditing = true;
        this.isDrillThrough = true;
        this.generateGridData(dataSource);
        this.isEditing = false;
    }
    public generateGridData(dataSource: IDataOptions, headerCollection?: HeaderCollection): void {
        let columns: IFieldOptions[] = dataSource.columns ? dataSource.columns : [];
        let data: IDataSet[] = this.data as IDataSet[];
        let rows: IFieldOptions[] = dataSource.rows ? dataSource.rows : [];
        let filterSettings: IFilter[] = dataSource.filterSettings;
        let values: IFieldOptions[] = dataSource.values ? dataSource.values : [];
        this.removeCount = 0;
        this.isExpandAll = dataSource.expandAll;
        this.drilledMembers = dataSource.drilledMembers ? dataSource.drilledMembers : [];
        this.isEmptyData = false;
        let filterMembers: number[] = [];
        /* eslint-disable */
        let showNoDataItems: boolean = (rows[0] && rows[0].showNoDataItems) || (columns[0] && columns[0].showNoDataItems);
        let dataFields: IFieldOptions[] = extend([], this.rows, null, true) as IFieldOptions[];
        dataFields = dataFields.concat(this.columns, this.values, this.filters);
        if (showNoDataItems) {
            for (let ln: number = 0; ln < this.indexMatrix.length; ln++) {
                filterMembers.push(ln);
            }
        }
        /* eslint-enable */
        for (let ln: number = 0; ln < this.filterMembers.length; ln++) {
            this.filterPosObj[this.filterMembers[ln]] = this.filterMembers[ln];
        }
        //let childrens: Field = this.fieldList[rows[0].name + ''];
        this.valueSortSettings.columnIndex = undefined;
        this.validateValueFields();
        this.frameDrillObject();
        if (!this.isValueFilterEnabled || this.isEditing) {
            if (!headerCollection) {
                this.columnCount = 0; this.rowCount = 0; this.cMembers = []; this.rMembers = [];
                if (rows.length !== 0) {
                    this.rMembers =
                        this.getIndexedHeaders(
                            rows, data, 0, rows[0].showNoDataItems ? filterMembers : this.filterMembers,
                            'row', '', this.allowValueFilter);
                }
                if (columns.length !== 0) {
                    this.cMembers = this.getIndexedHeaders(columns, data, 0, columns[0].showNoDataItems ?
                        filterMembers : this.filterMembers, 'column', '', this.allowValueFilter);
                }
                this.insertAllMembersCommon();
                this.saveDataHeaders = (this.isValueFiltersAvail && dataSource.allowValueFilter) ? {
                    rowHeaders: extend([], this.rMembers, null, true) as IAxisSet[],
                    columnHeaders: extend([], this.cMembers, null, true) as IAxisSet[]
                } : {};
            }
        }
        this.pivotValues = []; this.headerContent = [];
        this.valueContent = []; this.valueFilteredData = []; this.filterFramedHeaders = []; let rowheads: IAxisSet[] = [];
        let colheads: IAxisSet[] = []; let rowFilteredData: IAxisSet[] = []; let columnFilteredData: IAxisSet[] = [];
        let valuesCount: number = (this.values.length);
        if (this.isValueFiltersAvail && dataSource.allowValueFilter && !headerCollection) {
            this.valueFilteredData = [];
            let rowHeaders: IAxisSet[] = this.saveDataHeaders.rowHeaders;
            let columnHeaders: IAxisSet[] = this.saveDataHeaders.columnHeaders;
            if (filterSettings.length > 0) {
                let valueFilters: IValueFilterSettings = {};
                let valueFields: IValueFields = {};
                /* eslint-disable */
                for (let value of values) { valueFields[value.name] = value; }
                for (let filter of filterSettings) {
                    rowHeaders = (rowFilteredData.length > 0 ? rowFilteredData : rowHeaders);
                    columnHeaders = (columnFilteredData.length > 0 ? columnFilteredData : columnHeaders);
                    this.valueFilteredData = [];
                    let filterElement: IFilter = (<{ [key: string]: Object }>filter).properties ?
                        (<{ [key: string]: Object }>filter).properties : filter;
                    /* eslint-enable */
                    if (filterElement.type === 'Value' && this.fieldList[filter.name] && this.fieldList[filter.name].isSelected) {
                        valueFilters[filter.name] = filter;
                        filterElement.items = [];
                        let isAvail: boolean = false;
                        let rLen: number = rows.length;
                        let cLen: number = columns.length;
                        for (let i: number = 0; i < rLen; i++) {
                            if (filterElement.name === rows[i].name && valueFields[filterElement.measure] && !isAvail) {
                                isAvail = true;
                                rowFilteredData = this.applyValueFiltering(rows[i], i, rowHeaders, (this.columnGrandTotal ? this.columnGrandTotal : columnHeaders[columnHeaders.length - 1]), valueFilters, this.valueFilteredData, 'row');
                                break;
                            }
                        }
                        for (let j: number = 0; j < cLen; j++) {
                            if (filterElement.name === columns[j].name && valueFields[filterElement.measure] && !isAvail) {
                                isAvail = true;
                                columnFilteredData = this.applyValueFiltering(columns[j], j, columnHeaders, (this.rowGrandTotal ? this.rowGrandTotal : rowHeaders[rowHeaders.length - 1]), valueFilters, this.valueFilteredData, 'column');
                                break;
                            }
                        }
                    }
                }
            }
            rowFilteredData = (rowFilteredData.length > 0 ? rowFilteredData : rowHeaders);
            columnFilteredData = (columnFilteredData.length > 0 ? columnFilteredData : columnHeaders);
            this.isEmptyDataAvail(rowFilteredData, columnFilteredData);
            let savedFieldList: IFieldListOptions = extend({}, this.fieldList, null, true) as IFieldListOptions;
            this.indexMatrix = []; let fields: IDataSet = (this.data as IDataSet[])[0];
            this.getFieldList(fields, this.enableSort, dataSource.allowValueFilter);
            this.fillFieldMembers((this.data as IDataSet[]), this.indexMatrix);
            this.updateSortSettings(dataSource.sortSettings, this.enableSort);
            this.valueMatrix = this.generateValueMatrix((this.data as IDataSet[]));
            this.filterMembers = []; this.updateFilterMembers(dataSource);
            this.rMembers = rows.length !== 0 ?
                this.getIndexedHeaders(rows, data, 0, rows[0].showNoDataItems ?
                    filterMembers : this.filterMembers, 'row', '') : [];
            this.cMembers = columns.length !== 0 ?
                this.getIndexedHeaders(columns, data, 0, columns[0].showNoDataItems ?
                    filterMembers : this.filterMembers, 'column', '') : [];
            this.insertAllMembersCommon();
            this.updateFieldList(savedFieldList);
            this.rowCount = 0; this.columnCount = 0;
            this.rMembers = this.updateFramedHeaders(this.rMembers, this.rMembers, rowFilteredData, this.filterFramedHeaders, 'row');
            this.filterFramedHeaders = [];
            this.cMembers = this.updateFramedHeaders(this.cMembers, this.cMembers, columnFilteredData, this.filterFramedHeaders, 'column');
            this.isValueFilterEnabled = true;
        }
        if (!headerCollection) {
            this.applyValueSorting();
        }
        if (this.pageSettings) {
            if (!headerCollection) {
                this.headerCollection.rowHeaders = this.rMembers;
                this.headerCollection.columnHeaders = this.cMembers;
                this.headerCollection.rowHeadersCount = this.rowCount; this.headerCollection.columnHeadersCount = this.columnCount;
            } else {
                this.rMembers = headerCollection.rowHeaders; this.cMembers = headerCollection.columnHeaders;
                this.rowCount = headerCollection.rowHeadersCount; this.columnCount = headerCollection.columnHeadersCount;
            }
            this.calculatePagingValues();
        }
        this.getAggregatedHeaders(rows, columns, this.rMembers, this.cMembers, values);
        this.getHeaderData(this.cMembers, colheads, this.pivotValues, 0, this.valueAxis ? 1 : valuesCount);
        this.insertSubTotals();
        this.getTableData(this.rMembers, rowheads, colheads, 0, this.pivotValues, valuesCount, (this.rowGrandTotal ? this.rowGrandTotal : this.rMembers[this.rMembers.length - 1]), (this.columnGrandTotal ? this.columnGrandTotal : this.cMembers[this.cMembers.length - 1])); /* eslint-disable-line */
        this.applyAdvancedAggregate(rowheads, colheads, this.pivotValues);
        this.isEngineUpdated = true;
        this.isEmptyDataAvail(this.rMembers, this.cMembers);
        //  console.log(st1 - st2);
    }
    private updateHeaders(rowFlag?: boolean, columnFlag?: boolean): void {
        /* removing the row grant-total members */
        rowFlag = (isNullOrUndefined(rowFlag) ? (this.showGrandTotals && this.showRowGrandTotals) ?
            true : (this.rows.length > 0) ? false : true : rowFlag);
        if (((this.pageSettings && (this.removeRowGrandTotal)) || (!rowFlag && !this.rowGrandTotal)) &&
            this.rMembers[this.rMembers.length - 1].type === 'grand sum') {
            this.rMembers = this.rMembers.slice(0, this.rMembers.length - 1);
        }
        /* removing the column gran-total members */
        columnFlag = (isNullOrUndefined(columnFlag) ? (this.showGrandTotals && this.showColumnGrandTotals) ?
            true : (this.columns.length > 0) ? false : true : columnFlag);
        if (((this.pageSettings && (this.removeColumnGrandTotal)) || (!columnFlag && !this.columnGrandTotal)) &&
            this.cMembers[this.cMembers.length - 1].type === 'grand sum') {
            this.cMembers = this.cMembers.slice(0, this.cMembers.length - 1);
        }
    }
    private updatePivotValues(updateHeaders?: boolean): void {
        let rowFlag: boolean = (this.showGrandTotals && this.showRowGrandTotals) ? true : (this.rows.length > 0) ? false : true;
        let columnFlag: boolean = (this.showGrandTotals && this.showColumnGrandTotals) ? true : (this.columns.length > 0) ? false : true;
        if (updateHeaders) {
            this.updateHeaders(rowFlag, columnFlag);
        }
        /* removing the row grant-totals */
        if (((this.pageSettings && (this.removeRowGrandTotal)) ||
            (!rowFlag && !this.rowGrandTotal)) && this.valueContent.length > 0) {
            let slicePos: number = 1;
            if (this.valueAxis && this.values.length > 0) {
                slicePos = 1 + this.values.length;
            }
            if (this.pivotValues[this.pivotValues.length - slicePos] &&
                (this.pivotValues[this.pivotValues.length - slicePos][0] as IAxisSet).type === 'grand sum') {
                this.pivotValues = (this.pivotValues as []).slice(0, this.pivotValues.length - slicePos);
                this.valueContent = (this.valueContent as []).slice(0, this.valueContent.length - slicePos);
            }
        }
        /* removing the column gran-totals */
        if (((this.pageSettings && (this.removeColumnGrandTotal)) ||
            (!columnFlag && !this.columnGrandTotal)) && this.headerContent.length > 0) {
            let slicePos: number = this.values.length;
            if (this.valueAxis && this.values.length > 0) {
                slicePos = 1;
            }
            if (this.pivotValues[0][this.pivotValues[0].length - slicePos] &&
                (this.pivotValues[0][this.pivotValues[0].length - slicePos] as IAxisSet).type === 'grand sum') {
                for (let ln: number = 0; ln < this.pivotValues.length; ln++) {
                    if (this.pivotValues[ln]) {
                        this.pivotValues[ln] = (this.pivotValues[ln] as []).slice(0, this.pivotValues[ln].length - slicePos);
                    }
                    if (this.headerContent[ln]) {
                        for (let pos: number = this.pivotValues[ln].length; pos < (this.pivotValues[ln].length + slicePos); pos++) {
                            delete this.headerContent[ln][pos];
                        }
                    }
                }
            }
        }
        this.removeRowGrandTotal = this.removeColumnGrandTotal = false;
    }
    /* eslint-disable-next-line */
    /** @hidden */
    public onDrill(drilledItem: IDrilledItem): void {
        this.frameDrillObject();
        let headersInfo: IHeadersInfo = this.getHeadersInfo(drilledItem.fieldName, drilledItem.axis);
        this.performDrillOperation(headersInfo.headers, drilledItem, headersInfo.fields, headersInfo.position, 0);
        this.headerCollection.rowHeadersCount = this.rowCount; this.headerCollection.columnHeadersCount = this.columnCount;
        if (headersInfo.axis === 'row') {
            this.headerCollection.rowHeaders = headersInfo.headers;
        } else {
            this.headerCollection.columnHeaders = headersInfo.headers;
        }
        this.updateEngine();
    }
    /* eslint-disable-next-line */
    /** @hidden */
    public onSort(sortItem: ISort): void {
        let headersInfo: IHeadersInfo = this.getHeadersInfo(sortItem.name, '');
        this.fieldList[sortItem.name].sort = sortItem.order;
        this.performSortOperation(headersInfo.headers, sortItem, headersInfo, 0);
        this.updateEngine();
    }
    /* eslint-disable-next-line */
    /** @hidden */
    public onFilter(filterItem: IFilter, dataSource: IDataOptions): void {
        let headersInfo: IHeadersInfo = this.getHeadersInfo(filterItem.name, '');
        if (filterItem.type === 'Include' && filterItem.items.length === this.fieldList[filterItem.name].dateMember.length) {
            this.fieldList[filterItem.name].filter = [];
            this.fieldList[filterItem.name].filterType = '';
        } else {
            this.fieldList[filterItem.name].filter = filterItem.items;
            this.fieldList[filterItem.name].filterType = filterItem.type;
        }
        let posObj: { [key: number]: number } = {};
        for (let pos of this.filterMembers) {
            posObj[pos] = pos;
        }
        this.filterMembers = [];
        this.fieldFilterMem = {};
        this.updateFilterMembers(dataSource);
        /* eslint-disable  */
        let addPos: number[] = this.filterMembers.filter((pos) => { return posObj[pos] === undefined; });
        /* eslint-enable  */
        let itemsObj: { [key: string]: string } = {};
        for (let item of filterItem.items) {
            itemsObj[item] = item;
        }
        let showNoDataItems: boolean = (this.rows[0] && this.rows[0].showNoDataItems) || (
            this.columns[0] && this.columns[0].showNoDataItems);
        if (showNoDataItems) {
            let filterMembers: number[] = [];
            this.filterPosObj = {};
            for (let ln: number = 0; ln < addPos.length; ln++) {
                this.filterPosObj[addPos[ln]] = addPos[ln];
            }
            for (let ln: number = 0; ln < this.indexMatrix.length; ln++) {
                filterMembers.push(ln);
            }
            addPos = filterMembers;
        }
        this.performFilterCommonUpdate(filterItem, headersInfo, addPos);
        this.frameHeaderObjectsCollection = false;
        this.headerObjectsCollection = {};
        this.updateEngine();
    }
    /* eslint-disable-next-line */
    /** @hidden */
    public onAggregation(field: IFieldOptions): void {
        this.fieldList[field.name].aggregateType = field.type;
        this.rMembers = this.headerCollection.rowHeaders;
        this.cMembers = this.headerCollection.columnHeaders;
        if (this.allowDataCompression) {
            this.data = this.getGroupedRawData(this.dataSourceSettings);
            this.valueMatrix = this.generateValueMatrix(this.data);
        }
        this.updateEngine();
    }
    /* eslint-disable-next-line */
    /** @hidden */
    public onCalcOperation(field: ICalculatedFields): void {
        this.rMembers = this.headerCollection.rowHeaders;
        this.cMembers = this.headerCollection.columnHeaders;
        this.getCalculatedField(this.fields);
        if (this.fieldList[field.name]) {
            this.fieldList[field.name].formula = field.formula;
        } else {
            this.fieldList[field.name] = {
                id: field.name,
                caption: field.name,
                type: 'number',
                aggregateType: 'CalculatedField',
                filterType: '',
                index: this.fields.length - 1,
                filter: [],
                sort: this.enableSort ? 'Ascending' : 'None',
                isSelected: true,
                isExcelFilter: false,
                formula: field.formula
            };
            if (this.valueAxis === 1) {
                this.headerCollection.rowHeadersCount = this.rowCount = (
                    this.rowCount / (this.values.length - 1)) * this.values.length;
            } else {
                this.headerCollection.columnHeadersCount = this.columnCount = (
                    this.columnCount / (this.values.length - 1)) * this.values.length;
            }
        }
        this.updateEngine();
    }
    private performDrillOperation(
        headers: IAxisSet[], drilledItem: IDrilledItem, fields: IFieldOptions[], position: number, currentPosition: number): IAxisSet[] {
        let count: number = 0;
        while (count < headers.length) {
            if (position === currentPosition) {
                if (drilledItem.memberName === (headers[count].valueSort.levelName as string).split(this.valueSortSettings.headerDelimiter)
                    .join(drilledItem.delimiter ? drilledItem.delimiter : '**')) {
                    if (drilledItem.action === 'down') {
                        headers[count].isDrilled = true;
                        headers[count].members = this.getIndexedHeaders(
                            fields, this.data, position + 1, headers[count].index, drilledItem.axis, drilledItem.memberName.
                                split(drilledItem.delimiter ? drilledItem.delimiter : '**').join(this.valueSortSettings.headerDelimiter));
                        let sortedHeaders: ISortedHeaders;
                        if (drilledItem.axis === 'row') {
                            sortedHeaders = this.applyValueSorting(headers[count].members, this.cMembers);
                            headers[count].members = sortedHeaders.rMembers;
                        } else {
                            let showSubTotals: boolean = this.showSubTotals && this.showColumnSubTotals && fields[position].showSubTotals;
                            this.columnCount -= !showSubTotals ? this.colValuesLength : 0;
                            sortedHeaders = this.applyValueSorting(this.rMembers, headers[count].members);
                            headers[count].members = sortedHeaders.cMembers;
                        }
                    } else {
                        headers[count].isDrilled = false;
                        this.updateHeadersCount(headers[count].members, drilledItem.axis, position, fields, 'minus', true);
                        headers[count].members = [];
                    }
                    break;
                }
            } else if (headers[count].members.length > 0) {
                headers[count].members = this.performDrillOperation(
                    headers[count].members, drilledItem, fields, position, currentPosition + 1);
            }
            count++;
        }
        return headers;
    }
    private performSortOperation(headers: IAxisSet[], sortItem: ISort, headersInfo: IHeadersInfo, currentPosition: number): IAxisSet[] {
        let count: number = 0;
        while (count < headers.length) {
            if (headersInfo.position === currentPosition) {
                headers = this.getSortedHeaders(headers, sortItem.order.toString());
                break;
            } else if (headers[count].members.length > 0) {
                headers[count].members = this.performSortOperation(
                    headers[count].members, sortItem, headersInfo, currentPosition + 1);
            }
            count++;
        }
        return headers;
    }
    /* eslint-disable  */
    private performFilterDeletion(
        headers: IAxisSet[], filterItem: IFilter,
        headersInfo: IHeadersInfo, filterObjects: INumberIndex, currentPosition: number): IAxisSet[] {
        let count: number = 0;
        let loopIn: boolean = true;
        while (count < headers.length && loopIn) {
            if (headersInfo.position === currentPosition) {
                let engine: PivotEngine = this;
                headers = headers.filter((item) => {
                    return !engine.fieldFilterMem[filterItem.name].memberObj[item.formattedText] || item.type === 'grand sum';
                });
                loopIn = false;
            } else if (headers[count].members.length > 0) {
                headers[count].members = this.performFilterDeletion(
                    headers[count].members, filterItem, headersInfo, filterObjects, currentPosition + 1);
            }
            count++;
        }
        let engine: PivotEngine = this;
        return headers.filter((item) => {
            return item.members.length > 0 ? item.members.length > 0 : engine.matchIndexes(item.indexObject, filterObjects);
        });
    }
    private matchIndexes(index: INumberIndex, filterObjects: INumberIndex): boolean {
        let keys: string[] = Object.keys(index);
        let len: number = keys.length;
        if (len === 0) {
            return true;
        }
        while (len > -1) {
            if (filterObjects[index[keys[len]]] !== undefined) {
                return true;
            }
            len--;
        }
        return false;
    }
    private performFilterAddition(headers: IAxisSet[], fields: IFieldOptions[], headersInfo: IHeadersInfo): IAxisSet[] {
        let count: number = 0;
        while (count < headers.length) {
            let levelName: string = headers[count].valueSort.levelName as string;
            if (this.headerObjectsCollection[levelName]) {
                let memberNameObj: { [key: string]: string } = {};
                for (let member of headers[count].members) {
                    memberNameObj[member.valueSort.levelName.toString()] = member.valueSort.levelName.toString();
                }
                let excessHeaders: IAxisSet[] = this.headerObjectsCollection[levelName].filter((member) => {
                    return !memberNameObj[member.valueSort.levelName.toString()];
                });
                headers[count].members = headers[count].members.concat(excessHeaders);
                headers[count].members = this.getSortedHeaders(
                    headers[count].members, this.fieldList[headersInfo.fields[headers[count].members[0].level].name].sort);
                delete this.headerObjectsCollection[levelName];
            }
            if (headers[count].members.length > 0) {
                headers[count].members = this.performFilterAddition(headers[count].members, fields, headersInfo);
            }
            count++;
        }
        return headers;
    }
    private performFilterCommonUpdate(filterItem: IFilter, headersInfo: IHeadersInfo, addPos: number[]): void {
        let rawHeaders: IAxisSet[] = headersInfo.axis === 'row' ? this.rMembers : this.cMembers;
        let filterObjects: INumberIndex = {};
        for (let item of this.filterMembers) {
            filterObjects[item] = item;
        }
        if (this.fieldFilterMem[filterItem.name]) {
            rawHeaders = this.performFilterDeletion(headersInfo.headers, filterItem, headersInfo, filterObjects, 0);
        }
        if (addPos.length > 0 && headersInfo.fields.length > 0) {
            this.frameHeaderObjectsCollection = true;
            if (headersInfo.fields.filter((item) => { return item.showNoDataItems; }).length > 0) {
                for (let i: number = 0; i < this.data.length; i++) {
                    addPos.push(i);
                }
                //addPos = (this.data as any).map((item, pos) => { return pos; });
            }
            /* eslint-disable */
            this.headerObjectsCollection['parent'] = this.getIndexedHeaders(headersInfo.fields, this.data, 0, addPos, headersInfo.axis, '');
            rawHeaders = this.performFilterAddition(rawHeaders, headersInfo.fields, headersInfo);
            let headerNames: IStringIndex = {};
            for (let header of rawHeaders) {
                headerNames[header.valueSort.levelName.toString()] = header.valueSort.levelName.toString();
            }
            let excessHeaders: IAxisSet[] = this.headerObjectsCollection['parent'].filter((header) => {
                return !headerNames[header.valueSort.levelName.toString()];
            });
            let grandHeader: IAxisSet[] = rawHeaders.filter((item) => { return item.type === 'grand sum'; });
            if (grandHeader.length > 0) {
                rawHeaders.pop();
            }
            /* eslint-enable */
            rawHeaders = this.getSortedHeaders(
                rawHeaders.concat(excessHeaders), this.fieldList[headersInfo.fields[0].name].sort).concat(grandHeader);
        }
        if (headersInfo.axis === 'row') {
            this.rowCount = 0;
        } else {
            this.columnCount = 0;
        }
        this.updateHeadersCount(rawHeaders, headersInfo.axis, 0, headersInfo.fields, 'plus', false);
        if (headersInfo.axis === 'row') {
            if (headersInfo.position > 0) {
                this.insertPosition(this.rows, this.data, 0, this.filterMembers, 'row', '', rawHeaders);
            }
            this.insertTotalPosition(rawHeaders);
            this.rMembers = this.headerCollection.rowHeaders = rawHeaders;
            this.headerCollection.rowHeadersCount = this.rowCount;
        } else {
            if (headersInfo.position > 0) {
                this.insertPosition(this.columns, this.data, 0, this.filterMembers, 'column', '', rawHeaders);
            }
            this.insertTotalPosition(rawHeaders);
            this.cMembers = this.headerCollection.columnHeaders = rawHeaders;
            this.headerCollection.columnHeadersCount = this.columnCount;
        }
        this.applyValueSorting();
    }
    /* eslint-enable  */
    private getHeadersInfo(fieldName: string, axis: string): IHeadersInfo {
        this.rMembers = this.headerCollection.rowHeaders; this.cMembers = this.headerCollection.columnHeaders;
        axis = axis === '' ? this.getAxisByFieldName(fieldName) : axis;
        let headers: IAxisSet[] = axis === 'row' ? this.rMembers : this.cMembers;
        let fields: IFieldOptions[] = axis === 'row' ? this.rows : this.columns;
        let position: number = 0;
        for (let field of fields) {
            if (field.name === fieldName) {
                break;
            }
            position++;
        }
        return { axis: axis, fields: fields, headers: headers, position: position };
    }
    /* eslint-disable-next-line */
    /** @hidden */
    public updateEngine(): void {
        this.removeCount = 0;
        this.validateValueFields();
        this.calculatePagingValues();
        this.pivotValues = []; this.headerContent = []; this.valueContent = [];
        let rowheads: IAxisSet[] = []; let colheads: IAxisSet[] = [];
        let valuesCount: number = (this.values.length);
        this.getAggregatedHeaders(this.rows, this.columns, this.rMembers, this.cMembers, this.values);
        this.getHeaderData(this.cMembers, colheads, this.pivotValues, 0, this.valueAxis ? 1 : valuesCount);
        this.insertSubTotals();
        this.getTableData(this.rMembers, rowheads, colheads, 0, this.pivotValues, valuesCount, (this.rowGrandTotal ? this.rowGrandTotal : this.rMembers[this.rMembers.length - 1]), (this.columnGrandTotal ? this.columnGrandTotal : this.cMembers[this.cMembers.length - 1])); /* eslint-disable-line */
        this.applyAdvancedAggregate(rowheads, colheads, this.pivotValues);
        this.isEngineUpdated = true;
        this.isEmptyDataAvail(this.rMembers, this.cMembers);
    }
    private getAxisByFieldName(fieldName: string): string {
        let axisCount: number = 0;
        let axis: string = '';
        while (axisCount < 4 && axis === '') {
            switch (axisCount) {
                case 0:
                    axis = this.getFieldByName(fieldName, this.rows) ? 'row' : '';
                    break;
                case 1:
                    axis = this.getFieldByName(fieldName, this.columns) ? 'column' : '';
                    break;
            }
            axisCount++;
        }
        return axis;
    }
    private getFieldByName(fieldName: string, fields: IFieldOptions[]): IFieldOptions {
        return new DataManager({ json: fields }).executeLocal(new Query().where('name', 'equal', fieldName))[0] as IFieldOptions;
    }

    private updateHeadersCount(
        headers: IAxisSet[], axis: string, position?: number, fields?: IFieldOptions[], action?: string, isDrill?: boolean): void {
        let lenCnt: number = 0;
        let field: IFieldOptions = fields[position];
        let showSubTotals: boolean = true;
        if (axis === 'column') {
            showSubTotals = this.showSubTotals && this.showColumnSubTotals && field ? field.showSubTotals : true;
        } else {
            showSubTotals = this.showSubTotals && this.showRowSubTotals && field ? field.showSubTotals : true;
        }
        while (lenCnt < headers.length) {
            if (axis === 'row') {
                this.rowCount = this.rowCount - (
                    action === 'plus' ? -(this.valueAxis === 1 ? this.values.length : 1) :
                        (this.valueAxis === 1 ? this.values.length : 1));
            } else {
                this.columnCount = this.columnCount - (
                    action === 'plus' ? -(this.valueAxis === 1 ? 1 : this.values.length) :
                        (this.valueAxis === 1 ? 1 : this.values.length));
            }
            if (headers[lenCnt].members.length > 0) {
                this.updateHeadersCount(headers[lenCnt].members, axis, position + 1, fields, action, true);
            }
            lenCnt++;
        }
        if (axis === 'column' && !showSubTotals && isDrill) {
            this.columnCount += action === 'plus' ? -this.colValuesLength : this.colValuesLength;
        }
    }
    /* eslint-disable */
    /** @hidden */
    public frameHeaderWithKeys(header: any): IAxisSet {
        let keys: string[] = Object.keys(header);
        let keyPos: number = 0;
        let framedHeader: any = {};
        while (keyPos < keys.length) {
            framedHeader[keys[keyPos]] = header[keys[keyPos]];
            keyPos++;
        }
        return framedHeader;
    }
    private getSortedHeaders(headers: IAxisSet[], sortOrder: string): IAxisSet[] {
        let isNotDateType: boolean = !(this.formatFields && this.formatFields[(headers[0].valueSort as any).axis] &&
            this.formatFields[(headers[0].valueSort as any).axis].type);
        let childrens: IField = this.fieldList[(headers[0].valueSort as any).axis];
        if (isNotDateType) {
            if (childrens && childrens.type == 'number' && headers.length > 0 && (typeof (headers[0].actualText) == 'string')) {
                let stringValue: IAxisSet[] = [];
                let alphaNumbervalue: IAxisSet[] = [];
                let nullValue: IAxisSet[] = [];
                for (let i: number = 0; i < headers.length; i++) {
                    if (isNaN(headers[i].actualText.toString().charAt(0) as any)) {
                        stringValue.push(headers[i]);
                    }
                    else if (headers[i].actualText === "") {
                        nullValue.push(headers[i]);
                    }
                    else {
                        alphaNumbervalue.push(headers[i]);
                    }
                }
                if (stringValue.length > 0) {
                    stringValue = childrens.sort === 'Ascending' ? (stringValue.sort((a, b) => (a.actualText > b.actualText) ? 1 : ((b.actualText > a.actualText) ? -1 : 0))) :
                        childrens.sort === 'Descending' ? (stringValue.sort((a, b) => (a.actualText < b.actualText) ? 1 : ((b.actualText < a.actualText) ? -1 : 0))) : stringValue;
                }
                if (alphaNumbervalue.length > 0) {
                    alphaNumbervalue = childrens.sort === 'Ascending' ?
                        (alphaNumbervalue.sort((a, b) => (Number(a.actualText.toString().match(/\d+/)[0]) > Number(b.actualText.toString().match(/\d+/)[0])) ? 1 : ((Number(b.actualText.toString().match(/\d+/)[0]) > Number(a.actualText.toString().match(/\d+/)[0])) ? -1 : 0))) :
                        childrens.sort === 'Descending' ?
                            (alphaNumbervalue.sort((a, b) => (Number(a.actualText.toString().match(/\d+/)[0]) < Number(b.actualText.toString().match(/\d+/)[0])) ? 1 : ((Number(b.actualText.toString().match(/\d+/)[0]) < Number(a.actualText.toString().match(/\d+/)[0])) ? -1 : 0))) :
                            alphaNumbervalue;
                }
                return headers = nullValue.concat(alphaNumbervalue, stringValue);
            }
            else {
                return sortOrder === 'Ascending' ?
                    (headers.sort(function (a, b) { return (a.actualText > b.actualText) ? 1 : ((b.actualText > a.actualText) ? -1 : 0); })) :
                    sortOrder === 'Descending' ?
                        (headers.sort(function (a, b) { return (a.actualText < b.actualText) ? 1 : ((b.actualText < a.actualText) ? -1 : 0); })) :
                        headers;
            }
        } else {
            return sortOrder === 'Ascending' ?
                (headers.sort((a, b) => (a.dateText > b.dateText) ? 1 : ((b.dateText > a.dateText) ? -1 : 0))) :
                sortOrder === 'Descending' ?
                    (headers.sort((a, b) => (a.dateText < b.dateText) ? 1 : ((b.dateText < a.dateText) ? -1 : 0))) :
                    headers;
        }
    }
    /** @hidden */
    public applyValueSorting(rMembers?: IAxisSet[], cMembers?: IAxisSet[]): ISortedHeaders {
        /* eslint-enable */
        let isNullArgument: boolean = false;
        if (rMembers === undefined || cMembers === undefined) {
            rMembers = this.rMembers;
            cMembers = this.cMembers;
            isNullArgument = true;
        }
        if (this.enableValueSorting && this.valueSortSettings.headerText &&
            this.valueSortSettings.headerText !== '' && this.values.length > 0) {
            let textArray: string[] = this.valueSortSettings.headerText.split(this.valueSortSettings.headerDelimiter);
            let hText: string = '';
            let mIndex: number;
            let mType: string;
            let caption: string;
            for (let i: number = 0; i < this.values.length; i++) {
                if (this.values[i].caption === textArray[textArray.length - 1]) {
                    caption = this.values[i].name;
                    break;
                } else {
                    caption = textArray[textArray.length - 1];
                }
            }
            if (((this.values.length === 1 && this.columns.length === 0) || this.values.length > 1) && caption && this.fieldList[caption]) {
                for (let i: number = 0; i < textArray.length - 1; i++) {
                    hText = hText === '' ? textArray[i] : (hText + this.valueSortSettings.headerDelimiter + textArray[i]);
                }
                mIndex = this.fieldList[caption].index;
                mType = this.fieldList[caption].aggregateType;
            } else {
                if (!this.alwaysShowValueHeader || textArray.length === 1) {
                    hText = this.valueSortSettings.headerText;
                } else {
                    for (let i: number = 0; i < textArray.length - 1; i++) {
                        hText = hText === '' ? textArray[i] : (hText + this.valueSortSettings.headerDelimiter + textArray[i]);
                    }
                }
                mIndex = this.fieldList[this.values[0].name].index;
                mType = this.fieldList[this.values[0].name].aggregateType;
            }
            let member: IAxisSet;
            if (this.valueAxis === 0) {
                member = this.getMember(cMembers, hText);
                if (member) {
                    rMembers = this.sortByValueRow(rMembers, member, this.valueSortSettings.sortOrder, mIndex, mType);
                }
            } else {
                member = this.getMember(rMembers, hText);
                if (member) {
                    cMembers = this.sortByValueRow(cMembers, member, this.valueSortSettings.sortOrder, mIndex, mType);
                }
            }
            if (isNullArgument) {
                this.rMembers = rMembers;
                this.cMembers = cMembers;
                if (this.pageSettings) {
                    this.headerCollection.rowHeaders = this.rMembers;
                    this.headerCollection.columnHeaders = this.cMembers;
                }
            }
        }
        return { rMembers: rMembers, cMembers: cMembers };
    }
    private getMember(cMembers: IAxisSet[], headerText: string): IAxisSet {
        let vlen: number = cMembers.length;
        let member: IAxisSet;
        for (let j: number = 0; j < vlen; j++) {
            if (cMembers[j].valueSort.levelName === headerText) {
                member = cMembers[j];
                break;
            } else if (cMembers[j].members.length > 0) {
                member = this.getMember(cMembers[j].members, headerText);
            }
            if (member) {
                return member;
            }
        }
        return member;
    }
    private sortByValueRow(rMembers: IAxisSet[], member: IAxisSet, sortOrder: Sorting, mIndex: number, mType: string): IAxisSet[] {
        let aggreColl: { 'header': IAxisSet; 'value'?: number }[] = [];
        for (let header of rMembers) {
            if (header.type === 'grand sum') {
                aggreColl.push({ 'header': header });
            } else {
                this.rawIndexObject = {};
                let value: number = this.getAggregateValue(header.index, member.indexObject, mIndex, mType);
                let cellDetails: AggregateEventArgs = {
                    fieldName: this.fields[mIndex],
                    row: header,
                    column: member,
                    value: value,
                    cellSets: this.getCellSet(this.rawIndexObject),
                    rowCellType: (header.hasChild && header.isDrilled ? 'subTotal' : header.type === 'grand sum' ? 'grandTotal' : 'value'),
                    columnCellType: (member.hasChild && member.isDrilled ? 'subTotal' : member.type === 'grand sum' ? 'grandTotal' : 'value'),
                    aggregateType: mType as SummaryTypes,
                    skipFormatting: false
                };
                if (this.getValueCellInfo) {
                    this.getValueCellInfo(cellDetails);
                }
                value = cellDetails.value;
                this.rawIndexObject = {};
                aggreColl.push({ 'header': header, 'value': value });
            }
        }
        /* eslint-disable */
        aggreColl.sort((a, b) => {
            return sortOrder === 'Descending' ?
                ((b['value'] || b['header']['type'] === 'grand sum' ?
                    b['value'] : 0) - (a['value'] || a['header']['type'] === 'grand sum' ? a['value'] : 0)) :
                ((a['value'] || a['header']['type'] === 'grand sum' ?
                    a['value'] : 0) - (b['value'] || b['header']['type'] === 'grand sum' ? b['value'] : 0));
        });
        rMembers = aggreColl.map((item) => { return item['header']; });
        for (let header of rMembers) {
            if (header.members.length > 0) {
                header.members = this.sortByValueRow(header.members, member, sortOrder, mIndex, mType);
            }
        }
        return rMembers;
        /* eslint-enable */
    }
    private insertAllMembersCommon(): void {
        this.rowGrandTotal = this.columnGrandTotal = null;
        let rowFlag: boolean = (this.showGrandTotals && this.showRowGrandTotals) ? true : (this.rows.length > 0) ? false : true;
        let columnFlag: boolean = (this.showGrandTotals && this.showColumnGrandTotals) ? true : (this.columns.length > 0) ? false : true;
        if (this.isValueHasAdvancedAggregate) {
            /* inserting the row grant-total members */
            this.insertAllMember(this.rMembers, this.filterMembers, '', 'row');
            if (rowFlag) {
                this.rowCount += this.rowValuesLength;
            }
            /* inserting the column gran-total members */
            this.insertAllMember(this.cMembers, this.filterMembers, '', 'column');
            if (columnFlag) {
                this.columnCount += this.colValuesLength;
            }
        } else {
            if (rowFlag) {
                /* inserting the row grant-total members */
                this.insertAllMember(this.rMembers, this.filterMembers, '', 'row');
                this.rowCount += this.rowValuesLength;
            } else {
                this.rowGrandTotal = this.insertAllMember([], this.filterMembers, '', 'row')[0];
            }
            if (columnFlag) {
                /* inserting the column gran-total members */
                this.insertAllMember(this.cMembers, this.filterMembers, '', 'column');
                this.columnCount += this.colValuesLength;
            } else {
                this.columnGrandTotal = this.insertAllMember([], this.filterMembers, '', 'column')[0];
            }
        }
    }
    private insertSubTotals(): void {
        let rowLength: number = this.pivotValues.length;
        for (let rowCnt: number = 0; rowCnt < rowLength; rowCnt++) {
            let rowCells: IAxisSet[] = this.pivotValues[rowCnt] as IAxisSet[];
            if (rowCells) {
                let savedCell: IAxisSet;
                let spanCnt: number = 1;
                let colLength: number = rowCells.length;
                /* eslint-disable */
                let indexObj: { index: number[]; indexObject: {} };
                /* eslint-enable */
                for (let colCnt: number = colLength - 1; colCnt > 0; colCnt--) {
                    let cell: IAxisSet = rowCells[colCnt] as IAxisSet;
                    if (cell) {
                        // if (cell.rowSpan > 1) {
                        //     cell.rowSpan = 1;
                        // }
                        if (savedCell) {
                            savedCell.colSpan = spanCnt;
                            savedCell.colIndex = savedCell.colIndex - (spanCnt - 1);
                        }
                        indexObj = { index: cell.index, indexObject: cell.indexObject };
                        cell.index = [];
                        cell.indexObject = {};
                        savedCell = extend({}, cell, null, true);
                        cell.index = indexObj.index;
                        cell.indexObject = indexObj.indexObject;
                        let rowPos: number = rowCnt + 1;
                        while (this.pivotValues[rowPos] && !this.pivotValues[rowPos][colCnt]) {
                            if (!(this.pivotValues[rowCnt][colCnt] as IAxisSet).isDrilled) {
                                (this.pivotValues[rowCnt][colCnt] as IAxisSet).rowSpan = (rowPos - rowCnt) + 1;
                                savedCell.rowSpan = (rowPos - rowCnt) + 1;
                            }
                            let cellType: string = (cell.type === 'sum' || cell.type === 'grand sum') ? cell.type : 'sum';
                            this.pivotValues[rowPos][colCnt] = this.headerContent[rowPos][colCnt] = {
                                type: cellType, formattedText:
                                    ((cell.type === 'sum' || cell.type === 'grand sum') ? cell.formattedText :
                                        (cell.formattedText + ' Total')),
                                axis: 'column', level: -1, colIndex: colCnt, rowIndex: rowPos, valueSort: cell.valueSort
                            };
                            if (cell.valueSort && cell.valueSort[this.valueSortSettings.headerText]) {
                                this.valueSortSettings.columnIndex = colCnt;
                            }
                            let isSpanned: boolean = false;
                            if (cellType === 'grand sum') {
                                (this.pivotValues[rowCnt][colCnt] as IAxisSet).rowSpan = (rowPos - rowCnt) + 1;
                                savedCell.rowSpan = (rowPos - rowCnt) + 1;
                            } else if ((this.pivotValues[rowCnt][colCnt] as IAxisSet).type !== 'sum' &&
                                (this.pivotValues[rowCnt][colCnt] as IAxisSet).isDrilled) {
                                (this.pivotValues[rowCnt + 1][colCnt] as IAxisSet).rowSpan = rowPos - rowCnt;
                                isSpanned = true;
                            } else {
                                (this.pivotValues[rowPos][colCnt] as IAxisSet).rowSpan = -1;
                            }
                            if (rowPos > (rowCnt + 1) && ((this.pivotValues[rowCnt][colCnt] as IAxisSet).type === 'sum' ||
                                isSpanned)) {
                                (this.pivotValues[rowPos][colCnt] as IAxisSet).rowSpan = -1;
                            }
                            rowPos++;
                        }
                        spanCnt = 1;
                    } else {
                        rowCells[colCnt] = this.headerContent[rowCnt][colCnt] = extend({}, savedCell, null, true);
                        rowCells[colCnt].index = this.headerContent[rowCnt][colCnt].index = indexObj.index;
                        rowCells[colCnt].indexObject = this.headerContent[rowCnt][colCnt].indexObject = indexObj.indexObject;
                        spanCnt++;
                        rowCells[colCnt].colSpan = spanCnt;
                        rowCells[colCnt].colIndex = rowCells[colCnt].colIndex - (spanCnt - 1);
                    }
                    if (colCnt === 1 && savedCell) {
                        savedCell.colSpan = spanCnt;
                        savedCell.colIndex = savedCell.colIndex - (spanCnt - 1);
                    }
                }
            }
        }
    }
    private frameDrillObject(): void {
        this.fieldDrillCollection = {};
        for (let fieldCnt: number = 0; fieldCnt < this.drilledMembers.length; fieldCnt++) {
            let drillOption: IDrillOptions = this.drilledMembers[fieldCnt];
            for (let memberCnt: number = 0; memberCnt < drillOption.items.length; memberCnt++) {
                let memberString: string = drillOption.name + this.valueSortSettings.headerDelimiter +
                    drillOption.items[memberCnt].split(drillOption.delimiter).join(this.valueSortSettings.headerDelimiter);
                this.fieldDrillCollection[memberString] = memberString;
            }
        }
    }
    /* eslint-disable */
    private getIndexedHeaders(
        keys: IFieldOptions[], data: IDataSet[] | string[][], keyInd?: number, position?: number[], axis?: string,
        parentMember?: string, valueFil?: boolean
    ): IAxisSet[] {
        let hierarchy: IAxisSet[] = [];
        if (keys) {
            let rlen: number = keys.length;
            let decisionObj: IIterator = {};
            let fieldName: string = keys[keyInd].name;
            let field: IFieldOptions = keys[keyInd];
            // let members: string[] = Object.keys(this.fieldList[field].members);
            let childrens: IField = this.fieldList[fieldName];
            if (isNullOrUndefined(this.reportDataType)) {
                this.reportDataType = {};
                for (let i: number = 0; i < this.dataSourceSettings.rows.length; i++) {
                    this.reportDataType[this.dataSourceSettings.rows[i].name] = this.dataSourceSettings.rows[i].dataType;
                }
                for (let i: number = 0; i < this.dataSourceSettings.columns.length; i++) {
                    this.reportDataType[this.dataSourceSettings.columns[i].name] = this.dataSourceSettings.columns[i].dataType;
                }
                for (let i: number = 0; i < this.dataSourceSettings.values.length; i++) {
                    this.reportDataType[this.dataSourceSettings.values[i].name] = this.dataSourceSettings.values[i].dataType;
                }
            }
            childrens.type = !isNullOrUndefined(this.reportDataType[childrens.id]) ? this.reportDataType[childrens.id] : childrens.type;
            let isNoData: boolean = false;
            let isDateType: boolean = (this.formatFields[fieldName] &&
                (['date', 'dateTime', 'time'].indexOf(this.formatFields[fieldName].type) > -1));
            let showNoDataItems: boolean = (position.length < 1 && keyInd > 0) || field.showNoDataItems;
            let savedMembers: IStringIndex = {};
            if (showNoDataItems) {
                let members: string[] = Object.keys(childrens.members);
                for (let pos: number = 0, lt: number = members.length; pos < lt; pos++) {
                    if (this.showHeaderWhenEmpty || (this.localeObj && members[pos] !== this.localeObj.getConstant('undefined'))) {
                        savedMembers[members[pos]] = members[pos];
                    }
                }
                if (position.length < 1) {
                    isNoData = true;
                    position.length = members.length;
                }
            }
            for (let pos: number = 0, lt: number = position.length; pos < lt; pos++) {
                let member: IAxisSet = {};
                if (!isNullOrUndefined(keys[keyInd].showSubTotals) && !keys[keyInd].showSubTotals) {
                    member.showSubTotals = false;
                }
                member.hasChild = keyInd < rlen - 1;
                member.level = keyInd;
                member.axis = axis;
                member.colSpan = 1;
                let memInd: number = isNoData ? childrens.members[Object.keys(savedMembers)[0]].ordinal :
                    this.indexMatrix[position[pos]][childrens.index];
                let headerValue: string = isNoData ? Object.keys(savedMembers)[0] :
                    (data as any)[position[pos]][this.fieldKeys[fieldName] as any] as string;
                if ((isNullOrUndefined(headerValue) || (this.localeObj && headerValue === this.localeObj.getConstant('undefined')))
                    && !this.showHeaderWhenEmpty) {
                    if (showNoDataItems && !isNoData && keyInd > 0 && pos + 1 === position.length &&
                        Object.keys(savedMembers).length > 0) {
                        lt = Object.keys(savedMembers).length;
                        isNoData = true;
                        pos = -1;
                    }
                    continue;
                }
                delete savedMembers[headerValue];
                if (showNoDataItems && this.fieldFilterMem[fieldName] &&
                    this.fieldFilterMem[fieldName].memberObj[headerValue] === headerValue) {
                    continue;
                }
                let formattedValue: IAxisSet = isDateType ? {
                    actualText: headerValue,
                    formattedText: childrens.dateMember[memInd - 1].formattedText,
                    dateText: childrens.dateMember[memInd - 1].actualText
                } :
                    {
                        formattedText: headerValue === null ? (this.localeObj ? this.localeObj.getConstant('null') : String(headerValue)) :
                            headerValue === undefined ? (this.localeObj ? (fieldName in this.groupingFields) ?
                                this.localeObj.getConstant('groupOutOfRange') : this.localeObj.getConstant('undefined') :
                                String(headerValue)) : String(headerValue), actualText: headerValue === null ? (this.localeObj ?
                                    this.localeObj.getConstant('null') : String(headerValue)) : headerValue === undefined ?
                                        (this.localeObj ? (fieldName in this.groupingFields) ?
                                            this.localeObj.getConstant('groupOutOfRange') : this.localeObj.getConstant('undefined') :
                                            String(headerValue)) : headerValue
                    };
                member.actualText = formattedValue.actualText;
                member.formattedText = formattedValue.formattedText;
                if (isDateType) {
                    member.dateText = formattedValue.dateText;
                }
                let availData: boolean = showNoDataItems ? (this.filterPosObj[position[pos]] !== undefined &&
                    !isNoData ? true : false) : true;
                //member.name = members[memInd];
                // member.type = member.hasChild ? 'All' : 'Single';
                let pindx: number[];
                if (!(decisionObj && decisionObj[memInd])) {
                    decisionObj[memInd] = { index: [], indexObject: {} };
                    member.index = decisionObj[memInd].index;
                    member.indexObject = decisionObj[memInd].indexObject;
                    if (availData) {
                        member.index = decisionObj[memInd].index = [position[pos]];
                        decisionObj[memInd].indexObject[position[pos]] = position[pos];
                        member.indexObject = decisionObj[memInd].indexObject;
                    }
                    member.ordinal = memInd;
                    member.valueSort = {};
                    member.valueSort.axis = fieldName;
                    if (keyInd !== 0) {
                        member.valueSort.levelName = parentMember + this.valueSortSettings.headerDelimiter + member.formattedText;
                        member.valueSort[parentMember + this.valueSortSettings.headerDelimiter + member.formattedText] = 1;
                    } else {
                        member.valueSort[member.formattedText] = 1;
                        member.valueSort.levelName = member.formattedText;
                    }
                    let memberString: string = member.valueSort.axis + this.valueSortSettings.headerDelimiter + member.valueSort.levelName;
                    member.isDrilled = (valueFil && this.isValueFiltersAvail) ?
                        true : (member.hasChild && this.fieldDrillCollection[memberString]) ?
                            this.isExpandAll ? false : true : childrens.members[headerValue].isDrilled;
                    //if (!member.members) {
                    member.members = [];
                    //}
                    //let copyObj: AxisSet = Object.create(member);
                    hierarchy.push(member);
                } else if (availData) {
                    decisionObj[memInd].index.push(position[pos]);
                    decisionObj[memInd].indexObject[position[pos]] = position[pos];
                }
                if (showNoDataItems && !isNoData && keyInd > 0 && pos + 1 === position.length &&
                    Object.keys(savedMembers).length > 0) {
                    isNoData = true;
                    lt = Object.keys(savedMembers).length;
                    pos = -1;
                }
            }
            for (let iln: number = 0, ilt: number = hierarchy.length; iln < ilt; iln++) {
                if (!this.frameHeaderObjectsCollection) {
                    if (axis === 'row') {
                        this.rowCount += this.rowValuesLength;
                    } else {
                        this.columnCount += this.colValuesLength;
                    }
                }
                let level: string = null;
                if (hierarchy[iln].valueSort && hierarchy[iln].valueSort.levelName) {
                    level = hierarchy[iln].valueSort.levelName as string;
                }
                parentMember = (level || hierarchy[iln].formattedText) as string;
                if (!this.showHeaderWhenEmpty && rlen - 1 > keyInd && hierarchy[iln].index &&
                    hierarchy[iln].index.length > 0) {
                    if (showNoDataItems && keys[keyInd + 1] && keys[keyInd + 1].name &&
                        Object.keys(this.fieldList[keys[keyInd + 1].name].members).length > 0) {
                        hierarchy[iln].hasChild = true;
                    } else {
                        let hIndLen: number = hierarchy[iln].index.length;
                        let count: number = 0;
                        for (let len: number = 0; len < hIndLen; len++) {
                            let headerValue: string =
                                (data as any)[hierarchy[iln].index[len]][this.fieldKeys[keys[keyInd + 1].name] as any] as string;
                            if ((isNullOrUndefined(headerValue) || (this.localeObj &&
                                headerValue === this.localeObj.getConstant('undefined')))) {
                                count++;
                            }
                        }
                        hierarchy[iln].hasChild = count !== hIndLen;
                    }
                }
                if (rlen - 1 > keyInd && hierarchy[iln].isDrilled) {
                    this.columnCount -= (!(this.showSubTotals && this.showColumnSubTotals && field.showSubTotals) && axis === 'column') ?
                        this.colValuesLength : 0;
                    let filterPosition: number[] = hierarchy[iln].index;
                    hierarchy[iln].members = this.getIndexedHeaders(keys, data, keyInd + 1,
                        (filterPosition === undefined ? [] : filterPosition), axis, parentMember);
                    if (this.frameHeaderObjectsCollection) {
                        this.headerObjectsCollection[parentMember] = hierarchy[iln].members;
                    }
                }
            }
            /* eslint-disable  */
            if (this.enableSort) {
                // return new DataManager(hierarchy as JSON[]).executeLocal(new Query().sortBy('actualText', childrens.sort.toLowerCase()));
                if (isDateType) {
                    return childrens.sort === 'Ascending' ?
                        (hierarchy.sort((a, b) => (a.dateText > b.dateText) ? 1 : ((b.dateText > a.dateText) ? -1 : 0))) :
                        childrens.sort === 'Descending' ?
                            (hierarchy.sort((a, b) => (a.dateText < b.dateText) ? 1 : ((b.dateText < a.dateText) ? -1 : 0))) :
                            hierarchy;
                } else {
                    if (childrens.type === 'number' && hierarchy.length > 0 && (typeof (hierarchy[0].actualText) === 'string')) {
                        let stringValue: IAxisSet[] = [];
                        let alphaNumbervalue: IAxisSet[] = [];
                        let nullValue: IAxisSet[] = [];
                        for (let i: number = 0; i < hierarchy.length; i++) {
                            if (isNaN(hierarchy[i].actualText.toString().charAt(0) as any)) {
                                stringValue.push(hierarchy[i]);
                            }
                            else if (hierarchy[i].actualText === "") {
                                nullValue.push(hierarchy[i]);
                            }
                            else {
                                alphaNumbervalue.push(hierarchy[i]);
                            }
                        }
                        if (stringValue.length > 0) {
                            stringValue = childrens.sort === 'Ascending' ? (stringValue.sort((a, b) => (a.actualText > b.actualText) ? 1 : ((b.actualText > a.actualText) ? -1 : 0))) :
                                childrens.sort === 'Descending' ? (stringValue.sort((a, b) => (a.actualText < b.actualText) ? 1 : ((b.actualText < a.actualText) ? -1 : 0))) : stringValue;
                        }
                        if (alphaNumbervalue.length > 0) {
                            alphaNumbervalue = childrens.sort === 'Ascending' ?
                                (alphaNumbervalue.sort((a, b) => (Number(a.actualText.toString().match(/\d+/)[0]) > Number(b.actualText.toString().match(/\d+/)[0])) ? 1 : ((Number(b.actualText.toString().match(/\d+/)[0]) > Number(a.actualText.toString().match(/\d+/)[0])) ? -1 : 0))) :
                                childrens.sort === 'Descending' ?
                                    (alphaNumbervalue.sort((a, b) => (Number(a.actualText.toString().match(/\d+/)[0]) < Number(b.actualText.toString().match(/\d+/)[0])) ? 1 : ((Number(b.actualText.toString().match(/\d+/)[0]) < Number(a.actualText.toString().match(/\d+/)[0])) ? -1 : 0))) :
                                    alphaNumbervalue;
                        }
                        return hierarchy = nullValue.concat(alphaNumbervalue, stringValue);
                    }
                    else {
                        return childrens.sort === 'Ascending' ?
                            (hierarchy.sort((a, b) => (a.actualText > b.actualText) ? 1 : ((b.actualText > a.actualText) ? -1 : 0))) :
                            childrens.sort === 'Descending' ?
                                (hierarchy.sort((a, b) => (a.actualText < b.actualText) ? 1 : ((b.actualText < a.actualText) ? -1 : 0))) :
                                hierarchy;
                    }
                }
            } else {
                return hierarchy;
            }
            /* eslint-enable  */
        } else {
            return hierarchy;
        }
    }
    private getOrderedIndex(headers: IAxisSet[]): { [key: number]: number } {
        let orderedIndex: { [key: number]: number } = {};
        for (let i: number = 0; i < headers.length; i++) {
            if (headers[i].type !== 'grand sum') {
                orderedIndex[headers[i].ordinal] = i;
            }
        }
        return orderedIndex;
    }
    /* eslint-disable , @typescript-eslint/no-explicit-any */
    private insertPosition(
        keys: IFieldOptions[], data: IDataSet[] | string[][], keyInd?: number, position?: number[], axis?: string,
        parentMember?: string, slicedHeaders?: IAxisSet[]
    ): IAxisSet[] {
        let hierarchy: IAxisSet[] = [];
        let orderedIndex: { [key: number]: number } = this.getOrderedIndex(slicedHeaders);
        if (keys) {
            let decisionObj: IIterator = {};
            let field: string = keys[keyInd].name;
            let childrens: IField = this.fieldList[field];
            for (let pos: number = 0, lt: number = position.length; pos < lt; pos++) {
                let member: IAxisSet = {};
                let memInd: number = this.indexMatrix[position[pos]][childrens.index];
                let slicedHeader: IAxisSet = slicedHeaders[orderedIndex[memInd]];
                let value: string = (data as any)[position[pos]][this.fieldKeys[field] as any];
                value = value === null ? (this.localeObj ? this.localeObj.getConstant('null') : String(value)) : value;
                let formattedValue: IAxisSet = (this.formatFields[field] &&
                    (['date', 'dateTime', 'time'].indexOf(this.formatFields[field].type) > -1)) ?
                    this.getFormattedValue(value as string, field) :
                    { formattedText: value.toString(), actualText: value.toString() };
                if (!(slicedHeader && slicedHeader.formattedText === formattedValue.formattedText)) {
                    continue;
                }
                if (!(decisionObj && decisionObj[memInd])) {
                    decisionObj[memInd] = { index: [], indexObject: {} };
                    slicedHeader.index = decisionObj[memInd].index = [position[pos]];
                    decisionObj[memInd].indexObject[position[pos]] = position[pos];
                    slicedHeader.indexObject = decisionObj[memInd].indexObject;
                    slicedHeader.valueSort = {};
                    slicedHeader.valueSort.axis = field;
                    if (keyInd !== 0) {
                        slicedHeader.valueSort.levelName = parentMember + this.valueSortSettings.headerDelimiter +
                            slicedHeader.formattedText;
                        slicedHeader.valueSort[parentMember + this.valueSortSettings.headerDelimiter +
                            slicedHeader.formattedText] = 1;
                    } else {
                        slicedHeader.valueSort[slicedHeader.formattedText] = 1;
                        slicedHeader.valueSort.levelName = slicedHeader.formattedText;
                    }
                    member.members = [];
                    hierarchy.push(member);
                } else {
                    decisionObj[memInd].index.push(position[pos]);
                    decisionObj[memInd].indexObject[position[pos]] = position[pos];
                }
            }
            let diff: number = slicedHeaders.length - hierarchy.length;
            while (diff > 0) {
                hierarchy.push({ members: [] });
                diff--;
            }
            for (let iln: number = 0, ilt: number = hierarchy.length; iln < ilt; iln++) {
                if (slicedHeaders[iln].members.length > 0) {
                    let level: string = null;
                    if (slicedHeaders[iln].valueSort && slicedHeaders[iln].valueSort.levelName) {
                        level = slicedHeaders[iln].valueSort.levelName as string;
                    }
                    parentMember = (level || slicedHeaders[iln].formattedText) as string;
                    hierarchy[iln].members =
                        this.insertPosition(keys, data, keyInd + 1, slicedHeaders[iln].index, axis, parentMember,
                            slicedHeaders[iln].members);
                }
            }
            return hierarchy;
        } else {
            return hierarchy;
        }
    }
    private insertTotalPosition(headers: IAxisSet[]): IAxisSet[] {
        let summCell: IAxisSet = headers[headers.length - 1];
        if (summCell && summCell.type === 'grand sum') {
            summCell.index = this.filterMembers;
            /* eslint-disable  */
            let lt: number;
            for (let ln: number = 0, lt = this.filterMembers.length; ln < lt; ln++) {
                summCell.indexObject[this.filterMembers[ln]] = this.filterMembers[ln];
            }
            /* eslint-enable  */
        }
        return headers;
    }
    private calculatePagingValues(): void {
        if (this.pageSettings) {
            if (this.valueAxis === 1) {
                this.rowValuesLength = this.values.length;
            } else {
                this.colValuesLength = this.values.length;
            }
            this.memberCnt = -this.rowValuesLength;
            this.rowStartPos = ((this.pageSettings.rowCurrentPage * this.pageSettings.rowSize) -
                (this.pageSettings.rowSize)) * this.rowValuesLength;
            let exactStartPos: number = (this.rowStartPos + (this.pageSettings.rowSize * 3 * this.rowValuesLength)) > this.rowCount ?
                (this.rowCount - (this.pageSettings.rowSize * 3 * this.rowValuesLength)) : this.rowStartPos;
            if (exactStartPos < 0) {
                exactStartPos = this.rowStartPos = 0;
                this.pageSettings.rowCurrentPage = 1;
            }
            this.rowFirstLvl = (this.rowStartPos - exactStartPos) % this.pageSettings.rowSize;
            this.rowStartPos = exactStartPos;
            this.endPos = this.rowStartPos + (this.pageSettings.rowSize * 3 * this.rowValuesLength);
            this.endPos = this.endPos > this.rowCount ? this.rowCount : this.endPos;
            this.rMembers = this.performSlicing(this.rMembers, [], this.rowStartPos, 'row');
            this.memberCnt = -this.colValuesLength; this.pageInLimit = false; this.colHdrBufferCalculated = false;
            this.colStartPos = ((this.pageSettings.columnCurrentPage * this.pageSettings.columnSize) -
                (this.pageSettings.columnSize)) * this.colValuesLength;
            exactStartPos = (this.colStartPos + (this.pageSettings.columnSize * 3 * this.colValuesLength)) >
                this.columnCount ?
                (this.columnCount - (this.pageSettings.columnSize * 3 * this.colValuesLength)) : this.colStartPos;
            if (exactStartPos < 0) {
                exactStartPos = this.colStartPos = 0;
                this.pageSettings.columnCurrentPage = 1;
            }
            this.colFirstLvl = (this.colStartPos - exactStartPos) % this.pageSettings.columnSize;
            this.colStartPos = exactStartPos;
            this.endPos = this.colStartPos + (this.pageSettings.columnSize * 3 * this.colValuesLength);
            this.endPos = this.endPos > this.columnCount ? this.columnCount : this.endPos;
            this.cMembers = this.performSlicing(this.cMembers, [], this.colStartPos, 'column');
            this.memberCnt = -1; this.pageInLimit = false;
            if (this.isValueHasAdvancedAggregate) {
                if (this.rMembers[this.rMembers.length - 1].type !== 'grand sum' &&
                    this.headerCollection.rowHeaders[this.headerCollection.rowHeaders.length - 1].type === 'grand sum') {
                    this.rMembers.push(this.headerCollection.rowHeaders[this.headerCollection.rowHeaders.length - 1]);
                    this.removeRowGrandTotal = true;
                }
                if (this.cMembers[this.cMembers.length - 1].type !== 'grand sum' &&
                    this.headerCollection.columnHeaders[this.headerCollection.columnHeaders.length - 1].type === 'grand sum') {
                    this.cMembers.push(this.headerCollection.columnHeaders[this.headerCollection.columnHeaders.length - 1]);
                    this.removeColumnGrandTotal = true;
                }
            } else {
                this.rowGrandTotal = this.rowGrandTotal ? this.rowGrandTotal :
                    this.headerCollection.rowHeaders[this.headerCollection.rowHeaders.length - 1];
                this.columnGrandTotal = this.columnGrandTotal ? this.columnGrandTotal :
                    this.headerCollection.columnHeaders[this.headerCollection.columnHeaders.length - 1];
            }
        }
    }
    private performSlicing(headers: IAxisSet[], slicedHeaders: IAxisSet[], startPos: number, axis: string): IAxisSet[] {
        let pos: number = 0;
        while (headers[pos]) {
            this.memberCnt += axis === 'column' ? this.colValuesLength : this.rowValuesLength;
            if (startPos <= this.memberCnt && this.endPos >= this.memberCnt && !this.pageInLimit) {
                if (axis === 'column') {
                    this.colFirstLvl = this.colFirstLvl + headers[pos].level;
                } else {
                    this.rowFirstLvl = this.rowFirstLvl + headers[pos].level;
                }
                this.pageInLimit = true;
            }
            if (this.pageInLimit) {
                if (this.endPos <= this.memberCnt) {
                    if (axis === 'column') {
                        if (headers[pos].members.length === 0) {
                            if (this.colHdrBufferCalculated) {
                                break;
                            }
                            this.colHdrBufferCalculated = true;
                            this.endPos += (headers[pos].level * this.colValuesLength);
                        } else if (this.colHdrBufferCalculated) {
                            break;
                        }
                    } else {
                        break;
                    }
                }
            }
            slicedHeaders.push(headers[pos].members.length > 0 ? this.removeChildMembers(headers[pos]) : headers[pos]);
            if (headers[pos].members.length > 0) {
                if (axis === 'column') {
                    /* eslint-disable @typescript-eslint/no-explicit-any */
                    this.memberCnt -= !(this.showSubTotals && this.showColumnSubTotals &&
                        this.columnKeys[(headers[pos].valueSort as any).axis].showSubTotals) ? this.colValuesLength : 0;
                    /* eslint-enable @typescript-eslint/no-explicit-any */
                }
                slicedHeaders[slicedHeaders.length - 1].members =
                    this.performSlicing(headers[pos].members, [], startPos, axis);
            }
            if (!this.pageInLimit) {
                slicedHeaders.pop();
            }
            if (headers[pos].level === 0 && this.pageInLimit && this.endPos <= this.memberCnt) {
                break;
            }
            pos++;
        }
        return slicedHeaders;
    }
    /* eslint-disable @typescript-eslint/no-explicit-any */
    private removeChildMembers(member: any): IAxisSet {
        let keys: string[] = Object.keys(member);
        let keyPos: number = 0;
        let framedMember: any = {};
        /* eslint-disable @typescript-eslint/dot-notation */
        while (keyPos < keys.length) {
            framedMember[keys[keyPos]] = member[keys[keyPos]];
            if (keys[keyPos] === 'members') {
                framedMember['members'] = [];
            }
            keyPos++;
        }
        /* eslint-enable @typescript-eslint/dot-notation */
        return framedMember;
    }
    private insertAllMember(set: IAxisSet[], filter: number[], customText?: string, axis?: string): IAxisSet[] {
        let len: number = set.length;
        customText = ' Total';
        set[len] = {
            hasChild: false,
            index: filter,
            level: 0,
            axis: axis,
            isDrilled: false,
            indexObject: {},
            members: [],
            formattedText: 'Grand' + customText,
            ordinal: len,
            type: 'grand sum',
            valueSort: {}
        };
        set[len].valueSort[set[len].formattedText] = 1;
        set[len].valueSort.levelName = set[len].formattedText;
        for (let ln: number = 0, lt: number = filter.length; ln < lt; ln++) {
            set[len].indexObject[filter[ln]] = filter[ln];
        }
        // if (axis === 'row') {
        //     this.rowCount += this.rowValuesLength;
        // } else {
        //     this.columnCount += this.colValuesLength;
        // }
        return set;
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
    private getTableData(rows: IAxisSet[], reformAxis: IAxisSet[], columns: IAxisSet[], tnum: number, data: IPivotValues, vlt: number, rTotal?: IAxisSet, cTotal?: IAxisSet): void {    /* eslint-disable-line */
        for (let rlt: number = rows.length, rln: number = 0; rln < rlt; rln++) {
            tnum = data.length;
            reformAxis[tnum] = rows[rln];
            let actCnt: number = tnum - Number(Object.keys(reformAxis)[0]);
            //let rplus: number = rln + 1;
            //let lvl: number = rows[rln].level;
            let isLeastNode: boolean = !reformAxis[tnum].members.length;
            rows[rln].colIndex = 0;
            rows[rln].rowIndex = tnum;
            if (!data[tnum]) {
                data[tnum] = [];
                this.valueContent[actCnt] = {} as IAxisSet[];
                //data[tnum][0] = rows[rln].name;
                data[tnum][0] = this.valueContent[actCnt][0] = this.frameHeaderWithKeys(rows[rln]);
            } else {
                // data[tnum][0] = rows[rln].name;
                data[tnum][0] = this.valueContent[actCnt][0] = this.frameHeaderWithKeys(rows[rln]);
            }
            if (this.valueAxis && (this.isMutiMeasures || this.alwaysShowValueHeader)) {
                let hpos: number = tnum;
                let actpos: number = actCnt;
                let rowIndex: number = tnum;
                if (!(rows[rln].hasChild && ((!isNullOrUndefined(rows[rln].showSubTotals) &&
                    !rows[rln].showSubTotals) || !this.showSubTotals || !this.showRowSubTotals))) {
                    for (let vln: number = 0; vln < vlt; vln++) {
                        tnum++;
                        actCnt++;
                        let name: string = this.values[vln].caption ? this.values[vln].caption : this.values[vln].name;
                        /* eslint-disable */
                        let calObj: Object = {
                            axis: 'row',
                            actualText: this.values[vln].name,
                            formattedText: name,
                            level: 0,
                            valueSort: {},
                            colIndex: 0,
                            rowIndex: tnum,
                            type: 'value'
                        };
                        /* eslint-enable */
                        if (!data[tnum]) {
                            data[tnum] = [];
                            this.valueContent[actCnt] = {} as IAxisSet[];
                            data[tnum][0] = this.valueContent[actCnt][0] = calObj;
                        }
                        let vData: IDataSet = (data[tnum][0] as IAxisSet).valueSort;
                        vData[(data[tnum - vln - 1][0] as IAxisSet).valueSort.levelName + this.valueSortSettings.headerDelimiter + name] = 1;   /* eslint-disable-line */
                        vData.levelName = (data[tnum - vln - 1][0] as IAxisSet).valueSort.levelName + this.valueSortSettings.headerDelimiter + name;    /* eslint-disable-line */
                        for (let cln: number = 0, dln: number = 1, clt: number = columns.length; cln < clt; ++cln) {
                            //for (let vln: number = 0; (!this.valueAxis && vln < vlt); vln++) {
                            this.updateRowData(rows, columns, tnum, data, vln, rln, cln, dln, actCnt, rTotal, cTotal);
                            dln = data[tnum].length;
                            data[hpos][dln - 1] = this.valueContent[actpos][dln - 1] = {
                                axis: 'value', actualText: '', colSpan: 1,
                                colIndex: dln, formattedText: '', hasChild: false
                            };
                            // }
                        }
                    }
                    rowIndex = tnum;
                } else {
                    for (let cln: number = 0, dln: number = 1, clt: number = columns.length; cln < clt; ++cln) {
                        dln = data[tnum].length;
                        data[hpos][dln] = this.valueContent[actpos][dln] = {
                            axis: 'value', actualText: '', colSpan: 1,
                            colIndex: dln, formattedText: '', hasChild: false
                        };
                    }
                    rowIndex = tnum + vlt;
                }
                this.recursiveRowData(rows, reformAxis, columns, rowIndex, data, vlt, isLeastNode, rln, vlt, rTotal, cTotal);
            } else {
                for (let cln: number = 0, dln: number = 1, clt: number = columns.length; cln < clt; ++cln) {
                    for (let vln: number = 0; vln < vlt; vln++) {
                        this.updateRowData(rows, columns, tnum, data, vln, rln, cln, dln, actCnt, rTotal, cTotal);
                        dln = data[tnum].length;
                    }
                }
                this.recursiveRowData(rows, reformAxis, columns, tnum, data, vlt, isLeastNode, rln, 0, rTotal, cTotal);
            }
        }
        /* for (let rlt: number = rows.length, rln: number = 0; rln < rlt; rln++) {
            if (!data[rln]) {
                data[rln] = [];
                data[rln][0] = rows[rln].name;
            } else {
                data[rln][0] = rows[rln].name;
            }
            for (let cln: number = 0, dln: number = 1, clt: number = columns.length; cln < clt; dln = ++cln) {
                data[rln][dln] = this.getAggregateValue(rows[rln].index, columns[cln].index, 11);
            }
        } */
    }
    private getAggregatedHeaders(rows: IFieldOptions[], columns: IFieldOptions[], rMembers: IAxisSet[], cMembers: IAxisSet[], values: IFieldOptions[]): void {  /* eslint-disable-line */
        this.selectedHeaders = { selectedHeader: [], values: [] };
        for (let vlt: number = values.length, vln: number = 0; vln < vlt; vln++) {
            switch (values[vln].type) {
                case 'DifferenceFrom':
                case 'PercentageOfDifferenceFrom':
                    {
                        let baseField: string;
                        let baseItem: string;
                        this.selectedHeaders.values.push(values[vln].name);
                        if (values[vln].baseField && values[vln].baseItem) {
                            baseField = values[vln].baseField;
                            baseItem = values[vln].baseItem;
                        } else if (this.valueAxis && (this.isMutiMeasures || this.alwaysShowValueHeader) && columns.length > 0) {
                            baseField = columns[0].name;
                            baseItem = Object.keys(this.fieldList[columns[0].name].members)[0];
                        } else if (rows.length > 0) {
                            baseField = rows[0].name;
                            baseItem = Object.keys(this.fieldList[rows[0].name].members)[0];
                        }
                        let isHeaderSelected: boolean = false;
                        for (let row of rows) {
                            if (row.name === baseField) {
                                this.getAggregatedHeaderData(rMembers, values[vln].name, baseItem, false, 'row', values[vln].type, this.selectedHeaders.selectedHeader, vln);
                                isHeaderSelected = true;
                                break;
                            }
                        }
                        if (!isHeaderSelected) {
                            for (let column of columns) {
                                if (column.name === baseField) {
                                    this.getAggregatedHeaderData(cMembers, values[vln].name, baseItem, false, 'column', values[vln].type, this.selectedHeaders.selectedHeader, vln);
                                    break;
                                }
                            }
                        }
                    }
                    break;
                case 'PercentageOfParentRowTotal':
                case 'PercentageOfParentColumnTotal':
                    {
                        this.selectedHeaders.values.push(values[vln].name);
                        this.getAggregatedHeaderData((values[vln].type === 'PercentageOfParentRowTotal' ? rMembers : cMembers), values[vln].name, undefined, false, (values[vln].type === 'PercentageOfParentRowTotal' ? 'row' : 'column'), values[vln].type, this.selectedHeaders.selectedHeader, vln);
                    }
                    break;
                case 'RunningTotals':
                    {
                        this.selectedHeaders.values.push(values[vln].name);
                        this.getAggregatedHeaderData((this.valueAxis && (this.isMutiMeasures || this.alwaysShowValueHeader) ? cMembers : rMembers), values[vln].name, undefined, false, (this.valueAxis && (this.isMutiMeasures || this.alwaysShowValueHeader) ? 'column' : 'row'), values[vln].type, this.selectedHeaders.selectedHeader, vln);
                    }
                    break;
                case 'PercentageOfParentTotal':
                    {
                        let baseField: string;
                        this.selectedHeaders.values.push(values[vln].name);
                        if (values[vln].baseField) {
                            baseField = values[vln].baseField;
                        } else if (this.valueAxis && (this.isMutiMeasures || this.alwaysShowValueHeader) && columns.length > 0) {
                            baseField = columns[0].name;
                        } else if (rows.length > 0) {
                            baseField = rows[0].name;
                        }
                        let isHeaderSelected: boolean = false;
                        for (let len: number = rows.length, i: number = 0; i < len; i++) {
                            if (rows[i].name === baseField) {
                                this.getAggregatedHeaderData(rMembers, values[vln].name, undefined, false, 'row', values[vln].type, this.selectedHeaders.selectedHeader, vln, i);
                                isHeaderSelected = true;
                                break;
                            }
                        }
                        if (!isHeaderSelected) {
                            for (let len: number = columns.length, i: number = 0; i < len; i++) {
                                if (columns[i].name === baseField) {
                                    this.getAggregatedHeaderData(cMembers, values[vln].name, undefined, false, 'column', values[vln].type, this.selectedHeaders.selectedHeader, vln, i);
                                    break;
                                }
                            }
                        }
                    }
                    break;
            }
        }
    }
    private getAggregatedHeaderData(headers: IAxisSet[], name: string, baseItem: string, isChildren: boolean, type: string, aggregateType: SummaryTypes, selectedHeaders: IHeaderData[], vln: number, level?: number): void {   /* eslint-disable-line */
        for (let rln of headers) {
            switch (aggregateType) {
                case 'DifferenceFrom':
                case 'PercentageOfDifferenceFrom':
                    {
                        let levelName: string[] = rln.valueSort.levelName.toString().split(this.valueSortSettings.headerDelimiter);
                        if (levelName.indexOf(baseItem) !== -1) {
                            selectedHeaders.push(this.updateSelectedHeaders(baseItem, rln.level, type, isChildren, name, aggregateType, rln.valueSort.levelName as string, (isChildren ? [rln] : headers), vln + 1));   /* eslint-disable-line */
                            if (rln.members.length > 0) {
                                this.getAggregatedHeaderData(rln.members, name, baseItem, true, type, aggregateType, selectedHeaders[selectedHeaders.length - 1].childMembers, vln);    /* eslint-disable-line */
                            }
                        } else if (rln.members.length > 0) {
                            this.getAggregatedHeaderData(rln.members, name, baseItem, false, type, aggregateType, selectedHeaders, vln);
                        }
                    }
                    break;
                case 'RunningTotals':
                case 'PercentageOfParentRowTotal':
                case 'PercentageOfParentColumnTotal':
                    {
                        if (rln.type === 'grand sum') {
                            selectedHeaders.push(this.updateSelectedHeaders(undefined, rln.level, type, false, name, aggregateType, rln.valueSort.levelName as string, headers, vln + 1));  /* eslint-disable-line */
                        } else {
                            if (rln.members.length > 0) {
                                selectedHeaders.push(this.updateSelectedHeaders(undefined, rln.level, type, false, name, aggregateType, rln.valueSort.levelName as string, rln.members, vln + 1));  /* eslint-disable-line */
                                this.getAggregatedHeaderData(rln.members, name, undefined, false, type, aggregateType, selectedHeaders, vln);   /* eslint-disable-line */
                            }
                        }
                    }
                    break;
                case 'PercentageOfParentTotal':
                    {
                        if (rln.type !== 'grand sum') {
                            if (rln.level === level) {
                                if (rln.members.length > 0) {
                                    if (isChildren) {
                                        let aggregateHeaders: IAxisSet[] = selectedHeaders[selectedHeaders.length - 1].aggregateHeaders;
                                        for (let member of rln.members) {
                                            aggregateHeaders.push(member);
                                        }
                                    } else {
                                        let children: IAxisSet[] = extend([], rln.members, null, true) as IAxisSet[];
                                        selectedHeaders.push(this.updateSelectedHeaders(undefined, rln.level, type, false, name, aggregateType, rln.valueSort.levelName as string, children, vln + 1)); /* eslint-disable-line */
                                        let aggregateHeaders: IAxisSet[] = selectedHeaders[selectedHeaders.length - 1].aggregateHeaders;
                                        aggregateHeaders.push(rln);
                                    }
                                    this.getAggregatedHeaderData(rln.members, name, undefined, true, type, aggregateType, selectedHeaders, vln, level + 1); /* eslint-disable-line */
                                } else {
                                    if (!isChildren) {
                                        selectedHeaders.push(this.updateSelectedHeaders(undefined, rln.level, type, false, name, aggregateType, rln.valueSort.levelName as string, [rln], vln + 1));    /* eslint-disable-line */
                                    }
                                }
                            } else if (rln.members.length > 0) {
                                this.getAggregatedHeaderData(rln.members, name, undefined, false, type, aggregateType, selectedHeaders, vln, level);    /* eslint-disable-line */
                            }
                        }
                    }
                    break;
            }

        }
    }
    private updateSelectedHeaders(baseItem: string, level: number, type: string, isChildren: boolean, name: string, aggregateType: SummaryTypes, levelName: string, headers: IAxisSet[], vCount: number): IHeaderData { /* eslint-disable-line */
        let headerData: IHeaderData = {
            name: baseItem,
            level: level,
            axis: type,
            isChild: isChildren,
            value: name,
            type: aggregateType,
            uniqueName: levelName,
            aggregateHeaders: headers,
            childMembers: [],
            valueCount: vCount
        };
        return headerData;
    }
    private applyAdvancedAggregate(rowheads: IAxisSet[], colheads: IAxisSet[], data: IPivotValues): void {
        this.aggregatedValueMatrix = [];
        if (this.selectedHeaders.values.length > 0) {
            let pivotIndex: { [key: string]: [number, number] } = {};
            let colIndex: number[] = [];
            let isIndexFilled: boolean = false;
            for (let rlt: number = data.length, rln: number = 0; rln < rlt; rln++) {
                if (data[rln] !== undefined && data[rln][0] !== undefined) {
                    if (!isIndexFilled) {
                        for (let clt: number = (data[rln] as IPivotValues[]).length, cln: number = 0; cln < clt; cln++) {
                            if ((data[rln][cln] as IAxisSet).axis === 'value' &&
                                this.selectedHeaders.values.indexOf((data[rln][cln] as IAxisSet).actualText as string) !== -1) {
                                colIndex.push(cln);
                                isIndexFilled = true;
                            }
                        }
                    }
                    if (colIndex.length > 0 && (data[rln][colIndex[0]] as IAxisSet).axis === 'value' &&
                        this.selectedHeaders.values.indexOf((data[rln][colIndex[0]] as IAxisSet).actualText as string) !== -1) {
                        for (let index of colIndex) {
                            pivotIndex[rln + ',' + index] = [rln, index];
                        }
                    }
                }
            }
            this.updateAggregates(rowheads, colheads, data, this.selectedHeaders.selectedHeader, colIndex, pivotIndex);
            let indexCollection: string[] = Object.keys(pivotIndex);
            for (let index of indexCollection) {
                let currentSet: IAxisSet = data[pivotIndex[index][0]][pivotIndex[index][1]] as IAxisSet;
                // currentSet.formattedText = '0';
                currentSet.formattedText = (this.selectedHeaders.selectedHeader.length > 0 ? this.emptyCellTextContent : '#N/A');
                if (!this.aggregatedValueMatrix[pivotIndex[index][0]]) {
                    this.aggregatedValueMatrix[pivotIndex[index][0]] = [];
                }
                this.aggregatedValueMatrix[pivotIndex[index][0]][pivotIndex[index][1]] = 0;
            }
            this.updatePivotValues(true);
        } else {
            return;
        }
    }
    /* eslint-disable  */
    private updateAggregates(rowheads: IAxisSet[], colheads: IAxisSet[], data: IPivotValues, selectedHeaders: IHeaderData[],
        colIndex: number[], pivotIndex: { [key: string]: [number, number] }): void {
        for (let headers of selectedHeaders) {
            let selectedHeaderCollection: IAxisSet[] = headers.aggregateHeaders;
            let name: string = headers.value;
            let valueCount: number = (this.valueAxis && (this.isMutiMeasures || this.alwaysShowValueHeader) ? headers.valueCount : 0);
            let aggregateType: SummaryTypes = headers.type;
            let uniqueName: string = headers.uniqueName;
            let axis: string = headers.axis;
            let isRowBaseField: boolean = axis === 'row' ? true : false;
            let activeValues: IAxisSet;
            let indexCollection: [number, number][] = [];
            let activeColumn: IAxisSet[] = [];
            let columnHeaders: IAxisSet[] = [];
            let rowindexCollection: number[] = [];
            let selectedRowValues: IAxisSet[] = [];
            let selectedColumnValues: ISelectedValues = [];
            if ((['DifferenceFrom', 'PercentageOfDifferenceFrom', 'PercentageOfParentRowTotal', 'PercentageOfParentColumnTotal', 'PercentageOfParentTotal', 'RunningTotals']).indexOf(headers.type) !== -1) {
                if (isRowBaseField) {
                    if (headers.type !== 'RunningTotals') {
                        for (let rlt: number = rowheads.length, rln: number = 0; rln < rlt; rln++) {
                            if (rowheads[rln] !== undefined) {
                                if (rowheads[rln].valueSort[uniqueName]) {
                                    activeValues = rowheads[rln];
                                    if (this.valueAxis === 0 || (this.valueAxis && data[rln + valueCount] &&
                                        (data[rln + valueCount][0] as IAxisSet).actualText === name)) {
                                        selectedRowValues = data[rln + valueCount] as IAxisSet[];
                                    } else {
                                        selectedRowValues = [];
                                    }
                                    break;
                                }
                            }
                        }
                    }
                } else {
                    for (let len: number = data.length, i: number = 0; i < len; i++) {
                        if (data[i] !== undefined && data[i][0] === undefined) {
                            columnHeaders.push(data[i] as IAxisSet);
                        } else {
                            break;
                        }
                    }
                    let len: number = columnHeaders.length;
                    while (len--) {
                        let axisObj: IAxisSet = (columnHeaders[len] as IAxisSet[])[colIndex[0]];
                        let cLevelName: string = axisObj.actualText as string;
                        if (this.selectedHeaders.values.indexOf(cLevelName) === -1) {
                            activeColumn = columnHeaders[len] as IAxisSet[];
                            len = 0;
                        }
                    }
                    if (headers.type !== 'RunningTotals') {
                        for (let clt: number = activeColumn.length, cln: number = 0; cln < clt; cln++) {
                            let isSelectedColumn: boolean = false;
                            if (activeColumn[cln] !== undefined && activeColumn[cln].valueSort[uniqueName]) {
                                activeValues = activeColumn[cln];
                                for (let len: number = data.length, i: number = 0; i < len; i++) {
                                    let axisObj: IAxisSet[] = (data[i] as IAxisSet[]);
                                    if (axisObj !== undefined && axisObj[0] !== undefined &&
                                        (axisObj[cln] as IAxisSet).axis === 'value' &&
                                        this.selectedHeaders.values.indexOf((axisObj[cln] as IAxisSet).actualText as string) !== -1) {
                                        isSelectedColumn = true;
                                        selectedColumnValues[i] = axisObj[cln] as IAxisSet;
                                        rowindexCollection.push(i);
                                    }
                                }
                                if (isSelectedColumn) { break; }
                            }
                        }
                        if ((selectedColumnValues as []).length === 0 && rowindexCollection.length === 0) {
                            for (let clt: number = activeColumn.length, cln: number = 0; cln < clt; cln++) {
                                let isSelectedColumn: boolean = false;
                                if (activeColumn[cln] !== undefined && (activeColumn[cln].valueSort.levelName as string).indexOf(uniqueName) === 0) {
                                    activeValues = activeColumn[cln];
                                    for (let lnt: number = data.length, j: number = 0; j < lnt; j++) {
                                        let axisObj: IAxisSet[] = (data[j] as IAxisSet[]);
                                        if (axisObj !== undefined && axisObj[0] !== undefined &&
                                            (axisObj[cln] as IAxisSet).axis === 'value' &&
                                            this.selectedHeaders.values.indexOf((axisObj[cln] as IAxisSet).actualText as string) !== -1) {
                                            isSelectedColumn = true;
                                            // selectedColumnValues[i] = axisObj[cln] as IAxisSet;
                                            rowindexCollection.push(j);
                                        }
                                    }
                                    if (isSelectedColumn) { break; }
                                }
                            }
                        }
                    }
                }
            }
            switch (headers.type) {
                case 'DifferenceFrom':
                case 'PercentageOfDifferenceFrom':
                    {
                        let isChildren: boolean = headers.isChild;
                        if (isRowBaseField) {
                            if (!isChildren) {
                                for (let item of selectedHeaderCollection) {
                                    for (let rlt: number = rowheads.length, rln: number = 0; rln < rlt; rln++) {
                                        if (rowheads[rln] !== undefined) {
                                            if (rowheads[rln].valueSort[item.valueSort.levelName as string] &&
                                                rowheads[rln].level === activeValues.level && rowheads[rln].type !== 'grand sum') {
                                                for (let index of colIndex) {
                                                    let currentSet: IAxisSet = data[rln + valueCount][index] as IAxisSet;
                                                    if (currentSet.axis === 'value' && currentSet.actualText === name) {
                                                        indexCollection.push([rln + valueCount, index]);
                                                        if (pivotIndex[rln + valueCount + ',' + index]) {
                                                            delete pivotIndex[rln + valueCount + ',' + index];
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            } else {
                                let uniqueLevelName: string[] = uniqueName.split(this.valueSortSettings.headerDelimiter);
                                for (let rlt: number = rowheads.length, rlen: number = 0; rlen < rlt; rlen++) {
                                    if (rowheads[rlen] !== undefined) {
                                        let levelName: string[] = (rowheads[rlen].valueSort.levelName as string).split(this.valueSortSettings.headerDelimiter);
                                        if (levelName.indexOf(uniqueLevelName[uniqueLevelName.length - 1]) !== -1 &&
                                            rowheads[rlen].level === activeValues.level) {
                                            for (let index of colIndex) {
                                                let currentSet: IAxisSet = data[rlen + valueCount][index] as IAxisSet;
                                                if (currentSet.axis === 'value' && currentSet.actualText === name) {
                                                    indexCollection.push([rlen + valueCount, index]);
                                                    if (pivotIndex[rlen + valueCount + ',' + index]) {
                                                        delete pivotIndex[rlen + valueCount + ',' + index];
                                                    }
                                                }
                                            }
                                        }

                                    }
                                }
                            }
                            for (let index of indexCollection) {
                                let currentSet: IAxisSet = data[index[0]][index[1]] as IAxisSet;
                                // let cVal: number = currentSet.value - (selectedRowValues[index[1]] as IAxisSet).value;
                                let cVal: number = currentSet.actualValue - (selectedRowValues[index[1]] as IAxisSet).actualValue;
                                cVal = isNaN(cVal) ? 0 : (currentSet.value === 0 && (selectedRowValues[index[1]] as IAxisSet).value === 0) ? 0 : cVal;
                                if (!this.aggregatedValueMatrix[index[0]]) {
                                    this.aggregatedValueMatrix[index[0]] = [];
                                }
                                if (aggregateType === 'DifferenceFrom') {
                                    this.aggregatedValueMatrix[index[0]][index[1]] = cVal;
                                    currentSet.formattedText = cVal === 0 ? this.emptyCellTextContent : this.getFormattedValue(cVal, name).formattedText;
                                } else {
                                    // cVal = ((selectedRowValues[index[1]] as IAxisSet).value === 0 ?
                                    // 0 : (cVal / (selectedRowValues[index[1]] as IAxisSet).value));
                                    cVal = ((selectedRowValues[index[1]] as IAxisSet).actualValue === 0 ?
                                        0 : (cVal / (selectedRowValues[index[1]] as IAxisSet).actualValue));
                                    this.aggregatedValueMatrix[index[0]][index[1]] = cVal;
                                    currentSet.formattedText = currentSet.showSubTotals ? (cVal !== 0 ? this.globalize.formatNumber(cVal, { format: 'P', maximumFractionDigits: this.getPercentFormat(this.formatFields, currentSet.actualText as string) }) : this.emptyCellTextContent) : currentSet.formattedText;
                                }
                            }
                        } else {
                            if (!isChildren) {
                                for (let item of selectedHeaderCollection) {
                                    for (let clt: number = activeColumn.length, cln: number = 0; cln < clt; cln++) {
                                        let isSelectedColumn: boolean = false;
                                        if (activeColumn[cln] !== undefined &&
                                            activeColumn[cln].valueSort[item.valueSort.levelName as string] &&
                                            activeColumn[cln].level === activeValues.level && activeColumn[cln].type !== 'grand sum') {
                                            for (let index of rowindexCollection) {
                                                let currentSet: IAxisSet = data[index][cln] as IAxisSet;
                                                if (currentSet.axis === 'value' && currentSet.actualText === name) {
                                                    isSelectedColumn = true;
                                                    indexCollection.push([index, cln]);
                                                    if (pivotIndex[index + ',' + cln]) {
                                                        delete pivotIndex[index + ',' + cln];
                                                    }
                                                }
                                            }
                                            if (isSelectedColumn) { break; }
                                        }
                                    }
                                }
                            } else {
                                let uniqueLevelName: string[] = uniqueName.split(this.valueSortSettings.headerDelimiter);
                                for (let clt: number = activeColumn.length, clen: number = 0; clen < clt; clen++) {
                                    let isSelectedColumn: boolean = false;
                                    if (activeColumn[clen] !== undefined) {
                                        let levelName: string[] = (activeColumn[clen].valueSort.levelName as string).split(this.valueSortSettings.headerDelimiter);
                                        if (levelName.indexOf(uniqueLevelName[uniqueLevelName.length - 1]) !== -1 &&
                                            activeColumn[clen].level === activeValues.level) {
                                            for (let index of rowindexCollection) {
                                                let currentSet: IAxisSet = data[index][clen] as IAxisSet;
                                                if (currentSet.axis === 'value' && currentSet.actualText === name) {
                                                    isSelectedColumn = true;
                                                    indexCollection.push([index, clen]);
                                                    if (pivotIndex[index + ',' + clen]) {
                                                        delete pivotIndex[index + ',' + clen];
                                                    }
                                                }
                                            }
                                            if (isSelectedColumn) { break; }
                                        }
                                    }
                                }
                            }
                            let selectedColumn: IAxisSet;
                            if ((selectedColumnValues as []).length === 0) {
                                selectedColumn = this.getSelectedColumn(headers.uniqueName, colheads);
                            }
                            for (let index of indexCollection) {
                                let currentSet: IAxisSet = data[index[0]][index[1]] as IAxisSet;
                                let selectedColumnValue: number = 0;
                                if ((selectedColumnValues as []).length === 0) {
                                    let selectedRow: IAxisSet = this.getSelectedRow(currentSet.rowHeaders as string, rowheads);
                                    selectedColumnValue = this.getAggregateValue(selectedRow.index, selectedColumn.indexObject, this.fieldList[name].index, headers.type);
                                } else {
                                    selectedColumnValue = (selectedColumnValues[index[0]] as IAxisSet).value;
                                }
                                let cVal: number = currentSet.value - selectedColumnValue;
                                cVal = isNaN(cVal) ? 0 : cVal;
                                if (!this.aggregatedValueMatrix[index[0]]) {
                                    this.aggregatedValueMatrix[index[0]] = [];
                                }
                                if (aggregateType === 'DifferenceFrom') {
                                    currentSet.formattedText = cVal === 0 ? this.emptyCellTextContent : this.getFormattedValue(cVal, name).formattedText;
                                    this.aggregatedValueMatrix[index[0]][index[1]] = cVal;
                                } else {
                                    cVal = ((selectedColumnValues[index[0]] as IAxisSet).value === 0 ?
                                        0 : (cVal / (selectedColumnValues[index[0]] as IAxisSet).value));
                                    currentSet.formattedText = (cVal !== 0 ? this.globalize.formatNumber(cVal, { format: 'P', maximumFractionDigits: this.getPercentFormat(this.formatFields, currentSet.actualText as string) }) : this.emptyCellTextContent);
                                    this.aggregatedValueMatrix[index[0]][index[1]] = cVal;
                                }
                            }
                        }
                        if (headers.childMembers.length > 0) {
                            this.updateAggregates(rowheads, colheads, data, headers.childMembers, colIndex, pivotIndex);
                        }
                    }
                    break;
                case 'PercentageOfParentRowTotal':
                case 'PercentageOfParentColumnTotal':
                case 'PercentageOfParentTotal':
                    {
                        if (isRowBaseField) {
                            for (let item of selectedHeaderCollection) {
                                for (let rlt: number = rowheads.length, i: number = 0; i < rlt; i++) {
                                    if (rowheads[i] !== undefined) {
                                        if (rowheads[i].valueSort[item.valueSort.levelName as string] &&
                                            rowheads[i].level === item.level) {
                                            for (let index of colIndex) {
                                                let currentSet: IAxisSet = data[i + valueCount][index] as IAxisSet;
                                                if (currentSet.axis === 'value' && currentSet.actualText === name) {
                                                    indexCollection.push([i + valueCount, index]);
                                                    if (pivotIndex[i + valueCount + ',' + index]) {
                                                        delete pivotIndex[i + valueCount + ',' + index];
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            for (let i of indexCollection) {
                                let currentSet: IAxisSet = data[i[0]][i[1]] as IAxisSet;
                                // let cVal: number = currentSet.value / (selectedRowValues[i[1]] as IAxisSet).value;
                                let selectedRowValue: number = 0;
                                if (selectedRowValues.length === 0 && activeValues) {
                                    selectedRowValue = this.getAggregateValue(activeValues.index, colheads[i[1] - 1].indexObject, this.fieldList[name].index, headers.type);
                                } else {
                                    selectedRowValue = (selectedRowValues[i[1]] as IAxisSet).actualValue;
                                }
                                let cVal: number = currentSet.value / selectedRowValue;
                                cVal = isNaN(cVal) ? 0 : cVal;
                                currentSet.formattedText = currentSet.showSubTotals ? (cVal !== 0 ? this.globalize.formatNumber(cVal, { format: 'P', maximumFractionDigits: this.getPercentFormat(this.formatFields, currentSet.actualText as string) }) : this.emptyCellTextContent) : currentSet.formattedText;
                                if (!this.aggregatedValueMatrix[i[0]]) {
                                    this.aggregatedValueMatrix[i[0]] = [];
                                }
                                this.aggregatedValueMatrix[i[0]][i[1]] = cVal;
                            }
                        } else {
                            for (let item of selectedHeaderCollection) {
                                for (let clt: number = activeColumn.length, j: number = 0; j < clt; j++) {
                                    let isSelectedColumn: boolean = false;
                                    if (activeColumn[j] !== undefined &&
                                        activeColumn[j].valueSort[item.valueSort.levelName as string]) {
                                        for (let index of rowindexCollection) {
                                            let currentSet: IAxisSet = data[index][j] as IAxisSet;
                                            if (currentSet.axis === 'value' && currentSet.actualText === name) {
                                                isSelectedColumn = true;
                                                indexCollection.push([index, j]);
                                                if (pivotIndex[index + ',' + j]) {
                                                    delete pivotIndex[index + ',' + j];
                                                }
                                            }
                                        }
                                        if (isSelectedColumn) { break; }
                                    }
                                }
                            }
                            let selectedCol: IAxisSet;
                            if ((selectedColumnValues as []).length === 0) {
                                selectedCol = this.getSelectedColumn(headers.uniqueName, colheads);
                            }
                            for (let i of indexCollection) {
                                let currentSet: IAxisSet = data[i[0]][i[1]] as IAxisSet;
                                let selectedColValue: number = 0;
                                if ((selectedColumnValues as []).length === 0) {
                                    let selectedRow: IAxisSet = this.getSelectedRow(currentSet.rowHeaders as string, rowheads);
                                    selectedColValue = this.getAggregateValue(selectedRow.index, selectedCol.indexObject, this.fieldList[name].index, headers.type);
                                } else {
                                    selectedColValue = (selectedColumnValues[i[0]] as IAxisSet).value;
                                }
                                let val: number = currentSet.value / selectedColValue;
                                val = isNaN(val) ? 0 : val;
                                currentSet.formattedText = (val !== 0 ? this.globalize.formatNumber(val, { format: 'P', maximumFractionDigits: this.getPercentFormat(this.formatFields, currentSet.actualText as string) }) : this.emptyCellTextContent);
                                if (!this.aggregatedValueMatrix[i[0]]) {
                                    this.aggregatedValueMatrix[i[0]] = [];
                                }
                                this.aggregatedValueMatrix[i[0]][i[1]] = val;
                            }
                        }
                    }
                    break;
                case 'RunningTotals':
                    {
                        if (isRowBaseField) {
                            for (let index of colIndex) {
                                let cVal: number = 0;
                                for (let item of selectedHeaderCollection) {
                                    for (let rlt: number = rowheads.length, rlen: number = 0; rlen < rlt; rlen++) {
                                        if (rowheads[rlen] !== undefined) {
                                            let currentSet: IAxisSet = data[rlen + valueCount][index] as IAxisSet;
                                            if (rowheads[rlen] !== undefined && rowheads[rlen].valueSort[item.valueSort.levelName as string] &&
                                                rowheads[rlen].level === item.level && currentSet.axis === 'value' &&
                                                currentSet.actualText === name) {
                                                if (rowheads[rlen].type !== 'grand sum') {
                                                    cVal += (!currentSet.showSubTotals && !(!isNullOrUndefined(currentSet.actualValue) && isNaN(currentSet.actualValue))) ? currentSet.actualValue : currentSet.value;
                                                    currentSet.formattedText = currentSet.showSubTotals ? (cVal === 0 && (currentSet.actualValue && currentSet.actualValue !== 0) ? '' : this.getFormattedValue(cVal, name).formattedText) : currentSet.formattedText;
                                                    if (!this.aggregatedValueMatrix[rlen + valueCount]) {
                                                        this.aggregatedValueMatrix[rlen + valueCount] = [];
                                                    }
                                                    this.aggregatedValueMatrix[rlen + valueCount][index] = cVal;
                                                }
                                                if (pivotIndex[rlen + valueCount + ',' + index]) {
                                                    delete pivotIndex[rlen + valueCount + ',' + index];
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            for (let rlt: number = rowheads.length, rln: number = 0; rln < rlt; rln++) {
                                if (rowheads[rln] !== undefined) {
                                    let cVal: number = 0;
                                    for (let item of selectedHeaderCollection) {
                                        for (let clt: number = activeColumn.length, cln: number = 0; cln < clt; cln++) {
                                            let currentSet: IAxisSet = data[rln + valueCount][cln] as IAxisSet;
                                            if (activeColumn[cln] !== undefined &&
                                                activeColumn[cln].valueSort[item.valueSort.levelName as string] &&
                                                currentSet.axis === 'value' && currentSet.actualText === name) {
                                                if (activeColumn[cln].type !== 'grand sum') {
                                                    cVal += currentSet.value;
                                                    currentSet.formattedText = this.getFormattedValue(cVal, name).formattedText;
                                                    if (!this.aggregatedValueMatrix[rln + valueCount]) {
                                                        this.aggregatedValueMatrix[rln + valueCount] = [];
                                                    }
                                                    this.aggregatedValueMatrix[rln + valueCount][cln] = cVal;
                                                }
                                                if (pivotIndex[rln + valueCount + ',' + cln]) {
                                                    delete pivotIndex[rln + valueCount + ',' + cln];
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    break;
            }
        }
    }

    private getSelectedColumn(name: string, colheads: IAxisSet[]): IAxisSet {
        let set: IAxisSet = { axis: 'column', index: [], indexObject: {} };
        for (let head of colheads) {
            if (head && head.valueSort && (head.valueSort.levelName as string).indexOf(name) === 0) {
                set.index = [...set.index, ...head.index].sort(function (a, b) { return a - b; });
                set.indexObject = { ...set.indexObject, ...head.indexObject } as {};
            }
        }
        return set;
    }
    private getSelectedRow(name: string, rowheads: IAxisSet[]): IAxisSet {
        for (let head of rowheads) {
            if (head) {
                if (head.valueSort && head.valueSort.levelName as string === name) {
                    return head;
                } else if (name === '' && head.type === 'grand sum') {
                    return head;
                }
            }
        }
        return null;
    }
    /* eslint-enable */
    private recursiveRowData(
        rows: IAxisSet[], reformAxis: IAxisSet[], columns: IAxisSet[], tnum: number, data: IPivotValues, vlt: number,
        isLeastNode: boolean, rln: number, vln: number, rTotal: IAxisSet, cTotal: IAxisSet): void {
        if (!isLeastNode) {
            this.getTableData(reformAxis[tnum - vln].members, reformAxis, columns, tnum, data, vlt, rTotal, cTotal);
        }
        if (!this.pageSettings) {
            reformAxis[tnum - vln].members = [];
        }
    }
    private updateRowData(
        rows: IAxisSet[], columns: IAxisSet[], tnum: number, data: IPivotValues, vln: number, rln: number,
        cln: number, dln: number, actCnt: number, rTotal: IAxisSet, cTotal: IAxisSet): void {
        let mPos: number = this.fieldList[this.values[vln].name].index;
        let aggregate: string = this.fieldList[this.values[vln].name].aggregateType;
        let field: string = this.values[vln].name;
        let gTotalIndex: [IAxisSet, IAxisSet][] = [];
        let totalValues: { [key: string]: number } = {};
        let value: number = 0;
        let actualValue: number = 0;
        // let isLeast: boolean = isLeastNode && (vln === vlt - 1);
        switch (aggregate) {
            case 'Index':
                {
                    gTotalIndex = [[rows[rln], columns[cln]], [rows[rln], cTotal], [rTotal, columns[cln]], [rTotal, cTotal]];
                    let valueContent: string[] = ['cVal', 'rTotalVal', 'cTotalVal', 'gTotalVal'];
                    let i: number = 0;
                    for (let rIndex of gTotalIndex) {
                        totalValues[valueContent[i]] = this.getAggregateValue((rIndex[0]).index, (rIndex[1]).indexObject, mPos, aggregate);
                        i++;
                    }
                    let val: number = ((totalValues.cVal) * (totalValues.gTotalVal)) / ((totalValues.rTotalVal) * (totalValues.cTotalVal));
                    value = (rows[rln].members.length > 0 && ((!isNullOrUndefined(rows[rln].showSubTotals) && !rows[rln].showSubTotals) ||
                        !this.showRowSubTotals || !this.showSubTotals)) ? undefined :
                        (isNullOrUndefined(totalValues.cVal) ? totalValues.cVal : (isNaN(val) ? 0 : val));
                    actualValue = (isNullOrUndefined(totalValues.cVal) ? totalValues.cVal : (isNaN(val) ? 0 : val));
                }
                break;
            case 'PercentageOfGrandTotal':
            case 'PercentageOfColumnTotal':
            case 'PercentageOfRowTotal':
                {
                    gTotalIndex = [[rows[rln], columns[cln]]];
                    gTotalIndex.push((aggregate === 'PercentageOfGrandTotal' ?
                        [rTotal, cTotal] : (aggregate === 'PercentageOfColumnTotal' ? [rTotal, columns[cln]] : [rows[rln], cTotal])));
                    let valueContent: string[] = ['cVal', 'gTotalVal'];
                    let i: number = 0;
                    for (let rIndex of gTotalIndex) {
                        totalValues[valueContent[i]] = this.getAggregateValue((rIndex[0]).index, (rIndex[1]).indexObject, mPos, aggregate);
                        i++;
                    }
                    let val: number = ((totalValues.cVal) / (totalValues.gTotalVal));
                    value = (rows[rln].members.length > 0 && ((!isNullOrUndefined(rows[rln].showSubTotals) && !rows[rln].showSubTotals) ||
                        !this.showSubTotals || !this.showRowSubTotals)) ? undefined :
                        (isNullOrUndefined(totalValues.cVal) ? totalValues.cVal : (isNaN(val) ? 0 : val));
                    actualValue = (isNullOrUndefined(totalValues.cVal) ? totalValues.cVal : (isNaN(val) ? 0 : val));
                }
                break;
            default:
                let val: number = this.getAggregateValue(rows[rln].index, columns[cln].indexObject, mPos, aggregate);
                value = (rows[rln].members.length > 0 && ((!isNullOrUndefined(rows[rln].showSubTotals) && !rows[rln].showSubTotals) ||
                    !this.showSubTotals || !this.showRowSubTotals)) ? undefined : val;
                actualValue = val;
                break;
        }
        let cellDetails: AggregateEventArgs = {
            fieldName: this.values[vln].name,
            row: rows[rln],
            column: columns[cln],
            value: value,
            cellSets: this.getCellSet(this.rawIndexObject),
            rowCellType: (rows[rln].hasChild && rows[rln].isDrilled ? 'subTotal' : rows[rln].type === 'grand sum' ? 'grandTotal' : 'value'),
            columnCellType: (columns[cln].hasChild && columns[cln].isDrilled ? 'subTotal' : columns[cln].type === 'grand sum' ? 'grandTotal' : 'value'),
            aggregateType: aggregate as SummaryTypes,
            skipFormatting: false
        };
        if (this.getValueCellInfo) {
            this.getValueCellInfo(cellDetails);
        }
        value = cellDetails.value;
        let isSum: boolean = rows[rln].hasChild || columns[cln].hasChild ||
            rows[rln].type === 'grand sum' || columns[cln].type === 'grand sum';
        let isGrand: boolean = rows[rln].type === 'grand sum' || columns[cln].type === 'grand sum';
        let subTotal: boolean = (rows[rln].members.length > 0 && ((!isNullOrUndefined(rows[rln].showSubTotals) &&
            !rows[rln].showSubTotals) || !this.showSubTotals || !this.showRowSubTotals));
        let formattedText: string = subTotal ?
            '' : (value === undefined) ? this.emptyCellTextContent :
                (aggregate === 'Count' || aggregate === 'DistinctCount') ? value.toLocaleString() :
                    this.getFormattedValue(value, field).formattedText;

        if (!isNaN(value) && !isNullOrUndefined(value) &&
            (['PercentageOfGrandTotal', 'PercentageOfColumnTotal', 'PercentageOfRowTotal']).indexOf(aggregate) >= 0) {
            formattedText = this.globalize.formatNumber(value,
                { format: 'P', maximumFractionDigits: this.getPercentFormat(this.formatFields, cellDetails.fieldName) });
        } else if (!subTotal &&
            isNaN(value) && !isNullOrUndefined(value) &&
            (['PopulationStDev', 'SampleStDev', 'PopulationVar', 'SampleVar']).indexOf(aggregate) !== -1) {
            formattedText = '#DIV/0!';
        }
        //dln = data[tnum].length;
        formattedText = (cellDetails.skipFormatting ? isNullOrUndefined(value) ?
            this.emptyCellTextContent : value.toString() : formattedText);
        data[tnum][dln] = this.valueContent[actCnt][dln] = {
            axis: 'value', actualText: field, indexObject: this.isDrillThrough ? this.rawIndexObject : {},
            rowHeaders: rows[rln].type === 'grand sum' ? '' : rows[rln].valueSort.levelName,
            columnHeaders: columns[cln].type === 'grand sum' ? '' : columns[cln].valueSort.levelName,
            formattedText: formattedText, value: isNullOrUndefined(value) ? 0 : value,
            actualValue: isNullOrUndefined(actualValue) ? 0 : actualValue,
            rowIndex: tnum, colIndex: dln, isSum: isSum, isGrandSum: isGrand, showSubTotals: !subTotal
        };
        this.rawIndexObject = {};
    }
    /* eslint-disable , @typescript-eslint/no-explicit-any */
    private getCellSet(rawIndexObject: INumberIndex): IDataSet[] {
        let currentCellSets: IDataSet[] = [];
        let keys: string[] = Object.keys(rawIndexObject);
        for (let index of keys) {
            if (this.data[parseInt(index, 10)]) {
                currentCellSets.push(this.data[parseInt(index, 10) as any] as any);
            }
        }
        return currentCellSets;
    }
    private getHeaderData(axis: IAxisSet[], reformAxis: IAxisSet[], data: IPivotValues, tnum: number, vcnt: number): void {
        let rlt: number = axis.length;
        let colItmLn: number = this.columns.length;
        let sortText: string = this.valueSortSettings.headerText;
        //let valueLn: number = this.values.length;
        for (let rln: number = 0; rln < rlt; rln++) {
            if (axis[rln].members.length) {
                this.getHeaderData(axis[rln].members, reformAxis, data, tnum, vcnt);
            }
            let isTotalHide: boolean = true;
            if ((!isNullOrUndefined(axis[rln].showSubTotals) && !axis[rln].showSubTotals) ||
                !this.showSubTotals || !this.showColumnSubTotals) {
                if (!(axis[rln].members.length > 0)) {
                    reformAxis[reformAxis.length] = this.frameHeaderWithKeys(axis[rln]);
                } else {
                    this.removeCount++;
                    isTotalHide = false;
                }
                tnum = reformAxis.length - 1;
            } else {
                tnum = reformAxis.length;
                reformAxis[tnum] = this.frameHeaderWithKeys(axis[rln]);
            }
            //  let rplus: number = rln + 1;
            let lvl: number = axis[rln].level;
            axis[rln].rowIndex = lvl;
            axis[rln].colIndex = (tnum * vcnt) + vcnt;
            if (!data[lvl]) {
                data[lvl] = [];
                this.headerContent[lvl] = {} as IAxisSet[];
                data[lvl][(tnum * vcnt) + vcnt] = this.headerContent[lvl][(tnum * vcnt) + vcnt] = this.frameHeaderWithKeys(axis[rln]);
            } else {
                data[lvl][(tnum * vcnt) + vcnt] = this.headerContent[lvl][(tnum * vcnt) + vcnt] = this.frameHeaderWithKeys(axis[rln]);
            }
            let isSingleMeasure: boolean = (this.columns.length === 0 && this.values.length === 1) ? true : false;
            if ((this.isMutiMeasures || this.alwaysShowValueHeader || isSingleMeasure) && !this.valueAxis && isTotalHide) {
                for (let vln: number = 0; vln < vcnt; vln++) {
                    let name: string = this.values[vln].caption ? this.values[vln].caption : this.values[vln].name;
                    /* eslint-disable */
                    let calObj: Object = {
                        axis: 'column',
                        actualText: this.values[vln].name,
                        formattedText: name,
                        level: 0,
                        valueSort: {},
                        colIndex: (tnum * vcnt) + 1 + vln,
                        rowIndex: colItmLn
                    };
                    /* eslint-enable */
                    if (!data[colItmLn]) {
                        data[colItmLn] = [];
                        this.headerContent[colItmLn] = {} as IAxisSet[];
                        data[colItmLn][(tnum * vcnt) + 1 + vln] = this.headerContent[colItmLn][(tnum * vcnt) + 1 + vln] = calObj;
                    } else {
                        data[colItmLn][(tnum * vcnt) + 1 + vln] = this.headerContent[colItmLn][(tnum * vcnt) + 1 + vln] = calObj;
                    }
                    let vData: IDataSet = (data[colItmLn][(tnum * vcnt) + 1 + vln] as IAxisSet).valueSort;
                    vData[axis[rln].valueSort.levelName + this.valueSortSettings.headerDelimiter + name] = 1;
                    vData.levelName = axis[rln].valueSort.levelName + this.valueSortSettings.headerDelimiter + name;
                    if (vData && vData[sortText]) {
                        this.valueSortSettings.columnIndex = (tnum * vcnt) + 1 + vln;
                    }
                }
            } else if (axis[rln].valueSort && axis[rln].valueSort[sortText]) {
                this.valueSortSettings.columnIndex = (tnum * vcnt) + 1;
            }
            if (!this.pageSettings) {
                reformAxis[tnum].members = [];
            }
        }
    }
    /* eslint-disable */
    private getAggregateValue(rowIndex: number[], columnIndex: INumberIndex, value: number, type: string): number {
        //rowIndex = rowIndex.sort();
        //columnIndex = columnIndex.sort();
        let rlt: number = rowIndex.length;
        //let clt: number = columnIndex.length;
        let mirror: INumberIndex = {};
        let ri: number = 0;
        let ci: number = 0;
        let cellValue: number = 0;
        let avgCnt: number = 0;
        let isInit: boolean = true;
        let isValueExist: boolean = false;
        switch (type.toLowerCase()) {
            case 'median':
                let values: number[] = [];
                let position: number = 0;
                while (rowIndex[ri] !== undefined) {
                    if (columnIndex[rowIndex[ri]] !== undefined) {
                        isValueExist = true;
                        this.rawIndexObject[rowIndex[ri]] = rowIndex[ri];
                        if (!isNullOrUndefined(this.valueMatrix[rowIndex[ri]][value])) {
                            values.push(this.valueMatrix[rowIndex[ri]][value]);
                        }
                    }
                    ri++;
                }
                let len: number = values.length;
                if (len > 0) {
                    values.sort((a, b) => a - b);
                    if (len % 2 === 0) {
                        position = (len / 2) <= 1 ? 0 : ((len / 2) - 1);
                        cellValue = (values[position] + values[position + 1]) / 2;
                    } else {
                        position = (len + 1) / 2 <= 1 ? 0 : (((len + 1) / 2) - 1);
                        cellValue = values[position];
                    }
                }
                break;
            case 'count':
                while (rowIndex[ri] !== undefined) {
                    if (columnIndex[rowIndex[ri]] !== undefined) {
                        isValueExist = true;
                        this.rawIndexObject[rowIndex[ri]] = rowIndex[ri];
                        cellValue += (isNullOrUndefined(this.valueMatrix[rowIndex[ri]][value]) ?
                            0 : (this.allowDataCompression ? this.valueMatrix[rowIndex[ri]][value] : 1));
                    }
                    ri++;
                }
                break;
            case 'distinctcount':
                let duplicateValues: string[] = [];
                while (rowIndex[ri] !== undefined) {
                    if (columnIndex[rowIndex[ri]] !== undefined) {
                        this.rawIndexObject[rowIndex[ri]] = rowIndex[ri];
                        isValueExist = true;
                        let val: string | number | Date = ((this.data as any)[rowIndex[ri]][this.fieldKeys[this.fields[value]] as any]);
                        let currentVal: string;
                        // let currentVal: number = this.valueMatrix[rowIndex[ri]][value];
                        if (!isNullOrUndefined(val)) {
                            currentVal = val.toString();
                            if (duplicateValues.length === 0 || (duplicateValues.length > 0 && duplicateValues.indexOf(currentVal) === -1)) {
                                cellValue += (this.allowDataCompression && typeof val === 'number') ? val : 1;
                                duplicateValues.push(currentVal);
                            }
                        }
                    }
                    ri++;
                }
                break;
            case 'product':
                while (rowIndex[ri] !== undefined) {
                    if (columnIndex[rowIndex[ri]] !== undefined) {
                        this.rawIndexObject[rowIndex[ri]] = rowIndex[ri];
                        isValueExist = true;
                        let currentVal: number = this.valueMatrix[rowIndex[ri]][value];
                        if (!isNullOrUndefined(currentVal)) {
                            cellValue = ((isInit || isNullOrUndefined(cellValue)) ? 1 : cellValue);
                            cellValue *= currentVal;
                        } else if (isInit) {
                            cellValue = currentVal;
                        }
                        isInit = false;
                    }
                    ri++;
                }
                break;
            case 'populationstdev':
            case 'samplestdev':
            case 'populationvar':
            case 'samplevar':
                let i: number = 0;
                let val: number = 0;
                let indexVal: number[] = [];
                let avgVal: number = 0;
                let cVal: number = 0;
                let avgDifferenceVal: number = 0;
                while (rowIndex[ri] !== undefined) {
                    if (columnIndex[rowIndex[ri]] !== undefined) {
                        isValueExist = true;
                        this.rawIndexObject[rowIndex[ri]] = rowIndex[ri];
                        let currentVal: number = this.valueMatrix[rowIndex[ri]][value];
                        if (!isNullOrUndefined(currentVal)) {
                            val += currentVal;
                            indexVal.push(currentVal);
                            i++;
                        }
                    }
                    ri++;
                }
                if (i > 0) {
                    avgVal = val / i;
                    for (let index of indexVal) {
                        avgDifferenceVal += Math.pow((index - avgVal), 2);
                    }
                    if ((['populationstdev', 'samplestdev']).indexOf(type.toLowerCase()) !== -1) {
                        cVal = Math.sqrt(avgDifferenceVal / (type.toLowerCase() === 'populationstdev' ? i : (i - 1)));
                    } else {
                        cVal = avgDifferenceVal / (type.toLowerCase() === 'populationvar' ? i : (i - 1));
                    }
                    cellValue = (cVal === 0 ? NaN : cVal);
                } else {
                    cellValue = val;
                }
                break;
            case 'min':
                let isFirst: boolean = true;
                cellValue = undefined;
                while (rowIndex[ri] !== undefined) {
                    if (columnIndex[rowIndex[ri]] !== undefined && this.valueMatrix[rowIndex[ri]][value] !== undefined) {
                        isValueExist = true;
                        this.rawIndexObject[rowIndex[ri]] = rowIndex[ri];
                        if (isNullOrUndefined(cellValue) && isNullOrUndefined(this.valueMatrix[rowIndex[ri]][value])) {
                            cellValue = this.valueMatrix[rowIndex[ri]][value];
                        } else {
                            if (isFirst) {
                                cellValue = this.valueMatrix[rowIndex[ri]][value];
                                isFirst = false;
                            } else {
                                cellValue = this.valueMatrix[rowIndex[ri]][value] < cellValue ? this.valueMatrix[rowIndex[ri]][value] : cellValue;
                            }
                        }
                    }
                    ri++;
                }
                break;
            case 'max':
                let isMaxFirst: boolean = true;
                while (rowIndex[ri] !== undefined) {
                    if (columnIndex[rowIndex[ri]] !== undefined && this.valueMatrix[rowIndex[ri]][value] !== undefined) {
                        isValueExist = true;
                        this.rawIndexObject[rowIndex[ri]] = rowIndex[ri];
                        if (isMaxFirst) {
                            cellValue = this.valueMatrix[rowIndex[ri]][value];
                            isMaxFirst = false;
                        } else {
                            cellValue = this.valueMatrix[rowIndex[ri]][value] > cellValue ? this.valueMatrix[rowIndex[ri]][value] : cellValue;
                        }
                    }
                    ri++;
                }
                break;
            case 'calculatedfield':
                isValueExist = true;
                this.rawIndexObject[rowIndex[ri]] = rowIndex[ri];
                let calcField: ICalculatedFields = this.calculatedFields[this.fields[value]];
                let actualFormula: string = calcField.formula;
                let aggregateField: { [key: string]: Object } = {};
                if (this.calculatedFormulas[calcField.name]) {
                    let calculatedFormulas: Object[] = <Object[]>this.calculatedFormulas[calcField.name];
                    for (let len: number = 0, lmt: number = calculatedFormulas.length; len < lmt; len++) {
                        let aggregatedValue: { [key: string]: Object } = <{ [key: string]: Object }>calculatedFormulas[len];
                        let value: number = <number>aggregateField[<string>aggregatedValue.formula];
                        if (value === undefined) {
                            let type: string = <string>aggregatedValue.type;
                            value = this.getAggregateValue(rowIndex, columnIndex, <number>aggregatedValue.index, type);
                            aggregateField[<string>aggregatedValue.formula] = value;
                        }
                        actualFormula = (actualFormula).replace(<string>aggregatedValue.formula, String(value));
                    }
                }
                cellValue = this.evaluate(actualFormula);
                cellValue = (cellValue === Infinity || cellValue === -Infinity ? Infinity : (cellValue === undefined || isNaN(cellValue)) ? undefined : JSON.parse(String(cellValue)));
                break;
            default:
                cellValue = undefined;
                while (rowIndex[ri] !== undefined) {
                    if (columnIndex[rowIndex[ri]] !== undefined) {
                        isValueExist = true;
                        this.rawIndexObject[rowIndex[ri]] = rowIndex[ri];
                        //let cIndx: number = isLeastLevel ? columnIndex.splice(columnIndex.indexOf(rowIndex[ri]), 1)[0] : rowIndex[ri];
                        let currentVal: number = this.valueMatrix[rowIndex[ri]][value];
                        if (isNullOrUndefined(cellValue) && isNullOrUndefined(currentVal)) {
                            cellValue = currentVal;
                        } else {
                            if (isNullOrUndefined(cellValue)) {
                                cellValue = 0;
                            }
                            cellValue += (isNullOrUndefined(currentVal) ? 0 : currentVal);
                        }
                        if (!isNullOrUndefined(currentVal)) {
                            avgCnt++;
                        }
                    }
                    ri++;
                }
                break;
        }
        /* if (rlt > clt) {
             this.makeMirrorObject(rowIndex, mirror);
             while (columnIndex[ci] !== undefined) {
                 if (mirror[columnIndex[ci]]) {
                     let cIndx: number = isLeastLevel ? columnIndex.splice(ci, 1)[0] : columnIndex[ci];
                     //rowIndex.splice
                     sum += this.valueMatrix[cIndx][value];
                 }
                 ci++;
             }
         } else {
             this.makeMirrorObject(columnIndex, mirror);
             while (rowIndex[ri] !== undefined) {
                 if (mirror[rowIndex[ri]]) {
                     let cIndx: number = isLeastLevel ? columnIndex.splice(columnIndex.indexOf(rowIndex[ri]), 1)[0] : rowIndex[ri];
                     sum += this.valueMatrix[rowIndex[ri]][value];
                 }
                 ri++;
             }
         } */
        return ((type && type.toLowerCase() === 'avg' && cellValue !== 0 &&
            !isNullOrUndefined(cellValue)) ? (cellValue / avgCnt) : isValueExist ? cellValue : undefined);
    }
    private evaluate(obj: string): number {
        return Function('"use strict";return (' + obj + ')')();
    };
    /** hidden */
    public getFormattedValue(value: number | string, fieldName: string): IAxisSet {
        /* eslint-enable */
        let commonValue: number | string = value === null ? (this.localeObj ? this.localeObj.getConstant('null') :
            String(value)) : value === undefined ?
                (this.localeObj ? (fieldName in this.groupingFields) ? this.localeObj.getConstant('groupOutOfRange') :
                    this.localeObj.getConstant('undefined') : String(value)) : value;
        let formattedValue: IAxisSet = {
            formattedText: commonValue.toString(),
            actualText: commonValue,
            dateText: commonValue
        };
        if (this.formatFields[fieldName] && !isNullOrUndefined(value)) {
            try {
                let formatField: IFormatSettings = ((<{ [key: string]: Object }>this.formatFields[fieldName]).properties ?  //eslint-disable-line
                    (<{ [key: string]: Object }>this.formatFields[fieldName]).properties : this.formatFields[fieldName]);   //eslint-disable-line
                let formatSetting: IFormatSettings = extend({}, formatField, null, true) as IFormatSettings;

                delete formatSetting.name;
                if (!formatSetting.minimumSignificantDigits && formatSetting.minimumSignificantDigits < 1) {
                    delete formatSetting.minimumSignificantDigits;
                }
                if (!formatSetting.maximumSignificantDigits && formatSetting.maximumSignificantDigits < 1) {
                    delete formatSetting.maximumSignificantDigits;
                }
                if (formatSetting.type) {
                    formattedValue.formattedText = this.dateFormatFunction[fieldName].exactFormat(new Date(value as string));
                    formattedValue.actualText = value;
                } else {
                    delete formatSetting.type;
                    if ((formatSetting.format) && !(this.formatRegex.test(formatSetting.format))) {
                        let pattern: string[] = formatSetting.format.match(this.customRegex);
                        let flag: boolean = true;
                        if (isNullOrUndefined(formatSetting.minimumFractionDigits)) {
                            delete formatSetting.minimumFractionDigits;
                        }
                        if (isNullOrUndefined(formatSetting.maximumFractionDigits)) {
                            delete formatSetting.maximumFractionDigits;
                        }
                        if (isNullOrUndefined(formatSetting.minimumIntegerDigits)) {
                            delete formatSetting.minimumIntegerDigits;
                        }
                        if (isNullOrUndefined(pattern)) {
                            pattern = formatSetting.format.match(/^(('[^']+'|''|[^*@0])*)(\*.)?((([0#,]*[0,]*[0#]*)(\.[0#]*)?)|([#,]*@+#*))(E\+?0+)?(('[^']+'|''|[^*#@,.E])*)$/);
                            delete formatSetting.useGrouping;
                            flag = false;
                        }
                        let integerPart: string = pattern[6];
                        if (flag) {
                            formatSetting.useGrouping = integerPart.indexOf(',') !== -1;
                        }
                        let decimalPart: string = pattern[5];
                        if (isBlazor() && decimalPart && decimalPart.indexOf('.') !== -1 && formatSetting.maximumFractionDigits) {
                            delete formatSetting.maximumFractionDigits;
                        }
                    }
                    formattedValue.formattedText =
                        this.globalize.formatNumber(!isNaN(Number(value)) ? Number(value) : value as number, formatSetting);
                    formattedValue.actualText = !isNaN(Number(value)) ? Number(value) : value;
                    formattedValue.dateText = !isNaN(Number(value)) ? Number(value) : value;
                }
                if (this.fieldList[fieldName].sort !== 'None' && formatSetting.type &&
                    ['date', 'dateTime', 'time'].indexOf(this.formatFields[fieldName].type) > -1) {
                    formattedValue.dateText = this.dateFormatFunction[fieldName].fullFormat(new Date(value as string));
                }
                if (this.fieldList[fieldName].isCustomField) {
                    formattedValue.formattedText = formattedValue.formattedText === 'NaN' ?
                        commonValue.toString() : formattedValue.formattedText;
                    formattedValue.dateText = formattedValue.dateText === 'NaN' ?
                        commonValue.toString() : formattedValue.dateText;
                }
            } catch (exception) {
                if (!this.fieldList[fieldName].isCustomField) {
                    throw exception;
                }
            } finally {
                if (this.fieldList[fieldName].isCustomField) {
                    formattedValue.formattedText =
                        (isNullOrUndefined(formattedValue.formattedText) || formattedValue.formattedText === 'NaN') ?
                            commonValue.toString() : formattedValue.formattedText;
                    formattedValue.dateText = (isNullOrUndefined(formattedValue.dateText) || formattedValue.dateText === 'NaN') ?
                        commonValue.toString() : formattedValue.dateText;
                }
            }
        }
        return formattedValue;
    }
    /* eslint-disable */
    private powerFunction(formula: string): string {
        if (formula.indexOf('^') > -1) {
            let items: string[] = [];
            while (formula.indexOf('(') > -1) {
                formula = formula.replace(/(\([^\(\)]*\))/g, (text: string, item: string): string => {
                    items.push(item);
                    return ('~' + (items.length - 1));
                });
            }
            /* eslint-enable */
            items.push(formula);
            formula = '~' + (items.length - 1);
            while (formula.indexOf('~') > -1) {
                formula = formula.replace(new RegExp('~' + '(\\d+)', 'g'), (text: string, index: number): string => {
                    return items[index].replace(/(\w*)\^(\w*)/g, 'Math.pow' + '($1,$2)');
                });
            }
        }
        return formula;
    }
    /* private makeMirrorObject(elements: number[], obj: NumberIndex): void {
         for (let lp: number = 0, end: number = elements.length; lp < end; lp++) {
             obj[elements[lp]] = elements[lp];
         }
     } */
}
/* eslint-disable */
/** 
 * Allows the following pivot report information such as rows, columns, values, filters, etc., that are used to render the pivot table and field list.
 * * `catalog`: Allows to set the database name of SSAS cube as string type that used to retrieve the data from the specified connection string. **Note: It is applicable only for OLAP data source.**
 * * `cube`: Allows you to set the SSAS cube name as string type that used to retrieve data for pivot table rendering. **Note: It is applicable only for OLAP data source.**
 * * `providerType`: Allows to set the provider type to identify the given connection is either Relational or SSAS to render the pivot table and field list.
 * * `url`: Allows to set the URL as string type, which helps to identify the service endpoint where the data are processed and retrieved to render the pivot table and field list. **Note: It is applicable only for OLAP data source.**
 * * `localeIdentifier`: Allows you to set the specific culture code as number type to render pivot table with desired localization. 
 * By default, the pivot table displays with culture code **1033**, which indicates "en-US" locale. **Note: It is applicale only for OLAP data source.**
 * * `dataSource`: Allows you to set the data source as JSON collection to the pivot report either from local or from remote server to the render the pivot that and field list. 
 * You can fetch JSON data from remote server by using DataManager. **Note: It is applicable only for relational data source.**
 * * `rows`: Allows specific fields associated with field information that needs to be displayed in row axis of pivot table.
 * * `columns`: Allows specific fields associated with field information that needs to be displayed in column axis of pivot table.
 * * `values`: Allows specific fields associated with field information that needs to be displayed as aggregated numeric values in pivot table.
 * * `filters`: Allows to filter the values in other axis based on the collection of filter fields in pivot table.
 * * `excludeFields`: Allows you to restrict the specific field(s) from displaying it in the field list UI. 
 * You may also be unable to render the pivot table with this field(s) by doing so. **Note: It is applicable only for relational data source.**
 * * `expandAll`: Allows you to either expand or collapse all the headers that are displayed in the pivot table. 
 * By default, all the headers are collapsed in the pivot table. **Note: It is applicable only for Relational data.**
 * * `valueAxis`: Allows you to set the value fields that to be plotted either in row or column axis in the pivot table.
 * * `filterSettings`: Allows specific fields associated with either selective or conditional-based filter members that used to be displayed in the pivot table.
 * * `sortSettings`: Allows specific fields associated with sort settings to order their members either in ascending or descending that used to be displayed in the pivot table. 
 * By default, the data source containing fields are display with Ascending order alone. To use this option, it requires the `enableSorting` property to be **true**.
 * * `enableSorting`: Allows to perform sort operation to order members of a specific fields either in ascending or descending that used to be displayed in the pivot table.
 * * `formatSettings`: Allows specific fields used to display the values with specific format that used to be displayed in the pivot table. 
 * For example, to display a specific field with currency formatted values in the pivot table, the set the `format` property to be **C**.
 * * `drilledMembers`: Allows specific fields used to display their the headers to be either expanded or collapsed in the pivot table.
 * * `valueSortSettings`: Allows to sort individual value field and its aggregated values either in row or column axis to ascending or descending order.
 * * `calculatedFieldSettings`: Allows to create new calculated fields from the bound data source or using simple formula with basic arithmetic operators in the pivot table.
 * * `allowMemberFilter`: Allows to perform filter operation based on the selective filter members of the specific fields used to be displayed in the pivot table.
 * * `allowLabelFilter`: Allows to perform filter operation based on the selective headers used to be displayed in the pivot table.
 * * `allowValueFilter`: Allows to perform filter operation based only on value fields and its resultant aggregated values over other fields defined in row and column axes that used to be displayed in the pivot table.
 * * `showSubTotals`: Allows to show or hide sub-totals in both rows and columns axis of the pivot table.
 * * `showRowSubTotals`: Allows to show or hide sub-totals in row axis of the pivot table.
 * * `showColumnSubTotals`: Allows to show or hide sub-totals in column axis of the pivot table.
 * * `showGrandTotals`: Allows to show or hide grand totals in both rows and columns axis of the pivot table.
 * * `showRowGrandTotals`: Allows to show or hide grand totals in row axis of the pivot table.
 * * `showColumnGrandTotals`: Allows to show or hide grand totals in column axis of the pivot table.
 * * `showHeaderWhenEmpty`: Allows the undefined headers to be displayed in the pivot table, when the specific field(s) are not defined in the raw data. 
 * For example, if the raw data for the field ‘Country’ is defined as “United Kingdom” and “State” is not defined means, it will be shown as “United Kingdom >> Undefined” in the header section.
 * * `alwaysShowValueHeader`: Allows to show the value field header always in pivot table, even if it holds a single field in the value field axis.
 * * `conditionalFormatSettings`: Allows a collection of values fields to change the appearance of the pivot table value cells with different style properties such as background color, font color, font family, and font size based on specific conditions.
 * * `emptyCellsTextContent`: Allows to show custom string to the empty value cells that used to display in the pivot table. You can fill empty value cells with any value like “0”, ”-”, ”*”, “(blank)”, etc.
 * * `groupSettings`: Allows specific fields to group their data on the basis of their type. 
 * For example, the date type fields can be formatted and displayed based on year, quarter, month, and more. Likewise, the number type fields can be grouped range-wise, such as 1-5, 6-10, etc. 
 * You can perform custom group to the string type fields that used to displayed in the pivot table.
 * * `showAggregationOnValueField`: Allows the pivot button with specific value field caption along with the aggregation type, to be displayed in the grouping bar and field list UI. 
 * For example, if the value field "Sold Amount" is aggregated with Sum, it will be displayed with caption "Sum of Sold Amount" in its pivot button.
 * * `authentication`: Allows you to set the credential information to access the specified SSAS cube. **Note: It is applicable only for OLAP data source**.
 */
export interface IDataOptions {
    /**
     * Allows to set the database name of SSAS cube as string type that used to retrieve the data from the specified connection string. 
     * > It is applicable only for OLAP data source.
     */
    catalog?: string;
    /**
     * Allows you to set the SSAS cube name as string type that used to retrieve data for pivot table rendering. 
     * > It is applicable only for OLAP data source.
     */
    cube?: string;
    /**
     * Allows to set the provider type to identify the given connection is either **Relational** or **SSAS** to render the pivot table and field list. The following options are:
     * * `Relational`: Allows to render the pivot table with JSON data collection either fetch at local or remote server.
     * * `SSAS`: Allows to render the pivot table with OLAP data fetch from OLAP cube.
     */
    providerType?: ProviderType;
    /**
     * Allows to set the URL as string type, which helps to identify the service endpoint where the data are processed and retrieved to render the pivot table and field list. 
     * > It is applicable only for OLAP data source.
     */
    url?: string;
    /**
     * Allows you to set the specific culture code as number type to render pivot table with desired localization. 
     * By default, the pivot table displays with culture code **1033**, which indicates "en-US" locale. 
     * > It is applicale only for OLAP data source.
     */
    localeIdentifier?: number;
    /**
     * Allows you to set the data source as JSON collection to the pivot report either from local or from remote server to the render the pivot that and field list. 
     * You can fetch JSON data from remote server by using DataManager. 
     * > It is applicable only for relational data source.
     */
    dataSource?: IDataSet[] | DataManager | string[][];
    /**
     * Allows specific fields associated with field information that needs to be displayed in row axis of pivot table. The following configurations which are applicable are as follows:
     * * `name`: Allows you to set the field name that needs to be displayed in row axis of pivot table.
     * * `caption`: Allows you to set caption to the specific field. It will be used to display instead of its name in pivot table component's UI.
     * * `showNoDataItems`: Allows you to display all members items of a specific field to the pivot table, 
     * even doesn't have any data in its row/column intersection in data source. **Note: It is applicable only for relational data source.**
     * * `showSubTotals`: Allows to show or hide sub-totals to a specific field in row axis of the pivot table.
     * * `isNamedSet`: Allows you to set whether the specified field is a named set or not. In general, 
     * the named set is a set of dimension members or a set expression (MDX query) to be created as a dimension in the SSAS OLAP cube itself. **Note: It is applicable only for OLAP data source.**
     * * `isCalculatedField`: Allows to set whether the specified field is a calculated field or not. 
     * In general, the calculated field is created from the bound data source or using simple formula with basic arithmetic operators in the pivot table. **Note: It is applicable only for OLAP data source.**
     * * `showFilterIcon`: Allows you to show or hide the filter icon of a specific field that used to be displayed on the pivot button of the grouping bar and field list UI. 
     * This filter icon is used to filter the members of a specified field at runtime in the pivot table.
     * * `showSortIcon`: Allows you to show or hide the sort icon of a specific field that used to be displayed in the pivot button of the grouping bar and field list UI. 
     * This sort icon is used to order members of a specified field either in ascending or descending at runtime.
     * * `showRemoveIcon`: Allows you to show or hide the remove icon of a specific field that used to be displayed in the pivot button of the grouping bar and field list UI. 
     * This remove icon is used to remove the specified field during runtime.
     * * `showEditIcon`: Allows you to show or hide the edit icon of a specific field that used to be displayed on the pivot button of the grouping bar and field list UI. 
     * This edit icon is used to modify caption, formula, and format of a specified calculated field at runtime that to be displayed in the pivot table.
     * * `allowDragAndDrop`: Allows you to restrict the specific field's pivot button that is used to drag on runtime in the grouping bar and field list UI. 
     * This will prevent you from modifying the current report.
     */
    rows?: IFieldOptions[];
    /**
     * Allows specific fields associated with field information that needs to be displayed in column axis of pivot table. The following configurations which are applicable are as follows:
     * * `name`: Allows you to set the field name that needs to be displayed in column axis of pivot table.
     * * `caption`: Allows you to set caption to the specific field. It will be used to display instead of its name in pivot table component's UI.
     * * `showNoDataItems`: Allows you to display all members items of a specific field to the pivot table, 
     * even doesn't have any data in its row/column intersection in data source. **Note: It is applicable only for relational data source.**
     * * `showSubTotals`: Allows to show or hide sub-totals to a specific field in column axis of the pivot table.
     * * `isNamedSet`: Allows you to set whether the specified field is a named set or not. In general, 
     * the named set is a set of dimension members or a set expression (MDX query) to be created as a dimension in the SSAS OLAP cube itself. **Note: It is applicable only for OLAP data source.**
     * * `isCalculatedField`: Allows to set whether the specified field is a calculated field or not. 
     * In general, the calculated field is created from the bound data source or using simple formula with basic arithmetic operators in the pivot table. **Note: It is applicable only for OLAP data source.**
     * * `showFilterIcon`: Allows you to show or hide the filter icon of a specific field that used to be displayed on the pivot button of the grouping bar and field list UI. 
     * This filter icon is used to filter the members of a specified field at runtime in the pivot table.
     * * `showSortIcon`: Allows you to show or hide the sort icon of a specific field that used to be displayed in the pivot button of the grouping bar and field list UI. 
     * This sort icon is used to order members of a specified field either in ascending or descending at runtime.
     * * `showRemoveIcon`: Allows you to show or hide the remove icon of a specific field that used to be displayed in the pivot button of the grouping bar and field list UI. 
     * This remove icon is used to remove the specified field during runtime.
     * * `showEditIcon`: Allows you to show or hide the edit icon of a specific field that used to be displayed on the pivot button of the grouping bar and field list UI. 
     * This edit icon is used to modify caption, formula, and format of a specified calculated field at runtime that to be displayed in the pivot table.
     * * `allowDragAndDrop`: Allows you to restrict the specific field's pivot button that is used to drag on runtime in the grouping bar and field list UI. 
     * This will prevent you from modifying the current report.
     */
    columns?: IFieldOptions[];
    /**
     * Allows specific fields associated with field information that needs to be displayed as aggregated numeric values in pivot table. The following configurations which are applicable are as follows:
     * * `name`: Allows you to set the field name that needs to be displayed in row/column/value/filter axis of pivot table.
     * * `caption`: Allows you to set caption to the specific field. It will be used to display instead of its name in pivot table component's UI.
     * * `type`: Allows to display the values in the pivot table with appropriate aggregations such as sum, product, count, average, etc… **Note: It is applicable only for relational data source.**
     * * `baseField`: Allows you to set the selective field, which used to display the values with either
     *  DifferenceFrom or PercentageOfDifferenceFrom or PercentageOfParentTotal aggregate types. **Note: It is applicable only for relational data source.**
     * * `baseItem`: Allows you to set the selective item of a specific field, which used to display the values with either DifferenceFrom or PercentageOfDifferenceFrom aggregate types. 
     * The selective item should be set the from field specified in the baseField property. **Note: It is applicable only for relational data source.**
     * * `isCalculatedField`: Allows to set whether the specified field is a calculated field or not. 
     * In general, the calculated field is created from the bound data source or using simple formula with basic arithmetic operators in the pivot table. **Note: It is applicable only for OLAP data source.**
     * * `showRemoveIcon`: Allows you to show or hide the remove icon of a specific field that used to be displayed in the pivot button of the grouping bar and field list UI. 
     * This remove icon is used to remove the specified field during runtime.
     * * `showValueTypeIcon`: Allows you to show or hide the value type icon of a specific field that used to be displayed in the pivot button of the grouping bar and field list UI. 
     * This value type icon helps to select the appropriate aggregation type to specified value field at runtime.
     * * `showEditIcon`: Allows you to show or hide the edit icon of a specific field that used to be displayed on the pivot button of the grouping bar and field list UI. 
     * This edit icon is used to modify caption, formula, and format of a specified calculated field at runtime that to be displayed in the pivot table.
     * * `allowDragAndDrop`: Allows you to restrict the specific field's pivot button that is used to drag on runtime in the grouping bar and field list UI. 
     * This will prevent you from modifying the current report.
     */
    values?: IFieldOptions[];
    /**
     * Allows to filter the values in other axis based on the collection of filter fields in pivot table. The following configurations which are applicable are as follows:
     * * `name`: Allows you to set the field name that needs to be displayed in row/column/value/filter axis of pivot table.
     * * `caption`: Allows you to set caption to the specific field. It will be used to display instead of its name in pivot table component's UI.
     * * `isNamedSet`: Allows you to set whether the specified field is a named set or not. In general, 
     * the named set is a set of dimension members or a set expression (MDX query) to be created as a dimension in the SSAS OLAP cube itself. **Note: It is applicable only for OLAP data source.**
     * * `isCalculatedField`: Allows to set whether the specified field is a calculated field or not. 
     * In general, the calculated field is created from the bound data source or using simple formula with basic arithmetic operators in the pivot table. **Note: It is applicable only for OLAP data source.**
     * * `showFilterIcon`: Allows you to show or hide the filter icon of a specific field that used to be displayed on the pivot button of the grouping bar and field list UI. 
     * This filter icon is used to filter the members of a specified field at runtime in the pivot table.
     * * `showRemoveIcon`: Allows you to show or hide the remove icon of a specific field that used to be displayed in the pivot button of the grouping bar and field list UI. 
     * This remove icon is used to remove the specified field during runtime.
     * * `showEditIcon`: Allows you to show or hide the edit icon of a specific field that used to be displayed on the pivot button of the grouping bar and field list UI. 
     * This edit icon is used to modify caption, formula, and format of a specified calculated field at runtime that to be displayed in the pivot table.
     * * `allowDragAndDrop`: Allows you to restrict the specific field's pivot button that is used to drag on runtime in the grouping bar and field list UI. 
     * This will prevent you from modifying the current report.
     */
    filters?: IFieldOptions[];
    /**
     * Allows you to restrict the specific field(s) from displaying it in the field list UI. 
     * You may also be unable to render the pivot table with this field(s) by doing so. 
     * > It is applicable only for relational data source.
     */
    excludeFields?: string[];
    /**
     * Allows you to either expand or collapse all the headers that are displayed in the pivot table. 
     * By default, all the headers are collapsed in the pivot table. 
     * > It is applicable only for Relational data.
     */
    expandAll?: boolean;
    /**
     * Allows you to set the value fields that to be plotted either in row or column axis in the pivot table.
     */
    valueAxis?: string;
    /**
     * Allows specific fields associated with either selective or conditional-based filter members that used to be displayed in the pivot table.
     */
    filterSettings?: IFilter[];
    /**
     * Allows specific fields associated with sort settings to order their members either in ascending or descending that used to be displayed in the pivot table. 
     * By default, the data source containing fields are display with Ascending order alone. To use this option, it requires the `enableSorting` property to be **true**. 
     */
    sortSettings?: ISort[];
    /**
     * Allows to perform sort operation to order members of a specific fields either in ascending or descending that used to be displayed in the pivot table.
     */
    enableSorting?: boolean;
    /**
     * Allows specific fields used to display the values with specific format that used to be displayed in the pivot table. 
     * For example, to display a specific field with currency formatted values in the pivot table, the set the `format` property to be **C**. 
     */
    formatSettings?: IFormatSettings[];
    /**
     * Allows specific fields used to display their the headers to be either expanded or collapsed in the pivot table.
     */
    drilledMembers?: IDrillOptions[];
    /**
     * Allows to sort individual value field and its aggregated values either in row or column axis to ascending or descending order.
     */
    valueSortSettings?: IValueSortSettings;
    /**
     * Allows to create new calculated fields from the bound data source or using simple formula with basic arithmetic operators in the pivot table.
     */
    calculatedFieldSettings?: ICalculatedFieldSettings[];
    /**
     * Allows to perform filter operation based on the selective filter members of the specific fields used to be displayed in the pivot table.
     */
    allowMemberFilter?: boolean;
    /**
     * Allows to perform filter operation based on the selective headers used to be displayed in the pivot table.
     */
    allowLabelFilter?: boolean;
    /**
     * Allows to perform filter operation based only on value fields and its resultant aggregated values over other fields defined in row and column axes that used to be displayed in the pivot table.
     */
    allowValueFilter?: boolean;
    /**
     * Allows to show or hide sub-totals in both rows and columns axis of the pivot table.
     */
    showSubTotals?: boolean;
    /**
     * Allows to show or hide sub-totals in row axis of the pivot table.
     */
    showRowSubTotals?: boolean;
    /**
     * Allows to show or hide sub-totals in column axis of the pivot table.
     */
    showColumnSubTotals?: boolean;
    /**
     * Allows to show or hide grand totals in both rows and columns axis of the pivot table.
     */
    showGrandTotals?: boolean;
    /**
     * Allows to show or hide grand totals in row axis of the pivot table.
     */
    showRowGrandTotals?: boolean;
    /**
     * Allows to show or hide grand totals in column axis of the pivot table.
     */
    showColumnGrandTotals?: boolean;
    /**
     * Allows the undefined headers to be displayed in the pivot table, when the specific field(s) are not defined in the raw data. 
     * For example, if the raw data for the field ‘Country’ is defined as “United Kingdom” and “State” is not defined means, it will be shown as “United Kingdom >> Undefined” in the header section.
     */
    showHeaderWhenEmpty?: boolean;
    /**
     * Allows to show the value field header always in pivot table, even if it holds a single field in the value field axis.
     */
    alwaysShowValueHeader?: boolean;
    /**
     * Allows a collection of values fields to change the appearance of the pivot table value cells with different style properties such as background color, font color, font family, and font size based on specific conditions. 
     */
    conditionalFormatSettings?: IConditionalFormatSettings[];
    /**
     * Allows to show custom string to the empty value cells that used to display in the pivot table. You can fill empty value cells with any value like “0”, ”-”, ”*”, “(blank)”, etc.
     */
    emptyCellsTextContent?: string;
    /**
     * Allows specific fields to group their data on the basis of their type. 
     * For example, the date type fields can be formatted and displayed based on year, quarter, month, and more. Likewise, the number type fields can be grouped range-wise, such as 1-5, 6-10, etc. 
     * You can perform custom group to the string type fields that used to displayed in the pivot table.
     */
    groupSettings?: IGroupSettings[];
    /**
     * Allows the pivot button with specific value field caption along with the aggregation type, to be displayed in the grouping bar and field list UI. 
     * For example, if the value field "Sold Amount" is aggregated with Sum, it will be displayed with caption "Sum of Sold Amount" in its pivot button.
     */
    showAggregationOnValueField?: boolean;
    /**
     * Allows you to set the credential information to access the specified SSAS cube. 
     * > It is applicable only for OLAP data source.
     */
    authentication?: IAuthenticationInfo;
    /**
     * Allows to define the data source type.
     */
    type?: DataSourceType;
    /**
     * Allows specific fields associated with field information that can be used while creating fieldlist. The following configurations which are applicable are as follows:
     * * `name`: Allows you to set the field name which is going to configure while creating the fieldlist.
     * * `caption`: Allows you to set caption to the specific field. It will be used to display instead of its name in pivot table component's UI.
     * * `showNoDataItems`: Allows you to display all members items of a specific field to the pivot table, 
     * even doesn't have any data in its row/column intersection in data source. **Note: It is applicable only for relational data source.**
     * * `showSubTotals`: Allows to show or hide sub-totals to a specific field in row axis of the pivot table.
     * * `isNamedSet`: Allows you to set whether the specified field is a named set or not. In general, 
     * the named set is a set of dimension members or a set expression (MDX query) to be created as a dimension in the SSAS OLAP cube itself. **Note: It is applicable only for OLAP data source.**
     * * `isCalculatedField`: Allows to set whether the specified field is a calculated field or not. 
     * In general, the calculated field is created from the bound data source or using simple formula with basic arithmetic operators in the pivot table. **Note: It is applicable only for OLAP data source.**
     * * `showFilterIcon`: Allows you to show or hide the filter icon of a specific field that used to be displayed on the pivot button of the grouping bar and field list UI. 
     * This filter icon is used to filter the members of a specified field at runtime in the pivot table.
     * * `showSortIcon`: Allows you to show or hide the sort icon of a specific field that used to be displayed in the pivot button of the grouping bar and field list UI. 
     * This sort icon is used to order members of a specified field either in ascending or descending at runtime.
     * * `showRemoveIcon`: Allows you to show or hide the remove icon of a specific field that used to be displayed in the pivot button of the grouping bar and field list UI. 
     * This remove icon is used to remove the specified field during runtime.
     * * `showEditIcon`: Allows you to show or hide the edit icon of a specific field that used to be displayed on the pivot button of the grouping bar and field list UI. 
     * This edit icon is used to modify caption, formula, and format of a specified calculated field at runtime that to be displayed in the pivot table.
     * * `allowDragAndDrop`: Allows you to restrict the specific field's pivot button that is used to drag on runtime in the grouping bar and field list UI. 
     * This will prevent you from modifying the current report.
     */
    fieldMapping?: IFieldOptions[];
}
/** 
 * Allows a collection of values fields to change the appearance of the pivot table value cells with different style properties such as background color, font color, font family, and font size based on specific conditions.
 */
export interface IConditionalFormatSettings {
    /**
     * Allows to set the value field name to apply conditional formatting.
     */
    measure?: string;
    /**
     * Allows you to choose the operator type such as equals, greater than, less than, etc. for conditional formatting.
     */
    conditions?: Condition;
    /**
     * Allows you to set the start value for applying conditional formatting.
     */
    value1?: number;
    /**
     * Allows you to set the end value for applying conditional formatting.
     * > This option will be used by default when the operator **Between** and **NotBetween** is chosen to apply.
     */
    value2?: number;
    /**
     * Allows to set the custom styles for the formatting applied values in the pivot table.
     */
    style?: IStyle;
    /**
     * Allows to set the header text of a specific row/column field to apply conditional formatting.
     */
    label?: string;
    /**
     * Allows to apply conditional formatting to the grand totals of row and column axis in the pivot table.
     */
    applyGrandTotals?: boolean;
}
/** 
 * Allows the style information to cusotmize the pivot table cell apprearance.
 */
export interface IStyle {
    /**
     * It allows to set the background color to the value cell in the pivot table.
     */
    backgroundColor?: string;
    /**
     * It allows to set the font color to the value cell in the pivot table.
     */
    color?: string;
    /**
     * It allows to set the font family to the value cell in the pivot table.
     */
    fontFamily?: string;
    /**
     * It allows to set the font size to the value cell in the pivot table.
     */
    fontSize?: string;
}
/** 
 * Allows to sort individual value field and its aggregated values either in row or column axis to ascending or descending order.
 */
export interface IValueSortSettings {
    /**
     * It allows to set the member name of a specific field for value sorting.
     */
    headerText?: string;
    /**
     * It allows to set the delimiter, which is used a separator to split the given header text.
     */
    headerDelimiter?: string;
    /**
     * Allows to apply sorting to the specified field either by ascending or descending. The types are,
     * * `Ascending`: It allows to display the field members in ascending order. 
     * * `Descending`: It allows to display the field members in descending order.
     */
    sortOrder?: Sorting;
    /**
     * It allows to set the column index of the value cell.
     */
    columnIndex?: number;
    /**
     * It allows to set the measure name to achieve value sorting based on this.
     * > It is applicable only for OLAP data source.
     */
    measure?: string;
    // preserveHierarchy?: boolean;
}
/** 
 * Allows you to set the credential information to access the specified SSAS cube. 
 * > It is applicable only for OLAP data source.
 */
export interface IAuthenticationInfo {
    /**
     * It allows to set the user name to access the specified SSAS cube.
     */
    userName?: string;
    /**
     * It allows to set the password to access the specified SSAS cube.
     */
    password?: string;
}
/** 
 * Allows to set the page infomration to display the pivot table with specific page during virual scrolling.
 */
export interface IPageSettings {
    /**
     * It allows to set the total column count of the pivot table.
     */
    columnSize?: number;
    /**
     * It allows to set the total row count of the pivot table.
     */
    rowSize?: number;
    /**
     * It allows to set the current coulmn page count displayed in the pivot table.
     */
    columnCurrentPage?: number;
    /**
     * It allows to set the current row page count displayed in the pivot table.
     */
    rowCurrentPage?: number;
    /**
     * Allows large amounts of data to be loaded without any degradation of performance by compressing raw data on the basis of its uniqueness. 
     * These unique records will be provided as input to render the pivot table. 
     * 
     * For example, if the pivot table is connected to a million raw data with a combination of 1,000 unique data, it will be compressed to 1,000 unique data. 
     * By doing so, the time taken to render the pivot table will be drastically reduced, i.e. the pivot table will takes a maximum of 3 seconds instead of 10 seconds to complete its rendering.
     * These compressed data will also be used for further operations at all times to reduce the looping complexity and improves pivot table's performance while updating during runtime.
     * > This property is applicable only for relational data source.
     */
    allowDataCompression?: boolean;
}
/**
 * @hidden
 */
export interface IMatrix2D {
    [key: number]: { [key: number]: number };
    length: number;
    push(item: number): number;
}
/**
 * @hidden
 */
interface ISortedHeaders {
    rMembers: IAxisSet[];
    cMembers: IAxisSet[];
}
/**
 * @hidden
 */
export interface IFilterObj {
    [key: string]: {
        memberObj: IStringIndex
    };
}
/**
 * @hidden
 */
export interface IIterator {
    [key: string]: {
        index: number[],
        indexObject: INumberIndex
    };
}
/**
 * @hidden
 */
export interface INumberIndex {
    [key: string]: number;
}
/**
 * @hidden
 */
export interface INumberArrayIndex {
    [key: string]: number[];
}
/**
 * @hidden
 */
export interface IStringIndex {
    [key: string]: string;
}
/**
 * @hidden
 */
export interface IPivotValues {
    [key: number]: IPivotRows;
    length: number;
}
/**
 * @hidden
 */
export interface IPivotRows {
    [key: number]: number | string | Object | IAxisSet;
    length: number;
}
/**
 * @hidden
 */
export interface IGridValues {
    [key: number]: IAxisSet[];
    length: number;
}
/**
 * @hidden
 */
export interface ISelectedValues {
    [key: number]: IAxisSet;
}
/**
 * @hidden
 */
export interface IDataSet {
    [key: string]: string | number | Date;
}

/**
 * Allows specific fields associated with field information that needs to be displayed in the field axes of pivot table. The following configurations which are applicable are as follows:
 */
export interface IFieldOptions {
    /**
     * Allows you to set the field name that needs to be displayed in row/column/value/filter axis of pivot table.
     */
    name?: string;
    /**
     * Allows you to set caption to the specific field. It will be used to display instead of its name in pivot table component's UI.
     */
    caption?: string;
    /**
     * Allows to display the values in the pivot table with appropriate aggregations such as sum, product, count, average, etc… The available types are,
     * * `Sum`: Allows to display the pivot table values with sum.
     * * `Product`: Allows to display the pivot table values with product.
     * * `Count`: Allows to display the pivot table values with count.
     * * `DistinctCount`: Allows to display the pivot table values with distinct count.
     * * `Min`: Allows to display the pivot table with minimum value.
     * * `Max`: Allows to display the pivot table with maximum value.
     * * `Avg`: Allows to display the pivot table values with average.
     * * `Median`: Allows to display the pivot table values with median.
     * * `Index`: Allows to display the pivot table values with index.
     * * `PopulationStDev`: Allows to display the pivot table values with population standard deviation.
     * * `SampleStDev`: Allows to display the pivot table values with sample standard deviation.
     * * `PopulationVar`: Allows to display the pivot table values with population variance.
     * * `SampleVar`: Allows to display the pivot table values with sample variance.
     * * `RunningTotals`: Allows to display the pivot table values with running totals.
     * * `DifferenceFrom`: Allows to display the pivot table values with difference from the value of the base item in the base field.
     * * `PercentageOfDifferenceFrom`: Allows to display the pivot table values with percentage difference from the value of the base item in the base field.
     * * `PercentageOfGrandTotal`: Allows to display the pivot table values with percentage of grand total of all values.
     * * `PercentageOfColumnTotal`: Allows to display the pivot table values in each column with percentage of total values for the column.
     * * `PercentageOfRowTotal`: Allows to display the pivot table values in each row with percentage of total values for the row.
     * * `PercentageOfParentTotal`: Allows to display the pivot table values with percentage of total of all values based on selected field.
     * * `PercentageOfParentColumnTotal`: Allows to display the pivot table values with percentage of its parent total in each column.
     * * `PercentageOfParentRowTotal`: Allows to display the pivot table values with percentage of its parent total in each row.
     * * `CalculatedField`: Allows to display the pivot table with calculated field values. It allows user to create a new calculated field alone.
     * 
     * > It is applicable only for relational data source.
     */
    type?: SummaryTypes;
    /**
     * Allows you to set the axis name to the specific field. This will help to display the field in specified axis such as row/column/value/filter axis of pivot table.
     */
    axis?: string;
    /**
     * Allows you to display all members items of a specific field to the pivot table, even doesn't have any data in its row/column intersection in data source. 
     * > It is applicable only for relational data source.
     */
    showNoDataItems?: boolean;
    /**
     * Allows you to set the selective field, which used to display the values with either DifferenceFrom or PercentageOfDifferenceFrom or PercentageOfParentTotal aggregate types. 
     * > It is applicable only for relational data source.
     */
    baseField?: string;
    /**
     * Allows you to set the selective item of a specific field, which used to display the values with either DifferenceFrom or PercentageOfDifferenceFrom aggregate types. 
     * The selective item should be set the from field specified in the baseField property. 
     * > It is applicable only for relational data source.
     */
    baseItem?: string;
    /**
     * Allows to show or hide sub-totals to a specific field in row/column axis of the pivot table.
     */
    showSubTotals?: boolean;
    /**
     * Allows you to set whether the specified field is a named set or not. 
     * In general, the named set is a set of dimension members or a set expression (MDX query) to be created as a dimension in the SSAS OLAP cube itself. 
     * > It is applicable only for OLAP data source.
     */
    isNamedSet?: boolean;
    /**
     * Allows to set whether the specified field is a calculated field or not. In general, a calculated field is created from the bound data source or using simple formula with basic arithmetic operators in the pivot table.
     * > This option is applicable only for OLAP data source.
     */
    isCalculatedField?: boolean;
    /** 
     * Allows you to show or hide the filter icon of a specific field that used to be displayed on the pivot button of the grouping bar and field list UI. 
     * This filter icon is used to filter the members of a specified field at runtime in the pivot table.
     */
    showFilterIcon?: boolean;
    /** 
     * Allows you to show or hide the sort icon of a specific field that used to be displayed in the pivot button of the grouping bar and field list UI. 
     * This sort icon is used to order members of a specified field either in ascending or descending at runtime.
     */
    showSortIcon?: boolean;
    /** 
     * Allows you to show or hide the remove icon of a specific field that used to be displayed in the pivot button of the grouping bar and field list UI. 
     * This remove icon is used to remove the specified field during runtime.
     */
    showRemoveIcon?: boolean;
    /** 
     * Allows you to show or hide the value type icon of a specific field that used to be displayed in the pivot button of the grouping bar and field list UI. 
     * This value type icon helps to select the appropriate aggregation type to specified value field at runtime.
     */
    showValueTypeIcon?: boolean;
    /** 
     * Allows you to show or hide the edit icon of a specific field that used to be displayed on the pivot button of the grouping bar and field list UI. 
     * This edit icon is used to modify caption, formula, and format of a specified calculated field at runtime that to be displayed in the pivot table.
     */
    showEditIcon?: boolean;
    /**
     * Allows you to restrict the specific field's pivot button that is used to drag on runtime in the grouping bar and field list UI. 
     * This will prevent you from modifying the current report.
     */
    allowDragAndDrop?: boolean;
    //filter?: FilterOptions;
    /**
     * Allows to specify the data type of specific field.
     */
    dataType?: string;
}

/**
 * Allows specific fields associated with sort settings to order their members either in ascending or descending that used to be displayed in the pivot table.
 */
export interface ISort {
    /**
     * Allows to set the field name to order their members either in ascending or descending in the pivot table.
     */
    name?: string;
    //type?: string;
    /**
     * Allows to apply sorting to the specified field either by ascending or descending or JSON order. The types are,
     * * `Ascending`: It allows to display the field members in ascending order. 
     * * `Descending`: It allows to display the field members in descending order.
     * * `None`: It allows to display the field members based on JSON order. 
     */
    order?: Sorting;
}

/** 
 * Allows specific fields associated with either selective or conditional-based filter members that used to be displayed in the pivot table.
 */
export interface IFilter {
    /**
     * Allows you to set the field name that used to display the selective or conditional-based filter members that used to be displayed in the pivot table.
     */
    name?: string;
    /**
     * Allows you to set the specific filter type to display the filter members in the pivot table. They are:
     * * Include - Specifies the filter type as include.
     * * Exclude - Specifies the filter type as exclude.
     * * Label - Specifies the filter type as label.
     * * Date - Specifies the filter type as date.
     * * Number - Specifies the filter type as number.
     * * Value - Specifies the filter type as value.
     * @default Include
     */
    type?: FilterType;
    /**
     * Allows yoy to specify the field members that used to be displayed based on the filter type provided in the pivot table.
     */
    items?: string[];
    /**
     * Allows you to choose the operator type such as equals, greater than, less than, etc. for conditional-based filtering.
     * > It is applicable only for label and value filtering.
     */
    condition?: Operators;
    /**
     * Allows you to set the start value to display the filter items in the pivot table based on the condition applied.
     * > It is applicable only for label and value filtering.
     */
    value1?: string | Date;
    /**
     * Allows you to set the end value to display the filter items in the pivot table based on the condition applied.
     * > This option will be used by default when the operator **Between** and **NotBetween** is chosen to apply. Also, it is applicable only for label and value filtering.
     */
    value2?: string | Date;
    /**
     * It allows excel-like label filtering operation through UI and code-behind.
     */
    showLabelFilter?: boolean;
    /**
     * It allows excel-like date filtering operation through UI and code-behind.
     */
    showDateFilter?: boolean;
    /**
     * It allows excel-like number filtering operation through UI and code-behind.
     */
    showNumberFilter?: boolean;
    /**
     * Allows to set value field for evaluation using conditions and operands for filtering.
     * > It is applicable only for label and value filtering.
     */
    measure?: string;
    /**
     * Allows to set level of the field to fetch data from the cube for filtering.
     * > This option is applicable only for user-defined hierarchies in OLAP data source.
     */
    levelCount?: number;
    /**
     * Allows to set level name of a specified field, where the filtering settings to be applied.
     * > This option is applicable only for user-defined hierarchies in OLAP data source.
     */
    selectedField?: string;
}

/** 
 * Allows specific fields used to display their the headers to be either expanded or collapsed in the pivot table.
 */
export interface IDrillOptions {
    /**
     * It allows to set the field name whose members to be either expanded or collapsed in the pivot table.
     */
    name?: string;
    /**
     * It allows to set the members to be either expanded or collapsed in the pivot table.
     */
    items?: string[];
    /**
     * It allows to set the delimiter, which is used a separator to split the given members.
     */
    delimiter?: string;
}

/** 
 * Allows options to create new calculated fields from the bound data source or using simple formula with basic arithmetic operators in the pivot table.
 */
export interface ICalculatedFieldSettings {
    /**
     * It allows to set the field name that used to create as a calculated field.
     */
    name?: string;
    /**
     * It allows to set the formula/expression to the specified calculated field. 
     */
    formula?: string;
    /**
     * It allows to set hierarchy unique name, that used to create calculated member.
     * > It is applicable only for OLAP data source.
     */
    hierarchyUniqueName?: string;
    /**
     * It allows to set format string that used to create calculated member with specified formatted values that to be displayed in the pivot table.
     * > It is applicable only for OLAP data source.
     */
    formatString?: string;
}
/** 
 * Configures the specific calculated field infomation.
 */
export interface ICalculatedFields extends ICalculatedFieldSettings {
    /**
     * It allows to set the caption to the calcualted field that used to be displayed in the pivot table UI.
     */
    caption?: string;
    /**
     * It allows to set the caluclated field's actual formula.
     */
    actualFormula?: string;
}

/** 
 * Allows specific fields used to display the values with specific format that used to be displayed in the pivot table.
 * For example, to display a specific field with currency formatted values in the pivot table, the set the `format` property to be **C**. 
 */
export interface IFormatSettings extends NumberFormatOptions, DateFormatOptions {
    /**
     * It allows to set the field name to apply format settings.
     */
    name?: string;
}
/**
 * @hidden
 */
export interface IMembers {
    [index: string]: {
        ordinal?: number;
        index?: number[];
        name?: string;
        isDrilled?: boolean;
        isNodeExpand?: boolean;
        parent?: string;
        caption?: string;
        isSelected?: boolean;
    };
}
/**
 * @hidden
 */
export interface IFieldListOptions {
    [index: string]: IField;
}

/** 
 * Allows you to configure the information retrieved from the data source for the field list. 
 */
export interface IField {
    /**
     * It allows to set the field name.
     */
    id?: string;
    /**
     * It allows to set the field caption.
     */
    caption?: string;
    /**
     * It allows to set the field type to be either number or string or data or datetime.
     */
    type?: string;
    /**
     * It allows to set the current number format string of the field.
     */
    formatString?: string;
    /**
     * It allows to set the exact position of the specific field situated in the given data source.
     */
    index?: number;
    /**
     * It allows to set members infomration of the specific field.
     */
    members?: IMembers;
    /**
     * It allows to set members caption infomration of the specific field.
     */
    formattedMembers?: IMembers;
    /**
     * It allows to set date members infomration of the specific field.
     */
    dateMember?: IAxisSet[];
    /**
     * It allows to set the current filter members to the specific field.
     */
    filter?: string[];
    /**
     * It allows to set the current sort order to the specific field.
     */
    sort?: string;
    /**
     * It allows to set the current aggregate type to the specific field.
     */
    aggregateType?: string;
    /**
     * It allows to set the selective field name to the field to perform aggregation.
     */
    baseField?: string;
    /**
     * It allows to set the selective member of the specific field to perform aggregation.
     */
    baseItem?: string;
    /**
     * It allows to change the specific field's type.
     */
    filterType?: string;
    /**
     * It allows to set the format to the specific field.
     */
    format?: string;
    /**
     * It allows to set the calculated field formula.
     */
    formula?: string;
    /**
     * Allows to set whether the specific field is selected or not.
     */
    isSelected?: boolean;
    /**
     * Allows to set the specific field for excel-like filtering.
     */
    isExcelFilter?: boolean;
    /**
     * Allows to set the specific field to display the data items that are not in combination with respect to current report.
     */
    showNoDataItems?: boolean;
    /**
     * Allows to set wheather the specific field is custom grouped or not.
     */
    isCustomField?: boolean;
    /** 
     * It allows to set the visibility of filter icon in grouping bar and field list button.
     */
    showFilterIcon?: boolean;
    /** 
     * It allows to set the visibility of sort icon in grouping bar and field list button.
     */
    showSortIcon?: boolean;
    /** 
     * It allows to set the visibility of remove icon in grouping bar button.
     */
    showRemoveIcon?: boolean;
    /** 
     * It allows to set the visibility of calculated field edit icon in grouping bar and field list button.
     */
    showEditIcon?: boolean;
    /** 
     * It allows to set the visibility of summay type drop down icon in grouping bar and field list button.
     */
    showValueTypeIcon?: boolean;
    /**
     * It allows to enable/disable the drag and drop option to grouping bar and field list button.
     */
    allowDragAndDrop?: boolean;
    /**
     * Allows to set whether is is a calculated field or not.
     */
    isCalculatedField?: boolean;
    /**
     * It allows enable/disable sub total in pivot table.
     */
    showSubTotals?: boolean;
}

/** 
 * Allows you to configure the pivot cell information retrieved from the data source.
 */
export interface IAxisSet {
    /**
     * It allows to set the formatted text.
     */
    formattedText?: string;
    /**
     * It allows to set the actual text.
     */
    actualText?: number | string;
    /**
     * It allows to set the member type.
     */
    type?: string;
    /**
     * It allows to set whether the member is driled or not.
     */
    isDrilled?: boolean;
    /**
     * It allows to set whether the member has children or not.
     */
    hasChild?: boolean;
    /**
     * It allows to set the child members collection of the specific member.
     */
    members?: this[];
    /**
     * Specifies its position collections in data source.
     */
    index?: number[];
    /**
     * Specifies its position collections in data source with indexed object.
     */
    indexObject?: INumberIndex;
    /**
     * It allows to set the cell ordinal.
     */
    ordinal?: number;
    /**
     * It allows to set level of the member.
     */
    level?: number;
    /**
     * It allows to set the axis name of the member.
     */
    axis?: string;
    /**
     * It allows to set value of the cell.
     */
    value?: number;
    /**
     * It allows to set actual value of the cell.
     */
    actualValue?: number;
    /**
     * It allows to set column span to the cell.
     */
    colSpan?: number;
    /**
     * It allows to set row span to the cell.
     */
    rowSpan?: number;
    /**
     * Specifies the data collection which is to be framed for value sorted members.
     */
    valueSort?: IDataSet;
    /**
     * It allows to set column index to the cell.
     */
    colIndex?: number;
    /**
     * It allows to set row index to the cell.
     */
    rowIndex?: number;
    /**
     * Specifies the column header of a value cell.
     */
    columnHeaders?: string | number | Date;
    /**
     * Specifies the row header of a value cell.
     */
    rowHeaders?: string | number | Date;
    /**
     * Specifies whether the cell is summary or not.
     */
    isSum?: boolean;
    /**
     * Specifies whether the cell is grand summary or not.
     */
    isGrandSum?: boolean;
    /**
     * Specifies whether the level of the cell is filtered or not.
     */
    isLevelFiltered?: boolean;
    /**
     * It allows to custom class names to the cell.
     */
    cssClass?: string;
    /**
     * It allows to set the style information for conditional formatting.
     */
    style?: IStyle;
    /**
     * It allows to set the visibility of hyperlink to the cell.
     */
    enableHyperlink?: boolean;
    /**
     * It allows enable/disable sub totals.
     */
    showSubTotals?: boolean;
    /**
     * It allows set the formatted date string of the cell.
     */
    dateText?: number | string;
    /**
     * It allows to set member type.
     */
    memberType?: number;
    /**
     * It allows to set the parent unique name.
     */
    parentUniqueName?: string;
    /**
     * It allows to set the parent unique name.
     */
    levelUniqueName?: string;
    /**
     * It allows to set whether the member field is a attribute hierarchy or not.
     */
    hierarchy?: string;
    /**
     * It allows to set column ordinal of the cell.
     */
    colOrdinal?: number;
    /**
     * It allows to set row ordinal of the cell.
     */
    rowOrdinal?: number;
    /**
     * It allows to set whether field is a namedset or not.
     */
    isNamedSet?: boolean;
    /**
     * It allows to set depth of the cell.
     */
    depth?: number;
}
/** 
 * Allows you to configure the drill information of a specific field item that used to display the pivot table.
 */
export interface IDrilledItem {
    /**
     * It allows to set the field name whose members to be drilled.
     */
    fieldName: string;
    /**
     * It allows to set the member name of the specific field.
     */
    memberName: string;
    /**
     * It allows to set the axis name of the specific field.
     */
    axis: string;
    /**
     * It allows to set whether the member performs drill-down or drill-up operation.
     */
    action: string;
    /**
     * It allows to set the delimiter, which is used a member separator.
     */
    delimiter: string;
    /**
     * It allows to set the selelcted cell information.
     */
    currentCell?: IAxisSet;
}
/** 
 * Allows you to configure the additional properties from the pivot component to popuplate the pivot engine. 
 */
export interface ICustomProperties {
    /**
     * Specifies the current data type.
     */
    mode?: string;
    /**
     * Specifies the saved field list infomration.
     */
    savedFieldList?: IFieldListOptions;
    /**
     * Specifies the paging infomration for virtualization.
     */
    pageSettings?: IPageSettings;
    /**
     * Specifies the whether the value sorting is enabled or not.
     */
    enableValueSorting?: boolean;
    /**
     * Specifies the whther drill through is enabled or not.
     */
    isDrillThrough?: boolean;
    /**
     * Specifies the current locale information of the component.
     */
    localeObj?: L10n;
    /**
     * Specifies the customized field type information.
     */
    fieldsType?: IStringIndex;
    /**
     * Specifies the cloned report.
     */
    clonedReport?: IDataOptions;
}
/**
 * @hidden
 */
interface IHeadersInfo {
    axis: string;
    headers: IAxisSet[];
    fields: IFieldOptions[];
    position: number;
}
/**
 * @hidden
 */
interface ValueSortData {
    rowData: IDataSet[];
    childMembers: this[];
}

/**
 * @hidden
 */
interface IHeaderData {
    name: string;
    level: number;
    axis: string;
    isChild: boolean;
    valueCount: number;
    aggregateHeaders: IAxisSet[];
    childMembers: this[];
    value: string;
    type: SummaryTypes;
    uniqueName: string;
}

/**
 * @hidden
 */
interface AggregateCollection {
    selectedHeader: IHeaderData[];
    values: string[];
}

/**
 * @hidden
 */
interface IValueFilterSettings {
    [index: string]: IFilter;
}
/**
 * @hidden
 */
interface IValueFields {
    [index: string]: IFieldOptions;
}
/** 
 * Allows specific fields to group their data on the basis of their type. 
 * For example, the date type fields can be formatted and displayed based on year, quarter, month, and more. Likewise, the number type fields can be grouped range-wise, such as 1-5, 6-10, etc. 
 * You can perform custom group to the string type fields that used to displayed in the pivot table.
 */
export interface IGroupSettings {
    /**
     * It allows to set the specific field name to apply group settings.
     */
    name?: string;
    /**
     * It allows to specify the date group intervals such as years or quarter or months or days or hours or minutes or seconds to group fields based on that in the pivot table. They options are:
     * * Years - Specifies the group as years.
     * * Quarters - Specifies the group as quarters.
     * * Months - Specifies the group as months.
     * * Days - Specifies the group as days.
     * * Hours - Specifies the group as hours.
     * * Minutes - Specifies the group as minutes.
     * * Seconds - Specifies the group as seconds.
     * 
     * > It is applicable only for date type grouping.
     */
    groupInterval?: DateGroup[];
    /**
     * It allows to set the start value/date to group fields from the specified range that to be displayed in the pivot table.
     */
    startingAt?: Date | number | string;
    /**
     * It allows to set the start value/date to group fields to the specified range that to be displayed in the pivot table.
     */
    endingAt?: Date | number | string;
    /**
     * It allows to set the interval range to group field based on the specified range.
     * > It is applicable only of number type grouping.
     */
    rangeInterval?: number;
    /**
     * It allows to set the type as date or number or custom to the specified field for apply grouping. The types are:
     * * Date - Defines group type as 'Date' for date type field
     * * Number - Defines group type as 'Number' for numeric type field.
     * * Custom - Defines group type as 'Custom' for custom group field.
     */
    type?: GroupType;
    /**
     * It allows to set the caption to custom field that will be used to created from custom group fields in the pivot table.
     * > It is applicable only for custom grouping.
     */
    caption?: string;
    /**
     * It allows to set the custom group information to create custom group fields.
     * > It is applicable only for custom grouping.
     */
    customGroups?: ICustomGroups[];
}

/** 
 * Allows to specify the custom group information of specific field to create custom groups. 
 */
export interface ICustomGroups {
    /**
     * Allows user to set the group name (or title) for selected headers for custom grouping.
     */
    groupName?: string;
    /**
     * It allows to set the headers which needs to be grouped from display.
     */
    items?: string[];
}

/** 
 * Allows to configure the group range infomration to perform date and number grouping on specifc fields. 
 */
export interface IGroupRange {
    /**
     * Specifies the group range value.
     */
    range?: string;
    /**
     * Specifies whether the group value is in range or not.
     */
    isNotInRange?: boolean;
    /**
     * Specifies the actual value exists in the raw item.
     */
    value?: Date | number;
}

/** 
 * Allows to configure the specific field infomration during UI operation at runtime. 
 */
export interface FieldItemInfo {
    /**
     * Specifies the field name.
     */
    fieldName?: string;
    /**
     * Specifies the field information as an object.
     */
    fieldItem?: IFieldOptions;
    /**
     * Specifies the axis name where the field currently exists.
     */
    axis?: string;
    /**
     * Specifies the position of the field in the exis.
     */
    position?: number;
}
