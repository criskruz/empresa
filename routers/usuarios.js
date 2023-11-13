import express from "express";
import bcrypt from "bcrypt";
import Usuario from "../models/Usuario.js";
import generarId from "../helpers/generarId.js";
import generarJwt from "../helpers/generarJwt.js";
import { emailRegistro } from "../helpers/emails.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

router.get("/listar", async (req, res) => {
  // await Usuario.sync();
  const usuariolista = await Usuario.findAll();
  res.json(usuariolista);
  res.send("listado usuarios");
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const usuario = await Usuario.findOne({
    where: { id: id },
  });
  res.json(usuario);
});

router.post("/registrar", async (req, res) => {
  await Usuario.sync();

  // Evitar usuario duplicado

  const { email } = req.body;
  const existeUsuario = await Usuario.findOne({ where: { email } });

  if (existeUsuario) {
    res.send("usuario ya registrado");
    return;
  }

  // hashear password
  const claveEncriptada = await bcrypt.hash(req.body.password, 10);
  console.log(claveEncriptada);
  const generarToken = generarId();
  console.log(generarToken);

  const createUsuario = await Usuario.create({
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    email: req.body.email,
    usuario: req.body.usuario,
    password: claveEncriptada,
    token: generarToken,
  });

  res.send("registro usuario correcto");

  //enviar email de confirmación
  emailRegistro({
    email: req.body.email,
    nombre:req.body.nombre,
    token: generarToken
  })
});

//generar token unico
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  //1 - Confirmar si el usuario existe

  const usuario = await Usuario.findOne({
    where: { email },
  });

  if (!usuario) {
    const error = new Error("El usuario no existe");
    return res.status(404).json({ msj: error.message });
  }

  // - 2 - Comprobar que el usuario este confirmado
  if (!usuario.confirmado) {
    const error = new Error("Tu cuenta no ha sido confimada");
    return res.status(403).json({ msj: error.message });
  }

  // - 3 - Compronbar su password

  if (await bcrypt.compare(password, usuario.password)) {
    console.log("Contraseña correcta. El usuario puede iniciar sesión.");
   
    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      token: generarJwt(usuario.id),
    });
  } else {
    console.log("Contraseña incorrecta. El usuario no puede iniciar sesión.");
    return res
      .status(403)
      .send("El usuario NO PUEDE iniciar sesión - Contraseña incorrecta");
  }
});

// confirmar el token
router.get("/confirmar/:token", async (req, res) => {
  const token = req.params.token;
  const usuarioConfirmar = await Usuario.findOne({ where: { token } });

  if (!usuarioConfirmar) {
    const error = new Error("Token no válido");
    return res.status(403).json({ msj: error.message });
  }

  try {
    await Usuario.update(
      {
        confirmado: true,
        token: "",
      },
      {
        where: {
          token: token,
        },
      }
    );
    res.send("Cuenta confirmada correctamente");
  } catch (error) {
    console.log(error);
  }
});

// resetear password - 

router.post("/olvide-password", async (req, res) => {
  const { email } = req.body;

  //1 - Confirmar si el usuario existe

        const usuario = await Usuario.findOne({
          where: { email },
        });
        if (!usuario) {
          const error = new Error("El usuario no existe");
          return res.status(404).json({ msj: error.message });
        }

        // si el usuario existe generamos un nuevo token se manda por email y se guarda en BD
        try {
          usuario.token = generarId();
          await Usuario.update(
            {
              token: usuario.token,
            },
            {
              where: {
                email: email,
              },
            }
          );
          res.json({ msg: "Hemos enviado un email con las instrucciones" });
        } catch (error) {}
      });

// 2- comprueba que el token sea valido y el usuario exista

      router.get("/olvide-password/:token", async (req, res) => {
        const token = req.params.token;

        const tokenValido = await Usuario.findOne({
          where: { token },
        });

        if (tokenValido) {
          res.json({ msj: "Token válido y el usuario existe" });
        } else {
          const error = new Error("Token no válido");
          return res.status(404).json({ msg: error.message });
        }
      });

// 3- guardar el nuevo password -- El usuario va a tener un formulario donde va ingresar el nuevo password

router.post("/guarda-password/:token", async (req, res) => {
  const token = req.params.token;
  const {password } = req.body;

    //comprobar que el token es válido
    const usuario = await Usuario.findOne({
      where: { token},
    });

    const claveEncriptada = await bcrypt.hash(password, 10);

    if (usuario) {
      usuario.password = claveEncriptada;
      usuario.token = "";

      await Usuario.update(
        {
          password: usuario.password,
          token: usuario.token,
        },
        {
          where: {
            token: token,
          },
        }
      );
      res.json({ msg: "Password ha sido modificado correctamente" });
    } else {
      const error = new Error("Token no válido");
      return res.status(404).json({ msg: error.message });
    }
 });


// le pasamos el JWT y nos devuelve el perfil del usuario

router.get("/autorizacion/perfil", checkAuth, (req, res) => {
  console.log("desde el perfil del usuario");
});



router.put("/:id", (req, res) => {
  res.send("modificar usuario");
});
router.delete("/:id", (req, res) => {
  res.send("eliminar usuario");
});
export default router;
