-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 17-10-2023 a las 04:16:39
-- Versión del servidor: 8.0.31
-- Versión de PHP: 8.0.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `rincon`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compras`
--

DROP TABLE IF EXISTS `compras`;
CREATE TABLE IF NOT EXISTS `compras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `id_producto` int DEFAULT NULL,
  `fecha_compra` date DEFAULT NULL,
  `cantidad_comprada` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_producto` (`id_producto`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `compras`
--

INSERT INTO `compras` (`id`, `id_usuario`, `id_producto`, `fecha_compra`, `cantidad_comprada`) VALUES
(1, 1, 1, '2023-10-01', 5),
(2, 2, 2, '2023-10-02', 3),
(3, 3, 3, '2023-10-03', 10),
(4, 4, 4, '2023-10-04', 2),
(5, 5, 5, '2023-10-05', 7),
(6, 6, 6, '2023-10-06', 4),
(7, 7, 7, '2023-10-07', 6),
(8, 8, 8, '2023-10-08', 8),
(9, 9, 9, '2023-10-09', 3),
(10, 10, 10, '2023-10-10', 5),
(11, 11, 11, '2023-10-11', 2),
(12, 12, 12, '2023-10-12', 7),
(13, 13, 13, '2023-10-13', 3),
(14, 14, 14, '2023-10-14', 4),
(15, 15, 15, '2023-10-15', 9);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `direcciones`
--

DROP TABLE IF EXISTS `direcciones`;
CREATE TABLE IF NOT EXISTS `direcciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `calle` varchar(64) DEFAULT NULL,
  `numero_exterior` varchar(10) DEFAULT NULL,
  `ciudad` varchar(64) DEFAULT NULL,
  `cp` varchar(10) DEFAULT NULL,
  `colonia` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `direcciones`
--

INSERT INTO `direcciones` (`id`, `id_usuario`, `calle`, `numero_exterior`, `ciudad`, `cp`, `colonia`) VALUES
(1, 1, 'Calle 1', '123', 'Ciudad A', '12345', 'Colonia X'),
(2, 2, 'Calle 2', '456', 'Ciudad B', '67890', 'Colonia Y'),
(3, 3, 'Calle 3', '789', 'Ciudad C', '98765', 'Colonia Z'),
(4, 4, 'Calle 4', '101', 'Ciudad D', '54321', 'Colonia W'),
(5, 5, 'Calle 5', '202', 'Ciudad E', '11223', 'Colonia V'),
(6, 6, 'Calle 6', '303', 'Ciudad F', '99887', 'Colonia U'),
(7, 7, 'Calle 7', '404', 'Ciudad G', '33445', 'Colonia T'),
(8, 8, 'Calle 8', '505', 'Ciudad H', '77666', 'Colonia S'),
(9, 9, 'Calle 9', '606', 'Ciudad I', '22557', 'Colonia R'),
(10, 10, 'Calle 10', '707', 'Ciudad J', '66778', 'Colonia Q'),
(11, 11, 'Calle 11', '808', 'Ciudad K', '88999', 'Colonia P'),
(12, 12, 'Calle 12', '909', 'Ciudad L', '11222', 'Colonia O'),
(13, 13, 'Calle 13', '1010', 'Ciudad M', '99000', 'Colonia N'),
(14, 14, 'Calle 14', '1111', 'Ciudad N', '55443', 'Colonia M'),
(15, 15, 'Calle 15', '1212', 'Ciudad O', '22334', 'Colonia L');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

