/**
 * @copyright 2020 @ ZiniMedia Team
 * @author daonguyen
 * @create 2020/01/10 11:29
 * @update 2020/01/10 11:29
 * @file api/services/FeeInvoiceService.js
 */
'use strict';

const fn = {
    fetchData: async options => {
      return await FeeInvoice.find(options);
    },
    fetchDataInOne: async options => {
      return await FeeInvoice.findOne(options).populate('payments').populate('student');
    }
  };

const FeeInvoiceService = {
    get: async (options) => {
        sails.log.info("================================ FeeInvoiceService.get -> options: ================================");
        sails.log.info(options);

        let records = await fn.fetchDataInOne(options);
        return records;
        
    },

    add : async (options) => {
        sails.log.info("================================ FeeInvoiceService.add -> options: ================================");
        sails.log.info(options);
        
        let newObj = await FeeInvoice.create(options)
        // Some other kind of usage / validation error
        .intercept('UsageError', (err)=> {
            return 'invalid';
        })
        .fetch();
        sails.log.info("================================ FeeInvoiceService.add -> new object: ================================");
        sails.log.info(newObj);
        return newObj;
    },

    edit: async (query, params) => {
        sails.log.info("================================ FeeInvoiceService.edit -> query, params: ================================");
        sails.log.info(query);
        sails.log.info(params);

        let options = {};

        for(let key in FeeInvoice.attributes) {
            if( key === "id" || key === "createdAt" || key === "toJSON" ) continue;

            if(params && typeof(params[key]) !== "undefined") {
                options[key] = params[key];
            }
        }

        options.updatedAt = new Date().getTime();
        
        let editObj = await FeeInvoice.update(query, options).fetch();
        sails.log.info("================================ FeeInvoiceService.edit -> edit object: ================================");
        sails.log.info(editObj);
        return editObj;
    },

    del: (options, cb) => {
        sails.log.info("================================ FeeInvoiceService.del -> options: ================================");
        sails.log.info(options);

        FeeInvoice.destroy(options).exec( (error, deletedRecords) => {
            if(error) {
                sails.log.error(error);
                return cb(error, null);
            }

            return cb(null, deletedRecords);
        });
    },

    find:  async( where, limit, skip, sort) => {
        sails.log.info("================================ FeeInvoiceService.find -> where: ================================");
        sails.log.info(JSON.stringify(where));
        sails.log.info(limit);
        sails.log.info(skip);
        sails.log.info(sort);
        where = (typeof where === 'object') ? where : {};
        limit = (limit !== undefined) ? limit : 10;
        skip = (skip !== null && typeof skip === 'number') ? skip: 0;
        sort = (sort !== null && typeof sort === 'object') ? sort : [{ createdAt: 'DESC' }];

        let feeInvoices = await fn.fetchData({ where: where, limit: limit, skip: skip, sort: sort });

        return feeInvoices;    
    },

    count: async (where) => {
        where = (typeof where === 'object') ? where : {};
        let totalFeeInvoice  = await FeeInvoice.count(where);
        return totalFeeInvoice;
    },

    generateUniqueCode: async (length) => {
        // let _sym = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let _sym = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let code = '';
        
        for (let i = 0; i < length; i++) {
            code += _sym.charAt(Math.floor(Math.random() * _sym.length));
        }

        let isExisted = await FeeInvoice.findOne({ code: code });
        if (!isExisted) {
            return code;
        } else this.generateUniqueCode(length);
    },

    currencyFormat: async (feeInvoiceObj, schoolId) => {
        let webSettings = await Setting.findOne({ key: 'web', school: schoolId });
        //get currency format
        let currency = {
          numberSeperatorSymbol : '.',
          decimalPoint : ',',
          decimalPlaces : 0,
          symbolLeft : '',
          symbolRight : '',
        }
        if (webSettings && webSettings.value && webSettings.value.currency) {
          let currencyObj = await Currency.findOne({ id: webSettings.value.currency });
          if (currencyObj) {
            currency.numberSeperatorSymbol = currencyObj.numberSeperatorSymbol,
            currency.decimalPoint = currencyObj.decimalPoint,
            currency.decimalPlaces = currencyObj.decimalPlaces,
            currency.symbolLeft = currencyObj.symbolLeft,
            currency.symbolRight = currencyObj.symbolRight
          }
        }

        if (feeInvoiceObj.items && feeInvoiceObj.items.length > 0) {
            for (let i = 0; i < feeInvoiceObj.items.length; i++) {
                feeInvoiceObj.items[i].formattedAmountPerItem = await sails.helpers.currencyFormat(feeInvoiceObj.items[i].amountPerItem, currency);
                feeInvoiceObj.items[i].formattedTotalPerItem = await sails.helpers.currencyFormat(feeInvoiceObj.items[i].totalPerItem, currency);
            }
        }
        feeInvoiceObj.formattedTotalAmount = await sails.helpers.currencyFormat(feeInvoiceObj.totalAmount, currency);

        return feeInvoiceObj;
    },
};

module.exports = FeeInvoiceService;