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
// Cargar horas con JSONP (funciona con CORS)
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

    // Crear callback único
    const callbackName = 'callback_' + new Date().getTime();
    window[callbackName] = function(horasOcupadas) {
        console.log("✅ JSONP - Horas recibidas:", horasOcupadas);
        actualizarHorasDisponibles(horasOcupadas);
        delete window[callbackName];
    };

    // Crear script para JSONP
    const script = document.createElement('script');
    script.src = `${SHEET_URL}?fecha=${fecha}&callback=${callbackName}`;
    script.onerror = function() {
        console.error("❌ JSONP - Error cargando el script");
        selectHora.innerHTML = "<option value=''>Error al cargar horas</option>";
        delete window[callbackName];
    };
    
    document.head.appendChild(script);
}

function actualizarHorasDisponibles(horasOcupadas) {
    const selectHora = document.getElementById("hora");
    const horasDisponibles = [
        "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", 
        "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"
    ];
    
    selectHora.innerHTML = "<option value=''>Selecciona una hora</option>";
    
    let horasDisponiblesCount = 0;
    
    horasDisponibles.forEach(hora => {
        const option = document.createElement("option");
        option.value = hora;
        const ocupada = Array.isArray(horasOcupadas) && horasOcupadas.includes(hora);
        
        if (ocupada) {
            option.disabled = true;
            option.textContent = hora + " (Ocupado)";
            option.style.color = "#999";
        } else {
            option.textContent = hora;
            horasDisponiblesCount++;
        }
        selectHora.appendChild(option);
    });
    
    if (horasDisponiblesCount === 0) {
        selectHora.innerHTML = "<option value=''>No hay horas disponibles</option>";
    }
    
    console.log(`🕒 ${horasDisponiblesCount} horas disponibles`);
}

// Evento al cambiar la fecha
document.getElementById("fecha").addEventListener("change", cargarHoras);

// ===================
// Enviar cita con POST (esto SÍ funciona con CORS)
// ===================
document.getElementById("formCita").addEventListener("submit", async e => {
    e.preventDefault();
    
    const data = {
        nombre: document.getElementById("nombre").value,
        telefono: document.getElementById("telefono").value,
        servicio: document.getElementById("servicio").value,
        fecha: document.getElementById("fecha").value,
        hora: document.getElementById("hora").value
    };

    if (!data.hora || data.hora.includes("Ocupado") || data.hora === "Selecciona una hora") {
        document.getElementById("estado").textContent = "❌ Por favor selecciona una hora válida";
        return;
    }

    const estado = document.getElementById("estado");
    estado.textContent = "Enviando...";
    estado.style.color = "#333";

    try {
        console.log("📤 Enviando cita:", data);
        const res = await fetch(SHEET_URL, {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
        });

        const text = await res.text();
        console.log("📥 Respuesta del servidor:", text);
        
        if(text.includes("OK")) {
            estado.textContent = "✅ Cita registrada con éxito";
            estado.style.color = "green";
            document.getElementById("formCita").reset();
            if (document.getElementById("fecha").value) cargarHoras();
        } else {
            estado.textContent = "❌ Error al registrar la cita";
            estado.style.color = "red";
        }
    } catch (error) {
        console.error("❌ Error:", error);
        estado.textContent = "❌ Error de conexión al registrar la cita";
        estado.style.color = "red";
    }
});
