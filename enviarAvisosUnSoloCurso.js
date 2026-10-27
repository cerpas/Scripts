function enviarAvisosUnSoloCurso() {
  // === CONFIGURACIÓN: ESCRIBE AQUÍ EL NOMBRE EXACTO DE TU CLASE ===
  var NOMBRE_CURSO_A_FILTRAR = "Programación lógica y funcional"; 
  // =============================================================

  // Palabras que si aparecen en el título, la tarea SE IGNORA por completo
  var PALABRAS_A_EXCLUIR     = ["examen", "evaluacion", "evaluación", "quiz", "prueba"]; 
  // ==========================================
  var NOMBRE_PROFESOR = "José Luis García Cerpas";

  // RANGO DE FECHAS (Formato: AÑO, MES-1, DÍA)
  // Nota: Los meses en JavaScript van de 0 (enero) a 11 (diciembre)
  var FECHA_INICIO = new Date(2026, 8, 29);   // Ejemplo: 1 de Octubre de 2026 (Mes 9 = Octubre)
  var FECHA_FIN    = new Date(2026, 9, 25);  // Ejemplo: 25 de Octubre de 2026
  // ==========================================

  // 1. Obtener todos tus cursos activos como profesor
  var respuestaCursos = Classroom.Courses.list({teacherId: 'me', courseStates: 'ACTIVE'});
  var cursos = respuestaCursos.courses;
  
  if (!cursos || cursos.length === 0) {
    Logger.log("No se encontraron cursos activos.");
    return;
  }
  
  // Buscar el curso específico por su nombre
  var cursoEncontrado = cursos.find(function(c) {
    return c.name.trim().toLowerCase() === NOMBRE_CURSO_A_FILTRAR.trim().toLowerCase();
  });

  if (!cursoEncontrado) {
    Logger.log("ERROR: No se encontró ninguna clase llamada '" + NOMBRE_CURSO_A_FILTRAR + "'. Verifica que esté bien escrita con sus mayúsculas y acentos.");
    return;
  }
  
  Logger.log("Iniciando revisión únicamente en el curso: " + cursoEncontrado.name);
  var ahora = new Date();
  
  // 2. Obtener las tareas (courseWork) del curso seleccionado
  var tareas = Classroom.Courses.CourseWork.list(cursoEncontrado.id).courseWork;
  if (!tareas || tareas.length === 0) {
    Logger.log("No hay tareas creadas en este curso.");
    return;
  }
  
  tareas.forEach(function(tarea) {

    // FILTRO DE PARCIAL: Validar si el título de la tarea contiene la palabra clave
      var tituloTarea = tarea.title.toLowerCase();
 
    // FILTRO 1: EXCLUSIÓN DE EXÁMENES
    // Revisa si el título contiene alguna de tus palabras prohibidas
    var contienePalabraExcluida = PALABRAS_A_EXCLUIR.some(function(palabra) {
      return tituloTarea.indexOf(palabra) !== -1;
    });
    
    if (contienePalabraExcluida) {
      Logger.log("OMITIDO (Es un examen/evaluación): " + tarea.title);
      return; // Salta esta actividad inmediatamente
    }
    // Ignorar si la tarea no tiene fecha ni hora de entrega configurada
    if (!tarea.dueDate || !tarea.dueTime) return;
    
    // Construir la fecha exacta de vencimiento usando los datos de Classroom
    var fechaVencimiento = new Date(
      tarea.dueDate.year,
      tarea.dueDate.month - 1, 
      tarea.dueDate.day,
      tarea.dueTime.hours || 0,
      tarea.dueTime.minutes || 0
    );
    
    // Si la fecha de vencimiento aún no ha pasado, ignoramos la tarea por completo
    if (ahora < fechaVencimiento) return;

    // FILTRO 3: RANGO DE FECHAS
    // Valida si la fecha de vencimiento de la tarea está fuera de los límites establecidos
    if (fechaVencimiento < FECHA_INICIO || fechaVencimiento > FECHA_FIN) {
      Logger.log("OMITIDO (Fuera del rango de fechas [" + fechaVencimiento.toLocaleDateString() + "]): " + tarea.title);
      return; // Salta la actividad
    }
    
    Logger.log("Procesando actividad regular pendiente en rango: " + tarea.title);
    
    // 3. Obtener el estado de entrega de todos los alumnos para esta tarea
    var entregas = Classroom.Courses.CourseWork.StudentSubmissions.list(cursoEncontrado.id, tarea.id).studentSubmissions;
    if (!entregas) return;
    
    entregas.forEach(function(entrega) {
      // Filtrar estrictamente: solo alumnos que NO han entregado (CREATED o NEW)
      if (entrega.state === "CREATED" || entrega.state === "NEW") {
        
        try {
          // 4. Obtener el perfil del alumno para tener su nombre y correo
          var perfilAlumno = Classroom.Courses.Students.get(cursoEncontrado.id, entrega.userId).profile;
          var nombreAlumno = perfilAlumno.name.givenName;
          var correoAlumno = perfilAlumno.emailAddress;
          
          // 5. Redactar y enviar el correo personalizado
          var asunto = "Tarea Vencida y Pendiente: " + tarea.title + " - " + cursoEncontrado.name;
          var mensaje = "Hola " + nombreAlumno + ",\n\n" +
                        "Te escribo porque revisando el sistema de Google Classroom detecté que la siguiente actividad se encuentra sin entregar:\n\n" +
                        "• Clase: " + cursoEncontrado.name + "\n" +
                        "• Tarea pendiente: " + tarea.title + "\n\n" +
                        "Como ya ha pasado la fecha límite, por favor ingresa a la plataforma lo antes posible, adjunta tus evidencias y asegúrate de hacer clic en el botón 'Entregar'.\n\n" +
                        "Si tienes alguna duda o contratiempo, puedes responder directamente a este correo.\n\n" +
                        "Saludos cordiales,\n" + NOMBRE_PROFESOR + "Profesor\n";
          
          MailApp.sendEmail(correoAlumno, asunto, mensaje);
          Logger.log("Recordatorio enviado a: " + correoAlumno + " por la tarea: " + tarea.title);
        } catch(e) {
          Logger.log("Error al procesar al alumno: " + e.message);
        }
      }
    });
  });
  Logger.log("Revisión del curso '" + cursoEncontrado.name + "' finalizada.");
}
