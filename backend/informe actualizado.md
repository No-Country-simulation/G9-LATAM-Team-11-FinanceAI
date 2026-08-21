## Lo que ya está listo
- El servidor de Spring Boot arranca correctamente y expone endpoints funcionales para registrar usuarios y transacciones (TransaccionController.java).
- La persistencia de base de datos MySQL y las migraciones de Flyway están totalmente operativas.
- La librería de ONNX Runtime ya está disponible en el proyecto gracias a que la dependencia está activa en el pom.xml.

## Lo que falta
Aunque la librería de ONNX está instalada, el backend no tiene escrita ninguna línea de código para comunicarse con los modelos de Data Science:
- No hay un Servicio de Inferencia en Java: No existe ninguna clase encargada de cargar los archivos .onnx (ubicados en /app/models/ dentro del contenedor) ni de ejecutar la sesión de inferencia (OrtSession).
- La categoría se sigue recibiendo de forma manual: En TransacionService.java y en el constructor de Transaccion.java
 se asigna directamente la categoría que se envía manualmente en el DTO, ignorando el modelo de IA.
- No hay Endpoints de prueba: No hay ningún controlador que reciba una petición de Postman, la envíe al modelo ONNX de transacciones y devuelva la categoría predicha.

## Sobre ONNX
Para poder hacer una primera prueba con Postman, el equipo de backend debe crear una clase servicio (por ejemplo, InferenciaService.java) que:

- Cargue el archivo modelo_transacciones.onnx.
- Exponga un método para recibir la descripción (ej: "Pago de luz"), corra el modelo y retorne la categoría predicha.
- Exponga un endpoint provisional (ej: POST /api/pruebas/clasificar) para recibir el texto de Postman y responder con la categoría calculada por el modelo.

