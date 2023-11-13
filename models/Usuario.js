import { Sequelize, DataTypes } from "sequelize";


const sequelize = new Sequelize("mybs", "usuario", "usuarioroot", {
  host: "localhost",
  dialect: "mysql",
  port: 3306,
});

const Usuario = sequelize.define(
  "Usuario",
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    usuario: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    confirmado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    token: {
      type: DataTypes.STRING
      
    },
  },
  {}
);

console.log(Usuario === sequelize.models.Usuario); // true


export default Usuario;
