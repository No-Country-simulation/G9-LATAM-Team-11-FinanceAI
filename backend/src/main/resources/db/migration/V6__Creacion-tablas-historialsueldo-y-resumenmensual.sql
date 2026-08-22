CREATE TABLE historial_sueldo (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    sueldo_anterior DECIMAL(19, 2) NOT NULL,
    sueldo_nuevo DECIMAL(19, 2) NOT NULL,
    fecha_modificacion DATETIME NOT NULL,
    CONSTRAINT fk_historial_sueldo_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE resumen_mensual (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    anio INT NOT NULL,
    mes INT NOT NULL,
    sueldo_base DECIMAL(19, 2) NOT NULL,
    sobrante_mes_anterior DECIMAL(19, 2) NOT NULL,
    gastado_en_el_mes DECIMAL(19, 2) NOT NULL,
    sobrante_final DECIMAL(19, 2) NOT NULL,
    CONSTRAINT fk_resumen_mensual_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);