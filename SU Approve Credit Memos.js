/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @author Aaditya Dhyani
 */
define(['N/ui/serverWidget', 'N/search', 'N/runtime', 'N/record', 'N/task'], function (serverWidget, search, runtime, record, task) {

    function onRequest(context) {
        try {
            var cmArr = [];

            /******************************************************** GET DATA ***********************************************/

            var creditmemoSearchObj = search.create({
                type: "creditmemo",
                filters:
                    [
                        ["type", "anyof", "CustCred"],
                        "AND",
                        ["workflow.currentstate", "anyof", "239"],
                        "AND",
                        ["mainline", "is", "T"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "internalid" }),
                        search.createColumn({ name: "subsidiarynohierarchy", label: "Subsidiary (no hierarchy)" }),
                        search.createColumn({
                            name: "currentstate",
                            join: "workflow",
                            label: "Current State"
                        }),
                        search.createColumn({ name: "trandate", label: "Date" }),
                        search.createColumn({ name: "tranid", label: "Document Number" }),
                        search.createColumn({ name: "entity", label: "Name" }),
                        search.createColumn({ name: "createdby", label: "Created By" }),
                        search.createColumn({ name: "custbody_credit_next_approver", label: "Credit Next Approver" }),
                        search.createColumn({ name: "statusref", label: "Status" }),
                        search.createColumn({ name: "memo", label: "Memo" }),
                        search.createColumn({ name: "amount", label: "Amount" }),
                        search.createColumn({ name: "fxamount", label: "Amount (Foreign Currency)" })
                    ]
            });
            var searchResultCount = creditmemoSearchObj.runPaged().count;
            log.debug("creditmemoSearchObj result count", searchResultCount);
            creditmemoSearchObj.run().each(function (result) {
                var itemJson = {};
                itemJson['internalid'] = result.getValue({ name: "internalid", label: "internalid" });
                itemJson['subsidiary'] = result.getText({ name: "subsidiarynohierarchy", label: "Subsidiary (no hierarchy)" });
                itemJson['currentstate'] = result.getText({ name: "currentstate", join: "workflow", label: "Current State" });
                itemJson['date'] = result.getValue({ name: "trandate", label: "Date" });
                itemJson['docno'] = result.getValue({ name: "tranid", label: "Document Number" });
                itemJson['name'] = result.getValue({ name: "entity", label: "Name" });
                itemJson['createdby'] = result.getValue({ name: "createdby", label: "Created By" });
                itemJson['nextapprover'] = result.getValue({ name: "custbody_credit_next_approver", label: "Credit Next Approver" });
                itemJson['status'] = result.getValue({ name: "statusref", label: "Status" });
                itemJson['memo'] = result.getValue({ name: "memo", label: "Memo" });
                itemJson['amount'] = Math.abs(result.getValue({ name: "amount", label: "Amount" }));
                itemJson['fxamount'] = Math.abs(result.getValue({ name: "fxamount", label: "Amount (Foreign Currency)" }));
                cmArr.push(itemJson)
                // .run().each has a limit of 4,000 results
                return true;
            });
            /******************************************************** CREATE SUITELET ***********************************************/
            if (context.request.method == "GET") {
                if (cmArr.length > 0) {

                    var approveparam = context.request.parameters.approve;
                    var approveArr = context.request.parameters.apArr;
                    var rejectparam = context.request.parameters.reject;
                    var rejectArr = context.request.parameters.rjArr;

                    if (approveparam == 'T') {

                        var apform = serverWidget.createForm({
                            title: 'Credit Memos have been Approved'
                        });
                        approveArr = approveArr.split(',');
                        for (var ap in approveArr) {
                            log.debug("ap", approveArr[ap]);

                            record.submitFields({
                                type: record.Type.CREDIT_MEMO,
                                id: approveArr[ap],
                                values: {
                                    custbody_credit_approval_status: '2'
                                },
                                options: {
                                    enableSourcing: false,
                                    ignoreMandatoryFields : true
                                }
                            });
                        }
                        context.response.writePage(apform);
                    }
                    else if (rejectparam == 'T') {
                        var rjform = serverWidget.createForm({
                            title: 'Credit Memos have been Rejected'
                        });
                        rejectArr = rejectArr.split(',');
                        for (var rj in rejectArr) {
                            log.debug("rj", rejectArr[rj]);

                            record.submitFields({
                                type: record.Type.CREDIT_MEMO,
                                id: rejectArr[rj],
                                values: {
                                    custbody_credit_approval_status: '3'
                                },
                                options: {
                                    enableSourcing: false,
                                    ignoreMandatoryFields : true
                                }
                            });
                        }
                        context.response.writePage(rjform);
                    }
                    else {
                        var form = serverWidget.createForm({
                            title: 'Credit Memo Approval'
                        });
                        var approvebutton = form.addButton({
                            id: 'creditmemo_apbutton',
                            label: "Approve",
                            functionName: 'approvebutton()'
                        });
                        var rejectbutton = form.addButton({
                            id: 'creditmemo_rjbutton',
                            label: "Reject",
                            functionName: 'rejectbutton()'
                        });
                        //form.clientScriptFileId = 2192382//SANDBOX1
                        form.clientScriptFileId = 2287014;//PROD

                        var cmsublist = form.addSublist({
                            id: 'custpage_table',
                            type: serverWidget.SublistType.LIST,
                            label: "Credit Memo"
                        });
                        cmsublist.addMarkAllButtons();

                        cmsublist.addField({ id: 'custpage_checkcm', label: 'Approve', type: serverWidget.FieldType.CHECKBOX });
                        cmsublist.addField({ id: 'custpage_internalid', label: 'internalId', type: serverWidget.FieldType.TEXT });
                        cmsublist.addField({ id: 'custpage_subsidiary', label: 'Subsidiary', type: serverWidget.FieldType.TEXT });
                        cmsublist.addField({ id: 'custpage_currentstate', label: 'Current State', type: serverWidget.FieldType.TEXT });
                        cmsublist.addField({ id: 'custpage_date', label: 'Date', type: serverWidget.FieldType.TEXT });
                        cmsublist.addField({ id: 'custpage_docno', label: 'Document Number', type: serverWidget.FieldType.TEXT });
                        cmsublist.addField({ id: 'custpage_name', label: 'Name', type: serverWidget.FieldType.TEXT });
                        cmsublist.addField({ id: 'custpage_createdby', label: 'Created By', type: serverWidget.FieldType.TEXT });
                        cmsublist.addField({ id: 'custpage_nextapprover', label: 'Credit Next Approver', type: serverWidget.FieldType.TEXT });
                        cmsublist.addField({ id: 'custpage_status', label: 'Status', type: serverWidget.FieldType.TEXT });
                        cmsublist.addField({ id: 'custpage_memo', label: 'Memo', type: serverWidget.FieldType.TEXTAREA });
                        cmsublist.addField({ id: 'custpage_amount', label: 'Amount', type: serverWidget.FieldType.TEXT });
                        cmsublist.addField({ id: 'custpage_fxamount', label: 'Amount(Foreign Currency)', type: serverWidget.FieldType.TEXT });

                        for (var i = 0; i < cmArr.length; i++) {

                            if (cmArr[i]['internalid']) {
                                cmsublist.setSublistValue({ id: 'custpage_internalid', value: cmArr[i]['internalid'], line: i });
                            }
                            if (cmArr[i]['subsidiary']) {
                                cmsublist.setSublistValue({ id: 'custpage_subsidiary', value: cmArr[i]['subsidiary'], line: i });
                            }
                            if (cmArr[i]['currentstate']) {
                                cmsublist.setSublistValue({ id: 'custpage_currentstate', value: cmArr[i]['currentstate'], line: i });
                            }
                            if (cmArr[i]['date']) {
                                cmsublist.setSublistValue({ id: 'custpage_date', value: cmArr[i]['date'], line: i });
                            }
                            if (cmArr[i]['docno']) {
                                var docnno = '<a class=\"dottedlink\" target=\"_blank\" href=\"/app/accounting/transactions/transaction.nl?id=' + cmArr[i]['internalid'] + '\">' + cmArr[i]['docno'] + '</a>';
                                cmsublist.setSublistValue({ id: 'custpage_docno', value: docnno, line: i });
                            }
                            if (cmArr[i]['name']) {
                                cmsublist.setSublistValue({ id: 'custpage_name', value: cmArr[i]['name'], line: i });
                            }
                            if (cmArr[i]['createdby']) {
                                cmsublist.setSublistValue({ id: 'custpage_createdby', value: cmArr[i]['createdby'], line: i });
                            }
                            if (cmArr[i]['nextapprover']) {
                                cmsublist.setSublistValue({ id: 'custpage_nextapprover', value: cmArr[i]['nextapprover'], line: i });
                            }
                            if (cmArr[i]['status']) {
                                cmsublist.setSublistValue({ id: 'custpage_status', value: cmArr[i]['status'], line: i });
                            }
                            if (cmArr[i]['memo']) {
                                cmsublist.setSublistValue({ id: 'custpage_memo', value: cmArr[i]['memo'], line: i });
                            }
                            if (cmArr[i]['amount']) {
                                cmsublist.setSublistValue({ id: 'custpage_amount', value: cmArr[i]['amount'], line: i });
                            }
                            if (cmArr[i]['fxamount']) {
                                cmsublist.setSublistValue({ id: 'custpage_fxamount', value: cmArr[i]['fxamount'], line: i });
                            }
                        }
                        context.response.writePage(form);
                    }
                }
                else {
                    var noform = serverWidget.createForm({
                        title: 'No Credit Memos to be approved'
                    });
                    context.response.writePage(noform);
                }
            }
        }
        catch (e) {
            log.error("Error in Suitelet", e)
        }
    }
    return {
        onRequest: onRequest
    }
});