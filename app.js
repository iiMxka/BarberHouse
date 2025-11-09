const SHEET_URL = "https://script.google.com/macros/s/AKfycbxTMysilnnHlKiNmNpbN4G62z_N4zdGMS9oZeKLBpzRN4iPHIGhaO0-t9y0urWULkUSoQ/exec";

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
// Cargar horas con JSONP (SOLUCIÓN PARA CORS) - ESTO YA FUNCIONA ✅
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
// ENVIAR CITA - ESTA ES LA PARTE MODIFICADA ✅
// ===================
document.getElementById("formCita").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const data = {
        nombre: document.getElementById("nombre").value,
        telefono: document.getElementById("telefono").value,
        servicio: document.getElementById("servicio").value,
        fecha: document.getElementById("fecha").value,
        hora: document.getElementById("hora").value
    };

    // Validación básica
    if (!data.hora || data.hora.includes("Ocupado") || data.hora === "Selecciona una hora") {
        document.getElementById("estado").textContent = "❌ Por favor selecciona una hora válida";
        return;
    }

    const estado = document.getElementById("estado");
    estado.textContent = "Enviando...";
    estado.style.color = "#333";

    console.log("📤 Preparando envío de cita:", data);

    // SOLUCIÓN: Usar un formulario temporal para evitar CORS
    const formTemp = document.createElement('form');
    formTemp.method = 'POST';
    formTemp.action = SHEET_URL;
    formTemp.style.display = 'none';
    
    // Agregar campos
    const campos = [
        { name: 'nombre', value: data.nombre },
        { name: 'telefono', value: data.telefono },
        { name: 'servicio', value: data.servicio },
        { name: 'fecha', value: data.fecha },
        { name: 'hora', value: data.hora }
    ];
    
    campos.forEach(campo => {
        const input = document.createElement('input');
        input.name = campo.name;
        input.value = campo.value;
        formTemp.appendChild(input);
    });
    
    document.body.appendChild(formTemp);
    
    // Enviar el formulario
    formTemp.submit();
    
    // Mensaje de éxito (optimista)
    estado.textContent = "✅ Cita enviada con éxito";
    estado.style.color = "green";
    
    // Limpiar formulario después de 2 segundos
    setTimeout(() => {
        document.getElementById("formCita").reset();
        document.body.removeChild(formTemp);
        
        // Recargar horas para actualizar disponibilidad
        if (document.getElementById("fecha").value) {
            cargarHoras();
        }
    }, 2000);
    
    console.log("✅ Formulario enviado via método tradicional");
});

// Función para debug desde consola
window.debugCargaHoras = function() {
    console.log("🔧 Debug manual - Forzando carga de horas");
    cargarHoras();
};
