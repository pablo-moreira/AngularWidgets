(function (window, document, undefined) {
    "use strict";

    angular.module('demo').controller('MainController', ['$location', '$rootScope', 'widgets', 'version',  function($location, $rootScope, widgets, version) {
    	
    	var vm = this;

    	vm.widgets = widgets;
        vm.version = version;
        vm.angularVersion = angular.version;
                
    	var url = $location.absUrl();

		vm.widget = null;
	    	    	
		for (var i=0, t=vm.widgets.length; i<t; i++) {
			    		
			for (var j=0, l=vm.widgets[i].subPages.length; j<l; j++) {    			
				
				var pg = vm.widgets[i].subPages[j];
				
				if (url.indexOf(pg.path) != -1) {
					vm.widget = vm.widgets[i];
					vm.item = pg;
	    			break;	
				}
			}
			
			if (vm.widget) {
				break;
			}
		};
		
		vm.isSelected = function(item) {
			return vm.item === item;
		};
		vm.selectWidget = function(widget, item) {
			vm.widget = widget;
			vm.item = item;
		};
	}])   
    
    .controller('PanelController', [ '$scope',  function ($scope) {
        
		$scope.panelBind;
        
		$scope.panelTitle = "Change me";
        
        $scope.onToggle = function (panel) {
        	alert('User toggled the panel to ' + (panel.isCollapsed() ? 'collapse' : 'expand') + '!');
        };
        
        $scope.onClose = function(panel) {
        	alert('User closed the panel');
        };
    }])
    .controller('TabviewController', [ '$scope',  function($scope) {

    	$scope.title1 = 'title1';
        $scope.description1 = 'description1';
        $scope.title2 = 'title2';
        $scope.description2 = 'description2';

        $scope.onTabChange = function(tabView, index) {
            alert('Tab with index '+ index + ' selected');
        };
        
        $scope.onTabClose = function(tabView, index) {
        	alert('Tab with index ' + index + ' closed - Tabs remains: ' + tabView.getLength());
        };
        
        $scope.tabViewBind = null;
        $scope.activeIndex = 1;     

        $scope.includeList = ["partials/puiTabview/include/panel1.html"
            , "partials/puiTabview/include/panel2.html"];

        $scope.distributedData = {
            field1: "field1"
            , field2: "field2"
            , field3: "field3"
        };

        $scope.addPanel = function() {
            $scope.includeList.push("partials/puiTabview/include/panel3.html");
        }
    }])
    .controller('InputController', [ '$scope',  function($scope) {
        

        $scope.value1 = 'Change me';

        $scope.numbers = 123;

        $scope.fieldDisabled = true;

        $scope.enableField = function() {
            $scope.fieldDisabled = false;
        };

        $scope.disableField = function() {
            $scope.fieldDisabled =  true;
        };

        $scope.fieldVisible = false;

        $scope.showField = function() {
            $scope.fieldVisible = true;
        };

        $scope.hideField = function() {
            $scope.fieldVisible =  false;
        };
    } ])   
    .controller('AutocompleteController', [ '$scope',   function($scope) {			
   	
        $scope.country = null;
        $scope.countrySelecteds = [];

        $scope.car = null;
        $scope.carSelecteds = [];

        $scope.countries = ['Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antarctica', 'Antigua and Barbuda', 'Argentina', 'Armenia',
            'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda',
            'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burma', 'Burundi', 'Cambodia',
            'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo, Democratic Republic',
            'Congo, Republic of the', 'Costa Rica', 'Cote d\'Ivoire', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica',
            'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland',
            'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Greenland', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
            'Haiti', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan',
            'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, North', 'Korea, South', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho',
            'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
            'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Mongolia', 'Morocco', 'Monaco', 'Mozambique', 'Namibia',
            'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Panama', 'Papua New Guinea',
            'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Samoa', 'San Marino', ' Sao Tome',
            'Saudi Arabia', 'Senegal', 'Serbia and Montenegro', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands',
            'Somalia', 'South Africa', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
            'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Uganda', 'Ukraine', 'United Arab Emirates',
            'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'];
                
		$scope.cars = [
           {'brand':'Volkswagen','year': 2012, 'color':'White', 'vin':'dsad231ff'},
           {'brand':'Audi','year': 2011, 'color':'Black', 'vin':'gwregre345'},
           {'brand':'Renault','year': 2005, 'color':'Gray', 'vin':'h354htr'},
           {'brand':'Bmw','year': 2003, 'color':'Blue', 'vin':'j6w54qgh'},
           {'brand':'Mercedes','year': 1995, 'color':'White', 'vin':'hrtwy34'},
           {'brand':'Opel','year': 2005, 'color':'Black', 'vin':'jejtyj'},
           {'brand':'Honda','year': 2012, 'color':'Yellow', 'vin':'g43gr'},
           {'brand':'Chevrolet','year': 2013, 'color':'White', 'vin':'greg34'},
           {'brand':'Opel','year': 2000, 'color':'Black', 'vin':'h54hw5'},
           {'brand':'Mazda','year': 2013, 'color':'Red', 'vin':'245t2s'}
		];
        
       	$scope.autoCompleteMethod = function (request, response) {
       	    
       		var data = [];
       	    
       		var query = request.query;
       	    
       		for (var i = 0; i < 5; i++) {
       			data.push(query.value + i);
       		}
       	    
       		response(data);
       	};

        $scope.httpDataSourceSingle = new AngularWidgets.FakeHttpDataSource({ url: 'json/cars.json' });
        $scope.httpDataSourceMultiple = new AngularWidgets.FakeHttpDataSource({ url: 'json/cars.json' });
        
        $scope.fieldDisabled = true;

        $scope.enableField = function () {
            $scope.fieldDisabled = false;
        };

        $scope.disableField = function () {
            $scope.fieldDisabled = true;
        };

        $scope.selectedsCountries = ["Brazil","Argentina"];

        $scope.onItemSelect = function(item) {
			alert(item + ' selected');
        };

        $scope.onItemRemove = function(item) {
        	alert(item + ' removed')
        };
    }])
    .controller('EventController', ['$scope',   function($scope) {
        
        $scope.value1 = '';

        $scope.showInfo = function(value) {
            alert('Value of field is '+value);
        };

        $scope.data = {
            name : 'test'
        };

        $scope.showName = function() {
            alert('Current name is  ' + $scope.data.name);
        };

    } ])
    .controller('wgPanel', [ function() {

    }]);
    
    
}(window, document));