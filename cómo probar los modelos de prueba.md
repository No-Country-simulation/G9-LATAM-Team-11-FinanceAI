# importar los últimos cambios de git
1. git pull
# levantar los contenedores de docker
2. docker compose up -d
# arrancar el servicio de data science en el navegador
3. docker compose logs data-science (ctrl + click en http://127.0.0.1:8888/lab?token=123...)
# una vez dentro abrir los 2 notebooks y correrlos (espera a que terminen)
4. entrar a work > doble click en los dos notebooks > click en la doble flecha en el primer notebook, luego en el tercero. esperar. detener el proceso y ejecutar manualmente los 2 últimos bloques (Prueba ONNX categorías y Prueba de ONNX perfiles)


