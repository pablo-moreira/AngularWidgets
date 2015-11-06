(function (window, document, undefined) {
    "use strict";
    
    angular.module('demo').constant('widgets', [
		{
			"widget": "puiAutocomplete",
			"label": "Autocomplete",
			"controller": "AutocompleteController",
			"defaultPath": "autocomplete/autocompleteOverview",
			"subPages": [
				{ "label": "Overview", "path": "autocomplete/autocompleteOverview" },
		        { "label": "Default", "path": "autocomplete/autocompleteDefault" },
		        { "label": "Dropdown", "path": "autocomplete/autocompleteDropdown" },
		        { "label": "Function", "path": "autocomplete/autocompleteFunction" },
				{ "label": "Disabled", "path": "autocomplete/autocompleteDisabled" },
				{ "label": "Multiple", "path": "autocomplete/autocompleteMultiple" },
				{ "label": "Force selection", "path": "autocomplete/autocompleteLimited" },
				{ "label": "Callback", "path": "autocomplete/autocompleteCallback" },
				{ "label": "Object", "path": "autocomplete/autocompleteObject" },
				{ "label": "Http Data Source", "path": "autocomplete/autocompleteHttpDataSource" },
				{ "label": "Custom Content", "path": "autocomplete/autocompleteCustomContent" },
				{ "label": "Table Content", "path": "autocomplete/autocompleteTableContent" }
			]
		},
		{
			"widget" : "puiButton",
			"label" : "Button",
			"controller" : "ButtonController",
			"defaultPath" : "button/overview",
			"subPages" : [
				{ "label": "Overview", "path": "button/buttonOverview" },
				{ "label": "Default", "path": "button/buttonDefault" },
				{ "label": "Disabled", "path": "button/buttonDisabled" },
				{ "label": "Icons", "path": "button/buttonIcons" },
				{ "label": "Dynamic Text", "path": "button/buttonTitle" },
				{ "label": "Visible", "path": "button/buttonVisible" }
			]
		},
		{
			"widget" : "puiDatatable",
			"label" : "Datatable",
			"controller" : "DatatableController",
			"defaultPath" : "datatable/overview",
			"subPages" : [ 
				{ "label" : "Overview", "path" : "datatable/datatableOverview" }, 
				{ "label" : "Default", "path" : "datatable/datatableDefault" }, 
				{ "label" : "Columns", "path" : "datatable/datatableColumns" }, 
				{ "label" : "Empty Message", "path" : "datatable/datatableEmptyMessage" },
				{ "label" : "Sort and Selection", "path" : "datatable/datatableSortSelection"}, 
				{ "label" : "Paginator", "path" : "datatable/datatablePaginator" }, 
				{ "label" : "Captions", "path" : "datatable/datatableCaptions" }, 
				{ "label" : "Facets", "path" : "datatable/datatableFacets" }, 
				{ "label" : "Multiselect", "path" : "datatable/datatableMultiSelection" }, 
				{ "label" : "ProgPagination", "path" : "datatable/datatableProgPagination" }, 
				{ "label" : "HttpDataSource", "path" : "datatable/datatableHttpDataSource" },  
				{ "label" : "Custom Column", "path" : "datatable/datatableCustomColumn" },
				{ "label" : "Responsive", "path" : "datatable/datatableResponsive" }
			]
		},
		{
			"widget": "puiDialog",
			"label": "Dialog",
			"controller": "DialogController",
			"defaultPath": "dialog/dialogOverview",
			"subPages": [
				{ "label": "Overview", "path": "dialog/dialogOverview" },
		        { "label": "Default", "path": "dialog/dialogDefault" },
				{ "label": "Confirm Dialog", "path": "dialog/dialogConfirmDialog" },
				{ "label": "Service", "path": "dialog/dialogService" }
			]
		},
		{
			"widget": "puiEditor",
			"label": "Editor",
			"controller": "EditorController",
			"defaultPath": "editor/editorOverview",
			"subPages": [
				{ "label": "Overview", "path": "editor/editorOverview" },
		        { "label": "Default", "path": "editor/editorDefault" },
		        { "label": "Disabled", "path": "editor/editorDisabled" }
			]
		},
		{
			"widget": "puiGrowl",
			"label": "Growl",
			"controller": "GrowlController",
			"defaultPath": "growl/growlOverview",
			"subPages": [
				{ "label": "Overview", "path": "growl/growlOverview" },
				{ "label": "Default", "path": "growl/growlDefault" },
				{ "label": "Options", "path": "growl/growlOptions" }
			]
		},
		{
			"widget": "puiInputNumber",
			"label": "InputNumber",
			"controller": "InputNumberController",
			"defaultPath": "inputNumber/inputNumberOverview",
			"subPages": [
				{ "label": "Overview", "path": "inputNumber/inputNumberOverview" },
		        { "label": "Default", "path": "inputNumber/inputNumberDefault" }
			]
		},
		{
			"widget": "puiFieldset",
			"label": "Fieldset",
			"controller": "FieldsetController",
			"defaultPath": "fieldset/fieldsetOverview",
			"subPages": [
				{ "label": "Overview", "path": "fieldset/fieldsetOverview" },
				{ "label": "Default", "path": "fieldset/fieldsetDefault" },
				{ "label": "Toggle", "path": "fieldset/fieldsetToggle" },
				{ "label": "Prog Collapse", "path": "fieldset/fieldsetProgCollapse" },
				{ "label": "Callback", "path": "fieldset/fieldsetCallback" },
				{ "label": "Dynamic Legend", "path": "fieldset/fieldsetLegend" }
		     ]
		},
		{
			"widget": "InputRadio",
			"label": "InputRadio",
			"controller": "InputRadioController",
			"defaultPath": "inputRadio/inputRadioOverview",
			"subPages": [
				{ "label": "Overview", "path": "inputRadio/inputRadioOverview" },
				{ "label": "Default", "path": "inputRadio/inputRadioDefault" }
		     ]
		 },
/*		{
			"widget": "puiDropdown",
			"label": "Dropdown",
			"controller": "DropdownController",
			"defaultPath": "dropdown/dropdownOverview",
			"subPages": [
				{ "label": "Overview", "path": "dropdown/dropdownOverview" },
		        { "label": "Default", "path": "dropdown/dropdownDefault" },
		        { "label": "Dropdown", "path": "dropdown/dropdownDropdown" },
		        { "label": "Function", "path": "dropdown/dropdownFunction" },
				{ "label": "Disabled", "path": "dropdown/dropdownDisabled" },
				{ "label": "Multiple", "path": "dropdown/dropdownMultiple" },
				{ "label": "Force selection", "path": "dropdown/dropdownLimited" },
				{ "label": "Callback", "path": "dropdown/dropdownCallback" },
				{ "label": "Object", "path": "dropdown/dropdownObject" },
				{ "label": "Http Data Loader", "path": "dropdown/dropdownHttpDataSource" },
				{ "label": "Custom Content", "path": "dropdown/dropdownCustomContent" },
				{ "label": "Table Content", "path": "dropdown/dropdownTableContent" }
			]
		},*/ 
 {
     "widget": "puiInputText",
     "label": "InputText",
     "controller": "InputController",
     "defaultPath": "inputText/overview",
     "subPages": [
         {
             "label": "overview",
             "path": "inputText/overview"
         },
         {
             "label": "default",
             "path": "inputText/default"
         },
         {
             "label": "disabled",
             "path": "inputText/disabled"
         },
         {
             "label": "visible",
             "path": "inputText/visible"
         }        ]
 },
 {
     "widget": "puiPanel",
     "label": "Panel",
     "controller": "PanelController",
     "defaultPath": "panel/overview",
     "subPages": [
         {
             "label": "overview",
             "path": "panel/overview"
         },
         {
             "label": "default",
             "path": "panel/default"
         },
         {
             "label": "options",
             "path": "panel/options"
         },
         {
             "label": "programmatic toggle",
             "path": "panel/progtoggle"
         },
         {
             "label": "dynamic title",
             "path": "panel/title"
         },
         {
             "label": "Callback",
             "path": "panel/callback"
         }
     ]
 }, 
 {
     "widget": "puiTabview",
     "label": "TabView",
     "controller": "TabviewController",
     "defaultPath": "tabview/overview",
     "subPages": [
         {
             "label": "Overview",
             "path": "tabview/overview"
         },
         {
             "label": "Default",
             "path": "tabview/default"
         },
         {
             "label": "Closeable",
             "path": "tabview/closeable"
         },
         {
             "label": "Left Orientation",
             "path": "tabview/left"
         },
         {
             "label": "Callback",
             "path": "tabview/callback"
         },
         {
             "label": "Dynamic",
             "path": "tabview/dynamic"
         },
         {
             "label": "Programmatic Index Change",
             "path": "tabview/programmatic"
         }
     ]
 }                                                
	]);

}(window, document));