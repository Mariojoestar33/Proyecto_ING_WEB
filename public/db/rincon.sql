-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 07-11-2023 a las 19:41:28
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
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `carrito`
--

INSERT INTO `carrito` (`id`, `id_usuario`, `id_producto`, `cantidad`, `fecha_creacion`) VALUES
(1, 21, 1, 16, '2023-11-06 19:42:06');

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
  `id_direccion` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  KEY `fk_compras_direccion` (`id_direccion`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `compras`
--

INSERT INTO `compras` (`id`, `id_usuario`, `fecha_compra`, `total`, `id_direccion`) VALUES
(7, 21, '2023-10-24', '148.50', 19),
(8, 21, '2023-11-02', '48.00', 19);

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
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `detalles_compra`
--

INSERT INTO `detalles_compra` (`id`, `id_compra`, `id_producto`, `cantidad_comprada`) VALUES
(8, 7, 14, 13),
(9, 7, 4, 8),
(10, 8, 8, 8);

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
) ENGINE=MyISAM AUTO_INCREMENT=20 DEFAULT CHARSET=latin1;

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
(18, 21, 'Eten', '612-A', 'CDMX', '07730', 'San Bartolo Atepehuacan'),
(19, 21, 'Rayuel', '320', 'CDMX', '09878', 'Churubusco');

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
(8, 'Goma de borrar 1', 'Escritura', 72, 'Goma para borrar de pan.', 'images/escritura/goma_1.jpg', '6.00', 'Scribe'),
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
  `salt` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=MyISAM AUTO_INCREMENT=29 DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `nombre`, `correo`, `tipo`, `contrasenia`, `salt`) VALUES
(19, 'Mariano Peña Romero', 'mariano.pena15@gmail.com', 'administrador', '1070782220a60f7d5d3177114e400c52eba418260734f38c117d7a6415ef6e0c', '2ba1e14c0e9bbf77d7447881371cb1a4'),
(21, 'Tania', 'tann07lee04@gmail.com', 'cliente', '0e2d7e5008063fe7edd958f19ecee9e5a7031acc7093a0340a5ebbb3617fd0fa', 'e223246e25b04a8b402884c4f19645ac'),
(26, 'Jorge Ramirez Lopez', 'antonio33@gmail.com', 'editor', '5a3a1c2408cd199f8c32994f35091c142194cb3ed4f36ee44409be10846f653b', '467be222a31c5bd1d39d7f240632883a');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
