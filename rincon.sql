-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 24-10-2023 a las 20:20:50
-- Versión del servidor: 5.7.36
-- Versión de PHP: 7.4.26

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
-- Estructura de tabla para la tabla `carrito`
--

DROP TABLE IF EXISTS `carrito`;
CREATE TABLE IF NOT EXISTS `carrito` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `fecha_creacion` timestamp NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_producto` (`id_producto`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compras`
--

DROP TABLE IF EXISTS `compras`;
CREATE TABLE IF NOT EXISTS `compras` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) DEFAULT NULL,
  `fecha_compra` date DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `compras`
--

INSERT INTO `compras` (`id`, `id_usuario`, `fecha_compra`, `total`) VALUES
(7, 21, '2023-10-24', '148.50');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalles_compra`
--

DROP TABLE IF EXISTS `detalles_compra`;
CREATE TABLE IF NOT EXISTS `detalles_compra` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_compra` int(11) DEFAULT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `cantidad_comprada` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_compra` (`id_compra`),
  KEY `id_producto` (`id_producto`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `detalles_compra`
--

INSERT INTO `detalles_compra` (`id`, `id_compra`, `id_producto`, `cantidad_comprada`) VALUES
(8, 7, 14, 13),
(9, 7, 4, 8);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `direcciones`
--

DROP TABLE IF EXISTS `direcciones`;
CREATE TABLE IF NOT EXISTS `direcciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) DEFAULT NULL,
  `calle` varchar(64) DEFAULT NULL,
  `numero_exterior` varchar(10) DEFAULT NULL,
  `ciudad` varchar(64) DEFAULT NULL,
  `cp` varchar(10) DEFAULT NULL,
  `colonia` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`)
) ENGINE=MyISAM AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;

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
(15, 15, 'Calle 15', '1212', 'Ciudad O', '22334', 'Colonia L'),
(18, 21, 'Eten', '612-A', 'CDMX', '07730', 'San Bartolo Atepehuacan');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

DROP TABLE IF EXISTS `productos`;
CREATE TABLE IF NOT EXISTS `productos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(64) DEFAULT NULL,
  `categoria` varchar(64) DEFAULT NULL,
  `stock` int(11) DEFAULT NULL,
  `descripcion` varchar(64) DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `marca` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=21 DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `categoria`, `stock`, `descripcion`, `imagen`, `precio`, `marca`) VALUES
