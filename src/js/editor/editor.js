(function(window, document, undefined) {
    "use strict";

    angular.module('angularWidgets')
    	.factory('widgetEditor', ['$compile', '$timeout', '$parse', 'widgetBase', EditorWidget])
    	.directive('wgEditor', ['widgetEditor', EditorDirective]);    	
                      
    function EditorWidget($compile, $timeout, $parse, widgetBase) {

    	var widget = {};

    	widget.template = '<textarea class="pui-editor"></textarea>';
		
		widget.buildWidget = function(scope, element, attrs) {
			return new widget.Editor(scope, element, attrs);        	
		};
		
		widget.Editor = widgetBase.createWidget({
			
			optionsDefault: {
				configSetup: null
			},
			
			init: function(options) {
				
				this.id = this.element.attr('id');
				
				if(!this.id) {
					this.id = this.element.uniqueId().attr('id');
				}
								
				this.determineOptions(options);
				
				var $this = this;
				
				var firstTime = true;
				
				this.scope.$watch(this.element.attr('value'), function(value, oldValue) {
 					if (value !== oldValue || firstTime) {
						$this.updateView(value);
						firstTime = false;
 					}
     			});							

				this.scope.$on('$destroy', function() {
					if ($this.tinyInstance) {
						$this.tinyInstance.remove();
					}
				});
				
    			$timeout(function () {
					tinymce.init($this.options);
				});
			},

			onInitTinymce: function() {
				
				var $this = this;
				
				this.tinyInstance = tinymce.get(this.id);

				if (this.element.attr('visible')) {
	            	this.scope.$watch(this.options.visible, function (value) {
	            		if (value) {
	            			$this.show();
	            		}
	            		else {
	            			$this.hide();
	            		}
	                });
	            }
	            
	            if (this.element.attr('disabled')) {
	            	this.scope.$watch(this.options.disabled, function (value) {
						if (value) {
							$this.disable();
						}
						else {
							$this.enable();
						}
	                });
					this.element[0].removeAttribute('disabled');
	            }
			},

	        enable: function() {
	        	//this.tinyInstance.getBody().setAttribute('contenteditable', false);
	        	//this.tinyInstance.getDoc().designMode = 'Off'
	        	this.tinyInstance.settings.readonly = false;
				//tinyMCE.get('textarea_id').getBody().setAttribute('contenteditable', false);
	        	//this.element.removeClass('ui-state-disabled');
	            //this.element.attr('aria-disabled', false);
	        },
	        
	        disable: function() {
	        	this.tinyInstance.getBody().setAttribute('contenteditable', false);
	        	
	        	//this.tinyInstance.getDoc().designMode = 'Off';
	        	//this.tinyInstance.getBody().contenteditable = false;
	        	//tinymce.activeEditor.getBody().contenteditable = false
                //this.element.addClass('ui-state-disabled');
                //this.element.attr('aria-disabled', true);

	        },
		
			determineOptions: function(options) {

				var $this = this;
				
				var optionsInitial = {
					
					// Update model when calling setContent (such as from the source editor popup)
					setup: function (ed) {
						$this.ed = ed;
						ed.on('init', function(args) {
              				$this.onInitTinymce();	
            			});	
						// Update model on button click
						ed.on('ExecCommand', function (e) {
							ed.save();
							$this.updateModel();
						});
						// Update model on keypress
						ed.on('KeyUp', function (e) {
							ed.save();
							$this.updateModel();
						});
						// Update model on change, i.e. copy/pasted text, plugins altering content
						ed.on('SetContent', function (e) {
							if (!e.initial && $this.scope.$eval(options.value) !== e.content) {
								ed.save();
								$this.updateModel();
							}
						});
						ed.on('blur', function(e) {
							$this.element.blur();
						});
						// Update model when an object has been resized (table, image)
						ed.on('ObjectResized', function (e) {
							ed.save();
							$this.updateModel();
						});
		            
						if ($this.options.configSetup) {
							$this.options.configSetup(ed);
						}
					},
					mode: 'exact',
					elements: this.element.attr('id')
				};

				if (options.disabled && $this.scope.$eval(options.disabled)) {
					optionsInitial.readonly = 1;
				}
				
				optionsInitial = angular.extend(optionsInitial, this.optionsDefault);
												
				this.options = widgetBase.determineOptions(this.scope, optionsInitial, options, ['configSetup'], []);
			},
			
			updateView: function(value) {				
				this.element.val(value);					
			},

			updateModel: function() {
            	var parseValue = $parse(this.options.value);
            	parseValue.assign(this.scope, this.element.val());            	
            	this.scope.safeApply();
            }
		});
	
		return widget;
    }

    function EditorDirective(widgetEditor) {
        return {
            restrict: 'E',
            replace: true,            
			scope: true,
            template: widgetEditor.template,
            link: function (scope, element, attrs) {
            	widgetEditor.buildWidget(scope, element, attrs);
            }
        };
    }
    
}(window, document));