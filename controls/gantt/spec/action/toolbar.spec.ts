/**
 * Gantt toolbar spec
 */
import { Gantt, Edit, Toolbar, Selection, Filter } from '../../src/index';
import { projectData1 } from '../base/data-source.spec';
import { createGantt, destroyGantt, triggerMouseEvent, getKeyUpObj } from '../base/gantt-util.spec';
import { getValue } from '@syncfusion/ej2-base';
describe('Gantt toolbar support', () => {
    describe('Gantt toolbar action', () => {
        Gantt.Inject(Edit, Toolbar, Selection, Filter);
        let ganttObj: Gantt;
        beforeAll((done: Function) => {
            ganttObj = createGantt(
                {
                    dataSource: projectData1,
                    allowSelection: true,
                    allowFiltering: true,
                    taskFields: {
                        id: 'TaskID',
                        name: 'TaskName',
                        startDate: 'StartDate',
                        endDate: 'EndDate',
                        duration: 'Duration',
                        progress: 'Progress',
                        child: 'subtasks',
                        dependency: 'Predecessor'
                    },
                    editSettings: {
                        allowAdding: true,
                        allowEditing: true,
                        allowDeleting: true,
                        allowTaskbarEditing: true,
                        showDeleteConfirmDialog: true
                    },
                    toolbar: ['ZoomIn','ZoomOut','ZoomToFit','Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search',
                        'PrevTimeSpan', 'NextTimeSpan', 'Custom', { text: 'Quick Filter', tooltipText: 'Quick Filter', id: 'toolbarfilter' },],
                    projectStartDate: new Date('02/01/2017'),
                    projectEndDate: new Date('12/30/2017'),
                    rowHeight: 40,
                    taskbarHeight: 30
                }, done);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });

        //it('Check all toolbar rendered properly', () => {
            //let toolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_Gantt_Toolbar') as HTMLElement;
            //expect(toolbar.getElementsByClassName('e-toolbar-item').length).toBe(12);
        //});

        //it('Add handler function', () => {
            //let add: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_add') as HTMLElement;
            //triggerMouseEvent(add, 'click');
            //let startDate: HTMLInputElement = (<HTMLInputElement>ganttObj.element.querySelector('#' + ganttObj.element.id + 'StartDate'));
            //if (startDate) {
                //let StartDateInput: any = (document.getElementById(ganttObj.element.id + 'StartDate') as any).ej2_instances[0];
                //StartDateInput.value = new Date('02/06/2017');
            //}
            //let save: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_dialog').getElementsByClassName('e-primary')[0] as HTMLElement;
            //triggerMouseEvent(save, 'click');
            //expect(ganttObj.flatData.length).toBe(42);
        //});

        //it('Delete handler function', () => {
            //ganttObj.selectionModule.selectRow(2);
            //let deleteToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_delete') as HTMLElement;
            //triggerMouseEvent(deleteToolbar, 'click');
            //let okElement: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_deleteConfirmDialog').getElementsByClassName('e-primary')[0] as HTMLElement;
            //triggerMouseEvent(okElement, 'click');
            //expect(ganttObj.flatData.length).toBe(41);
            //ganttObj.selectionModule.clearSelection();
        //});

        //it('Previous Timespan handler function', () => {
            //let previoustimespanToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_prevtimespan') as HTMLElement;
            //triggerMouseEvent(previoustimespanToolbar, 'click');
            //expect(ganttObj.getFormatedDate(ganttObj.timelineModule.timelineStartDate, 'MM/dd/yyyy')).toBe('01/29/2017');
        //});

        //it('Next Timespan handler function', () => {
            //let nexttimespanToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_nexttimespan') as HTMLElement;
            //triggerMouseEvent(nexttimespanToolbar, 'click');
            //expect(ganttObj.getFormatedDate(ganttObj.timelineModule.timelineEndDate, 'MM/dd/yyyy')).toBe('12/31/2017');
        //});

        //it('Update handler function', () => {
            //let taskName: HTMLElement = ganttObj.element.querySelector('#treeGrid' + ganttObj.element.id + '_gridcontrol_content_table > tbody > tr:nth-child(5) > td:nth-child(2)') as HTMLElement;
            //triggerMouseEvent(taskName, 'dblclick');
            //let taskValue: HTMLInputElement = (<HTMLInputElement>ganttObj.element.querySelector('#treeGrid' + ganttObj.element.id + '_gridcontrolTaskName'));
            //taskValue.value = 'Update TaskName';
            //let updateToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_update') as HTMLElement;
            //triggerMouseEvent(updateToolbar, 'click');
            //expect(getValue('TaskName', ganttObj.flatData[4])).toBe('Update TaskName');
            //ganttObj.selectionModule.clearSelection();
        //});

        //it('Edit handler function', () => {
            //ganttObj.selectionModule.selectRow(2);
            //expect(ganttObj.selectionModule.getSelectedRecords().length).toBe(1);
            //let editToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_edit') as HTMLElement;
            //triggerMouseEvent(editToolbar, 'click');
            //let progress: HTMLInputElement = (<HTMLInputElement>ganttObj.element.querySelector('#' + ganttObj.element.id + 'Progress'));
            //if (progress) {
                //let progressInput: any = (document.getElementById(ganttObj.element.id + 'Progress') as any).ej2_instances[0];
                //progressInput.value = 80;
                //let save: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_dialog').getElementsByClassName('e-primary')[0] as HTMLElement;
                //triggerMouseEvent(save, 'click');
                //expect(getValue('Progress', ganttObj.flatData[2])).toBe(80);
            //}
            //ganttObj.selectionModule.clearSelection();
        //});

        //it('CollapseAll handler function', () => {
            //let collapseallToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_collapseall') as HTMLElement;
            //triggerMouseEvent(collapseallToolbar, 'click');
            //expect(ganttObj.flatData[1].expanded).toBe(false);
            //ganttObj.selectionModule.clearSelection();
        //});

        //it('ExpandAll handler function', () => {
            //let expandallToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_expandall') as HTMLElement;
            //triggerMouseEvent(expandallToolbar, 'click');
            //expect(ganttObj.flatData[1].expanded).toBe(true);
            //ganttObj.selectionModule.clearSelection();
        //});

        //it('Enable toolbar on row selection', () => {
            //ganttObj.selectionModule.selectRow(4);
            //expect(ganttObj.element.querySelector('#' + ganttObj.element.id + '_Gantt_Toolbar').getElementsByClassName('e-hidden').length).toBe(2);
            //ganttObj.selectionModule.clearSelection();
        //});

        //it('Disable toolbar on row deselection', () => {
            //ganttObj.selectionModule.clearSelection();
            //expect(ganttObj.element.querySelector('#' + ganttObj.element.id + '_Gantt_Toolbar').getElementsByClassName('e-hidden').length).toBe(4);
        //});

        //it('On celledit handler function', () => {
            //let taskName: HTMLElement = ganttObj.element.querySelector('#treeGrid' + ganttObj.element.id + '_gridcontrol_content_table > tbody > tr:nth-child(3) > td:nth-child(2)') as HTMLElement;
            //triggerMouseEvent(taskName, 'dblclick');
            //expect(ganttObj.element.querySelector('#' + ganttObj.element.id + '_Gantt_Toolbar').getElementsByClassName('e-hidden').length).toBe(3);
            //ganttObj.selectionModule.clearSelection();
        //});

        //it('On celleditsaved handler function', () => {
            //let taskName: HTMLElement = ganttObj.element.querySelector('#treeGrid' + ganttObj.element.id + '_gridcontrol_content_table > tbody > tr:nth-child(3) > td:nth-child(2)') as HTMLElement;
            //triggerMouseEvent(taskName, 'dblclick');
            //let taskValue: HTMLInputElement = (<HTMLInputElement>ganttObj.element.querySelector('#treeGrid' + ganttObj.element.id + '_gridcontrolTaskName'));
            //taskValue.value = 'Update TaskName';
            //let updateToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_update') as HTMLElement;
            //triggerMouseEvent(updateToolbar, 'click');
            //expect(ganttObj.element.querySelector('#' + ganttObj.element.id + '_Gantt_Toolbar').getElementsByClassName('e-hidden').length).toBe(4);
            //ganttObj.selectionModule.clearSelection();
        //});

        //it('Cancel handler function', () => {
            //let taskName: HTMLElement = ganttObj.element.querySelector('#treeGrid' + ganttObj.element.id + '_gridcontrol_content_table > tbody > tr:nth-child(4) > td:nth-child(2)') as HTMLElement;
            //triggerMouseEvent(taskName, 'dblclick');
            //let taskValue: HTMLInputElement = (<HTMLInputElement>ganttObj.element.querySelector('#treeGrid' + ganttObj.element.id + '_gridcontrolTaskName'));
            //if (taskValue) {
                //taskValue.value = 'Cancel TaskName';
                //let cancelToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_cancel') as HTMLElement;
                //triggerMouseEvent(cancelToolbar, 'mousedown');
                //expect(getValue('TaskName', ganttObj.flatData[3])).toBe('Plan budget');
                //ganttObj.selectionModule.clearSelection();
            //}
        //});

        //it('Search Icon handler function', () => {
            //let searchbar: HTMLInputElement = (<HTMLInputElement>ganttObj.element.querySelector('#' + ganttObj.element.id + '_searchbar'));
            //searchbar.value = '';
            //let searchIcon: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_searchbutton') as HTMLElement;
            //triggerMouseEvent(searchIcon, 'click');
            //expect(ganttObj.currentViewData.length).toBe(41);
            //ganttObj.clearFiltering();
        //});

        //it('Search Enter handler function', () => {
            //let searchbar: HTMLInputElement = (<HTMLInputElement>ganttObj.element.querySelector('#' + ganttObj.element.id + '_searchbar'));
            //searchbar.value = 'hai';
            //(<HTMLInputElement>ganttObj.element.querySelector('#' + ganttObj.element.id + '_searchbar')).focus();
            //(ganttObj.toolbarModule as any).keyUpHandler(getKeyUpObj(13, searchbar));
            //expect(ganttObj.searchSettings.key).toBe('hai');
        //});

        //it('Enable toolbar using public method', () => {
            //ganttObj.toolbarModule.enableItems(['toolbarfilter'], false);
            //expect(ganttObj.element.getElementsByClassName('e-toolbar-item e-overlay')[0].textContent).toBe('Quick Filter');
        //});

        //it('Cancel toolbar', (done: Function) => {
            //let cancelToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_cancel') as HTMLElement;
            //triggerMouseEvent(cancelToolbar, 'click');
            //ganttObj.dataBound = () => {
                //done();
            //}
            //ganttObj.refresh();
        //});

        //it('SearchKey and SearchValue', (done: Function) => {
            //ganttObj.searchSettings.key = '';
            //let searchbar: HTMLInputElement = (<HTMLInputElement>ganttObj.element.querySelector('#' + ganttObj.element.id + '_searchbar'));
            //searchbar.value = 'check';
            //let searchButton: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_searchbutton') as HTMLElement;
            //triggerMouseEvent(searchButton, 'click');
            //ganttObj.dataBound = () => {
                //expect(ganttObj.searchSettings.key).toBe('check');
                //done();
            //}
            //ganttObj.refresh();
        //});

        //it('Selection Mode Cell', (done: Function) => {
            //ganttObj.selectionSettings.mode = 'Cell';
            //ganttObj.selectionModule.selectCell({ cellIndex: 1, rowIndex: 1 });
            //ganttObj.dataBound = () => {
                //let deleteToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_delete') as HTMLElement;
                //triggerMouseEvent(deleteToolbar, 'click');
                //let okElement: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_deleteConfirmDialog').getElementsByClassName('e-primary')[0] as HTMLElement;
                //triggerMouseEvent(okElement, 'click');
                //done();
            //}
            //ganttObj.refresh();
        //});

        //it('Disable adding ', (done: Function) => {
            //ganttObj.editSettings.allowAdding = false;
            //ganttObj.dataBound = () => {
                //expect(ganttObj.editSettings.allowAdding).toBe(false);
                //done();
            //}
            //ganttObj.refresh();
        //});

        //it('Disable SelectionModule ', (done: Function) => {
            //ganttObj.allowSelection = false;
            //ganttObj.dataBind();
            //expect(ganttObj.allowSelection).toBe(false);
            //done();
        //});

        //it('Disable EditModule ', (done: Function) => {
            //ganttObj.editSettings.allowEditing = false;
            //ganttObj.editSettings.allowAdding = false;
            //ganttObj.editSettings.allowDeleting = false;
            //ganttObj.editSettings.allowTaskbarEditing = false;
            //ganttObj.dataBind();
            //expect(ganttObj.editSettings.allowAdding).toBe(false);
            //expect(ganttObj.editSettings.allowEditing).toBe(false);
            //expect(ganttObj.editSettings.allowDeleting).toBe(false);
            //expect(ganttObj.editSettings.allowTaskbarEditing).toBe(false);
            //done();
        //});

        //it('Toolbar null value check', (done: Function) => {
            //ganttObj.toolbar = null;
            //ganttObj.dataBound = () => {
                //expect(ganttObj.toolbar).toBe(null);
                //done();
            //}
            //ganttObj.refresh();
        //});

        //it('Toolbar Object', (done: Function) => {
            //ganttObj.toolbar = [{ text: 'Add', tooltipText: 'Add task' }];
            //ganttObj.dataBound = () => {
                //expect(ganttObj.toolbar.length).toBe(1);
                //done();
            //}
            //ganttObj.refresh();
        //});

        //it('Destroy method', () => {
            //ganttObj.toolbarModule.destroy();
        //});
    //});
  
        it('Check Zoom Out action', () => {
            let zoomOut: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_zoomout') as HTMLElement;
            triggerMouseEvent(zoomOut, 'click');
            expect(ganttObj.timelineModule.customTimelineSettings.timelineUnitSize).toBe(99);
            expect(ganttObj.currentZoomingLevel.level).toBe(10);

        });

        it('Check Zoom In action', () => {
            let zoomIn: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_zoomin') as HTMLElement;
            triggerMouseEvent(zoomIn, 'click');
            expect(ganttObj.timelineModule.customTimelineSettings.timelineUnitSize).toBe(33);
            expect(ganttObj.timelineModule.customTimelineSettings.bottomTier.unit).toBe('Day');
            expect(ganttObj.currentZoomingLevel.level).toBe(11);
            ganttObj.fitToProject();

        });
    });
});