(1, 'Cuaderno Scribe rojo', 'Papel', 45, 'Cuaderno profesional de cuadro chico con 200 hojas.', 'images/papel/cuaderno_1.jpg', '45.00', 'Scribe'),
(2, 'Papel bond 1', 'Papel', 50, 'Papel bond de 200mm', 'images/papel/bond_1.jpg', '50.00', 'Scribe'),
(3, 'Bloc de notas 1', 'Papel', 74, 'Block de 200 hojas', 'images/papel/block_1.jpg', '25.00', 'Barril'),
(4, 'Bolígrafo 1', 'Escritura', 192, 'Bolígrafo negro de 0.02mm', 'images/escritura/boligrafo_1.jpg', '8.00', 'Paper Mate'),
(5, 'Lápiz 1', 'Escritura', 150, 'Lápiz de grafito', 'images/escritura/lapiz_1.jpg', '5.00', 'Bond'),
(6, 'Pegamento 1', 'Adhesivos', 0, 'Lápiz adhesivo', 'images/adhesivos/lapiz_1.jpg', '14.50', 'Barol'),
(7, 'Tijeras 1', 'Herramientas', 20, 'Tijeras para niños', 'images/herramientas/tijeras_1.jpg', '20.00', 'Barrilito'),
(8, 'Goma de borrar 1', 'Escritura', 80, 'Goma para borrar de pan.', 'images/escritura/goma_1.jpg', '6.00', 'Scribe'),
(9, 'Cinta adhesiva 1', 'Adhesivos', 40, 'Cinta adhesiva de 40 metros.', 'images/adhesivos/cinta_1.jpg', '13.00', 'Borax'),
(10, 'Marcador 1', 'Escritura', 60, 'Marcador amarillo.', 'images/escritura/marcador_1.jpg', '18.00', 'Paper Mate'),
(11, 'Cuaderno 2', 'Papel', 45, 'Cuaderno profesional de 100 hojas cuadro grande.', 'images/papel/cuaderno_2.jpg', '95.00', 'Scribe'),
(12, 'Papel bond 2', 'Papel', 90, 'Papel bond amarillo', 'images/papel/bond_2.jpg', '15.00', 'Bond'),
(13, 'Bloc de notas 2', 'Papel', 70, 'Block de notas de 50 hojas cuadro grande.', 'images/papel/block_2.jpg', '67.00', 'Norma'),
(14, 'Bolígrafo 2', 'Escritura', 167, 'Bolígrafo negro de 0.04mm.', 'images/escritura/boligrafo_2.jpg', '6.50', 'Paper Mate'),
(15, 'Lápiz 2', 'Escritura', 140, 'Lápiz de color rojo.', 'images/escritura/lapiz_2.jpg', '5.00', 'Scribe'),
(19, 'Papel día de Muertos', 'Papel', 100, 'Papel mache con temática de día de muertos.', 'images/Papel/papel-día-de-muertos.jpg', '45.00', 'Norma'),
(20, 'Libreta forma francesa', 'Papel', 20, 'Libreta Scribbe con forma francesa y rayas de 100 hojas.', 'images/Papel/libreta-forma-francesa.jpg', '98.00', 'Scribe'),
(18, 'Tijeras 3', 'Herramientas', 2, 'Si', 'images/Herramientas/tijeras-3.jpg', '24.00', 'Borax');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(64) DEFAULT NULL,
  `correo` varchar(64) DEFAULT NULL,
  `tipo` enum('administrador','editor','cliente') DEFAULT NULL,
  `contrasenia` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=MyISAM AUTO_INCREMENT=26 DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `nombre`, `correo`, `tipo`, `contrasenia`) VALUES
(19, 'Mariano Peña Romero', 'mariano.pena15@gmail.com', 'administrador', 'a2a816e9eff8ef8eb22aa464879ee3a51f7fe9757a6a3a1fa012bed349b2c258'),
(3, 'Carlos', 'carlos@example.com', 'cliente', 'hash3'),
(4, 'Laura', 'laura@example.com', 'cliente', 'hash4'),
(5, 'Pedro', 'pedro@example.com', 'cliente', 'hash5'),
(6, 'Sofía', 'sofia@example.com', 'cliente', 'hash6'),
(7, 'Luis', 'luis@example.com', 'cliente', 'hash7'),
(8, 'Ana', 'ana@example.com', 'cliente', 'hash8'),
(9, 'Miguel', 'miguel@example.com', 'cliente', 'hash9'),
(10, 'Elena', 'elena@example.com', 'cliente', 'hash10'),
(11, 'Raúl', 'raul@example.com', 'cliente', 'hash11'),
(12, 'Carmen', 'carmen@example.com', 'cliente', 'hash12'),
(13, 'Javier', 'javier@example.com', 'cliente', 'hash13'),
(14, 'Isabel', 'isabel@example.com', 'cliente', 'hash14'),
(15, 'Antonio', 'antonio@example.com', 'cliente', 'hash15'),
(18, 'Jorge', 'raiden12@gmail.com', 'editor', 'a2a816e9eff8ef8eb22aa464879ee3a51f7fe9757a6a3a1fa012bed349b2c258'),
(21, 'Tania', 'tann07lee04@gmail.com', 'cliente', '9df7d62dbc19dc31d1a11e7e9fe399babedfba0473235452fa1d357b9dddaf3c'),
(22, 'Kakas', 'masdk@hotmail.com', 'cliente', 'a2a816e9eff8ef8eb22aa464879ee3a51f7fe9757a6a3a1fa012bed349b2c258'),
(23, 'Luis Barreras', 'lksldk@gmail.com', 'cliente', 'a2a816e9eff8ef8eb22aa464879ee3a51f7fe9757a6a3a1fa012bed349b2c258'),
(25, 'lasklaslk', 'cxhagsd@gmail.com', 'editor', 'a2a816e9eff8ef8eb22aa464879ee3a51f7fe9757a6a3a1fa012bed349b2c258');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
