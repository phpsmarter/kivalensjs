'use strict';
import Reflux from 'reflux'
import {LoanAPI} from '../api/loans'
import {loanActions} from '../actions'
import {criteriaStore} from './criteriaStore'

var loans_from_kiva = [];
var loanStore = Reflux.createStore({
    listenables: [loanActions],
    init:function(){
        console.log("loanStore:init")
        loanActions.load();
    },
    onLoad: function(options) {
        console.log("LoanAPI:onLoad")

        //we already have the loans, just spit them back.
        if (loans_from_kiva.length > 0){
            loanActions.load.completed(loans_from_kiva);
            return;
        }

        options = options || {}

        //options.region = 'af'
        LoanAPI.getAllLoans(options)
            .done(loans => {
                //local_this.loans = loans;
                loans_from_kiva = loans;
                loanActions.load.completed(loans)
            })
            .progress(progress => {
                console.log("progress:", progress)
                loanActions.load.progressed(progress)
            })
            .fail((result) =>{
                loanActions.load.failed()
            })
    },

    onFilter: function(c){
        //console.log("loanStore:onFilter:",c)
        loanActions.filter.completed(this.syncFilterLoans(c))
    },

    syncHasLoadedLoans: function(){
        return loans_from_kiva.length > 0
    },

    syncFilterLoans: function(c){
        if (!c){
            c = criteriaStore.syncGetLast()
        }
        //break this into another unit --store? LoansAPI.filter(loans, criteria)
        var search_text = c.search_text;
        if (search_text) search_text = search_text.toUpperCase();
        var loans = loans_from_kiva

        /**var makeTestArray = function(search){
            if (!search) return []
            var words = search.match(/(\w+)|-(\w+)|~(\w+)/g)
            if (!words) return []
            //words [agri, retail]
            return words.map(word => {
                //word: agri
                //if -, ~, %
                return {regexp: new RegExp(), func: function(to_test, regexp){

                }};
            })
        }

        var _c = {}
        _c.sector = {raw: c.sector, tests: makeTestArray(c.sector)}

        var funcs = {
            //'%': (word)=>{return new RegEx()}, //word like
            '-': (word)=>{return new RegExp()}, //does not have word
            '~': (word)=>{return new RegExp()}, //word contains
            '=' : (word)=>{return new RegExp()} //exact "rose" wouldn't return rosenda
            //word starts with
        }

        var testForText = function(field, search){
            var type = ''
            if (search){

            }
        }

        var tests = {
            sector: {raw: '-retail', tests: ['-retail']},
            country: {raw: 'peru philip', tests: ['peru','philip']}
        }**/

        //for each search term for sector, break it into an array, ignoring spaces and commas
        //for each loan, test the sector against each search term.

        if (search_text) {
            loans = loans.where(l => {
                return (l.name.toUpperCase().indexOf(search_text) >= 0)
                    || (l.location.country.toUpperCase().indexOf(search_text) >= 0)
                    || (l.sector.toUpperCase().indexOf(search_text) >= 0)
                    || (l.activity.toUpperCase().indexOf(search_text) >= 0)
            })
        }
        if (c.use)
            loans = loans.where(l => l.use.toUpperCase().indexOf(c.use.toUpperCase()) >= 0)
        if (c.country)
            loans = loans.where(l => l.location.country.toUpperCase().indexOf(c.country.toUpperCase()) >= 0)
        if (c.sector)
            loans = loans.where(l => l.sector.toUpperCase().indexOf(c.sector.toUpperCase()) >= 0)
        if (c.activity)
            loans = loans.where(l => l.activity.toUpperCase().indexOf(c.activity.toUpperCase()) >= 0)
        if (c.name)
            loans = loans.where(l => l.name.toUpperCase().indexOf(c.name.toUpperCase()) >= 0)
        //console.log("syncFilterLoans:result",loans)
        return loans
    }

    /**onSingle: (id)=>{
        LoanAPI.getLoan(id)
            .done((result)=>{
                this.trigger(result);
            })
    },

    onSearch: (options)=>{
        LoanAPI.getLoans(options)
            .done((result)=>{
                this.trigger(result)
            })
    },

    onBatch: (id_arr)=>{
        LoanAPI.getLoanBatch(id_arr)
            .done((result)=>{
                this.trigger(result);
            })
    }**/
});

export {loanStore}