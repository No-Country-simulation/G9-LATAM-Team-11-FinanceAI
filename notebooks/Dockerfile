FROM jupyter/scipy-notebook:latest

# Copiar el archivo de requerimientos al directorio temporal del contenedor
COPY requirements.txt /tmp/requirements.txt

# Ejecutar la instalación limpia de dependencias en tiempo de build
RUN pip install --no-cache-dir -r /tmp/requirements.txt
