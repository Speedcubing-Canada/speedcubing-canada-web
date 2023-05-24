export const User = (sequelize:any, Sequelize:any) => {
    const User = sequelize.define("user", {
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