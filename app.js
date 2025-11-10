const SHEET_URL = "https://script.google.com/macros/s/AKfycbxpXYA9S7muel__ShUO2P704AoIA-tdd4uZ1qp2fhp0GFwk1NtsAaTcw_8ufGcmIVL_3g/exec";

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("fecha").min = new Date().toISOString().split('T')[0];
});

// Cargar horas
function cargarHoras() {
    var fecha = document.getElementById("fecha").value;
    var selectHora = document.getElementById("hora");
    
    if (!fecha) {
        selectHora.innerHTML = "<option value=''>Selecciona fecha primero</option>";
        return;
    }

    selectHora.innerHTML = "<option value=''>Cargando horas...</option>";

    var callbackName = 'cb_' + Date.now();
    window[callbackName] = function(horasOcupadas) {
        console.log("🕒 Horas recibidas:", horasOcupadas);
        var horas = ["11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"];
        selectHora.innerHTML = "<option value=''>Selecciona una hora</option>";
        
        horas.forEach(function(hora) {
            var option = document.createElement("option");
            option.value = hora;
            if (Array.isArray(horasOcupadas) && horasOcupadas.includes(hora)) {
                option.disabled = true;
                option.textContent = hora + " (Ocupado)";
                option.style.color = "#999";
            } else {
                option.textContent = hora;
            }
            selectHora.appendChild(option);
        });
        
        delete window[callbackName];
    };

    var script = document.createElement('script');
    script.src = SHEET_URL + '?fecha=' + encodeURIComponent(fecha) + '&callback=' + callbackName;
    script.onerror = function() {
        console.error("❌ Error cargando horas");
        selectHora.innerHTML = "<option value=''>Error al cargar horas</option>";
    };
    document.head.appendChild(script);
}

// Enviar cita
document.getElementById("formCita").addEventListener("submit", function(e) {
    e.preventDefault();
    
    var nombre = document.getElementById("nombre").value.trim();
    var telefono = document.getElementById("telefono").value.trim();
    var servicio = document.getElementById("servicio").value;
    var fecha = document.getElementById("fecha").value;
    var hora = document.getElementById("hora").value;

    // Validaciones
    if (!nombre || !telefono || !servicio || !fecha || !hora) {
        mostrarEstado("❌ Completa todos los campos", "error");
        return;
    }

    if (hora.includes("Ocupado")) {
        mostrarEstado("❌ Selecciona una hora disponible", "error");
        return;
    }

    console.log("🚀 Enviando cita:", {nombre, telefono, servicio, fecha, hora});
    mostrarEstado("⏳ Enviando cita...", "cargando");

    var callbackName = 'guardarCita_' + Date.now();
    window[callbackName] = function(respuesta) {
        console.log("📨 Respuesta del servidor:", respuesta);
        
        if (typeof respuesta === 'string' && respuesta.includes('OK')) {
            mostrarEstado("✅ " + respuesta, "exito");
            document.getElementById("formCita").reset();
            
            // Recargar horas después de 1 segundo
            setTimeout(function() {
                if (fecha) cargarHoras();
            }, 1000);
        } else {
            mostrarEstado("❌ Error: " + (respuesta || 'No se pudo guardar la cita'), "error");
        }
        
        delete window[callbackName];
    };

    // Construir URL
    var url = SHEET_URL + '?' + 
        'nombre=' + encodeURIComponent(nombre) +
        '&telefono=' + encodeURIComponent(telefono) +
        '&servicio=' + encodeURIComponent(servicio) +
        '&fecha=' + encodeURIComponent(fecha) +
        '&hora=' + encodeURIComponent(hora) +
        '&callback=' + callbackName;

    console.log("🔗 URL enviada:", url);
    
    var script = document.createElement('script');
    script.src = url;
    script.onerror = function() {
        console.error("❌ Error de conexión");
        mostrarEstado("❌ Error de conexión con el servidor", "error");
        delete window[callbackName];
    };
    document.head.appendChild(script);
});

// Función auxiliar para mostrar estado
function mostrarEstado(mensaje, tipo) {
    var estado = document.getElementById("estado");
    estado.textContent = mensaje;
    
    // Limpiar clases anteriores
    estado.className = '';
    
    if (tipo === 'exito') {
        estado.style.color = '#00e676';
    } else if (tipo === 'error') {
        estado.style.color = '#ff5252';
    } else {
        estado.style.color = '#e0b05c';
    }
}

// Evento para cargar horas
document.getElementById("fecha").addEventListener("change", cargarHoras);
