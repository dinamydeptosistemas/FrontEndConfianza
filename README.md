# Confianza - Sistema de Control de Negocio

MODULO AUTENTICACION
Modulo de autenticación para el sistema Confianza, que maneja el inicio de sesión y cierre de sesión de usuarios internos y externos.

## Endpoints de este servicio

### Login (`POST /api/Auth/login`)

Autentica a un usuario y genera un token JWT.

**Request:**
```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "dni": "string",
  "userType": "number" // 1: interno, 2: externo
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "userId": "number",
  "username": "string",
  "email": "string",
  "token": "string",
  "userFunction": "number",
  "permissions": {
    "AllowPermissions": "boolean",
    "AdministrationAccess": "boolean",
    // ... otros permisos
  }
}
```

**Response Error (401):**
```json
{
  "success": false,
  "message": "Credenciales inválidas"
}
```

### Logout (`POST /api/auth/logout-cookie`)

Cierra la sesión del usuario y ejecuta el stored procedure `sp_CloseSession`.

**Request:**
```json
{
  "userId": "number"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente",
  "hoursWorked": "number",
  "fullDayCompleted": "boolean",
  "sessionBlocked": "boolean"
}
```

## Flujo de Autenticación

1. **Inicio de Sesión:**
   - Cliente envía credenciales
   - Servidor valida con `sp_UserLogin`
   - Si es válido, genera token JWT
   - Retorna token y datos del usuario

2. **Durante la Sesión:**
   - Cliente incluye token en header: `Authorization: Bearer {token}`
   - Servidor valida token en cada request
   - Se registra actividad del token

3. **Cierre de Sesión:**
   - Cliente envía petición de logout
   - Servidor ejecuta `sp_CloseSession`
   - Se limpian datos de sesión

## Variables de Entorno

```env
# Frontend (.env)
REACT_APP_API_URL=http://localhost:5201

# Backend (appsettings.json o variables de entorno)
DB_CONNECTION=connection_string
JWT_KEY=your_jwt_key
JWT_ISSUER=your_issuer
JWT_AUDIENCE=your_audience
```