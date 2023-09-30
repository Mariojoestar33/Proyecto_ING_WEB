// Datos de ejemplo: una lista de productos con tipo y talla
const productos = [
    { nombre: 'Camisa Azul', tipo: 'camisas', talla: 's' },
    { nombre: 'Vestido Rojo', tipo: 'vestidos', talla: 'm' },
    // Agrega más productos aquí
];

// Función para mostrar productos filtrados
function mostrarProductosFiltrados() {
    const tipoSeleccionado = document.getElementById('tipo').value;
    const tallaSeleccionada = document.getElementById('talla').value;
    
    const productosFiltrados = productos.filter(producto => {
        return producto.tipo === tipoSeleccionado && producto.talla === tallaSeleccionada;
    });

    const productosContainer = document.getElementById('productos');
    productosContainer.innerHTML = '';

    if (productosFiltrados.length === 0) {
        productosContainer.innerHTML = '<p>No se encontraron productos.</p>';
    } else {
        productosFiltrados.forEach(producto => {
            const productoElement = document.createElement('div');
            productoElement.innerText = producto.nombre;
            productosContainer.appendChild(productoElement);
        });
    }
}

// Evento de cambio en los select
document.getElementById('tipo').addEventListener('change', mostrarProductosFiltrados);
document.getElementById('talla').addEventListener('change', mostrarProductosFiltrados);

// Mostrar productos al cargar la página
mostrarProductosFiltrados();
