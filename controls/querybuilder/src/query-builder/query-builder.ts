/**
 * Query Builder Source
 */
import { Component, INotifyPropertyChanged, NotifyPropertyChanges, getComponent, MouseEventArgs, Browser } from '@syncfusion/ej2-base';
import { Property, ChildProperty, Complex, L10n, closest, extend, isNullOrUndefined, Collection } from '@syncfusion/ej2-base';
import { getInstance, addClass, removeClass, rippleEffect, detach, classList } from '@syncfusion/ej2-base';
import { Internationalization, DateFormatOptions } from '@syncfusion/ej2-base';
import { QueryBuilderModel, ShowButtonsModel, ColumnsModel, RuleModel } from './query-builder-model';
import { Button, RadioButton, ChangeEventArgs as ButtonChangeEventArgs } from '@syncfusion/ej2-buttons';
import { DropDownList, ChangeEventArgs as DropDownChangeEventArgs, FieldSettingsModel, CheckBoxSelection } from '@syncfusion/ej2-dropdowns';
import { MultiSelect, MultiSelectChangeEventArgs, PopupEventArgs  } from '@syncfusion/ej2-dropdowns';
import { EmitType, Event, EventHandler, getValue, Animation, BaseEventArgs } from '@syncfusion/ej2-base';
import { Query, Predicate, DataManager, Deferred } from '@syncfusion/ej2-data';
import { TextBox, NumericTextBox, InputEventArgs, ChangeEventArgs as InputChangeEventArgs } from '@syncfusion/ej2-inputs';
import { DatePicker, ChangeEventArgs as CalendarChangeEventArgs } from '@syncfusion/ej2-calendars';
import { DropDownButton, ItemModel, MenuEventArgs } from '@syncfusion/ej2-splitbuttons';
import { Tooltip, createSpinner, showSpinner, hideSpinner } from '@syncfusion/ej2-popups';
type ReturnType = { result: Object[], count: number, aggregates?: Object };
MultiSelect.Inject(CheckBoxSelection);
export class Columns extends ChildProperty<Columns> {
    /**
     * Specifies the fields in columns.
     * @default null
     */
    @Property(null)
    public field: string;
    /**
     * Specifies the labels name in columns
     * @default null
     */
    @Property(null)
    public label: string;
    /**
     * Specifies the types in columns field
     * @default null
     */
    @Property(null)
    public type: string;
    /**
     * Specifies the values in columns or bind the values from sub controls.
     * @default null
     */
    @Property(null)
    public values: string[] | number[] | boolean[];
    /**
     * Specifies the operators in columns.
     * @default null
     */
    @Property(null)
    public operators: { [key: string]: Object }[];
    /**
     * Specifies the template for value field such as slider or any other widgets.
     * @default null
     */
    @Property(null)
    public template: TemplateColumn;
    /**
     * Specifies the validation for columns (text, number and date).
     * @default  { isRequired: true , min: 0, max: Number.MAX_VALUE }
     */
    @Property({ isRequired: true , min: 0, max: Number.MAX_VALUE })
    public validation: Validation;
    /**
     * Specifies the date format for columns.
     * @default null
     */
    @Property(null)
    public format: string;
    /**
     * Specifies the step value(numeric textbox) for columns.
     * @default null
     */
    @Property(null)
    public step: number;
    /**
     * Specifies the default value for columns.
     * @default null
     */
    @Property(null)
    public value:  string[] | number[] | string | number | boolean | Date;
    /**
     * Specifies the category for columns.
     * @default null
     */
    @Property(null)
    public category: string;
}
export class Rule extends ChildProperty<Rule> {
    /**
     * Specifies the condition value in group.
     * @default null
     */
    @Property(null)
    public condition: string;
    /**
     * Specifies the rules in group.
     * @default []
     */
    @Collection<RuleModel>([], Rule)
    public rules: RuleModel[];
    /**
     * Specifies the field value in group.
     * @default null
     */
    @Property(null)
    public field: string;
    /**
     * Specifies the label value in group.
     * @default null
     */
    @Property(null)
    public label: string;
    /**
     * Specifies the type value in group.
     * @default null
     */
    @Property(null)
    public type: string;
    /**
     * Specifies the operator value in group.
     * @default null
     */
    @Property(null)
    public operator: string;
    /**
     * Specifies the sub controls value in group.
     * @default null
     */
    @Property(null)
    public value: string[] | number[] | string | number | boolean;
}

export class ShowButtons extends ChildProperty<ShowButtons> {
    /**
     * Specifies the boolean value in ruleDelete that the enable/disable the buttons in rule.
     * @default true
     */
    @Property(true)
    public ruleDelete: boolean;
    /**
     * Specifies the boolean value in groupInsert that the enable/disable the buttons in group.
     * @default true
     */
    @Property(true)
    public groupInsert: boolean;
    /**
     * Specifies the boolean value in groupDelete that the enable/disable the buttons in group.
     * @default true
     */
    @Property(true)
    public groupDelete: boolean;
}
/** 
 * Specify Specifies the displayMode as Horizontal or Vertical.
 */
export type DisplayMode =
    /**  Display the Horizontal UI */
    'Horizontal' |
    /**  Display the Vertical UI */
    'Vertical';
/** 
 * Specifies the sort direction of the field names. They are
 * * Default
 * * Ascending
 * * Descending
 */
export type SortDirection =
    /**  Show the field names in default */
    'Default' |
    /**  Show the field names in Ascending */
    'Ascending' |
    /**  Show the field names in Descending */
    'Descending';

@NotifyPropertyChanges

export class QueryBuilder extends Component<HTMLDivElement> implements INotifyPropertyChanged {
    private groupIdCounter: number;
    private ruleIdCounter: number;
    private btnGroupId: number;
    private levelColl: Level;
    private isImportRules: boolean;
    private isPublic: boolean;
    private parser: string[][];
    private defaultLocale: Object;
    private l10n: L10n;
    private intl: Internationalization;
    private items: ItemModel[];
    private customOperators: Object;
    private operators: Object;
    private ruleElem: Element;
    private groupElem: Element;
    private dataColl: object[];
    private dataManager: DataManager;
    private fields: Object;
    private selectedColumn: ColumnsModel;
    private isOperatorRendered: boolean;
    private isValueRendered: boolean;
    private actionButton: Element;
    private isInitialLoad: boolean;
    /** 
     * Triggers when the component is created.
     * @event
     * @blazorProperty 'Created'
     */
    @Event()
    public created: EmitType<Event>;
    /**
     * Triggers before the condition (And/Or), field, operator, value is changed.
     * @event
     * @blazorProperty 'OnValueChange'
     */
    @Event()
    public beforeChange: EmitType<ChangeEventArgs>;
    /**
     * Triggers when changing the condition(AND/OR), field, value, operator is changed
     * @event
     * @blazorProperty 'Changed'
     */
    @Event()
    public change: EmitType<ChangeEventArgs>;
    /**
     * Triggers when changing the condition(AND/OR), field, value, operator is changed
     * @event
     * @blazorProperty 'RuleChanged'
     */
    @Event()
    public ruleChange: EmitType<RuleChangeEventArgs>;
    /**
     * Specifies the showButtons settings of the query builder component.
     * The showButtons can be enable Enables or disables the ruleDelete, groupInsert, and groupDelete buttons.
     * @default { ruleDelete: true , groupInsert: true, groupDelete: true }
     */
    @Property({ ruleDelete: true, groupInsert: true, groupDelete: true })
    public showButtons: ShowButtonsModel;
    /**
     * Shows or hides the filtered query.
     * @default false
     */
    @Property(false)
    public summaryView: boolean;
    /**
     * Enables or disables the validation.
     * @default false
     */
    @Property(false)
    public allowValidation: boolean;
    /**
     * Specifies columns to create filters.
     * @default {}
     */
    @Property([])
    public columns: ColumnsModel[];
    /**
     * Defines class or multiple classes, which are separated by a space in the QueryBuilder element.
     * You can add custom styles to the QueryBuilder using the cssClass property.
     * @default ''
     */
    @Property('')
    public cssClass: string;
    /**
     * Binds the column name from data source in query-builder.
     * The `dataSource` is an array of JavaScript objects.
     * @default []
     */
    @Property([])
    public dataSource: Object[] | Object | DataManager;
    /**
     * Specifies the displayMode as Horizontal or Vertical.
     * @default 'Horizontal'
     */
    @Property('Horizontal')
    public displayMode: DisplayMode;
    /**
     * Enable or disable persisting component's state between page reloads. 
     * If enabled, filter states will be persisted.
     * @default false.
     */
    @Property(false)
    public enablePersistence: boolean;
    /**
     * Specifies the sort direction of the field names.
     * @default 'Default'
     */
    @Property('Default')
    public sortDirection: SortDirection;
    /**
     * Specifies the maximum group count or restricts the group count.
     * @default 5
     */
    @Property(5)
    public maxGroupCount: number;
    /**
     * Specifies the height of the query builder.
     * @default 'auto'
     */
    @Property('auto')
    public height: string;
    /**
     * Specifies the width of the query builder.
     * @default 'auto'
     */
    @Property('auto')
    public width: string;
    /**
     * If match case is set to true, the grid filters the records with exact match. 
     * if false, it filters case insensitive records (uppercase and lowercase letters treated the same).
     * @default false
     */
    @Property(false)
    public matchCase: boolean;
    /**
     * Defines rules in the QueryBuilder.
     * Specifies the initial rule, which is JSON data.
     * @default {}
     */
    @Complex<RuleModel>({ condition: 'and', rules: [] }, Rule)
    public rule: RuleModel;

    constructor(options?: QueryBuilderModel, element?: string | HTMLDivElement) {
        super(options, <string | HTMLDivElement>element);
    }

    protected getPersistData(): string {
        return this.addOnPersist(['rule']);
    }
    /**
     * Clears the rules without root rule.
     * @returns void.
     */
    public reset(): void {
        this.isImportRules = false;
        let bodeElem: Element = this.element.querySelector('.e-group-body');
        bodeElem.innerHTML = '';
        (this.element.querySelector('.e-btngroup-and') as HTMLInputElement).checked = true;
        bodeElem.appendChild(this.createElement('div', { attrs: { class: 'e-rule-list' } }));
        this.levelColl[this.element.id + '_group0'] = [0];
        this.rule = { condition: 'and', rules: [] };
    }
    private getWrapper(): Element {
        return this.element;
    }
    protected getModuleName(): string {
        return 'query-builder';
    }
    private initialize(): void {
        if (this.dataColl.length) {
            let columnKeys: string[] = Object.keys(this.dataColl[0]);
            let cols: ColumnsModel[] = [];
            let type: string; let groupBy: boolean = false;
            let isDate: boolean = false; let value: string | number | boolean | Object;
            let validateObj: Validation = {isRequired: true, min: 0, max: Number.MAX_VALUE};
            if (this.columns.length) {
                this.columnSort();
                let columns: ColumnsModel[] = this.columns;
                for (let i: number = 0, len: number = columns.length; i < len; i++) {
                    if (!columns[i].type) {
                        if (columnKeys.indexOf(columns[i].field) > -1) {
                            value = this.dataColl[0][columns[i].field];
                            type = typeof value;
                            if (type === 'string') {
                                isDate = !isNaN(Date.parse(value as string));
                            } else if (type === 'object') {
                                isDate = value instanceof Date && !isNaN(value.getTime());
                                type = 'string';
                            }
                            columns[i].type = type;
                            isDate = false;
                        }
                        type = 'string';
                    }
                    if (!columns[i].validation) {
                        columns[i].validation = validateObj;
                    }
                    if (columns[i].category) {
                        groupBy = true;
                    } else {
                        columns[i].category = this.l10n.getConstant('OtherFields');
                    }
                }
                if (groupBy) {
                    this.fields = { text: 'label', value: 'field', groupBy: 'category' };
                }
            } else {
                for (let i: number = 0, len: number = columnKeys.length; i < len; i++) {
                    value = this.dataColl[0][columnKeys[i]];
                    type = typeof value;
                    if (type === 'string') {
                        isDate = !isNaN(Date.parse(value as string));
                    } else if (type === 'object') {
                        isDate = value instanceof Date && !isNaN(value.getTime());
                        type = 'string';
                    }
                    cols[i] = { 'field': columnKeys[i], 'label': columnKeys[i], 'type': isDate ? 'date' : type,
                    'validation': validateObj } as Columns;
                    isDate = false;
                }
                this.columns = cols as Columns[];
            }
        } else if (this.columns.length) {
            let columns: ColumnsModel[] = this.columns;
            for (let i: number = 0, len: number = columns.length; i < len; i++) {
                if (columns[i].category) {
                        this.fields = { text: 'label', value: 'field', groupBy: 'category' };
                } else {
                    columns[i].category = this.l10n.getConstant('OtherFields');
                }
            }
        }
    }

    private clickEventHandler(event: MouseEventArgs): void {
        let target: Element = event.target as Element; let args: ChangeEventArgs;
        this.isImportRules = false; let groupID: string;
        if (target.tagName === 'SPAN') {
            target = target.parentElement;
        }
        if (target.className.indexOf('e-collapse-rule') > -1) {
            let animation: Animation = new Animation({ duration: 1000, delay: 0 });
            if (this.element.querySelectorAll('.e-summary-content').length < 1) {
                this.renderSummary();
            }
            let summaryElem: HTMLElement =  document.getElementById(this.element.id + '_summary_content');
            let txtareaElem: HTMLElement = summaryElem.querySelector('.e-summary-text');
            animation.animate('.e-query-builder', { name: 'SlideLeftIn' });
            let groupElem: HTMLElement = this.element.querySelector('.e-group-container') as HTMLElement;
            groupElem.style.display = 'none';
            txtareaElem.textContent = this.getSqlFromRules(this.rule);
            summaryElem.style.display = 'block';
            txtareaElem.style.height = txtareaElem.scrollHeight + 'px';
        }
        if (target.tagName === 'BUTTON') {
            if (target.className.indexOf('e-removerule') > -1) {
                this.actionButton = target;
                this.deleteRule(target);
            } else if (target.className.indexOf('e-deletegroup') > -1) {
                this.actionButton = target;
                this.deleteGroup(closest(target, '.e-group-container'));
            } else if (target.className.indexOf('e-edit-rule') > -1) {
                let animation: Animation = new Animation({ duration: 1000, delay: 0 });
                animation.animate('.e-query-builder' , { name: 'SlideLeftIn' });
                document.getElementById(this.element.id + '_summary_content').style.display = 'none';
                if (this.element.querySelectorAll('.e-group-container').length < 1) {
                    this.addGroupElement(false, this.element, this.rule.condition);
                    let mRules: RuleModel = extend({}, this.rule, {}, true);
                    this.setGroupRules(mRules);
                    this.renderSummaryCollapse();
                } else {
                    let groupElem: HTMLElement = this.element.querySelector('.e-group-container') as HTMLElement;
                    if (groupElem.querySelectorAll('.e-collapse-rule').length < 1) {
                        this.renderSummaryCollapse();
                    }
                    groupElem.style.display = 'block';
                }
            }
        } else if (target.tagName === 'LABEL' && target.parentElement.className.indexOf('e-btn-group') > -1) {
            let element: Element = closest(target, '.e-group-container');
            let forIdValue: string = target.getAttribute('for');
            let targetValue: string = document.getElementById(forIdValue).getAttribute('value');
            groupID = element.id.replace(this.element.id + '_', '');
            args = { groupID: groupID, cancel: false, type: 'condition', value: targetValue.toLowerCase() };
            if (!this.isImportRules) {
                this.trigger('beforeChange', args, (observedChangeArgs: ChangeEventArgs) => {
                    this.beforeSuccessCallBack(observedChangeArgs, target);
                });
            } else {
                this.beforeSuccessCallBack(args, target);
            }
        }
    }

    private beforeSuccessCallBack(args: ChangeEventArgs, target: Element): void {
        if (!args.cancel) {
            let element: Element = closest(target, '.e-group-container');
            let groupID: string =  element.id.replace(this.element.id + '_', '');
            let beforeRules: RuleModel = this.getValidRules(this.rule);
            let rule: RuleModel = this.getParentGroup(element);
            rule.condition = args.value as string;
            if (!this.isImportRules) {
                this.trigger('change', { groupID: groupID, type: 'condition', value: rule.condition });
            }
            this.filterRules(beforeRules, this.getValidRules(this.rule), 'condition');
        }
    }

