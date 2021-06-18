// Variables y Selectores
const formulario = document.querySelector("#agregar-gasto");
const gastoListado = document.querySelector("#gastos ul");
const divErrorPres = document.querySelector("#errorPresupuesto");
const btnAddPresupuesto = document.querySelector(".btnAddPresup");
const addPresupuesto = document.querySelector(".presupuestoUsuario");
const presupuestosMensual = document.querySelector("#presupuestos-mensual ul");
let presupuesto;
let newPresupuesto;
let ban = 0;
let nuevosValores;
let fecha;
let mes;
let anio;

// Eventos

eventListeners();

function eventListeners() {
  btnAddPresupuesto.addEventListener("click", consultarPresupuesto);
  addPresupuesto.addEventListener("keypress", pressEnter);
  formulario.addEventListener("submit", agregarGasto);
}

// Clases
class Presupuesto {
  constructor(presupuesto) {
    this.presupuesto = Number(presupuesto);
    this.restante = Number(presupuesto);
    this.gastos = [];
  }

  nuevoGasto(gasto) {
    this.gastos = [...this.gastos, gasto];
    this.calcularRestante();
  }

  nuevoPresupuesto(nuevosValores) {
    this.presupuesto = nuevosValores.newPresupuesto;
    this.restante = nuevosValores.newRestante;
    this.calcularRestante();
  }

  calcularRestante() {
    const gastado = this.gastos.reduce(
      (total, gasto) => total + gasto.cantidad,
      0
    );
    this.restante = this.presupuesto - gastado;
  }

  eliminarGastos(id) {
    this.gastos = this.gastos.filter((gasto) => gasto.id !== id);
    this.calcularRestante();
  }
}

class UI {
  insertarPresupuesto(cantidad) {
    const { presupuesto, restante } = cantidad;
    document.querySelector("#total").textContent = presupuesto;
    document.querySelector("#restante").textContent = restante;
  }

  mostrarAlerta(mensaje, tipo) {
    const divMensaje = document.createElement("div");
    divMensaje.classList.add("text-center", "alert");

    if (tipo === "errorPresupuesto") {
      divMensaje.classList.add("alert-danger");
      ban = 1;
    } else if (tipo === "error") {
      divMensaje.classList.add("alert-danger");
    } else {
      divMensaje.classList.add("alert-success");
    }

    divMensaje.textContent = mensaje;

    if (ban === 1) {
      // Inserta en HTML
      divErrorPres.appendChild(divMensaje);
      ban = 0;
    } else {
      // Inserta en HTML
      document.querySelector(".primario").insertBefore(divMensaje, formulario);
    }

    setTimeout(() => {
      divMensaje.remove();
    }, 3000);
  }

  mostrarGastos(gastos) {
    // Limipamos el HTML - En gastos
    this.limpiarHTML();

    gastos.forEach((gasto) => {
      const { cantidad, nombre, id } = gasto;

      const nuevoGasto = document.createElement("li");
      nuevoGasto.className = `list-group-item d-flex justify-content-between align-items-center`;
      nuevoGasto.dataset.id = id;
      nuevoGasto.innerHTML = ` ${nombre} <span class="badge badge-primary badge-pill"> $ ${cantidad} </span> `;

      // agrego delete btn
      const btnBorrar = document.createElement("button");
      btnBorrar.classList.add("btn", "btn-danger", "borrar-gasto");
      btnBorrar.innerHTML = " Borrar &times";

      btnBorrar.onclick = () => {
        eliminarGasto(id);
      };

      nuevoGasto.appendChild(btnBorrar);

      // Agrego al HTML
      gastoListado.appendChild(nuevoGasto);
    });
  }

  limpiarHTML() {
    while (gastoListado.firstChild) {
      gastoListado.removeChild(gastoListado.firstChild);
    }
  }

  actualizarRestante(restante) {
    document.querySelector("#restante").textContent = restante;
  }

