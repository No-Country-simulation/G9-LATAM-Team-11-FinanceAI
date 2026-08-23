#!/bin/bash

# 1. Obtener Token de Acceso
echo "Obteniendo token de acceso para piricola@mail.com..."
RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email": "piricola@mail.com", "password": "password123"}' \
  http://localhost:8081/login)

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN" ]; then
  echo "Error: No se pudo obtener el token. ¿Está levantado el backend y el usuario actualizado?"
  exit 1
fi

echo "Token obtenido con éxito."

# Función para agregar transacciones
add_tx() {
  local desc="$1"
  local monto="$2"
  local fecha="$3"
  echo "Registrando transacción: $desc ($monto) en fecha $fecha..."
  curl -s -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"idUsuario\": 1, \"monto\": $monto, \"descripcion\": \"$desc\", \"fecha\": \"$fecha\"}" \
    http://localhost:8081/transaccion
  echo -e "\n"
}

# Función para actualizar sueldo
update_salary() {
  local sueldo="$1"
  echo "Actualizando sueldo a: $sueldo..."
  curl -s -X PUT \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"nuevoSueldo\": $sueldo}" \
    http://localhost:8081/usuario/1/sueldo
  echo -e "\n"
}

# 2. Cargar historial de sueldos en 2026
echo "--- Cargando Historial de Sueldos ---"
update_salary 2500.00
update_salary 3200.00
update_salary 4100.00
update_salary 4500.00

# 3. Cargar transacciones del histórico 2026
echo "--- Cargando Transacciones del 2026 ---"

# Enero 2026
add_tx "pago de alquiler del departamento" 800.00 "2026-01-05"
add_tx "compra mensual de mercaderia" 200.00 "2026-01-15"
add_tx "pago de boleta de luz" 50.00 "2026-01-20"

# Febrero 2026
add_tx "carga de tarjeta subte transporte" 100.00 "2026-02-05"
add_tx "compra de medicamentos en farmacia" 120.00 "2026-02-12"
add_tx "entradas para el cine ocio" 40.00 "2026-02-25"

# Marzo 2026
add_tx "matricula del curso de programacion" 300.00 "2026-03-02"
add_tx "compra de licuadora para la cocina" 450.00 "2026-03-10"
add_tx "pago de alquiler del departamento" 800.00 "2026-03-05"

# Abril 2026
add_tx "compra de pantalon y zapatillas" 150.00 "2026-04-10"
add_tx "compra de acciones de apple inversion" 500.00 "2026-04-15"
add_tx "pago de alquiler del departamento" 800.00 "2026-04-05"

# Mayo 2026
add_tx "compra de carne y verduras" 250.00 "2026-05-12"
add_tx "pago mensual de abono de internet" 60.00 "2026-05-18"
add_tx "pago de alquiler del departamento" 900.00 "2026-05-05"

# Junio 2026
add_tx "nafta para el auto combustible" 120.00 "2026-06-08"
add_tx "consulta medica de control salud" 90.00 "2026-06-15"
add_tx "pago de alquiler del departamento" 900.00 "2026-06-05"

# Julio 2026
add_tx "libros de estudio de ingenieria educacion" 150.00 "2026-07-04"
add_tx "cena y bar con amigos ocio nocturno" 80.00 "2026-07-18"
add_tx "pago de alquiler del departamento" 900.00 "2026-07-05"

# Agosto 2026 (mes actual en los tests)
add_tx "comida en supermercado alimentacion" 180.00 "2026-08-10"
add_tx "pago de servicio de agua" 70.00 "2026-08-14"
add_tx "pago de alquiler del departamento" 950.00 "2026-08-05"

# 4. Verificar resultados
echo "--- Verificaciones de Prueba ---"
echo "Obteniendo datos del usuario 1:"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8081/usuario/1
echo -e "\n\nObteniendo historial de sueldo:"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8081/usuario/1/historial-sueldo
echo -e "\n\nObteniendo transacciones de 2026:"
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:8081/transaccion/rangos?idUsuario=1&desde=2026-01-01&hasta=2026-12-31"
echo -e "\n\nObteniendo análisis financiero para el mes de agosto:"
curl -s -H "Authorization: Bearer $TOKEN" -X POST http://localhost:8081/analisisfinanciero/guardar/1
echo -e "\n\nCarga de datos finalizada con éxito."
