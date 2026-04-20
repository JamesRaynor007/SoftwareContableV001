# 📊 SoftwareContableV001
Una pequeña creación para gestionar transacciones y registrar eventos con posibilidades de visualización.

Pruébalo aquí (https://jamesraynor007.github.io/SoftwareContableV001/)
---

## 🚀 Guía de Uso

### 1️⃣ Carga de Transacciones
- **Descargar template (XLSX):** permite cargar transacciones con 5 columnas (versión base).  
- **Elegir archivo (XLSX):** seleccionar archivo (template descargado).  
- **Importar:** se visualizarán las transacciones.  

🔧 Funcionalidades:
- Eliminar / Agregar / Filtrar transacciones  
- Exportar consolidado (XLSX)

---

### 2️⃣ Actualización Incremental
- **Archivo Incremental:** cargar template exportado.  
- **Actualizar Consolidado:** generar registro de transacciones y log de acciones.  
- **Descargar Consolidado:** descarga JSON con transacciones cargadas.  
- **Descargar Log:** descarga acciones realizadas en el JSON de transacciones cargadas (evita duplicación).  

📌 Nota:  
Si ya descargaste un consolidado, inicia cargándolo en **Archivo Base (JSON)** para evitar duplicados.

---

### 3️⃣ Visualización
- **Cargar Transacciones:** JSON de transacciones.  
- **Cargar Acciones:** JSON de log.  

🔍 Opciones de visualización:
- Filtrado por: rango de fechas, montos, ID, cuenta, descripción.  
- Ordenamiento: por monto (mayor a menor) o por antigüedad.  

---
