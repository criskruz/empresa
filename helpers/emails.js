import nodemailer from 'nodemailer';

export const emailRegistro= async(datos)=>{
   const {email,nombre,token}=datos;

   const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "427908c11bab7b",
      pass: "8367c4d8a6941b"
    }
  });

  //informacion email

  const info = await transport.sendMail({
    from: "administrador proyecto",
    to: email,
    subject: "confirma cuenta",
    text: "Comprueba tu cuenta",
    html:`<p> Hola: ${nombre} comprueba tu cuenta</p>
    
    <a href="http://localhost:3005/api/usuarios/confirmar/${token}"> Comprobar cuenta </a>
    <br>
    <p>Si tu no creaste esta cuenta, ignora el mensaje</p>
    `

  })
}