  comprobarPresupuesto(presupuestObj) {
    const { presupuesto, restante } = presupuestObj;

    // Seleccionamos div
    const restanteDiv = document.querySelector(".restante");

    // comprobar 25%
    if (presupuesto / 4 > restante) {
      restanteDiv.classList.remove("alert-success", "alert-warning");
      restanteDiv.classList.add("alert-danger");
    } else if (presupuesto / 2 > restante) {
      // comprobar 50%
      restanteDiv.classList.remove("alert-success", "alert-danger");
      restanteDiv.classList.add("alert-warning");
    } else {
      restanteDiv.classList.remove("alert-danger", "alert-danger");
      restanteDiv.classList.add("alert-success");
    }

    if (restante <= 0) {
      ui.mostrarAlerta("El prespuesto se ha agotado.", "error");
      formulario.querySelector('button[type="submit"]').disabled = true;
      formulario
        .querySelector('button[type="submit"]')
        .classList.remove("alert-primary");
      formulario
        .querySelector('button[type="submit"]')
        .classList.add("btn-outline-dark");
    } else if (
      restante > 0 &&
      formulario
        .querySelector('button[type="submit"]')
        .classList.contains("btn-outline-dark")
    ) {
      ui.mostrarAlerta("El prespuesto se ha reembolsado correctamente.");
      formulario.querySelector('button[type="submit"]').disabled = false;
      formulario
        .querySelector('button[type="submit"]')
        .classList.remove("btn-outline-dark");
      formulario
        .querySelector('button[type="submit"]')
        .classList.add("btn-outline-primary");
    }
  }
}

// Instanciamos glob UI
const ui = new UI();

// Funciones

function consultarPresupuesto() {
  if (divErrorPres.childNodes.length !== 0) {
    divErrorPres.removeChild(divErrorPres.firstChild);
  }

  const presupuestoUsuario = addPresupuesto.value;

  // Validación
  if (
    presupuestoUsuario === "" ||
    presupuestoUsuario === null ||
    isNaN(presupuestoUsuario) ||
    presupuestoUsuario <= 0
  ) {
    ui.mostrarAlerta(
      "Debes Ingresar un presupuesto válido",
      "errorPresupuesto"
    );
    addPresupuesto.value = "";
  } else {
    let totalPresupuesto = document.querySelector("#total").textContent;
    if (totalPresupuesto) {
      newPresupuesto = presupuesto.presupuesto + parseInt(presupuestoUsuario);
      newRestante = presupuesto.restante + parseInt(presupuestoUsuario);
      nuevosValores = { newPresupuesto, newRestante };
      agregandoNuevoPresupuesto(nuevosValores);
      ui.insertarPresupuesto(presupuesto);
    } else {
      presupuesto = new Presupuesto(presupuestoUsuario);
      ui.insertarPresupuesto(presupuesto);
    }

    addPresupuesto.value = "";
  }
}

function pressEnter(e) {
  if (e.keyCode === 13 && !e.shiftKey) {
    consultarPresupuesto();
  }
}

function agregarGasto(e) {
  e.preventDefault();

  // Extraemos data de form
  const nombre = document.querySelector("#gasto").value;
  const cantidad = Number(document.querySelector("#cantidad").value);

  // validación

  if (nombre === "" || cantidad === "") {
    ui.mostrarAlerta("Debe completar ambos campos", "error");
    limpiarForm(bandera);

    return;
  } else if (cantidad <= 0 || isNaN(cantidad)) {
    ui.mostrarAlerta("Cantidad no válida", "error");
    bandera = 1;
    limpiarForm(bandera);

    return;
  }

  // Agregamos gasto

  const gasto = { nombre, cantidad, id: Date.now() };

  // Nuevo gasto
  presupuesto.nuevoGasto(gasto);

  ui.mostrarAlerta("Gasto agregado correctamente");

  // Mostrar gastos
  const { gastos, restante } = presupuesto;

  ui.mostrarGastos(gastos);

  ui.actualizarRestante(restante);

  ui.comprobarPresupuesto(presupuesto);

  formulario.reset();
}

function limpiarForm(bandera) {
  if (bandera === 1) {
    document.querySelector("#cantidad").value = "";
    return;
  }

  formulario.reset();
}

function eliminarGasto(id) {
  // Elimina GASTO del OBJETO
  presupuesto.eliminarGastos(id);

  // Elimina los gastos del HTML
  const { gastos, restante } = presupuesto;

  ui.mostrarGastos(gastos);

  ui.actualizarRestante(restante);

  ui.comprobarPresupuesto(presupuesto);
}

function agregandoNuevoPresupuesto(nuevosValores) {
  presupuesto.nuevoPresupuesto(nuevosValores);
}