    private selectBtn(target: Element, event: MenuEventArgs): void {
        if (event.name === 'beforeOpen') {
            if (this.showButtons.groupInsert) {
                removeClass([event.element.querySelector('li span.e-addgroup').parentElement], 'e-button-hide');
            } else {
                addClass([event.element.querySelector('li span.e-addgroup').parentElement], 'e-button-hide');
            }
        } else if (event.element.children[0].className.indexOf('e-addrule') > -1) {
            this.addRuleElement(closest(target, '.e-group-container'), {});
        } else if (event.element.children[0].className.indexOf('e-addgroup') > -1) {
            this.addGroupElement(true, closest(target, '.e-group-container'), '', true);
        }

    }
    private addRuleElement(target: Element, rule?: RuleModel): void {
        if (!target) {
            return;
        }
        let args: ChangeEventArgs = { groupID: target.id.replace(this.element.id + '_', ''), cancel: false, type: 'insertRule' };
        if (!this.isImportRules && !this.isInitialLoad) {
            this.trigger('beforeChange', args, (observedChangeArgs: ChangeEventArgs) => {
                this.addRuleSuccessCallBack(observedChangeArgs, target, rule);
            });
        } else {
            this.isInitialLoad = false;
            this.addRuleSuccessCallBack(args, target, rule);
        }
    }

    private addRuleSuccessCallBack(args: ChangeEventArgs, target: Element, rule: RuleModel): void {
        if (!args.cancel) {
            let ruleElem: Element = this.ruleElem.cloneNode(true) as Element;
            if (this.displayMode === 'Vertical' || this.element.className.indexOf('e-device') > -1) {
                ruleElem.className = 'e-rule-container e-vertical-mode';
            } else {
                ruleElem.className = 'e-rule-container e-horizontal-mode';
            }
            let groupLevel: number[]; let rules: RuleModel; let i: number; let len: number;
            let dropDownList: DropDownList;
            let ruleListElem: Element = target.querySelector('.e-rule-list');
            let element: Element = ruleElem.querySelector('button');
            let height: string; let ruleID: string;
            if (this.element.className.indexOf('e-device') > -1 || this.displayMode === 'Vertical') {
                element.textContent = this.l10n.getConstant('Remove');
                addClass([element], 'e-flat');
                addClass([element], 'e-primary');
            } else {
                addClass([element], 'e-round');
                addClass([element], 'e-icon-btn');
                let tooltip: Tooltip = new Tooltip({ content: this.l10n.getConstant('DeleteRule') });
                tooltip.appendTo(element as HTMLElement);
                element = this.createElement('span', { attrs: { class: 'e-btn-icon e-icons e-delete-icon' } });
                ruleElem.querySelector('button').appendChild(element);
            }
            ruleElem.setAttribute('id', target.id + '_rule' + this.ruleIdCounter);
            this.ruleIdCounter++;
            ruleElem.querySelector('.e-filter-input').setAttribute('id', ruleElem.id + '_filterkey');
            ruleListElem.appendChild(ruleElem);
            if (ruleElem.previousElementSibling && ruleElem.previousElementSibling.className.indexOf('e-rule-container') > -1) {
                if (ruleElem.className.indexOf('e-joined-rule') < 0) {
                    ruleElem.className += ' e-joined-rule';
                }
                if (ruleElem.previousElementSibling.className.indexOf('e-prev-joined-rule') < 0) {
                    ruleElem.previousElementSibling.className += ' e-prev-joined-rule';
                }
            }
            if (ruleElem.previousElementSibling && ruleElem.previousElementSibling.className.indexOf('e-group-container') > -1 &&
                ruleElem.className.indexOf('e-separate-rule') < 0) {
                ruleElem.className += ' e-separate-rule';
            }
            height = (this.element.className.indexOf('e-device') > -1) ? '250px' : '200px';
            dropDownList = new DropDownList({
                dataSource: this.columns as { [key: string]: Object }[], // tslint:disable-line
                fields: this.fields,
                placeholder: this.l10n.getConstant('SelectField'),
                popupHeight: ((this.columns.length > 5) ? height : 'auto'),
                change: this.changeField.bind(this),
                value: rule ? rule.field : null
            });
            dropDownList.appendTo('#' + ruleElem.id + '_filterkey');
            groupLevel = this.levelColl[target.id];
            this.selectedColumn = dropDownList.getDataByValue(dropDownList.value) as ColumnsModel;
            if (!this.isImportRules) {
                rules = this.rule as RuleModel;
                for (i = 0, len = groupLevel.length; i < len; i++) {
                    rules = this.findGroupByIdx(groupLevel[i], rules, i === 0);
                }
                if (Object.keys(rule).length) {
                    rules.rules.push({
                        'field': rule.field, 'type': rule.type, 'label': rule.label, 'operator': rule.operator, value: rule.value
                    });
                } else {
                    rules.rules.push({ 'field': '', 'type': '', 'label': '', 'operator': '', 'value': '' });
                }
            }
            if (Object.keys(rule).length) {
                this.changeRule(rule, {
                    element: dropDownList.element,
                    itemData: this.selectedColumn as FieldSettingsModel
                } as DropDownChangeEventArgs);
            }
            ruleID = ruleElem.id.replace(this.element.id + '_', '');
            if (!this.isImportRules) {
                this.trigger('change', { groupID: target.id.replace(this.element.id + '_', ''), ruleID: ruleID, type: 'insertRule' });
            }
        }
    }

    private renderToolTip(element: HTMLElement): void {
        let tooltip: Tooltip = new Tooltip({ content: this.l10n.getConstant('ValidationMessage'),
        position: 'BottomCenter', cssClass: 'e-querybuilder-error' });
        tooltip.appendTo(element);
        tooltip.open(element);
    }
    /**
     * Validate the conditions and it display errors for invalid fields.
     * @returns boolean.
     */
    public validateFields(): boolean {
        let isValid: boolean = true;
        if (this.allowValidation) {
            let i: number; let len: number; let fieldElem: Element; let indexElem: Element; let valArray: string[] | number[] = [];
            let groupElem: Element; let index: number; let dropDownObj: DropDownList; let tempElem: Element; let rule: RuleModel;
            let ruleElemCln: NodeListOf<Element> = this.element.querySelectorAll('.e-rule-container'); let validateRule: Validation;
            for (i = 0, len = ruleElemCln.length; i < len; i++) {
                groupElem = closest(ruleElemCln[i], '.e-group-container');
                rule = this.getParentGroup(groupElem);
                index = 0;
                indexElem = tempElem = ruleElemCln[i];
                dropDownObj = getComponent(ruleElemCln[i].querySelector('.e-rule-field input.e-control') as HTMLElement, 'dropdownlist');
                this.selectedColumn = dropDownObj.getDataByValue(dropDownObj.value) as ColumnsModel;
                validateRule = !isNullOrUndefined(dropDownObj.index) && (this.selectedColumn as ColumnsModel).validation;
                fieldElem = tempElem.querySelector('.e-rule-field input.e-control');
                if (validateRule && validateRule.isRequired) {
                    while (indexElem && indexElem.previousElementSibling !== null) {
                        indexElem = indexElem.previousElementSibling;
                        index++;
                    }
                    fieldElem = tempElem.querySelector('.e-rule-field input.e-control');
                    if (!rule.rules[index].field) {
                        if (fieldElem.parentElement.className.indexOf('e-tooltip') < 0) {
                            this.renderToolTip(fieldElem.parentElement);
                        }
                        isValid = false;
                    }
                    fieldElem = tempElem.querySelector('.e-rule-operator input.e-control');
                    if (!rule.rules[index].operator) {
                        if (fieldElem.parentElement.className.indexOf('e-tooltip') < 0) {
                            this.renderToolTip(fieldElem.parentElement);
                        }
                        isValid = false;
                    }
                    if (rule.rules[index].value instanceof Array) {
                        valArray = rule.rules[index].value as string[] | number[];
                    }
                    if (isNullOrUndefined(rule.rules[index].value) || rule.rules[index].value === ''
                    || (rule.rules[index].value instanceof Array && valArray.length < 1)) {
                        let valElem: NodeListOf<Element> = tempElem.querySelectorAll('.e-rule-value input.e-control');
                        isValid = false; let j: number = 0;
                        for (let j: number = 0, jLen: number = valElem.length; j < jLen; j++) {
                            let element: Element = valElem[j]; let elem: Element;
                            if (element.parentElement.className.indexOf('e-searcher') > -1) {
                                elem = closest(element, '.e-multi-select-wrapper');
                                if (elem.className.indexOf('e-tooltip') < 0) {
                                    this.renderToolTip(elem as HTMLElement);
                                }
                            } else if (valElem[j].parentElement.className.indexOf('e-tooltip') < 0) {
                                this.renderToolTip(valElem[j].parentElement);
                            }
                            j++;
                        }
                    }
                } else if (dropDownObj.element && isNullOrUndefined(dropDownObj.index)) {
                    if (fieldElem.parentElement.className.indexOf('e-tooltip') < 0) {
                        this.renderToolTip(fieldElem.parentElement);
                    }
                    isValid = false;
                }
            }
        }
        return isValid;
    }
    private refreshLevelColl(): void {
        this.levelColl = {};
        let groupElem: Element = this.element.querySelector('.e-group-container');
        this.levelColl[groupElem.id] = [0];
        let obj: LevelColl = {groupElement: groupElem, level: [0]};
        this.refreshLevel(obj);
    }
    private refreshLevel(obj: LevelColl): LevelColl | void {
        let ruleList: HTMLCollection = obj.groupElement.querySelector('.e-rule-list').children;
        let childElem: Element;
        let groupElem: Element = obj.groupElement;
        let i: number; let iLen: number = ruleList.length;
        let groupCount: number = 0;
        for (i = 0; i < iLen; i++ ) {
            childElem = (ruleList[i] as Element);
            if (childElem.className.indexOf('e-group-container') > -1) {
                obj.level.push(groupCount);
                this.levelColl[childElem.id] = obj.level.slice();
                groupCount++;
                obj.groupElement = childElem;
                obj = this.refreshLevel(obj) as LevelColl;
            }
        }
        let ruleListElem: Element = closest(groupElem, '.e-rule-list');
        obj.groupElement = ruleListElem ? closest(ruleListElem, '.e-group-container') : groupElem;
        obj.level = this.levelColl[obj.groupElement.id].slice();
        return obj;
    }
    private groupTemplate(): Element {
        let groupElem: Element; let grpBodyElem: Element; let groupHdrElem: Element;
        let rulesElem: Element; let glueElem: Element; let inputElem: Element;
        let labelElem: Element; let grpActElem: Element; let groupBtn: HTMLElement;
        groupElem = this.createElement('div', { attrs: { class: 'e-group-container' } });
        groupHdrElem = this.createElement('div', { attrs: { class: 'e-group-header' } });
        grpBodyElem = this.createElement('div', { attrs: { class: 'e-group-body' } });
        rulesElem = this.createElement('div', { attrs: { class: 'e-rule-list' } });
        groupElem.appendChild(groupHdrElem);
        grpBodyElem.appendChild(rulesElem);
        groupElem.appendChild(grpBodyElem);
        // create button group in OR and AND process
        glueElem = this.createElement('div', { attrs: { class: 'e-btn-group' } });
        inputElem = this.createElement('input', { attrs: { type: 'radio', class: 'e-btngroup-and', value: 'AND' } });
        inputElem.setAttribute('checked', 'true');
        glueElem.appendChild(inputElem);
        labelElem = this.createElement('label', { attrs: { class: 'e-btn e-btngroup-and-lbl e-small' },
        innerHTML: this.l10n.getConstant('AND') });
        glueElem.appendChild(labelElem);
        inputElem = this.createElement('input', { attrs: { type: 'radio', class: 'e-btngroup-or', value: 'OR' } });
        glueElem.appendChild(inputElem);
        labelElem = this.createElement('label', { attrs: { class: 'e-btn e-btngroup-or-lbl e-small' },
        innerHTML: this.l10n.getConstant('OR') });
        glueElem.appendChild(labelElem);
        groupHdrElem.appendChild(glueElem);
        grpActElem = this.createElement('div', { attrs: { class: 'e-group-action' } });
        groupBtn = this.createElement('button', { attrs: { type: 'button', class: 'e-add-btn' } });
        grpActElem.appendChild(groupBtn);
        groupHdrElem.appendChild(grpActElem);
        return groupElem;
    }

    private ruleTemplate(): Element {
        let ruleElem: Element; let filterElem: Element; let tempElem: Element; let delBtnElem: HTMLElement; let fieldElem: Element;
        let clsName: string;
        ruleElem = this.createElement('div');
        fieldElem = this.createElement('div', { attrs: { class: 'e-rule-field' } });
        tempElem = this.createElement('div', { attrs: { class: 'e-rule-filter' } });
        filterElem = this.createElement('input', { attrs: { type: 'text', class: 'e-filter-input' } });
        tempElem.appendChild(filterElem);
        fieldElem.appendChild(tempElem);
        tempElem = this.createElement('div', { attrs: { class: 'e-rule-operator' } });
        fieldElem.appendChild(tempElem);
        tempElem = this.createElement('div', { attrs: { class: 'e-rule-value' } });
        fieldElem.appendChild(tempElem);
        tempElem = this.createElement('div', { attrs: { class: 'e-rule-value-delete' } });
        if (this.showButtons.ruleDelete) {
            clsName = 'e-removerule e-rule-delete e-css e-btn e-small';
        } else {
            clsName = 'e-removerule e-rule-delete e-css e-btn e-small e-button-hide';
        }
        delBtnElem = this.createElement('button', { attrs: { class: clsName } });
        tempElem.appendChild(delBtnElem);
        fieldElem.appendChild(tempElem);
        ruleElem.appendChild(fieldElem);
        return ruleElem;
    }
    private addGroupElement(isGroup: boolean, target: Element, condition?: string, isBtnClick?: boolean): void {
        let args: ChangeEventArgs = { groupID: target.id.replace(this.element.id + '_', ''), cancel: false, type: 'insertGroup' };
        if (!this.isImportRules && !this.isInitialLoad) {
            this.trigger('beforeChange', args, (observedChangeArgs: ChangeEventArgs) => {
                this.addGroupSuccess(observedChangeArgs, isGroup, target, condition, isBtnClick);
            });
        } else {
            this.isInitialLoad = false;
            this.addGroupSuccess(args, isGroup, target, condition, isBtnClick);
        }
    }

