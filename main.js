//Controlador de la base de datos
const db = new Dexie('AppListaCompras')

//Creación de la base de datos y del almacén de ítems
db.version(1).stores({items: '++id,nombre,precio,comprado'})

//Referencia a los elementos del DOM de la App
const formularioItems = document.getElementById('formularioItems')
const listadoItems = document.getElementById('listadoItems')
const totalLista = document.getElementById('totalLista')

const poblarListaItemsDiv = async () =>{
    const itemsCompletos = await db.items.reverse().toArray()
    listadoItems.innerHTML = itemsCompletos.map(item => `
    
    <div class="item ${item.comprado ? 'comprado': ''}">
            <label>
                <input 
                    type="checkbox" 
                    class="checkbox" 
                    onchange="alternarEstadoItem(event, ${item.id})"
                    ${item.comprado ? 'checked': ''}                    
                >       
            </label>
            <div class="infoItem" >
                <p>${item.nombre}</p>
                <p>$${item.precio} x ${item.cantidad}</p>
            </div>
            <button class="btn-borrar"
            onclick="eliminarItem(${item.id})">
            X
            </button>
    </div>
    `).join('')

    //Calcular precio total del listado
    const arregloPrecios = itemsCompletos.map(
        item => item.precio * item.cantidad
        )
    const precioTotal = arregloPrecios.reduce((a,b) => a + b ,0)    
    totalLista.innerText = 'Precio total: $'+precioTotal

}

//Establecer la función que se realiza con la carga de la aplicación o de la página
window.onload = poblarListaItemsDiv

//Función para controlar el envío del formulario
formularioItems.addEventListener("submit", async (e)=>{
    e.preventDefault()

    const nombre = document.getElementById('inputNombre').value
    const cantidad = document.getElementById('inputCantidad').value
    const precio = document.getElementById('inputPrecio').value

    await db.items.add({
        nombre:nombre,
        cantidad:cantidad,
        precio:precio,
        comprado:false
    })
    await poblarListaItemsDiv()

    //recargar el formulario después de que se realizan las dos promesias previas
    formularioItems.reset()
    
})


//Alternar el estado de los ítems de la lista
const alternarEstadoItem = async (e,id) => {    

    //Establecer el estado
    let estado;
    if(e.target.checked){        
        estado = true;
    }else{        
        estado = false;
    }    

    //Actualización asincrónica a la base de datos
    await db.items.update(id, {comprado: estado})

    //Después de la actualización por interfaz, recargar con la información de la base de datos
    await poblarListaItemsDiv()
}

//Eliminar ítems de la lista
const eliminarItem = async (id) => {
    //Eliminar elemento de la base de datos
    await db.items.delete(id)

    //Actualizar o poblar con mase en lo que hay en el modelo de datos de la app
    await poblarListaItemsDiv()
}




