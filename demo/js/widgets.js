(function (window, document, undefined) {
    "use strict";
    
    angular.module('demo').constant('widgets', [
		{
			"widget": "puiAutocomplete",
			"label": "Autocomplete",
			"controller": "AutocompleteController",
			"defaultPath": "autocomplete/autocompleteOverview",
			"subPages": [
			     {
		             "label": "Overview",
		             "path": "autocomplete/autocompleteOverview"
		         },
		         {
		             "label": "Default",
		             "path": "autocomplete/autocompleteDefault"
		         },
		         {
		             "label": "Dropdown",
		             "path": "autocomplete/autocompleteDropdown"
		         },
		         {
		             "label": "Function",
		             "path": "autocomplete/autocompleteFunction"
		         },
		         {
		             "label": "Disabled",
		             "path": "autocomplete/autocompleteDisabled"
		         },
		         {
		             "label": "Multiple",
		             "path": "autocomplete/autocompleteMultiple"
		         },
		         {
		             "label": "Force selection",
		             "path": "autocomplete/autocompleteLimited"
		         },
		         {
		             "label": "Callback",
		             "path": "autocomplete/autocompleteCallback"
		         },
		         {
		             "label": "Object",
		             "path": "autocomplete/autocompleteObject"
		         },
		         {
		             "label": "Custom Content",
		             "path": "autocomplete/autocompleteCustomContent"
		         },
		         {
		             "label": "Http Data Loader",
		             "path": "autocomplete/autocompleteHttpDataLoader"
		         }		
		     ]
		 },
 {
     "widget": "puiButton",
     "label": "Button",
     "controller": "ButtonController",
     "defaultPath": "button/overview",
     "subPages": [
         {
             "label": "Overview",
             "path": "button/buttonOverview"
         },
         {
             "label": "Default",
             "path": "button/buttonDefault"
         },
         {
             "label": "Disabled",
             "path": "button/buttonDisabled"
         },
         {
             "label": "Icons",
             "path": "button/buttonIcons"
         },
         {
             "label": "Dynamic Text",
             "path": "button/buttonTitle"
         },
         {
             "label": "Visible",
             "path": "button/buttonVisible"
         }
     ]
 },
 {
     "widget": "puiDatatable",
     "label": "Datatable",
     "controller": "DatatableController",
     "defaultPath": "datatable/overview",
     "subPages": [
         {
             "label": "Overview",
             "path": "datatable/datatableOverview"
         },
         {
             "label": "Default",
             "path": "datatable/datatableDefault"
         },
         {
             "label": "Columns",
             "path": "datatable/datatableColumns"
         },
         {
             "label": "Sort and Selection",
             "path": "datatable/datatableSortSelection"
         },
         {
             "label": "Paginator",
             "path": "datatable/datatablePaginator"
         },
         {
             "label": "Captions",
             "path": "datatable/datatableCaptions"
         },
         {
             "label": "Facets",
             "path": "datatable/datatableFacets"
         },
         {
             "label": "Multiselect",
             "path": "datatable/datatableMultiSelection"
         },
         {
             "label": "ProgPagination",
             "path": "datatable/datatableProgPagination"
         },
         {
             "label": "HttpDataLoader",
             "path": "datatable/datatableHttpDataLoaderObject"
         },
         {
             "label": "HttpDataLoader - URL",
             "path": "datatable/datatableHttpDataLoaderUrl"
         },
         {
             "label": "Custom Column",
             "path": "datatable/datatableCustomColumn"
         }
     ]
 },
 {
     "widget": "puiEvent",
     "label": "Event",
     "controller": "EventController",
     "defaultPath": "event/overview",
     "subPages": [
         {
             "label": "overview",
             "path": "event/overview"
         },
         {
             "label": "default",
             "path": "event/default"
         }
     ]
 },
 {
     "widget": "puiFieldset",
     "label": "Fieldset",
     "controller": "FieldsetController",
     "defaultPath": "fieldset/overview",
     "subPages": [
         {
             "label": "Overview",
             "path": "fieldset/overview"
         },
         {
             "label": "Default",
             "path": "fieldset/default"
         },
         {
             "label": "Toggle",
             "path": "fieldset/toggle"
         },
         {
             "label": "Prog Collapse",
             "path": "fieldset/progCollapse"
         },
         {
             "label": "Callback",
             "path": "fieldset/callback"
         },
         {
             "label": "Dynamic Legend",
             "path": "fieldset/legend"
         }
     ]
 },
 {
     "widget": "puiGrowl",
     "label": "Growl",
     "controller": "GrowlController",
     "defaultPath": "growl/growlOverview",
     "subPages": [
         {
             "label": "Overview",
             "path": "growl/growlOverview"
         },
         {
             "label": "Default",
             "path": "growl/growlDefault"
         },
         {
             "label": "Sticky",
             "path": "growl/growlSticky"
         }
     ]
 },
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