    private addGroupSuccess(args: ChangeEventArgs, isGroup : boolean, eventTarget: Element, condition: string, isBtnClick: boolean): void {
        if (!args.cancel && (this.element.querySelectorAll('.e-group-container').length <= this.maxGroupCount)) {
            let target: Element = eventTarget; let dltGroupBtn: HTMLElement;
            let groupElem: Element = this.groupElem.cloneNode(true) as Element;
            groupElem.setAttribute('id', this.element.id + '_group' + this.groupIdCounter);
            this.groupIdCounter++;
            let andInpElem: Element = groupElem.querySelector('.e-btngroup-and');
            let orInpElem: Element = groupElem.querySelector('.e-btngroup-or');
            let andLblElem: Element = groupElem.querySelector('.e-btngroup-and-lbl');
            let orLblElem: Element = groupElem.querySelector('.e-btngroup-or-lbl');
            andInpElem.setAttribute('id', this.element.id + '_and' + this.btnGroupId);
            orInpElem.setAttribute('id', this.element.id + '_or' + this.btnGroupId);
            andInpElem.setAttribute('name', this.element.id + '_and' + this.btnGroupId);
            orInpElem.setAttribute('name', this.element.id + '_and' + this.btnGroupId);
            andLblElem.setAttribute('for', this.element.id + '_and' + this.btnGroupId);
            orLblElem.setAttribute('for', this.element.id + '_or' + this.btnGroupId);
            this.btnGroupId++;
            if (isGroup) {
                let clsName: string = this.showButtons.groupDelete ? 'e-deletegroup' : 'e-deletegroup e-button-hide';
                dltGroupBtn = this.createElement('button', { attrs: { class: clsName } });
                let button: Button = new Button({ iconCss: 'e-icons e-delete-icon', cssClass: 'e-small e-round' });
                button.appendTo(dltGroupBtn);
                let tooltip: Tooltip = new Tooltip({ content: this.l10n.getConstant('DeleteGroup') });
                tooltip.appendTo(dltGroupBtn as HTMLElement);
                rippleEffect(dltGroupBtn, { selector: '.deletegroup' });
                groupElem.querySelector('.e-group-action').appendChild(dltGroupBtn);
                let ruleList: Element = target.querySelector('.e-rule-list');
                let childElems: HTMLCollection = ruleList.children;
                let grpLen: number = 0;
                for (let j: number = 0, jLen: number = childElems.length; j < jLen; j++) {
                    if (childElems[j].className.indexOf('e-group-container') > -1) {
                        grpLen += 1;
                    }
                }
                ruleList.appendChild(groupElem);
                let level: number[] = this.levelColl[target.id].slice(0);
                level.push(grpLen);
                this.levelColl[groupElem.id] = level;
                if (!this.isImportRules) {
                    this.addGroups([], target.id.replace(this.element.id + '_', ''));
                    if (isBtnClick) {
                        this.addRuleElement(groupElem, {});
                    }
                }
            } else {
                target.appendChild(groupElem);
                this.levelColl[groupElem.id] = [0];
            }
            groupElem.querySelector('.e-btngroup-and').setAttribute('checked', 'true');
            if (condition === 'or') {
                groupElem.querySelector('.e-btngroup-or').setAttribute('checked', 'true');
            }
            let groupBtn: HTMLElement = groupElem.querySelector('.e-add-btn') as HTMLElement;
            let btnObj: DropDownButton = new DropDownButton({
                items: this.items,
                cssClass: 'e-round e-small e-caret-hide e-addrulegroup',
                iconCss: 'e-icons e-add-icon',
                beforeOpen: this.selectBtn.bind(this, groupBtn),
                select: this.selectBtn.bind(this, groupBtn)
            });
            btnObj.appendTo(groupBtn);
            if (!this.isImportRules) {
                this.trigger('change', { groupID: target.id.replace(this.element.id + '_', ''), type: 'insertGroup' });
            }
        }
    }

    public notifyChange(value: string | number | boolean | Date | string[] | number[] | Date[], element: Element): void {
        let tempColl: NodeListOf<Element> = closest(element, '.e-rule-value').querySelectorAll('.e-template');
        let valueColl: string[] = [];
        for (let i: number = 0, iLen: number = tempColl.length; i < iLen; i++) {
            if (tempColl[i].nextElementSibling) {
                if (tempColl[i].nextElementSibling.className.indexOf('e-check') > -1) {
                    valueColl.push(tempColl[i].textContent);
                }
            }
        }
        this.updateRules(element, (tempColl.length > 1) ? valueColl : value);
    }

    private changeValue(i: number, args: ButtonChangeEventArgs | InputEventArgs | InputChangeEventArgs | CalendarChangeEventArgs): void {
        let eventsArgs: ChangeEventArgs; let groupID: string; let ruleID: string;
        let element: Element;
        if (args.event) {
            element = args.event.target as Element;
        } else {
            let multiSelectArgs: MultiSelectChangeEventArgs = args as MultiSelectChangeEventArgs;
            element = multiSelectArgs.element as Element;
        }
        if (element.className.indexOf('e-day') > -1) {
            let calenderArgs: CalendarChangeEventArgs = args as CalendarChangeEventArgs;
            element = calenderArgs.element;
        }
        let groupElem: Element = closest(element, '.e-group-container');
        let ruleElem: Element = closest(element, '.e-rule-container');
        groupID = groupElem && groupElem.id.replace(this.element.id + '_', '');
        ruleID = ruleElem.id.replace(this.element.id + '_', '');
        let dateElement: CalendarChangeEventArgs = args as CalendarChangeEventArgs;
        if (dateElement.element && dateElement.element.className.indexOf('e-datepicker') > -1) {
            element = dateElement.element;
        }
        let value: string | number | Date | boolean | string[];
        let rbValue: number; let dropDownObj: DropDownList;
        if (element.className.indexOf('e-radio') > -1) {
            rbValue = parseInt(element.id.split('valuekey')[1], 0);
            dropDownObj =
            getComponent(closest(element, '.e-rule-container').querySelector('.e-filter-input') as HTMLElement, 'dropdownlist');
            this.selectedColumn =  dropDownObj.getDataByValue(dropDownObj.value) as ColumnsModel;
            if (this.selectedColumn.values) {
                value = this.selectedColumn.values[rbValue];
            } else {
                let valColl: string [] = ['True', 'False'];
                value = valColl[rbValue];
            }
        } else if (element.className.indexOf('e-multiselect') > -1) {
            value = (getComponent(element as HTMLElement, 'multiselect') as MultiSelect).value as string[];
        } else {
            value = (<InputEventArgs | InputChangeEventArgs | CalendarChangeEventArgs>args).value;
        }
        eventsArgs = { groupID: groupID, ruleID: ruleID, value: value, cancel: false, type: 'value' };
        if (!this.isImportRules) {
            this.trigger('beforeChange', eventsArgs, (observedChangeArgs: ChangeEventArgs) => {
                this.changeValueSuccessCallBack(observedChangeArgs, element, i, groupID, ruleID);
            });
        } else {
            this.changeValueSuccessCallBack(eventsArgs, element, i, groupID, ruleID);
        }
    }

    private changeValueSuccessCallBack(args: ChangeEventArgs, element: Element, i: number, groupID: string, ruleID: string): void {
        if (!args.cancel) {
            this.updateRules(element, args.value, i);
            if (!this.isImportRules) {
                this.trigger('change', { groupID: groupID, ruleID: ruleID, value: args.value, cancel: false, type: 'value' });
            }
        }
    }

    private changeField(args: DropDownChangeEventArgs): void {
        if (args.isInteracted) {
            let groupElem: Element = closest(args.element, '.e-group-container');
            let rules: RuleModel = this.getParentGroup(groupElem);
            let ruleElem: Element = closest(args.element, '.e-rule-container');
            let index: number = 0;
            while (ruleElem && ruleElem.previousElementSibling !== null) {
                ruleElem = ruleElem.previousElementSibling;
                index++;
            }
            this.changeRule(rules.rules[index], args);
        }
    }

    private changeRule(rule: RuleModel, ddlArgs: DropDownChangeEventArgs): void {
        if (!ddlArgs.itemData) {
            return;
        }
        let tempRule: RuleModel = {}; let filterElem: Element = closest(ddlArgs.element, '.e-rule-filter');
        let ddlObj: DropDownList = getComponent(ddlArgs.element, 'dropdownlist') as DropDownList;
        let element: Element = closest(ddlArgs.element, '.e-group-container');
        let groupID: string = element.id.replace(this.element.id + '_', '');
        let operatorElem: Element = closest(ddlArgs.element, '.e-rule-operator');
        this.changeFilter(filterElem, ddlObj, groupID, rule, tempRule, ddlArgs);
        if (!this.isOperatorRendered) {
            this.changeOperator(filterElem, operatorElem, ddlObj, groupID, rule, tempRule, ddlArgs);
        }
        if (!this.isValueRendered) {
            this.changeRuleValues(filterElem, rule, tempRule, ddlArgs);
        }
        this.isValueRendered = false;
        this.isOperatorRendered = false;
    }
    private changeFilter(
        flt: Element, dl: DropDownList, grID: string, rl: RuleModel, tmpRl: RuleModel, dArg: DropDownChangeEventArgs): void {
        if (flt) {
            this.selectedColumn = dl.getDataByValue(dl.value) as ColumnsModel;
            let ruleElem: Element = closest(flt, '.e-rule-container'); let eventsArgs: ChangeEventArgs;
            let ruleID: string = ruleElem.id.replace(this.element.id + '_', '');
            eventsArgs = { groupID: grID, ruleID: ruleID, selectedField: dl.value as string, cancel: false, type: 'field' };
            if (!this.isImportRules) {
                this.trigger('beforeChange', eventsArgs, (observedChangeArgs: ChangeEventArgs) => {
                    this.fieldChangeSuccess(observedChangeArgs, tmpRl, flt, rl, dArg);
                });
            } else {
                this.fieldChangeSuccess(eventsArgs, tmpRl, flt, rl, dArg);
            }
        }
    }
    private changeOperator(
        flt: Element, opr: Element, dl: DropDownList, grID: string, rl: RuleModel, tmpRl: RuleModel, dArg: DropDownChangeEventArgs): void {
        let ruleElem: Element; let ruleID: string; let eventsArgs: ChangeEventArgs;
        if (opr) {
            ruleElem = closest(opr, '.e-rule-container'); ruleID = ruleElem.id.replace(this.element.id + '_', '');
            eventsArgs = { groupID: grID, ruleID: ruleID, selectedIndex: dl.index, cancel: false, type: 'operator' };
            if (!this.isImportRules) {
                this.trigger('beforeChange', eventsArgs, (observedChangeArgs: ChangeEventArgs) => {
                    this.operatorChangeSuccess(observedChangeArgs, flt, tmpRl, rl, dArg);
                });
            } else {
                this.operatorChangeSuccess(eventsArgs, flt, tmpRl, rl, dArg);
            }
        }
    }
    private fieldChangeSuccess(
        args: ChangeEventArgs, tempRule: RuleModel, filterElem: Element, rule: RuleModel, ddlArgs: DropDownChangeEventArgs): void {
        let ruleElem: Element = closest(filterElem, '.e-rule-container');
        if (!args.cancel) {
            tempRule.type = this.selectedColumn.type;
            if (ruleElem.querySelector('.e-template')) {
                rule.value = '';
            }
            let element: Element = closest(ddlArgs.element, '.e-group-container');
            let operatorElem: Element = closest(ddlArgs.element, '.e-rule-operator');
            let groupID: string = element.id.replace(this.element.id + '_', '');
            let ddlObj: DropDownList = getComponent(ddlArgs.element, 'dropdownlist') as DropDownList;
            this.changeOperator(filterElem, operatorElem, ddlObj, groupID, rule, tempRule, ddlArgs);
        } else {
            this.isOperatorRendered = true;
            this.isValueRendered = true;
        }
        this.isOperatorRendered = true;
    }

    private operatorChangeSuccess(
        eventsArgs: ChangeEventArgs, filterElem: Element, tempRule: RuleModel, rule: RuleModel, ddlArgs: DropDownChangeEventArgs): void {
        if (!eventsArgs.cancel) {
            let operatorElem: Element = closest(ddlArgs.element, '.e-rule-operator');
            let dropDownObj: DropDownList = getComponent(ddlArgs.element, 'dropdownlist') as DropDownList;
            let prevOper: string = rule.operator ? rule.operator.toLowerCase() : '';
            tempRule.operator = dropDownObj.value as string;
            let currOper: string = tempRule.operator.toLowerCase();
            if (tempRule.operator.toLowerCase().indexOf('between') > -1 || (tempRule.operator.toLowerCase().indexOf('in') > -1
                && tempRule.operator.toLowerCase().indexOf('contains') < 0)) {
                filterElem = operatorElem.previousElementSibling;
                tempRule.type = rule.type;
                if (tempRule.operator.toLowerCase().indexOf('in') < 0 || rule.operator.toLowerCase().indexOf('in') < 0) {
                    rule.value = [];
                }
            } else if (typeof rule.value === 'object' && rule.value != null) {
                rule.value = rule.value.length > 0 ? rule.value[0] : '';
            }
            if (ddlArgs.previousItemData) {
                let prevValue: string = ddlArgs.previousItemData.value.toLowerCase();
                if (prevValue.indexOf('between') > -1 || (prevValue.indexOf('in') > -1 || (prevValue.indexOf('null') > -1)
                || (prevValue.indexOf('empty') > -1) && prevValue.indexOf('contains') < 0)) {
                    filterElem = operatorElem.previousElementSibling; tempRule.type = rule.type;
                }
            }
            if ((prevOper.indexOf('in') > -1 && prevOper.indexOf('in') < 5) && (currOper.indexOf('in') > -1
                && currOper.indexOf('in') < 5)) {
                filterElem = null;
            }
            if (tempRule.operator.indexOf('null') > -1 || (tempRule.operator.indexOf('empty') > -1 )) {
                let parentElem: HTMLElement = operatorElem.parentElement.querySelector('.e-rule-value') as HTMLElement;
                removeClass([parentElem], 'e-show');
                addClass([parentElem], 'e-hide');
            }
            this.changeRuleValues(filterElem, rule, tempRule, ddlArgs);
        }
        this.isValueRendered = true;
    }

    private changeRuleValues(filterElem: Element, rule: RuleModel, tempRule: RuleModel, ddlArgs: DropDownChangeEventArgs): void {
        let operatorElem: Element = closest(ddlArgs.element, '.e-rule-operator');
        let ddlObj: DropDownList; let operatorList: { [key: string]: Object }[]; let oprElem: Element;
        if (filterElem) {
            operatorElem = filterElem.nextElementSibling;
            addClass([operatorElem], 'e-operator');
            if (operatorElem.childElementCount) {
                ddlObj = getComponent(operatorElem.querySelector('.e-dropdownlist') as HTMLElement, 'dropdownlist') as DropDownList;
                tempRule.operator = ddlObj.value as string;
                let itemData: ColumnsModel = ddlArgs.itemData as ColumnsModel;
                this.renderValues(
                    operatorElem, itemData, ddlArgs.previousItemData as ColumnsModel, true, rule, tempRule, ddlArgs.element);
            } else {
                let ruleId: string = closest(operatorElem, '.e-rule-container').id;
                oprElem = this.createElement('input', { attrs: { type: 'text', id: ruleId + '_operatorkey' } });
                operatorElem.appendChild(oprElem);
                if (this.selectedColumn.operators) {
                    operatorList = this.selectedColumn.operators;
                } else if (ddlArgs.itemData) {
                    operatorList = this.customOperators[this.selectedColumn.type + 'Operator'];
                }
                let height: string = (this.element.className.indexOf('e-device') > -1) ? '250px' : '200px';
                let dropDownList: DropDownList = new DropDownList({
                    dataSource: operatorList,
                    fields: { text: 'key', value: 'value' },
                    placeholder: this.l10n.getConstant('SelectOperator'),
                    popupHeight: ((operatorList.length > 5) ? height : 'auto'),
                    change: this.changeField.bind(this),
                    index: 0,
                    value: rule ? rule.operator : null
                });
                dropDownList.appendTo('#' + ruleId + '_operatorkey');
                tempRule.operator = (rule && rule.operator !== '') ? rule.operator : operatorList[0].value as string;
                if (this.isImportRules) {
                    tempRule.type = this.selectedColumn.type;
                    tempRule.operator = rule.operator;
                }
                this.renderValues(
                    operatorElem, this.selectedColumn, ddlArgs.previousItemData as ColumnsModel,
                    false, rule, tempRule, ddlArgs.element);
            }
        }
        if (!this.isImportRules) {
            this.updateRules(ddlArgs.element, ddlArgs.item);
        }
    }

