-- Migración para corregir la integración de alimentación y medicación con actividades
-- Ejecutar este script para actualizar la base de datos existente

-- 1. Agregar nuevos campos a la tabla alimentacion
ALTER TABLE alimentacion 
ADD COLUMN fecha_hora DATETIME,
ADD COLUMN residente_id INT,
ADD COLUMN cuidador_id INT,
ADD FOREIGN KEY (residente_id) REFERENCES residentes(id),
ADD FOREIGN KEY (cuidador_id) REFERENCES usuarios(id);

-- 2. Agregar campo fecha_hora a la tabla medicacion
ALTER TABLE medicacion 
ADD COLUMN fecha_hora DATETIME;

-- 3. Modificar el ENUM de tipo en la tabla actividad para incluir los nuevos tipos
ALTER TABLE actividad 
MODIFY COLUMN tipo ENUM('Medicamento', 'Terapia', 'Recreacional', 'Paseo', 'Ejercicio', 'Cita', 'Alimentacion', 'Videollamada');

-- 4. Modificar el ENUM de estado en la tabla actividad para ser consistente
ALTER TABLE actividad 
MODIFY COLUMN estado ENUM('Pendiente', 'En Progreso', 'Completado', 'Incompleto') DEFAULT 'Pendiente';

-- 5. Modificar el campo fecha para que sea DATETIME en lugar de DATE
ALTER TABLE actividad 
MODIFY COLUMN fecha DATETIME NOT NULL;

-- 6. Actualizar registros existentes si los hay (opcional)
-- UPDATE actividad SET estado = 'Pendiente' WHERE estado = 'Incompleto' OR estado IS NULL;

-- Verificar los cambios
DESCRIBE alimentacion;
DESCRIBE medicacion;
DESCRIBE actividad; 