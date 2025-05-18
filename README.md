# Siempre Contigo

Aplicación web desarrollada con Ionic React, Tailwind CSS, Node.js, Express.js y MySQL.

## Requisitos Previos

- Node.js (v14 o superior)
- MySQL (v8 o superior)
- npm o yarn

## Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone [URL]
cd Siempre-contigo
```

### 2. Configurar la Base de Datos

1. Inicia MySQL:
```bash
mysql -u root -p
```

2. Crea la base de datos:
```sql
CREATE DATABASE siempre_contigo;
```

3. Configura el usuario root (si es necesario):
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
FLUSH PRIVILEGES;
```

### 3. Configurar el Backend

1. Navega al directorio del servidor:
```bash
cd server
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor:
```bash
npm run dev
```

El servidor estará corriendo en `http://localhost:3000`

### 4. Configurar el Frontend

1. En una nueva terminal, navega al directorio del cliente:
```bash
cd client
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el cliente:
```bash
npm run dev
```

El cliente estará corriendo en `http://localhost:5173`

## Credenciales de Acceso

Para acceder al sistema, utiliza las siguientes credenciales:

- **Email**: admin@example.com
- **Password**: admin123

## Tecnologías Utilizadas

- **Frontend**:
  - Ionic React
  - Tailwind CSS
  - TypeScript
  - React Router

- **Backend**:
  - Node.js
  - Express.js
  - MySQL
  - Sequelize ORM
  - JWT para autenticación

## Contribución

1. Crea una rama para tu feature (`git checkout -b feature/Abc`)
2. Commit tus cambios (`git commit -m 'Add some Abc'`)
3. Push a la rama (`git push origin feature/Abc`)
4. Abre un Pull Request