    // tslint:disable-next-line:no-any
    private destroyControls(target: Element): void {
        let inputElement: NodeListOf<HTMLElement>;
        inputElement = target.nextElementSibling.querySelectorAll('input.e-control') as NodeListOf<HTMLElement>;
        let divElement: NodeListOf<HTMLElement>;
        divElement = target.nextElementSibling.querySelectorAll('div.e-control:not(.e-handle)');
        let columns: ColumnsModel[] = this.columns;
        for (let i: number = 0, len: number = inputElement.length; i < len; i++) {
            if (inputElement[i].classList.contains('e-textbox')) {
                (getComponent(inputElement[i], 'textbox') as TextBox).destroy();
                detach(target.nextElementSibling.querySelector('input#' + inputElement[i].id));
            } else if (inputElement[i].classList.contains('e-dropdownlist')) {
                (getComponent(inputElement[i], 'dropdownlist') as DropDownList).destroy();
            } else if (inputElement[i].classList.contains('e-radio')) {
                (getComponent(inputElement[i], 'radio') as RadioButton).destroy();
            } else if (inputElement[i].classList.contains('e-numerictextbox')) {
                (getComponent(inputElement[i], 'numerictextbox') as NumericTextBox).destroy();
                detach(target.nextElementSibling.querySelector('input#' + inputElement[i].id));
            } else if (inputElement[i].classList.contains('e-datepicker')) {
                (getComponent(inputElement[i], 'datepicker') as DatePicker).destroy();
            } else if (inputElement[i].classList.contains('e-multiselect')) {
                (getComponent(inputElement[i], 'multiselect') as MultiSelect).destroy();
            } else if (inputElement[i].className.indexOf('e-template') > -1) {
                let clsName: string = inputElement[i].className;
                for (let j: number = 0, jLen: number = columns.length; j < jLen; j++) {
                    if (columns[j].template && clsName.indexOf(columns[j].field) > -1) {
                        this.templateDestroy(columns[j], inputElement[i].id);
                        break;
                    }
                }
            }
            if (document.getElementById(inputElement[i].id)) {
                detach(inputElement[i]);
            }
        }
        for (let i: number = 0, len: number = divElement.length; i < len; i++) {
            if (divElement[i].className.indexOf('e-template') > -1) {
                let clsName: string = divElement[i].className;
                for (let j: number = 0, jLen: number = columns.length; j < jLen; j++) {
                    if (columns[j].template && clsName.indexOf(columns[j].field) > -1) {
                        this.templateDestroy(columns[j], divElement[i].id);
                        break;
                    }
                }
            }
            detach(divElement[i]);
        }
    }
    private templateDestroy(column: ColumnsModel, elemId: string): void {
        let temp: Function = column.template.destroy as Function;
        if (column.template && column.template.destroy) {
            if (typeof temp === 'string') {
                temp = getValue(temp, window);
                temp({ elementId: elemId });
            } else {
                (column.template.destroy as Function)({ elementId: elemId });
            }
        }
    }
    private getDistinctValues(dataSource: object[], field: string): object[] {
        let original: object = {};
        let result: object[] = [];
        for (let i: number = 0, iLen: number = dataSource.length; i < iLen; i++) {
            let value: string = dataSource[i][field];
            if (Number(dataSource[i][field]) === dataSource[i][field] && dataSource[i][field] % 1 !== 0) {
                value = dataSource[i][field].toString();
            }
            let data: object = {};
            if (!(value in original)) {
                original[value] = 1;
                data[field] = value;
                result.push(data);
            }
        }
        return result;
    }
    private renderMultiSelect(rule: ColumnsModel, parentId: string, i: number, selectedValue: string[] | number[], values:
        string[] | number[] | boolean[]): void {
        let isFetched: boolean = false; let ds: object[]; let isValues: boolean = false;
        if (this.dataColl[1]) {
            if (Object.keys(this.dataColl[1]).indexOf(rule.field) > -1) {
                isFetched = true;
                ds = this.getDistinctValues(this.dataColl, rule.field);
            }
        }
        if (!this.dataColl.length && values.length) {
            isValues = true;
        }
        let multiSelectObj: MultiSelect = new MultiSelect({
            dataSource: isValues ? values : (isFetched ? ds as { [key: string]: object }[] : this.dataManager),
            query: new Query([rule.field]),
            fields: { text: rule.field, value: rule.field },
            placeholder: this.l10n.getConstant('SelectValue'),
            value: selectedValue,
            mode: 'CheckBox',
            width: '100%',
            change: this.changeValue.bind(this, i),
            close: this.closePopup.bind(this, i),
            actionBegin: this.multiSelectOpen.bind(this, parentId + '_valuekey' + i)
        });
        multiSelectObj.appendTo('#' + parentId + '_valuekey' + i);
        this.updateRules(multiSelectObj.element, selectedValue, 0);
    }
    private multiSelectOpen(parentId: string, args: PopupEventArgs): void {
        if (this.dataSource instanceof DataManager) {
            let element: Element = document.getElementById(parentId);
            let dropDownObj: DropDownList =
            getComponent(closest(element, '.e-rule-container').querySelector('.e-filter-input') as HTMLElement, 'dropdownlist');
            this.selectedColumn =  dropDownObj.getDataByValue(dropDownObj.value) as ColumnsModel;
            let value: string = this.selectedColumn.field;
            let isFetched: boolean = false;
            if (this.dataColl[1]) {
                if (Object.keys(this.dataColl[1]).indexOf(value) > -1) {
                    isFetched = true;
                }
            }
            if (!isFetched) {
                args.cancel = true;
                let multiselectObj: MultiSelect = (getComponent(element as HTMLElement, 'multiselect') as MultiSelect);
                multiselectObj.hideSpinner();
                let data: Promise<Object> = this.dataManager.executeQuery(new Query().select(value)) as Promise<Object>;
                let deferred: Deferred = new Deferred();  let dummyData: Object[];
                this.createSpinner(closest(element, '.e-multi-select-wrapper').parentElement);
                showSpinner(closest(element, '.e-multi-select-wrapper').parentElement as HTMLElement);
                data.then((e: {actual: {result: Object[], count: number}, result: Object[]}) => {
                   if (e.actual && e.actual.result) {
                       dummyData = e.actual.result;
                   } else {
                       dummyData = e.result;
                   }
                   this.dataColl = extend(this.dataColl, dummyData, [], true) as object [];
                   let ds: object[] = this.getDistinctValues(this.dataColl, value);
                   multiselectObj.dataSource = ds as {[key: string]: object}[];
                   hideSpinner(closest(element, '.e-multi-select-wrapper').parentElement as HTMLElement);
                }).catch((e: ReturnType) => {
                    deferred.reject(e);
                });
            }
        }
    }
    private createSpinner(element: Element): void {
        let spinnerElem: HTMLElement = this.createElement('span', { attrs: { class: 'e-qb-spinner' } });
        element.appendChild(spinnerElem);
        createSpinner({target: spinnerElem, width: Browser.isDevice ? '16px' : '14px' });
    }
    private closePopup(i: number, args: PopupEventArgs): void {
        let element: Element = document.getElementById(args.popup.element.id.replace('_popup', ''));
        let value: string[] = (getComponent(element as HTMLElement, 'multiselect') as MultiSelect).value as string[];
        this.updateRules(element, value, i);
    }
    private processTemplate(target: Element, itemData: ColumnsModel, rule: RuleModel, tempRule: RuleModel): void {
        let tempElements: NodeListOf<Element> = closest(target, '.e-rule-container').querySelectorAll('.e-template');
        if (tempElements.length < 2) {
            if (itemData.template && typeof itemData.template.write === 'string') {
                getValue(itemData.template.write, window)({ elements: tempElements[0], values: rule.value, operator: tempRule.operator });
            } else if (itemData.template && itemData.template.write) {
                (itemData.template.write as Function)({ elements: tempElements[0], values: rule.value, operator: tempRule.operator });
            }
        } else {
            if (itemData.template && typeof itemData.template.write === 'string') {
                getValue(itemData.template.write, window)({ elements: tempElements, values: rule.value, operator: tempRule.operator });
            } else if (itemData.template && itemData.template.write) {
                (itemData.template.write as Function)({ elements: tempElements, values: rule.value, operator: tempRule.operator });
            }
        }
    }
    private getItemData(parentId: string): ColumnsModel {
        let fieldObj: DropDownList = getComponent(document.getElementById(parentId + '_filterkey'), 'dropdownlist') as DropDownList;
        return this.columns[fieldObj.index];
    }
     private setDefaultValue(parentId?: string, isArryValue?: boolean, isNumber?: boolean):
     string[] | number[] | string | number | boolean | Date {
        let itemData: ColumnsModel = this.getItemData(parentId);
        if (isNullOrUndefined(itemData.value)) {
            return isNumber ? isArryValue ? [0, 0] : 0 : isArryValue ? [] : '';
        }
        if (isArryValue) {
           if (!(itemData.value instanceof Array)) {
                 return [itemData.value] as string[] | number[];
           }
        } else {
            if (itemData.value instanceof Array) {
                return itemData.value[0];
          }
        }
       // this.updateRules(ruleValElem, itemData.defaultValue, idx);
        return itemData.value;
     }
    private renderStringValue(parentId: string, rule: RuleModel, operator: string, idx: number, ruleValElem: HTMLElement): void {
        let selectedVal: string[]; let columnData: ColumnsModel = this.getItemData(parentId); let selectedValue: string;
        if (this.isImportRules || this.isPublic) {
            selectedValue = rule.value as string;
        } else {
            selectedValue = this.setDefaultValue(parentId, false, false) as string;
        }
        if ((operator === 'in' || operator === 'notin') && (this.dataColl.length || columnData.values )) {
            selectedVal = this.isImportRules ? rule.value as string[] : this.setDefaultValue(parentId, true, false) as string[];
            this.renderMultiSelect(columnData, parentId, idx, selectedVal, columnData.values);
            if (this.displayMode === 'Vertical' || this.element.className.indexOf('e-device') > -1) {
                ruleValElem.style.width = '100%';
            } else {
                ruleValElem.style.width = null;
                ruleValElem.style.minWidth = '200px';
            }
        } else {
            if (operator === 'in' || operator === 'notin') {
                selectedVal = this.isImportRules ? rule.value as string[] : this.setDefaultValue(parentId, true, false) as string[];
                selectedValue = selectedVal.join(',');
            }
            let inputobj: TextBox = new TextBox({
                placeholder: this.l10n.getConstant('SelectValue'),
                input: this.changeValue.bind(this, idx)
            });
            inputobj.appendTo('#' + parentId + '_valuekey' + idx);
            inputobj.value = selectedValue;
            inputobj.dataBind();
        }
    }
    private renderNumberValue(
        parentId: string, rule: RuleModel, operator: string, idx: number, ruleValElem: HTMLElement, itemData: ColumnsModel,
        length: number): void {
        let columnData: ColumnsModel = this.getItemData(parentId);
        let selectedVal: number | number[] =
        (this.isImportRules || this.isPublic) ? rule.value as number : this.setDefaultValue(parentId, false, true) as number;
        if ((operator === 'in' || operator === 'notin') && (this.dataColl.length || columnData.values)) {
            selectedVal = this.isImportRules ? rule.value as number[] : this.setDefaultValue(parentId, true, false) as number[];
            this.renderMultiSelect(columnData, parentId, idx, selectedVal, columnData.values);
            if (this.element.className.indexOf('e-device') > -1 || this.displayMode === 'Vertical') {
                ruleValElem.style.width = '100%';
            } else {
                ruleValElem.style.minWidth = '200px';
                ruleValElem.style.width = null;
            }
        } else if (operator === 'in' || operator === 'notin') {
            selectedVal = this.isImportRules ? rule.value as number[] : this.setDefaultValue(parentId, true, false) as number[];
            let selVal: string = selectedVal.join(',');
            let inputobj: TextBox = new TextBox({
                placeholder: this.l10n.getConstant('SelectValue'),
                input: this.changeValue.bind(this, idx)
            });
            inputobj.appendTo('#' + parentId + '_valuekey' + idx);
            inputobj.value = selVal;
            inputobj.dataBind();
        } else {
            let fieldObj: DropDownList = getComponent(document.getElementById(parentId + '_filterkey'), 'dropdownlist') as DropDownList;
            itemData = this.columns[fieldObj.index];
            let min: number = (itemData.validation && itemData.validation.min) ? itemData.validation.min : 0;
            let max: number =
                (itemData.validation && itemData.validation.max) ? itemData.validation.max : Number.MAX_VALUE;
            let format: string = itemData.format ? itemData.format : 'n';
            if (length > 1 && rule) {
                selectedVal = rule.value[idx] ? rule.value[idx] : this.setDefaultValue(parentId, true, true) as number;
            }
            let numeric: NumericTextBox = new NumericTextBox({
                value: (selectedVal instanceof Array) ? selectedVal[idx] : selectedVal as number,
                format: format, min: min, max: max, width: '100%',
                step: itemData.step ? itemData.step : 1,
                change: this.changeValue.bind(this, idx)
            });
            numeric.appendTo('#' + parentId + '_valuekey' + idx);
        }
    }
    private processValueString(value: string, type: string): string[] | number[] {
        let numArr: number[] = []; let strArr: string[] = value.split(',');
        if (type === 'string') {
            return strArr;
        } else {
            for (let k: number = 0, kLen: number = strArr.length; k < kLen; k++) {
                numArr.push(Number(strArr[k]));
            }
            return numArr;
        }
    }
    private parseDate(value: string, format?: string): Date {
        let formatOpt: DateFormatOptions; let selectedValue: Date;
        if (format) {
            let dParser: Function = this.intl.getDateParser({ skeleton: 'full', type: 'dateTime' });
            formatOpt = { type: 'dateTime', format: format } as DateFormatOptions;
            selectedValue = dParser(value);
            if (isNullOrUndefined(selectedValue)) {
                selectedValue = this.intl.parseDate(value, formatOpt);
            }
        } else {
            selectedValue = new Date(value);
        }
        return selectedValue;
    }
    private renderControls(target: Element, itemData: ColumnsModel, rule: RuleModel, tempRule: RuleModel): void {
        addClass([target.parentElement.querySelector('.e-rule-value')], 'e-value');
        removeClass([target.parentElement.querySelector('.e-rule-value')], 'e-hide');
        addClass([target.parentElement.querySelector('.e-rule-value')], 'e-show');
        if (itemData.template) {
            this.processTemplate(target, itemData, rule, tempRule);
        } else {
            let length: number;
            if (tempRule.type === 'boolean') {
                length = this.selectedColumn.values ? this.selectedColumn.values.length : 2;
            } else {
                length = tempRule.operator && tempRule.operator.toLowerCase().indexOf('between') > -1 ? 2 : 1;
            }
            let parentId: string = closest(target, '.e-rule-container').id; let ruleValElem: HTMLElement;
            if (target.className.indexOf('e-rule-operator') > -1 || target.className.indexOf('e-rule-filter') > -1) {
                ruleValElem = target.parentElement.querySelector('.e-rule-value') as HTMLElement;
                if (this.element.className.indexOf('e-device') > -1 || this.displayMode === 'Vertical') {
                    ruleValElem.style.width = '100%';
                } else {
                    if (tempRule.operator !== 'in' && tempRule.operator !== 'notin') {
                        ruleValElem.style.width = '200px';
                    }
                }
                for (let i: number = 0; i < length; i++) {
                    switch (tempRule.type) {
                        case 'string': {
                            this.renderStringValue(parentId, rule, tempRule.operator, i, ruleValElem);
                        }
                            break;
                        case 'number': {
                            this.renderNumberValue(parentId, rule, tempRule.operator, i, ruleValElem, itemData, length);
                        }
                            break;
                        case 'boolean': {
                            let values: string[] =
                                itemData.values && itemData.values.length ? itemData.values as string[] : ['True', 'False'];
                            let isCheck: boolean = false;
                            if (rule.type === 'boolean' && rule.value) {
                                isCheck = values[i].toLowerCase() === rule.value.toString().toLowerCase();
                            } else if (itemData.value) {
                                isCheck = values[i].toLowerCase() === itemData.value.toString().toLowerCase();
                            } else if (i === 0) {
                                isCheck = true;
                            }
                            let radiobutton: RadioButton = new RadioButton({
                                label: values[i].toString(), name: parentId + 'default', checked: isCheck, value: values[i],
                                change: this.changeValue.bind(this, i)
                            });
                            radiobutton.appendTo('#' + parentId + '_valuekey' + i);
                            if (isCheck) {
                                this.updateRules(radiobutton.element, values[i], 0);
                            }
                        }
                            break;
                        case 'date': {
                            let selectedValue: Date = new Date(); let selVal: string; let column: ColumnsModel;
                            let format: string = itemData.format; let datepick: DatePicker;
                            let place: string = this.l10n.getConstant('SelectValue');
                            if (itemData.value) {
                                if (itemData.value instanceof Date) {
                                    selectedValue = itemData.value as Date;
                                } else if (itemData.value instanceof Number) {
                                    selectedValue = new Date(itemData.value as number) as Date;
                                } else {
                                    selectedValue = this.parseDate(itemData.value as string, itemData.format);
                                }
                            }
                            if ((this.isImportRules || this.isPublic) && rule && rule.value) {
                                column = this.getColumn(rule.field);
                                selVal = (length > 1) ? rule.value[i] as string : rule.value as string;
                                selectedValue = this.parseDate(selVal, column.format);
                                format = column.format;
                            }
                            if (format) {
                                datepick =
                                new DatePicker({
                                    value: selectedValue, placeholder: place, format: format, change: this.changeValue.bind(this, i) });
                            } else {
                                datepick =
                                new DatePicker({ value: selectedValue, placeholder: place, change: this.changeValue.bind(this, i) });
                            }
                            datepick.appendTo('#' + parentId + '_valuekey' + i);
                            if (!rule.value) {
                                this.updateRules(document.getElementById(parentId + '_valuekey' + i), selectedValue);
                             }
                        }
                            break;
                    }
                }
            }
        }
    }
    private getOperatorIndex(ddlObj: DropDownList, rule: RuleModel): number {
        let i: number;
        let dataSource: { [key: string]: Object; }[] = ddlObj.dataSource as { [key: string]: Object; }[];
        let len: number = dataSource.length;
        for (i = 0; i < len; i++) {
            if (rule.operator === ddlObj.dataSource[i].value) {
                return i;
            }
        }
        return 0;
    }
    private renderValues(
        target: Element, itemData: ColumnsModel, prevItemData: ColumnsModel, isRender: boolean, rule: RuleModel,
        tempRule: RuleModel, element: Element): void {
        if (isRender) {
            let ddlObj: DropDownList = getComponent(target.querySelector('input'), 'dropdownlist') as DropDownList;
            if (itemData.operators) {
                ddlObj.dataSource = itemData.operators;
                ddlObj.index = this.getOperatorIndex(ddlObj, rule);
                ddlObj.value = tempRule.operator = ddlObj.dataSource[ddlObj.index].value as string;
                ddlObj.dataBind();
            } else if (itemData.type) {
                ddlObj.dataSource = this.customOperators[itemData.type + 'Operator'];
                ddlObj.index = this.getOperatorIndex(ddlObj, rule);
                ddlObj.value = tempRule.operator = ddlObj.dataSource[ddlObj.index].value as string;
                ddlObj.dataBind();
            }
        }
        if (!(tempRule.operator.indexOf('null') > -1 || tempRule.operator.indexOf('empty') > -1)) {
        let parentId: string = closest(target, '.e-rule-container').id;
        if (prevItemData && prevItemData.template) {
            this.templateDestroy(prevItemData, parentId + '_valuekey0');
            detach(target.nextElementSibling.querySelector('#' + parentId + '_valuekey0'));
        }
        if (isRender) {
            this.destroyControls(target);
        }
        let filtElem: HTMLElement = document.getElementById(element.id.replace('operatorkey', 'filterkey'));
        let filtObj: DropDownList = getComponent(filtElem, 'dropdownlist') as DropDownList;
        itemData.template = this.columns[filtObj.index].template;
        if (itemData.template) {
            itemData.template = this.columns[filtObj.index].template;
            let valElem: Element | Element[];
            if (itemData.template && typeof itemData.template.create === 'string') {
                valElem = getValue(itemData.template.create, window)();
            } else if (itemData.template && itemData.template.create) {
                valElem = (itemData.template.create as Function)();
            }
            if (valElem instanceof Element) {
                valElem.id = parentId + '_valuekey0';
                addClass([valElem], 'e-template');
                addClass([valElem], 'e-' + itemData.field);
                target.nextElementSibling.appendChild(valElem);
            } else if (valElem instanceof Array) {
                addClass(valElem, 'e-template');
                for (let i: number = 0, iLen: number = valElem.length; i < iLen; i++) {
                    valElem[i].id = parentId + '_valuekey' + i;
                    target.nextElementSibling.appendChild(valElem[i]);
                }
            }
            let parentElem: HTMLElement = target.parentElement.querySelector('.e-rule-value') as HTMLElement;
            if (this.element.className.indexOf('e-device') > -1 || this.displayMode === 'Vertical') {
                parentElem.style.width = '100%';
            } else {
                parentElem.style.minWidth = '200px';
            }
        } else {
            let inputLen: number = 1;
            if (tempRule.type === 'boolean') {
                inputLen = this.selectedColumn.values ? this.selectedColumn.values.length : 2;
            } else {
                inputLen = (tempRule.operator && tempRule.operator.toLowerCase().indexOf('between') > -1) ? 2 : 1;
            }
            for (let i: number = 0; i < inputLen; i++) {
                let valElem: HTMLElement;
                valElem = this.createElement('input', { attrs: { type: 'text', id: parentId + '_valuekey' + i } });
                target.nextElementSibling.appendChild(valElem);
            }
        }
        this.renderControls(target, itemData, rule, tempRule);
        }
    }
    private updateValues(element: HTMLElement, rule: RuleModel): void {
        let controlName: string = element.className.split(' e-')[1];
        let i: number = parseInt(element.id.slice(-1), 2) as number;
        switch (controlName) {
            case 'textbox':
                rule.value = (getComponent(element, controlName) as TextBox).value;
                break;
            case 'dropdownlist':
                rule.value = (getComponent(element, controlName) as DropDownList).value as string;
                break;
            case 'radio':
                let radioBtnObj: RadioButton = getComponent(element, controlName) as RadioButton;
                if (radioBtnObj.checked) {
                    rule.value = radioBtnObj.value;
                }
                radioBtnObj.refresh();
                break;
            case 'numerictextbox':
                if (rule.operator.indexOf('between') > -1) {
                    rule.value[i] = (getComponent(element, controlName) as NumericTextBox).value;
                } else {
                    rule.value = (getComponent(element, controlName) as NumericTextBox).value;
                }
                break;
            case 'datepicker':
                let column: ColumnsModel = this.getColumn(rule.field);
                let format: DateFormatOptions = { type: 'dateTime', format: column.format || 'MM/dd/yyyy' } as DateFormatOptions;
                if (rule.operator.indexOf('between') > -1) {
                    rule.value[i] = (getComponent(element, controlName) as DatePicker).value;
                } else if (isNullOrUndefined(format.format)) {
                    rule.value = this.intl.formatDate((getComponent(element, controlName) as DatePicker).value);
                } else {
                    rule.value = this.intl.formatDate((getComponent(element, controlName) as DatePicker).value, format);
                }
                break;
            case 'multiselect':
                rule.value = (getComponent(element, controlName) as MultiSelect).value as number[] | string[];
                break;
        }
    }
    private updateRules(
        target: Element, selectedValue: string | number | Date | boolean | string[] | number[] | Date[] | Element, i?: number): void {
        let groupElem: Element = closest(target, '.e-group-container'); let rule: RuleModel = this.getParentGroup(groupElem);
        let ruleElem: Element = closest(target, '.e-rule-container'); let index: number = 0; let dropDownObj: DropDownList;
        let eventsArgs: ChangeEventArgs; let groupID: string = groupElem.id.replace(this.element.id + '_', ''); let ruleID: string;
        let beforeRules: RuleModel = this.getValidRules(this.rule);
        while (ruleElem && ruleElem.previousElementSibling !== null) {
            ruleElem = ruleElem.previousElementSibling;
            index++;
        }
        ruleElem = closest(target, '.e-rule-container'); ruleID = ruleElem.id.replace(this.element.id + '_', '');
        if (closest(target, '.e-rule-filter')) {
            dropDownObj = getComponent(target as HTMLElement, 'dropdownlist') as DropDownList;
            if (!this.isImportRules && rule.rules[index].field.toLowerCase() !== this.columns[dropDownObj.index].field.toLowerCase()) {
                if (!(rule.rules[index].operator.indexOf('null') > -1 ) || (rule.rules[index].operator.indexOf('empty') > -1 )) {
                rule.rules[index].value = '';
                }
            }
            this.selectedColumn = dropDownObj.getDataByValue(dropDownObj.value) as ColumnsModel;
            rule.rules[index].field = this.selectedColumn.field; rule.rules[index].type = this.selectedColumn.type;
            rule.rules[index].label = this.selectedColumn.label;
            let ruleElement: Element = closest(target, '.e-rule-filter');
            let element: HTMLElement = ruleElement.nextElementSibling.querySelector('input.e-control') as HTMLElement;
            let operator: string = (getComponent(element, 'dropdownlist') as DropDownList).value as string;
            rule.rules[index].operator = operator;
            // Value Fields
            let valueContainer: HTMLElement = ruleElement.nextElementSibling.nextElementSibling as HTMLElement;
            let elementCln: NodeListOf<HTMLElement> = valueContainer.querySelectorAll('input.e-control');
            if (elementCln.length < 1) {
                elementCln = valueContainer.querySelectorAll('.e-template');
            }
            for (let i: number = 0; i < elementCln.length; i++) {
                if (!elementCln[i]) {
                    elementCln[i] = ruleElement.nextElementSibling.nextElementSibling.querySelector('div.e-control') as HTMLElement;
                }
                if (!elementCln[i]) {
                    elementCln[i] = ruleElement.nextElementSibling.nextElementSibling.querySelector('.e-template');
                }
                eventsArgs = { groupID: groupID, ruleID: ruleID, value: rule.rules[index].field, type: 'field' };
                this.updateValues(elementCln[i], rule.rules[index]);
            }
            if (!this.isImportRules) {
                this.trigger('change', eventsArgs);
            }
            if (this.allowValidation && rule.rules[index].field && target.parentElement.className.indexOf('e-tooltip') > -1) {
                (getComponent(target.parentElement as HTMLElement, 'tooltip') as Tooltip).destroy();
            }
            this.filterRules(beforeRules, this.getValidRules(this.rule), 'field');
        } else if (closest(target, '.e-rule-operator')) {
            dropDownObj = getComponent(target as HTMLElement, 'dropdownlist') as DropDownList;
            rule.rules[index].operator = dropDownObj.value as string;
            let inputElem: NodeListOf<HTMLElement>; let parentElem: HTMLElement = target.parentElement;
            inputElem = ruleElem.querySelectorAll('.e-rule-value input.e-control') as NodeListOf<HTMLElement>;
            eventsArgs = { groupID: groupID, ruleID: ruleID, value: dropDownObj.value, type: 'operator'};
            if (this.allowValidation && rule.rules[index].operator && target.parentElement.className.indexOf('e-tooltip') > -1) {
                (getComponent(target.parentElement as HTMLElement, 'tooltip') as Tooltip).destroy();
            }
            if (inputElem.length > 1) {
                rule.rules[index].value = [];
            }
            for (let i: number = 0; i < inputElem.length; i++) {
                this.updateValues(inputElem[i], rule.rules[index]);
            }
            if (!this.isImportRules) {
                this.trigger('change', eventsArgs);
            }
            this.filterRules(beforeRules, this.getValidRules(this.rule), 'operator');
        } else if (closest(target, '.e-rule-value')) {
            this.ruleValueUpdate(target, selectedValue, rule, index, groupElem, ruleElem, i);
            this.filterRules(beforeRules, this.getValidRules(this.rule), 'value');
        }
    }
    private filterRules(beforeRule: RuleModel, afterRule: RuleModel, type: string): void {
        let beforeRuleStr: string = JSON.stringify({condition: beforeRule.condition, rule: beforeRule.rules});
        let afetrRuleStr: string = JSON.stringify({condition: afterRule.condition, rule: afterRule.rules});
        if (beforeRuleStr !== afetrRuleStr) {
            if (!this.isImportRules) {
                this.trigger('ruleChange', { previousRule: beforeRule, rule: afterRule, type: type });
            }
        }
    }
    private ruleValueUpdate(
        target: Element, selectedValue: string | number | Date | boolean | string[] | number[] | Date[] | Element,
        rule: RuleModel, index: number, groupElem: Element, ruleElem: Element, i: number): void {
        let eventsArgs: ChangeEventArgs; let oper: string;
        let arrOperator: string [] = ['in', 'between', 'notin', 'notbetween'];
        if (selectedValue !== null) {
            if (rule.rules[index].operator) {
                oper = rule.rules[index].operator.toLowerCase();
            }
            if (target.className.indexOf('e-multiselect') > -1 && rule.rules[index].type === 'number') {
                let selVal: number[] = []; let dupSelectedValue: string[] | number[] = selectedValue as number[] | string[];
                for (let k: number = 0, kLen: number = dupSelectedValue.length; k < kLen; k++) {
                    if (typeof dupSelectedValue[k] === 'string') {
                        selVal.push(parseFloat(dupSelectedValue[k] as string) as number);
                    }
                }
                if (selVal.length) {
                    selectedValue = selVal as number[];
                }
            }
            if (target.className.indexOf('e-template') > -1) {
                if (selectedValue instanceof Array) {
                    if (arrOperator.indexOf(oper) > -1) {
                        rule.rules[index].value = selectedValue as string | number | string[] | number[];
                    } else {
                        rule.rules[index].value = selectedValue[0] as string | number;
                    }
                } else {
                    rule.rules[index].value = selectedValue as string | number | string[] | number[];
                }
                eventsArgs = { groupID: groupElem.id, ruleID: ruleElem.id, value: rule.rules[index].value as string, type: 'value'};
                if (!this.isImportRules) {
                    this.trigger('change', eventsArgs);
                }
            } else if (target.className.indexOf('e-spin') > -1 || target.className.indexOf('e-numeric') > -1) {
                if (arrOperator.indexOf(oper) > -1) {
                    rule.rules[index].value[i] = selectedValue as string | number;
                } else {
                    rule.rules[index].value = selectedValue as string | number;
                }
            } else if (target.className.indexOf('e-radio') > -1) {
                rule.rules[index].value = selectedValue as string | number;
            } else if (target.className.indexOf('e-multiselect') > -1) {
                rule.rules[index].value = selectedValue as string[];
            } else if (target.className.indexOf('e-textbox') > -1) {
                if (oper === 'in' || oper === 'notin') {
                    if (rule.rules[index].type === 'string') {
                        rule.rules[index].value = this.processValueString(selectedValue as string, rule.rules[index].type) as string[];
                    } else {
                        rule.rules[index].value = this.processValueString(selectedValue as string, rule.rules[index].type) as number[];
                    }
                } else {
                    rule.rules[index].value = selectedValue as string | number;
                }
            } else if (target.className.indexOf('e-datepicker') > -1) {
                let ddlInst: DropDownList =
                    getInstance(ruleElem.querySelector('.e-rule-filter input') as HTMLElement, DropDownList) as DropDownList;
                let format: DateFormatOptions =
                    { type: 'dateTime', format: this.columns[ddlInst.index].format || 'MM/dd/yyyy' } as DateFormatOptions;
                if ((<DateFormatOptions>format).type) {
                    if (arrOperator.indexOf(oper) > -1) {
                        rule.rules[index].value[i] = this.intl.formatDate(selectedValue as Date, format);
                    } else {
                        rule.rules[index].value = this.intl.formatDate(selectedValue as Date, format);
                    }
                }
            }
            this.validatValue(rule, index, ruleElem);
        }
    }
    private validatValue(rule: RuleModel, index: number, ruleElem: Element): void {
        if (this.allowValidation && rule.rules[index].value) {
            let valElem: NodeListOf<Element> = ruleElem.querySelectorAll('.e-rule-value .e-control');
            if (valElem[0].className.indexOf('e-tooltip') > -1) {
                (getComponent(valElem[0] as HTMLElement, 'tooltip') as Tooltip).destroy();
            } else if (valElem[0].parentElement.className.indexOf('e-tooltip') > -1) {
                (getComponent(valElem[0].parentElement as HTMLElement, 'tooltip') as Tooltip).destroy();
            }
            if (valElem[1] && valElem[1].parentElement.className.indexOf('e-tooltip') > -1) {
                (getComponent(valElem[1].parentElement as HTMLElement, 'tooltip') as Tooltip).destroy();
            }
        }

    }
    private findGroupByIdx(groupIdx: number, rule:  RuleModel, isRoot: boolean): RuleModel {
        let ruleColl: RuleModel[] = rule.rules;
        let dupRuleColl: RuleModel[] = [];
        if (!isRoot) {
            for (let j: number = 0, jLen: number = ruleColl.length; j < jLen; j++) {
                rule = ruleColl[j];
                if (rule.rules) {
                    dupRuleColl.push(rule);
                }
            }
            return dupRuleColl[groupIdx];
        }
        return rule;
    }
    /**
     * Removes the component from the DOM and detaches all its related event handlers.
     * Also it maintains the initial input element from the DOM.
     * @method destroy
     * @return {void}
     */
    public destroy(): void {
        let queryElement: Element = this.element;
        if (!queryElement) { return; }
        let element: NodeListOf<HTMLElement>; let i: number; let len: number;
        super.destroy();
        element = this.element.querySelectorAll('.e-addrulegroup') as NodeListOf<HTMLElement>;
        len = element.length;
        for (i = 0; i < len; i++) {
            (getComponent(element[i], 'dropdown-btn') as DropDownButton).destroy();
            detach(element[i]);
        }
        element = this.element.querySelectorAll('.e-rule-filter .e-control') as NodeListOf<HTMLElement>;
        len = element.length;
        for (i = 0; i < len; i++) {
            (getComponent(element[i], 'dropdownlist') as DropDownList).destroy();
            detach(element[i]);
        }
        element = this.element.querySelectorAll('.e-rule-operator .e-control') as NodeListOf<HTMLElement>;
        len = element.length;
        for (i = 0; i < len; i++) {
            (getComponent(element[i], 'dropdownlist') as DropDownList).destroy();
            detach(element[i]);
        }
        this.isImportRules = false;
        this.unWireEvents();
        this.levelColl[this.element.id + '_group0'] = [0];
        this.rule = { condition: 'and', rules: [] };
        this.element.innerHTML = '';
        classList(this.element, [], ['e-rtl', 'e-responsive', 'e-device']);
    }
    /**
     * Adds single or multiple rules.
     * @returns void.
     */
    public addRules(rule: RuleModel[], groupID: string): void {
        groupID = this.element.id + '_' + groupID;
        this.isPublic = true;
        for (let i: number = 0, len: number = rule.length; i < len; i++) {
            this.addRuleElement(document.getElementById(groupID), rule[i]);
        }
        this.isPublic = false;
    }
    /**
     * Adds single or multiple groups, which contains the collection of rules.
     * @returns void.
     */
    public addGroups(groups: RuleModel[], groupID: string): void {
        groupID = this.element.id + '_' + groupID;
        let groupElem: Element = document.getElementById(groupID);
        let rule: RuleModel = this.getParentGroup(groupElem); let grouplen: number = groups.length;
        if (grouplen) {
            for (let i: number = 0, len: number = groups.length; i < len; i++) {
                this.importRules(groups[i], groupElem);
            }
        } else {
            rule.rules.push({ 'condition': 'and', rules: [] });
        }
    }
    private initWrapper(): void {
        this.isInitialLoad = true;
        if (this.cssClass) {
            addClass([this.element], this.cssClass);
        }
        if (this.enableRtl) {
            addClass([this.element], 'e-rtl');
        }
        if (this.width) {
            this.element.style.width = this.width;
        }
        if (this.height) {
            this.element.style.height = this.height;
        }
        if (this.rule.rules.length) {
            this.isImportRules = true;
        } else {
            this.addGroupElement(false, this.element);
        }
        if (Browser.isDevice || this.displayMode === 'Vertical') {
            if (Browser.isDevice) {
                this.element.style.width = '100%';
                this.element.classList.add('e-device');
            }
            removeClass(document.querySelectorAll('.e-rule-container'), 'e-horizontal-mode');
            addClass(document.querySelectorAll('.e-rule-container'), 'e-vertical-mode');
            this.displayMode = 'Vertical';
        } else {
            this.displayMode = 'Horizontal';
        }
        if (this.summaryView) {
            if (this.isImportRules) {
                this.renderSummary();
            } else {
                this.renderSummaryCollapse();
            }
        } else {
            if (this.columns.length && this.isImportRules) {
                this.addGroupElement(false, this.element, this.rule.condition);
                let mRules: RuleModel = extend({}, this.rule, {}, true);
                this.setGroupRules(mRules as RuleModel);
            } else if (this.columns.length) {
                this.addRuleElement(this.element.querySelector('.e-group-container'), {});
            }
            let buttons: NodeListOf<Element> = document.querySelectorAll('label.e-btn');
            let button: HTMLElement;
            for (let i: number = 0; i < buttons.length; i++) {
                button = buttons.item(i) as HTMLElement;
                rippleEffect(button, { selector: '.e-btn' });
            }
        }
    }
    private renderSummary(): void {
        let contentElem: Element = this.createElement('div', {
            attrs: {
                class: 'e-summary-content',
                id: this.element.id + '_summary_content'
            }
        });
        let textElem: Element =
        this.createElement('textarea', { attrs: { class: 'e-summary-text', readonly: 'true' }, styles: 'max-height:500px' });
        let editElem: Element = this.createElement('button', { attrs: { class: 'e-edit-rule e-css e-btn e-small e-flat e-primary' } });
        let divElem: Element = this.createElement('div', { attrs: { class: 'e-summary-btndiv' } });
        contentElem.appendChild(textElem);
        textElem.textContent = this.getSqlFromRules(this.rule);
        editElem.textContent = this.l10n.getConstant('Edit');
        divElem.appendChild(editElem);
        contentElem.appendChild(divElem);
        this.element.appendChild(contentElem);
    }
    private renderSummaryCollapse(): void {
        let collapseElem: Element = this.createElement('div', {
            attrs: {
                class: 'e-collapse-rule e-icons',
                title: this.l10n.getConstant('SummaryViewTitle')
            }
        });
        this.element.querySelector('.e-group-header').appendChild(collapseElem);
    }
    private columnSort(): void {
        if (this.sortDirection.toLowerCase() === 'descending') {
            this.columns = new DataManager(this.columns).executeLocal(new Query().sortByDesc('field'));
        } else if (this.sortDirection.toLowerCase() === 'ascending') {
            this.columns = new DataManager(this.columns).executeLocal(new Query().sortBy('field'));
        }
    }
    public onPropertyChanged(newProp: QueryBuilderModel, oldProp: QueryBuilderModel): void {
        let properties: string[] = Object.keys(newProp);
        for (let prop of properties) {
            switch (prop) {
                case 'summaryView':
                    let groupElem: HTMLElement = this.element.querySelector('.e-group-container') as HTMLElement;
                    let summaryElem: HTMLElement = this.element.querySelector('.e-summary-content') as HTMLElement;
                    if (newProp.summaryView) {
                        groupElem.style.display = 'none';
                        if (this.element.querySelectorAll('.e-summary-content').length < 1) {
                            this.renderSummary();
                            summaryElem = this.element.querySelector('.e-summary-content') as HTMLElement;
                        } else {
                            this.element.querySelector('.e-summary-text').textContent = this.getSqlFromRules(this.rule);
                        }
                        summaryElem.style.display = 'block';
                    } else {
                        if (groupElem.querySelectorAll('.e-collapse-rule').length > -1) {
                            this.renderSummaryCollapse();
                        }
                        groupElem.style.display = 'block';
                        summaryElem.style.display = 'none';
                    }
                    break;
                case 'displayMode':
                    if (newProp.displayMode === 'Horizontal') {
                        addClass(this.element.querySelectorAll('.e-rule-container'), 'e-horizontal-mode');
                        removeClass(this.element.querySelectorAll('.e-rule-container'), 'e-vertical-mode');
                    } else {
                        addClass(this.element.querySelectorAll('.e-rule-container'), 'e-vertical-mode');
                        removeClass(this.element.querySelectorAll('.e-rule-container'), 'e-horizontal-mode');
                    }
                    break;
                case 'showButtons':
                    if (newProp.showButtons.ruleDelete) {
                        removeClass(this.element.querySelectorAll('.e-rule-delete'), 'e-button-hide');
                    } else {
                        addClass(this.element.querySelectorAll('.e-rule-delete'), 'e-button-hide');
                    }
                    if (newProp.showButtons.groupDelete) {
                        removeClass(this.element.querySelectorAll('.e-deletegroup'), 'e-button-hide');
                    } else {
                        addClass(this.element.querySelectorAll('.e-deletegroup'), 'e-button-hide');
                    }
                    break;
                case 'cssClass':
                    if (oldProp.cssClass) {
                        removeClass([this.element], oldProp.cssClass.split(' '));
                    }
                    if (newProp.cssClass) {
                        addClass([this.element], newProp.cssClass.split(' '));
                    }
                    break;
                case 'enableRtl':
                    if (newProp.enableRtl) {
                        addClass([this.element], 'e-rtl');
                    } else {
                        removeClass([this.element], 'e-rtl');
                    }
                    break;
                case 'enablePersistence':
                    this.enablePersistence = newProp.enablePersistence;
                    break;
                case 'dataSource':
                    this.dataSource = newProp.dataSource;
                    break;
                case 'columns':
                    this.columns = newProp.columns;
                    this.columnSort();
                    break;
                case 'sortDirection':
                    this.sortDirection = newProp.sortDirection;
                    this.columnSort();
                    break;
                case 'maxGroupCount':
                    this.maxGroupCount = newProp.maxGroupCount;
                    break;
                case 'height':
                    this.height = newProp.height;
                    this.element.style.height = this.height;
                    break;
                case 'rule':
                    this.rule = newProp.rule;
                    newProp.rule = this.getRuleCollection(this.rule, false);
                    break;
                case 'width':
                    this.width = newProp.width;
                    this.element.style.width = this.width;
                    break;
                case 'locale':
                    this.locale = newProp.locale;
                    this.intl = new Internationalization(this.locale);
                    break;
            }
        }
    }
    protected preRender(): void {
        this.defaultLocale = {
            StartsWith: 'Starts With',
            EndsWith: 'Ends With',
            Contains: 'Contains',
            Equal: 'Equal',
            NotEqual: 'Not Equal',
            LessThan: 'Less Than',
            LessThanOrEqual: 'Less Than Or Equal',
            GreaterThan: 'Greater Than',
            GreaterThanOrEqual: 'Greater Than Or Equal',
            Between: 'Between',
            NotBetween: 'Not Between',
            In: 'In',
            NotIn: 'Not In',
            Remove: 'REMOVE',
            SelectField: 'Select a field',
            SelectOperator: 'Select operator',
            DeleteRule: 'Remove this condition',
            DeleteGroup: 'Delete group',
            AddGroup: 'Add Group',
            AddCondition: 'Add Condition',
            Edit: 'EDIT',
            ValidationMessage: 'This field is required',
            SummaryViewTitle: 'Summary View',
            OtherFields: 'Other Fields',
            AND: 'AND',
            OR: 'OR',
            SelectValue: 'Enter Value',
            IsEmpty: 'Is Empty',
            IsNotEmpty: 'Is Not Empty',
            IsNull: 'Is Null',
            IsNotNull: 'Is Not Null'
        };
        this.l10n = new L10n('querybuilder', this.defaultLocale, this.locale);
        this.intl = new Internationalization(this.locale);
        this.groupIdCounter = 0;
        this.ruleIdCounter = 0;
        this.btnGroupId = 0;
        this.isImportRules = false;
        this.parser = [];
        this.customOperators = {
            stringOperator: [
                { value: 'startswith', key: this.l10n.getConstant('StartsWith') },
                { value: 'endswith', key: this.l10n.getConstant('EndsWith') },
                { value: 'contains', key: this.l10n.getConstant('Contains') },
                { value: 'equal', key: this.l10n.getConstant('Equal') },
                { value: 'notequal', key: this.l10n.getConstant('NotEqual') },
                { value: 'in', key: this.l10n.getConstant('In') },
                { value: 'notin', key: this.l10n.getConstant('NotIn') },
                { value: 'isempty', key: this.l10n.getConstant('IsEmpty') },
                { value: 'isnotempty', key: this.l10n.getConstant('IsNotEmpty') },
                { value: 'isnull', key: this.l10n.getConstant('IsNull') },
                { value: 'isnotnull', key: this.l10n.getConstant('IsNotNull') }, ],
            dateOperator: [
                { value: 'equal', key: this.l10n.getConstant('Equal') },
                { value: 'greaterthan', key: this.l10n.getConstant('GreaterThan') },
                { value: 'greaterthanorequal', key: this.l10n.getConstant('GreaterThanOrEqual') },
                { value: 'lessthan', key: this.l10n.getConstant('LessThan') },
                { value: 'lessthanorequal', key: this.l10n.getConstant('LessThanOrEqual') },
                { value: 'notequal', key: this.l10n.getConstant('NotEqual') }],
            booleanOperator: [
                { value: 'equal', key: this.l10n.getConstant('Equal') },
                { value: 'notequal', key: this.l10n.getConstant('NotEqual') }],
            numberOperator: [
                { value: 'equal', key: this.l10n.getConstant('Equal') },
                { value: 'greaterthanorequal', key: this.l10n.getConstant('GreaterThanOrEqual') },
                { value: 'greaterthan', key: this.l10n.getConstant('GreaterThan') },
                { value: 'between', key: this.l10n.getConstant('Between') },
                { value: 'lessthan', key: this.l10n.getConstant('LessThan') },
                { value: 'notbetween', key: this.l10n.getConstant('NotBetween') },
                { value: 'lessthanorequal', key: this.l10n.getConstant('LessThanOrEqual') },
                { value: 'notequal', key: this.l10n.getConstant('NotEqual') },
                { value: 'in', key: this.l10n.getConstant('In') },
                { value: 'notin', key: this.l10n.getConstant('NotIn') },
                { value: 'isnull', key: this.l10n.getConstant('IsNull') },
                { value: 'isnotnull', key: this.l10n.getConstant('IsNotNull') }],
        };
        this.operators = {
            equal: '=', notequal: '!=', greaterthan: '>', greaterthanorequal: '>=', lessthan: '<', in: 'IN', notin: 'NOT IN',
            lessthanorequal: '<=', startswith: 'LIKE', endswith: 'LIKE', between: 'BETWEEN', notbetween: 'NOT BETWEEN', contains: 'LIKE',
            isnull: 'IS NULL', isnotnull: 'IS NOT NULL', isempty: 'IS EMPTY', isnotempty: 'IS NOT EMPTY'
        };
        this.fields =  { text: 'label', value: 'field' };
    }

