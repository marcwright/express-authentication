'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    // add facebookId and facebookToken as columns
    return queryInterface.addColumn('users', 'facebookId', Sequelize.STRING).then(function() {
      return queryInterface.addColumn('users', 'facebookToken', Sequelize.STRING);
    });
  },

  down: function (queryInterface, Sequelize) {
    // remove facebookToken and facebookId as columns
    return queryInterface.removeColumn('users', 'facebookToken').then(function() {
      return queryInterface.removeColumn('users', 'facebookId');
    });
  }
};
