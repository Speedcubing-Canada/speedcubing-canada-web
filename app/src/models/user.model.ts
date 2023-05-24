export const User = (sequelize:any, Sequelize:any) => {
    const User = sequelize.define("user", {
      id: {
        type: Sequelize.STRING
      },
      wcaid: {
        type: Sequelize.STRING
      },
      province: {
        type: Sequelize.STRING
      },
      dob: {
        type: Sequelize.STRING
      }
    });
  
    return User;
  };