    protected render(): void {
        this.levelColl = {};
        this.items = [
            {
                text: this.l10n.getConstant('AddGroup'),
                iconCss: 'e-icons e-add-icon e-addgroup'
            },
            {
                text: this.l10n.getConstant('AddCondition'),
                iconCss: 'e-icons e-add-icon e-addrule',
            }];
        this.ruleElem = this.ruleTemplate();
        this.groupElem = this.groupTemplate();
        if (this.dataSource instanceof DataManager) {
            this.dataManager = this.dataSource as DataManager;
            this.executeDataManager(new Query().take(1));
        } else {
            this.dataManager = new DataManager(this.dataSource as object[]);
            this.dataColl = this.dataManager.executeLocal(new Query());
            this.initControl();
        }
    }
    private executeDataManager(query: Query): void {
        let data: Promise<Object> = this.dataManager.executeQuery(query) as Promise<Object>;
        let deferred: Deferred = new Deferred();
        data.then((e: {actual: {result: Object[], count: number}, result: Object[]}) => {
            if (e.actual && e.actual.result) {
                this.dataColl = e.actual.result;
            } else {
                this.dataColl = e.result;
            }
            this.initControl();
        }).catch((e: ReturnType) => {
            deferred.reject(e);
        });
    }
    private initControl(): void {
        this.initialize();
        this.initWrapper();
        this.wireEvents();
    }
    protected wireEvents(): void {
        let wrapper: Element = this.getWrapper();
        EventHandler.add(wrapper, 'click', this.clickEventHandler, this);
    }
    protected unWireEvents(): void {
        let wrapper: Element = this.getWrapper();
        EventHandler.remove(wrapper, 'click', this.clickEventHandler);
    }
    private getParentGroup(target: Element| string, isParent ?: boolean): RuleModel {
        let groupLevel: number[] = (target instanceof Element) ? this.levelColl[target.id] : this.levelColl[target];
        let len: number = isParent ? groupLevel.length - 1 : groupLevel.length;
        let rule: RuleModel = this.rule;
        for (let i: number = 0; i < len; i++) {
            rule = this.findGroupByIdx(groupLevel[i], rule, i === 0);
        }
        return rule;
    }
    private deleteGroup(target: Element): void {
        let groupElem: Element = target; let groupId: string = groupElem.id.replace(this.element.id + '_', '');
        let args: ChangeEventArgs = { groupID: groupId, cancel: false, type: 'deleteGroup' };
        if (!this.isImportRules) {
            this.trigger('beforeChange', args, (observedChangeArgs: ChangeEventArgs) => {
                this.deleteGroupSuccessCallBack(observedChangeArgs, target);
            });
        } else {
            this.deleteGroupSuccessCallBack(args, target);
        }
    }

