import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routerUsuario from './routers/usuarios.js'


dotenv.config();

const app=express();
const port=process.env.PORT || 3001;
app.use(express.json());

// Habilitar peticiones por cors

app.use(cors());


process.on('uncaughtException', function (err) {
    console.log(err);
  });
  
// conexion a las rutas
app.use('/api/usuarios/', routerUsuario)

app.listen(port, ()=>{
    console.log(`Servidor escuchando en el puerto ${port}`)
})
