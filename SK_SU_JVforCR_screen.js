/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 *@author Sagar Kumar
 */
define(['N/ui/serverWidget', 'N/search', 'N/task', 'N/runtime'], function (serverWidget, search, task, runtime) {

    function getTransactions(fromDate, toDate) {
        const baseUrl = runtime.getCurrentScript().getParameter("custscript_base_url");
        const dataList = [];
        var searchObj = search.create({
            type: "fxreval",
            filters:
                [
                    ["type", "anyof", "FxReval"],
                    "AND",
                    ["createdfrom.type", "anyof", "Journal"],
                    "AND",
                    ["createdfrom.trandate", "within", fromDate, toDate]
                ],
            columns:
                [
                    search.createColumn({ name: "trandate", label: "Date" }),
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({ name: "tranid", label: "CR Document number" }),
                    search.createColumn({ name: "subsidiarynohierarchy", label: "Subsidiary" }),
                    search.createColumn({ name: "memo", label: "Memo" }),
                    search.createColumn({ name: "total", label: "Amount (Transaction Total)" }),
                    search.createColumn({ name: "tranid", join: "createdFrom", label: "JV Document number" })
                ]
        });
        var searchResultCount = searchObj.runPaged().count;
        log.debug("searchObj result count", searchResultCount);
        searchObj.run().each(function (result) {
            // .run().each has a limit of 4,000 results

            let value = result.getValue({ name: "tranid", join: "createdFrom" });
            // let text = result.getText({ name: "tranid", join: "createdFrom" });

            // let journalUrl = '<a href ="'+baseUrl + '/app/accounting/transactions/transaction.nl?id=' + value + '">' + text + '</a>';

            dataList.push({ date: result.getValue("trandate"), internalid: result.getValue("internalid"), tranid: result.getValue("tranid"), subsidiary: result.getText("subsidiarynohierarchy"), memo: result.getValue("memo"), amount: Math.abs(result.getValue("total")), journalid: value });

            return true;
        });

        return dataList;
    }

    function onRequest(context) {
        var monthsList = [{ name: "January", code: 0 }, { name: "February", code: 1 }, { name: "March", code: 2 }, { name: "April", code: 3 }, { name: "May", code: 4 }, { name: "June", code: 5 }, { name: "July", code: 6 }, { name: "August", code: 7 }, { name: "September", code: 8 }, { name: "October", code: 9 }, { name: "November", code: 10 }, { name: "December", code: 11 }];
        try {
            var method = context.request.method;
            var viewtrans = context.request.parameters.viewtrans || 'F';

            log.debug("method " + method);


            var form = serverWidget.createForm({
                title: 'Currency Revolution Journal Entry'
            });

            var filtergroup_account = form.addFieldGroup({
                id: 'custpage_filtergroup_date',
                label: 'FILTERS'
            });

            var monthField = form.addField({
                id: 'custpage_month',
                type: serverWidget.FieldType.SELECT,
                container: 'custpage_filtergroup_date',
                label: 'Month',
                source: 'accountingperiod',
            });

            // monthField.addSelectOption({
            //     value: '',
            //     text: ''
            // });

            // monthsList.forEach(month => {
            //     monthField.addSelectOption({
            //         value: month.code,
            //         text: month.name,
            //     });
            // });

            var submit_Button = form.addButton({
                id: 'custpage_submitform',
                label: 'View Transactions',
                functionName: "ReassignButton('')"
            });

            form.clientScriptModulePath = 'SuiteScripts/SK_CS_JVforCR_screen.js';

            if (viewtrans == 'T') {
                log.debug("viewtrans", viewtrans);

                var fromdatevalue = context.request.parameters.fromdate;
                var todatevalue = context.request.parameters.todate;

                monthsList.defaultValue = context.request.parameters.month;

                log.debug("fromdatevalue : " + fromdatevalue + " todatevalue: " + todatevalue);

                if (fromdatevalue && todatevalue) {
                    let result = getTransactions(fromdatevalue, todatevalue);

                    log.debug("data result is", result);

                    if (result.length > 0) {
                        var recordSublist = form.addSublist({
                            id: 'custpage_record',
                            type: serverWidget.SublistType.LIST,
                            label: "Records"
                        });

                        recordSublist.addMarkAllButtons();

                        recordSublist.addField({ id: 'custpage_inv_selectchkbox', label: 'Select', type: serverWidget.FieldType.CHECKBOX });
                        recordSublist.addField({ id: 'custpage_internalid', label: 'InternalId', type: serverWidget.FieldType.TEXT });
                        recordSublist.addField({ id: 'custpage_date', label: 'Date', type: serverWidget.FieldType.TEXT });
                        recordSublist.addField({ id: 'custpage_tranid', label: 'Document Number', type: serverWidget.FieldType.TEXT });
                        recordSublist.addField({ id: 'custpage_memo', label: 'Memo', type: serverWidget.FieldType.TEXT });
                        recordSublist.addField({ id: 'custpage_amount', label: 'Amount', type: serverWidget.FieldType.TEXT });
                        recordSublist.addField({ id: 'custpage_subsidiary', label: 'Subsidiary', type: serverWidget.FieldType.TEXT });
                        recordSublist.addField({ id: 'custpage_journalid', label: 'Journal', type: serverWidget.FieldType.TEXT });

                        for (let index = 0; index < result.length; index++) {
                            const obj = result[index];

                            for (const key in obj) {
                                if (obj.hasOwnProperty.call(obj, key)) {
                                    if (obj[key]) {
                                        recordSublist.setSublistValue({
                                            id: "custpage_" + key,
                                            line: index,
                                            value: obj[key]
                                        });
                                    }
                                }
                            }
                        }

                        form.addSubmitButton({
                            label: "Delete"
                        });
                    }

                }
            }

            if (method == 'POST') {
                var params = context.request.parameters;
                const recordList = [];

                var totalLines = context.request.getLineCount({
                    group: 'custpage_record'
                });

                for (let index = 0; index < totalLines; index++) {
                    let recordId = context.request.getSublistValue({ group: 'custpage_record', name: 'custpage_internalid', line: index });

                    recordList.push(recordId);
                }

                log.debug("Record list ", recordList);

                var mapReduce = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: 'customscript_3pl_del_curr_rev_rec',
                    deploymentId: 'customdeploy_3pl_del_curr_rev_rec',
                    params: { custscript_3pl_del_rec_list: recordList }
                });
                var mrTaskId = mapReduce.submit();
                
                log.debug("mrTaskId", mrTaskId);
            }
            context.response.writePage(form);
        } catch (error) {
            log.debug("error during execution: ", error);
        }

    }

    return {
        onRequest: onRequest
    }
});