    private deleteGroupSuccessCallBack(args: ChangeEventArgs, target: Element): void {
        if (!args.cancel) {
            if (this.actionButton) {
                (getComponent(this.actionButton as HTMLElement, 'tooltip') as Tooltip).destroy();
            }
            let groupElem: Element = target; let rule: RuleModel = this.getParentGroup(groupElem, true);
            let index: number = 0; let i: number; let len: number; let beforeRules: RuleModel = this.getValidRules(this.rule);
            let nextElem: Element = groupElem.nextElementSibling; let prevElem: Element = groupElem.previousElementSibling;
            let element: NodeListOf<Element> = groupElem.querySelectorAll('.e-group-container');
            let valElem: NodeListOf<Element> = groupElem.querySelectorAll('.e-tooltip');
            len = valElem.length;
            for (i = 0; i < len; i++) {
                (getComponent(valElem[i] as HTMLElement, 'tooltip') as Tooltip).destroy();
            }
            for (i = 0, len = element.length; i < len; i++) {
                delete this.levelColl[element[i].id];
            }
            while (groupElem.previousElementSibling !== null) {
                groupElem = groupElem.previousElementSibling;
                index++;
            }
            if (nextElem && nextElem.className.indexOf('e-separate-rule') > -1) {
                removeClass([nextElem], 'e-separate-rule');
                addClass([nextElem], 'e-joined-rule');
                if (prevElem && prevElem.className.indexOf('e-rule-container') > -1) {
                    addClass([prevElem], 'e-prev-joined-rule');
                }
            }
            rule.rules.splice(index, 1);
            delete this.levelColl[args.groupID];
            detach(target);
            this.refreshLevelColl();
            if (!this.isImportRules) {
                this.trigger('change', args);
            }
            this.filterRules(beforeRules, this.getValidRules(this.rule), 'deleteGroup');
        }
    }

