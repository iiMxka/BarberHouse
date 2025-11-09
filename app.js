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
// ENVIAR CITA - MÉTODO QUE SÍ FUNCIONA
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

    console.log("📤 Preparando envío de cita:", { nombre, telefono, servicio, fecha, hora });

    // SOLUCIÓN: Usar XMLHttpRequest que SÍ funciona
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    
    // Agregar datos al formData
    formData.append('nombre', nombre);
    formData.append('telefono', telefono);
    formData.append('servicio', servicio);
    formData.append('fecha', fecha);
    formData.append('hora', hora);

    xhr.open('POST', SHEET_URL, true);
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            console.log("📥 Respuesta recibida:", xhr.status, xhr.responseText);
            
            if (xhr.status === 200 || xhr.status === 0) {
                // Éxito - Google Apps Script puede devolver status 0
                estado.textContent = "✅ Cita guardada exitosamente";
                estado.style.color = "green";
                document.getElementById("formCita").reset();
                
                // Recargar horas para actualizar disponibilidad
                setTimeout(() => {
                    if (fecha) cargarHoras();
                }, 1000);
            } else {
                estado.textContent = "❌ Error al enviar la cita";
                estado.style.color = "red";
            }
        }
    };
    
    xhr.onerror = function() {
        console.error("❌ Error de conexión");
        estado.textContent = "❌ Error de conexión";
        estado.style.color = "red";
    };
    
    // Enviar la petición
    xhr.send(formData);
    console.log("✅ Petición enviada via XMLHttpRequest");
});

// Función para debug desde consola
window.debugCargaHoras = function() {
    console.log("🔧 Debug manual - Forzando carga de horas");
    cargarHoras();
};
