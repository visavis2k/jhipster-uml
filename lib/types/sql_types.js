'use strict';

var AbstractMappedTypes = require('./abstract_mapped_types');

/**
 * This class extends the Types interface to provide the SQL types supported
 * by JHipster (for MySQL, PostgreSQL, H2).
 */
var SQLTypes = module.exports = function() {
  this.types = {
    String: [ 'required', 'minlength', 'maxlength', 'pattern' ],
    Integer: [ 'required', 'min', 'max' ],
    Long: [ 'required', 'min', 'max' ],
    BigDecimal: [ 'required', 'min', 'max' ],
    LocalDate : [ 'required' ],
    DateTime : [ 'required' ],
    Boolean : [],
    Enum : [ 'required' ],
  }
};

// inheritance stuff
SQLTypes.prototype = Object.create(AbstractMappedTypes.prototype);
SQLTypes.prototype.constructor = AbstractMappedTypes;
