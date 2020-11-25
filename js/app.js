//Variables y selectores
const formulario = document.querySelector('#agregar-gasto');
const listaGastos = document.querySelector('#gastos ul');

//Eventos
eventListeners();
function eventListeners() {
	document.addEventListener('DOMContentLoaded', preguntarPresupuesto);
	formulario.addEventListener('submit', agregarGasto);
}

//Clases
class Presupuesto {
	constructor(presupuesto) {
		this.presupuesto = presupuesto;
		this.restante = presupuesto;
		this.gastos = [];
	}

	nuevoGasto(gasto) {
		this.gastos = [...this.gastos, gasto];
		this.calcularRestante();
	}

	calcularRestante() {
		const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0);
		this.restante = this.presupuesto - gastado;
	}
	eliminarGasto(id) {
		this.gastos = this.gastos.filter((gasto) => gasto.id != id);
		this.calcularRestante();
	}
}

class UI {
	imprimirPresupuesto(cantidad) {
		//Obteniendo valores
		const { presupuesto, restante } = cantidad;

		//Insertar en el HTML
		document.querySelector('#total').textContent = presupuesto;
		document.querySelector('#restante').textContent = restante;
	}

	imprimirMensaje(mensaje, tipo) {
		const divMensaje = document.createElement('div');
		divMensaje.classList.add('text-center', 'alert');

		if (tipo === 'error') {
			divMensaje.classList.add('alert-danger');
		} else {
			divMensaje.classList.add('alert-success');
		}

		divMensaje.textContent = mensaje;

		//Insertar en el HTML
		document.querySelector('.primario').insertBefore(divMensaje, formulario);

		//Borrar mensaje del HTML
		setTimeout(() => {
			divMensaje.remove();
		}, 3000);
	}

	imprimirGastosListados(gastos) {
		this.limpiarHTML();

		gastos.forEach((gasto) => {
			const { nombre, cantidad, id } = gasto;

			//Crear li
			const li = document.createElement('li');
			li.className = 'list-group-item d-flex justify-content-between align-items-center';
			// li.setAttribute('data-id', id) //antigua forma de agregar un atributo personalizado
			li.dataset.id = id; //Manera moderna recomendada para agregar atributos personalizados

			//Agregar el html del gasto
			li.innerHTML = `${nombre} <span class="badge badge-primary badge-pill"> $ ${cantidad} </span>`;

			//Boton para borrar
			const btnBorrar = document.createElement('button');
			btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
			btnBorrar.textContent = 'Borrar';
			btnBorrar.onclick = () => {
				eliminarGasto(id);
			};
			li.appendChild(btnBorrar);

			//Agregar al HTML
			listaGastos.appendChild(li);
		});
	}

	limpiarHTML() {
		while (listaGastos.firstChild) {
			listaGastos.removeChild(listaGastos.firstChild);
		}
	}

	actualizarRestante(restante) {
		document.querySelector('#restante').textContent = restante;
	}

	comprobarRestante(presupuestoObj) {
		const { presupuesto, restante } = presupuestoObj;
		const restanteDiv = document.querySelector('.restante');

		//Comprobar el 25% restante y 50%
		if (presupuesto / 4 > restante) {
			restanteDiv.classList.remove('alert-success', 'alert-warning');
			restanteDiv.classList.add('alert-danger');
		} else if (presupuesto / 2 > restante) {
			restanteDiv.classList.remove('alert-success');
			restanteDiv.classList.add('alert-warning');
		} else {
			restanteDiv.classList.remove('alert-danger', 'alert-warning');
			restanteDiv.classList.add('alert-success');
		}

		//Si el total es menor a 0
		if (restante <= 0) {
			setTimeout(() => {
				ui.imprimirMensaje('El presupuesto se ha agotado', 'error');
			}, 3000);

			formulario.querySelector('button[type="submit"]').disabled = true;
		} else {
			formulario.querySelector('button[type="submit"]').disabled = false;
		}
	}
}

//Instanciar
const ui = new UI();
let presupuesto;

//Funciones
function preguntarPresupuesto() {
	const presupuestoUsuario = Number(prompt('¿Cúal es tu presupuesto?'));

	if (
		presupuestoUsuario === '' ||
		presupuestoUsuario === null ||
		isNaN(presupuestoUsuario) ||
		presupuestoUsuario <= 0
	) {
		window.location.reload();
	}
	presupuesto = new Presupuesto(presupuestoUsuario);
	ui.imprimirPresupuesto(presupuesto);
}

function agregarGasto(e) {
	e.preventDefault();
	const nombre = document.querySelector('#gasto').value;
	const cantidad = Number(document.querySelector('#cantidad').value);

	if (nombre === '' || cantidad === '') {
		ui.imprimirMensaje('Ambos campos son obligatorios', 'error');
		return;
	} else if (cantidad <= 0 || isNaN(cantidad)) {
		ui.imprimirMensaje('Cantidad no válida', 'error');
		return;
	}

	//Costruir objeto
	const gasto = { nombre, cantidad, id: Date.now() };

	//Mandar objeto a la clase presupuesto
	presupuesto.nuevoGasto(gasto);

	//Imprimir mensaje de correcto
	ui.imprimirMensaje('Gasto agregado correctamente');

	//Agregar gastos listados
	const { gastos, restante } = presupuesto;
	ui.imprimirGastosListados(gastos);

	ui.actualizarRestante(restante);

	ui.comprobarRestante(presupuesto);

	//Reinicia el formulario
	formulario.reset();
}

function eliminarGasto(id) {
	//Eliminar del objeto
	presupuesto.eliminarGasto(id);

	//Eliminar del HTML
	const { gastos, restante } = presupuesto;
	ui.imprimirGastosListados(gastos);

	ui.actualizarRestante(restante);

	ui.comprobarRestante(presupuesto);
}
