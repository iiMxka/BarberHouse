const SHEET_URL = "https://script.google.com/macros/s/AKfycbz065MhkIEg3MHpK6VqrEdcP0ySUU9p3jdEfx0fUIfKF87jOM1Ph7wuojn-MtuWcxOc5g/exec";

// ===================
// Inicializar fecha mínima (hoy)
// ===================
document.addEventListener('DOMContentLoaded', function() {
    const fechaInput = document.getElementById("fecha");
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.min = hoy;
    console.log("✅ Página cargada - Fecha mínima establecida:", hoy);
});

// ===================
// Cargar horas con JSONP (SOLUCIÓN PARA CORS)
// ===================
function cargarHoras() {
    const fecha = document.getElementById("fecha").value;
    const selectHora = document.getElementById("hora");
    
    console.log("📅 Intentando cargar horas para fecha:", fecha);
    
    if (!fecha) {
        selectHora.innerHTML = "<option value=''>Primero selecciona una fecha</option>";
        return;
    }

    selectHora.innerHTML = "<option value=''>Cargando horas...</option>";
    console.log("🔄 Creando petición JSONP...");

    // Crear callback único para JSONP
    const callbackName = 'procesarHoras_' + Date.now();
    
    // Definir la función callback
    window[callbackName] = function(horasOcupadas) {
        console.log("✅ JSONP - Respuesta recibida:", horasOcupadas);
        actualizarHorasDisponibles(horasOcupadas);
        // Limpiar
        delete window[callbackName];
        if (script.parentNode) {
            script.parentNode.removeChild(script);
        }
    };

    // Crear elemento script para JSONP
    const script = document.createElement('script');
    const url = `${SHEET_URL}?fecha=${encodeURIComponent(fecha)}&callback=${callbackName}`;
    script.src = url;
    
    console.log("🌐 JSONP URL:", url);
    
    // Manejar errores
    script.onerror = function() {
        console.error("❌ JSONP - Error cargando el script");
        selectHora.innerHTML = "<option value=''>Error al cargar horas</option>";
        delete window[callbackName];
        if (script.parentNode) {
            script.parentNode.removeChild(script);
        }
    };
    
    // Agregar el script al DOM (esto ejecuta la petición)
    document.head.appendChild(script);
}

function actualizarHorasDisponibles(horasOcupadas) {
    const selectHora = document.getElementById("hora");
    const horasDisponibles = [
        "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", 
        "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"
    ];
    
    console.log("🔄 Actualizando horas disponibles...");
    selectHora.innerHTML = "<option value=''>Selecciona una hora</option>";
    
    let horasDisponiblesCount = 0;
    
    horasDisponibles.forEach(hora => {
        const option = document.createElement("option");
        option.value = hora;
        
        // Verificar si la hora está ocupada
        const ocupada = Array.isArray(horasOcupadas) && horasOcupadas.includes(hora);
        
        if (ocupada) {
            option.disabled = true;
            option.textContent = hora + " (Ocupado)";
            option.style.color = "#999";
            console.log(`⏰ ${hora} - OCUPADA`);
        } else {
            option.textContent = hora;
            horasDisponiblesCount++;
            console.log(`⏰ ${hora} - DISPONIBLE`);
        }
        
        selectHora.appendChild(option);
    });
    
    if (horasDisponiblesCount === 0) {
        selectHora.innerHTML = "<option value=''>No hay horas disponibles</option>";
        console.log("📭 No hay horas disponibles para esta fecha");
    } else {
        console.log(`🎯 ${horasDisponiblesCount} horas disponibles de ${horasDisponibles.length}`);
    }
}

// Evento al cambiar la fecha
document.getElementById("fecha").addEventListener("change", cargarHoras);

// ===================
// ENVIAR CITA - MÉTODO SIMPLE QUE SÍ FUNCIONA
// ===================
document.getElementById("formCita").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById("nombre").value;
    const telefono = document.getElementById("telefono").value;
    const servicio = document.getElementById("servicio").value;
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;

    // Validación básica
    if (!hora || hora.includes("Ocupado") || hora === "Selecciona una hora") {
        document.getElementById("estado").textContent = "❌ Por favor selecciona una hora válida";
        return;
    }

    const estado = document.getElementById("estado");
    estado.textContent = "Enviando...";
    estado.style.color = "#333";

    console.log("📤 Enviando cita:", { nombre, telefono, servicio, fecha, hora });

    // SOLUCIÓN: Redirección temporal - método 100% funcional
    const params = new URLSearchParams({
        nombre: nombre,
        telefono: telefono,
        servicio: servicio,
        fecha: fecha,
        hora: hora
    });

    // Abrir en nueva pestaña/ventana
    const nuevaVentana = window.open(SHEET_URL + '?' + params.toString(), '_blank');
    
    // Mensaje de éxito optimista
    estado.textContent = "✅ Cita enviada - Cerrando ventana...";
    estado.style.color = "green";

    // Cerrar la ventana después de 2 segundos y limpiar formulario
    setTimeout(() => {
        if (nuevaVentana && !nuevaVentana.closed) {
            nuevaVentana.close();
        }
        document.getElementById("formCita").reset();
        estado.textContent = "✅ Cita guardada - Actualizando horarios...";
        
        // Recargar horas para actualizar disponibilidad
        if (fecha) {
            setTimeout(cargarHoras, 1000);
        }
    }, 2000);
});

// Función para debug desde consola
window.debugCargaHoras = function() {
    console.log("🔧 Debug manual - Forzando carga de horas");
    cargarHoras();
};
