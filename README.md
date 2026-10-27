# Automatización de Recordatorios para Google Classroom

Este script de **Google Apps Script** se conecta directamente a un curso de Google Classroom para identificar de forma automática a los alumnos que tienen tareas pendientes o vencidas y enviarles un recordatorio personalizado por correo electrónico a través de Gmail.

## Características

*   **Filtro por Curso Único:** Revisa únicamente el grupo o materia que tú decidas.
*   **Rango de Fechas Inteligente:** Permite delimitar la revisión a un periodo específico (ideal para evaluar por parciales).
*   **Exclusión de Exámenes:** Ignora automáticamente exámenes, quizes o evaluaciones mediante filtros de texto en el título.
*   **Filtro de Entrega Real:** Solo envía correos a los alumnos con estatus `Sin entregar` (`CREATED` o `NEW`), evitando molestar a quienes ya enviaron su trabajo (aunque no esté calificado).

## Guía de Instalación y Configuración

Sigue estos pasos para poner a funcionar el script en tu cuenta institucional:

### 1. Crear el entorno en Google Apps Script
1. Ve a [Google Apps Script](https://google.com) e inicia sesión con tu cuenta de profesor.
2. Haz clic en **Nuevo proyecto**.
3. Borra el código por defecto y pega el contenido del archivo `codigo.js` de este repositorio.

### 2. Activar la API de Google Classroom
1. En la barra lateral izquierda del editor de Apps Script, haz clic en el ícono **+** junto a **Servicios**.
2. Busca **Google Classroom API** en la lista.
3. Selecciónala y haz clic en **Añadir**.

### 3. Personalizar tus filtros (Variables)
Modifica las variables de configuración al inicio del script según tus necesidades:

```javascript
// Nombre exacto de tu clase en Classroom
var NOMBRE_CURSO_A_FILTRAR = "Matemáticas 3º A"; 

// Palabra clave para delimitar el parcial (ej. "Segundo Parcial")
var PALABRA_CLAVE_PARCIAL   = "Segundo Parcial"; 

// Palabras clave para ignorar exámenes o evaluaciones
var PALABRAS_A_EXCLUIR     = ["examen", "evaluacion", "evaluación", "quiz", "prueba"]; 

// Rango de fechas (Recuerda: JavaScript cuenta los meses de 0 a 11. Octubre = 9)
var FECHA_INICIO = new Date(2026, 9, 1);   // 1 de Octubre
var FECHA_FIN    = new Date(2026, 9, 26);  // 26 de Octubre
```

### 4. Ejecución
1. En la barra de herramientas superior, asegúrate de seleccionar la función `enviarAvisosUnSoloCurso` o `enviarAvisosClasroomAutomatico` para enviar a todos los cursos activos en classroom o solo al curso que indique en el script `enviarAvisosUnSoloCurso`.
2. Presiona el botón **Ejecutar**.
3. **Autorización:** Al procesarse por primera vez, Google desplegará una ventana de seguridad solicitando permisos para que el script pueda enviar correos electrónicos en tu nombre a través de Gmail. Otorga los accesos institucionales requeridos para finalizar.

## Nota Técnica: Conteo de Meses
Recuerda que dentro del objeto `new Date()` de JavaScript, la indexación de los meses inicia en cero:
*   `0` = Enero, `1` = Febrero ... `8` = Septiembre, `9` = Octubre, `10` = Noviembre, `11` = Diciembr

## Licencia
Este proyecto es de uso libre y educativo para profesores que buscan optimizar sus tiempos de gestión escolar.