    private deleteRule(target: Element): void {
        let groupElem: Element = closest(target, '.e-group-container'); let ruleID: string; let groupID: string;
        groupID = groupElem.id.replace(this.element.id + '_', '');
        ruleID = closest(target, '.e-rule-container').id.replace(this.element.id + '_', '');
        let args: ChangeEventArgs = { groupID: groupID, ruleID: ruleID, cancel: false, type: 'deleteRule' };
        if (!this.isImportRules) {
            this.trigger('beforeChange', args, (observedChangeArgs: ChangeEventArgs) => {
                this.deleteRuleSuccessCallBack(observedChangeArgs, target);
            });
        } else {
            this.deleteRuleSuccessCallBack(args, target);
        }
    }

    private deleteRuleSuccessCallBack(args: ChangeEventArgs, target: Element): void {
        if (!args.cancel) {
            if (this.actionButton && this.actionButton.className.indexOf('e-tooltip') > -1) {
                (getComponent(this.actionButton as HTMLElement, 'tooltip') as Tooltip).destroy();
            }
            let groupElem: Element = closest(target, '.e-group-container');
            let rule: RuleModel = this.getParentGroup(groupElem); let ruleElem: Element = closest(target, '.e-rule-container');
            let beforeRules: RuleModel = this.getValidRules(this.rule);
            let clnruleElem: Element = ruleElem;
            let nextElem: Element = ruleElem.nextElementSibling;
            let prevElem: Element = ruleElem.previousElementSibling;
            let index: number = 0;
            let valElem: NodeListOf<Element> = ruleElem.querySelectorAll('.e-tooltip');
            let i: number; let len: number = valElem.length;
            for (i = 0; i < len; i++) {
                (getComponent(valElem[i] as HTMLElement, 'tooltip') as Tooltip).destroy();
            }
            while (ruleElem.previousElementSibling !== null) {
                ruleElem = ruleElem.previousElementSibling;
                index++;
            }
            rule.rules.splice(index, 1);
            if (!prevElem || prevElem.className.indexOf('e-rule-container') < 0) {
                if (nextElem) {
                    removeClass([nextElem], 'e-joined-rule');
                }
            }
            if (!nextElem || nextElem.className.indexOf('e-rule-container') < 0) {
                if (prevElem) {
                    removeClass([prevElem], 'e-prev-joined-rule');
                }
            }
            detach(clnruleElem);
            if (!this.isImportRules) {
                this.trigger('change', args);
            }
            this.filterRules(beforeRules, this.getValidRules(this.rule), 'deleteRule');
        }
    }