DROP TABLE IF EXISTS `productos`;
CREATE TABLE IF NOT EXISTS `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(64) DEFAULT NULL,
  `categoria` varchar(64) DEFAULT NULL,
  `stock` int DEFAULT NULL,
  `descripcion` varchar(64) DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `marca` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `categoria`, `stock`, `descripcion`, `imagen`, `precio`, `marca`) VALUES
(1, 'Cuaderno Scribe rojo', 'Papel', 50, 'Cuaderno profesional de cuadro chico con 200 hojas.', 'images/papel/cuaderno_1.jpg', '45.00', 'Scribe'),
(2, 'Papel bond 1', 'Papel', 100, 'Papel bond de 200mm', 'images/papel/bond_1.jpg', '50.00', 'Scribe'),
(3, 'Bloc de notas 1', 'Papel', 75, 'Block de 200 hojas', 'images/papel/block_1.jpg', '25.00', 'Barril'),
(4, 'Bolígrafo 1', 'Escritura', 200, 'Bolígrafo negro de 0.02mm', 'images/escritura/boligrafo_1.jpg', '8.00', 'Paper Mate'),
(5, 'Lápiz 1', 'Escritura', 150, 'Lápiz de grafito', 'images/escritura/lapiz_1.jpg', '5.00', 'Bond'),
(6, 'Pegamento 1', 'Adhesivos', 30, 'Lápiz adhesivo', 'images/adhesivos/lapiz_1.jpg', '14.50', 'Barol'),
(7, 'Tijeras 1', 'Herramientas', 20, 'Tijeras para niños', 'images/herramientas/tijeras_1.jpg', '20.00', 'Barrilito'),
(8, 'Goma de borrar 1', 'Escritura', 80, 'Goma para borrar de pan.', 'images/escritura/goma_1.jpg', '6.00', 'Scribe'),
(9, 'Cinta adhesiva 1', 'Adhesivos', 40, 'Cinta adhesiva de 40 metros.', 'images/adhesivos/cinta_1.jpg', '13.00', 'Borax'),
(10, 'Marcador 1', 'Escritura', 60, 'Marcador amarillo.', 'images/escritura/marcador_1.jpg', '18.00', 'Paper Mate'),
(11, 'Cuaderno 2', 'Papel', 45, 'Cuaderno profesional de 100 hojas cuadro grande.', 'images/papel/cuaderno_2.jpg', '95.00', 'Scribe'),
(12, 'Papel bond 2', 'Papel', 90, 'Papel bond amarillo', 'images/papel/bond_2.jpg', '15.00', 'Bond'),
(13, 'Bloc de notas 2', 'Papel', 70, 'Block de notas de 50 hojas cuadro grande.', 'images/papel/block_2.jpg', '67.00', 'Norma'),
(14, 'Bolígrafo 2', 'Escritura', 180, 'Bolígrafo negro de 0.04mm.', 'images/escritura/boligrafo_2.jpg', '6.50', 'Paper Mate'),
(15, 'Lápiz 2', 'Escritura', 140, 'Lápiz de color rojo.', 'images/escritura/lapiz_2.jpg', '5.00', 'Scribe'),
(19, 'Papel día de Muertos', 'Papel', 100, 'Papel mache con temática de día de muertos.', 'images/Papel/papel-día-de-muertos.jpg', '45.00', 'Norma'),
(20, 'Libreta forma francesa', 'Papel', 20, 'Libreta Scribbe con forma francesa y rayas de 100 hojas.', 'images/Papel/libreta-forma-francesa.jpg', '98.00', 'Scribe'),
(18, 'Tijeras-3', 'Herramientas', 2, 'Si', 'images/Herramientas/tijeras-3.jpg', '24.00', 'Borax');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(64) DEFAULT NULL,
  `apellido` varchar(64) DEFAULT NULL,
  `correo` varchar(64) DEFAULT NULL,
  `tipo_usuario` enum('administrador','editor','cliente') DEFAULT NULL,
  `contrasena_hash` varchar(255) DEFAULT NULL,
  `salt` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `nombre`, `apellido`, `correo`, `tipo_usuario`, `contrasena_hash`, `salt`) VALUES
(1, 'Mariano', 'Peña Romero', 'mariano.pena15@gmail.com', 'administrador', 'Halohola', 'salt1'),
(2, 'Tania', 'Soto Hernandez', 'tann07lee04@gmail.com', 'editor', 'contraseña', 'salt2'),
(3, 'Carlos', 'López', 'carlos@example.com', 'cliente', 'hash3', 'salt3'),
(4, 'Laura', 'Martínez', 'laura@example.com', 'cliente', 'hash4', 'salt4'),
(5, 'Pedro', 'González', 'pedro@example.com', 'cliente', 'hash5', 'salt5'),
(6, 'Sofía', 'Rodríguez', 'sofia@example.com', 'cliente', 'hash6', 'salt6'),
(7, 'Luis', 'Fernández', 'luis@example.com', 'cliente', 'hash7', 'salt7'),
(8, 'Ana', 'Díaz', 'ana@example.com', 'cliente', 'hash8', 'salt8'),
(9, 'Miguel', 'Hernández', 'miguel@example.com', 'cliente', 'hash9', 'salt9'),
(10, 'Elena', 'Sánchez', 'elena@example.com', 'cliente', 'hash10', 'salt10'),
(11, 'Raúl', 'Ramírez', 'raul@example.com', 'cliente', 'hash11', 'salt11'),
(12, 'Carmen', 'Torres', 'carmen@example.com', 'cliente', 'hash12', 'salt12'),
(13, 'Javier', 'Pérez', 'javier@example.com', 'cliente', 'hash13', 'salt13'),
(14, 'Isabel', 'González', 'isabel@example.com', 'cliente', 'hash14', 'salt14'),
(15, 'Antonio', 'López', 'antonio@example.com', 'cliente', 'hash15', 'salt15');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
