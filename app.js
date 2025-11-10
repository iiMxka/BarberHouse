const SHEET_URL = "https://script.google.com/macros/s/AKfycbxpXYA9S7muel__ShUO2P704AoIA-tdd4uZ1qp2fhp0GFwk1NtsAaTcw_8ufGcmIVL_3g/exec";

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    var fechaInput = document.getElementById("fecha");
    if (fechaInput) {
        fechaInput.min = new Date().toISOString().split('T')[0];
    }
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

    var callbackName = 'horas_' + new Date().getTime();
    window[callbackName] = function(respuesta) {
        console.log("🕒 RESPUESTA HORAS:", respuesta);
        
        var horas = ["11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"];
        selectHora.innerHTML = "<option value=''>Selecciona una hora</option>";
        
        horas.forEach(function(hora) {
            var option = document.createElement("option");
            option.value = hora;
            option.textContent = hora;
            
            if (Array.isArray(respuesta) && respuesta.includes(hora)) {
                option.disabled = true;
                option.textContent = hora + " (Ocupado)";
                option.style.color = "#999";
            }
            
            selectHora.appendChild(option);
        });
        
        delete window[callbackName];
    };

    var url = SHEET_URL + '?accion=cargar&fecha=' + encodeURIComponent(fecha) + '&callback=' + callbackName;
    console.log("🔗 URL HORAS:", url);
    
    var script = document.createElement('script');
    script.src = url;
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

    console.log("🚀 DATOS A ENVIAR:", {nombre, telefono, servicio, fecha, hora});
    mostrarEstado("⏳ Enviando cita...", "cargando");

    var callbackName = 'cita_' + new Date().getTime();
    window[callbackName] = function(respuesta) {
        console.log("📨 RESPUESTA CITA:", respuesta);
        
        if (typeof respuesta === 'string' && respuesta.includes('ÉXITO')) {
            mostrarEstado("✅ " + respuesta, "exito");
            document.getElementById("formCita").reset();
            
            // Recargar horas
            setTimeout(cargarHoras, 1000);
        } else {
            mostrarEstado("❌ " + (respuesta || 'Error desconocido'), "error");
        }
        
        delete window[callbackName];
    };

    // Construir URL con parámetro explícito
    var url = SHEET_URL + '?' + 
        'accion=guardar&' +
        'nombre=' + encodeURIComponent(nombre) +
        '&telefono=' + encodeURIComponent(telefono) +
        '&servicio=' + encodeURIComponent(servicio) +
        '&fecha=' + encodeURIComponent(fecha) +
        '&hora=' + encodeURIComponent(hora) +
        '&callback=' + callbackName;

    console.log("🔗 URL CITA:", url);
    
    var script = document.createElement('script');
    script.src = url;
    document.head.appendChild(script);
});

// Función auxiliar para mostrar estado
function mostrarEstado(mensaje, tipo) {
    var estado = document.getElementById("estado");
    estado.textContent = mensaje;
    estado.className = tipo;
}

// Evento para cargar horas
document.getElementById("fecha").addEventListener("change", cargarHoras);
