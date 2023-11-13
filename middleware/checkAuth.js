import jwt, { decode } from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

const checkAuth = async (req,res,next) => {

    // console.log(req.headers.authorization)
  
    let token;
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
        
    ){
               
        try {
            token=req.headers.authorization.split(" ")[1];
            console.log(token)

            const decoded=jwt.verify(token, process.env.JWT_SECRET)
           console.log(decoded)
            req.usuario = await Usuario.findOne({attributes: ['nombre', 'email'], where: { id:decoded.id }})
              
            console.log(req.usuario)
            return next()
           
        } catch (error) {
            return res.status(404).json({msg: 'Hubo un error'})
        }
    }
    if(!token){
        const error = new Error("Token no válido")
    res.status(401).json({msg: error.message})
    }

next()
}

export default checkAuth
