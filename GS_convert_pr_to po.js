/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/currentRecord', 'N/error', 'N/query', 'N/file','N/format/i18n'],

    function (search, record, currentRecord, error, query, file, format) {

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type
         * @param {Form} scriptContext.form - Current form
         * @Since 2015.2
         */
        function beforeLoad(scriptContext) {

        }

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function beforeSubmit(context) {

        }

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */

        function formatAmount(amt) {
            var curFormatter = format.getCurrencyFormatter({
                locale: 'en_US'
            });
            var usdAmt = curFormatter.format({
                number: amt
            });

            log.debug(usdAmt);
            return usdAmt;
        }
        
        function afterSubmit(context) {

            if (context.type == "edit") {

                try {

                    var create_po = false;
                    var create_vb = false;
                    var newRecord = context.newRecord;
                    var oldRecord = context.oldRecord;
                    var id = newRecord.id;
                    var pr_name = newRecord.getValue({ fieldId: 'name' });
                    var po_id = newRecord.getValue({ fieldId: 'custrecord_pr_purchase_order' });
                    var amount = newRecord.getValue({ fieldId: 'custrecord_pr_po_amount' });
                    var currency = newRecord.getValue({ fieldId: 'custrecord_pr_currency' });
                    var usd_total = 0;
                    var poFolder = 448538;
                    var response = '0';
                    if (currency == 1) {
                        usd_total = amount;
                    } else {
                        var sql = "SELECT	\
			            	BaseCurrency.Symbol AS BaseSymbol,\
			            	TransactionCurrency.Symbol AS TransactionSymbol,\
			            	CurrencyRate.ExchangeRate,\
			            	TO_CHAR( CurrencyRate.EffectiveDate, 'YYYY-MM-DD HH:MI:SS' ) AS EffectiveDate,\
			            	TO_CHAR( CurrencyRate.LastModifiedDate, 'YYYY-MM-DD HH:MI:SS' ) AS LastModifiedDate\
			            FROM\
			            	CurrencyRate\
			            	INNER JOIN Currency AS BaseCurrency ON\
			            		( BaseCurrency.ID = CurrencyRate.BaseCurrency AND BaseCurrency.Symbol='USD' )\
			            	INNER JOIN Currency AS TransactionCurrency ON\
			            		(TransactionCurrency.ID = CurrencyRate.TransactionCurrency AND TransactionCurrency.ID = "+ currency + " )		\
			            WHERE\
			            	 ( CurrencyRate.EffectiveDate =BUILTIN.RELATIVE_RANGES( 'YESTERDAY', 'START' ) ) ";
                        log.debug('sql', sql);

                        var runquery = query.runSuiteQL({ query: sql });
                        var results = runquery.asMappedResults();
                        if (results.length > 0) {
                            usd_total = amount * results[0].exchangerate
                        }
                        log.debug('validate_amount', 'usd_total=' + usd_total);

                    }


                    var newStatus = newRecord.getValue({ fieldId: "custrecord_pr_approval_status" });
                    var oldStatus = oldRecord.getValue({ fieldId: "custrecord_pr_approval_status" });
                    if (newStatus == 2 && newStatus != oldStatus && isNullOrEmpty(po_id) && parseFloat(usd_total) > 500) {
                        create_po = true;
                    }
                    else if (newStatus == 2 && newStatus != oldStatus && isNullOrEmpty(po_id) && parseFloat(usd_total) < 500) {
                        create_vb = true;
                    }
                    log.debug(pr_name, 'create po=' + create_po + ' | create vb=' + create_vb);

                    if (create_po == false && create_vb == false)
                        return;

                    var vendor = newRecord.getValue({ fieldId: "custrecord_pr_vendor" });
                    var start_date = newRecord.getValue({ fieldId: "custrecord_pr_start_date" });
                    var end_date = newRecord.getValue({ fieldId: "custrecord_pr_end_date" });
                    var subsidiary = newRecord.getValue({ fieldId: "custrecord_pr_subsidiary" });
                    var department = newRecord.getValue({ fieldId: "custrecord_pr_department" });
                    var location = newRecord.getValue({ fieldId: "custrecord_pr_location" });
                    var amount = newRecord.getValue({ fieldId: "custrecord_pr_po_amount" });
                    var currency = newRecord.getValue({ fieldId: "custrecord_pr_currency" });
                    var internal_memo = newRecord.getValue({ fieldId: "custrecord_pr_internal_memo" });
                    var project = newRecord.getValue({ fieldId: "custrecord_pr_internla_project" });
                    var file_id = newRecord.getValue({ fieldId: "custrecord_pr_attachment" });
                    var employee_email = newRecord.getValue({ fieldId: "custrecord_pr_requester_email" });
                    var employee_id = newRecord.getValue({ fieldId: "custrecord_requester_id" });
                    var po_non_compliance = newRecord.getValue({ fieldId: "custrecord_po_non_compliance_cust" });
                    var billRefNo = newRecord.getValue({ fieldId: "custrecord_bill_no" });
                    var usdEstimatedAmnt = newRecord.getValue({ fieldId: "custrecord_curr_estimated_amt" });
                    var rec_type = (create_po == true) ? "purchaseorder" : "vendorbill";

                    var newRec = record.create({
                        type: rec_type,
                        isDynamic: true,
                        defaultValues: { 'entity': vendor }

                    });
                    newRec.setValue({ fieldId: "subsidiary", value: subsidiary });
                    newRec.setValue({ fieldId: "currency", value: currency });
                    newRec.setValue({ fieldId: "memo", value: internal_memo });
                    newRec.setValue({ fieldId: "custbody_purchase_request", value: id });
                    newRec.setValue({ fieldId: "custbody_estmaded_total_amt", value: formatAmount(usdEstimatedAmnt)});
                    if (create_vb) {
                        newRec.setValue({ fieldId: "custbody_3pg_po_amount_usd", value: usd_total });
                        newRec.setValue({ fieldId: "trandate", value: new Date() });
                        newRec.setValue({ fieldId: "custbody_actual_bill_date", value: start_date });
                        newRec.setValue({ fieldId: "custbody_created_from_pr", value: true });
                        newRec.setValue({ fieldId: "tranid", value: billRefNo });  
                        newRec.setValue({ fieldId: "custbody_tran_req", value: employee_id });                
                    }

                    if (create_po) {
                        newRec.setValue({ fieldId: "trandate", value: start_date });
                        newRec.setValue({ fieldId: "employee", value: employee_id });
                        newRec.setValue({ fieldId: "duedate", value: end_date });
                        newRec.setValue({ fieldId: "location", value: location });
                        newRec.setValue({ fieldId: "memo", value: internal_memo });
                        newRec.setValue({ fieldId: "department", value: department });
                        newRec.setValue({ fieldId: "tobeemailed", value: false });
                        newRec.setValue({ fieldId: "custbody_amount_based_approval_flow", value: true });
                        newRec.setValue({ fieldId: "custbody_po_non_compliance", value: po_non_compliance });

                    }
                    var _sql2 = "SELECT * FROM customrecord_pr_items \
                        WHERE custrecord_pr_item_pr = " + id;
                    var queryResultSet2 = query.runSuiteQL({ query: _sql2 });
                    var results2 = queryResultSet2.asMappedResults();

                    for (var jj = 0; jj < results2.length; jj++) {
                        newRec.selectNewLine({ sublistId: 'item' });
                        newRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            value: results2[jj].custrecord_pr_items_item
                        });
                        newRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            value: results2[jj].custrecord_pr_item_qty
                        });
                        newRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            value: results2[jj].custrecord_pr_item_rate
                        });
                        newRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'taxcode',
                            value: results2[jj].custrecord_pr_item_tax_code
                        });
                        newRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'department',
                            value: department
                        });
                        newRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'description',
                            value: results2[jj].custrecord_pr_items_description
                        });
                        newRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_interco_client',
                            value: project
                        });
                        newRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'location',
                            value: location
                        });


                        newRec.commitLine({ sublistId: 'item' });

                    } //for (var i = 0; i < results.length; i++) { 

                    var poId = newRec.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
                    log.debug('poId', poId);
                    record.submitFields({ type: 'customrecord_3pg_purchase_requset', id: id, values: { custrecord_pr_purchase_order: poId, custrecord_po_creation_error: '' } });
                    if (file_id > 0) {

                        record.attach({
                            record: {
                                type: 'file',
                                id: file_id
                            },
                            to: {
                                type: rec_type,
                                id: poId
                            }
                        });

                    }
                } catch (e) {
                    log.debug('error', e);
                    record.submitFields({ type: 'customrecord_3pg_purchase_requset', id: id, values: { custrecord_po_creation_error: e.message, custrecord_pr_approval_status: '1' } });
                }

            }

        }


        function isNullOrEmpty(val) {
            if (val == null || val == '' || val == "" || val == 'undefined' || val == [] || val == {} || val == 'NaN' || val == '- None -') {
                return true;
            } else {
                return false;
            }
        }
        return {
            //        beforeLoad: beforeLoad,
            // beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };

    });