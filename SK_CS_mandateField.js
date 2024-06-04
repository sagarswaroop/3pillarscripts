/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/https', 'N/url', 'N/record', 'N/search', 'N/query'],

    /**
     * @param {currentRecord} currentRecord
     * @param {https} https
     * @param {url} url
     */
    function (https, url, record, search, query) {


        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {
            try {
                var currentRecord = scriptContext.currentRecord;
                var sublistName = scriptContext.sublistId;
            } catch (er) {
                console.log('Error - ' + er);
                alert(er);
            }
        }

        function validateLine(context) {

            //log.debug("validateLine",context);
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var account = '';
            var accountText = '';
            var subsidiaryText = '';
            var locationtext = '';
            var exp_category = '';
            var itemId_bill = '';
            var department = '';
            var departmentText = '';
            var location = '';
            var subsidiary = '';
            var account_arr = ['271', '275', '283', '1947', '280'];
            var sow = '';
            var acountID = '';
            var recordtype = currentRecord.type;
            department = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'department' });
            departmentText = currentRecord.getCurrentSublistText({ sublistId: sublistName, fieldId: 'department' });
            var vendor = '';
            var vendor_text = '';



            try {

                //validate the column based on value that is entered by the user.
                if (recordtype == 'purchaseorder' || recordtype == 'vendorbill') {
                    let accountName = currentRecord.getCurrentSublistValue({
                        sublistId: "item",
                        fieldId: "custcol_acct_name_3p"
                    });
        
                    let isAvailable = accountName.includes("Lease Payable Clearing");
        
                    if (isAvailable) {
                        let lease = currentRecord.getCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_laa_lease"
                        });
        
                        if (!lease) {
                            alert("Please enter the value for : NetLease Lease");
                            return false;
                        }
                    }
                }

                if (recordtype != "expensereport" && recordtype != 'journalentry') {
                    vendor = currentRecord.getValue({ fieldId: 'entity' });
                    vendor_text = currentRecord.getText({ fieldId: 'entity' });
                }

                if (recordtype == 'journalentry') {
                    vendor = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'entity' });
                    vendor_text = currentRecord.getCurrentSublistText({ sublistId: sublistName, fieldId: 'entity' });
                }

                if (vendor > 0 && department > 0) {
                    var sqlStr = "select custentity_restrict_dep, BUILTIN.DF(custentity_restrict_dep) as dep_name from vendor where id=" + vendor;
                    var vdrResult = query.runSuiteQL({ query: sqlStr }).asMappedResults();

                    if (vdrResult.length > 0 && vdrResult[0].custentity_restrict_dep) {
                        var depArr = vdrResult[0].custentity_restrict_dep.split(",");
                        var departments = vdrResult[0].dep_name;
                        if (depArr.indexOf(department) == -1) {
                            alert('Department ' + departmentText + ' is not available for Vendor ' + vendor_text + '. You cannot save this transaction.\n Available Departments: ' + departments);
                            return false;
                        }
                    }
                }

                if (recordtype == 'journalentry') {
                    account = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'account' });
                    location = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'location' });
                    locationtext = currentRecord.getCurrentSublistText({ sublistId: sublistName, fieldId: 'location' });
                    subsidiary = currentRecord.getValue({ fieldId: 'subsidiary' });
                    //accountText = currentRecord.getCurrentSublistText({sublistId: sublistName,fieldId: 'account'});
                    sow = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'custcol_interco_client' });
                    if (sow == '') {
                        sow = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'entity' });
                    }
                }
                else if (recordtype == 'expensereport') {
                    exp_category = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'category' });
                    location = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'location' });
                    locationtext = currentRecord.getCurrentSublistText({ sublistId: sublistName, fieldId: 'location' });
                    subsidiary = currentRecord.getValue({ fieldId: 'subsidiary' });
                    sow = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'customer' });
                }
                else if (recordtype == 'purchaseorder') {
                    sow = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'custcol_interco_client' });
                    if (sow == '') {
                        sow = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'customer' });
                    }
                    if (sublistName == 'item') {
                        department = currentRecord.getValue({
                            fieldId: 'department'
                        });
                        departmentText = currentRecord.getText({
                            fieldId: 'department'
                        });

                        account = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'custcol_expense_account' });
                        //location = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'location' });
                        location = currentRecord.getValue({ fieldId: 'location' });
                        //locationtext = currentRecord.getCurrentSublistText({ sublistId: sublistName, fieldId: 'location' });
                        locationtext = currentRecord.getText({ fieldId: 'location' });
                        subsidiary = currentRecord.getValue({ fieldId: 'subsidiary' });
                        //accountText = currentRecord.getCurrentSublistText({sublistId: sublistName,fieldId: 'custcol_expense_account'});
                    }
                    else if (sublistName == 'expense') {
                        account = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'account' });
                        //accountText = currentRecord.getCurrentSublistText({sublistId: sublistName,fieldId: 'account'});
                        department = currentRecord.getValue({
                            fieldId: 'department'
                        });
                        departmentText = currentRecord.getText({
                            fieldId: 'department'
                        });
                        location = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'location' });
                        locationtext = currentRecord.getCurrentSublistText({ sublistId: sublistName, fieldId: 'location' });
                        subsidiary = currentRecord.getValue({ fieldId: 'subsidiary' });
                    }
                }
                else if (recordtype == 'vendorbill') {
                    sow = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'customer' });
                    if (sow == '') {
                        sow = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'custcol_interco_client' });
                    }
                    if (sublistName == 'expense') {
                        account = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'account' });
                        location = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'location' });
                        locationtext = currentRecord.getCurrentSublistText({ sublistId: sublistName, fieldId: 'location' });
                        subsidiary = currentRecord.getValue({ fieldId: 'subsidiary' });
                        //accountText = currentRecord.getCurrentSublistText({sublistId: sublistName,fieldId: 'account'});
                    } else if (sublistName == 'item') {
                        itemId_bill = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'item' });
                        location = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'location' });
                        subsidiary = currentRecord.getValue({ fieldId: 'subsidiary' });
                        locationtext = currentRecord.getCurrentSublistText({ sublistId: sublistName, fieldId: 'location' });
                    }
                }

                var redirectSL = url.resolveScript({
                    scriptId: 'customscript_validate_acc_dep_suit',
                    deploymentId: 'customdeploy_validate_acc_dep_suit_dp',
                    params: {
                        'departmentid': department,
                        'accountid': account,
                        'exp_category': exp_category,
                        'Recordtype': recordtype,
                        'itemId_bill': itemId_bill,
                        'location': location,
                        'subsidiary': subsidiary,
                        'vendor': ""
                    },
                });

                var response = https.post({
                    url: redirectSL
                });

                console.log('response - ' + response.body.split('!'));

                if (response.body) {
                    var value = response.body.split('!');
                    var dept_response = value[0].split(':')[1];
                    var loc_response = value[1].split(':')[1];
                    console.log('dept_response - ' + dept_response);
                    console.log('loc_response - ' + loc_response);

                    if (dept_response.indexOf('@') > -1) {
                        var arr = dept_response.split('@');
                        accountText = arr[1];
                        dept_response = arr[0];
                        acountID = arr[2];
                    }
                    if (dept_response == 'F') {
                        alert('Department ' + departmentText + ' is not available for GL Account ' + accountText + '. You cannot save this transaction.');
                        return false;
                    }
                    if (acountID != undefined && acountID != 'undefined') {
                        if (account_arr.indexOf(acountID) > -1 && sow == '') {
                            alert('SOW is mandatory for GL Account :' + accountText + '. Please add value to any of these fields as they contain SOW no.  Interco  Client /  Name / Project.');
                            return false;
                        }
                    }
                    if (loc_response.indexOf('@') > -1) {
                        var loc_arr = loc_response.split('@');
                        subsidiaryText = loc_arr[1];
                        loc_response = loc_arr[0];
                    }
                    if (loc_response == 'F') {
                        alert('Location ' + locationtext + ' is only valid for the subsidiaries : \n' + subsidiaryText + ' \n You cannot save this transaction.');
                        return false;
                    }
                    else {
                        return true;
                    }
                }
                else {
                    return true;
                }
            } catch (error) {
                log.error("validate_acc_department Error: ", error);
            }
        }


        return {
            fieldChanged: fieldChanged,
            validateLine: validateLine,
        };

    });