# Etapa 1: Compilación
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Imagen de ejecución con soporte nativo C++ para ONNX Runtime
FROM eclipse-temurin:17-jre
WORKDIR /app

# Crear usuario sin privilegios por seguridad
RUN useradd -ms /bin/bash appuser
USER appuser

# Copiar el jar compilado desde la etapa builder
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Xms256m", "-Xmx512m", "-jar", "app.jar"]
