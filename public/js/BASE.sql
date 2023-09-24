-- CREACION DE LA BASE DE DATOS
CREATE DATABASE IF NOT EXISTS RINCON;

USE RINCON;

-- Crear la tabla de Roles
CREATE TABLE Roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(255) NOT NULL
);

-- Insertar roles
INSERT INTO Roles (role_name) VALUES
('root'),
('administrador'),
('cliente');

-- Crear la tabla de Usuarios
CREATE TABLE Usuarios (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol_id INT,
    FOREIGN KEY (rol_id) REFERENCES Roles(role_id)
);

-- Crear la tabla de Productos
CREATE TABLE Productos (
    producto_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    disponibilidad INT NOT NULL,
    categoria VARCHAR(255),
    imagen VARCHAR(255)
);

-- Crear la tabla de Pedidos (si es necesario)
CREATE TABLE Pedidos (
    pedido_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(user_id)
);

-- INSERCION DE DATOS

-- Valores para la tabla de Roles
INSERT INTO Roles (role_name) VALUES
('root'),
('administrador'),
('cliente');

-- Valores para la tabla de Usuarios
INSERT INTO Usuarios (nombre, email, contrasena, rol_id) VALUES
('Usuario Root', 'root@example.com', 'contraseña_segura', 1),
('Admin 1', 'admin1@example.com', 'contraseña_admin', 2),
('Admin 2', 'admin2@example.com', 'contraseña_admin', 2),
('Cliente 1', 'cliente1@example.com', 'contraseña_cliente', 3),
('Cliente 2', 'cliente2@example.com', 'contraseña_cliente', 3),
('Cliente 3', 'cliente3@example.com', 'contraseña_cliente', 3);

-- Valores para la tabla de Productos
INSERT INTO Productos (nombre, descripcion, precio, disponibilidad, categoria, imagen) VALUES
('Camisa Azul', 'Camisa de manga larga de color azul', 19.99, 100, 'Ropa', 'camisa_azul.jpg'),
('Pantalón Negro', 'Pantalón de tela negra para hombre', 29.99, 50, 'Ropa', 'pantalon_negro.jpg'),
('Vestido Rojo', 'Vestido de noche rojo', 39.99, 30, 'Ropa', 'vestido_rojo.jpg'),
('Bufanda de Crochet', 'Bufanda hecha a mano de crochet', 14.99, 80, 'Crochet', 'bufanda_crochet.jpg'),
('Gorro de Crochet', 'Gorro tejido a mano de crochet', 12.99, 60, 'Crochet', 'gorro_crochet.jpg'),
('Manta de Crochet', 'Manta suave tejida a mano de crochet', 49.99, 20, 'Crochet', 'manta_crochet.jpg');

-- Valores para la tabla de Pedidos (si la tienes)
-- INSERT INTO Pedidos (usuario_id) VALUES
-- (4),
-- (5);

