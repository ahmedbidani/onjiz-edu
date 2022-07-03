/**
 * Currencies configuration
 * (sails.config.currencies)
 *
 * One-off settings specific to your application.
 *
 * For more information on currencies configuration, visit:
 * https://sailsjs.com/config/currencies
 */
require('dotenv').config();
module.exports.currencies = {
	list: [
		{ 
			"code" : "USD",
			"title" : "US Dollar",
			"symbolLeft" : "$",
			"symbolRight" : "",
			"decimalPoint" : ",",
			"numberSeperatorSymbol" : ".",
			"decimalPlaces" : 0,
			"status" : 0,
			"createdAt" : 1582527557960.0,
			"updatedAt" : 1583954369090.0
		},
		{ 
			"code" : "EUR",
			"title" : "Euro",
			"symbolLeft" : "",
			"symbolRight" : "€",
			"decimalPoint" : ".",
			"numberSeperatorSymbol" : ",",
			"decimalPlaces" : 2,
			"status" : 0,
			"createdAt" : 1581330358167.0,
			"updatedAt" : 1583954383314.0
		}, 
		{
			"code" : "IDR",
			"title" : "Rupiah",
			"symbolLeft" : "Rp",
			"symbolRight" : "",
			"decimalPoint" : ",",
			"numberSeperatorSymbol" : ".",
			"decimalPlaces" : 0,
			"status" : 0,
			"createdAt" : 1581682097269.0,
			"updatedAt" : 1583954372082.0
		},
		{ 
			"code" : "INR",
			"title" : "Indian Rupees",
			"symbolLeft" : "INR",
			"symbolRight" : "",
			"decimalPoint" : "",
			"numberSeperatorSymbol" : "",
			"decimalPlaces" : 0,
			"status" : 1,
			"createdAt" : 1584211995087.0,
			"updatedAt" : 1584211995087.0
		},
		{ 
			"code" : "VND",
			"title" : "Vietnam dong",
			"symbolLeft" : "",
			"symbolRight" : "đ",
			"decimalPoint" : ".",
			"numberSeperatorSymbol" : ",",
			"decimalPlaces" : 2,
			"status" : 0,
			"createdAt" : 1582182181409.0,
			"updatedAt" : 1584212039196.0
		}
    ]
};
