/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define(['N/url', 'N/redirect', 'N/record', 'N/search', 'N/file', 'N/ui/serverWidget','N/query','N/format','N/runtime'],
function(url,redirect, record, search, file, ui,query,format,runtime) 
{
	function onRequest(context) 
	{	
		var userobj = runtime.getCurrentUser();      
 	    var userid=userobj.id;

       var params = context.request.parameters;
       if (context.request.method == 'POST'){
    	   var action=params.custpage_action;
    	   var vend_cntry=params.custpage_country;
    	   log.debug('action',action);
    	   

    	   if(action=='showform'){
		    	 var sql='select subsidiary,department,location,currency from employee where id='+userid;
        		 var result = query.runSuiteQL({ query: sql }).asMappedResults();

               var form = ui.createForm({ title: 'Purchase Request Form'});
               form.clientScriptModulePath = 'SuiteScripts/GS_PurchaseRequestFrom_CS.js';
               form.addSubmitButton({label:'Submit'});
                form.addFieldGroup({
              	    id : 'custpage_primary_info',
              	    label : 'Primary Information'
              	});
                 var fieldgroup_bank_detail = form.addFieldGroup({
             	    id : 'custpage_items',
             	    label : 'Items'
             	});
                 var action_fld = form.addField({id: 'custpage_action',type: ui.FieldType.TEXT,label: 'Action'}).updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN});
		           var userid_fld = form.addField({id: 'custpage_user_id',container : 'custpage_primary_info',type: ui.FieldType.SELECT,label: 'Requester',source:'employee'}).updateDisplayType({displayType: ui.FieldDisplayType.DISABLED});
		           var vendor_fld = form.addField({id: 'custpage_vendor',container : 'custpage_primary_info',type: ui.FieldType.SELECT,label:'Vendor'});
		           var subs_fld = form.addField({id: 'custpage_subsidiary',container : 'custpage_primary_info',type: ui.FieldType.SELECT,label: 'Subsidiary'}).updateDisplayType({displayType: ui.FieldDisplayType.DISABLED});
		           var startdate_fld = form.addField({id: 'custpage_startdate',container : 'custpage_primary_info',type: ui.FieldType.DATE,label: 'Start Date'});
		           var end_date_fld = form.addField({id: 'custpage_enddate',container : 'custpage_primary_info',type: ui.FieldType.DATE,label: 'End Date'}); //updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN});
		           var memo_fld = form.addField({id: 'custpage_memo',container : 'custpage_primary_info',type: ui.FieldType.TEXT,label: 'Internal Memo'});
		           var currency_fld = form.addField({id: 'custpage_currency',container : 'custpage_primary_info',type: ui.FieldType.SELECT,label: 'currency',source:'currency'}).updateDisplayType({displayType: ui.FieldDisplayType.DISABLED});
		           var total_fld = form.addField({id: 'custpage_total',container : 'custpage_primary_info',type: ui.FieldType.TEXT,label: 'Total Amount'}).updateDisplayType({displayType: ui.FieldDisplayType.DISABLED});
				   var total_curr_total = form.addField({id: 'custpage_curr_total',container : 'custpage_primary_info',type: ui.FieldType.TEXT,label: 'TOTAL AMOUNT ($USD) ESTIMATED'}).updateDisplayType({displayType: ui.FieldDisplayType.DISABLED});
		           var inv_fld = form.addField({id: 'custpage_invoice_count',container : 'custpage_primary_info',type: ui.FieldType.INTEGER,label: 'Estimated Number of Invoices'});
		           var dep_fld = form.addField({id: 'custpage_department',container : 'custpage_primary_info',type: ui.FieldType.SELECT,label: 'Department'});
		           var loc_fld = form.addField({id: 'custpage_location',container : 'custpage_primary_info',type: ui.FieldType.SELECT,label: 'Location',source:'location'});
		           var proj_fld = form.addField({id: 'custpage_project',container : 'custpage_primary_info',type: ui.FieldType.SELECT,label: 'Client Project: SOW#'});
				   var vdrInvNo = form.addField({id: 'custpage_vdr_inv_no',container : 'custpage_primary_info',type: ui.FieldType.TEXT,label: 'Vendor Invoice Number *'});
				   var file_fld=form.addField({id: 'custpage_file',type: ui.FieldType.FILE,label: 'Attachment *'});
				   var data_fld=form.addField({id: 'custpage_itemdata',type: ui.FieldType.LONGTEXT,label: 'itemdata'}).updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN});
		           
		           
		           
		           form.addTab({
						id : 'custpage_main_tab',
						label : 'Items'
					});
		           form.addSubtab({
						id : 'custpage_items',
						label : 'Items',
						tab : 'custpage_main_tab'
					}); 
					var item_sublist = form.addSublist({
						id : 'custpage_item_list',
						type : ui.SublistType.INLINEEDITOR,
						label : 'Items',
						tab : 'custpage_items'
					});
					
					var item_fld = item_sublist.addField({
						id: 'custpage_item_id',
						type: ui.FieldType.SELECT,
						label: 'Item'
					});
					var descr_fld=item_sublist.addField({
						id: 'custpage_line_descrption',
						type: ui.FieldType.TEXTAREA,
						label: 'Description'
					});

					var qty_fld=item_sublist.addField({
						id: 'custpage_qty',
						type: ui.FieldType.INTEGER,
						label: 'Quantity'
					});
					var rate_fld=item_sublist.addField({
						id: 'custpage_unit_rate',
						type: ui.FieldType.CURRENCY,
						label: 'Unit Rate'
					});
					var amount_fld=item_sublist.addField({
						id: 'custpage_amount',
						type: ui.FieldType.CURRENCY,
						label: 'Amount'
					}).updateDisplayType({displayType: ui.FieldDisplayType.DISABLED});

    	 	
			var sql_dept="select id,name from department where isinactive='F' and id<>30 and id <>45 order by name";
    	    var result_dept = query.runSuiteQL({ query: sql_dept }).asMappedResults();
    	 		   		 
    	    dep_fld.addSelectOption({
    	 			               value: '',
    	 			               text: ''
    	 			           });

    	 		   		 for (var i in result_dept){
    	 		   			dep_fld.addSelectOption({
    	 		   	               value: result_dept[i].id,
    	 		   	               text: result_dept[i].name
    	 		   	           });
    	 		   		 }
			
					
						
    	 	var sql_vendor="SELECT subsidiary.currency,entity.entityid,VendorSubsidiaryRelationship.subsidiary,subsidiary.name,VendorSubsidiaryRelationship.entity,subsidiary.country \
FROM VendorSubsidiaryRelationship inner join entity  on ( entity.id = VendorSubsidiaryRelationship.entity and entity.isinactive='F' ) \
inner join subsidiary on(subsidiary.id=VendorSubsidiaryRelationship.subsidiary and subsidiary.country='"+vend_cntry+"' and subsidiary.isinactive='F' and subsidiary.iselimination='F') ORDER BY entityid";
	 		var result_vendor = query.runSuiteQL({ query: sql_vendor }).asMappedResults();
   		 
	 		var subsidiary_obj=new Object();
   		 vendor_fld.addSelectOption({
	               value: '',
	               text: ''
	           });

			   var vdrArry = [];

				for (var i in result_vendor){
					// var Vendor = result_vendor[i].entityid;
					var vendor = result_vendor[i].entityid.toString();
					var isVendor1 = vendor.indexOf("3Pillar");
					var isVendor2 = vendor.indexOf("3PILLAR");
					
					if((isVendor1 != -1 && isVendor1 == 0) || (isVendor2 != -1 && isVendor2 == 0) ){
						continue;
					}else{
						var isVdrValue = vdrArry.find((value)=>value == result_vendor[i].entity);		
						if(isVdrValue){
							log.debug("isVdrValue", isVdrValue);
							subsidiary_obj[result_vendor[i].subsidiary]=result_vendor[i].name;
						}else{
							vendor_fld.addSelectOption({
								value: result_vendor[i].entity,
								text: result_vendor[i].entityid
							});
							subsidiary_obj[result_vendor[i].subsidiary]=result_vendor[i].name;
							 vdrArry.push(result_vendor[i].entity);
						}
						
					}
				}

			log.debug("vdr array: ", vdrArry);
//			subs_fld.addSelectOption({
//	               value: '',
//	               text: ''
//	           });

   		 for (var s in subsidiary_obj){
   			subs_fld.addSelectOption({
   	               value: s,
   	               text: subsidiary_obj[s]
   	           });
   		 }
   		 
   		 
	    	 var sql_project="select id,entityid,custentity_end_date,custentity_salesforce_sow_number,custentity_sow_status,\
							BUILTIN.DF(custentity_sow_status) as sow_status,custentity_forecast_category,BUILTIN.DF(custentity_forecast_category) as forecast from job\
									 where isinactive='F' and custentity_salesforce_sow_number>0 and custentity_sow_status=3 and custentity_end_date>BUILTIN.RELATIVE_RANGES( 'LM', 'START' )\
							order by entityid,custentity_salesforce_sow_number";
			 var result_project = query.runSuiteQL({ query: sql_project }).asMappedResults();
			 
			 proj_fld.addSelectOption({
	              value: '',
	              text: ''
	          });
			 proj_fld.addSelectOption({
	              value: '316175',
	              text: '3Pillar Internal'
	          });

			 for (var i in result_project){
				 proj_fld.addSelectOption({
		               value: result_project[i].id,
		               text: result_project[i].entityid
		           });
			 }
			 
			 var sql_item="select item.id,itemid,custitem_sow_required_for_po,expenseaccount,account.subsidiary,account.custrecord_restrict_dep,BUILTIN.DF(account.custrecord_restrict_dep) as acc_dept\
			 		from item inner join account on (account.id=expenseaccount)\
			 		where custitem_available_for_po='T' and item.isinactive='F' order by itemid";
				 var result_items = query.runSuiteQL({ query: sql_item }).asMappedResults();
				 item_fld.addSelectOption({
			       value: '',
			       text: ''
			   });
				 for (var i in result_items){
					 item_fld.addSelectOption({
			            value: result_items[i].id,
			            text: result_items[i].itemid
			        });
			   }
					 
			 
				    vendor_fld.isMandatory = true;
					startdate_fld.isMandatory = true;
					end_date_fld.isMandatory = true;
					memo_fld.isMandatory = true;
					dep_fld.isMandatory = true;
					loc_fld.isMandatory = true;
					currency_fld.isMandatory = true;
					inv_fld.isMandatory = true;
					item_fld.isMandatory = true;
					descr_fld.isMandatory = true;
					rate_fld.isMandatory = true;
					qty_fld.isMandatory = true;

		           userid_fld.defaultValue=userid;
		           action_fld.defaultValue='submitform';
		           dep_fld.defaultValue=result[0].department;
		           loc_fld.defaultValue=result[0].location;
		           currency_fld.defaultValue=result_vendor[0].currency;
		           data_fld.defaultValue=JSON.stringify(result_items);

		           context.response.writePage(form);
		           return;

    	   }else if(action=='submitform'){
    		   
          		var taxcode='';
         	    var subsidiary=params.custpage_subsidiary;
        		if(subsidiary==4){taxcode='268'}// Romania
        		else if(subsidiary==2){taxcode='489'}
        		else if(subsidiary==12){taxcode='582'}//Lidersoft International, S.A - 13%
        		else if(subsidiary==11){taxcode='582'}//Isthmus de Costa Rica SRL - 13%
        		else if(subsidiary==13){taxcode='585'}//Isthmus Inc. - 13%
        		else if(subsidiary==14){taxcode='587'}//Isthmus Software LLC - 13%
        		else if(subsidiary==15){taxcode='469'}//Isthmus Software S.A. - Panama - 7%
        		else if(subsidiary==21||subsidiary==22){taxcode='568'}//TQS Technologia de Mexico S de RL de CV & TX Desarrolladores de Technologia S de RL de CV
                else if(subsidiary==25){taxcode='739'}//SDE Software Solutions, s.r.o 21%
                else if (subsidiary == 23) { taxcode = '776' }// Moldova standard rate 20%	
                else if (subsidiary == 3) { taxcode = '21' }// 3Pillar Global UK Limited
                else if (subsidiary == 45) { taxcode = '797' }// 3Pillar Global, Limitada Guatemala
                else if (subsidiary == 52) { taxcode = '1018' }// 3Pillar Global Canada
        	    else if (subsidiary == 45) { taxcode = '797' }// 3Pillar Global, Limitada Guatemala
        	    else if (subsidiary == 55) { taxcode = '489' }// 3Pillar Global, Limitada Guatemala

        	   var requesterid=params.custpage_user_id;
        	   var vendor_id=params.custpage_vendor;
        	   var start_date=params.custpage_startdate;
        	   var end_Date=params.custpage_enddate;
        	   var memo=params.custpage_memo;
        	   var currency=params.custpage_currency;
        	   var total_amount=params.custpage_total;
        	   var invoice_count=params.custpage_invoice_count;
        	   var department=params.custpage_department;
        	   var location=params.custpage_location;
        	   var client_project=params.custpage_project;
			   var bill_no=params.custpage_vdr_inv_no;
			   var currencyEstAmt=params.custpage_curr_total;
               var attachment = context.request.files["custpage_file"];
               if(attachment){
                   attachment.folder='466944';
                   var file_id=attachment.save();
               }
               
	           	var sql='select name, subsidiary.custrecord_ap_email_address as ap_id from subsidiary where subsidiary.id='+subsidiary;
	   		 var runquery = query.runSuiteQL({ query: sql });
	   		 var results = runquery.asMappedResults(); 
	   		 var account_payble='782993';
	   		 if(results.length>0){
	   			 if(results[0]['ap_id']>0){
	   				account_payble=results[0]['ap_id'];
	   			 }
	   		 }
	   		 log.debug('start_date='+start_date,'end_Date= '+end_Date);
	   		start_date=format.parse({value:start_date, type: format.Type.DATE});
	   		end_Date=format.parse({value:end_Date, type: format.Type.DATE});

//	   		 log.debug(new Date(start_date),new Date(end_Date));


    		    var pr_rec = record.create({type: 'customrecord_3pg_purchase_requset',isDynamic: true});	
			    pr_rec.setValue({fieldId: 'custrecord_requester_id',value: requesterid});
				pr_rec.setValue({fieldId: 'custrecord_pr_subsidiary',value: subsidiary});
				pr_rec.setValue({fieldId: 'custrecord_pr_vendor',value: vendor_id}); 
				pr_rec.setValue({fieldId: 'custrecord_pr_start_date',value:start_date});
				pr_rec.setValue({fieldId: 'custrecord_pr_end_date',value: end_Date});
				pr_rec.setValue({fieldId: 'custrecord_pr_po_amount',value: total_amount});
				pr_rec.setValue({fieldId: 'custrecord_pr_currency',value: currency});
				pr_rec.setValue({fieldId: 'custrecord_pr_invoice_count',value: invoice_count});
				pr_rec.setValue({fieldId: 'custrecord_pr_location',value: location});
				pr_rec.setValue({fieldId: 'custrecord_pr_department',value: department});
				pr_rec.setValue({fieldId: 'custrecord_pr_internla_project',value: client_project});
				pr_rec.setValue({fieldId: 'custrecord_pr_internal_memo',value: memo});
				pr_rec.setValue({fieldId: 'custrecord_pr_subsidiary_ap',value: account_payble});
				pr_rec.setValue({fieldId: 'custrecord_pr_attachment',value: file_id});
				pr_rec.setValue({fieldId: 'custrecord_bill_no',value: bill_no});
				pr_rec.setValue({fieldId: 'custrecord_curr_estimated_amt',value: currencyEstAmt});

                var count = context.request.getLineCount({group: 'custpage_item_list'});
                
                for (var k = 0; k < count; k++) {
                    var item = context.request.getSublistValue({group: 'custpage_item_list',name: 'custpage_item_id',line: k});
                    var line_desc = context.request.getSublistValue({group: 'custpage_item_list',name: 'custpage_line_descrption',line: k});
                    var quantity = context.request.getSublistValue({group: 'custpage_item_list',name: 'custpage_qty',line: k});
                    var rate = context.request.getSublistValue({group: 'custpage_item_list',name: 'custpage_unit_rate',line: k});

    				pr_rec.selectNewLine({sublistId: 'recmachcustrecord_pr_item_pr'});
    				pr_rec.setCurrentSublistValue({sublistId: 'recmachcustrecord_pr_item_pr', fieldId:'custrecord_pr_items_item', value:item});
    				pr_rec.setCurrentSublistValue({sublistId: 'recmachcustrecord_pr_item_pr', fieldId:'custrecord_pr_items_description', value:line_desc});
    				pr_rec.setCurrentSublistValue({sublistId: 'recmachcustrecord_pr_item_pr', fieldId:'custrecord_pr_item_qty', value:quantity});
    				pr_rec.setCurrentSublistValue({sublistId: 'recmachcustrecord_pr_item_pr', fieldId:'custrecord_pr_item_rate', value:rate});
    				pr_rec.setCurrentSublistValue({sublistId: 'recmachcustrecord_pr_item_pr', fieldId:'custrecord_pr_item_tax_code', value:taxcode});
    				pr_rec.setCurrentSublistValue({sublistId: 'recmachcustrecord_pr_item_pr', fieldId:'custrecord_pr_item_subsidiary', value:subsidiary});
    				pr_rec.commitLine({sublistId: 'recmachcustrecord_pr_item_pr'});

                }
               var pr_id=pr_rec.save({enableSourcing : true,ignoreMandatoryFields : true});

        		   redirect.toSuitelet({
        			    scriptId: '2722',
        			    deploymentId: '1',
        			    parameters: {
        			        'pr_id':pr_id
        			    },
        			    isExternal:true
        			});  

    	   }
    	   
       }else{
           var form = ui.createForm({ title: 'Purchase Request Form'});
           form.clientScriptModulePath = 'SuiteScripts/GS_PurchaseRequestFrom_CS.js';
           var sql='select entityid,employeestatus,employee.id,subsidiary.country from employee inner join subsidiary on subsidiary.id=employee.subsidiary   where employee.id='+userid
	   		 var runquery = query.runSuiteQL({ query: sql });
	   		 var results = runquery.asMappedResults();
	   		 var employee_status=results[0].results;
	   		 
	         if(employee_status=='11'||employee_status=='12'||employee_status=='13'||employee_status=='14'){
		   		 context.response.write('You do not have privilege to access the link.Please reach out to Finance team.');
		   		 return;
	         }  

           var userid_fld = form.addField({id: 'custpage_user_id',container : 'custpage_primary_info',type: ui.FieldType.SELECT,label: 'Requester',source:'employee'}).updateDisplayType({displayType: ui.FieldDisplayType.INLINE});

//           var email_fld = form.addField({id: 'custpage_user_email',type: ui.FieldType.TEXT,label: 'Requester Email'});//.updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN});
//           var employee_id_fld = form.addField({id: 'custpage_user_id',type: ui.FieldType.TEXT,label: 'Requester ID'}).updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN});
           var country_fld = form.addField({id: 'custpage_country',type: ui.FieldType.SELECT,label: 'PO Country'});
//           var accesscode_fld = form.addField({id: 'custpage_otp',type: ui.FieldType.PASSWORD,label: 'Access Code'});
           var action_fld = form.addField({id: 'custpage_action',type: ui.FieldType.TEXT,label: 'Action'}).updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN});

           country_fld.addSelectOption({
               value: '',
               text: ''
           });
           
	    	 var sql_country="select subsidiary.country as countrycode,BUILTIN.DF(country) as countryname,count(*) from subsidiary  where isinactive='F' group by subsidiary.country,BUILTIN.DF(country) order by countryname";
    		 var result_country = query.runSuiteQL({ query: sql_country }).asMappedResults();
    		 
    		 for (var i in result_country){
    	           country_fld.addSelectOption({
    	               value: result_country[i].countrycode,
    	               text: result_country[i].countryname
    	           });

    		 }

