'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    // add facebookId and facebookToken as columns
    return queryInterface.addColumn('users', 'facebookPic', Sequelize.STRING)
  },

  down: function (queryInterface, Sequelize) {
    // remove facebookToken and facebookId as columns
    return queryInterface.removeColumn('users', 'facebookPic')
  }
};
