(function (window, document, undefined) {	
	"use strict";

	angular.module('demo').controller('EditorController', [ EditorController ]);
		
	function EditorController() {
   		
		var vm = this;
   		
		vm.text = "<h1>Hello World!!!</h1><p>TinyMCE is a platform independent web-based JavaScript WYSIWYG HTML editor control released as open source under LGPL.</p>";

		vm.disabled = true;        
    };

}(window, document));