(function (window, document, undefined) {	
	"use strict";

	angular.module('demo').controller('DropdownController', [ function DropdownController() {
   		
		var vm = this;
   		
        vm.country = null;
        vm.countrySelecteds = [];

        vm.car = null;
        vm.carSelecteds = [];

        vm.countries = ['Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antarctica', 'Antigua and Barbuda', 'Argentina', 'Armenia',
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
                
		vm.cars = [
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
        
       	vm.autoCompleteMethod = function (request, response) {
       	    
       		var data = [];
       	    
       		var query = request.query;
       	    
       		for (var i = 0; i < 5; i++) {
       			data.push(query.value + i);
       		}
       	    
       		response(data);
       	};

        vm.httpDataLoaderSingle = new AngularWidgets.FakeHttpDataLoader({ url: 'json/cars.json' });
        vm.httpDataLoaderMultiple = new AngularWidgets.FakeHttpDataLoader({ url: 'json/cars.json' });
        
        vm.fieldDisabled = true;

        vm.enableField = function () {
            vm.fieldDisabled = false;
        };

        vm.disableField = function () {
            vm.fieldDisabled = true;
        };

        vm.selectedsCountries = ["Brazil","Argentina"];

        vm.onItemSelect = function(item) {
			alert(item + ' selected');
        };

        vm.onItemRemove = function(item) {
        	alert(item + ' removed')
        };
    }]);

}(window, document));