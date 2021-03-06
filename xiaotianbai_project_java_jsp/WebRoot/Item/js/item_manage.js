﻿var item_manage_tool = null; 
$(function () { 
	initItemManageTool(); //建立ItemManageObj
	item_manage_tool.init(); //如果需要通过下拉框Search，首先Initialize下拉框的值
	$("#item_manage").datagrid({
		url : 'Item/list',
		fit : true,
		fitColumns : true,
		striped : true,
		rownumbers : true,
		border : false,
		pagination : true,
		pageSize : 5,
		pageList : [5, 10, 15, 20, 25],
		pageNumber : 1,
		sortName : "itemId",
		sortOrder : "desc",
		toolbar : "#item_manage_tool",
		columns : [[
			{
				field : "itemClassObj",
				title : "ItemClass",
				width : 140,
			},
			{
				field : "pTitle",
				title : "Item Title",
				width : 140,
			},
			{
				field : "itemPhoto",
				title : "ItemPhoto",
				width : "70px",
				height: "65px",
				formatter: function(val,row) {
					return "<img src='" + val + "' width='65px' height='55px' />";
				}
 			},
			{
				field : "userObj",
				title : "Poster",
				width : 140,
			},
			{
				field : "startPrice",
				title : "StartPrice",
				width : 70,
			},
			{
				field : "startTime",
				title : "Start Time",
				width : 140,
			},
			{
				field : "endTime",
				title : "EndTime",
				width : 140,
			},
		]],
	});

	$("#itemEditDiv").dialog({
		title : "EditManage",
		top: "50px",
		width : 700,
		height : 515,
		modal : true,
		closed : true,
		iconCls : "icon-edit-new",
		buttons : [{
			text : "Upload",
			iconCls : "icon-edit-new",
			handler : function () {
				if ($("#itemEditForm").form("validate")) {
					//Validate表单 
					if(!$("#itemEditForm").form("validate")) {
						$.messager.alert("Warning","你Input的Info还有错误！","warning");
					} else {
						$("#itemEditForm").form({
						    url:"Item/" + $("#item_itemId_edit").val() + "/update",
						    onSubmit: function(){
								if($("#itemEditForm").form("validate"))  {
				                	$.messager.progress({
										text : "Uploading...",
									});
				                	return true;
				                } else { 
				                    return false; 
				                }
						    },
						    success:function(data){
						    	$.messager.progress("close");
						    	console.log(data);
			                	var obj = jQuery.parseJSON(data);
			                    if(obj.success){
			                        $.messager.alert("Message","InfoEditSuccessful！");
			                        $("#itemEditDiv").dialog("close");
			                        item_manage_tool.reload();
			                    }else{
			                        $.messager.alert("Message",obj.message);
			                    } 
						    }
						});
						//Upload表单
						$("#itemEditForm").submit();
					}
				}
			},
		},{
			text : "Cancel",
			iconCls : "icon-redo",
			handler : function () {
				$("#itemEditDiv").dialog("close");
				$("#itemEditForm").form("reset"); 
			},
		}],
	});
});