//           email_fld.isMandatory=true;
//           accesscode_fld.isMandatory=true;
           country_fld.isMandatory=true;

           action_fld.defaultValue='showform';
           country_fld.defaultValue=results[0].country;
           userid_fld.defaultValue=userid;
           userid_fld.updateLayoutType({layoutType : ui.FieldLayoutType.OUTSIDE});
           userid_fld.updateBreakType({breakType: ui.FieldBreakType.STARTROW}); 
           country_fld.updateLayoutType({layoutType : ui.FieldLayoutType.OUTSIDE});
           country_fld.updateBreakType({breakType: ui.FieldBreakType.STARTROW}); 

//           email_fld.updateBreakType({breakType: ui.FieldBreakType.STARTROW}); 
//           accesscode_fld.updateLayoutType({layoutType : ui.FieldLayoutType.OUTSIDEBELOW});
//           country_fld.updateLayoutType({layoutType : ui.FieldLayoutType.OUTSIDEBELOW});

           form.addSubmitButton({label:'Proceed'});
//           form.addButton({
//               id           : 'custpage_generate_access_code', 
//               label        : 'Generate Access Code', 
//               functionName : 'generate_access_code()'
//           })   
           context.response.writePage(form);
  
       }
       
	}
	
	return {
		 onRequest: onRequest 
		};
	});