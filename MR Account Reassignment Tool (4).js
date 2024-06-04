/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @author Aaditya Dhyani
 */
var folderId = '448742';
define(['N/search', 'N/record', 'N/runtime','N/file','N/query','N/email'], function (search, record, runtime, file, query,email) {

    function getTransactionId(record){
        return record.getText({
            fieldId: "tranid"
        });
    }

    function getAccountText(accId){
        var accQuery = 'select accountsearchdisplayname from account where account.id ='+accId;
        var accResult = query.runSuiteQL({ query: accQuery }).asMappedResults();
        var accName = accResult[0].accountsearchdisplayname;

        log.debug("accName: "+accName);
        return accName;
    }

    function getItemText(itemid){
        var accQuery = 'select displayname from item where item.id ='+itemid;
        var accResult = query.runSuiteQL({ query: accQuery }).asMappedResults();
        var itemName = accResult[0].displayname;
        // log.debug("item name is: "+itemName);
        return itemName;
    }

    function getInputData() {

        var result = runtime.getCurrentScript().getParameter({ name: 'custscript_3pg_selected_trans' });
        folderId = runtime.getCurrentScript().getParameter({ name: 'custscript_folder_id' });
        log.debug("folderId: "+folderId);
        var jsonres = JSON.parse(result);

        return jsonres;
    }

    function map(context) {
        var fileData = [];
        var transactionNo = 0;
        try {
            var datakey = context.key;
            var datavalue = JSON.parse(context.value);
            log.debug("data " + datakey, datavalue);

            if(datavalue['type'] == 'INVOICE'){

                var invobjRec = record.load({ 
                    type: record.Type.INVOICE, 
                    id: datakey,
                    isDynamic: true,
                });

                var invTranNumber = getTransactionId(invobjRec);
                transactionNo = invTranNumber;
                var invNewItemName = "";
                var invOldItemName = "";
                
                for(var x in datavalue){
                    if(x !='type'){

                        var invlineno = invobjRec.findSublistLineWithValue({ sublistId: 'item', fieldId: 'lineuniquekey', value: datavalue[x]['lineno'] });

                        // var invLineDescription = invobjRec.getSublistValue({
                        //     sublistId: "item",
                        //     fieldId: "description",
                        //     line: invlineno
                        // });

                        invobjRec.removeLine({ sublistId: 'item', line: invlineno, ignoreRecalc: true });

                        var invline = invobjRec.selectNewLine({ sublistId: 'item' });

                        if(datavalue[x]['newDept'] != null){
                            invline.setCurrentSublistValue({ sublistId: 'item', fieldId: 'department', value: datavalue[x]['newDept'], ignoreFieldChange: true });
                        }
                        if(datavalue[x]['newItem'] != null){
                            invline.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: datavalue[x]['newItem'], ignoreFieldChange: true });
                            invline.setCurrentSublistValue({ sublistId: 'item', fieldId: 'amount', value: datavalue[x]['amount'], ignoreFieldChange: true });
                            invline.setCurrentSublistValue({ sublistId: 'item', fieldId: 'location', value: datavalue[x]['lineloc'], ignoreFieldChange: true });
                            invline.setCurrentSublistValue({ sublistId: 'item', fieldId: 'taxcode', value: datavalue[x]['taxcode'], ignoreFieldChange: true });
                            if(datavalue[x]['newDept'] > 0){
                                invline.setCurrentSublistValue({ sublistId: 'item', fieldId: 'department', value: datavalue[x]['newDept'], ignoreFieldChange: true });                             
                            }
                            else{
                                invline.setCurrentSublistValue({ sublistId: 'item', fieldId: 'department', value: datavalue[x]['oldDeptVal'], ignoreFieldChange: true });
                            }
                            if(datavalue[x]['lineMemo']){
                                invline.setCurrentSublistValue({ sublistId: 'item', fieldId: 'description', value: datavalue[x]['lineMemo'], ignoreFieldChange: true });
                            }

                            invOldItemName = datavalue[x]['oldItem'];

                            if(parseInt(datavalue[x]['newItem']) > 0 )
                            invNewItemName = getItemText(datavalue[x]['newItem']);
                        }
                        invline.commitLine({ sublistId: 'item'});

                        fileData.push(invTranNumber+","+invOldItemName+","+invNewItemName+ ",,Success");
                    }
                }
                var invUpdatedREc = invobjRec.save({ ignoreMandatoryFields: true });

            }
            if(datavalue['type'] == 'BILL'){

                var billobjRec = record.load({
                    type: record.Type.VENDOR_BILL, 
                    id: datakey,
                    isDynamic: true,
                });

                var billTanId = getTransactionId(billobjRec);
                transactionNo = billTanId;
                var billOldItemName = "";
                var billNewItemName = "";
                var billOldAcc = "";
                var billNewAcc = "";

                for(var b in datavalue){

                    if(b != 'type'){

                        if(datavalue[b]['oldItem'] == null){

                            var explineno = billobjRec.findSublistLineWithValue({ sublistId: 'expense', fieldId: 'lineuniquekey', value: datavalue[b]['lineno'] });
                            
                            // var billLocation = billobjRec.getSublistValue({
                            //     sublistId: 'expense',
                            //     fieldId: 'location',
                            //     line: explineno
                            // });

                            // var bexTaxCode = billobjRec.getSublistValue({
                            //     sublistId: 'expense',
                            //     fieldId: 'taxcode',
                            //     line: explineno
                            // });

                            var billOldAcc = billobjRec.getSublistText({
                                sublistId: 'expense',
                                fieldId: 'account',
                                line: explineno
                            });

                            billobjRec.removeLine({ sublistId: 'expense', line: explineno, ignoreRecalc: true });

                            var bexpline = billobjRec.selectNewLine({ sublistId: 'expense' });
                            
                            if(datavalue[b]['newAcc'] != null){
                                bexpline.setCurrentSublistValue({ sublistId: 'expense', fieldId: 'account', value: datavalue[b]['newAcc'] });

                                // billOldAcc = datavalue[b]['oldAcc'];
                                billNewAcc = getAccountText(datavalue[b]['newAcc']);
                            }

                            bexpline.setCurrentSublistValue({ sublistId: 'expense', fieldId: 'amount', value: datavalue[b]['amount'] });

                            if(datavalue[b]['newDept'] > 0){
                                log.debug("datavalue[b]['newDept'] 153",datavalue[b]['newDept']);
                                bexpline.setCurrentSublistValue({ sublistId: 'expense', fieldId: 'department', value: datavalue[b]['newDept'] });
                            }
                            else{
                                bexpline.setCurrentSublistValue({ sublistId: 'expense', fieldId: 'department', value: datavalue[b]['OlddeptVal'] });
                            }
                            
                            if(datavalue[b]['lineloc'])
                            bexpline.setCurrentSublistValue({ sublistId: 'expense', fieldId: 'location', value: datavalue[b]['lineloc'] });

                            if(datavalue[b]['taxcode'])
                            bexpline.setCurrentSublistValue({ sublistId: 'expense', fieldId: 'taxcode', value: datavalue[b]['taxcode'] });

                            if(datavalue[b]['lineMemo'])
                            bexpline.setCurrentSublistValue({ sublistId: 'expense', fieldId: 'memo', value: datavalue[b]['lineMemo'] });

                            bexpline.commitLine({ sublistId: 'expense'});

                            fileData.push(billTanId+","+billOldAcc+","+ billNewAcc+",,Success");

                        }
                        else{

                            var itmlineno = billobjRec.findSublistLineWithValue({ sublistId: 'item', fieldId: 'lineuniquekey', value: datavalue[b]['lineno'] });

                            billobjRec.removeLine({ sublistId: 'item', line: itmlineno, ignoreRecalc: true });

                            var bitmline = billobjRec.selectNewLine({ sublistId: 'item' });

                            if(datavalue[b]['newItem'] != null){
                                bitmline.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: datavalue[b]['newItem'] });
                                bitmline.setCurrentSublistValue({ sublistId: 'item', fieldId: 'amount', value: datavalue[b]['amount'] });
                                if(datavalue[b]['newDept'] > 0 ){
                                    bitmline.setCurrentSublistValue({ sublistId: 'item', fieldId: 'department', value: datavalue[b]['newDept'] });
                                }
                                else{
                                    bitmline.setCurrentSublistValue({ sublistId: 'item', fieldId: 'department', value: datavalue[b]['OlddeptVal'] });
                                }                                
                                bitmline.setCurrentSublistValue({ sublistId: 'item', fieldId: 'location', value: datavalue[b]['lineloc'] });

                                if(datavalue[b]['lineMemo']){
                                    bitmline.setCurrentSublistValue({ sublistId: 'item', fieldId: 'description', value: datavalue[b]['lineMemo'] });
                                }

                                if(datavalue[b]['taxcode'])
                                bitmline.setCurrentSublistValue({ sublistId: 'item', fieldId: 'taxcode', value: datavalue[b]['taxcode'] });

                                billOldItemName = datavalue[b]['oldItem'];
                                billNewItemName = getItemText(datavalue[b]['newItem']);
                            }
                            else{
                                bitmline.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: datavalue[b]['OldItemval'] });
                                bitmline.setCurrentSublistValue({ sublistId: 'item', fieldId: 'amount', value: datavalue[b]['amount'] });
                                if(datavalue[b]['newDept'] != null){
                                    bitmline.setCurrentSublistValue({ sublistId: 'item', fieldId: 'department', value: datavalue[b]['newDept'] });
                                }
                                else{
                                    bitmline.setCurrentSublistValue({ sublistId: 'item', fieldId: 'department', value: datavalue[b]['OlddeptVal'] });
                                }
                                if(billLineDescription){
                                    bitmline.setCurrentSublistValue({ sublistId: 'item', fieldId: 'description', value: billLineDescription });
                                }
                                if(datavalue[b]['taxcode'])
                                bitmline.setCurrentSublistValue({ sublistId: 'expense', fieldId: 'taxcode', value: datavalue[b]['taxcode'] });

                                bitmline.setCurrentSublistValue({ sublistId: 'item', fieldId: 'location', value: datavalue[b]['lineloc'] });
                            }
                            bitmline.commitLine({ sublistId: 'item'});

                            fileData.push(billTanId+","+billOldItemName+","+ billNewItemName+",,Success");
                           
                        }
                    }
                } 
                var billUpdatedRec =  billobjRec.save({ ignoreMandatoryFields: true });   
                
            }
            if(datavalue['type'] == 'JOURNAL'){

                log.debug("journal id: "+datakey);

                var lookupField = search.lookupFields({
                    type: "transaction",
                    id: datakey,
                    columns: 'recordtype'
                  });

                var jrnlobjRec = record.load({ 
                    type: lookupField.recordtype, 
                    id: datakey,
                    isDynamic: true,
                });

                var jrnTranId = getTransactionId(jrnlobjRec);
                transactionNo = jrnTranId;
                var jrnNewAcc = "";
                var jrnOldAcc = "";
                var oldDep = "";
                // var lineNo = "";

                for(var j in datavalue){
                    if(j !='type'){

                        var lineNo = jrnlobjRec.findSublistLineWithValue({
                            sublistId: 'line',
                            fieldId: 'lineuniquekey',
                            value: datavalue[j]['lineno']
                        });

                        var jrnlline = jrnlobjRec.selectLine({ sublistId: 'line', line: lineNo});

                        jrnOldAcc = jrnlline.getCurrentSublistText({ sublistId: 'line', fieldId: 'account'});
                        oldDep = jrnlline.getCurrentSublistValue({ sublistId: 'line', fieldId: 'department'});

                        if(datavalue[j]['newAcc']!=null){

                            jrnlline.setCurrentSublistValue({ sublistId: 'line', fieldId: 'account', value: datavalue[j]['newAcc'] });

                            jrnNewAcc = getAccountText(datavalue[j]['newAcc']);
                            
                        }
                        jrnlline.setCurrentSublistValue({ sublistId: 'line', fieldId: 'department', value: datavalue[j]['newDept'] ? datavalue[j]['newDept'] : oldDep });
                        
                        if(datavalue[j]['lineloc']!=null){
                            jrnlline.setCurrentSublistValue({ sublistId: 'line', fieldId: 'location', value: datavalue[j]['lineloc'] });
                        }

                        if(datavalue[j]['lineMemo']){
                            jrnlline.setCurrentSublistValue({ sublistId: 'line', fieldId: 'memo', value: datavalue[j]['lineMemo'] });
                        }
                        
                        jrnlline.commitLine({ sublistId: 'line'});

                        fileData.push(jrnTranId+","+jrnOldAcc+","+jrnNewAcc+",,Success");
                    }
                }

                jrnlobjRec.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });

            }

        } catch (e) {
            log.debug("fileData in catch: ",fileData);
            if(fileData.length>0){
                fileData[fileData.length - 1] = transactionNo+",,,"+e.message+",Failed";
            }else{
                fileData.push(transactionNo+",,,"+e.message+",Failed");
            }
            
            log.error("ERROR IN MR", e);
        }

        finally{
            log.debug("fileData",fileData);
            context.write(fileData.length, fileData);
        }

    }

    function summarize(summary) {
        var folderId = runtime.getCurrentScript().getParameter({ name: 'custscript_folder_id' });
        var recepient = runtime.getCurrentScript().getParameter({ name: 'custscript_userid' });

        var processedFile = file.create({
                name: 'Processed_Recods.CSV',
                contents: 'Transaction_Number, Old_Account_Item, New_Account_Item, Error, Status\n', 
                folder: folderId,
                fileType: 'CSV'
        });

        summary.output.iterator().each(function(key, value) {
            var lineData = JSON.parse(value);

            for (var lineIndex = 0; lineIndex < lineData.length; lineIndex++) {
                var element = lineData[lineIndex];
                processedFile.appendLine({
                    value: element
                }); 
            }
            return true;
        });

        // var savedCSVfile = processedFile.save();

        var mailbody = ' Hello, </br> Please find the attached file of processed records. </b></b> Regards,'
        // log.debug("savedCSVfile", savedCSVfile);

        email.send({
            author: 1518019,
            body: mailbody,
            recipients: recepient,
            subject: "Account Reassignment Tool Status",
            attachments: [processedFile]
        });

        
    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize,
    }
});