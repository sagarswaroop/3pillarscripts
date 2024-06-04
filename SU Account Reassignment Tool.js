/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @author Aaditya Dhyani
 */

define(['N/ui/serverWidget', 'N/search', 'N/task', 'N/runtime'], function (serverWidget, search, task, runtime) {

    function onRequest(context) {
        try {
            var script = runtime.getCurrentScript();
            var method = context.request.method;
            var viewtrans = context.request.parameters.viewtrans;
            log.debug("viewtrans", viewtrans);

            var form = serverWidget.createForm({
                title: 'GL Account Reassignment Tool'
            });

            var filtergroup_account = form.addFieldGroup({
                id: 'custpage_filtergroup_account',
                label: 'ACCOUNT FILTERS'
            });

            var filtergroup_date = form.addFieldGroup({
                id: 'custpage_filtergroup_date',
                label: 'DATE FILTERS'
            });

            var from_Acc = form.addField({
                id: 'custpage_from_account',
                type: serverWidget.FieldType.SELECT,
                source: 'account',
                container: 'custpage_filtergroup_account',
                label: 'From Account'
            });

            var from_Dep = form.addField({
                id: 'custpage_from_department',
                type: serverWidget.FieldType.SELECT,
                source: 'department',
                container: 'custpage_filtergroup_account',
                label: 'From Department'
            });

            /*var to_Acc = form.addField({
                id: 'custpage_to_account',
                type: serverWidget.FieldType.SELECT,
                source: 'account',
                container: 'custpage_filtergroup_account',
                label: 'To Account'
            });*/

            var from_Date = form.addField({
                id: 'custpage_from_date',
                type: serverWidget.FieldType.DATE,
                container: 'custpage_filtergroup_date',
                label: 'From Date'
            });

            var to_Date = form.addField({
                id: 'custpage_to_date',
                type: serverWidget.FieldType.DATE,
                container: 'custpage_filtergroup_date',
                label: 'To Date'
            });

            var submit_Button = form.addButton({
                id: 'custpage_submitform',
                label: 'View Transactions',
                functionName: "ReassignButton('')"
            });

            form.clientScriptFileId = '2576352';

            if (viewtrans == 'T') {

                var fromaccvalue = context.request.parameters.fromaccount;
                from_Acc.defaultValue = fromaccvalue;

                var fromDepValue = context.request.parameters.fromdepartment;
                from_Dep.defaultValue = fromDepValue;

                //var toaccvalue = context.request.parameters.toaccount;
                //to_Acc.defaultValue = toaccvalue;
                var fromdatevalue = context.request.parameters.fromdate;
                from_Date.defaultValue = fromdatevalue;
                var todatevalue = context.request.parameters.todate;
                to_Date.defaultValue = todatevalue;

                log.debug("from_Dep : ",fromDepValue);

                if (fromaccvalue && fromDepValue && fromdatevalue && todatevalue) {

                    var from_account_search_results = fromAccounttransactionsearch(fromaccvalue, fromdatevalue, todatevalue,fromDepValue);
                    log.debug("transactions", from_account_search_results);

                    var tranlength = from_account_search_results.length;

                    if (tranlength > 0) {

                        var select = form.addFieldGroup({
                            id: 'custpage_filtergroup_Select',
                            label: 'Select New Item/Account'
                        });

                        var newItem = form.addField({
                            id: 'custpage_new_item',
                            type: serverWidget.FieldType.SELECT,
                            source: 'Item',
                            container: 'custpage_filtergroup_Select',
                            label: 'New Item'
                        });

                        var newAccount = form.addField({
                            id: 'custpage_new_account',
                            type: serverWidget.FieldType.SELECT,
                            source: 'account',
                            container: 'custpage_filtergroup_Select',
                            label: 'New Account'
                        });

                        var newItemDepartment = form.addField({
                            id: 'custpage_new_item_department',
                            type: serverWidget.FieldType.SELECT,
                            source: 'Department',
                            container: 'custpage_filtergroup_Select',
                            label: 'New Item Department'
                        });

                        var newAccDepartment = form.addField({
                            id: 'custpage_new_acc_department',
                            type: serverWidget.FieldType.SELECT,
                            source: 'Department',
                            container: 'custpage_filtergroup_Select',
                            label: 'New Account Department'
                        });

                        var reassign_button = form.addSubmitButton({
                            id: 'custpage_reassignbutton',
                            label: 'Reassign Account'
                        });

                        log.debug("script usage: ",script.getRemainingUsage());

                        var Invsublist = form.addSublist({
                            id: 'custpage_invtable',
                            type: serverWidget.SublistType.LIST,
                            label: "Invoice"
                        });
                        Invsublist.addMarkAllButtons();

                        var Billsublist = form.addSublist({
                            id: 'custpage_billtable',
                            type: serverWidget.SublistType.LIST,
                            label: "Bills"
                        });
                        Billsublist.addMarkAllButtons();

                        var Journalsublist = form.addSublist({
                            id: 'custpage_journaltable',
                            type: serverWidget.SublistType.LIST,
                            label: "Journals"
                        });
                        Journalsublist.addMarkAllButtons();

                        log.debug("script usage: ",script.getRemainingUsage());

                        Invsublist.addField({ id: 'custpage_inv_selectchkbox', label: 'Select', type: serverWidget.FieldType.CHECKBOX });
                        Invsublist.addField({ id: 'custpage_inv_internalid', label: 'InternalId', type: serverWidget.FieldType.TEXT });
                        Invsublist.addField({ id: 'custpage_inv_trandate', label: 'Date', type: serverWidget.FieldType.TEXT });
                        Invsublist.addField({ id: 'custpage_inv_docnum', label: 'Document Number', type: serverWidget.FieldType.TEXT });
                        Invsublist.addField({ id: 'custpage_inv_status', label: 'Status', type: serverWidget.FieldType.TEXT });
                        Invsublist.addField({ id: 'custpage_inv_linememo', label: 'Memo', type: serverWidget.FieldType.TEXT });
                        Invsublist.addField({ id: 'custpage_inv_amount', label: 'Amount', type: serverWidget.FieldType.TEXT });
                        Invsublist.addField({ id: 'custpage_inv_olddept', label: 'Current Department', type: serverWidget.FieldType.TEXT });
                        Invsublist.addField({ id: 'custpage_inv_newdept', label: 'New Department', type: serverWidget.FieldType.SELECT, source: 'Department' });
                        Invsublist.addField({ id: 'custpage_inv_olditem', label: 'Old Item', type: serverWidget.FieldType.TEXT });
                        Invsublist.addField({ id: 'custpage_inv_newitem', label: 'New Item', type: serverWidget.FieldType.SELECT, source: 'Item' });
                        var type = Invsublist.addField({ id: 'custpage_inv_type', label: 'Type', type: serverWidget.FieldType.TEXT });
                        type.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });
                        var line = Invsublist.addField({ id: 'custpage_inv_lineno', label: 'line No.', type: serverWidget.FieldType.TEXT });
                        line.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });
                        var loc = Invsublist.addField({ id: 'custpage_inv_lineloc', label: 'Location', type: serverWidget.FieldType.TEXT });
                        loc.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });
                        var txcode = Invsublist.addField({ id: 'custpage_inv_taxcode', label: 'Tax Code', type: serverWidget.FieldType.TEXT });
                        txcode.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });
                        var deptval = Invsublist.addField({ id: 'custpage_inv_olddeptval', label: 'Department Value', type: serverWidget.FieldType.TEXT });
                        deptval.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });
                        var InvitemVal = Invsublist.addField({ id: 'custpage_inv_olditemval', label: 'item', type: serverWidget.FieldType.TEXT });
                        InvitemVal.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });

                        // var invItemDesc = Invsublist.addField({ id: 'custpage_inv_description', label: 'description', type: serverWidget.FieldType.TEXT });
                        // invItemDesc.updateDisplayType({
                        //     displayType: serverWidget.FieldDisplayType.HIDDEN
                        // });

                        // var invItemjob = Invsublist.addField({ id: 'custpage_inv_job', label: 'Project', type: serverWidget.FieldType.TEXT });
                        // invItemjob.updateDisplayType({
                        //     displayType: serverWidget.FieldDisplayType.HIDDEN
                        // });

                        log.debug("script usage: ",script.getRemainingUsage());

                        Billsublist.addField({ id: 'custpage_bill_selectchkbox', label: 'Select', type: serverWidget.FieldType.CHECKBOX });
                        Billsublist.addField({ id: 'custpage_bill_internalid', label: 'InternalId', type: serverWidget.FieldType.TEXT });
                        Billsublist.addField({ id: 'custpage_bill_trandate', label: 'Date', type: serverWidget.FieldType.TEXT });
                        Billsublist.addField({ id: 'custpage_bill_docnum', label: 'Document Number', type: serverWidget.FieldType.TEXT });
                        Billsublist.addField({ id: 'custpage_bill_status', label: 'Status', type: serverWidget.FieldType.TEXT });
                        Billsublist.addField({ id: 'custpage_bill_linememo', label: 'Memo', type: serverWidget.FieldType.TEXT });
                        Billsublist.addField({ id: 'custpage_bill_amount', label: 'Amount', type: serverWidget.FieldType.TEXT });
                        Billsublist.addField({ id: 'custpage_bill_olddept', label: 'Current Department', type: serverWidget.FieldType.TEXT });
                        Billsublist.addField({ id: 'custpage_bill_newdept', label: 'New Department', type: serverWidget.FieldType.SELECT, source: 'Department' });
                        Billsublist.addField({ id: 'custpage_bill_olditem', label: 'Old Item', type: serverWidget.FieldType.TEXT });
                        Billsublist.addField({ id: 'custpage_bill_newitem', label: 'New Item', type: serverWidget.FieldType.SELECT, source: 'Item' });
                        Billsublist.addField({ id: 'custpage_bill_newacc', label: 'New Account', type: serverWidget.FieldType.SELECT, source: 'Account' });
                        var billtype = Billsublist.addField({ id: 'custpage_bill_type', label: 'Type', type: serverWidget.FieldType.TEXT });
                        billtype.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });
                        var billino = Billsublist.addField({ id: 'custpage_bill_lineno', label: 'line No.', type: serverWidget.FieldType.TEXT });
                        billino.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });
                        var billlineloc = Billsublist.addField({ id: 'custpage_bill_lineloc', label: 'Line location', type: serverWidget.FieldType.TEXT });
                        billlineloc.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });
                        var billdeptval = Billsublist.addField({ id: 'custpage_bill_olddeptval', label: 'old department', type: serverWidget.FieldType.TEXT });
                        billdeptval.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });

                        var billitemVal = Billsublist.addField({ id: 'custpage_bill_olditemval', label: 'item', type: serverWidget.FieldType.TEXT });
                        billitemVal.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });

                        var billTaxCode = Billsublist.addField({ id: 'custpage_bill_taxcode', label: 'tax code', type: serverWidget.FieldType.TEXT });
                        billTaxCode.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });

                        // var billLineDesc = Billsublist.addField({ id: 'custpage_bill_description', label: 'description', type: serverWidget.FieldType.TEXT });
                        // billLineDesc.updateDisplayType({
                        //     displayType: serverWidget.FieldDisplayType.HIDDEN
                        // });

                        Journalsublist.addField({ id: 'custpage_journal_selectchkbox', label: 'Select', type: serverWidget.FieldType.CHECKBOX });
                        Journalsublist.addField({ id: 'custpage_journal_internalid', label: 'InternalId', type: serverWidget.FieldType.TEXT });
                        Journalsublist.addField({ id: 'custpage_journal_trandate', label: 'Date', type: serverWidget.FieldType.TEXT });
                        Journalsublist.addField({ id: 'custpage_journal_docnum', label: 'Document Number', type: serverWidget.FieldType.TEXT });
                        Journalsublist.addField({ id: 'custpage_journal_linememo', label: 'Memo', type: serverWidget.FieldType.TEXT });
                        Journalsublist.addField({ id: 'custpage_journal_status', label: 'Status', type: serverWidget.FieldType.TEXT });
                        Journalsublist.addField({ id: 'custpage_journal_olddept', label: 'Current Department', type: serverWidget.FieldType.TEXT });
                        Journalsublist.addField({ id: 'custpage_journal_newdept', label: 'New Department', type: serverWidget.FieldType.SELECT, source: 'Department' });
                        Journalsublist.addField({ id: 'custpage_journal_newacc', label: 'New Account', type: serverWidget.FieldType.SELECT, source: 'Account' });
                        Journalsublist.addField({ id: 'custpage_journal_type', label: 'Type', type: serverWidget.FieldType.TEXT });
                        Journalsublist.addField({ id: 'custpage_journal_lineno', label: 'line No.', type: serverWidget.FieldType.TEXT });
                        Journalsublist.addField({ id: 'custpage_journal_amount', label: 'Amount', type: serverWidget.FieldType.TEXT });
                        var jrnloldDept = Journalsublist.addField({ id: 'custpage_journal_olddeptval', label: 'Old Department Value', type: serverWidget.FieldType.TEXT });
                        jrnloldDept.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });

                        var jrnTaxCode = Journalsublist.addField({ id: 'custpage_journal_taxcode', label: 'taxcode', type: serverWidget.FieldType.TEXT });
                        jrnTaxCode.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });

                        var jrnLineLocation = Billsublist.addField({ id: 'custpage_journal_lineloc', label: 'Line location', type: serverWidget.FieldType.TEXT });
                        jrnLineLocation.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });

                        var jlineval = 0;
                        var ilineval = 0;
                        var blineval = 0;

                        log.debug("script usage: ",script.getRemainingUsage());

                        for (var tran = 0; tran < tranlength; tran++) {
                            

                            if (from_account_search_results[tran]['type'] == "Journal") {

                                if (from_account_search_results[tran]['internalId']) {
                                    Journalsublist.setSublistValue({ id: 'custpage_journal_internalid', value: from_account_search_results[tran]['internalId'], line: jlineval });
                                }
                                if (from_account_search_results[tran]['tranDate']) {
                                    Journalsublist.setSublistValue({ id: 'custpage_journal_trandate', value: from_account_search_results[tran]['tranDate'], line: jlineval });
                                }
                                if (from_account_search_results[tran]['tranId']) {
                                    Journalsublist.setSublistValue({ id: 'custpage_journal_docnum', value: from_account_search_results[tran]['tranId'], line: jlineval });
                                }
                                if (from_account_search_results[tran]['status']) {
                                    Journalsublist.setSublistValue({ id: 'custpage_journal_status', value: from_account_search_results[tran]['status'], line: jlineval });
                                }
                                if (from_account_search_results[tran]['dept']) {
                                    Journalsublist.setSublistValue({ id: 'custpage_journal_olddept', value: from_account_search_results[tran]['dept'], line: jlineval });
                                }
                                if (from_account_search_results[tran]['type']) {
                                    Journalsublist.setSublistValue({ id: 'custpage_journal_type', value: from_account_search_results[tran]['type'], line: jlineval });
                                }
                                if (from_account_search_results[tran]['lineId']) {
                                    Journalsublist.setSublistValue({ id: 'custpage_journal_lineno', value: from_account_search_results[tran]['lineId'], line: jlineval });
                                }
                                if (from_account_search_results[tran]['Amount']) {
                                    Journalsublist.setSublistValue({ id: 'custpage_journal_amount', value: from_account_search_results[tran]['Amount'], line: jlineval });
                                }
                                if (from_account_search_results[tran]['oldDeptVal']) {
                                    Journalsublist.setSublistValue({ id: 'custpage_journal_olddeptval', value: from_account_search_results[tran]['oldDeptVal'], line: jlineval });
                                }
                                if (from_account_search_results[tran]['oldDeptVal']) {
                                    Journalsublist.setSublistValue({ id: 'custpage_journal_olddeptval', value: from_account_search_results[tran]['oldDeptVal'], line: jlineval });
                                }
                                if (from_account_search_results[tran]['taxcode']) {
                                    Journalsublist.setSublistValue({ id: 'custpage_journal_taxcode', value: from_account_search_results[tran]['taxcode'], line: jlineval });
                                }
                                if (from_account_search_results[tran]['lineMemo']) {
                                    Journalsublist.setSublistValue({ id: 'custpage_journal_linememo', value: from_account_search_results[tran]['lineMemo'], line: jlineval });
                                }
                                if (from_account_search_results[tran]['lineloc']) {
                                    Journalsublist.setSublistValue({ id: 'custpage_journal_lineloc', value: from_account_search_results[tran]['lineloc'], line: jlineval });
                                }

                                jlineval++;
                            }

                            if (from_account_search_results[tran]['type'] == "CustInvc") {

                                if (from_account_search_results[tran]['internalId']) {
                                    Invsublist.setSublistValue({ id: 'custpage_inv_internalid', value: from_account_search_results[tran]['internalId'], line: ilineval });
                                }
                                if (from_account_search_results[tran]['tranDate']) {
                                    Invsublist.setSublistValue({ id: 'custpage_inv_trandate', value: from_account_search_results[tran]['tranDate'], line: ilineval });
                                }
                                if (from_account_search_results[tran]['tranId']) {
                                    Invsublist.setSublistValue({ id: 'custpage_inv_docnum', value: from_account_search_results[tran]['tranId'], line: ilineval });
                                }
                                if (from_account_search_results[tran]['status']) {
                                    Invsublist.setSublistValue({ id: 'custpage_inv_status', value: from_account_search_results[tran]['status'], line: ilineval });
                                }
                                if (from_account_search_results[tran]['dept']) {
                                    Invsublist.setSublistValue({ id: 'custpage_inv_olddept', value: from_account_search_results[tran]['dept'], line: ilineval });
                                }
                                if (from_account_search_results[tran]['item']) {
                                    Invsublist.setSublistValue({ id: 'custpage_inv_olditem', value: from_account_search_results[tran]['item'], line: ilineval });
                                }
                                if (from_account_search_results[tran]['type']) {
                                    Invsublist.setSublistValue({ id: 'custpage_inv_type', value: from_account_search_results[tran]['type'], line: ilineval });
                                }
                                if (from_account_search_results[tran]['lineId']) {
                                    Invsublist.setSublistValue({ id: 'custpage_inv_lineno', value: from_account_search_results[tran]['lineId'], line: ilineval });
                                }
                                if (from_account_search_results[tran]['Amount']) {
                                    Invsublist.setSublistValue({ id: 'custpage_inv_amount', value: from_account_search_results[tran]['Amount'], line: ilineval });
                                }
                                if (from_account_search_results[tran]['lineloc']) {
                                    Invsublist.setSublistValue({ id: 'custpage_inv_lineloc', value: from_account_search_results[tran]['lineloc'], line: ilineval });
                                }
                                if (from_account_search_results[tran]['taxcode']) {
                                    Invsublist.setSublistValue({ id: 'custpage_inv_taxcode', value: from_account_search_results[tran]['taxcode'], line: ilineval });
                                }
                                if (from_account_search_results[tran]['oldDeptVal']) {
                                    Invsublist.setSublistValue({ id: 'custpage_inv_olddeptval', value: from_account_search_results[tran]['oldDeptVal'], line: ilineval });
                                }
                                if (from_account_search_results[tran]['lineMemo']) {
                                    Invsublist.setSublistValue({ id: 'custpage_inv_linememo', value: shortString(from_account_search_results[tran]['lineMemo']), line: ilineval });
                                }
                                if (from_account_search_results[tran]['oldItemval']) {
                                    Invsublist.setSublistValue({ id: 'custpage_inv_olditemval', value: from_account_search_results[tran]['oldItemval'], line: ilineval });
                                }
                                // if (from_account_search_results[tran]['description']) {
                                //     Invsublist.setSublistValue({ id: 'custpage_inv_description', value: from_account_search_results[tran]['description'], line: ilineval });
                                // }
                                // if (from_account_search_results[tran]['job']) {
                                //     Invsublist.setSublistValue({ id: 'custpage_inv_job', value: from_account_search_results[tran]['job'], line: ilineval });
                                // }
                                ilineval++;
                            }

                            if (from_account_search_results[tran]['type'] == "VendBill") {

                                if (from_account_search_results[tran]['internalId']) {
                                    Billsublist.setSublistValue({ id: 'custpage_bill_internalid', value: from_account_search_results[tran]['internalId'], line: blineval });
                                }
                                if (from_account_search_results[tran]['tranDate']) {
                                    Billsublist.setSublistValue({ id: 'custpage_bill_trandate', value: from_account_search_results[tran]['tranDate'], line: blineval });
                                }
                                if (from_account_search_results[tran]['tranId']) {
                                    Billsublist.setSublistValue({ id: 'custpage_bill_docnum', value: from_account_search_results[tran]['tranId'], line: blineval });
                                }
                                if (from_account_search_results[tran]['status']) {
                                    Billsublist.setSublistValue({ id: 'custpage_bill_status', value: from_account_search_results[tran]['status'], line: blineval });
                                }
                                if (from_account_search_results[tran]['dept']) {
                                    Billsublist.setSublistValue({ id: 'custpage_bill_olddept', value: from_account_search_results[tran]['dept'], line: blineval });
                                }
                                if (from_account_search_results[tran]['item']) {
                                    Billsublist.setSublistValue({ id: 'custpage_bill_olditem', value: from_account_search_results[tran]['item'], line: blineval });
                                }
                                if (from_account_search_results[tran]['type']) {
                                    Billsublist.setSublistValue({ id: 'custpage_bill_type', value: from_account_search_results[tran]['type'], line: blineval });
                                }
                                if (from_account_search_results[tran]['lineId']) {
                                    Billsublist.setSublistValue({ id: 'custpage_bill_lineno', value: from_account_search_results[tran]['lineId'], line: blineval });
                                }
                                if (from_account_search_results[tran]['Amount']) {
                                    Billsublist.setSublistValue({ id: 'custpage_bill_amount', value: from_account_search_results[tran]['Amount'], line: blineval });
                                }
                                if (from_account_search_results[tran]['lineloc']) {
                                    Billsublist.setSublistValue({ id: 'custpage_bill_lineloc', value: from_account_search_results[tran]['lineloc'], line: blineval });
                                }
                                if (from_account_search_results[tran]['oldDeptVal']) {
                                    Billsublist.setSublistValue({ id: 'custpage_bill_olddeptval', value: from_account_search_results[tran]['oldDeptVal'], line: blineval });
                                }
                                if (from_account_search_results[tran]['oldItemval']) {
                                    Billsublist.setSublistValue({ id: 'custpage_bill_olditemval', value: from_account_search_results[tran]['oldItemval'], line: blineval });
                                }
                                if (from_account_search_results[tran]['lineMemo']) {
                                    Billsublist.setSublistValue({ id: 'custpage_bill_linememo', value: shortString(from_account_search_results[tran]['lineMemo']), line: blineval });
                                }
                                if (from_account_search_results[tran]['taxcode']) {
                                    Billsublist.setSublistValue({ id: 'custpage_bill_taxcode', value: shortString(from_account_search_results[tran]['taxcode']), line: blineval });
                                }
                                // if (from_account_search_results[tran]['description']) {
                                //     Billsublist.setSublistValue({ id: 'custpage_bill_description', value: shortString(from_account_search_results[tran]['description']), line: blineval });
                                // }

                                blineval++;
                            }

                            // log.debug("script usage: "+tran,script.getRemainingUsage());
                        }
                    }
                }
            }

            if (method == "POST") {

                var transactionJSON = {};
                var params = context.request.parameters;

                var selectedItem = params.custpage_new_item;
                var selectedAccount = params.custpage_new_account;
                var selectedItemDep = params.custpage_new_item_department;
                var selectedAccDep = params.custpage_new_acc_department;

                log.debug("selectedItem", selectedItem);
                log.debug("selectedAccount", selectedAccount);
                log.debug("selectedItemDep", selectedItemDep);
                log.debug("selectedAccDep", selectedAccDep);

                var invlinecount = context.request.getLineCount({
                    group: 'custpage_invtable'
                });

                var billlinecount = context.request.getLineCount({
                    group: 'custpage_billtable'
                });

                var journallinecount = context.request.getLineCount({
                    group: 'custpage_journaltable'
                });
                log.debug("invlinecount", invlinecount);
                log.debug("billlinecount", billlinecount);
                log.debug("journallinecount", journallinecount);

                if (invlinecount > 0) {
                    for (var invline = 0; invline <= invlinecount; invline++) {

                        var InvtempJson = {};
                        var checkvalueinv = context.request.getSublistValue({ group: 'custpage_invtable', name: 'custpage_inv_selectchkbox', line: invline });
                        if (checkvalueinv == "T") {
                            var invinternalId = context.request.getSublistValue({ group: 'custpage_invtable', name: 'custpage_inv_internalid', line: invline });
                            var invlineno = context.request.getSublistValue({ group: 'custpage_invtable', name: 'custpage_inv_lineno', line: invline });
                            var type = 'INVOICE';
                            if (!transactionJSON[invinternalId]) {
                                transactionJSON[invinternalId] = {};
                            }

                            if (!transactionJSON[invinternalId][invlineno]) {

                                transactionJSON[invinternalId]['type'] = type;
                                transactionJSON[invinternalId][invlineno] = InvtempJson;

                                InvtempJson['internalId'] = context.request.getSublistValue({ group: 'custpage_invtable', name: 'custpage_inv_internalid', line: invline });
                                InvtempJson['trandate'] = context.request.getSublistValue({ group: 'custpage_invtable', name: 'custpage_inv_trandate', line: invline });
                                InvtempJson['docnum'] = context.request.getSublistValue({ group: 'custpage_invtable', name: 'custpage_inv_docnum', line: invline });
                                InvtempJson['status'] = context.request.getSublistValue({ group: 'custpage_invtable', name: 'custpage_inv_status', line: invline });
                                InvtempJson['oldDept'] = context.request.getSublistValue({ group: 'custpage_invtable', name: 'custpage_inv_olddept', line: invline });
                                InvtempJson['oldItem'] = context.request.getSublistValue({ group: 'custpage_invtable', name: 'custpage_inv_olditem', line: invline });
                                var invDep = context.request.getSublistValue({ group: 'custpage_invtable', name: 'custpage_inv_newdept', line: invline });
                                InvtempJson['newDept'] = invDep ? invDep : selectedItemDep;
                                var invItem = context.request.getSublistValue({ group: 'custpage_invtable', name: 'custpage_inv_newitem', line: invline });
                                InvtempJson['newItem'] = invItem ? invItem : selectedItem;
                                InvtempJson['type'] = context.request.getSublistValue({ group: 'custpage_invtable', name: 'custpage_inv_type', line: invline });
                                InvtempJson['lineno'] = context.request.getSublistValue({ group: 'custpage_invtable', name: 'custpage_inv_lineno', line: invline });
                                InvtempJson['amount'] = context.request.getSublistValue({ group: 'custpage_invtable', name: 'custpage_inv_amount', line: invline });
                                InvtempJson['lineloc'] = context.request.getSublistValue({ group: 'custpage_invtable', name: 'custpage_inv_lineloc', line: invline });
                                InvtempJson['taxcode'] = context.request.getSublistValue({ group: 'custpage_invtable', name: 'custpage_inv_taxcode', line: invline });
                                InvtempJson['oldDeptVal'] = context.request.getSublistValue({ group: 'custpage_invtable', name: 'custpage_inv_olddeptval', line: invline });
                                InvtempJson['lineMemo'] = context.request.getSublistValue({ group: 'custpage_invtable', name: 'custpage_inv_linememo', line: invline });
                                // InvtempJson['job'] = context.request.getSublistValue({ group: 'custpage_invtable', name: 'custpage_inv_job', line: invline });
                            }
                        }
                    }
                }

                if (billlinecount > 0) {
                    for (var billline = 0; billline <= billlinecount; billline++) {

                        var billtempJson = {};
                        var checkvaluebill = context.request.getSublistValue({ group: 'custpage_billtable', name: 'custpage_bill_selectchkbox', line: billline });
                        //log.debug("checkvaluebill", checkvaluebill);
                        if (checkvaluebill == "T") {
                            var billinternalId = context.request.getSublistValue({ group: 'custpage_billtable', name: 'custpage_bill_internalid', line: billline });
                            var billlineno = context.request.getSublistValue({ group: 'custpage_billtable', name: 'custpage_bill_lineno', line: billline });
                            var type = 'BILL';
                            if (!transactionJSON[billinternalId]) {
                                transactionJSON[billinternalId] = {};
                            }
                            if (!transactionJSON[billinternalId][billlineno]) {

                                transactionJSON[billinternalId]['type'] = type;
                                transactionJSON[billinternalId][billlineno] = billtempJson;

                                billtempJson['internalId'] = context.request.getSublistValue({ group: 'custpage_billtable', name: 'custpage_bill_internalid', line: billline });
                                billtempJson['trandate'] = context.request.getSublistValue({ group: 'custpage_billtable', name: 'custpage_bill_trandate', line: billline });
                                billtempJson['docnum'] = context.request.getSublistValue({ group: 'custpage_billtable', name: 'custpage_bill_docnum', line: billline });
                                billtempJson['status'] = context.request.getSublistValue({ group: 'custpage_billtable', name: 'custpage_bill_status', line: billline });
                                billtempJson['oldDept'] = context.request.getSublistValue({ group: 'custpage_billtable', name: 'custpage_bill_olddept', line: billline });
                                billtempJson['oldItem'] = context.request.getSublistValue({ group: 'custpage_billtable', name: 'custpage_bill_olditem', line: billline });
                                var billDep = context.request.getSublistValue({ group: 'custpage_billtable', name: 'custpage_bill_newdept', line: billline });
                                var billItem = context.request.getSublistValue({ group: 'custpage_billtable', name: 'custpage_bill_newitem', line: billline });
                                billtempJson['newItem'] = billItem ? billItem : selectedItem;
                                if (billItem || selectedItem) {
                                    billtempJson['newDept'] = billDep ? billDep : selectedItemDep;
                                } else {
                                    billtempJson['newDept'] = billDep ? billDep : selectedAccDep;
                                }
                                var billAcc = context.request.getSublistValue({ group: 'custpage_billtable', name: 'custpage_bill_newacc', line: billline });
                                billtempJson['newAcc'] = billAcc ? billAcc : selectedAccount;
                                billtempJson['type'] = context.request.getSublistValue({ group: 'custpage_billtable', name: 'custpage_bill_type', line: billline });
                                billtempJson['lineno'] = context.request.getSublistValue({ group: 'custpage_billtable', name: 'custpage_bill_lineno', line: billline });
                                billtempJson['amount'] = context.request.getSublistValue({ group: 'custpage_billtable', name: 'custpage_bill_amount', line: billline });
                                billtempJson['lineloc'] = context.request.getSublistValue({ group: 'custpage_billtable', name: 'custpage_bill_lineloc', line: billline });
                                billtempJson['OlddeptVal'] = context.request.getSublistValue({ group: 'custpage_billtable', name: 'custpage_bill_olddeptval', line: billline });
                                billtempJson['taxcode'] = context.request.getSublistValue({ group: 'custpage_billtable', name: 'custpage_bill_taxcode', line: billline });
                                billtempJson['lineMemo'] = context.request.getSublistValue({ group: 'custpage_billtable', name: 'custpage_bill_linememo', line: billline });
                                // billtempJson['description'] = context.request.getSublistValue({ group: 'custpage_billtable', name: 'custpage_bill_description', line: billline });
                            }
                        }
                    }
                }

                if (journallinecount > 0) {

                    for (var journalline = 0; journalline <= journallinecount; journalline++) {

                        var journalTempJson = {};
                        var checkvaluejournal = context.request.getSublistValue({ group: 'custpage_journaltable', name: 'custpage_journal_selectchkbox', line: journalline });
                        //log.debug("checkvaluejournal", checkvaluejournal);
                        if (checkvaluejournal == "T") {
                            var journalinternalId = context.request.getSublistValue({ group: 'custpage_journaltable', name: 'custpage_journal_internalid', line: journalline });
                            var journalLineNo = context.request.getSublistValue({ group: 'custpage_journaltable', name: 'custpage_journal_lineno', line: journalline });
                            var type = 'JOURNAL';

                            if (!transactionJSON[journalinternalId]) {
                                transactionJSON[journalinternalId] = {};
                            }
                            if (!transactionJSON[journalinternalId][journalLineNo]) {

                                transactionJSON[journalinternalId]['type'] = type;
                                transactionJSON[journalinternalId][journalLineNo] = journalTempJson;
                            }

                            journalTempJson['internalId'] = context.request.getSublistValue({ group: 'custpage_journaltable', name: 'custpage_journal_internalid', line: journalline });
                            journalTempJson['trandate'] = context.request.getSublistValue({ group: 'custpage_journaltable', name: 'custpage_journal_trandate', line: journalline });
                            journalTempJson['docnum'] = context.request.getSublistValue({ group: 'custpage_journaltable', name: 'custpage_journal_docnum', line: journalline });
                            journalTempJson['status'] = context.request.getSublistValue({ group: 'custpage_journaltable', name: 'custpage_journal_status', line: journalline });
                            journalTempJson['oldDept'] = context.request.getSublistValue({ group: 'custpage_journaltable', name: 'custpage_journal_olddept', line: journalline });
                            var jvDep = context.request.getSublistValue({ group: 'custpage_journaltable', name: 'custpage_journal_newdept', line: journalline });
                            journalTempJson['newDept'] = jvDep ? jvDep : selectedAccDep;
                            var jvAcc = context.request.getSublistValue({ group: 'custpage_journaltable', name: 'custpage_journal_newacc', line: journalline });
                            journalTempJson['newAcc'] = jvAcc ? jvAcc : selectedAccount;
                            journalTempJson['type'] = context.request.getSublistValue({ group: 'custpage_journaltable', name: 'custpage_journal_type', line: journalline });
                            journalTempJson['lineno'] = context.request.getSublistValue({ group: 'custpage_journaltable', name: 'custpage_journal_lineno', line: journalline });
                            journalTempJson['lineMemo'] = context.request.getSublistValue({ group: 'custpage_journaltable', name: 'custpage_journal_linememo', line: journalline });
                            journalTempJson['lineloc'] = context.request.getSublistValue({ group: 'custpage_journaltable', name: 'custpage_journal_lineloc', line: journalline });
                        }
                    }
                }
                log.debug("transaction Object", transactionJSON);

                var usreId = runtime.getCurrentUser().id;

                log.debug("usreId: " + usreId);

                var mapReduce = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: 'customscript_3pg_mr_acc_reasign_tool',
                    deploymentId: 'customdeploy_3pg_mr_acc_reasign_tool',
                    params: {
                        custscript_3pg_selected_trans: transactionJSON, custscript_userid: usreId
                    }
                });
                var mrTaskId = mapReduce.submit();
                log.debug("mrTaskId", mrTaskId);
            }
            context.response.writePage(form);

        } catch (e) {
            log.error("error in Suitelet", e);
        }
    }

    function shortString(str){
        if(str.length >300){
            return str.substring(0,295)+ "...";
        }else{
            return str
        }
    }

    function fromAccounttransactionsearch(fromacc, fromdate, todate, department) {
        log.debug("from_Dep inside search function : ",department);

        var tranarr = [];

        var transactionSearchObj = search.create({
            type: "transaction",
            filters:
                [
                    [["account", "anyof", fromacc], "OR", ["item.account", "anyof", fromacc]],
                    "AND",
                    [["department", "anyof", department], "OR", ["item.department", "anyof", department]],
                    "AND",
                    ["trandate", "within", fromdate, todate],
                    "AND",
                    ["type", "anyof", "CustInvc", "VendBill"],
                    "AND",
                    ["mainline", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({ name: "entity", label: "Name" }),
                    search.createColumn({ name: "externalid", label: "External ID" }),
                    search.createColumn({ name: "type", label: "Type" }),
                    search.createColumn({ name: "tranid", label: "Document Number" }),
                    search.createColumn({ name: "statusref", label: "Status" }),
                    search.createColumn({ name: "line", label: "Line ID" }),
                    search.createColumn({ name: "trandate", label: "Date" }),
                    search.createColumn({ name: "departmentnohierarchy", label: "Department (no hierarchy)" }),
                    search.createColumn({ name: "item", label: "Item" }),
                    search.createColumn({ name: "linesequencenumber", label: "Line Sequence Number" }),
                    search.createColumn({ name: "amount", label: "Amount" }),
                    search.createColumn({ name: "locationnohierarchy", label: "Location (no hierarchy)" }),
                    search.createColumn({ name: "taxcode", label: "Tax Item" }),
                    search.createColumn({ name: "fxamount", label: "Amount (Foreign Currency)" }),
                    search.createColumn({ name: "lineuniquekey", label: "Unique Line Key" }),
                    search.createColumn({ name: "memo", label: "Memo" }),
                    // search.createColumn({ name: "description", label: "description" }),
                    // search.createColumn({ name: "job", label: "job" }),
                ]
        });
        var searchResultCount = transactionSearchObj.runPaged().count;
        log.debug("transactionSearchObj result count", searchResultCount);
        transactionSearchObj.run().each(function (result) {
            var tranJson = {};
            tranJson['internalId'] = result.getValue({ name: "internalid", label: "Internal ID" });
            tranJson['entity'] = result.getValue({ name: "entity", label: "Name" });
            tranJson['externalId'] = result.getValue({ name: "externalid", label: "External ID" });
            tranJson['type'] = result.getValue({ name: "type", label: "Type" });
            tranJson['tranId'] = result.getValue({ name: "tranid", label: "Document Number" });
            tranJson['status'] = result.getValue({ name: "statusref", label: "Status" });
            tranJson['lineId'] = result.getValue({ name: "lineuniquekey", label: "Unique Line Key" });
            tranJson['tranDate'] = result.getValue({ name: "trandate", label: "Date" });
            tranJson['dept'] = result.getText({ name: "departmentnohierarchy", label: "Department (no hierarchy)" });
            tranJson['item'] = result.getText({ name: "item", label: "Item" });
            tranJson['oldItemval'] = result.getValue({ name: "item", label: "Item" });
            tranJson['Amount'] = result.getValue({ name: "fxamount", label: "Amount (Foreign Currency)" });
            tranJson['lineloc'] = result.getValue({ name: "locationnohierarchy", label: "Location (no hierarchy)" });
            tranJson['taxcode'] = result.getValue({ name: "taxcode", label: "Tax Item" });
            tranJson['oldDeptVal'] = result.getValue({ name: "departmentnohierarchy", label: "Department (no hierarchy)" });
            tranJson['lineMemo'] = result.getValue({ name: "memo", label: "Memo" });
            // tranJson['description'] = result.getValue({ name: "description", label: "description" });
            // tranJson['job'] = result.getValue({ name: "job", label: "job" });
            //tranJson['toAccount'] = toacc;
            tranarr.push(tranJson);
            return true;
        });


        var transactionSearchObj = search.create({
            type: "transaction",
            filters:
                [
                    ["account", "anyof", fromacc],
                    "AND",
                    ["trandate", "within", fromdate, todate],
                    "AND",
                    ["department", "anyof", department],
                    "AND",
                    ["type", "anyof", "Journal"],
                    "AND",
                    ["isreversal", "is", "F"],
                    "AND",
                    ["voided", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({ name: "entity", label: "Name" }),
                    search.createColumn({ name: "externalid", label: "External ID" }),
                    search.createColumn({ name: "type", label: "Type" }),
                    search.createColumn({ name: "tranid", label: "Document Number" }),
                    search.createColumn({ name: "statusref", label: "Status" }),
                    search.createColumn({ name: "line", label: "Line ID" }),
                    search.createColumn({ name: "trandate", label: "Date" }),
                    search.createColumn({ name: "departmentnohierarchy", label: "Department (no hierarchy)" }),
                    search.createColumn({ name: "item", label: "Item" }),
                    search.createColumn({ name: "linesequencenumber", label: "Line Sequence Number" }),
                    search.createColumn({ name: "amount", label: "Amount" }),
                    search.createColumn({ name: "locationnohierarchy", label: "Location (no hierarchy)" }),
                    search.createColumn({ name: "taxcode", label: "Tax Item" }),
                    search.createColumn({ name: "fxamount", label: "Amount (Foreign Currency)" }),
                    search.createColumn({ name: "lineuniquekey", label: "Unique Line Key" }),
                    search.createColumn({ name: "memo", label: "Memo" })
                ]
        });
        var searchResultCount = transactionSearchObj.runPaged().count;
        log.debug("transactionSearchObj result count", searchResultCount);
        transactionSearchObj.run().each(function (result) {
            var journalJson = {};
            journalJson['internalId'] = result.getValue({ name: "internalid", label: "Internal ID" });
            journalJson['entity'] = result.getValue({ name: "entity", label: "Name" });
            journalJson['externalId'] = result.getValue({ name: "externalid", label: "External ID" });
            journalJson['type'] = result.getValue({ name: "type", label: "Type" });
            journalJson['tranId'] = result.getValue({ name: "tranid", label: "Document Number" });
            journalJson['status'] = result.getValue({ name: "statusref", label: "Status" });
            journalJson['lineId'] = result.getValue({ name: "lineuniquekey", label: "Unique Line Key" });
            journalJson['tranDate'] = result.getValue({ name: "trandate", label: "Date" });
            journalJson['dept'] = result.getText({ name: "departmentnohierarchy", label: "Department (no hierarchy)" });
            journalJson['item'] = result.getText({ name: "item", label: "Item" });
            journalJson['oldItemval'] = result.getValue({ name: "item", label: "Item" });
            journalJson['Amount'] = result.getValue({ name: "fxamount", label: "Amount (Foreign Currency)" });
            journalJson['lineloc'] = result.getValue({ name: "locationnohierarchy", label: "Location (no hierarchy)" });
            // journalJson['taxcode'] = result.getValue({ name: "taxcode", label: "Tax Item" });
            journalJson['oldDeptVal'] = result.getValue({ name: "departmentnohierarchy", label: "Department (no hierarchy)" });
            journalJson['lineMemo'] = result.getValue({ name: "memo", label: "Memo" });
            //journalJson['toAccount'] = toacc;
            tranarr.push(journalJson);
            return true;
        });


        return tranarr;
    }
    return {
        onRequest: onRequest
    }
});