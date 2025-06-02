CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) UNIQUE NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  rol ENUM('Admin', 'Cuidador', 'Familiar'),
  activo BOOLEAN DEFAULT TRUE,
  conectado BOOLEAN DEFAULT FALSE
);

CREATE TABLE residentes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  nacimiento DATE,
  estado_salud TEXT,
  habitacion VARCHAR(50),
  ingreso DATE,
  activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE residentes_familiares (
  id INT AUTO_INCREMENT PRIMARY KEY,
  residente_id INT NOT NULL,
  familiar_id INT NOT NULL,
  FOREIGN KEY (residente_id) REFERENCES residentes(id),
  FOREIGN KEY (familiar_id) REFERENCES usuarios(id),
  UNIQUE(residente_id, familiar_id)
);

CREATE TABLE residentes_cuidadores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  residente_id INT NOT NULL,
  cuidador_id INT NOT NULL,
  FOREIGN KEY (residente_id) REFERENCES residentes(id),
  FOREIGN KEY (cuidador_id) REFERENCES usuarios(id),
  UNIQUE(residente_id, cuidador_id)
);

CREATE TABLE notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
  contenido TEXT NOT NULL,
  destinatario_id INT,
  leida BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (destinatario_id) REFERENCES usuarios(id)
);

CREATE TABLE reportes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE,
  descripcion TEXT,
  residente_id INT,
  emisor_id INT,
  FOREIGN KEY (residente_id) REFERENCES residentes(id),
  FOREIGN KEY (emisor_id) REFERENCES usuarios(id)
);

CREATE TABLE medicacion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  dosis VARCHAR(100),
  horario VARCHAR(100),
  fecha_hora DATETIME,
  cuidador_id INT,
  residente_id INT,
  estado VARCHAR(50),
  FOREIGN KEY (cuidador_id) REFERENCES usuarios(id),
  FOREIGN KEY (residente_id) REFERENCES residentes(id)
);

CREATE TABLE alimentacion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo VARCHAR(100),
  descripcion TEXT,
  hora TIME,
  fecha_hora DATETIME,
  residente_id INT,
  cuidador_id INT,
  FOREIGN KEY (residente_id) REFERENCES residentes(id),
  FOREIGN KEY (cuidador_id) REFERENCES usuarios(id)
);

CREATE TABLE videollamadas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  solicitante_id INT,
  residente_id INT,
  fecha DATETIME,
  FOREIGN KEY (solicitante_id) REFERENCES usuarios(id),
  FOREIGN KEY (residente_id) REFERENCES residentes(id)
);

CREATE TABLE actividad (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(100) NOT NULL,
  descripcion TEXT,
  fecha DATETIME NOT NULL,
  lugar VARCHAR(100),
  estado ENUM('Pendiente', 'En Progreso', 'Completado', 'Incompleto') DEFAULT 'Pendiente',
  tipo ENUM('Medicamento', 'Terapia', 'Recreacional', 'Paseo', 'Ejercicio', 'Cita', 'Alimentacion', 'Videollamada'),
  residente_id INT NOT NULL,
  cuidador_id INT NOT NULL,
  FOREIGN KEY (residente_id) REFERENCES residentes(id),
  FOREIGN KEY (cuidador_id) REFERENCES usuarios(id)
);

CREATE TABLE actividad_videollamada (
  actividad_id INT PRIMARY KEY,
  videollamada_id INT NOT NULL,
  FOREIGN KEY (actividad_id) REFERENCES actividad(id) ON DELETE CASCADE,
  FOREIGN KEY (videollamada_id) REFERENCES videollamadas(id)
);

CREATE TABLE actividad_alimentacion (
  actividad_id INT PRIMARY KEY,
  alimentacion_id INT NOT NULL,
  FOREIGN KEY (actividad_id) REFERENCES actividad(id) ON DELETE CASCADE,
  FOREIGN KEY (alimentacion_id) REFERENCES alimentacion(id)
);

CREATE TABLE actividad_medicacion (
  actividad_id INT PRIMARY KEY,
  medicacion_id INT NOT NULL,
  FOREIGN KEY (actividad_id) REFERENCES actividad(id) ON DELETE CASCADE,
  FOREIGN KEY (medicacion_id) REFERENCES medicacion(id)
);

CREATE TABLE registro_cambios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  tipo VARCHAR(50),
  descripcion TEXT,
  usuario_id INT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE conversaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(100)
);

CREATE TABLE participantes_chat (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversacion_id INT,
  usuario_id INT,
  FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE mensajes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversacion_id INT,
  remitente_id INT,
  contenido TEXT,
  fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
  archivo_url TEXT,
  FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id),
  FOREIGN KEY (remitente_id) REFERENCES usuarios(id)
);