function initItemManageTool() {
	item_manage_tool = {
		init: function() {
			$.ajax({
				url : "ItemClass/listAll",
				type : "post",
				success : function (data, response, status) {
					$("#itemClassObj_classId_query").combobox({ 
					    valueField:"classId",
					    textField:"className",
					    panelHeight: "200px",
				        editable: false, //不允许手动Input 
					});
					data.splice(0,0,{classId:0,className:"No limits"});
					$("#itemClassObj_classId_query").combobox("loadData",data); 
				}
			});
			$.ajax({
				url : "UserInfo/listAll",
				type : "post",
				success : function (data, response, status) {
					$("#userObj_user_name_query").combobox({ 
					    valueField:"user_name",
					    textField:"name",
					    panelHeight: "200px",
				        editable: false, //不允许手动Input 
					});
					data.splice(0,0,{user_name:"",name:"No limits"});
					$("#userObj_user_name_query").combobox("loadData",data); 
				}
			});
		},
		reload : function () {
			$("#item_manage").datagrid("reload");
		},
		redo : function () {
			$("#item_manage").datagrid("unselectAll");
		},
		search: function() {
			var queryParams = $("#item_manage").datagrid("options").queryParams;
			queryParams["itemClassObj.classId"] = $("#itemClassObj_classId_query").combobox("getValue");
			queryParams["pTitle"] = $("#pTitle").val();
			queryParams["userObj.user_name"] = $("#userObj_user_name_query").combobox("getValue");
			queryParams["startTime"] = $("#startTime").datebox("getValue"); 
			$("#item_manage").datagrid("options").queryParams=queryParams; 
			$("#item_manage").datagrid("load");
		},
		exportExcel: function() {
			$("#itemQueryForm").form({
			    url:"Item/OutToExcel",
			});
			//Upload表单
			$("#itemQueryForm").submit();
		},
		remove : function () {
			var rows = $("#item_manage").datagrid("getSelections");
			if (rows.length > 0) {
				$.messager.confirm("Confirm", "Delete the selected entry?", function (flag) {
					if (flag) {
						var itemIds = [];
						for (var i = 0; i < rows.length; i ++) {
							itemIds.push(rows[i].itemId);
						}
						$.ajax({
							type : "POST",
							url : "Item/deletes",
							data : {
								itemIds : itemIds.join(","),
							},
							beforeSend : function () {
								$("#item_manage").datagrid("loading");
							},
							success : function (data) {
								if (data.success) {
									$("#item_manage").datagrid("loaded");
									$("#item_manage").datagrid("load");
									$("#item_manage").datagrid("unselectAll");
									$.messager.show({
										title : "Tips",
										msg : data.message
									});
								} else {
									$("#item_manage").datagrid("loaded");
									$("#item_manage").datagrid("load");
									$("#item_manage").datagrid("unselectAll");
									$.messager.alert("Message",data.message);
								}
							},
						});
					}
				});
			} else {
				$.messager.alert("Tips", "Choose the entry you want to delete！", "info");
			}
		},
		edit : function () {
			var rows = $("#item_manage").datagrid("getSelections");
			if (rows.length > 1) {
				$.messager.alert("Warning！", "EditRecord只能选定One数据！", "warning");
			} else if (rows.length == 1) {
				$.ajax({
					url : "Item/" + rows[0].itemId +  "/update",
					type : "get",
					data : {
						//itemId : rows[0].itemId,
					},
					beforeSend : function () {
						$.messager.progress({
							text : "正在Get中...",
						});
					},
					success : function (item, response, status) {
						$.messager.progress("close");
						if (item) { 
							$("#itemEditDiv").dialog("open");
							$("#item_itemId_edit").val(item.itemId);
							$("#item_itemId_edit").validatebox({
								required : true,
								missingMessage : "Input Itemid",
								editable: false
							});
							$("#item_itemClassObj_classId_edit").combobox({
								url:"ItemClass/listAll",
							    valueField:"classId",
							    textField:"className",
							    panelHeight: "auto",
						        editable: false, //不允许手动Input 
						        onLoadSuccess: function () { //数据加载完毕事件
									$("#item_itemClassObj_classId_edit").combobox("select", item.itemClassObjPri);
									//var data = $("#item_itemClassObj_classId_edit").combobox("getData"); 
						            //if (data.length > 0) {
						                //$("#item_itemClassObj_classId_edit").combobox("select", data[0].classId);
						            //}
								}
							});
							$("#item_pTitle_edit").val(item.pTitle);
							$("#item_pTitle_edit").validatebox({
								required : true,
								missingMessage : "Input Item Title",
							});
							$("#item_itemPhoto").val(item.itemPhoto);
							$("#item_itemPhotoImg").attr("src", item.itemPhoto);
							$("#item_itemDesc_edit").val(item.itemDesc);
							$("#item_itemDesc_edit").validatebox({
								required : true,
								missingMessage : "Input ItemDescription",
							});
							$("#item_userObj_user_name_edit").combobox({
								url:"UserInfo/listAll",
							    valueField:"user_name",
							    textField:"name",
							    panelHeight: "auto",
						        editable: false, //不允许手动Input 
						        onLoadSuccess: function () { //数据加载完毕事件
									$("#item_userObj_user_name_edit").combobox("select", item.userObjPri);
									//var data = $("#item_userObj_user_name_edit").combobox("getData"); 
						            //if (data.length > 0) {
						                //$("#item_userObj_user_name_edit").combobox("select", data[0].user_name);
						            //}
								}
							});
							$("#item_startPrice_edit").val(item.startPrice);
							$("#item_startPrice_edit").validatebox({
								required : true,
								validType : "number",
								missingMessage : "Input StartPrice",
								invalidMessage : "StartPriceInputIncorrect",
							});
							$("#item_startTime_edit").datetimebox({
								value: item.startTime,
							    required: true,
							    showSeconds: true,
							});
							$("#item_endTime_edit").datetimebox({
								value: item.endTime,
							    required: true,
							    showSeconds: true,
							});
						} else {
							$.messager.alert("GetFailed！", "Unkown failure, please retry!", "warning");
						}
					}
				});
			} else if (rows.length == 0) {
				$.messager.alert("Warning！", "Edit One Entry at a Time！", "warning");
			}
		},
	};
}
