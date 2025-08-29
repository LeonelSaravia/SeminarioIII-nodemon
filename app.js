require("dotenv").config();
const express = require("express");
const pool = require("./db");
const app = express();
app.use(express.json()); //JSON

//http://localhost:3000
const port = process.env.PORT || 3000;

//https://developer.mozilla.org/es/docs/Web/HTTP/Reference/Status
const handDbError = (res, error) => {
  console.error("Error de acceso BD:", error);
  res.status(500).json({ error: "Error interno en el servidor" });
};

// VERBOS //
//GET     (Consulta)
//req =>  require   (Requerimiento, consulta, solicitud)
//res =>  response  (Respuesta, resultado obtenido (JSON))
app.get("/vehiculos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM vehiculos"); //Matriz (Arreglo[arreglo])
    res.status(200).json(rows);
  } catch (error) {
    handDbError(res, error);
  }
});

// POST    (Inserción) //
app.post("/vehiculos", async (req, res) => {
  const { marca, modelo, color, precio, placa } = req.body;

  //Todos los datos oson obligatorios
  if (!marca || !modelo || !color || !precio || !placa) {
    //No se podrá realizar el registro
    return res.status(400).json({ error: "Todos los campos son necesarios" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO vehiculos (marca, modelo, color, precio, placa) VALUES (?,?,?,?,?)",
      [marca, modelo, color, precio, placa]
    );

    //Obtener el PK generado
    const id = result.insertId
    res.status(200).json({'id': id});
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY'){
      return res.status(409).json({error: 'La placa ya existe'})
    }
    handDbError(res, error);
  }
});

// PUT     (Actualización) //
app.put("/vehiculos/:id", async (req, res) => {
  const {id} = req.params; //URL
  const { marca, modelo, color, precio, placa } = req.body; //JSON

  //Todos los datos oson obligatorios
  if (!marca || !modelo || !color || !precio || !placa) {
    //No se podrá realizar el registro
    return res.status(400).json({ error: "Todos los campos son necesarios" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE vehiculos SET marca = ?, modelo = ?, color = ?, precio = ?, placa = ? WHERE id = ?",
      [marca, modelo, color, precio, placa, id]
    );

    if (result.affectedRows === 0){
      return res.status(404).json({success: false, message: 'Vehiculo no existe'})
    }

    res.status(200).json({success: true, message: 'Vehículo actualizado correctamente'})
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY'){
      return res.status(409).json({error: 'La placa ya existe'})
    }
    handDbError(res, error);
  }
});
// DELETE  (Eliminación) //
app.delete("/vehiculos/:id", async (req, res) => {
  const {id} = req.params; //URL
  
  try {
    const [result] = await pool.query(
      "DELETE FROM vehiculos WHERE id = ? ", [id]
    );

    if (result.affectedRows === 0){
      return res.status(404).json({success: false, message: 'Vehículo no eliminado'})
    }

    res.status(200).json({success: true, message: 'Vehículo eliminado exitosamente'})
  } catch (error) {
    handDbError(res, error);
  }
});

// Iniciar servidor //
app.listen(port, () => {
  console.log(`Servidor Iniciado en http://localhost:${port}`);
});
