(function (window, document, undefined) {
    "use strict";
    
    angular.module('demo').constant('widgets', [
		{
			"widget": "wgAccordion",
			"label": "Accordion",
			"controller": "AccordionController",
			"defaultPath": "accordion/accordionOverview",
			"subPages": [
				{ "label": "Overview", "path": "accordion/accordionOverview" },
				{ "label": "Default", "path": "accordion/accordionDefault" },
				{ "label": "Multiple", "path": "accordion/accordionMultiple" },
				{ "label": "Events", "path": "accordion/accordionEvents" },
				{ "label": "Tab Events", "path": "accordion/accordionTabEvents" }
			],
			options : [
				{ name: 'activeIndex', type: 'Integer/Array', 'default': 0, description: 'Index of the active tab. If multiple is enabled, an array of active indexes.' },
				{ name: 'multiple', type: 'Boolean', 'default': false, description: 'Defines if multiple tabs can be active at the same time.' }
			]
		},
		{
			"widget": "wgAutocomplete",
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
			"widget" : "wgButton",
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
			"widget" : "wgDatatable",
			"label" : "Datatable",
			"controller" : "DatatableController",
			"defaultPath" : "datatable/datatableOverview",
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
				{ "label" : "Responsive", "path" : "datatable/datatableResponsive" },
				{ "label" : "Simple Restrictions", "path" : "datatable/datatableSimpleRestriction" },
				//{ "label" : "Complex Restrictions", "path" : "datatable/datatableComplexRestriction" }
			]
		},
		{
			"widget" : "wgDatalist",
			"label" : "Datalist",
			"controller" : "DatalistController",
			"defaultPath" : "datalist/datalistOverview",
			"subPages" : [ 
				{ "label" : "Overview", "path" : "datalist/datalistOverview" }, 
				{ "label" : "Default", "path" : "datalist/datalistDefault" }, 
				{ "label" : "Empty Message", "path" : "datalist/datalistEmptyMessage" },
				{ "label" : "Custom content", "path" : "datalist/datalistCustomContent" },
				{ "label" : "Selection", "path" : "datalist/datalistSelection" },
				{ "label" : "Paginator", "path" : "datalist/datalistPaginator" },
				{ "label" : "Facets", "path" : "datalist/datalistFacets" },
				{ "label" : "HttpDataSource", "path" : "datalist/datalistHttpDataSource" },
				{ "label" : "Simple Restrictions", "path" : "datalist/datalistSimpleRestriction" },
			]
		},
		{
			"widget": "wgDialog",
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
			"widget": "wgEditor",
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
			"widget": "wgGrowl",
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
			"widget": "wgFieldset",
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
			"widget": "wgInputCheckbox",
			"label": "InputCheckbox",
			"controller": "InputCheckboxController",
			"defaultPath": "inputCheckbox/inputCheckboxOverview",
			"subPages": [
				{ "label": "Overview", "path": "inputCheckbox/inputCheckboxOverview" },				
				{ "label": "Default", "path": "inputCheckbox/inputCheckboxDefault" },
				{ "label": "Disabled", "path": "inputCheckbox/inputCheckboxDisabled" },
				{ "label": "Events", "path": "inputCheckbox/inputCheckboxEvents" }			
		     ]
		},
		{
			"widget": "wgInputNumber",
			"label": "InputNumber",
			"controller": "InputNumberController",
			"defaultPath": "inputNumber/inputNumberOverview",
			"subPages": [
				{ "label": "Overview", "path": "inputNumber/inputNumberOverview" },
		        { "label": "Default", "path": "inputNumber/inputNumberDefault" }
			]
		},
		{
			"widget": "wgInputRadio",
			"label": "InputRadio",
			"controller": "InputRadioController",
			"defaultPath": "inputRadio/inputRadioOverview",
			"subPages": [
				{ "label": "Overview", "path": "inputRadio/inputRadioOverview" },
				{ "label": "Default", "path": "inputRadio/inputRadioDefault" },
				{ "label": "SelectOneRadio", "path": "inputRadio/inputRadioSelectOneRadio" },
				{ "label": "Layouts", "path": "inputRadio/inputRadioLayouts" },
				{ "label": "Disabled", "path": "inputRadio/inputRadioDisabled" }
		     ]
		},
		{
			"widget": "wgInputText",
			"label": "InputText",
			"controller": "InputTextController",
			"defaultPath": "inputText/inputTextOverview",
			"subPages": [
				{ "label": "Overview", "path": "inputText/inputTextOverview" },
				{ "label": "Default", "path": "inputText/inputTextDefault" },
				{ "label": "Disabled", "path": "inputText/inputTextDisabled" },
				{ "label": "Visible", "path": "inputText/inputTextVisible" },
				{ "label": "Events", "path": "inputText/inputTextEvents" }
			]
		},
		/*		{
		"widget": "wgDropdown",
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
			"widget": "wgMessages",
			"label": "Messages",
			"controller": "MessagesController",
			"defaultPath": "messages/messagesOverview",
			"subPages": [
				{ "label": "Overview", "path": "messages/messagesOverview" },
				{ "label": "Default", "path": "messages/messagesDefault" }
			]
		},		
		{
			"widget": "wgPanel",
			"label": "Panel",
			"controller": "PanelController",
			"defaultPath": "panel/panelOverview",
			"subPages": [
				{ "label": "Overview", "path": "panel/panelOverview" },
				{ "label": "Default", "path": "panel/panelDefault" },
				{ "label": "Options", "path": "panel/panelOptions" },
				{ "label": "Programmatic Toggle", "path": "panel/panelProgtoggle" },
				{ "label": "Dynamic Title", "path": "panel/panelTitle" },
				{ "label": "Callback", "path": "panel/panelCallback" }
			]
		}, 
		{
			"widget": "wgTabview",
			"label": "TabView",
			"controller": "TabviewController",
			"defaultPath": "tabview/tabviewOverview",
			"subPages": [
				{ "label": "Overview", "path": "tabview/tabviewOverview" },
				{ "label": "Default", "path": "tabview/tabviewDefault" },
				{ "label": "Closeable", "path": "tabview/tabviewCloseable" },
				{ "label": "Left Orientation", "path": "tabview/tabviewLeft" },
				{ "label": "Callback", "path": "tabview/tabviewCallback" },
				{ "label": "Dynamic", "path": "tabview/tabviewDynamic" },
				{ "label": "Programmatic Index Change", "path": "tabview/tabviewProgrammatic" }
			]
		}
	]);

}(window, document));
