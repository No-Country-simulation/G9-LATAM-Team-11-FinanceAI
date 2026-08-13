CREATE TABLE analisis_financiero (
    id BIGINT NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT NOT NULL,
    fecha_analisis TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_inicio DATE NULL,
    fecha_final DATE NULL,
    perfil_financiero VARCHAR(50) NOT NULL,
    nivel_endeudamiento DECIMAL(10, 2) NOT NULL,
    nivel_ahorro DECIMAL(10, 2) NOT NULL,
    recomendaciones TEXT NULL,

    PRIMARY KEY (id),
    CONSTRAINT fk_analisis_financiero_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE INDEX idx_analisis_financiero_usuario_id ON analisis_financiero (usuario_id);
