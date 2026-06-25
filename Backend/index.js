import app from "./app.js";
import "./database.js";

//Creo la función
// que se encarga de ejecutar el servidor
async function main() {
  app.listen(4000);
  console.log("Server on port 4000");
}

main();
