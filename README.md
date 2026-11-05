# App Sales: interfaz de ventas

Aplicación web para consultar productos, registrar ventas y revisar el historial. Este documento explica cómo preparar el proyecto, ejecutarlo y entender cómo se comunica con `api-sales`.

## 1. Tecnologías y versiones

- Angular `16.2.12` (Angular CLI `16.2.10`).
- Node.js `18.20.8` y npm `10.8.2` usados para validar este proyecto.
- TypeScript `5.1.6` y RxJS `7.8.1`.
- Bootstrap `5.3.2`, Remix Icon y estilos propios.
- Pruebas unitarias con Jasmine y Karma.

Angular 16 admite Node `^16.14.0` o `^18.10.0` y TypeScript `>=4.9.3 <5.2.0`; Node 18.20.8 y TypeScript 5.1.6 cumplen esas restricciones. Esta es una combinación para reproducir el proyecto existente, no una recomendación para un sistema nuevo: Node 18 ya terminó su ciclo de soporte y Angular 16 dejó de recibir soporte. Antes de desplegar un producto expuesto a Internet, preparen una actualización de plataforma planificada, con pruebas de compatibilidad y revisión de cambios. [Compatibilidad de Angular](https://angular.dev/reference/versions) · [Ciclo de vida de Node.js](https://nodejs.org/en/about/eol)

## 2. Requisitos previos

Instala Node.js 18.20.8 y npm 10.8.2, y asegúrate de que ambos se encuentren en `PATH`. En PowerShell, si la instalación está en la ubicación usada durante la validación:

```powershell
$nodeHome = 'C:\tools\node-v18.20.8-win-x64'
$env:PATH = "$nodeHome;$env:PATH"
node -v
npm -v
```

Se necesitan Git y acceso al repositorio. El backend Laravel es un proceso separado; para que las pantallas carguen datos también debe estar configurado y ejecutándose.

## 3. Instalación y ejecución local

Desde la carpeta `app-sales` instala exactamente las dependencias fijadas en `package-lock.json`:

```bash
npm ci
```

`npm ci` está pensado para instalaciones reproducibles: usa el lockfile y no actualiza las versiones declaradas. No edites el lockfile para resolver alertas sin acordar primero una actualización y validar la aplicación.

Inicia el backend en otra terminal desde `api-sales`:

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

Luego, desde `app-sales`, inicia Angular:

```bash
npm start
```

Abre `http://localhost:4200`. En desarrollo, la URL del backend se define en `src/environments/environment.ts` y apunta a `http://127.0.0.1:8000/api`. El backend debe permitir el origen local de Angular mediante CORS. Si la API no está disponible, la interfaz puede mostrar su estado de error, pero no podrá obtener ni guardar datos.

## 4. Configuración de la API y seguridad

La aplicación lee la URL base desde `environment.apiUrl`:

- Desarrollo: `http://127.0.0.1:8000/api`.
- Producción: `/api`, configurado en `src/environments/environment.prod.ts` y seleccionado mediante el reemplazo de archivo de `angular.json`.

Una aplicación Angular se descarga y ejecuta en el navegador. Por eso, los valores de `environment` **no son secretos**: no pongas contraseñas, tokens privados ni credenciales en estos archivos. Cualquier persona puede inspeccionar los archivos compilados.

En producción, publica el frontend detrás de un servidor web o proxy que entregue la aplicación y reenvíe las solicitudes de `/api` al backend Laravel. El proxy debe preservar métodos, rutas y cuerpos JSON, y reenviar los códigos HTTP de Laravel. Configura también el fallback de rutas de la aplicación para que una visita directa a `/sales/history` entregue `index.html`. El backend debe restringir CORS a los orígenes reales que necesite el producto; CORS no sustituye autenticación ni autorización.

## 5. Navegación y pantallas

| Ruta | Pantalla | Función |
| --- | --- | --- |
| `/dashboard` | Dashboard | Resumen visual y accesos a las secciones. |
| `/products` | Productos | Catálogo de inventario con búsqueda, imagen, precio, stock y estado. No registra ventas ni contiene carrito. |
| `/sales/new` | Nueva venta (POS) | Selección de productos en un catálogo y carrito independiente. Permite ajustar cantidades, revisar subtotales y enviar la venta. |
| `/sales/history` | Historial | Consulta ventas, revisa sus detalles y permite solicitar su eliminación con confirmación. |
| Cualquier otra ruta | No encontrada | Página de ruta inexistente. |

El proyecto usa Angular Router. La estructura existente organiza la aplicación en módulos y componentes Angular; el módulo principal registra las pantallas y servicios compartidos. Las rutas se cargan de forma eager (junto con la aplicación), no mediante lazy loading.

## 6. Servicios y contratos usados

Los servicios encapsulan las llamadas HTTP para que las pantallas no construyan URL manualmente:

- `ProductService`: consulta el catálogo con `GET /products`.
- `SalesService`: registra ventas con `POST /sales`, consulta `GET /sales` y elimina con `DELETE /sales/{id}`.
- `CartService`: mantiene el carrito de la pantalla POS y calcula importes estimados para mostrar al usuario.

La URL base incluye `/api`; por tanto, los ejemplos siguientes se refieren a `http://127.0.0.1:8000/api` en desarrollo.

### Productos

`GET /api/products` devuelve una lista con campos como los siguientes:

```json
[
  {
    "id": 1,
    "name": "Producto de ejemplo",
    "price": "125.50",
    "stock": 8,
    "image": null
  }
]
```

El campo `image` puede ser `null`, una URL o una ruta servida por el backend. La interfaz resuelve las rutas y usa un fallback visual si la imagen falta o no puede cargarse. El precio que se muestra proviene de la API.

### Registrar una venta

`POST /api/sales` recibe solamente los artículos seleccionados:

```json
{
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 4, "quantity": 1 }
  ]
}
```

El frontend **no envía** `user_id`, `price`, `subtotal` ni `total`. Laravel lee los precios vigentes de la base de datos y calcula los importes definitivos. Los importes que se ven en el carrito son estimaciones de interfaz hasta que el backend confirma la venta.

Una respuesta correcta usa HTTP `201` y contiene un mensaje, el identificador de la venta y el total calculado. Al confirmarse la operación, el carrito se vacía. Si la petición falla, el carrito se conserva para que el usuario pueda revisar o volver a intentar.

### Historial y eliminación

`GET /api/sales` devuelve ventas activas con fecha, total y detalles; cada detalle contiene el producto relacionado, cantidad, precio histórico y subtotal. La interfaz presenta estos datos sin reemplazar los valores históricos por el precio actual del catálogo.

`DELETE /api/sales/{id}` solicita un borrado lógico. Una respuesta HTTP `200` confirma la operación. Una venta inexistente o ya eliminada devuelve `404`; un conflicto de inventario puede devolver `409`. La API restaura el stock dentro de su transacción y conserva los detalles de la venta.

### Errores visibles

- `422 Unprocessable Entity`: datos inválidos, producto o cantidad no aceptables, o stock insuficiente. Se muestra el mensaje disponible y se conserva el carrito.
- `404 Not Found`: recurso ausente o venta que ya no está activa. En el historial, el error de una acción se mantiene separado del estado de carga de la lista para que no desaparezca al actualizarla.
- `409 Conflict`: conflicto de negocio, por ejemplo al intentar restituir stock fuera de los límites permitidos.
- Errores de conexión o `5xx`: se informa que no se pudo completar la operación; el carrito de una venta fallida se conserva.

No se debe interpretar un error de red como una venta confirmada. Si hubo un corte durante el envío, verifica el historial antes de reenviar para evitar duplicar una operación cuyo resultado sea incierto.

## 7. Imágenes y efecto de las tarjetas

La tarjeta del catálogo intenta mostrar la imagen entregada por el campo `image` del producto. Si no hay una imagen utilizable, muestra un fallback visual; no se inventa una ruta del backend. La descarga de imágenes externas depende de que su servidor esté disponible y permita la carga desde el navegador.

En `/products` las tarjetas tienen un efecto 3D controlado por la directiva Angular `app3dTilt`: perspectiva de `750px`, rotación máxima de ±14 grados, elevación visual de la imagen y movimiento reducido o desactivado para dispositivos táctiles y cuando el sistema solicita menos movimiento. El efecto no se aplica al POS. Las interacciones siguen disponibles con teclado y el efecto vuelve suavemente a su posición al salir el puntero.

## 8. Pruebas, compilación y publicación

Ejecuta las pruebas unitarias en modo no interactivo:

```bash
npm test -- --watch=false
```

Karma utiliza Chrome Headless en la configuración validada. Si el ejecutable no está en una ubicación detectada automáticamente, define `CHROME_BIN` para la terminal antes de ejecutar la prueba.

Compila para producción:

```bash
npm run build
```

El comando produce los archivos estáticos bajo `dist/budget-buddy-app` según la configuración actual de Angular. Publica el contenido generado, configura el proxy `/api` hacia Laravel y el fallback de rutas SPA. No publiques archivos `.env`, credenciales, fuentes de configuración local ni `node_modules`.

## 9. Tamaño del bundle y mejora futura

La última compilación revisada reportó un bundle inicial de **842.15 kB** (aproximadamente **173.55 kB** de transferencia estimada). La compilación pasa, pero supera el aviso de presupuesto inicial de `500 kB` definido en `angular.json`; el límite de error actual es `1 MB`. El tamaño por archivos reportado fue:

| Archivo inicial | Tamaño aproximado |
| --- | ---: |
| `styles.css` | 348.53 kB |
| `main.js` | 316.32 kB |
| `scripts.js` | 143.36 kB |
| `polyfills.js` | 33.04 kB |
| `runtime.js` | 0.91 kB |

Fuentes de peso que conviene medir antes de cambiar: Bootstrap SCSS global, Remix Icon y Toastify CSS, los scripts globales de jQuery y Bootstrap, y la carga eager de todas las pantallas. En el código revisado no hay uso activo de jQuery ni de componentes JavaScript de Bootstrap en las pantallas principales, y no se encontró uso de Toastify; hay que confirmar esa observación con búsqueda y revisión visual antes de retirar nada.

Plan de optimización sin rediseñar la interfaz ni eliminar funciones:

1. Generar un análisis de chunks y conservar un tamaño inicial de referencia.
2. Comprobar si algún componente necesita realmente jQuery, el JavaScript de Bootstrap o Toastify; si no, retirar su inclusión y dependencia en un cambio independiente, verificando menús, diálogos y responsive.
3. Separar dashboard, catálogo e historial en módulos con lazy loading para descargar cada pantalla al navegar a ella.
4. Revisar el SCSS de Bootstrap y conservar solo estilos/utilidades que la interfaz usa; hacer comparación visual de todas las pantallas y estados.
5. Medir iconos y fuentes, y aplicar una estrategia más pequeña solo si conserva los mismos iconos y su legibilidad.
6. Volver a ejecutar pruebas, compilación, comprobaciones responsive y comparar bundle inicial y transferencia.

No se recomienda subir el límite de presupuesto para ocultar el aviso. Este README registra el análisis; no implica que se hayan aplicado optimizaciones.

## 10. Revisión de dependencias y seguridad

En la auditoría del lockfile del **5 de noviembre de 2026**, `npm audit` reportó **91 registros de advisories**: 6 críticos, 50 altos, 25 moderados y 10 bajos. Los registros corresponden a **91 paquetes afectados en las rutas reportadas** y no necesariamente a 91 vulnerabilidades independientes. De esos paquetes, 8 aparecen en dependencias de producción y 83 en dependencias de desarrollo. Entre las dependencias de producción directas señaladas están paquetes de Angular: `@angular/animations`, `@angular/common`, `@angular/compiler`, `@angular/core`, `@angular/forms`, `@angular/platform-browser`, `@angular/platform-browser-dynamic` y `@angular/router`. Entre las herramientas directas de desarrollo aparecen `@angular-devkit/build-angular`, `@angular/cli` y `@angular/compiler-cli`.

Un aviso de npm significa que una versión está dentro del rango afectado; no demuestra por sí solo que una ruta vulnerable sea alcanzable en esta aplicación. Aun así, los hallazgos críticos/altos y el fin de soporte de Angular 16 requieren un plan de actualización y validación antes de producción. `npm audit` no cambia paquetes; no se ejecutó `npm audit fix` ni se actualizaron dependencias durante esta revisión.

Para repetir la revisión desde el proyecto:

```bash
npm audit
npm audit --omit=dev
```

El segundo comando ayuda a distinguir dependencias de producción, pero no sustituye la revisión de contexto ni la decisión de actualizar. Mantén los secretos fuera del frontend y limita los orígenes CORS en el backend de producción.

## 11. Archivos locales y Git

`node_modules`, `dist`, cachés de Angular y archivos `.env` son artefactos locales y no deben añadirse al repositorio. La configuración pública de API sí forma parte del bundle; nunca guardes secretos allí. Antes de publicar cambios, revisa `git status` y el contenido preparado para confirmar que no haya archivos locales, credenciales o resultados de compilación.

La rama de trabajo revisada es `mauricio.morales`. La presencia de un archivo no rastreado en una copia local no es necesaria para ejecutar el proyecto y debe revisarse por separado; este README no lo añade ni lo modifica.
