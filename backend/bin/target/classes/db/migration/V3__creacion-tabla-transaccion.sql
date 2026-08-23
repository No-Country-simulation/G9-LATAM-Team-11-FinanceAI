CREATE TABLE transacciones (

    id BIGINT NOT NULL AUTO_INCREMENT,
    descripcion VARCHAR(255) NOT NULL,
    monto DECIMAL(15, 2) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    fecha DATE NOT NULL,
    usuario_id BIGINT NOT NULL,

    PRIMARY KEY (id),
    CONSTRAINT fk_transacciones_usuario_id FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);