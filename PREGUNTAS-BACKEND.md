# Preguntas para el equipo de Backend

Hola equipo, estoy integrando el dashboard con la API. Ya logré levantar el entorno local y probar la conexión, pero me quedaron un par de dudas para dejar el flujo redondo. Les dejo las preguntas por prioridad para que sea fácil responderlas.

## Contexto

Estoy probando este flujo: crear un usuario → crear transacciones → traer las transacciones por rango de fechas → mostrar el análisis financiero. Por ahora el frontend funciona con datos de demostración; quiero pasar a datos reales de la API.

## Bloqueantes (me frenan para probar el flujo completo)

1. **¿Existe un endpoint de login por email y contraseña?**
   Hoy la API solo tiene `POST /usuario` (crear), `GET /usuario/{id}` y `/usuario/activos/mesanio`. Para que un usuario vuelva a entrar uso un mock en el navegador. Si existe (o está en camino) un endpoint de autenticación, avisenme y lo integro.

2. **¿`POST /usuario` puede devolver el id del usuario creado?**
   Hoy responde solo un mensaje de texto (*"Usuario X creado con exito!"*). Necesito el id para los siguientes llamados y hoy lo estoy "adivinando" con otra consulta. Con el id en la respuesta sería mucho más simple y robusto.

3. **¿`/usuario/activos/mesanio` excluye a los usuarios sin transacciones?**
   La consulta usa `LEFT JOIN … WHERE MONTH(t.fecha) = :mes`, así que un usuario recién creado (sin transacciones aún) no aparece en el listado. Eso me rompe el paso del registro. ¿Es el comportamiento esperado?

4. **Variables de entorno de la base de datos: ¿cuál es la correcta?**
   `application.properties` lee `DB_PASS`, pero el `docker-compose.yml` expone `DB_PASSWORD`. Por eso el backend no arranca (error `Access denied`). ¿Cuál de las dos debería usar?

5. **¿El backend tiene configuración CORS?**
   El frontend corre en `:8082` y llama a la API en `:8081`; sin CORS el navegador bloquea las peticiones. ¿Lo resuelven de su lado o sigo con el proxy de Vite en desarrollo? ¿Y en producción van por un dominio o gateway común?

## Contrato de datos

6. **Categorización de transacciones** 
   Me queda una duda del DTO: `POST /transaccion` exige `categoria` con `@NotNull`. Si la categoría la asignan ustedes, ¿el endpoint va a aceptar transacciones sin categoría y devolverla ya asignada? Así el frontend no tiene que mandarla.

7. **¿Cómo distingo un ingreso de un gasto?**
   Al crear una transacción, el monto se descuenta del `ingresoMensual`, y en la interfaz asumo que todo es gasto. Si hay soporte para ingresos, ¿cómo se marca?

8. **`GET /usuario/{id}` devuelve las transacciones incompletas**
   En esa respuesta las transacciones vienen solo con `{categoria, monto}`. Para las listas y el detalle necesito también `descripcion` y `fecha`. ¿Pueden alinear ese DTO con `DetallesTransaccionFiltradaDTO` (id, descripcion, monto, categoria, fecha)?

9. **Formato de fechas**
   Confirmo que usan ISO (`yyyy-MM-dd`, tipo `LocalDate`). Avisen si por alguna razón esperan otro formato y lo ajusto.

## Análisis financiero

10. **¿`POST /analisis-financiero` ya está disponible?**
    Desde el frontend lo llamo con algo así:

    ```json
    {
      "transacciones": [{ "descripcion": "Supermercado", "valor": 1500 }],
      "frecuenciaAhorro": "Baja",
      "ingresoMensual": 4500
    }
    ```

    Si el formato esperado es otro, cuéntenme cuál es para ajustar el envío.

Desde ya muchas gracias. 