import { isNullOrUndefined, extend, EventHandler, formatUnit, Browser } from '@syncfusion/ej2-base';
import { createElement, remove, addClass, removeClass, append, prepend } from '@syncfusion/ej2-base';
import { Schedule } from '../base/schedule';
import { ViewBase, ViewHelper } from './view-base';
import { VerticalEvent } from '../event-renderer/vertical-view';
import { MonthEvent } from '../event-renderer/month';
import { RenderCellEventArgs, CellTemplateArgs, TdData, NotifyEventArgs, IRenderer, TimeSlotData } from '../base/interface';
import * as util from '../base/util';
import * as event from '../base/constant';
import * as cls from '../base/css-constant';

/**
 * vertical view
 */
export class VerticalView extends ViewBase implements IRenderer {
    public currentTimeIndicatorTimer: number;
    public viewClass: string = 'e-day-view';
    public isInverseTableSelect: boolean = true;
    public baseCssClass: string = 'e-vertical-view';
    /**
     * Constructor for vertical view
     */
    constructor(parent: Schedule) {
        super(parent);
    }
    public addEventListener(): void {
        this.parent.on(event.scrollUiUpdate, this.scrollUiUpdate, this);
        this.parent.on(event.dataReady, this.renderEvents, this);
    }
    public removeEventListener(): void {
        this.parent.off(event.scrollUiUpdate, this.scrollUiUpdate);
        this.parent.off(event.dataReady, this.renderEvents);
    }
    public renderEvents(): void {
        if (this.parent.activeViewOptions.timeScale.enable) {
            let appointment: VerticalEvent = new VerticalEvent(this.parent);
            appointment.renderAppointments();
        } else {
            let appointment: MonthEvent = new MonthEvent(this.parent);
            appointment.renderAppointments();
        }
        this.parent.notify(event.eventsLoaded, {});
    }
    private onContentScroll(e: Event): void {
        this.parent.removeNewEventElement();
        let target: HTMLElement = <HTMLElement>e.target;
        this.parent.notify(event.virtualScroll, e);
        this.scrollLeftPanel(target);
        this.scrollTopPanel(target);
        if (!this.parent.isAdaptive) {
            this.parent.uiStateValues.top = target.scrollTop;
        }
        this.parent.uiStateValues.left = target.scrollLeft;
        if (!isNullOrUndefined(this.parent.quickPopup)) {
            this.parent.quickPopup.quickPopupHide();
        }
        this.setPersistence();
    }
    private onApaptiveMove(e: Event): void {
        if (this.parent.uiStateValues.action) {
            e.preventDefault();
        }
    }
    private onApaptiveScroll(e: Event): void {
        this.parent.removeNewEventElement();
        this.parent.uiStateValues.top = (<HTMLElement>e.target).scrollTop;
    }
    public scrollLeftPanel(target: HTMLElement): void {
        let leftPanel: HTMLElement = this.getLeftPanelElement();
        if (!isNullOrUndefined(leftPanel)) {
            leftPanel.scrollTop = target.scrollTop;
        }
    }
    private scrollUiUpdate(args: NotifyEventArgs): void {
        let headerBarHeight: number = this.getHeaderBarHeight();
        let timecells: HTMLElement = this.getLeftPanelElement();
        let content: HTMLElement = this.getScrollableElement() as HTMLElement;
        let header: HTMLElement = this.getDatesHeaderElement();
        let scrollerHeight: number = this.parent.element.offsetHeight - headerBarHeight - header.offsetHeight;
        this.setColWidth(content);
        this.setContentHeight(content, timecells, scrollerHeight);
        let scrollBarWidth: number = util.getScrollBarWidth();
        // tslint:disable:no-any
        (header.firstElementChild as HTMLElement).style[<any>args.cssProperties.rtlBorder] = '';
        header.style[<any>args.cssProperties.rtlPadding] = '';
        if (content.offsetWidth - content.clientWidth > 0) {
            (header.firstElementChild as HTMLElement).style[<any>args.cssProperties.border] = scrollBarWidth > 0 ? '1px' : '0px';
            header.style[<any>args.cssProperties.padding] = scrollBarWidth > 0 ? scrollBarWidth - 1 + 'px' : '0px';
        } else {
            (header.firstElementChild as HTMLElement).style[<any>args.cssProperties.border] = '';
            header.style[<any>args.cssProperties.padding] = '';
        }
        // tslint:enable:no-any
        if (!args.isPreventScrollUpdate) {
            if (this.parent.uiStateValues.isInitial) {
                this.scrollToWorkHour();
                this.parent.uiStateValues.isInitial = false;
            } else {
                if (timecells) {
                    timecells.scrollTop = this.parent.uiStateValues.top;
                }
                content.scrollTop = this.parent.uiStateValues.top;
                content.scrollLeft = this.parent.uiStateValues.left;
            }
        }
        if (this.parent.activeViewOptions.timeScale.enable) {
            this.highlightCurrentTime();
        }
        this.retainScrollPosition();
    }
    public setContentHeight(element: HTMLElement, leftPanelElement: HTMLElement, height: number): void {
        if (this.parent.isAdaptive && !this.isTimelineView() && !this.parent.isServerRenderer()) {
            element.style.height = (this.parent.height === 'auto') ? 'auto' : formatUnit(height);
        } else {
            if (!isNullOrUndefined(leftPanelElement)) {
                leftPanelElement.style.height = (this.parent.height === 'auto') ? 'auto'
                    : formatUnit(height - this.getScrollXIndent(element));
            }
            element.style.height = (this.parent.height === 'auto') ? 'auto' : formatUnit(height);
        }
    }
    public scrollToWorkHour(): void {
        if (this.parent.workHours.highlight) {
            let firstWorkHourCell: HTMLElement = <HTMLElement>this.element.querySelector('.' + cls.WORK_HOURS_CLASS);
            if (firstWorkHourCell) {
                this.getScrollableElement().scrollTop = firstWorkHourCell.offsetTop;
                this.parent.uiStateValues.top = firstWorkHourCell.offsetTop;
                this.parent.uiStateValues.left = 0;
            }
        }
    }
    public scrollToHour(hour: string, scrollDate?: Date): void {
        let date: Date = this.parent.getStartEndTime(hour);
        if (isNullOrUndefined(date) || !isNullOrUndefined(scrollDate)) {
            return;
        }
        this.getScrollableElement().scrollTop = this.getTopFromDateTime(date);
    }
    public generateColumnLevels(): TdData[][] {
        let level: TdData[] = this.getDateSlots(this.renderDates, this.parent.activeViewOptions.workDays);
        let columnLevels: TdData[][] = [];
        if (this.parent.activeViewOptions.group.resources.length > 0) {
            columnLevels = this.parent.resourceBase.generateResourceLevels(level);
            if (this.parent.uiStateValues.isGroupAdaptive && this.parent.resourceBase.lastResourceLevel.length > 0) {
                let resourceLevel: TdData = this.parent.resourceBase.lastResourceLevel[this.parent.uiStateValues.groupIndex];
                let resStartHour: string = resourceLevel.resourceData[resourceLevel.resource.startHourField] as string;
                let resEndHour: string = resourceLevel.resourceData[resourceLevel.resource.endHourField] as string;
                let dateSlots: TdData[] = this.getDateSlots(resourceLevel.renderDates, resourceLevel.workDays, resStartHour, resEndHour);
                columnLevels = [dateSlots];
            }
        } else {
            columnLevels.push(level);
        }
        this.colLevels = columnLevels;
        return columnLevels;
    }
    public getDateSlots(renderDates: Date[], workDays: number[], workStartHour: string = this.parent.workHours.start, workEndHour: string =
        this.parent.workHours.end): TdData[] {
        let dateCol: TdData[] = [];
        let start: Date = this.parent.getStartEndTime(workStartHour);
        let end: Date = this.parent.getStartEndTime(workEndHour);
        for (let col of renderDates) {
            let classList: string[] = [cls.HEADER_CELLS_CLASS];
            if (this.isCurrentDate(col)) {
                classList.push(cls.CURRENT_DAY_CLASS);
            }
            dateCol.push({
                date: col, type: 'dateHeader', className: classList, colSpan: 1,
                workDays: workDays, startHour: new Date(+start), endHour: new Date(+end)
            });
        }
        return dateCol;
    }
    private isWorkHourRange(date: Date): boolean {
        return (this.getStartHour().getTime() <= date.getTime()) && (this.getEndHour().getTime() >= date.getTime());
    }
    public highlightCurrentTime(): void {
        if (this.parent.activeViewOptions.headerRows.length > 0 &&
            this.parent.activeViewOptions.headerRows.slice(-1)[0].option !== 'Hour') {
            return;
        }
        if (this.parent.isServerRenderer()) {
            let curEle: Element[] = [].slice.call(this.element.querySelectorAll('.' + cls.CURRENT_DAY_CLASS));
            if (curEle.length > 0) {
                removeClass(curEle, cls.CURRENT_DAY_CLASS);
            }
            let curDate: Date = util.addLocalOffset(new Date(new Date().setHours(0, 0, 0, 0)));
            let queryString: string = '.' + cls.DATE_HEADER_CLASS + '[data-date="' + curDate.getTime().toString() + '"]';
            curEle = [].slice.call(this.element.querySelectorAll(queryString));
            for (let ele of curEle) {
                addClass([ele], cls.CURRENT_DAY_CLASS);
            }
        }
        if (this.parent.showTimeIndicator && this.isWorkHourRange(this.parent.getCurrentTime())) {
            let currentDateIndex: number[] = this.getCurrentTimeIndicatorIndex();
            if (currentDateIndex.length > 0) {
                let workCells: HTMLElement[] = [].slice.call(this.element.querySelectorAll('.' + cls.WORK_CELLS_CLASS));
                if (workCells.length > 0) {
                    this.changeCurrentTimePosition();
                }
                if (isNullOrUndefined(this.currentTimeIndicatorTimer)) {
                    this.currentTimeIndicatorTimer = window.setInterval(() => { this.changeCurrentTimePosition(); }, util.MS_PER_MINUTE);
                }
            } else {
                this.clearCurrentTimeIndicatorTimer();
            }
        } else {
            this.clearCurrentTimeIndicatorTimer();
        }
    }
    public getCurrentTimeIndicatorIndex(): number[] {
        let currentDateIndex: number[] = [];
        if (!isNullOrUndefined(this.parent.resourceBase) && (this.parent.activeViewOptions.group.resources.length > 0) &&
            !this.parent.uiStateValues.isGroupAdaptive) {
            let count: number = 0;
            for (let resource of this.parent.resourceBase.lastResourceLevel) {
                let index: number = this.parent.getIndexOfDate(resource.renderDates, util.resetTime(this.parent.getCurrentTime()));
                if (index >= 0) {
                    let resIndex: number = this.parent.activeViewOptions.group.byDate ?
                        (this.parent.resourceBase.lastResourceLevel.length * index) + count : count + index;
                    currentDateIndex.push(resIndex);
                }
                count += this.parent.activeViewOptions.group.byDate ? 1 : resource.renderDates.length;
            }
        } else {
            let renderDates: Date[] = (this.parent.uiStateValues.isGroupAdaptive && this.parent.resourceBase.lastResourceLevel.length > 0) ?
                this.parent.resourceBase.lastResourceLevel[this.parent.uiStateValues.groupIndex].renderDates : this.renderDates;
            let index: number = this.parent.getIndexOfDate(renderDates, util.resetTime(this.parent.getCurrentTime()));
            if (index >= 0) {
                currentDateIndex.push(index);
            }
        }
        return currentDateIndex;
    }
    private clearCurrentTimeIndicatorTimer(): void {
        if (!isNullOrUndefined(this.currentTimeIndicatorTimer)) {
            window.clearInterval(this.currentTimeIndicatorTimer);
            this.currentTimeIndicatorTimer = null;
            this.removeCurrentTimeIndicatorElements();
        }
    }
    public removeCurrentTimeIndicatorElements(): void {
        let queryString: string = '.' + cls.PREVIOUS_TIMELINE_CLASS + ',.' + cls.CURRENT_TIMELINE_CLASS + ',.' + cls.CURRENT_TIME_CLASS;
        let timeIndicator: HTMLElement[] = [].slice.call(this.element.querySelectorAll(queryString));
        for (let indicator of timeIndicator) {
            remove(indicator);
        }
    }
    public changeCurrentTimePosition(): void {
        if (this.parent.isDestroyed) { return; }
        this.removeCurrentTimeIndicatorElements();
        let currentDateIndex: number[] = this.getCurrentTimeIndicatorIndex();
        let firstRow: HTMLTableRowElement = (this.parent.getContentTable() as HTMLTableElement).rows[0];
        let top: number = this.getTopFromDateTime(this.parent.getCurrentTime());
        let topInPx: string = formatUnit(top);
        let rowIndex: number = Math.floor(top / firstRow.cells[0].offsetHeight);
        let timeCellsWrap: Element = this.getLeftPanelElement();
        let timeTrs: HTMLElement[] = [].slice.call(timeCellsWrap.querySelectorAll('tr'));
        if (isNullOrUndefined(rowIndex) || isNaN(rowIndex) || rowIndex === timeTrs.length) { return; }
        let curTimeWrap: HTMLElement[] = [].slice.call(this.element.querySelectorAll('.' + cls.TIMELINE_WRAPPER_CLASS));
        for (let i: number = 0, length: number = currentDateIndex[0]; i < length; i++) {
            curTimeWrap[i].appendChild(createElement('div', { className: cls.PREVIOUS_TIMELINE_CLASS, styles: 'top:' + topInPx }));
        }
        for (let day of currentDateIndex) {
            curTimeWrap[day].appendChild(createElement('div', { className: cls.CURRENT_TIMELINE_CLASS, styles: 'top:' + topInPx }));
        }
        let currentTimeEle: HTMLElement = createElement('div', {
            innerHTML: this.parent.getTimeString(this.parent.getCurrentTime()),
            className: cls.CURRENT_TIME_CLASS,
            styles: 'top:' + topInPx
        });
        if (rowIndex <= timeTrs.length) {
            removeClass(timeCellsWrap.querySelectorAll('.' + cls.HIDE_CHILDS_CLASS), cls.HIDE_CHILDS_CLASS);
            if (timeTrs[rowIndex]) {
                addClass([timeTrs[rowIndex].lastElementChild as Element], cls.HIDE_CHILDS_CLASS);
            }
            prepend([currentTimeEle], timeCellsWrap);
            currentTimeEle.style.top = formatUnit(currentTimeEle.offsetTop - (currentTimeEle.offsetHeight / 2));
        }
    }
    public getTopFromDateTime(date: Date): number {
        let startHour: Date = this.getStartHour();
        let diffInMinutes: number = ((date.getHours() - startHour.getHours()) * 60) + (date.getMinutes() - startHour.getMinutes());
        return (diffInMinutes * this.getWorkCellHeight() * this.parent.activeViewOptions.timeScale.slotCount) /
            this.parent.activeViewOptions.timeScale.interval;
    }
    private getWorkCellHeight(): number {
        return (this.element.querySelector('.' + cls.WORK_CELLS_CLASS) as HTMLElement).offsetHeight;
    }
    private getTdContent(date: Date, type: string, groupIndex?: number): HTMLElement[] {
        let cntEle: HTMLElement[];
        let wrapper: HTMLElement = createElement('div');
        let templateName: string = '';
        let templateId: string = this.parent.element.id + '_';
        let dateValue: Date = util.addLocalOffset(date);
        switch (type) {
            case 'dateHeader':
                if (this.parent.activeViewOptions.dateHeaderTemplate) {
                    templateName = 'dateHeaderTemplate';
                    let args: CellTemplateArgs = { date: dateValue, type: type };
                    let viewName: string = this.parent.activeViewOptions.dateHeaderTemplateName;
                    cntEle = [].slice.call(
                        this.parent.getDateHeaderTemplate()(args, this.parent, templateName, templateId + viewName + templateName, false));
                } else {
                    wrapper.innerHTML = this.parent.activeView.isTimelineView() ?
                        `<span class="e-header-date e-navigate">${ViewHelper.getTimelineDate(this.parent, date)}</span>` :
                        `<div class="e-header-day">${util.capitalizeFirstWord(ViewHelper.getDayName(this.parent, date), 'single')}</div>` +
                        `<div class="e-header-date e-navigate" role="link">${ViewHelper.getDate(this.parent, date)}</div>`;
                    cntEle = [].slice.call(wrapper.childNodes);
                }
                break;
            case 'majorSlot':
                if (this.parent.activeViewOptions.timeScale.majorSlotTemplate) {
                    templateName = 'majorSlotTemplate';
                    let args: CellTemplateArgs = { date: dateValue, type: type };
                    cntEle = [].slice.call(
                        this.parent.getMajorSlotTemplate()(args, this.parent, templateName, templateId + templateName, false));
                } else {
                    wrapper.innerHTML = `<span>${ViewHelper.getTime(this.parent, date)}</span>`;
                    cntEle = [].slice.call(wrapper.childNodes);
                }
                break;
            case 'minorSlot':
                if (this.parent.activeViewOptions.timeScale.minorSlotTemplate) {
                    templateName = 'minorSlotTemplate';
                    let args: CellTemplateArgs = { date: dateValue, type: type };
                    cntEle = [].slice.call(
                        this.parent.getMinorSlotTemplate()(args, this.parent, templateName, templateId + templateName, false));
                } else {
                    wrapper.innerHTML = '&nbsp;';
                    cntEle = [].slice.call(wrapper.childNodes);
                }
                break;
            case 'alldayCells':
                if (this.parent.activeViewOptions.cellTemplate) {
                    let viewName: string = this.parent.activeViewOptions.cellTemplateName;
                    templateName = 'cellTemplate';
                    let args: CellTemplateArgs = { date: dateValue, type: type, groupIndex: groupIndex };
                    cntEle = [].slice.call(
                        this.parent.getCellTemplate()(args, this.parent, templateName, templateId + viewName + templateName, false));
                }
                break;
        }
        return cntEle;
    }
    public serverRenderLayout(): void {
        this.setPanel(this.parent.element.querySelector('.' + cls.TABLE_WRAP_CLASS));
        if (this.parent.uiStateValues.isGroupAdaptive && !this.parent.element.querySelector('.' + cls.RESOURCE_TOOLBAR_CONTAINER)) {
            this.renderResourceMobileLayout();
        }
        let headerCells: Element[] =
            [].slice.call(this.element.querySelectorAll('.' + cls.DATE_HEADER_WRAP_CLASS + ' td.' + cls.HEADER_CELLS_CLASS));
        for (let cell of headerCells) {
            EventHandler.clearEvents(cell);
            this.wireMouseEvents(cell);
        }
        let alldayCells: Element[] =
            [].slice.call(this.element.querySelectorAll('.' + cls.DATE_HEADER_WRAP_CLASS + ' td.' + cls.ALLDAY_CELLS_CLASS));
        for (let cell of alldayCells) {
            EventHandler.clearEvents(cell);
            this.wireCellEvents(cell);
        }
        if (this.parent.virtualScrollModule) {
            this.parent.virtualScrollModule.setTranslateValue();
        }
        let wrap: Element = this.element.querySelector('.' + cls.CONTENT_WRAP_CLASS);
        let contentBody: Element = this.element.querySelector('.' + cls.CONTENT_TABLE_CLASS + ' tbody');
        EventHandler.clearEvents(contentBody);
        this.wireCellEvents(contentBody);
        EventHandler.clearEvents(wrap);
        EventHandler.add(wrap, 'scroll', this.onContentScroll, this);
        EventHandler.add(wrap, Browser.touchMoveEvent, this.onApaptiveMove, this);
        this.wireExpandCollapseIconEvents();
        this.parent.notify(event.contentReady, {});
    }
    public renderLayout(type: string): void {
        if (this.parent.isServerRenderer()) {
            this.colLevels = this.generateColumnLevels();
            if (this.parent.resourceBase && this.parent.activeViewOptions.group.resources.length > 0 &&
                !this.parent.uiStateValues.isGroupAdaptive && this.parent.activeView.isTimelineView()) {
                this.parent.resourceBase.setRenderedResources();
            }
            return;
        }
        this.setPanel(createElement('div', { className: cls.TABLE_WRAP_CLASS }));
        let clsList: string[] = [this.baseCssClass, this.viewClass];
        clsList.push(type);
        if (this.parent.activeViewOptions.group.byDate) {
            clsList.push('e-by-date');
        }
        if (!this.parent.activeViewOptions.timeScale.enable) {
            addClass([this.element], [cls.TIMESCALE_DISABLE, this.viewClass]);
        }
        if (this.parent.activeViewOptions.allowVirtualScrolling) {
            clsList.push(cls.VIRTUAL_SCROLL_CLASS);
        }
        if (this.parent.eventSettings.ignoreWhitespace) {
            clsList.push(cls.IGNORE_WHITESPACE);
        }
        this.renderPanel(type);
        addClass([this.element], clsList);
        this.element.appendChild(this.createTableLayout(cls.OUTER_TABLE_CLASS) as HTMLElement);
        this.element.querySelector('table').setAttribute('role', 'presentation');
        this.colLevels = this.generateColumnLevels();
        this.renderHeader();
        this.renderContent();
        if (this.parent.uiStateValues.isGroupAdaptive && !this.parent.element.querySelector('.' + cls.RESOURCE_TOOLBAR_CONTAINER)) {
            this.renderResourceMobileLayout();
        }
        this.parent.notify(event.contentReady, {});
    }
    public renderHeader(): void {
        let tr: Element = createElement('tr');
        let dateTd: Element = createElement('td');
        dateTd.appendChild(this.renderDatesHeader());
        if (this.parent.activeViewOptions.timeScale.enable) {
            let indentTd: Element = createElement('td', { className: cls.LEFT_INDENT_CLASS });
            indentTd.appendChild(this.renderLeftIndent());
            tr.appendChild(indentTd);
        }
        tr.appendChild(dateTd);
        prepend([tr], this.element.querySelector('tbody'));
    }
    public renderContent(): void {
        let tr: Element = createElement('tr');
        let workTd: Element = createElement('td');
        if (this.parent.isAdaptive) {
            workTd.setAttribute('colspan', (this.parent.activeViewOptions.timeScale.enable ? '2' : '1'));
            let scrollContainer: HTMLElement = createElement('div', { className: cls.SCROLL_CONTAINER_CLASS });
            if (this.parent.activeViewOptions.timeScale.enable) {
                scrollContainer.appendChild(this.renderTimeCells());
            }
            scrollContainer.appendChild(this.renderContentArea());
            workTd.appendChild(scrollContainer);
            EventHandler.add(scrollContainer, 'scroll', this.onApaptiveScroll, this);
            EventHandler.add(scrollContainer, Browser.touchMoveEvent, this.onApaptiveMove, this);
            tr.appendChild(workTd);
        } else {
            workTd.appendChild(this.renderContentArea());
            if (this.parent.activeViewOptions.timeScale.enable) {
                let timesTd: Element = createElement('td');
                timesTd.appendChild(this.renderTimeCells());
                tr.appendChild(timesTd);
            }
            tr.appendChild(workTd);
        }
        this.element.querySelector('tbody').appendChild(tr);
    }
    private renderLeftIndent(): HTMLElement {
        let wrap: HTMLElement = createElement('div', { className: cls.LEFT_INDENT_WRAP_CLASS });
        let tbl: Element = this.createTableLayout();
        let trEle: Element = createElement('tr');
        let rowCount: number = this.colLevels.length;
        for (let i: number = 0; i < rowCount; i++) {
            let ntr: Element = trEle.cloneNode() as Element;
            let data: TdData = { className: [(this.colLevels[i][0] && this.colLevels[i][0].className[0])], type: 'emptyCells' };
            if (this.parent.activeViewOptions.showWeekNumber && data.className.indexOf(cls.HEADER_CELLS_CLASS) !== -1) {
                data.className.push(cls.WEEK_NUMBER_CLASS);
                let weekNo: number = ViewHelper.getWeekNumberContent(this.parent, this.renderDates);
                data.template = [createElement('span', {
                    innerHTML: '' + weekNo,
                    attrs: { title: this.parent.localeObj.getConstant('week') + ' ' + weekNo }
                })];
            }
            ntr.appendChild(this.createTd(data));
            tbl.querySelector('tbody').appendChild(ntr);
        }
        let ntr: Element = trEle.cloneNode() as Element;
        let appointmentExpandCollapse: Element = createElement('div', {
            attrs: {
                'tabindex': '0', 'role': 'list',
                title: this.parent.localeObj.getConstant('expandAllDaySection'), 'aria-disabled': 'false', 'aria-label': 'Expand section'
            },
            className: cls.ALLDAY_APPOINTMENT_SECTION_CLASS + ' ' + cls.APPOINTMENT_ROW_EXPAND_CLASS + ' ' +
                cls.ICON + ' ' + cls.DISABLE_CLASS,
        });
        let data: TdData = { className: [cls.ALLDAY_CELLS_CLASS], type: 'emptyCells' };
        let nth: Element = this.createTd(data);
        nth.appendChild(appointmentExpandCollapse);
        ntr.appendChild(nth);
        tbl.querySelector('tbody').appendChild(ntr);
        wrap.appendChild(tbl);
        return wrap;
    }
    public renderDatesHeader(): Element {
        let container: Element = createElement('div', { className: cls.DATE_HEADER_CONTAINER_CLASS });
        let wrap: Element = createElement('div', { className: cls.DATE_HEADER_WRAP_CLASS });
        container.appendChild(wrap);
        let tbl: Element = this.createTableLayout();
        let trEle: Element = createElement('tr');
        let rowCount: number = this.colLevels.length;
        let lastLevel: TdData[] = this.colLevels[rowCount - 1];
        for (let i: number = 0; i < rowCount; i++) {
            let ntr: Element = trEle.cloneNode() as Element;
            addClass([ntr], cls.HEADER_ROW_CLASS);
            let level: TdData[] = this.colLevels[i];
            for (let j: number = 0; j < level.length; j++) {
                ntr.appendChild(this.createTd(level[j]));
            }
            tbl.querySelector('tbody').appendChild(ntr);
        }
        this.createAllDayRow(tbl, lastLevel);
        this.createColGroup(tbl, lastLevel);
        wrap.appendChild(tbl);
        return container;
    }

