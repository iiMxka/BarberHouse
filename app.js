const SHEET_URL = "https://script.google.com/macros/s/AKfycbz065MhkIEg3MHpK6VqrEdcP0ySUU9p3jdEfx0fUIfKF87jOM1Ph7wuojn-MtuWcxOc5g/exec";

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

// Enviar cita - MÉTODO MÁS SIMPLE
document.getElementById("formCita").addEventListener("submit", function(e) {
    e.preventDefault();
    
    var data = {
        nombre: document.getElementById("nombre").value,
        telefono: document.getElementById("telefono").value,
        servicio: document.getElementById("servicio").value,
        fecha: document.getElementById("fecha").value,
        hora: document.getElementById("hora").value
    };

    if (!data.hora || data.hora.includes("Ocupado")) {
        document.getElementById("estado").textContent = "❌ Selecciona una hora válida";
        return;
    }

    var estado = document.getElementById("estado");
    estado.textContent = "Enviando...";

    // MÉTODO DIRECTO: Formulario tradicional
    var form = document.createElement('form');
    form.method = 'POST';
    form.action = SHEET_URL;
    form.style.display = 'none';

    for (var key in data) {
        var input = document.createElement('input');
        input.name = key;
        input.value = data[key];
        form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();

    // Mensaje de éxito
    estado.textContent = "✅ Cita enviada - Actualizando...";
    estado.style.color = "green";

    // Limpiar y recargar
    setTimeout(function() {
        document.getElementById("formCita").reset();
        document.body.removeChild(form);
        if (data.fecha) {
            cargarHoras(); // Recargar horas
        }
    }, 2000);
});

// Evento para cargar horas
document.getElementById("fecha").addEventListener("change", cargarHoras);
