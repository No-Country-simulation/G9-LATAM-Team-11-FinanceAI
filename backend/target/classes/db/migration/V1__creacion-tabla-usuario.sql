CREATE TABLE usuarios(

    id bigint NOT NULL auto_increment,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    ingreso_mensual DECIMAL(15, 2) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    activo BOOLEAN DEFAULT TRUE NOT NULL,

    PRIMARY KEY(id)

);
