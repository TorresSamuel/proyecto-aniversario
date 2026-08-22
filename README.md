# Proyecto aniversario — MVC

Sitio estático interactivo de cinco páginas, creado con HTML, CSS y JavaScript vainilla. No requiere instalar dependencias ni ejecutar un servidor para funcionar.

## Personalización rápida

1. Abre `models/anniversaryModel.js`.
2. Cambia los textos de `letters`, el número de meses y los datos de `concert` (lugar, ciudad, fecha y hora).
3. Abre `views/index.html` en un navegador para probarlo localmente. Para evitar limitaciones de rutas, también puedes usar una extensión como Live Server en VS Code.

La libreta de `views/future-pages.html` almacena los recuerdos en `localStorage`; por eso permanecen en ese navegador y dispositivo, sin servidor ni base de datos.

## Subir a GitHub

Desde la carpeta `proyecto-aniversario`, ejecuta:

```bash
git init
git add .
git commit -m "Primer regalo de aniversario"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/proyecto-aniversario.git
git push -u origin main
```

Antes de ejecutar los últimos dos comandos, crea en GitHub un repositorio vacío llamado `proyecto-aniversario` y reemplaza `TU-USUARIO` por tu nombre de usuario.

## Desplegar automáticamente en Netlify

1. Entra a [Netlify](https://app.netlify.com/) e inicia sesión con GitHub.
2. Selecciona **Add new site → Import an existing project** y elige el repositorio.
3. Netlify leerá `netlify.toml`: no hace falta comando de compilación y el directorio publicado es la raíz del proyecto.
4. Pulsa **Deploy site**. Cada `git push` a `main` actualizará el sitio automáticamente.

El archivo `netlify.toml` redirige la raíz del dominio hacia `views/index.html`, manteniendo la estructura MVC solicitada.

