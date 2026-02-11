# 🆘 Sistema de Coordinación de Ayuda Humanitaria - Córdoba

> **Demo en vivo**: [https://socorro.lostnewbs.org/](https://socorro.lostnewbs.org/)

Sistema web para coordinar ayuda humanitaria en situaciones de emergencia en Córdoba, Colombia. Permite conectar personas que necesitan ayuda con quienes pueden ofrecerla, gestionar albergues y controlar inventarios en tiempo real.

---

## 🌟 Características Principales

### 📍 Mapa Interactivo
- Visualización en tiempo real de solicitudes, ofertas y albergues
- Clusters inteligentes para agrupar marcadores cercanos
- Filtros por tipo de necesidad/oferta
- Geolocalización automática del usuario

### 🆘 Gestión de Solicitudes y Ofertas
- Registro de solicitudes de ayuda (agua, comida, medicinas, ropa, refugio)
- Registro de ofertas de ayuda
- Sistema de aprobación manual por administradores
- Información de contacto y ubicación precisa

### 🏠 Gestión de Albergues
- Registro de albergues con capacidad y ocupación
- **Selección de ubicación por mapa interactivo** 🗺️
- **Coordenadas GPS precisas** 📍
- Descripción de recursos disponibles
- Estado de aprobación

### 📦 Control de Inventario
- Registro de inventario por albergue
- Categorías: Agua, Comida, Medicinas, Ropa
- Historial de registros con fecha y hora

### 👨‍💼 Panel de Administración
- Acceso protegido por contraseña (SHA-256)
- Aprobación/rechazo de solicitudes, ofertas y albergues
- Gestión de inventario
- Dashboard con estadísticas en tiempo real

---

## ✨ Mejoras Implementadas

### 🗺️ Sistema de Geolocalización Avanzado
- **Selección de ubicación por clic en mapa**: Los usuarios pueden hacer clic directamente en el mapa para seleccionar la ubicación exacta
- **Coordenadas GPS precisas**: Captura automática de latitud y longitud
- **Geocodificación inversa**: Conversión automática de coordenadas a dirección legible
- **Botón "Usar mi ubicación"**: Obtiene la ubicación actual del usuario con un solo clic
- **Validación de ubicación**: Asegura que se proporcione una ubicación válida antes de enviar

### 🎨 Interfaz de Usuario Mejorada
- **Modal flotante para registro de albergues**: Diseño limpio y profesional
- **Formularios responsivos**: Adaptados para móviles y tablets
- **Feedback visual**: Mensajes toast para confirmaciones y errores
- **Animaciones suaves**: Transiciones y efectos visuales modernos

### 🔒 Sistema de Verificación
- **Aprobación manual**: Todos los registros requieren aprobación del administrador
- **Estados de aprobación**: Pendiente, Activo, Rechazado
- **Filtrado automático**: Solo se muestran elementos aprobados al público

### 📱 Funcionalidad Offline
- **Service Worker**: Caché de recursos estáticos
- **Almacenamiento local**: Datos guardados para acceso sin conexión
- **Sincronización automática**: Actualización cuando se recupera la conexión

---

## 🚀 Tecnologías Utilizadas

### Frontend
- **HTML5, CSS3, JavaScript (Vanilla)**: Sin frameworks pesados para máxima velocidad
- **Leaflet.js**: Biblioteca de mapas interactivos de código abierto
- **Leaflet.markercluster**: Agrupación inteligente de marcadores
- **OpenStreetMap**: Mapas gratuitos y de código abierto

### Backend
- **Google Apps Script**: Lógica del servidor sin costos de hosting
- **Google Sheets**: Base de datos en tiempo real, fácil de administrar
- **API RESTful**: Endpoints para todas las operaciones CRUD

### Seguridad
- **SHA-256**: Hash de contraseñas para el panel de administración
- **CORS configurado**: Acceso controlado desde dominios autorizados
- **Validación de datos**: Tanto en frontend como backend

---

## 📦 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/estebanbobb/ayuda-cordoba.git
cd ayuda-cordoba
```

### 2. Configurar Google Apps Script

1. Crea una nueva hoja de cálculo en Google Sheets
2. Ve a **Extensiones** → **Apps Script**
3. Copia el contenido de `backend/Code.gs` al editor
4. Despliega como **Web App**:
   - Click en **Implementar** → **Nueva implementación**
   - Tipo: **Aplicación web**
   - Ejecutar como: **Yo**
   - Acceso: **Cualquier persona**
5. Copia la URL de implementación

### 3. Configurar el Frontend

Edita `js/config.js` y actualiza la URL de tu Google Apps Script:

```javascript
const CONFIG = {
  API_URL: 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI'
};
```

### 4. Ejecutar Localmente

Simplemente abre `index.html` en tu navegador, o usa un servidor local:

```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (http-server)
npx http-server
```

**⚠️ Nota**: Para evitar problemas de CORS, se recomienda abrir `index.html` directamente desde el explorador de archivos o desplegarlo en un servidor web.

---

## 🌐 Despliegue en GitHub Pages

1. Sube el código a GitHub
2. Ve a **Settings** → **Pages**
3. En **Source**, selecciona **main** branch
4. Click en **Save**
5. Tu app estará disponible en: `https://tu-usuario.github.io/ayuda-cordoba/`

---

## 📖 Uso

### Para Usuarios

1. **Ver el mapa**: Visualiza solicitudes, ofertas y albergues en tiempo real
2. **Solicitar ayuda**: Click en "🆘 Necesito" → Completa el formulario
3. **Ofrecer ayuda**: Click en "💚 Tengo" → Completa el formulario
4. **Registrar albergue**: Click en "🏠 Albergues" → "Registrar Nuevo Albergue"
   - Usa el mapa para seleccionar la ubicación exacta
   - O usa el botón "Usar mi ubicación" para GPS automático

### Para Administradores

1. **Acceder al panel**: Click en "👨‍💼 Admin"
2. **Iniciar sesión**: Ingresa la contraseña configurada
3. **Aprobar/Rechazar**: Revisa solicitudes, ofertas y albergues pendientes
4. **Gestionar inventario**: Registra recursos disponibles por albergue

---

## 🤝 Contribuir

¿Quieres mejorar este proyecto? ¡Las contribuciones son bienvenidas!

### Cómo Contribuir

1. **Fork** este repositorio
2. Crea una **rama** para tu mejora: `git checkout -b feature/nueva-funcionalidad`
3. **Commit** tus cambios: `git commit -m 'Agrega nueva funcionalidad'`
4. **Push** a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un **Pull Request**

### Ideas para Mejoras

- [ ] Sistema de notificaciones en tiempo real
- [ ] Chat entre solicitantes y ofertantes
- [ ] Integración con WhatsApp para alertas
- [ ] Reportes y estadísticas avanzadas
- [ ] Sistema de transporte para coordinar traslados
- [ ] Modo oscuro
- [ ] Soporte multiidioma

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👥 Autor

**Esteban Bobb**
- GitHub: [@estebanbobb](https://github.com/estebanbobb)
- Demo: [https://socorro.lostnewbs.org/](https://socorro.lostnewbs.org/)

---

## 🙏 Agradecimientos

- A la comunidad de Córdoba por inspirar este proyecto
- A los colaboradores y testers que ayudaron a mejorar el sistema
- A OpenStreetMap y Leaflet.js por sus herramientas de código abierto

---

## 📞 Soporte

¿Tienes preguntas o problemas? Abre un [Issue](https://github.com/estebanbobb/ayuda-cordoba/issues) en GitHub.

---

**⚠️ Nota Importante**: Este sistema está diseñado para situaciones de emergencia. Asegúrate de tener un plan de respaldo y personal capacitado para gestionar las solicitudes de ayuda.