    private setGroupRules(rule: RuleModel): void {
        this.reset();
        this.groupIdCounter = 1;
        this.ruleIdCounter = 0;
        this.isImportRules = true;
        this.rule = rule;
        rule = this.getRuleCollection(this.rule, false);
        this.importRules(this.rule, this.element.querySelector('.e-group-container'), true);
        this.isImportRules = false;
    }
    /**
     * return the valid rule or rules collection.
     * @returns RuleModel.
     */
    public getValidRules(currentRule: RuleModel): RuleModel {
        let ruleCondtion: string = currentRule.condition;
        let ruleColl: RuleModel [] = extend([], currentRule.rules, [], true) as RuleModel [];
        let rule: RuleModel = this.getRuleCollection({condition: ruleCondtion, rules: ruleColl}, true);
        return rule;
    }
    private getRuleCollection(rule: RuleModel, isValidRule: boolean): RuleModel {
        let orgRule: RuleModel;
        if (rule.rules && rule.rules.length && (Object.keys(rule.rules[0]).length > 6 || isValidRule)) {
            let jLen: number = rule.rules.length;
            for (let j: number = 0; j < jLen; j++) {
                orgRule = rule.rules[j];
                orgRule = this.getRuleCollection(orgRule, isValidRule);
                rule.rules[j] = orgRule;
                if (Object.keys(orgRule).length < 1 && isValidRule) {
                    rule.rules.splice(j, 1);
                    j--;
                    jLen--;
                }
            }
        }
        if (!rule.condition && rule.condition !== '') {
            if (rule.operator) {
                if (rule.operator.indexOf('null') > -1 || rule.operator.indexOf('empty') > -1) {
                rule.value = null;
            }
        }
            if (rule.field !== '' && rule.operator !== '' && rule.value !== '') {
                rule = {
                    'label': rule.label, 'field': rule.field, 'operator': rule.operator, 'type': rule.type, 'value': rule.value
                };
            } else {
                rule = {};
            }
        } else {
            rule = { 'condition': rule.condition, 'rules': rule.rules };
        }
        return rule;
    }
    /**
     * Set the rule or rules collection.
     * @returns void.
     */
    public setRules(rule: RuleModel): void {
        let mRules: RuleModel = extend({}, rule, {}, true);
        this.setGroupRules(mRules);
    }
    /**
     * Gets the rule or rule collection.
     * @returns object.
     */
    public getRules(): RuleModel {
        return {condition: this.rule.condition, rules: this.rule.rules};
    }
    /**
     * Gets the rule.
     * @returns object.
     */
    public getRule(elem: string | HTMLElement): RuleModel {
        let ruleElem: Element; let ruleId: string; let index: number = 0;
        if (elem instanceof HTMLElement) {
            ruleElem = closest(elem, '.e-rule-container');
        } else {
            ruleId = this.element.id + '_' + elem;
            ruleElem = document.getElementById(ruleId);
        }
        let groupElem: Element = closest(ruleElem, '.e-group-container');
        let rule: RuleModel = this.getParentGroup(groupElem);
        while (ruleElem.previousElementSibling !== null) {
            ruleElem = ruleElem.previousElementSibling;
            index++;
       }
        return rule.rules[index];
    }
    /**
     * Gets the group.
     * @returns object.
     */
    public getGroup(target: Element | string): RuleModel {
        if (target instanceof Element && target.className.indexOf('e-group-container') < 1) {
            target = closest(target, '.e-group-container');
        }
        let groupId: string = (target instanceof Element) ? target.id : this.element.id + '_' + target;
        let rule: RuleModel = this.getParentGroup(groupId);
        return { rules: rule.rules, condition: rule.condition };
    }
    /**
     * Deletes the group or groups based on the group ID.
     * @returns void.
     */
    public deleteGroups(groupIdColl: string[]): void {
        let i: number; let len: number = groupIdColl.length; let groupID: string;
        for (i = 0; i < len; i++) {
            groupID = this.element.id + '_' + groupIdColl[i];
            this.deleteGroup(document.getElementById(groupID));
        }
    }
    /**
     * return the Query from current rules collection.
     * @returns Promise.   
     */
    public getFilteredRecords(): Promise<Object> {
        let predicate: Predicate = this.getPredicate(this.getValidRules(this.rule));
        let dataManagerQuery: Query = new Query().where(predicate);
        return this.dataManager.executeQuery(dataManagerQuery);
    }
    /**
     * Deletes the rule or rules based on the rule ID.
     * @returns void.
     */
    public deleteRules(ruleIdColl: string[]): void {
        let i: number; let len: number = ruleIdColl.length; let ruleID: string;
        for (i = 0; i < len; i++) {
            ruleID = this.element.id + '_' + ruleIdColl[i];
            this.deleteRule(document.getElementById(ruleID));
        }
    }
    /**
     * Gets the query for Data Manager.
     * @returns string.
     */
    public getDataManagerQuery(rule: RuleModel): Query {
        let predicate: Predicate = this.getPredicate(rule);
        let query: Query; let fields: string[] = [];
        for (let i: number = 0, len: string[] = Object.keys(this.columns); i < len.length; i++) {
            fields.push(this.columns[i].field);
        }
        if (rule.rules.length) {
            query = new Query().select(fields).where(predicate);
        } else {
            query = new Query().select(fields);
        }
        return query;
    }
    /**   
     * Get the predicate from collection of rules.   
     * @returns null
     */
    public getPredicate(rule: RuleModel): Predicate {
        let ruleColl: RuleModel[] = rule.rules; let pred: Predicate; let pred2: Predicate; let date: Date;
        let ruleValue: string | number | Date; let ignoreCase: boolean = false; let column: ColumnsModel;
        if (!ruleColl) {
            return pred;
        }
        for (let i: number = 0, len: number = ruleColl.length; i < len; i++) {
            let keys: string[] = Object.keys(ruleColl[i]);
            ignoreCase = false;
            if (keys.indexOf('rules') > -1 && ruleColl[i].rules) {
                pred2 = this.getPredicate(ruleColl[i]);
                if (pred2) {
                    if (pred) {
                        if (rule.condition === 'and') {
                            pred = pred.and(pred2);
                        } else {
                            pred = pred.or(pred2);
                        }
                    } else {
                        pred = pred2;
                    }
                }
            } else if (ruleColl[i].operator.length) {
                let oper: string = ruleColl[i].operator.toLowerCase(); let isDateFilter: boolean = false;
                let dateOperColl: string[] = ['equal', 'notequal', 'greaterthan', 'lessthanorequal'];
                if (ruleColl[i].type === 'string') {
                    ignoreCase = this.matchCase ? false : true;
                }
                if (ruleColl[i].type === 'date' && dateOperColl.indexOf(oper) > -1) {
                    ignoreCase = true;
                }
                column = this.getColumn(ruleColl[i].field);
                if (ruleColl[i].type === 'date') {
                    let format: DateFormatOptions = { type: 'dateTime', format: column.format || 'MM/dd/yyyy' } as DateFormatOptions;
                    ruleValue = this.intl.parseDate(ruleColl[i].value as string, format) as Date;
                    if (dateOperColl.indexOf(oper) > -1) {
                        isDateFilter = true;
                    }
                } else if (ruleColl[i].operator.indexOf('null') > -1 || ruleColl[i].operator.indexOf('empty') > -1) {
                    ruleColl[i].value = null;
                } else {
                    ruleValue = ruleColl[i].value as string | number;
                }
                if (i === 0) {
                    if ((oper.indexOf('in') > -1 || oper.indexOf('between') > -1 || oper.indexOf('null') > -1 ||
                    oper.indexOf('empty') > -1 ) && oper !== 'contains') {
                        pred = isDateFilter ? this.datePredicate(ruleColl[i], ruleValue as Date) : this.arrayPredicate(ruleColl[i]);
                    } else {
                        let value: string | number | Date = ruleValue as string | number | Date;
                        if (value !== '') {
                            pred = new Predicate(ruleColl[i].field, ruleColl[i].operator, ruleValue as string | number | Date, ignoreCase);
                        }
                    }
                } else {
                        if (isDateFilter || (oper.indexOf('in') > -1 || oper.indexOf('between') > -1 ||
                        oper.indexOf('null') > -1 || oper.indexOf('empty') > -1 ) && oper !== 'contains') {
                            pred = isDateFilter ? this.datePredicate(ruleColl[i], ruleValue as Date, pred, rule.condition) :
                            this.arrayPredicate(ruleColl[i], pred, rule.condition);
                        } else {
                            if (rule.condition === 'and') {
                                let value: string | number | Date = ruleValue as string | number | Date;
                                if (pred && value !== '') {
                                    pred
                                    = pred.and(ruleColl[i].field, ruleColl[i].operator, ruleValue as string | number | Date, ignoreCase);
                                } else if (value !== '') {
                                    pred = new Predicate(
                                        ruleColl[i].field, ruleColl[i].operator, ruleValue as string | number | Date, ignoreCase);
                                }
                            } else {
                                let value: string | number = ruleValue as string | number;
                                if (pred && value !== '') {
                                    pred = pred.or(ruleColl[i].field, ruleColl[i].operator, ruleValue as string | number, ignoreCase);
                                } else if (value !== '') {
                                    pred = new Predicate(
                                        ruleColl[i].field, ruleColl[i].operator, ruleValue as string | number | Date, ignoreCase);
                                }
                            }
                        }
                }
            }
        }
        return pred;
    }
    private getColumn(field: string): ColumnsModel {
        let columns: ColumnsModel[] = this.columns; let column: ColumnsModel;
        for (let i: number = 0, iLen: number = columns.length; i < iLen; i++) {
            if (columns[i].field === field) {
                column = columns[i];
            }
        }
        return column;
    }
    private datePredicate(ruleColl: RuleModel, value: Date, predicate?: Predicate, condition?: string): Predicate {
        let pred: Predicate; let dummyDate: Date = new Date(value.getTime());
        let nextDate: Date = new Date(dummyDate.setDate(dummyDate.getDate() + 1));
        switch (ruleColl.operator) {
            case 'equal':
                pred = new Predicate(ruleColl.field, 'greaterthanorequal', value);
                pred = pred.and(ruleColl.field, 'lessthan', nextDate);
                break;
            case 'notequal':
                pred = new Predicate(ruleColl.field, 'lessthan', value);
                pred = pred.or(ruleColl.field, 'greaterthanorequal', nextDate);
                break;
            case 'greaterthan':
                pred = new Predicate(ruleColl.field, 'greaterthanorequal', nextDate);
                break;
            case 'lessthanorequal':
                pred = new Predicate(ruleColl.field, 'lessthan', nextDate);
                break;
        }
        if (pred) {
            if (predicate) {
                if (condition === 'and') {
                    predicate = predicate.and(pred);
                } else if (condition === 'or') {
                    predicate = predicate.or(pred);
                }
            } else {
                predicate = pred;
            }
        }
        return predicate;
    }
    private arrayPredicate(ruleColl: RuleModel, predicate?: Predicate, condition?: string): Predicate {
        let value: number[] | string[] = ruleColl.value as number[] | string[];
        let nullValue: number = ruleColl.value as number;
        let pred: Predicate;
        if (ruleColl.operator.indexOf('null') > -1 || ruleColl.operator.indexOf('empty') > -1) {
            switch (ruleColl.operator) {
                case 'isnull':
                    pred = new Predicate(ruleColl.field, 'isnull', nullValue);
                    break;
                case 'isnotnull':
                    pred = new Predicate(ruleColl.field, 'notnull', nullValue);
                    break;
                case 'isempty':
                    pred = new Predicate(ruleColl.field, 'equal', '');
                    break;
                case 'isnotempty':
                    pred = new Predicate(ruleColl.field, 'notequal', '');
                    break;
            }
        }
        if (!(ruleColl.operator.indexOf('null') > -1 || ruleColl.operator.indexOf('empty') > -1)) {
        for (let j: number = 0, jLen: number = value.length; j < jLen; j++) {
            if (value[j] !== '') {
                if (j === 0) {
                    switch (ruleColl.operator) {
                        case 'between':
                            pred = new Predicate(ruleColl.field, 'greaterthan', value[j]);
                            break;
                        case 'notbetween':
                            pred = new Predicate(ruleColl.field, 'lessthan', value[j]);
                            break;
                        case 'in':
                            pred = new Predicate(ruleColl.field, 'equal', value[j]);
                            break;
                        case 'notin':
                            pred = new Predicate(ruleColl.field, 'notequal', value[j]);
                            break;
                    }
                } else {
                    switch (ruleColl.operator) {
                        case 'between':
                            pred = pred.and(ruleColl.field, 'lessthan', value[j]);
                            break;
                        case 'notbetween':
                            pred = pred.or(ruleColl.field, 'greaterthan', value[j]);
                            break;
                        case 'in':
                            pred = pred.or(ruleColl.field, 'equal', value[j]);
                            break;
                        case 'notin':
                            pred = pred.and(ruleColl.field, 'notequal', value[j]);
                            break;
                    }
                }
            }
        }
    }
        if (pred) {
            if (predicate) {
                if (condition === 'and') {
                    predicate = predicate.and(pred);
                } else if (condition === 'or') {
                    predicate = predicate.or(pred);
                }
            } else {
                predicate = pred;
            }
        }
        return predicate;
    }
    private importRules(rule: RuleModel, parentElem?: Element, isReset?: boolean): Element {
        if (!isReset) {
            parentElem = this.renderGroup(rule.condition, parentElem);
        } else {
            if (rule.condition === 'or') {
                (parentElem.querySelector('.e-btngroup-or') as HTMLInputElement).checked = true;
            } else {
                (parentElem.querySelector('.e-btngroup-and') as HTMLInputElement).checked = true;
            }
        }
        let ruleColl: RuleModel[] = rule.rules;
        if (!isNullOrUndefined(ruleColl)) {
            for (let i: number = 0, len: number = ruleColl.length; i < len; i++) {
                let keys: string[] = Object.keys(ruleColl[i]);
                if (!isNullOrUndefined(ruleColl[i].rules) && keys.indexOf('rules') > -1) {
                    parentElem = this.renderGroup(ruleColl[i].condition, parentElem);
                    parentElem = this.importRules(ruleColl[i], parentElem, true);
                } else {
                    this.renderRule(ruleColl[i], parentElem);
                }
            }
        }
        parentElem = closest(parentElem, '.e-rule-list');
        if (parentElem) {
            parentElem = closest(parentElem, '.e-group-container');
        }
        return parentElem;
    }
    private renderGroup(condition: string, parentElem?: Element): Element {
        this.addGroupElement(true, parentElem, condition); //Child group
        let element: NodeListOf<Element> = parentElem.querySelectorAll('.e-group-container');
        return element[element.length - 1];
    }
    private renderRule(rule: RuleModel, parentElem?: Element): void {
        if (parentElem.className.indexOf('e-group-container') > -1) {
            this.addRuleElement(parentElem, rule); //Create rule
        } else {
            this.addRuleElement(parentElem.querySelector('.e-group-container'), rule); //Create group
        }
    }
    private getSqlString(rules: RuleModel, queryStr?: string): string {
        let isRoot: boolean = false;
        if (!queryStr) {
            queryStr = '';
            isRoot = true;
        } else {
            queryStr += '(';
        }
        let condition: string = rules.condition;
        for (let j: number = 0, jLen: number = rules.rules.length; j < jLen; j++) {
            if (rules.rules[j].rules) {
                queryStr = this.getSqlString(rules.rules[j], queryStr);
            } else {
                let rule: RuleModel = rules.rules[j];
                let valueStr: string = '';
                if (rule.value instanceof Array) {
                    if (rule.operator.indexOf('between') > -1) {
                        valueStr += rule.value[0] + ' AND ' + rule.value[1];
                    } else {
                        if (typeof rule.value[0] === 'string') {
                            valueStr += '("' + rule.value[0] + '"';
                            for (let k: number = 1, kLen: number = rule.value.length; k < kLen; k++) {
                                valueStr += ',"' + rule.value[k] + '"';
                            }
                            valueStr += ')';
                        } else {
                            valueStr += '(' + rule.value + ')';
                        }
                    }
                } else {
                    if (rule.operator === 'startswith') {
                        valueStr += '("' + rule.value + '%")';
                    } else if (rule.operator === 'endswith') {
                        valueStr += '("%' + rule.value + '")';
                    } else if (rule.operator === 'contains') {
                        valueStr += '("%' + rule.value + '%")';
                    } else {
                        if (rule.type === 'number') {
                            valueStr += rule.value;
                        } else {
                            valueStr += '"' + rule.value + '"';
                        }
                    }
                }
                if (rule.operator.indexOf('null') > -1 || (rule.operator.indexOf('empty') > -1)) {
                    queryStr += rule.field + ' ' + this.operators[rule.operator];
                } else {
                queryStr += rule.field + ' ' + this.operators[rule.operator] + ' ' + valueStr; }
            }
            if (j !== jLen - 1) {
                queryStr += ' ' + condition + ' ';
            }
        }
        if (!isRoot) {
            queryStr += ')';
        }
        return queryStr;
    }
    /**
     * Sets the rules from the sql query.
     */
    public setRulesFromSql(sqlString: string): void {
        let ruleModel: RuleModel = this.getRulesFromSql(sqlString);
        this.setRules({ condition: ruleModel.condition, rules: ruleModel.rules });
    }
    /**
     * Get the rules from SQL query.
     * @returns object.
     */
    public getRulesFromSql(sqlString: string): RuleModel {
        this.parser = [];
        this.sqlParser(sqlString);
        this.rule = { condition: '', rules: [] };
        let rule: RuleModel = this.processParser(this.parser, this.rule, [0]);
        return {condition: rule.condition, rules: rule.rules};
    }
    /**
     * Gets the sql query from rules.
     * @returns object.
     */
    public getSqlFromRules(rule: RuleModel): string {
        rule = this.getRuleCollection(rule, false);
        return this.getSqlString(this.getValidRules(rule)).replace(/"/g, '\'');
    }
    private sqlParser(sqlString: string): string[][] {
        let st: number = 0;
        let str: string;
        do {
            str = sqlString.slice(st);
            st += this.parseSqlStrings(str);
        } while (str !== '');
        return this.parser;
    }
    private parseSqlStrings(sqlString: string): number {
        let operators: string[] = ['=', '!=', '<=', '>=', '<', '>'];
        let conditions: string[] = ['and', 'or'];
        let subOp: string[] = ['IN', 'NOT IN', 'LIKE', 'NOT LIKE', 'BETWEEN', 'NOT BETWEEN', 'IS NULL', 'IS NOT NULL',
        'IS EMPTY', 'IS NOT EMPTY'];
        let regexStr: string;
        let regex: RegExp;
        let matchValue: string;
        for (let i: number = 0, iLen: number = operators.length; i < iLen; i++) {
            regexStr = /^\w+$/.test(operators[i]) ? '\\b' : '';
            regex = new RegExp('^(' + operators[i] + ')' + regexStr, 'ig');
            if (regex.exec(sqlString)) {
                this.parser.push(['Operators', operators[i].toLowerCase()]);
                return operators[i].length;
            }
        }
        for (let i: number = 0, iLen: number = conditions.length; i < iLen; i++) {
            regexStr = /^\w+$/.test(conditions[i]) ? '\\b' : '';
            regex = new RegExp('^(' + conditions[i] + ')' + regexStr, 'ig');
            if (regex.exec(sqlString)) {
                this.parser.push(['Conditions', conditions[i].toLowerCase()]);
                return conditions[i].length;
            }
        }
        for (let i: number = 0, iLen: number = subOp.length; i < iLen; i++) {
            regexStr = /^\w+$/.test(subOp[i]) ? '\\b' : '';
            regex = new RegExp('^(' + subOp[i] + ')' + regexStr, 'ig');
            if (regex.exec(sqlString)) {
                this.parser.push(['SubOperators', subOp[i].toLowerCase()]);
                return subOp[i].length;
            }
        }
        //Left Parenthesis
        if (/^\(/.exec(sqlString)) {
            this.parser.push(['Left', '(']);
            return 1;
        }
        //Right Parenthesis
        if (/^\)/.exec(sqlString)) {
            this.parser.push(['Right', ')']);
            return 1;
        }
        //Literals
        if (/^`?([a-z_][a-z0-9_]{0,}(\:(number|float|string|date|boolean))?)`?/i.exec(sqlString)) {
            matchValue = /^`?([a-z_][a-z0-9_]{0,}(\:(number|float|string|date|boolean))?)`?/i.exec(sqlString)[1];
            this.parser.push(['Literal', matchValue]);
            return matchValue.length;
        }
        //String
        if (/^'((?:[^\\']+?|\\.|'')*)'(?!')/.exec(sqlString)) {
            matchValue = /^'((?:[^\\']+?|\\.|'')*)'(?!')/.exec(sqlString)[0];
            this.parser.push(['String', matchValue]);
            return matchValue.length;
        }
        //Double String
        if (/^"([^\\"]*(?:\\.[^\\"]*)*)"/.exec(sqlString)) {
            matchValue = /^"([^\\"]*(?:\\.[^\\"]*)*)"/.exec(sqlString)[0];
            this.parser.push(['DoubleString', matchValue]);
            return matchValue.length;
        }
        //Number
        if (/^[0-9]+(\.[0-9]+)?/.exec(sqlString)) {
            matchValue = /^[0-9]+(\.[0-9]+)?/.exec(sqlString)[0];
            this.parser.push(['Number', matchValue]);
            return matchValue.length;
        }
        //Negative Number
        if (/^-?[0-9]+(\.[0-9]+)?/.exec(sqlString)) {
            matchValue = /^-?[0-9]+(\.[0-9]+)?/.exec(sqlString)[0];
            this.parser.push(['Number', matchValue]);
            return matchValue.length;
        }
        return 1;
    }
    private getOperator(value: string, operator: string): string {
        let operators: object = {
            '=': 'equal', '!=': 'notequal', '<': 'lessthan', '>': 'greaterthan', '<=': 'lessthanorequal',
            '>=': 'greaterthanorequal', 'in': 'in', 'not in': 'notin', 'between': 'between', 'not between': 'notbetween',
            'is empty': 'isempty', 'is null': 'isnull', 'is not null': 'isnotnull', 'is not empty': 'isnotempty'
        };
        if (value.indexOf('%') === 0 && value.indexOf('%') === value.length - 1) {
            return 'contains';
        } else if (value.indexOf('%') === 0 && value.indexOf('%') !== value.length - 1) {
            return 'startswith';
        } else if (value.indexOf('%') !== 0 && value.indexOf('%') === value.length - 1) {
            return 'endswith';
        }
        return operators[operator];
    }
    private getTypeFromColumn(rules: RuleModel): string {
        let columnData: ColumnsModel[] = this.columns;
        for ( let i: number = 0; i < columnData.length; i++ ) {
            if (columnData[i].field === rules.field) {
                rules.type = columnData[i].type;
                break;
            }
        }
        return rules.type;
    }
    private processParser(parser: string[][], rules: RuleModel, levelColl: number[]): RuleModel {
        let rule: RuleModel; let subRules: RuleModel;
        let numVal: number[] = []; let strVal: string[] = [];
        let j: number; let jLen: number;
        let k: number; let kLen: number;
        let l: number; let lLen: number;
        let grpCount: number;
        let operator: string;
        for (let i: number = 0, iLen: number = parser.length; i < iLen; i++) {
            if (parser[i][0] === 'Literal') {
                rule = { label: parser[i][1], field: parser[i][1] };
                if (parser[i + 1][0] === 'SubOperators') {
                    if (parser[i + 1][1].indexOf('null') > -1 || parser[i + 1][1].indexOf('empty') > -1) {
                        rule.operator = this.getOperator(' ', parser[i + 1][1]);
                        rule.value = null; rule.type = this.getTypeFromColumn(rule);
                    } else {
                        rule.operator = this.getOperator(parser[i + 3][1].replace(/'/g, ''), parser[i + 1][1]); }
                    operator = parser[i + 1][1];
                    i++;
                    j = i + 1;
                    jLen = iLen;
                    for (j = i + 1; j < jLen; j++) {
                        if (parser[j][0] === 'Right') {
                            i = j;
                            break;
                        } else {
                            if (operator.indexOf('null') > -1 || operator.indexOf('empty') > -1) {
                                break;
                            }
                            if (operator === 'like' && parser[j][0] === 'String') {
                                rule.value = parser[j][1].replace(/'/g, '').replace(/%/g, '');
                                rule.type = 'string';
                            } else if (operator === 'between') {
                                if (parser[j][0] === 'Literal' || parser[j][0] === 'Left') {
                                    break;
                                }
                                if (parser[j][0] === 'Number') {
                                    numVal.push(Number(parser[j][1]));
                                }
                            } else {
                                if (parser[j][0] === 'Number') {
                                    numVal.push(Number(parser[j][1]));
                                } else if (parser[j][0] === 'String') {
                                    strVal.push(parser[j][1].replace(/'/g, ''));
                                }
                            }
                        }
                    }
                    if (operator !== 'like') {
                        if (parser[j - 1][0] === 'Number') {
                            rule.value = numVal;
                            rule.type = 'number';
                        } else if (parser[j - 1][0] === 'String') {
                            rule.value = strVal;
                            rule.type = 'string';
                        } else if (operator === 'between' && parser[j - 1][0] === 'Conditions') {
                            rule.value = numVal;
                            rule.type = 'number';
                        }
                    }
                } else if (parser[i + 1][0] === 'Operators') {
                    rule.operator = this.getOperator(parser[i + 2][1], parser[i + 1][1]);
                    if (parser[i + 2][0] === 'Number') {
                        rule.type = 'number';
                        rule.value = Number(parser[i + 2][1]);
                    } else {
                        rule.type = 'string';
                        rule.value = parser[i + 2][1].replace(/'/g, '');
                    }
                }
                rules.rules.push(rule);
            } else if (parser[i][0] === 'Left') {
                this.parser = parser.splice(i + 1, iLen - (i + 1));
                subRules = { condition: '', rules: [] };
                grpCount = 0;
                kLen = rules.rules.length;
                for (k = 0; k < kLen; k++) {   //To get the group position
                    if (rules.rules[k].rules) {
                        grpCount++;
                    }
                }
                levelColl.push(grpCount);
                rules.rules.push(subRules);
                subRules = this.processParser(this.parser, subRules, levelColl);
                return rules;
            } else if (parser[i][0] === 'Conditions') {
                rules.condition = parser[i][1];
            } else if (parser[i][0] === 'Right') {
                this.parser = parser.splice(i + 1, iLen - (i + 1));
                //To get the parent Group
                levelColl.pop();
                rules = this.rule;
                lLen = levelColl.length;
                for (l = 0; l < lLen; l++) {
                    rules = this.findGroupByIdx(levelColl[l], rules, l === 0);
                }
                return this.processParser(this.parser, rules, levelColl);
            }
        }
        return rules;
    }
}

class LevelColl {
    public groupElement: Element;
    public level: number[];
}

export interface Level {
    [key: string]: number[];
}

export interface TemplateColumn {
    /**
     * Creates the custom component.
     * @default null
     */
    create?: Element | Function | string;
    /**
     * Wire events for the custom component.
     * @default null
     */
    write?: void | Function | string;
    /**
     * Destroy the custom component.
     * @default null
     */
    destroy?: Function | string;
}
export interface Validation {
    /**
     * Specifies the minimum value in textbox validation.
     * @default 2
     */
    min?: number;
    /**
     * Specifies the maximum value in textbox validation.
     * @default 10
     */
    max?: number;
    /**
     * Specifies whether the value is required or not
     * @default true
     */
    isRequired: boolean;
}

/**
 * Interface for change event.
 */
export interface ChangeEventArgs extends BaseEventArgs {
    groupID: string;
    ruleID?: string;
    value?: string | number | Date | boolean | string[];
    selectedIndex?: number;
    selectedField?: string;
    cancel?: boolean;
    type?: string;
}
export interface RuleChangeEventArgs extends BaseEventArgs {
    previousRule?: RuleModel;
    rule: RuleModel;
    type?: string;
}