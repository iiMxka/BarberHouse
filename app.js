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
        var horas = ["11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"];
        selectHora.innerHTML = "<option value=''>Selecciona una hora</option>";
        
        horas.forEach(function(hora) {
            var option = document.createElement("option");
            option.value = hora;
            if (horasOcupadas.includes(hora)) {
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
    script.src = SHEET_URL + '?fecha=' + fecha + '&callback=' + callbackName;
    document.head.appendChild(script);
}

// Enviar cita - MÉTODO 100% CONFIRMADO
document.getElementById("formCita").addEventListener("submit", function(e) {
    e.preventDefault();
    
    var nombre = document.getElementById("nombre").value;
    var telefono = document.getElementById("telefono").value;
    var servicio = document.getElementById("servicio").value;
    var fecha = document.getElementById("fecha").value;
    var hora = document.getElementById("hora").value;

    if (!hora || hora.includes("Ocupado")) {
        document.getElementById("estado").textContent = "❌ Selecciona una hora válida";
        return;
    }

    var estado = document.getElementById("estado");
    estado.textContent = "Enviando...";
    estado.style.color = "#333";

    console.log("📤 Enviando cita:", { nombre, telefono, servicio, fecha, hora });

    // MÉTODO GARANTIZADO: JSONP para enviar citas también
    var callbackName = 'guardarCita_' + Date.now();
    window[callbackName] = function(respuesta) {
        console.log("📥 Respuesta del servidor:", respuesta);
        
        if (respuesta && respuesta.includes('OK')) {
            estado.textContent = "✅ Cita guardada EXITOSAMENTE";
            estado.style.color = "green";
            document.getElementById("formCita").reset();
            
            // Recargar horas después de 1 segundo
            setTimeout(function() {
                if (fecha) {
                    cargarHoras();
                }
            }, 1000);
        } else {
            estado.textContent = "❌ Error: " + (respuesta || 'Sin respuesta');
            estado.style.color = "red";
        }
        
        delete window[callbackName];
    };

    var params = new URLSearchParams({
        nombre: nombre,
        telefono: telefono,
        servicio: servicio,
        fecha: fecha,
        hora: hora,
        callback: callbackName
    });

    var script = document.createElement('script');
    script.src = SHEET_URL + '?' + params.toString();
    document.head.appendChild(script);
});

// Evento para cargar horas
document.getElementById("fecha").addEventListener("change", cargarHoras);