    public createAllDayRow(table: Element, tdData: TdData[]): void {
        let ntr: Element = createElement('tr');
        addClass([ntr], cls.ALLDAY_ROW_CLASS);
        for (let j: number = 0; j < tdData.length; j++) {
            let td: TdData = <TdData>extend({}, tdData[j]);
            td.className = [cls.ALLDAY_CELLS_CLASS];
            td.type = 'alldayCells';
            let ntd: Element = this.createTd(td);
            ntd.setAttribute('data-date', td.date.getTime().toString());
            if (!isNullOrUndefined(td.groupIndex)) {
                ntd.setAttribute('data-group-index', '' + td.groupIndex);
            }
            this.wireCellEvents(ntd);
            ntr.appendChild(ntd);
        }
        table.querySelector('tbody').appendChild(ntr);
        let thead: HTMLElement = createElement('thead');
        thead.appendChild(this.createEventWrapper('allDay'));
        prepend([thead], table);
    }
    public createTd(td: TdData): Element {
        let tdEle: Element = createElement('td');
        this.addAttributes(td, tdEle);
        if (td.date && td.type) {
            let ele: HTMLElement[] = this.getTdContent(td.date, td.type, td.groupIndex);
            if (ele && ele.length) {
                append(ele, tdEle);
            }
        }
        if (!this.parent.isMinMaxDate(util.resetTime(new Date('' + td.date)))) {
            addClass([tdEle], cls.DISABLE_DATES);
        }
        if (td.type === 'resourceHeader') {
            this.setResourceHeaderContent(tdEle, td);
        }
        if (td.type === 'dateHeader' && td.className.indexOf(cls.HEADER_CELLS_CLASS) >= 0) {
            tdEle.setAttribute('data-date', td.date.getTime().toString());
            if (!isNullOrUndefined(td.groupIndex)) {
                tdEle.setAttribute('data-group-index', '' + td.groupIndex);
            }
            this.wireMouseEvents(tdEle);
        }
        let args: RenderCellEventArgs = { elementType: td.type, element: tdEle, date: td.date, groupIndex: td.groupIndex };
        this.parent.trigger(event.renderCell, args);
        return tdEle;
    }
    private wireCellEvents(element: Element): void {
        EventHandler.add(element, 'mousedown', this.parent.workCellAction.cellMouseDown, this.parent.workCellAction);
        this.wireMouseEvents(element);
    }
    private wireMouseEvents(element: Element): void {
        EventHandler.add(element, 'click', this.parent.workCellAction.cellClick, this.parent.workCellAction);
        if (!this.parent.isAdaptive) {
            EventHandler.add(element, 'dblclick', this.parent.workCellAction.cellDblClick, this.parent.workCellAction);
        }
    }
    private renderTimeCells(): HTMLElement {
        let wrap: HTMLElement = createElement('div', { className: cls.TIME_CELLS_WRAP_CLASS });
        let tbl: Element = this.createTableLayout();
        let trEle: Element = createElement('tr');
        let handler: Function = (r: TimeSlotData): TimeSlotData => {
            r.type = r.first ? 'majorSlot' : 'minorSlot';
            r.className = r.last ? [cls.TIME_CELLS_CLASS, cls.TIME_SLOT_CLASS] : [cls.TIME_SLOT_CLASS];
            let ntr: Element = trEle.cloneNode() as Element;
            let data: TdData = { date: r.date, type: r.type, className: r.className };
            ntr.appendChild(this.createTd(data));
            tbl.querySelector('tbody').appendChild(ntr);
            return r;
        };
        this.getTimeSlotRows(handler);
        wrap.appendChild(tbl);
        return wrap;
    }
    public renderContentArea(): Element {
        let wrap: Element = createElement('div', { className: cls.CONTENT_WRAP_CLASS });
        let tbl: Element = this.createTableLayout(cls.CONTENT_TABLE_CLASS);
        this.addAutoHeightClass(tbl);
        this.renderContentTable(tbl);
        this.createColGroup(tbl, this.colLevels.slice(-1)[0]);
        wrap.appendChild(tbl);
        this.wireCellEvents(tbl.querySelector('tbody'));
        EventHandler.add(wrap, 'scroll', this.onContentScroll, this);
        EventHandler.add(wrap, Browser.touchMoveEvent, this.onApaptiveMove, this);
        return wrap;
    }
    public renderContentTable(table: Element): void {
        let tr: Element = createElement('tr', { attrs: { role: 'row' } });
        let td: Element = createElement('td', { attrs: { role: 'gridcell', 'aria-selected': 'false' } });
        let tbody: Element = table.querySelector('tbody');
        let handler: Function = (r: TimeSlotData): TimeSlotData => {
            let ntr: Element = tr.cloneNode() as Element;
            for (let tdData of this.colLevels[this.colLevels.length - 1]) {
                let ntd: Element = this.createContentTd(tdData, r, td);
                ntr.appendChild(ntd);
            }
            tbody.appendChild(ntr);
            return r;
        };
        this.getTimeSlotRows(handler);
        this.renderContentTableHeader(table);
    }
    public createContentTd(tdData: TdData, r: TimeSlotData, td: Element): Element {
        let ntd: Element = td.cloneNode() as Element;
        if (tdData.colSpan) { ntd.setAttribute('colspan', tdData.colSpan.toString()); }
        let clsName: string[] = this.getContentTdClass(r);
        if (!this.parent.isMinMaxDate(util.resetTime(new Date('' + tdData.date)))) {
            clsName.push(cls.DISABLE_DATES);
        }
        let cellDate: Date = util.resetTime(new Date('' + tdData.date));
        util.setTime(cellDate, util.getDateInMs(r.date));
        let type: string = 'workCells';
        if (tdData.className.indexOf(cls.RESOURCE_PARENT_CLASS) !== -1) {
            clsName.push(cls.RESOURCE_GROUP_CELLS_CLASS);
            type = 'resourceGroupCells';
        }
        if (this.parent.workHours.highlight && ((this.parent.activeViewOptions.timeScale.enable &&
            this.isWorkHour(cellDate, tdData.startHour, tdData.endHour, tdData.workDays)) ||
            (!this.parent.activeViewOptions.timeScale.enable && this.isWorkDay(cellDate, tdData.workDays)))) {
            clsName.push(cls.WORK_HOURS_CLASS);
        }
        addClass([ntd], clsName);
        if (this.parent.activeViewOptions.cellTemplate) {
            let dateValue: Date = util.addLocalOffset(cellDate);
            let args: CellTemplateArgs = { date: dateValue, type: type, groupIndex: tdData.groupIndex };
            let scheduleId: string = this.parent.element.id + '_';
            let viewName: string = this.parent.activeViewOptions.cellTemplateName;
            let templateId: string = scheduleId + viewName + 'cellTemplate';
            let tooltipTemplate: HTMLElement[] =
                [].slice.call(this.parent.getCellTemplate()(args, this.parent, 'cellTemplate', templateId, false));
            append(tooltipTemplate, ntd);
        }
        ntd.setAttribute('data-date', cellDate.getTime().toString());
        if (!isNullOrUndefined(tdData.groupIndex) || this.parent.uiStateValues.isGroupAdaptive) {
            let groupIndex: number = this.parent.uiStateValues.isGroupAdaptive ? this.parent.uiStateValues.groupIndex :
                tdData.groupIndex;
            ntd.setAttribute('data-group-index', '' + groupIndex);
        }
        let args: RenderCellEventArgs = { elementType: type, element: ntd, date: cellDate, groupIndex: tdData.groupIndex };
        this.parent.trigger(event.renderCell, args);
        return ntd;
    }
    public getContentTdClass(r: TimeSlotData): string[] {
        return r.last ? [cls.WORK_CELLS_CLASS] : [cls.WORK_CELLS_CLASS, cls.ALTERNATE_CELLS_CLASS];
    }
    private renderContentTableHeader(table: Element): void {
        let thead: Element = createElement('thead');
        thead.appendChild(this.createEventWrapper());
        if (this.parent.activeViewOptions.timeScale.enable) {
            thead.appendChild(this.createEventWrapper('timeIndicator'));
        }
        prepend([thead], table);
    }
    private createEventWrapper(type: string = ''): HTMLElement {
        let tr: HTMLElement = createElement('tr');
        let levels: TdData[] = this.colLevels.slice(-1)[0];
        for (let i: number = 0, len: number = levels.length; i < len; i++) {
            let col: TdData = levels[i];
            let appointmentWrap: HTMLElement = createElement('td', {
                className: (type === 'allDay') ? cls.ALLDAY_APPOINTMENT_WRAPPER_CLASS : (type === 'timeIndicator') ?
                    cls.TIMELINE_WRAPPER_CLASS : cls.DAY_WRAPPER_CLASS, attrs: { 'data-date': col.date.getTime().toString() }
            });
            if (!isNullOrUndefined(col.groupIndex)) {
                appointmentWrap.setAttribute('data-group-index', col.groupIndex.toString());
            }
            if (type === '') {
                let innerWrapper: HTMLElement = createElement('div', {
                    id: cls.APPOINTMENT_WRAPPER_CLASS + '-' + i.toString(),
                    className: cls.APPOINTMENT_WRAPPER_CLASS
                });
                appointmentWrap.appendChild(innerWrapper);
            }
            tr.appendChild(appointmentWrap);
        }
        return tr;
    }
    public getScrollableElement(): Element {
        if (this.parent.isAdaptive && !this.isTimelineView() && !this.parent.isServerRenderer()) {
            return this.element.querySelector('.' + cls.SCROLL_CONTAINER_CLASS);
        } else {
            return this.getContentAreaElement();
        }
    }
    public getLeftPanelElement(): HTMLElement {
        return this.element.querySelector('.' + cls.TIME_CELLS_WRAP_CLASS) as HTMLElement;
    }
    public getEndDateFromStartDate(start: Date): Date {
        let msMajorInterval: number = this.parent.activeViewOptions.timeScale.interval * util.MS_PER_MINUTE;
        let msInterval: number = msMajorInterval / this.parent.activeViewOptions.timeScale.slotCount;
        let end: Date = new Date(start.getTime());
        end.setMilliseconds(end.getMilliseconds() + msInterval);
        return end;
    }
    public getTimeSlotRows(handler?: Function): TimeSlotData[] {
        let rows: TimeSlotData[] = [];
        let startHour: Date = this.getStartHour();
        let endHour: Date = this.getEndHour();
        let msMajorInterval: number = this.parent.activeViewOptions.timeScale.interval * util.MS_PER_MINUTE;
        let msInterval: number = msMajorInterval / this.parent.activeViewOptions.timeScale.slotCount;
        let length: number = Math.round(util.MS_PER_DAY / msInterval);
        let msStartHour: number = startHour.getTime();
        let msEndHour: number = endHour.getTime();
        if (msStartHour !== msEndHour) {
            length = (Math.abs(msEndHour - msStartHour) / msInterval) - ((new Date(msEndHour).getTimezoneOffset()
                - new Date(msStartHour).getTimezoneOffset()) / (60 / this.parent.activeViewOptions.timeScale.slotCount));
        }
        if (!this.parent.activeViewOptions.timeScale.enable) {
            length = 1;
        }
        let start: Date = this.parent.getStartEndTime(this.parent.workHours.start);
        let end: Date = this.parent.getStartEndTime(this.parent.workHours.end);
        for (let i: number = 0; i < length; i++) {
            let dt: Date = new Date(msStartHour + (msInterval * i));
            if (util.isDaylightSavingTime(dt) || new Date(msStartHour).getTimezoneOffset() !== dt.getTimezoneOffset()) {
                let timeOffset: number = new Date(msStartHour).getTimezoneOffset() - dt.getTimezoneOffset();
                dt = new Date(dt.getTime() - (1000 * 60 * timeOffset));
            }
            let majorTickDivider: number = i % (msMajorInterval / msInterval);
            let row: TimeSlotData = {
                date: new Date('' + dt),
                startHour: start,
                endHour: end,
                first: (majorTickDivider === 0),
                middle: (majorTickDivider < this.parent.activeViewOptions.timeScale.slotCount - 1),
                last: (majorTickDivider === this.parent.activeViewOptions.timeScale.slotCount - 1),
                type: ''
            };
            if (handler) {
                handler(row);
            }
            rows.push(row);
        }
        return rows;
    }
    /**
     * Get module name.
     */
    protected getModuleName(): string {
        return 'verticalView';
    }
    /**
     * To destroy the vertical view.
     * @return {void}
     * @private
     */
    public destroy(): void {
        if (this.parent.isDestroyed) { return; }
        this.clearCurrentTimeIndicatorTimer();
        if (this.element) {
            let contentScrollableEle: Element = this.getContentAreaElement();
            if (contentScrollableEle) {
                EventHandler.remove(contentScrollableEle, 'scroll', this.onContentScroll);
            }
            if (this.parent.resourceBase) {
                this.parent.resourceBase.destroy();
            }
            remove(this.element);
            this.element = null;
            if (this.parent.scheduleTouchModule) {
                this.parent.scheduleTouchModule.resetValues();
            }
        }
    }
}
